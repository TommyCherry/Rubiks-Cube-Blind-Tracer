"""Stream the reduced WCA history dataset from local MySQL to PostgreSQL.

Commands: inspect (read-only source sizing), import-mysql (atomic replacement of
Phase 2 tables only), verify (counts, fingerprints, and representative queries).
Credentials come exclusively from environment variables; see docs/postgres-phase2.md.
"""
import argparse
from contextlib import closing
from dataclasses import dataclass
import hashlib
import json
import os
from pathlib import Path
import sys
import time

import mysql.connector
import psycopg
from psycopg import sql

# Support both `python scripts/wca_history.py` and importing in tests.
if __package__:
    from .persistent_data import report_operational_error, redact_diagnostic
else:
    from persistent_data import report_operational_error, redact_diagnostic
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from history_queries import THREE_BLIND_SQL, multiblind_sql


@dataclass(frozen=True)
class Projection:
    name: str
    columns: tuple
    source_sql: str
    parameters: tuple = ()


PROJECTIONS = (
    Projection('competitions', ('id', 'name', 'year', 'month', 'day'),
               'SELECT id, name, year, month, day FROM competitions'),
    Projection('results', ('id', 'competition_id', 'event_id', 'round_type_id', 'person_id'),
               'SELECT id, competition_id, event_id, round_type_id, person_id FROM results WHERE event_id = %s', ('333bf',)),
    Projection('result_attempts', ('value', 'attempt_number', 'result_id'),
               '''SELECT ra.value, ra.attempt_number, ra.result_id FROM result_attempts ra
                  JOIN results r ON r.id = ra.result_id WHERE r.event_id = %s''', ('333bf',)),
    Projection('scrambles', ('id', 'competition_id', 'event_id', 'round_type_id',
                            'group_id', 'is_extra', 'scramble_num', 'scramble'),
               '''SELECT id, competition_id, event_id, round_type_id, group_id,
                         is_extra, scramble_num, scramble FROM scrambles
                  WHERE event_id IN (%s, %s)''', ('333bf', '333mbf')),
    Projection('wca_attendance', ('person_id', 'competition_id'),
               '''SELECT DISTINCT r.person_id, r.competition_id FROM results r
                  WHERE EXISTS (SELECT 1 FROM scrambles s
                                WHERE s.competition_id = r.competition_id AND s.event_id = %s)''', ('333mbf',)),
)


class HistoryMigrationError(Exception):
    pass


class Fingerprint:
    """Order-independent SHA-256 row digest plus count, retaining duplicates.

    Add digests modulo 2**256 instead of XOR (which cancels duplicate pairs).
    JSON preserves Unicode, whitespace/newlines, signed integers, and NULLs.
    """
    def __init__(self):
        self.count = 0
        self.total = 0
        self.bytes = 0

    def add(self, row):
        encoded = json.dumps(tuple(row), ensure_ascii=False, separators=(',', ':')).encode('utf-8')
        self.count += 1
        self.bytes += len(encoded)
        self.total = (self.total + int.from_bytes(hashlib.sha256(encoded).digest(), 'big')) % (1 << 256)

    def matches(self, other):
        return (self.count, self.total) == (other.count, other.total)

    def summary(self):
        return f'{self.count:,} rows; SHA256-sum {self.total:064x}'


def mysql_connection():
    return mysql.connector.connect(
        host=os.environ.get('WCA_MYSQL_HOST', 'localhost'),
        port=int(os.environ.get('WCA_MYSQL_PORT', '3306')),
        user=os.environ.get('WCA_MYSQL_USER', 'root'),
        password=os.environ.get('WCA_MYSQL_PASSWORD', ''),
        database=os.environ.get('WCA_MYSQL_DATABASE', 'wca_results'),
        charset='utf8mb4', connection_timeout=10,
    )


def source_rows(source, projection, batch_size):
    # An unbuffered cursor plus bounded fetchmany prevents loading the dataset.
    with closing(source.cursor(buffered=False)) as cursor:
        cursor.execute(projection.source_sql, projection.parameters)
        while True:
            batch = cursor.fetchmany(batch_size)
            if not batch:
                break
            yield from batch


def postgres_fingerprint(destination, query, parameters=(), batch_size=2000):
    fingerprint = Fingerprint()
    # Server-side cursor: ordinary fetchall/client cursors buffer whole results.
    with destination.cursor(name='history_verification') as cursor:
        cursor.execute(query, parameters)
        while True:
            batch = cursor.fetchmany(batch_size)
            if not batch:
                break
            for row in batch:
                fingerprint.add(row)
    return fingerprint


def table_query(projection, table=None):
    return sql.SQL('SELECT {} FROM {}').format(
        sql.SQL(', ').join(map(sql.Identifier, projection.columns)),
        sql.Identifier(table or projection.name))


def import_history(source, destination, batch_size=2000):
    """Caller supplies one transaction; interruption leaves the old snapshot.

    Safe reruns replace the entire reduced snapshot, including changed/deleted
    rows and duplicate attempts. No append, no OFFSET checkpoint assumptions.
    """
    destination.execute('SELECT pg_advisory_xact_lock(704291002)')
    for projection in PROJECTIONS:
        stage = 'wca_stage_' + projection.name
        destination.execute(sql.SQL('CREATE TEMP TABLE {} (LIKE {}) ON COMMIT DROP').format(
            sql.Identifier(stage), sql.Identifier(projection.name)))
        expected = Fingerprint()
        started = time.monotonic()
        print(f'{projection.name}: streaming source...', flush=True)
        with destination.cursor() as cursor:
            with cursor.copy(sql.SQL('COPY {} ({}) FROM STDIN').format(
                    sql.Identifier(stage), sql.SQL(', ').join(map(sql.Identifier, projection.columns)))) as copy:
                for row in source_rows(source, projection, batch_size):
                    expected.add(row)
                    copy.write_row(row)
                    if expected.count % 100000 == 0:
                        print(f'{projection.name}: {expected.count:,} rows staged', flush=True)
        actual = postgres_fingerprint(destination, table_query(projection, stage), batch_size=batch_size)
        if not expected.matches(actual):
            raise HistoryMigrationError('Staging verification failed for ' + projection.name)
        print(f'{projection.name}: verified {expected.summary()}; source payload {expected.bytes / 1048576:.1f} MiB; {time.monotonic()-started:.1f}s', flush=True)
    # Publish only after all stages pass. DELETE is MVCC-safe for readers of the
    # previous snapshot; unlike TRUNCATE it does not make old snapshots empty.
    names = sql.SQL(', ').join(sql.Identifier(p.name) for p in PROJECTIONS)
    destination.execute(sql.SQL('LOCK TABLE {} IN SHARE ROW EXCLUSIVE MODE').format(names))
    for projection in PROJECTIONS:
        destination.execute(sql.SQL('DELETE FROM {}').format(sql.Identifier(projection.name)))
        destination.execute(sql.SQL('INSERT INTO {} ({}) {}').format(
            sql.Identifier(projection.name), sql.SQL(', ').join(map(sql.Identifier, projection.columns)),
            table_query(projection, 'wca_stage_' + projection.name)))
        destination.execute(sql.SQL('ANALYZE {}').format(sql.Identifier(projection.name)))


def inspect_source(source):
    for projection in PROJECTIONS:
        with closing(source.cursor()) as cursor:
            cursor.execute('SELECT COUNT(*) FROM (' + projection.source_sql + ') AS projected', projection.parameters)
            print(f'{projection.name}: {cursor.fetchone()[0]:,} projected rows', flush=True)


def verify_history(source, destination, batch_size=2000, wca_ids=()):
    for projection in PROJECTIONS:
        expected = Fingerprint()
        for row in source_rows(source, projection, batch_size):
            expected.add(row)
        actual = postgres_fingerprint(destination, table_query(projection), batch_size=batch_size)
        if not expected.matches(actual):
            raise HistoryMigrationError(f'{projection.name}: mismatch (source {expected.count:,}, destination {actual.count:,} rows). Check that the source export has not changed.')
        print(f'{projection.name}: MATCH {actual.summary()}', flush=True)
    # Automatically include a 3BLD competitor and someone who attended a
    # multi-blind competition but has no multi-blind result at that competition.
    samples = set(wca_ids)
    with closing(source.cursor()) as cursor:
        cursor.execute("SELECT person_id FROM results WHERE event_id = '333bf' AND person_id <> '' LIMIT 1")
        row = cursor.fetchone()
        if row:
            samples.add(row[0])
        cursor.execute("""SELECT r.person_id FROM results r WHERE r.person_id <> ''
            AND EXISTS (SELECT 1 FROM scrambles s WHERE s.competition_id=r.competition_id AND s.event_id='333mbf')
            AND NOT EXISTS (SELECT 1 FROM results mb WHERE mb.person_id=r.person_id
                            AND mb.competition_id=r.competition_id AND mb.event_id='333mbf') LIMIT 1""")
        row = cursor.fetchone()
        if row:
            samples.add(row[0])
    for wca_id in sorted(samples):
        for event, mysql_query, postgres_query, parameters in (
            ('333bf', THREE_BLIND_SQL, THREE_BLIND_SQL, (wca_id,)),
            ('333mbf', multiblind_sql(), multiblind_sql(True), ('333mbf', wca_id)),
        ):
            expected = Fingerprint()
            projection = Projection('sample', (), mysql_query, parameters)
            for row in source_rows(source, projection, batch_size):
                expected.add(row)
            actual = postgres_fingerprint(destination, postgres_query, parameters, batch_size)
            if not expected.matches(actual):
                raise HistoryMigrationError('Representative history query differs for ' + event)
            print(f'Representative {event} query: MATCH ({actual.count:,} rows)', flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=('inspect', 'import-mysql', 'verify'))
    parser.add_argument('--batch-size', type=int, default=2000)
    parser.add_argument('--wca-id', action='append', default=[], help='Additional WCA ID to compare on verify; repeatable')
    args = parser.parse_args()
    if not 1 <= args.batch_size <= 10000:
        parser.error('--batch-size must be between 1 and 10000')
    url = os.environ.get('DATABASE_URL_DIRECT')
    if args.command != 'inspect' and not url:
        parser.error('Set DATABASE_URL_DIRECT for history import/verification.')
    connected = False
    try:
        with closing(mysql_connection()) as source:
            source.start_transaction(consistent_snapshot=True, isolation_level='REPEATABLE READ', readonly=True)
            if args.command == 'inspect':
                inspect_source(source)
            else:
                with psycopg.connect(url, connect_timeout=10) as destination:
                    connected = True
                    if args.command == 'import-mysql':
                        import_history(source, destination, args.batch_size)
                    else:
                        destination.execute('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ, READ ONLY')
                        verify_history(source, destination, args.batch_size, args.wca_id)
            source.rollback()
        print('Completed successfully.', flush=True)
    except HistoryMigrationError as error:
        print(str(error), file=sys.stderr)
        print('No partial import was committed.', file=sys.stderr)
        return 1
    except psycopg.OperationalError as error:
        report_operational_error(error, url or '', connected=connected)
        return 1
    except mysql.connector.Error as error:
        # Use the same conservative redaction as Phase 1 (also covers MYSQL_PASSWORD).
        print('MySQL source error: ' + redact_diagnostic(str(error), ''), file=sys.stderr)
        return 1
    except (psycopg.Error, OSError, ValueError) as error:
        print(f'History operation failed ({type(error).__name__}); no partial import was committed.', file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
