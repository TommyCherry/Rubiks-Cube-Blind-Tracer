import os
import tempfile
import unittest
from unittest.mock import patch
from app import app, beginner_distributions, filter_beginner_results


class BeginnerBulkMetricTests(unittest.TestCase):
    def test_in_place_orientation_counts_and_histograms(self):
        rows = [dict(scramble="R R'", edge_count=0, corner_count=0, target_count=0,
                     edge_cycle_breaks=[], corner_cycle_breaks=[], parity='No'),
                dict(scramble='R', edge_count=3, corner_count=3, target_count=6,
                     edge_cycle_breaks=['UF'], corner_cycle_breaks=['DFR'], parity='Yes'),
                dict(error='invalid')]
        result = beginner_distributions(rows)
        self.assertEqual(rows[1]['cycle_break_count'], 2)
        self.assertEqual(rows[1]['edge_cycle_break_count'], 1)
        self.assertEqual(rows[1]['corner_cycle_break_count'], 1)
        self.assertEqual(rows[0]['in_place_flips'], 0)
        self.assertEqual(rows[1]['in_place_twists'], 0)
        self.assertEqual(result[0]['minimum'], 0)
        self.assertEqual(result[0]['maximum'], 3)
        self.assertEqual([b['percent'] for b in result[0]['bins']], [50, 50])
        with app.test_request_context():
            self.assertEqual(filter_beginner_results(rows, {'edge_count_min': '3', 'parity': 'Yes'}), [rows[1]])
            self.assertEqual(filter_beginner_results(rows, {'edge_count_max': '0'}), [rows[0]])
            self.assertEqual(filter_beginner_results(rows, {'edge_count_min': '4'}), [])

    def test_flips_and_twists_include_buffer_before_tracing(self):
        def setup(cube, scramble):
            cube.edge_ori[0] = cube.edge_ori[2] = 1
            cube.corner_ori[0], cube.corner_ori[3] = 1, 2
        row = dict(scramble='test', edge_count=2, corner_count=2, target_count=4,
                   edge_cycle_breaks=['UF'], corner_cycle_breaks=['UFR'])
        with patch('app.Cube.apply_scramble', setup):
            beginner_distributions([row])
        self.assertEqual(row['in_place_flips'], 2)
        self.assertEqual(row['in_place_twists'], 2)

    def test_saved_batch_filtering_and_validation(self):
        with tempfile.TemporaryDirectory() as directory, patch.dict(app.config, {
            'BULK_DATABASE': os.path.join(directory, 'bulk.sqlite3'), 'DATABASE_URL': None,
        }), patch('app.annotate_bulk_history', return_value=None):
            client = app.test_client()
            response = client.post('/beginner', data={'action': 'bulk', 'bulk_scrambles': "R\nR R'\ninvalid"})
            self.assertEqual(response.status_code, 200)
            import re
            url = re.search(r'id="bulk-query-form" method="GET" action="([^"]+)"', response.text).group(1)
            for key in ['edge_count','corner_count','target_count','cycle_break_count','edge_cycle_break_count','corner_cycle_break_count','in_place_flips','in_place_twists']:
                self.assertIn(f'name="{key}_min"', response.text)
                filtered = client.get(url, query_string={key+'_min': 0, key+'_max': 0, 'parity': 'No'})
                self.assertEqual(filtered.status_code, 200)
                self.assertIn('Ranges and distributions', filtered.text)
            empty = client.get(url, query_string={'target_count_min': 999})
            self.assertIn('No scrambles match these filters.', empty.text)
            self.assertIn('Showing 0 of 3 lines', empty.text)
            for args in [{'edge_count_min': '-1'}, {'target_count_min': '2.5'},
                         {'in_place_twists_min': '3', 'in_place_twists_max': '1'}, {'parity': 'maybe'}]:
                self.assertEqual(client.get(url, query_string=args).status_code, 400)
