"""Initialize versioned schemas; import or verify Phase 1 SQLite storage.

Schema initialization applies all versions; SQLite import/verification only
touches Phase 1 tables. This tool never connects to WCA MySQL.

Connection credentials are read only from DATABASE_URL_DIRECT or DATABASE_URL.
"""
import argparse
from contextlib import ExitStack, closing
import hashlib
import os
import re
from pathlib import Path
import sqlite3
import sys
from urllib.parse import unquote, urlsplit, parse_qsl

import psycopg
from psycopg import sql

ROOT = Path(__file__).resolve().parents[1]
TABLES = (
    ('settings_presets', ('id', 'user_id', 'name', 'settings'), ('id',), 'presets'),
    ('bulk_batches', ('id', 'metadata'), ('id',), 'bulk'),
    ('bulk_scrambles', ('batch_id', 'line_number', 'alg_count', 'result'),
     ('batch_id', 'line_number'), 'bulk'),
)


class MigrationError(Exception):
    pass


def initialize(connection):
    connection.execute('SELECT pg_advisory_xact_lock(704291001)')
    connection.execute('''CREATE TABLE IF NOT EXISTS app_schema_migrations (
        version TEXT PRIMARY KEY, checksum TEXT NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP)''')
    for path in sorted((ROOT / 'migrations').glob('*.sql')):
        contents = path.read_text()
        checksum = hashlib.sha256(contents.encode()).hexdigest()
        existing = connection.execute(
            'SELECT checksum FROM app_schema_migrations WHERE version = %s',
            (path.name,)).fetchone()
        if existing:
            if existing[0] != checksum:
                raise MigrationError('An applied migration has changed; restore its original contents.')
            print(path.name + ': already applied')
            continue
        connection.execute(contents, prepare=False)
        connection.execute('INSERT INTO app_schema_migrations (version, checksum) VALUES (%s, %s)',
                           (path.name, checksum))
        print(path.name + ': applied')


def transfer(connection, presets_path, bulk_path, *, verify=False):
    """Import atomically, refusing conflicting IDs; verify every stored value."""
    with ExitStack() as stack:
        sources = {}
        for name, path in (('presets', presets_path), ('bulk', bulk_path)):
            path = Path(path).resolve()
            if not path.is_file():
                raise MigrationError('A source SQLite file does not exist; check --presets and --bulk.')
            source = stack.enter_context(closing(sqlite3.connect(path.as_uri() + '?mode=ro', uri=True)))
            source.execute('BEGIN')
            sources[name] = source
        # Prevent concurrent app writes from racing ID verification/sequence reset.
        if not verify:
            connection.execute('LOCK TABLE settings_presets, bulk_batches, bulk_scrambles IN SHARE ROW EXCLUSIVE MODE')
        for table, columns, keys, source_name in TABLES:
            column_sql = sql.SQL(', ').join(map(sql.Identifier, columns))
            key_sql = sql.SQL(', ').join(map(sql.Identifier, keys))
            insert = sql.SQL('INSERT INTO {} ({}) VALUES ({}) ON CONFLICT ({}) DO NOTHING').format(
                sql.Identifier(table), column_sql,
                sql.SQL(', ').join(sql.Placeholder() for _ in columns), key_sql)
            # SQLite identifiers below are exclusively the fixed TABLES constants.
            rows = sources[source_name].execute('SELECT ' + ', '.join(columns) + ' FROM ' + table)
            count = 0
            while True:
                batch = rows.fetchmany(1000)
                if not batch:
                    break
                if not verify:
                    with connection.cursor() as cursor:
                        cursor.executemany(insert, batch)
                # Batch lookups avoid one network round trip per source row.
                key_values = [tuple(row[columns.index(key)] for key in keys) for row in batch]
                placeholders = sql.SQL(', ').join(
                    sql.SQL('({})').format(sql.SQL(', ').join(sql.Placeholder() for _ in keys))
                    for _ in batch)
                lookup = sql.SQL('SELECT {} FROM {} WHERE ({}) IN ({})').format(
                    column_sql, sql.Identifier(table), key_sql, placeholders)
                found = connection.execute(lookup, [v for key in key_values for v in key]).fetchall()
                indexed = {tuple(row[columns.index(key)] for key in keys): row for row in found}
                if any(indexed.get(key) != row for key, row in zip(key_values, batch)):
                    raise MigrationError('Data mismatch in ' + table + '; import will not overwrite existing rows.')
                count += len(batch)
            destination_count = connection.execute(
                sql.SQL('SELECT count(*) FROM {}').format(sql.Identifier(table))).fetchone()[0]
            if verify and destination_count != count:
                raise MigrationError('Row count mismatch in ' + table + '; verify against a quiet destination.')
            print(f'{table}: {count} source rows matched; {destination_count} destination rows')
        if not verify:
            connection.execute('''SELECT setval(pg_get_serial_sequence('settings_presets', 'id'),
                GREATEST(COALESCE((SELECT max(id) FROM settings_presets), 1), 1),
                EXISTS(SELECT 1 FROM settings_presets))''')


def redact_diagnostic(message, connection_string):
    """Redact before output, including malformed URLs and libpq keyword DSNs.

    Be deliberately conservative: quoted values and connection parameter values
    are suppressed, not just passwords. Never output a parser exception, SQL
    context, or the connection object's representation.
    """
    sensitive = {connection_string}
    for name, value in os.environ.items():
        if (re.search(r'PASSWORD|PASSWD|SECRET|TOKEN|CREDENTIAL|DATABASE_URL|API_KEY', name, re.I)
                or name.startswith('PG')):
            sensitive.add(value)
    try:
        sensitive.update(psycopg.conninfo.conninfo_to_dict(connection_string).values())
    except Exception:
        # Invalid DSNs can themselves be the cause; parser errors can echo them.
        pass
    try:
        parsed = urlsplit(connection_string)
        sensitive.update(value for value in (parsed.username, parsed.password,
                                             parsed.hostname, parsed.path.lstrip('/')) if value)
        sensitive.update(value for _, value in parse_qsl(parsed.query))
    except ValueError:
        pass
    # Normalize percent escapes so encoded and decoded credentials both match.
    text = str(message)
    for _ in range(2):
        text = unquote(text)
        sensitive = {unquote(value) for value in sensitive if value}
    # Replace whole known values before pattern redaction can split a password
    # containing spaces, quotes, or backslashes into otherwise unknown fragments.
    for value in sorted(sensitive, key=len, reverse=True):
        text = text.replace(value, '[redacted]')
        text = text.replace(value.replace("'", "\\'"), '[redacted]')
    text = re.sub(r"[a-zA-Z][a-zA-Z0-9+.-]*://[^\s<>]+", '[redacted connection URL]', text)
    # Suppress the remainder of assignment lines, including malformed/unclosed
    # quoted values. These can be libpq DSNs or echoed environment assignments.
    text = re.sub(r"\b[A-Za-z_][A-Za-z_0-9]*\s*=[^\n]*", '[redacted parameters]', text)
    # Quoted server values may contain usernames or credentials sourced from a
    # password/service file, which are not necessarily available in the URL.
    text = re.sub(r"'(?:\\.|[^'\\])*'|\"(?:\\.|[^\"\\])*\"", '[redacted value]', text)
    # Remove terminal control characters, retaining newline/tab for readability.
    return ''.join(char for char in text if char in '\n\t' or (ord(char) >= 32 and ord(char) != 127))


def report_operational_error(error, connection_string, *, connected):
    if connected:
        print('Database operation failed (OperationalError). The transaction did not complete.', file=sys.stderr)
    else:
        print('Database connection failed (OperationalError). No migration was started.', file=sys.stderr)
    print(redact_diagnostic(str(error), connection_string), file=sys.stderr)
    diagnostic = error.diag
    for label, value in (
        ('SQLSTATE', error.sqlstate),
        ('Severity', diagnostic.severity_nonlocalized),
        ('Primary message', diagnostic.message_primary),
        ('Detail', diagnostic.message_detail),
        ('Hint', diagnostic.message_hint),
    ):
        if value:
            print(label + ': ' + redact_diagnostic(value, connection_string), file=sys.stderr)
    print('Connection URLs, parameter values, and quoted values are redacted.', file=sys.stderr)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=('init', 'import-sqlite', 'verify-sqlite'))
    parser.add_argument('--presets', default=str(ROOT / 'instance/presets.sqlite3'))
    parser.add_argument('--bulk', default=str(ROOT / 'instance/bulk.sqlite3'))
    args = parser.parse_args()
    url = os.environ.get('DATABASE_URL_DIRECT') or os.environ.get('DATABASE_URL')
    if not url:
        parser.error('Set DATABASE_URL_DIRECT or DATABASE_URL in your environment.')
    connected = False
    try:
        with psycopg.connect(url, connect_timeout=10) as connection:
            connected = True
            if args.command == 'init':
                initialize(connection)
            else:
                if args.command == 'verify-sqlite':
                    connection.execute('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ, READ ONLY')
                transfer(connection, args.presets, args.bulk, verify=args.command == 'verify-sqlite')
        print('Completed successfully.')
    except MigrationError as error:
        print(str(error), file=sys.stderr)
        return 1
    except psycopg.OperationalError as error:
        report_operational_error(error, url, connected=connected)
        return 1
    except (psycopg.Error, sqlite3.Error, OSError) as error:
        # Driver errors may include connection details or data; omit those.
        print(f'Operation failed ({type(error).__name__}); transaction rolled back. Check connectivity, schema, and source files.', file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
