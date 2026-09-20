import os
import sqlite3
import tempfile
import unittest
from unittest.mock import patch

import psycopg
from app import app, bulk_connection, preset_connection, get_db_connection
from persistence import StorageConfigurationError


class BackendSelectionTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        config = patch.dict(app.config, DATABASE_URL=None,
                            PRESET_DATABASE=os.path.join(self.directory.name, 'presets.sqlite3'),
                            BULK_DATABASE=os.path.join(self.directory.name, 'bulk.sqlite3'))
        config.start()
        self.addCleanup(config.stop)
        env = patch.dict(os.environ, {}, clear=True)
        env.start()
        self.addCleanup(env.stop)

    def test_local_sqlite_fallback(self):
        with app.app_context():
            for connect in (preset_connection, bulk_connection):
                connection = connect()
                self.assertIsInstance(connection, sqlite3.Connection)
                connection.close()

    def test_production_never_falls_back(self):
        for variable, value in [('VERCEL', '1'), ('VERCEL_ENV', 'preview'),
                                ('APP_ENV', 'production'), ('FLASK_ENV', 'production')]:
            with self.subTest(variable=variable), patch.dict(os.environ, {variable: value}), app.app_context():
                for connect in (preset_connection, bulk_connection, get_db_connection):
                    with self.assertRaises(StorageConfigurationError):
                        connect()
        self.assertEqual(os.listdir(self.directory.name), [])

    def test_local_history_retains_mysql_defaults(self):
        with patch('app.mysql.connector.connect') as connect:
            get_db_connection()
        self.assertEqual(connect.call_args.kwargs['host'], 'localhost')
        self.assertEqual(connect.call_args.kwargs['database'], 'wca_results')

    def test_postgres_failure_does_not_fall_back(self):
        with patch.dict(app.config, DATABASE_URL='postgresql://unused'), app.app_context():
            with patch('persistence.psycopg.connect', side_effect=psycopg.OperationalError):
                for connect in (preset_connection, bulk_connection, get_db_connection):
                    with self.assertRaises(psycopg.OperationalError):
                        connect()
        self.assertEqual(os.listdir(self.directory.name), [])

    def test_presets_storage_errors_are_json(self):
        client = app.test_client()
        with client.session_transaction() as session:
            session['wca_user'] = {'id': 123}
        for error in (sqlite3.OperationalError(), psycopg.OperationalError(),
                      StorageConfigurationError(), PermissionError()):
            with self.subTest(error=type(error)), patch('app.preset_connection', side_effect=error):
                response = client.get('/api/settings-presets')
                self.assertEqual(response.status_code, 503)
                self.assertTrue(response.is_json)
                self.assertIn('temporarily unavailable', response.json['error'])
        with patch.dict(os.environ, VERCEL='1'):
            self.assertEqual(client.get('/api/settings-presets').status_code, 503)
