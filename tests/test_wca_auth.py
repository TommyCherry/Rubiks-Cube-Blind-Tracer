import unittest
from unittest.mock import Mock, patch
from urllib.parse import parse_qs, urlsplit

import app as app_module
from auth_config import session_secret


class SessionSecretTests(unittest.TestCase):
    def test_production_requires_stable_key(self):
        for environment in ({'VERCEL': '1'}, {'VERCEL_ENV': 'production'},
                            {'VERCEL_ENV': 'preview'}, {'APP_ENV': 'production'},
                            {'FLASK_ENV': 'production'}):
            with self.subTest(environment=environment):
                with self.assertRaisesRegex(RuntimeError, 'FLASK_SECRET_KEY'):
                    session_secret(environment)
                environment['FLASK_SECRET_KEY'] = 'persistent-test-secret'
                self.assertEqual(session_secret(environment), 'persistent-test-secret')

    def test_local_fallback(self):
        self.assertTrue(session_secret({}))


class WcaAuthTests(unittest.TestCase):
    def setUp(self):
        self.environment = patch.dict('os.environ', {
            'WCA_CLIENT_ID': 'test-client', 'WCA_CLIENT_SECRET': 'test-secret'})
        self.environment.start()
        self.addCleanup(self.environment.stop)
        self.redirect = patch.object(app_module, 'WCA_REDIRECT_URI',
                                     'https://cube.example/auth/wca/callback')
        self.redirect.start()
        self.addCleanup(self.redirect.stop)
        self.client = app_module.app.test_client()

    def test_alias_redirects_before_creating_state(self):
        response = self.client.get('/auth/wca', base_url='https://alias.example')
        self.assertEqual(response.location, 'https://cube.example/auth/wca')
        self.assertNotIn('Set-Cookie', response.headers)

    @patch.object(app_module.requests, 'get')
    @patch.object(app_module.requests, 'post')
    def test_complete_login_and_reject_replay(self, post, get):
        post.return_value = Mock(ok=True, json=lambda: {'access_token': 'token'})
        get.return_value = Mock(ok=True, json=lambda: {'me': {
            'id': 123, 'name': 'Test Cuber', 'wca_id': None,
            'avatar': {'thumb_url': 'https://example.com/avatar'}}})
        response = self.client.get('/auth/wca', base_url='https://cube.example')
        query = parse_qs(urlsplit(response.location).query)
        self.assertEqual(query['redirect_uri'], ['https://cube.example/auth/wca/callback'])
        callback = '/auth/wca/callback?code=test&state=' + query['state'][0]
        response = self.client.get(callback, base_url='https://cube.example')
        self.assertEqual(response.status_code, 302)
        with self.client.session_transaction(base_url='https://cube.example') as session:
            self.assertEqual(session['wca_user']['id'], 123)
        response = self.client.get(callback, base_url='https://cube.example')
        self.assertEqual(response.status_code, 400)
        post.assert_called_once()

    @patch.object(app_module.requests, 'post')
    def test_missing_or_mismatched_state_never_exchanges_code(self, post):
        self.client.get('/auth/wca', base_url='https://cube.example')
        response = self.client.get('/auth/wca/callback?code=test&state=wrong',
                                   base_url='https://cube.example')
        self.assertEqual(response.status_code, 400)
        response = self.client.get('/auth/wca/callback?code=test',
                                   base_url='https://cube.example')
        self.assertEqual(response.status_code, 400)
        post.assert_not_called()


if __name__ == '__main__':
    unittest.main()
