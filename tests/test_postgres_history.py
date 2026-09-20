"""Phase 2 integration tests use an isolated schema in TEST_DATABASE_URL."""
import contextlib
import io
import os
import sqlite3
import unittest
from unittest.mock import patch

import psycopg

from app import app, get_3bld_history, get_multiblind_history, get_db_connection
from persistence import PostgresConnection
from scripts.wca_history import import_history, verify_history, HistoryMigrationError
from test_postgres_persistence import PostgresFixture


class SQLiteCursor:
    """Small MySQL cursor test double over actual SQL, not canned result rows."""
    def __init__(self, connection, dictionary=False):
        self.cursor = connection.cursor()
        self.cursor.row_factory = sqlite3.Row if dictionary else None

    def execute(self, query, parameters=()):
        self.cursor.execute(query.replace('%s', '?'), parameters)
        return self

    def fetchone(self):
        return self.cursor.fetchone()

    def fetchmany(self, size):
        return self.cursor.fetchmany(size)

    def fetchall(self):
        return self.cursor.fetchall()

    def close(self):
        self.cursor.close()


class SQLiteSource:
    def __init__(self, connection):
        self.connection = connection

    def cursor(self, buffered=False, dictionary=False):
        return SQLiteCursor(self.connection, dictionary)

    def close(self):
        pass  # History helpers may close the adapter; fixture owns the database.


@unittest.skipUnless(os.environ.get('TEST_DATABASE_URL'), 'Set TEST_DATABASE_URL for PostgreSQL integration tests')
class PostgresHistoryTests(PostgresFixture, unittest.TestCase):
    def setUp(self):
        super().setUp()
        self.source = sqlite3.connect(':memory:')
        self.addCleanup(self.source.close)
        self.source.executescript('''
            CREATE TABLE competitions (id TEXT, name TEXT, year INTEGER, month INTEGER, day INTEGER);
            CREATE TABLE results (id INTEGER, competition_id TEXT, event_id TEXT, round_type_id TEXT, person_id TEXT);
            CREATE TABLE result_attempts (value INTEGER, attempt_number INTEGER, result_id INTEGER);
            CREATE TABLE scrambles (id INTEGER, competition_id TEXT, event_id TEXT, round_type_id TEXT,
                                    group_id TEXT, is_extra INTEGER, scramble_num INTEGER, scramble TEXT);
            INSERT INTO competitions VALUES ('Open2026','Montréal 日本',2026,3,4), ('Old2025','Old',2025,1,2);
            INSERT INTO results VALUES (100,'Open2026','333bf','f','2020TEST01'),
                (101,'Open2026','333','f','2020ONLY01'),
                (102,'Open2026','333mbf','f','2020MULT01'),
                (103,'Old2025','333','f','2020NONE01');
            INSERT INTO result_attempts VALUES (-1,1,100),(-2,2,100),(0,3,100),
                (1500,4,100),(1500,4,100),(123,1,101),(456,1,102);
            INSERT INTO scrambles VALUES (10,'Open2026','333bf','f','A',0,1,'R U'),
                (11,'Open2026','333bf','f','B',0,1,'F D'),
                (12,'Open2026','333bf','f','A',1,1,'extra'),
                (13,'Open2026','333','f','A',0,1,'not imported'),
                (14,'Open2026','333mbf','f','A',0,1,'placeholder'),
                (15,'Open2026','333mbf','f','B',1,20,'extra cube');
        ''')
        self.multitext = "R U\r\n\r\nF2 D\n"
        self.source.execute('UPDATE scrambles SET scramble=? WHERE id=14', (self.multitext,))
        self.source.commit()
        self.adapter = SQLiteSource(self.source)

    def import_data(self):
        with psycopg.connect(self.url) as connection, contextlib.redirect_stdout(io.StringIO()):
            import_history(self.adapter, connection, batch_size=2)

    def test_reduction_query_parity_and_saved_data(self):
        with psycopg.connect(self.url) as connection:
            connection.execute("INSERT INTO settings_presets (user_id,name,settings) VALUES ('1','Keep','{}')")
            connection.execute("INSERT INTO bulk_batches VALUES ('keep-url','{}')")
            connection.execute("INSERT INTO bulk_scrambles VALUES ('keep-url',1,2,'{}')")
        self.import_data()
        with psycopg.connect(self.url) as connection:
            self.assertEqual(connection.execute('SELECT id FROM results').fetchall(), [(100,)])
            self.assertEqual(connection.execute('SELECT count(*) FROM result_attempts').fetchone()[0], 5)
            self.assertEqual(connection.execute('SELECT count(*) FROM wca_attendance').fetchone()[0], 3)
            self.assertEqual(connection.execute('SELECT count(*) FROM scrambles').fetchone()[0], 5)
            self.assertEqual(connection.execute('SELECT scramble FROM scrambles WHERE id=14').fetchone()[0], self.multitext)
            for table in ('settings_presets', 'bulk_batches', 'bulk_scrambles'):
                self.assertEqual(connection.execute('SELECT count(*) FROM '+table).fetchone()[0], 1)
            with contextlib.redirect_stdout(io.StringIO()):
                verify_history(self.adapter, connection, batch_size=2, wca_ids=['2020TEST01', '2020ONLY01'])
        for person in ('2020TEST01', '2020ONLY01', '2020MULT01', '2020NONE01'):
            for loader in (get_3bld_history, get_multiblind_history):
                with patch('app.get_db_connection', return_value=self.adapter):
                    before = loader(person)
                after = loader(person)
                self.assertEqual(after, before, (person, loader.__name__))
        self.assertEqual(len(get_multiblind_history('2020ONLY01')), 2)
        self.assertEqual(get_3bld_history('2020ONLY01'), [])
        client = app.test_client()
        response = client.get('/my-official-solve-history?wca_id=2020TEST01')
        self.assertEqual(response.status_code, 200)
        for marker in ('DNF', 'DNS', 'Scramble unavailable', '15.00', 'Montréal'):
            self.assertIn(marker, response.text)
        self.assertIn('Extra set 20', client.get('/my-official-solve-history?wca_id=2020ONLY01&event=333mbf').text)

    def test_rerun_replaces_changed_and_deleted_rows_without_duplicates(self):
        self.import_data()
        self.source.execute('DELETE FROM scrambles WHERE id=10')
        self.source.execute('UPDATE result_attempts SET value=999 WHERE attempt_number=4')
        self.source.commit()
        self.import_data()
        self.import_data()
        with psycopg.connect(self.url) as connection, contextlib.redirect_stdout(io.StringIO()):
            verify_history(self.adapter, connection, batch_size=2)
            self.assertEqual(connection.execute('SELECT count(*) FROM result_attempts').fetchone()[0], 5)

    def test_failed_import_keeps_previous_snapshot(self):
        self.import_data()
        self.source.execute('UPDATE scrambles SET is_extra=7 WHERE id=10')
        self.source.commit()
        with self.assertRaises(psycopg.errors.CheckViolation):
            self.import_data()
        with psycopg.connect(self.url) as connection:
            self.assertEqual(connection.execute('SELECT is_extra FROM scrambles WHERE id=10').fetchone()[0], 0)
            self.assertEqual(connection.execute('SELECT count(*) FROM results').fetchone()[0], 1)

    def test_verify_detects_text_changes(self):
        self.import_data()
        with psycopg.connect(self.url) as connection:
            connection.execute("UPDATE scrambles SET scramble='changed' WHERE id=14")
        with psycopg.connect(self.url) as connection, contextlib.redirect_stdout(io.StringIO()), self.assertRaises(HistoryMigrationError):
            verify_history(self.adapter, connection, batch_size=2)

    def test_postgres_outage_retains_unavailable_ui(self):
        with patch('app.get_db_connection', side_effect=psycopg.OperationalError):
            response = app.test_client().get('/my-official-solve-history?wca_id=2020TEST01')
        self.assertEqual(response.status_code, 200)
        self.assertIn('Official solve history is temporarily unavailable', response.text)

    def test_history_index_command_uses_postgres(self):
        with contextlib.closing(get_db_connection()) as connection:
            self.assertIsInstance(connection, PostgresConnection)
        result = app.test_cli_runner().invoke(args=['optimize-history-db'])
        self.assertEqual(result.exit_code, 0, result.output)
        self.assertIn('index is ready', result.output)
