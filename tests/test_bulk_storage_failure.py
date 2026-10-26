import unittest
from unittest.mock import patch

import psycopg
from app import app
from persistence import StorageConfigurationError


class BulkStorageFailureTests(unittest.TestCase):
    def test_storage_failure_preserves_results_in_both_modes(self):
        for mode in ('beginner', 'expert'):
            for error in (psycopg.errors.ConnectionTimeout('private connection details'),
                          StorageConfigurationError('missing configuration'), OSError('disk unavailable')):
                with self.subTest(mode=mode, error=type(error).__name__), patch('app.bulk_connection', side_effect=error):
                    response = app.test_client().post('/' + mode, data={
                        'action': 'bulk', 'bulk_scrambles': 'R U\nF2'})
                self.assertEqual(response.status_code, 200)
                html = response.get_data(as_text=True)
                self.assertIn('These results could not be saved', html)
                self.assertIn('2 scrambles traced', html)
                self.assertIn('R U', html)
                self.assertNotIn('private connection details', html)
                self.assertNotIn('form="bulk-query-form"', html)
                self.assertNotIn('/bulk/None', html)
                if mode == 'beginner':
                    self.assertIn('Ranges and distributions', html)

    def test_successful_save_keeps_query_controls(self):
        with patch('app.save_bulk_batch', return_value='saved-test-batch'):
            for mode in ('beginner', 'expert'):
                response = app.test_client().post('/' + mode, data={
                    'action': 'bulk', 'bulk_scrambles': 'R U\nF2'})
                self.assertEqual(response.status_code, 200)
                self.assertIn(b'/bulk/saved-test-batch', response.data)
                self.assertNotIn(b'These results could not be saved', response.data)
