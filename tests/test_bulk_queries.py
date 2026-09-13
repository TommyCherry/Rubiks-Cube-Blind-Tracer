import os
import tempfile
import unittest
from unittest.mock import patch

from app import app


class BulkQueryTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.config = patch.dict(app.config, BULK_DATABASE=os.path.join(self.directory.name, 'bulk.sqlite3'))
        self.config.start()
        self.client = app.test_client()
        with patch('app.render_template', return_value='saved') as render:
            response = self.client.post('/', data={'action': 'bulk', 'bulk_scrambles': "R\nR R'\ninvalid\nR2"})
        self.assertEqual(response.status_code, 200)
        self.saved = render.call_args.kwargs
        self.url = '/bulk/' + self.saved['bulk_batch_id']

    def tearDown(self):
        self.config.stop()
        self.directory.cleanup()

    def query(self, **query):
        with patch('app.trace_scramble', side_effect=AssertionError('Must reuse stored results')):
            with patch('app.render_template', return_value='results') as render:
                response = self.client.get(self.url, query_string=query)
        self.assertEqual(response.status_code, 200)
        return render.call_args.kwargs

    def login(self, wca_id="2020TEST01"):
        with self.client.session_transaction() as session:
            session['wca_user'] = {'wca_id': wca_id}

    def history(self):
        return [dict(competition_name='Test <Open>', competition_id='Test2026',
                     round_type_id='f', attempt_number=2,
                     scrambles=[dict(scramble=" R  R' ", group_id='A'),
                                dict(scramble="R R'", group_id='B')])]

    def test_current_profile_matches_and_logout(self):
        self.login()
        with patch('app.get_3bld_history', return_value=self.history()) as history:
            result = self.query(alg_count='0', sort='desc')
        history.assert_called_once_with('2020TEST01')
        matches = result['bulk_results'][0]['wca_matches']
        self.assertEqual([match['group'] for match in matches], ['A', 'B'])
        self.assertEqual(matches[0]['solve'], 2)
        self.assertEqual(matches[0]['round_type_id'], 'f')
        self.login('2021OTHER01')
        with patch('app.get_3bld_history', return_value=[]) as history:
            self.assertEqual(self.query()['bulk_results'][0]['wca_matches'], [])
        history.assert_called_once_with('2021OTHER01')
        with self.client.session_transaction() as session:
            session.clear()
        with patch('app.get_3bld_history') as history:
            self.assertNotIn('wca_matches', self.query()['bulk_results'][0])
        history.assert_not_called()

    def test_initial_submission_matches_and_escapes_details(self):
        self.login()
        with patch('app.get_3bld_history', return_value=self.history()) as history:
            response = self.client.post('/', data={'action': 'bulk', 'bulk_scrambles': "1. R R'"})
        history.assert_called_once()
        html = response.get_data(as_text=True)
        self.assertIn('Test &lt;Open&gt;', html)
        self.assertIn('Round f · Solve 2 · Group A', html)
        self.assertIn('Round f · Solve 2 · Group B', html)

    def test_history_failure_keeps_saved_results_available(self):
        from mysql.connector import Error
        self.login()
        with patch('app.get_3bld_history', side_effect=Error('offline')):
            with self.assertLogs('app', level='WARNING'):
                result = self.query()
        self.assertEqual(len(result['bulk_results']), 4)
        self.assertIn('temporarily unavailable', result['bulk_history_warning'])

    def test_filter_zero_and_preserve_statistics(self):
        result = self.query(alg_count='0')
        self.assertEqual([row['line_number'] for row in result['bulk_results']], [2])
        self.assertEqual(result['bulk_stats'], self.saved['bulk_stats'])
        self.assertEqual(result['bulk_total'], 4)
        self.assertEqual(self.query(alg_count='999')['bulk_results'], [])

    def test_sort_and_reset(self):
        for order, reverse in [('asc', False), ('desc', True)]:
            rows = self.query(sort=order)['bulk_results']
            self.assertIn('error', rows[-1])
            counts = [row['alg_count'] for row in rows[:-1]]
            self.assertEqual(counts, sorted(counts, reverse=reverse))
        self.assertEqual(self.query()['bulk_results'], self.saved['bulk_results'])

    def test_bad_queries_and_missing_batch(self):
        for query in [{'alg_count': '-1'}, {'alg_count': '1.5'}, {'alg_count': '0 OR 1=1'},
                      {'alg_count': '9' * 30}, {'sort': 'unexpected'}]:
            self.assertEqual(self.client.get(self.url, query_string=query).status_code, 400)
        self.assertEqual(self.client.get('/bulk/missing').status_code, 404)

    def test_render_empty_results_and_controls(self):
        html = self.client.get(self.url + '?alg_count=999&sort=desc').get_data(as_text=True)
        self.assertIn('No scrambles match this algorithm count.', html)
        self.assertIn('value="999"', html)
        self.assertIn('value="desc" selected', html)
        self.assertIn('id="bulk-query-form"', html)


if __name__ == '__main__':
    unittest.main()
