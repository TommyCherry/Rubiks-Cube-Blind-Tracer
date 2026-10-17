import unittest
from unittest.mock import patch

from Cube import Cube, SPEFFZ, CORNER_TARGET_NAMES, UBL, UFR, UB, UL, UR, DF
from app import app, _trace_scramble
from beginner_solutions import OP_CORNER_SETUPS, OP_CORNER_ALGORITHM, op_corner_examples, inverse_setup


class OPCornerSolutionTests(unittest.TestCase):
    def test_all_nonbuffer_stickers_swap_with_ubl_and_preserve_expected_edge_swap(self):
        stickers = {name: sticker for sticker, name in CORNER_TARGET_NAMES.items()}
        self.assertEqual(set(OP_CORNER_SETUPS), {name for name, (piece, _) in stickers.items() if piece != UBL})
        for row in op_corner_examples(OP_CORNER_SETUPS, SPEFFZ):
            with self.subTest(target=row['positions'][1]):
                piece, orientation = stickers[row['positions'][1]]
                expected = Cube()
                expected.corner_perm[UBL], expected.corner_perm[piece] = piece, UBL
                expected.corner_ori[UBL] = (-orientation) % 3
                expected.corner_ori[piece] = orientation
                expected.edge_perm[UB], expected.edge_perm[UL] = UL, UB
                actual = Cube()
                actual.apply_scramble(row['algorithm'])
                self.assertEqual(actual.get_state(), expected.get_state())

    def test_setup_inverse_helper_and_custom_letters(self):
        self.assertEqual(inverse_setup('R2 D R2'), "R2 D' R2")
        self.assertEqual(inverse_setup("R' F'"), 'F R')
        rows = op_corner_examples(['UBR', 'UFR', 'UBR'], dict(SPEFFZ, UBR='中', UFR='J'))
        self.assertEqual([row['memo'] for row in rows], ['中', 'J', '中'])
        self.assertEqual(rows[0]['recipe'], "R2 D R2 Y-perm R2 D' R2")
        self.assertEqual(rows[1]['recipe'], 'Y-perm')
        self.assertEqual(rows[1]['algorithm'], OP_CORNER_ALGORITHM)
        self.assertEqual(rows[0]['kind'], 'corner')

    def test_corner_examples_follow_and_solve_traced_permutation(self):
        for scramble in ['R U', 'R U F', "R U R' U'", "F2 R2 U L2 D' B2"]:
            result = _trace_scramble(scramble, edge_buffer=UR, corner_buffer=UBL,
                use_pseudoswap=False, pseudoswap_edge_1=0, pseudoswap_edge_2=1,
                floating_buffers=[], letter_scheme=SPEFFZ)
            rows = op_corner_examples(result['corner_target_names'], SPEFFZ)
            self.assertEqual(len(rows), result['corner_count'])
            cube = Cube()
            cube.apply_scramble(scramble)
            for row in rows:
                cube.apply_scramble(row['algorithm'])
            self.assertEqual(cube.corner_perm, list(range(8)))
            if not result['clockwise_twisted_corners'] and not result['counterclockwise_twisted_corners']:
                self.assertEqual(cube.corner_ori, [0] * 8)

    def test_edge_and_corner_support_are_independent(self):
        for edge, corner in [(UR, UBL), (DF, UBL), (UR, UFR), (DF, UFR)]:
            with patch('app.render_template', return_value='ok') as render:
                response = app.test_client().post('/beginner', data={
                    'scramble': 'R U F', 'edge_buffer': str(edge), 'corner_buffer': str(corner)})
            self.assertEqual(response.status_code, 200)
            context = render.call_args.kwargs
            self.assertEqual(context['beginner_op_supported'], edge == UR)
            self.assertEqual(context['beginner_corner_op_supported'], corner == UBL)
            self.assertEqual(len(context['beginner_corner_solution_examples']), context['corner_count'] if corner == UBL else 0)
            self.assertEqual(len(context['beginner_solution_examples']), context['edge_count'] if edge == UR else 0)
