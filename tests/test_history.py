import unittest
from unittest.mock import MagicMock, patch

from app import app, get_multiblind_history


class HistoryTests(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()
        with self.client.session_transaction() as session:
            session['wca_user'] = {'wca_id': '2020TEST01'}

    def test_events_and_old_url(self):
        with patch('app.get_3bld_history', return_value=[]) as history:
            for url in ['/my-official-solve-history', '/my-3bld-history']:
                response = self.client.get(url)
                self.assertEqual(response.status_code, 200)
                self.assertIn('My Official Solve History', response.get_data(as_text=True))
            self.assertEqual(history.call_count, 2)
        with patch('app.get_multiblind_history', return_value=[]) as history:
            response = self.client.get('/my-official-solve-history?event=333mbf')
        history.assert_called_once_with('2020TEST01')
        self.assertIn('No multi-blind scrambles found', response.get_data(as_text=True))
        self.assertEqual(self.client.get('/my-official-solve-history?event=333').status_code, 400)

    def test_multi_grouping_includes_every_cube_and_extra(self):
        base = dict(competition_name='Test Open', competition_id='Test2026', year=2026,
                    month=1, day=2, round_type_id='f', group_id='A', is_extra=0,
                    scramble_num=1, scramble='R U\r\n\r\nF2 D\n')
        rows = [base, dict(base, scramble_num=20), dict(base, is_extra=1),
                dict(base, group_id='B')]
        connection = MagicMock()
        cursor = connection.cursor.return_value
        cursor.fetchall.return_value = rows
        with patch('app.get_db_connection', return_value=connection):
            groups = get_multiblind_history('2020TEST01')
        self.assertEqual([len(group['scrambles']) for group in groups], [2, 2, 2, 2])
        self.assertEqual(groups[0]['scrambles'], [dict(cube_number=1, scramble='R U'), dict(cube_number=2, scramble='F2 D')])
        self.assertEqual([group['attempt_number'] for group in groups], [1, 20, 1, 1])
        sql, params = cursor.execute.call_args.args
        self.assertEqual(params, ('333mbf', '2020TEST01'))
        self.assertIn('EXISTS', sql)
        self.assertNotIn('result_attempts', sql)
        self.assertNotIn('is_extra = 0', sql)
        cursor.close.assert_called_once()
        connection.close.assert_called_once()
        with patch('app.get_multiblind_history', return_value=groups):
            html = self.client.get('/my-official-solve-history?event=333mbf').get_data(as_text=True)
        self.assertIn('Attempt 20', html)
        self.assertEqual(html.count('class="scramble-text"'), 8)
        self.assertEqual(html.count('class="import-mbld-attempt"'), 4)
        self.assertEqual(html.count('value="R U"'), 4)
        self.assertEqual(html.count('value="F2 D"'), 4)
        self.assertIn('Extra set 1', html)
        self.assertIn('Import All to Bulk', html)
        self.assertNotIn('<th scope="col">Result</th>', html)

    def test_login_required(self):
        with self.client.session_transaction() as session:
            session.clear()
        self.assertEqual(self.client.get('/my-official-solve-history').status_code, 302)
