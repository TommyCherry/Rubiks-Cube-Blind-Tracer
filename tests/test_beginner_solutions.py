import contextlib
import io
import unittest
from unittest.mock import patch

from Cube import Cube, EDGE_TARGET_NAMES, SPEFFZ, UR, UFR, UBR
from app import app, _trace_scramble
from blddb import expand_moves
from beginner_solutions import OP_EDGE_ALGORITHMS, OP_EDGE_RECIPES, op_edge_examples


class BeginnerSolutionTests(unittest.TestCase):
    def test_every_recipe_swaps_exactly_ur_and_target_with_op_corner_swap(self):
        stickers = {name: sticker for sticker, name in EDGE_TARGET_NAMES.items()}
        self.assertEqual(set(OP_EDGE_RECIPES), set(stickers) - {'UR', 'RU'})
        for row in op_edge_examples(list(OP_EDGE_RECIPES), SPEFFZ):
            with self.subTest(target=row['positions'][1]):
                position, orientation = stickers[row['positions'][1]]
                expected = Cube()
                expected.edge_perm[UR], expected.edge_perm[position] = position, UR
                expected.edge_ori[UR] = expected.edge_ori[position] = orientation
                expected.corner_perm[UFR], expected.corner_perm[UBR] = UBR, UFR
                actual = Cube()
                actual.apply_scramble(expand_moves(row['algorithm']))
                self.assertEqual(actual.get_state(), expected.get_state())

    def test_custom_letters_and_repeated_cycle_break_targets_remain_in_order(self):
        rows = op_edge_examples(['FL', 'UB', 'FL'], dict(SPEFFZ, FL='中'))
        self.assertEqual([row['memo'] for row in rows], ['中', SPEFFZ['UB'], '中'])
        self.assertEqual(rows[0]['recipe'], "L' T-perm L")
        self.assertEqual(rows[0]['algorithm'], "L' " + OP_EDGE_ALGORITHMS['T-perm'] + ' L')
        self.assertEqual(OP_EDGE_RECIPES['BR'], "Dw2 L' T-perm L Dw2")

    def test_beginner_uses_local_examples_and_other_buffers_do_not_use_blddb(self):
        for method, buffer in [('op_op', '2'), ('op_op_ufr', '2'), ('m2_op', '6')]:
            with patch('app.dataset') as dataset, contextlib.redirect_stdout(io.StringIO()):
                response = app.test_client().post('/beginner', data={
                    'scramble': 'R U F', 'beginner_method': method, 'edge_buffer': buffer})
            html = response.get_data(as_text=True)
            self.assertEqual(response.status_code, 200)
            dataset.assert_not_called()
            self.assertNotIn('blddb.net', html)
            if buffer == '2':
                self.assertIn('data-source="beginner"', html)
                self.assertIn('Old Pochmann algorithms', html)
            else:
                self.assertIn('id="load-solution-examples"', html)
                self.assertIn('UBL buffer; UFR helper.', html)
                self.assertIn('M2 and other buffer algorithms have not been defined yet.', html)

    def test_examples_match_every_trace_target_and_execute_edge_permutation(self):
        for scramble in ['R U', 'R U F', "F2 R2 U L2 D' B2", "R U R' U'"]:
            result = _trace_scramble(scramble, edge_buffer=UR, corner_buffer=UFR,
                use_pseudoswap=False, pseudoswap_edge_1=0, pseudoswap_edge_2=1,
                floating_buffers=[], letter_scheme=SPEFFZ)
            rows = op_edge_examples(result['edge_target_names'], SPEFFZ)
            self.assertEqual(len(rows), result['edge_count'])
            cube = Cube()
            cube.apply_scramble(scramble)
            for row in rows:
                cube.apply_scramble(expand_moves(row['algorithm']))
            self.assertEqual(cube.edge_perm, list(range(12)))
            if not result['flipped_edges']:
                self.assertEqual(cube.edge_ori, [0] * 12)
