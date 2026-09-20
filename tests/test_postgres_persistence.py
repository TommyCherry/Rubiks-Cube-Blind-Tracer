"""Opt-in integration tests. TEST_DATABASE_URL must point to a test database.

Each test creates and removes only its own randomly named PostgreSQL schema.
"""
import json
import os
from pathlib import Path
import sqlite3
import tempfile
import unittest
import uuid
from unittest.mock import patch

import psycopg
from psycopg import sql
from psycopg.conninfo import make_conninfo

from app import app
from scripts.persistent_data import initialize, transfer, MigrationError
import test_settings_presets
import test_bulk_queries


class PostgresFixture:
    def setUp(self):
        super().setUp()
        self.schema = 'test_persistence_' + uuid.uuid4().hex
        self.admin = psycopg.connect(os.environ['TEST_DATABASE_URL'], autocommit=True)
        self.addCleanup(self.admin.close)
        self.admin.execute(sql.SQL('CREATE SCHEMA {}').format(sql.Identifier(self.schema)))
        self.addCleanup(lambda: self.admin.execute(
            sql.SQL('DROP SCHEMA {} CASCADE').format(sql.Identifier(self.schema))))
        self.url = make_conninfo(os.environ['TEST_DATABASE_URL'], options='-c search_path=' + self.schema)
        with psycopg.connect(self.url) as connection:
            initialize(connection)
        config = patch.dict(app.config, DATABASE_URL=self.url)
        config.start()
        self.addCleanup(config.stop)


@unittest.skipUnless(os.environ.get('TEST_DATABASE_URL'), 'Set TEST_DATABASE_URL for PostgreSQL integration tests')
class PostgresPresetTests(PostgresFixture, test_settings_presets.PresetTests):
    def test_post_failure_is_json(self):
        self.login(1)
        self.admin.execute(sql.SQL('DROP TABLE {}.settings_presets').format(sql.Identifier(self.schema)))
        self.assertEqual(self.save().status_code, 503)
        self.assertTrue(self.save().is_json)


@unittest.skipUnless(os.environ.get('TEST_DATABASE_URL'), 'Set TEST_DATABASE_URL for PostgreSQL integration tests')
class PostgresBulkTests(PostgresFixture, test_bulk_queries.BulkQueryTests):
    def setUp(self):
        # Base setUp creates the batch before the PostgreSQL fixture runs.
        # Recreate that fixture batch after PostgreSQL is configured.
        super().setUp()
        with patch('app.render_template', return_value='saved') as render:
            response = self.client.post('/', data={'action': 'bulk', 'bulk_scrambles': "R\nR R'\ninvalid\nR2"})
        self.assertEqual(response.status_code, 200)
        self.saved = render.call_args.kwargs
        self.url = '/bulk/' + self.saved['bulk_batch_id']


@unittest.skipUnless(os.environ.get('TEST_DATABASE_URL'), 'Set TEST_DATABASE_URL for PostgreSQL integration tests')
class PostgresMigrationTests(PostgresFixture, unittest.TestCase):
    def setUp(self):
        super().setUp()
        directory = tempfile.TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        self.presets = Path(directory.name) / 'presets.sqlite3'
        self.bulk = Path(directory.name) / 'bulk.sqlite3'
        with sqlite3.connect(self.presets) as connection:
            connection.execute('CREATE TABLE settings_presets (id INTEGER PRIMARY KEY, user_id TEXT, name TEXT, settings TEXT)')
            connection.execute('INSERT INTO settings_presets VALUES (42, ?, ?, ?)', ('123', "Unicode ü ' ?", json.dumps({'x': ['é', None]})))
        with sqlite3.connect(self.bulk) as connection:
            connection.execute('CREATE TABLE bulk_batches (id TEXT PRIMARY KEY, metadata TEXT)')
            connection.execute('CREATE TABLE bulk_scrambles (batch_id TEXT, line_number INTEGER, alg_count INTEGER, result TEXT)')
            connection.execute("INSERT INTO bulk_batches VALUES ('original-url-id', '{}')")
            connection.execute("INSERT INTO bulk_scrambles VALUES ('original-url-id', 3, NULL, ?)", (json.dumps({'error': 'invalid'}),))

    def test_import_rerun_verify_ids_and_sequence(self):
        for _ in range(2):
            with psycopg.connect(self.url) as connection:
                initialize(connection)
                transfer(connection, self.presets, self.bulk)
        with psycopg.connect(self.url) as connection:
            transfer(connection, self.presets, self.bulk, verify=True)
            row = connection.execute("INSERT INTO settings_presets (user_id,name,settings) VALUES ('123','new','{}') RETURNING id").fetchone()
            self.assertGreater(row[0], 42)
            self.assertEqual(connection.execute('SELECT id FROM bulk_batches').fetchone()[0], 'original-url-id')

    def test_conflicting_data_rolls_back_whole_import(self):
        with psycopg.connect(self.url) as connection:
            connection.execute("INSERT INTO bulk_batches VALUES ('original-url-id', 'different')")
        with self.assertRaises(MigrationError):
            with psycopg.connect(self.url) as connection:
                transfer(connection, self.presets, self.bulk)
        with psycopg.connect(self.url) as connection:
            self.assertEqual(connection.execute('SELECT count(*) FROM settings_presets').fetchone()[0], 0)

    def test_missing_source_is_not_created(self):
        missing = self.presets.with_name('missing.sqlite3')
        with psycopg.connect(self.url) as connection, self.assertRaises(MigrationError):
            transfer(connection, missing, self.bulk)
        self.assertFalse(missing.exists())
