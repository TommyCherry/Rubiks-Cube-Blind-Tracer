import unittest
from unittest.mock import patch

from app import app, trace_scramble, SPEFFZ
from Cube import UF, UR, UFR, UFL, UBR, UBL, DFR, DFL, DBR, CORNER_BUFFER_ORDER


class ParityThreeTwistTests(unittest.TestCase):
    def trace(self, twists=None, **extra):
        twists = {UFL: 2, UBR: 2} if twists is None else twists

        def setup(cube, scramble):
            cube.edge_perm[UF], cube.edge_perm[UR] = UR, UF
            cube.corner_perm[UFR], cube.corner_perm[DFR] = DFR, UFR
            cube.corner_ori[UFR] = 2
            for position, orientation in twists.items():
                cube.corner_ori[position] = orientation
            cube.corner_ori[DFR] = (-sum(cube.corner_ori)) % 3

        settings = dict(edge_buffer=UF, corner_buffer=UFR, use_pseudoswap=False,
                        pseudoswap_edge_1=UF, pseudoswap_edge_2=UR,
                        floating_buffers=[], corner_floating_buffers=[],
                        letter_scheme=SPEFFZ, include_ltct=True)
        settings.update(extra)
        with patch('app.Cube.apply_scramble', setup):
            return trace_scramble('', **settings)

    def test_requested_example(self):
        before = self.trace()
        after = self.trace(include_parity_3twist=True)
        self.assertEqual(before['corner_memo'], '[CCW Twists: D] [LTCT: K[N]]')
        self.assertEqual(after['corner_memo'], 'KD [LTCT: I[N]]')
        self.assertEqual(after['corner_target_names'], ['FDR', 'UFL', 'FUL'])
        self.assertEqual(after['corner_cycle_breaks'], ['UFL'])
        self.assertEqual(after['corner_count'], before['corner_count'] + 2)
        self.assertEqual(after['ccw_twist_count'], before['ccw_twist_count'] - 1)
        self.assertEqual(after['alg_count'], before['alg_count'])

    def test_odd_order_and_target_override(self):
        twists = {UFL: 2, UBR: 2, UBL: 2}
        order = [UBR] + [p for p in CORNER_BUFFER_ORDER if p != UBR]
        for settings in ({'corner_odd_cycle_break_order': order},
                         {'corner_odd_cycle_break_overrides': {'FDR': order}}):
            result = self.trace(twists, include_parity_3twist=True, **settings)
            self.assertEqual(result['corner_cycle_breaks'], ['UBR'])
            self.assertIn('KB', result['corner_memo'])

    def test_paired_twists_and_missing_ltct_are_unchanged(self):
        for twists in ({UFL: 2}, {UFL: 2, UBR: 2, UBL: 1}, {UFL: 2, UBR: 1}):
            self.assertEqual(self.trace(twists), self.trace(twists, include_parity_3twist=True))
        self.assertEqual(self.trace(include_ltct=False),
                         self.trace(include_ltct=False, include_parity_3twist=True))

    def test_clockwise_closing_sticker_and_custom_letters(self):
        scheme = dict(SPEFFZ, FDR='parity', UFL='open', LUF='close', BUR='twist')
        result = self.trace({UFL: 1, UBR: 1}, include_parity_3twist=True, letter_scheme=scheme)
        self.assertEqual(result['corner_memo'], 'parityopen [LTCT: close[twist]]')

    def test_expert_toggle_is_rendered_and_submitted(self):
        client = app.test_client()
        self.assertIn('Execute Parity + 3twist as Comm + LTCT', client.get('/expert').text)
        self.assertNotIn('id="include-parity-3twist"', client.get('/beginner').text)
        with patch('app.trace_scramble', return_value={}) as trace:
            response = client.post('/expert', data={'scramble': 'R', 'include_parity_3twist': 'on'})
        self.assertTrue(trace.call_args.kwargs['include_parity_3twist'])
        self.assertIn('name="include_parity_3twist" value="on" checked', response.text)
