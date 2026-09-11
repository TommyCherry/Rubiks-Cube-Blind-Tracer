import contextlib
import io
import unittest
from unittest.mock import patch

from werkzeug.datastructures import MultiDict

from app import app, EDGE_BUFFER_OPTIONS
from Cube import UF, UB, UR, UL, FR, FL, DF, DB, DR


def two_cycles(cube, scramble):
    cube.edge_perm[UF], cube.edge_perm[UB], cube.edge_perm[UR] = UB, UR, UF
    cube.edge_perm[UL], cube.edge_perm[FR], cube.edge_perm[FL] = FR, FL, UL


class FloatingFormTests(unittest.TestCase):
    def post(self, enabled, order=None, setup=two_cycles):
        data = MultiDict([
            ('edge_buffer', str(UF)), ('corner_buffer', '0'),
            ('letter_UF', 'Z'), ('letter_FR', 'Y'),
        ])
        for name in enabled:
            data.add('edge_floating_buffers', name)
        for name in order or EDGE_BUFFER_OPTIONS:
            data.add('edge_floating_order', name)
        with patch('app.Cube.apply_scramble', setup), contextlib.redirect_stdout(io.StringIO()):
            response = app.test_client().post('/', data=data)
        self.assertEqual(response.status_code, 200)
        return response.get_data(as_text=True)

    def test_all_switches_appear_in_memo(self):
        def three_cycles(cube, scramble):
            two_cycles(cube, scramble)
            cube.edge_perm[DF], cube.edge_perm[DB], cube.edge_perm[DR] = DB, DR, DF

        html = self.post(['UL', 'DF'], setup=three_cycles)
        self.assertIn('AB [Buffer D] YL [Buffer U] WV', html)
        self.assertNotIn('[Buffer Z]', html)

    def test_order_custom_letters_and_restored_settings(self):
        order = ['UF', 'FR'] + [name for name in EDGE_BUFFER_OPTIONS if name not in ('UF', 'FR')]
        html = self.post(['FR', 'UL'], order)
        self.assertIn('AB [Buffer Y] LD', html)
        self.assertNotIn('[Buffer Z]', html)
        self.assertIn('data-order=\'["UF", "FR",', html)
        self.assertIn('data-enabled=\'["FR", "UL", "UF"]\'', html)

    def test_disabled_floating_keeps_plain_memo(self):
        html = self.post([])
        self.assertNotIn('[Buffer ', html)
        self.assertIn('AB DY LD', html)

    def test_buffers_before_primary_are_not_used(self):
        order = ['FR', 'UF'] + [name for name in EDGE_BUFFER_OPTIONS if name not in ('UF', 'FR')]
        self.assertNotIn('[Buffer ', self.post(['FR'], order))

    def test_invalid_order_shows_error(self):
        self.assertIn('Invalid edge floating buffer order.', self.post(['FR'], ['UF', 'FR']))

    def test_corner_selections_and_order_survive_submission(self):
        order = ['DFL', 'UFR', 'UFL', 'UBR', 'UBL', 'DFR', 'DBR', 'DBL']
        data = MultiDict([('corner_buffer', '5'),
                          ('corner_floating_buffers', 'UBL')])
        for name in order:
            data.add('corner_floating_order', name)
        with contextlib.redirect_stdout(io.StringIO()):
            response = app.test_client().post('/', data=data)
        self.assertEqual(response.status_code, 200)
        html = response.get_data(as_text=True)
        self.assertIn('data-order=\'["DFL", "UFR", "UFL",', html)
        self.assertIn('data-enabled=\'["UBL", "DFL"]\'', html)


if __name__ == '__main__':
    unittest.main()
