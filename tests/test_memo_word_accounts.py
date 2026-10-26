import os
import tempfile
import unittest
from unittest.mock import patch

import psycopg
from app import app


class MemoAccountTests(unittest.TestCase):
    def setUp(self):
        directory = tempfile.TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        config = patch.dict(app.config, DATABASE_URL=None, PRESET_DATABASE=os.path.join(directory.name, 'presets.sqlite3'))
        config.start(); self.addCleanup(config.stop)
        env = patch.dict(os.environ, {}, clear=True)
        env.start(); self.addCleanup(env.stop)
        self.client = app.test_client()

    def login(self, user):
        with self.client.session_transaction() as session:
            session['wca_user'] = {'id': user}
            session['memo_word_csrf'] = 'test-csrf'

    def save(self, pair='AB', word='Apple box'):
        return self.client.put('/api/memo-word-choices', json={'pair': pair, 'word': word}, headers={'X-Memo-CSRF': 'test-csrf'})

    def test_auth_validation_and_csrf(self):
        self.assertEqual(self.save().status_code, 401)
        self.login(1)
        self.assertEqual(self.client.put('/api/memo-word-choices', json={'pair': 'AB', 'word': 'Apple'}).status_code, 403)
        self.assertEqual(self.save(word=' ').status_code, 400)
        self.assertEqual(self.save(pair='BAD').status_code, 400)
        self.assertEqual(self.save(word='a' * 121).status_code, 400)

    def test_persistence_isolation_update_and_delete(self):
        self.login(1)
        self.assertEqual(self.save().status_code, 200)
        self.assertEqual(self.client.get('/api/memo-word-choices').json['words'], {'AB': 'Apple box'})
        self.login(2)
        self.assertEqual(self.client.get('/api/memo-word-choices').json['words'], {})
        self.save(word='Another box')
        self.login(1)
        self.save(word='Abacus')
        self.assertEqual(self.client.get('/api/memo-word-choices').json['words'], {'AB': 'Abacus'})
        self.assertEqual(self.client.delete('/api/memo-word-choices', json={'pair': 'AB'}, headers={'X-Memo-CSRF': 'test-csrf'}).status_code, 200)
        self.assertEqual(self.client.get('/api/memo-word-choices').json['words'], {})
        self.login(2)
        self.assertEqual(self.client.get('/api/memo-word-choices').json['words'], {'AB': 'Another box'})

    def test_failure_and_page_account_metadata(self):
        self.login(1)
        response = self.client.get('/beginner')
        self.assertIn(b'data-signed-in="true"', response.data)
        with patch('app.preset_connection', side_effect=psycopg.OperationalError('private detail')):
            response = self.save()
            self.assertEqual(response.status_code, 503)
            self.assertNotIn(b'private detail', response.data)
