import unittest
from unittest.mock import patch
from app import trace_scramble
from Cube import Cube, UF, UB, UR, UL, FR, FL, DF, DB, DR, UFR, SPEFFZ


class FloatingFlipTests(unittest.TestCase):
    def analyze(self, setup, **overrides):
        settings = dict(edge_buffer=UF, corner_buffer=UFR, use_pseudoswap=False,
                        pseudoswap_edge_1=UF, pseudoswap_edge_2=UB,
                        floating_buffers=list(range(12)), letter_scheme=SPEFFZ)
        settings.update(overrides)
        with patch.object(Cube, 'apply_scramble', lambda cube, scramble: setup(cube)):
            return trace_scramble('R', **settings)

    def test_two_flips_only_cost_one_alg_no_targets(self):
        def setup(c):
            c.edge_ori[UB] = c.edge_ori[UR] = 1
        result = self.analyze(setup)
        self.assertEqual(result['edge_memo'], '[2Flip: AQ BM]')
        self.assertEqual(result['edge_count'], 0)
        self.assertEqual(result['alg_count'], 1)
        self.assertEqual(result['two_flip_count'], 1)
        self.assertEqual(result['flip_count'], 2)
        self.assertEqual(result['edge_buffers_used'], 0)
        disabled = self.analyze(setup, floating_buffers=[])
        self.assertEqual(disabled['edge_memo'], '[Flips: AQ BM]')

    def test_pair_uses_priority_and_does_not_skip_intervening_cycle(self):
        def setup(c):
            c.edge_ori[UB] = c.edge_ori[DF] = c.edge_ori[DB] = c.edge_ori[DR] = 1
            c.edge_perm[UR], c.edge_perm[UL], c.edge_perm[FR] = UL, FR, UR
        order = [UF, UB, UR, DB, DF, DR, UL, FR, FL, 9, 10, 11]
        result = self.analyze(setup, floating_buffers=order, edge_flip_order=order)
        actions = result['edge_floating']
        self.assertEqual(actions[0]['two_flip'], [UB, DB])
        self.assertEqual(actions[1]['to_buffer'], UR)
        self.assertEqual([a['two_flip'] for a in actions if 'two_flip' in a], [[UB, DB], [DF, DR]])
        self.assertEqual(result['edge_count'], 2)
        self.assertEqual(result['flip_alg_count'], 2)
        self.assertNotIn('[Flips:', result['edge_memo'])

    def test_lone_flip_becomes_buffer_and_cycle_breaks(self):
        def setup(c):
            c.edge_ori[UB] = c.edge_ori[UR] = 1
            c.edge_perm[UR], c.edge_perm[UL], c.edge_perm[FR] = UL, FR, UR
        result = self.analyze(setup)
        self.assertEqual(result['edge_floating'][0]['flipped_buffer'], UB)
        self.assertEqual(result['edge_cycle_breaks'], ['UR'])
        self.assertEqual(result['edge_count'], 4)
        self.assertEqual(result['flip_alg_count'], 0)
        self.assertNotIn('[Flips:', result['edge_memo'])
        self.assertTrue(result['edge_memo'].startswith('[Buffer A]'))

    def test_odd_boundary_does_not_process_flips(self):
        def setup(c):
            c.edge_perm[UF], c.edge_perm[UL] = UL, UF
            c.corner_perm[0], c.corner_perm[1] = 1, 0
            c.edge_ori[UB] = c.edge_ori[UR] = 1
        result = self.analyze(setup)
        self.assertEqual(result['two_flip_count'], 0)
        self.assertIn('[Flips: AQ BM]', result['edge_memo'])
