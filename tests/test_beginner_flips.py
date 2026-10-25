import unittest
from unittest.mock import patch

from app import _trace_scramble, app
from Cube import Cube, SPEFFZ, UR, UF, UBL, DF
from beginner_solutions import op_edge_examples
from blddb import expand_moves


class BeginnerFlipTests(unittest.TestCase):
    def trace(self, beginner=True, scheme=SPEFFZ, flipped=(UR, UF), **options):
        def setup(cube, scramble):
            for position in flipped:
                cube.edge_ori[position] = 1
        with patch('app.Cube.apply_scramble', setup):
            return _trace_scramble('R', edge_buffer=UR, corner_buffer=UBL,
                use_pseudoswap=False, pseudoswap_edge_1=0, pseudoswap_edge_2=1,
                floating_buffers=[], letter_scheme=scheme, beginner_flip_targets=beginner,
                **options)

    def test_flips_are_ordinary_targets_and_examples_solve_them(self):
        for flipped in [(UR, UF), (UF, DF)]:
            result = self.trace(flipped=flipped)
            self.assertNotIn('[Flips:', result['edge_memo'])
            self.assertEqual(result['edge_count'], 2 if UR in flipped else 4)
            self.assertEqual(result['flip_alg_count'], 0)
            cube = Cube()
            for position in flipped:
                cube.edge_ori[position] = 1
            for row in op_edge_examples(result['edge_target_names'], SPEFFZ):
                cube.apply_scramble(expand_moves(row['algorithm']))
            self.assertTrue(cube.is_solved())

    def test_custom_letters_and_sticker_priority(self):
        result = self.trace(scheme=dict(SPEFFZ, UF='甲', FU='乙'))
        self.assertEqual(result['edge_memo'], '甲乙')
        order = ['FU'] + [sticker for sticker in SPEFFZ if len(sticker) == 2 and sticker != 'FU']
        result = self.trace(edge_sticker_cycle_break_order=order)
        self.assertEqual(result['edge_target_names'], ['FU', 'UF'])

    def test_expert_still_uses_separate_flip_annotation(self):
        result = self.trace(beginner=False)
        self.assertIn('[Flips:', result['edge_memo'])
        self.assertEqual(result['edge_count'], 0)
        self.assertEqual(result['flip_alg_count'], 1)

    def test_beginner_route_uses_letter_targets(self):
        def setup(cube, scramble):
            cube.edge_ori[UR] = cube.edge_ori[UF] = 1
        with patch('app.Cube.apply_scramble', setup):
            html = app.test_client().post('/beginner', data={'scramble': 'R', 'edge_buffer': str(UR)}).text
        self.assertNotIn('[Flips:', html)
        self.assertIn('CI', html)
