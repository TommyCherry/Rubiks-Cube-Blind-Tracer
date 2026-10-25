import unittest

from app import app, _trace_scramble
from Cube import Cube, SPEFFZ, UR, UF, UB, UL, UBL, UFR, UBR, DF
from blddb import expand_moves
from beginner_solutions import OP_PARITY_ALGORITHMS, op_edge_examples, op_corner_examples


class BeginnerParityExampleTests(unittest.TestCase):
    def test_supplied_algorithms_have_expected_swaps(self):
        for corner, edges in [('UBL', (UB, UL)), ('UFR', (UR, UF))]:
            actual = Cube()
            actual.apply_scramble(OP_PARITY_ALGORITHMS[('UR', corner)])
            expected = Cube()
            a, b = edges
            expected.edge_perm[a], expected.edge_perm[b] = b, a
            expected.corner_perm[UFR], expected.corner_perm[UBR] = UBR, UFR
            self.assertEqual(actual.get_state(), expected.get_state())

    def test_rendered_only_for_parity_and_supported_buffers_in_both_orders(self):
        for corner, name in [(UBL, 'UBL'), (UFR, 'UFR')]:
            for order in ['edges', 'corners']:
                for scramble, parity in [('R', True), ('R U', False)]:
                    response = app.test_client().post('/beginner', data={
                        'scramble': scramble, 'edge_buffer': str(UR), 'corner_buffer': str(corner),
                        'beginner_execution_order': order})
                    self.assertEqual(response.status_code, 200)
                    html = response.get_data(as_text=True)
                    self.assertEqual('data-execution-kind="parity"' in html, parity)
                    self.assertIn('id="beginner-parity-step"', html)
                    if parity:
                        from html import unescape
                        self.assertIn(OP_PARITY_ALGORITHMS[('UR', name)], unescape(html))
                        first, last = ('edge', 'corner') if order == 'edges' else ('corner', 'edge')
                        self.assertLess(html.index(f'data-execution-kind="{first}"'), html.index('data-execution-kind="parity"'))
                        self.assertLess(html.index('data-execution-kind="parity"'), html.index(f'data-execution-kind="{last}"'))
        for route, edge in [('/expert', UR), ('/beginner', DF)]:
            html = app.test_client().post(route, data={'scramble': 'R', 'edge_buffer': str(edge)}).get_data(as_text=True)
            self.assertNotIn('data-execution-kind="parity"', html)

    def test_ubl_op_full_parity_execution_solves_in_either_order(self):
        for scramble in ['R', 'R U F', "R2 U F2"]:
            result = _trace_scramble(scramble, edge_buffer=UR, corner_buffer=UBL,
                use_pseudoswap=False, pseudoswap_edge_1=UB, pseudoswap_edge_2=UL,
                floating_buffers=[], letter_scheme=SPEFFZ,
                beginner_flip_targets=True, beginner_twist_targets=True)
            self.assertEqual(result['parity'], 'Yes')
            edges = [row['algorithm'] for row in op_edge_examples(result['edge_target_names'], SPEFFZ)]
            corners = [row['algorithm'] for row in op_corner_examples(result['corner_target_names'], SPEFFZ)]
            for first, last in [(edges, corners), (corners, edges)]:
                cube = Cube()
                cube.apply_scramble(scramble)
                for algorithm in first + [OP_PARITY_ALGORITHMS[('UR', 'UBL')]] + last:
                    cube.apply_scramble(expand_moves(algorithm))
                self.assertTrue(cube.is_solved(), (scramble, first == edges))
