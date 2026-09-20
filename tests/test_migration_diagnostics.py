import contextlib
import io
import os
from types import SimpleNamespace
import unittest
from unittest.mock import patch

import psycopg
from scripts.persistent_data import main, redact_diagnostic, report_operational_error


class MigrationDiagnosticTests(unittest.TestCase):
    URL = 'postgresql://private_user:p%40ss%27word%20tail@db.example/tracer?sslmode=require'

    def test_urls_credentials_and_environment_secrets_are_redacted(self):
        with patch.dict(os.environ, {'DATABASE_URL_DIRECT': self.URL, 'WCA_CLIENT_SECRET': 'other-secret'}, clear=True):
            message = (self.URL + '\npassword authentication failed for user "private_user"\n'
                       "password p@ss'word tail\nother-secret\n"
                       'postgresql://unknown:unknown-password@other.example/db\n')
            output = redact_diagnostic(message, self.URL)
        for secret in (self.URL, 'private_user', "p@ss'word tail", 'p%40ss', 'other-secret', 'unknown-password', 'postgresql://'):
            self.assertNotIn(secret, output)
        self.assertIn('password authentication failed', output)

    def test_keyword_dsn_and_malformed_assignments(self):
        dsn = "host=db.example user=private_user password='secret phrase' dbname=tracer"
        for message in (dsn, "password='unclosed secret phrase", 'DATABASE_URL_DIRECT=' + self.URL):
            with self.subTest(message=message):
                output = redact_diagnostic(message, dsn)
                self.assertNotIn('secret phrase', output)
                self.assertNotIn('private_user', output)
                self.assertNotIn('postgresql://', output)

    def test_network_and_tls_reasons_survive(self):
        for message in ('connection timeout expired', 'Connection refused',
                        'could not translate host name "db.example" to address: nodename nor servname provided',
                        'SSL error: certificate verify failed', 'Network is unreachable'):
            output = redact_diagnostic(message, self.URL)
            self.assertIn(message.split(':')[-1].strip(), output)

    def test_diagnostics_are_sanitized_and_sql_context_is_not_printed(self):
        error = SimpleNamespace(sqlstate='08001', diag=SimpleNamespace(
            severity_nonlocalized='FATAL', message_primary='connection refused',
            message_detail='password="hidden-password"', message_hint='Check SSL configuration',
            context='SECRET SQL MUST NOT PRINT'))
        stream = io.StringIO()
        with contextlib.redirect_stderr(stream):
            report_operational_error(error, self.URL, connected=False)
        output = stream.getvalue()
        self.assertIn('SQLSTATE: 08001', output)
        self.assertIn('Hint: Check SSL configuration', output)
        self.assertNotIn('hidden-password', output)
        self.assertNotIn('SECRET SQL MUST NOT PRINT', output)

    def test_main_reports_connection_failure_without_starting_migration(self):
        stream = io.StringIO()
        with patch.dict(os.environ, {'DATABASE_URL_DIRECT': self.URL}, clear=True), \
             patch('sys.argv', ['persistent_data.py', 'init']), \
             patch('scripts.persistent_data.psycopg.connect', side_effect=psycopg.OperationalError('connection timeout expired: ' + self.URL)), \
             patch('scripts.persistent_data.initialize') as initialize, \
             contextlib.redirect_stderr(stream):
            self.assertEqual(main(), 1)
        initialize.assert_not_called()
        self.assertIn('No migration was started', stream.getvalue())
        self.assertIn('connection timeout expired', stream.getvalue())
        self.assertNotIn(self.URL, stream.getvalue())

    def test_during_migration_failure_is_not_reported_as_connect_failure(self):
        stream = io.StringIO()
        with patch.dict(os.environ, {'DATABASE_URL_DIRECT': self.URL}, clear=True), \
             patch('sys.argv', ['persistent_data.py', 'init']), \
             patch('scripts.persistent_data.psycopg.connect'), \
             patch('scripts.persistent_data.initialize', side_effect=psycopg.OperationalError('server closed the connection unexpectedly')), \
             contextlib.redirect_stderr(stream):
            self.assertEqual(main(), 1)
        self.assertIn('transaction did not complete', stream.getvalue())
        self.assertNotIn('No migration was started', stream.getvalue())
