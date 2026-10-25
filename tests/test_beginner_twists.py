import unittest
from unittest.mock import patch
from app import _trace_scramble, app
from Cube import Cube, SPEFFZ, UR, UBL, DFR
from beginner_solutions import op_corner_examples
from blddb import expand_moves


class BeginnerTwistTests(unittest.TestCase):
    def trace(self, orientation, beginner=True, scheme=SPEFFZ):
        def setup(cube, scramble):
            cube.corner_ori[DFR] = orientation
            cube.corner_ori[UBL] = 3 - orientation
        with patch('app.Cube.apply_scramble', setup):
            return _trace_scramble('R', edge_buffer=UR, corner_buffer=UBL,
                use_pseudoswap=False, pseudoswap_edge_1=0, pseudoswap_edge_2=1,
                floating_buffers=[], letter_scheme=scheme, beginner_twist_targets=beginner)

    def test_twist_pairs_execute_and_count_as_ordinary_targets(self):
        for orientation, memo in [(1, 'VP'), (2, 'VK')]:
            result = self.trace(orientation)
            self.assertEqual(result['corner_memo'], memo)
            self.assertEqual(result['corner_count'], 2)
            self.assertEqual(result['twist_alg_count'], 0)
            cube = Cube()
            cube.corner_ori[DFR] = orientation
            cube.corner_ori[UBL] = 3 - orientation
            for row in op_corner_examples(result['corner_target_names'], SPEFFZ):
                cube.apply_scramble(expand_moves(row['algorithm']))
            self.assertTrue(cube.is_solved())

    def test_custom_letters_and_expert_behavior(self):
        self.assertEqual(self.trace(1, scheme=dict(SPEFFZ, DFR='甲', RDF='乙'))['corner_memo'], '甲乙')
        expert = self.trace(1, beginner=False)
        self.assertIn('[CW Twists:', expert['corner_memo'])
        self.assertEqual(expert['corner_count'], 0)

    def test_beginner_route_enables_pair_tracing(self):
        def setup(cube, scramble):
            cube.corner_ori[DFR] = 1
            cube.corner_ori[UBL] = 2
        with patch('app.Cube.apply_scramble', setup):
            html = app.test_client().post('/beginner', data={'scramble': 'R', 'corner_buffer': str(UBL)}).text
        self.assertIn('VP', html)
        self.assertNotIn('[CW Twists:', html)
        self.assertIn('id="generated-memo"', html)
        self.assertIn('data-request-method="POST"', html)
