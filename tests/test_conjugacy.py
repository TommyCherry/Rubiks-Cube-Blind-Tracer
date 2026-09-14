import tempfile
import unittest
from pathlib import Path
from app import app, save_bulk_batch
from Cube import Cube


class ConjugacyTests(unittest.TestCase):
    def test_four_three_cycles_and_net_edge_orientation(self):
        cube = Cube()
        cube.edge_perm = [1, 2, 0, 4, 5, 3, 7, 8, 6, 10, 11, 9]
        self.assertEqual(cube.conjugacy_class(), '3e3e3e3e')
        cube.edge_ori[6] = cube.edge_ori[9] = 1
        self.assertEqual(cube.conjugacy_class(), "3e3e3e'3e'")
        cube.edge_ori[0] = cube.edge_ori[1] = 1
        self.assertEqual(cube.conjugacy_class(), "3e3e3e'3e'")

    def test_fixed_pieces_and_corner_orientation(self):
        cube = Cube()
        self.assertEqual(cube.conjugacy_class(), 'Solved')
        cube.edge_ori[0] = cube.edge_ori[1] = 1
        cube.corner_ori[0], cube.corner_ori[1] = 1, 2
        self.assertEqual(cube.conjugacy_class(), "1e'1e' 1c'1c'")
        cube.corner_perm[:3] = [1, 2, 0]
        self.assertEqual(cube.conjugacy_class(), "1e'1e' 3c")
        cube.corner_ori[1] = 0
        cube.corner_ori[3] = 2
        self.assertEqual(cube.conjugacy_class(), "1e'1e' 3c'1c'")

    def test_single_bulk_and_legacy_batch(self):
        client = app.test_client()
        with tempfile.TemporaryDirectory() as directory:
            old_database = app.config['BULK_DATABASE']
            self.addCleanup(app.config.update, BULK_DATABASE=old_database)
            app.config['BULK_DATABASE'] = str(Path(directory) / 'bulk.sqlite3')
            # U has an oriented four-cycle for each piece type, even with pseudoswap.
            response = client.post('/', data={'scramble': 'U', 'use_pseudoswap': 'on'})
            self.assertEqual(response.status_code, 200)
            self.assertIn('4e 4c', response.get_data(as_text=True))
            response = client.post('/', data={'action': 'bulk', 'bulk_scrambles': 'U\ninvalid'})
            self.assertEqual(response.status_code, 200)
            self.assertIn('4e 4c', response.get_data(as_text=True))
            self.assertIn('colspan="7"', response.get_data(as_text=True))
            batch = save_bulk_batch([dict(line_number=1, scramble='U', alg_count=1)],
                                    dict(bulk_stats={}, bulk_total=1))
            # Inspect the enriched row without relying on unrelated old metadata fields.
            from unittest.mock import patch
            with patch('app.render_template', return_value='ok') as render:
                self.assertEqual(client.get('/bulk/' + batch).status_code, 200)
            self.assertEqual(render.call_args.kwargs['bulk_results'][0]['conjugacy_class'], '4e 4c')
