import os
import tempfile
import unittest

from app import app


class PresetTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.old_database = app.config['PRESET_DATABASE']
        app.config['PRESET_DATABASE'] = os.path.join(self.directory.name, 'presets.sqlite3')
        self.client = app.test_client()
        self.settings = dict(mode='expert', fields={'edge_buffer': ['2'], 'include_ltct': ['on'],
            'include_t2c': [], 'letter_UF': ['Z']}, orders={'edgeFloatingOrder': ['UR', 'UF']},
            colors=dict.fromkeys('UFRBLD', '#ffffff'), orientation=dict.fromkeys('UFRBLD', '#ffffff'))

    def tearDown(self):
        app.config['PRESET_DATABASE'] = self.old_database
        self.directory.cleanup()

    def login(self, user_id):
        with self.client.session_transaction() as session:
            session['wca_user'] = {'id': user_id, 'name': 'Test user'}
            session['preset_csrf'] = 'test-token'

    def save(self, name='Competition', settings=None):
        return self.client.post('/api/settings-presets', json={'name': name, 'settings': settings or self.settings},
                                headers={'X-Preset-CSRF': 'test-token'})

    def test_presets_are_persistent_and_private(self):
        self.login(1)
        response = self.save()
        self.assertEqual(response.status_code, 201)
        self.assertEqual(self.client.get('/api/settings-presets').json['presets'][0]['settings'], self.settings)
        self.login(2)
        self.assertEqual(self.client.get('/api/settings-presets').json['presets'], [])
        self.assertEqual(self.save().status_code, 201)
        self.login(1)
        self.assertEqual(len(self.client.get('/api/settings-presets').json['presets']), 1)
        self.assertEqual(self.save().status_code, 409)

    def test_auth_csrf_and_validation(self):
        self.assertEqual(self.save().status_code, 401)
        self.assertEqual(self.client.get('/api/settings-presets').status_code, 401)
        self.login(1)
        self.assertEqual(self.client.post('/api/settings-presets', json={}).status_code, 403)
        self.assertEqual(self.save(name=' ').status_code, 400)
        self.assertEqual(self.save(name='x' * 81).status_code, 400)
        self.assertEqual(self.save(settings={'mode': 'bogus'}).status_code, 400)
        self.settings['colors']['U'] = 'invalid'
        self.assertEqual(self.save().status_code, 400)

    def test_save_section_on_both_pages(self):
        for route in ['/beginner', '/expert']:
            html = self.client.get(route).get_data(as_text=True)
            self.assertIn('Sign in with WCA to save settings', html)
        self.login(1)
        for route in ['/beginner', '/expert']:
            html = self.client.get(route).get_data(as_text=True)
            self.assertIn('id="save-preset"', html)
            self.assertIn('id="load-preset"', html)
