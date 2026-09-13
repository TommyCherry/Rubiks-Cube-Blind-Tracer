import contextlib
import io
import unittest
from unittest.mock import patch

from flask import template_rendered
from werkzeug.datastructures import MultiDict

from app import app, CORNER_BUFFER_OPTIONS
from Cube import Cube, UF, UB, UR, UL, FR, FL, UFR, UFL, UBR, UBL, DFR, DFL


class BulkTests(unittest.TestCase):
    def test_t2c_is_final_and_counts_as_one_algorithm(self):
        def setup(cube, scramble):
            cube.edge_perm[UF], cube.edge_perm[UR] = UR, UF
            cube.corner_perm[UFL], cube.corner_perm[UBR] = UBR, UFL
            cube.corner_ori[UFL] = 1
            cube.corner_ori[DFR] = 2
        with patch('app.Cube.apply_scramble', setup):
            context, _ = self.post(dict(action='bulk', bulk_scrambles='R', include_t2c='on',
                                       use_pseudoswap='on'))
        row = context['bulk_results'][0]
        self.assertTrue(row['t2c_active'])
        self.assertTrue(row['corner_memo'].startswith('[CCW Twists: V]'))
        self.assertRegex(row['corner_memo'], r'\[T2C: [A-X]{3}\]$')
        self.assertEqual(row['corner_count'], 3)
        self.assertEqual(row['alg_count'], 2)  # One twist + one T2C.
        self.assertEqual(context['bulk_stats']['t2c_count'], 1)

    def test_t2c_rejects_nonparity_and_untwisted_cycles(self):
        for parity, orientation in ((False, 1), (True, 0)):
            def setup(cube, scramble):
                if parity:
                    cube.edge_perm[UF], cube.edge_perm[UR] = UR, UF
                cube.corner_perm[UFL], cube.corner_perm[UBR] = UBR, UFL
                cube.corner_ori[UFL] = orientation
                cube.corner_ori[DFR] = (-orientation) % 3
            with patch('app.Cube.apply_scramble', setup):
                context, _ = self.post(dict(action='bulk', bulk_scrambles='R', include_t2c='on'))
            self.assertFalse(context['bulk_results'][0]['t2c_active'])

    def test_ltct_takes_priority_over_t2c(self):
        def setup(cube, scramble):
            cube.edge_perm[UF], cube.edge_perm[UR] = UR, UF
            cube.corner_perm[UFL], cube.corner_perm[UBR] = UBR, UFL
            cube.corner_ori[UFL] = 1
            cube.corner_ori[DFR] = 2
        with patch('app.Cube.apply_scramble', setup):
            context, _ = self.post(dict(action='bulk', bulk_scrambles='R', include_t2c='on', include_ltct='on'))
        self.assertTrue(context['bulk_results'][0]['ltct_active'])
        self.assertFalse(context['bulk_results'][0]['t2c_active'])

    def test_ltct_ccw_a_uses_r_and_absorbs_final_parity_target(self):
        def setup(cube, scramble):
            cube.edge_perm[UF], cube.edge_perm[UR] = UR, UF
            cube.corner_perm[UFR], cube.corner_perm[DFR] = DFR, UFR
            cube.corner_ori[DFR] = 1
            cube.corner_ori[UBL] = 2
        with patch('app.Cube.apply_scramble', setup):
            context, _ = self.post(dict(action='bulk', bulk_scrambles='R', include_ltct='on'))
            custom, _ = self.post(dict(action='bulk', bulk_scrambles='R', include_ltct='on',
                                       letter_BUL='Z', letter_DFR='Y'))
        self.assertEqual(context['bulk_results'][0]['corner_memo'], '[LTCT: V[R]]')
        self.assertEqual(custom['bulk_results'][0]['corner_memo'], '[LTCT: Y[Z]]')
        self.assertEqual(context['bulk_results'][0]['corner_count'], 1)

    def test_ltct_status_tracks_checkbox_even_without_eligible_scrambles(self):
        for selected in (True, False):
            data = dict(action='bulk', bulk_scrambles="R R'")
            if selected:
                data['include_ltct'] = 'on'
            context, html = self.post(data)
            self.assertEqual(context['include_ltct'], selected)
            self.assertEqual(context['bulk_stats']['ltct_count'], 0)
            self.assertIn('LTCT: Enabled.' if selected else 'LTCT: Disabled.', html)

    def test_ltct_uses_selected_pseudoswap_edges(self):
        def setup(cube, scramble):
            cube.edge_perm[UB], cube.edge_perm[UL] = UL, UB
            cube.corner_perm[UFR], cube.corner_perm[UFL] = UFL, UFR
            cube.corner_ori[DFR] = 1
            cube.corner_ori[UFR] = 2

        data = dict(action='bulk', bulk_scrambles='R',
                    pseudoswap_edge_1=str(UB), pseudoswap_edge_2=str(UL))
        with patch('app.Cube.apply_scramble', setup):
            baseline, _ = self.post(dict(data, use_pseudoswap='on'))
            enabled, _ = self.post(dict(data, include_ltct='on'))
        row = enabled['bulk_results'][0]
        self.assertTrue(row['ltct_active'])
        self.assertEqual(row['edge_count'], 0)
        self.assertEqual(row['edge_memo'], baseline['bulk_results'][0]['edge_memo'])
        self.assertEqual(row['alg_count'], baseline['bulk_results'][0]['alg_count'] - 1)

    def test_ltct_combines_one_majority_twist_with_parity(self):
        for orientation, direction in ((1, 'CW'), (2, 'CCW')):
            def setup(cube, scramble):
                cube.edge_perm[UF], cube.edge_perm[UR] = UR, UF
                cube.corner_perm[UFR], cube.corner_perm[UFL] = UFL, UFR
                cube.corner_ori[DFR] = orientation
                cube.corner_ori[DFL] = orientation
                cube.corner_ori[UBL] = 3 - orientation
                cube.corner_ori[UFR] = 3 - orientation

            data = dict(action='bulk', bulk_scrambles='R', use_pseudoswap='on',
                        pseudoswap_edge_1='0', pseudoswap_edge_2='2')
            with patch('app.Cube.apply_scramble', setup):
                baseline, _ = self.post(data)
                active, html = self.post(dict(data, include_ltct='on'))
            row = active['bulk_results'][0]
            self.assertTrue(row['ltct_active'])
            self.assertEqual(row['ltct_corner'], 'DFL')
            twist_letter = 'G' if orientation == 1 else 'L'
            parity_letter = baseline['bulk_results'][0]['corner_target_names'][-1]
            from Cube import SPEFFZ
            self.assertIn(f'[LTCT: {SPEFFZ[parity_letter]}[{twist_letter}]]', row['corner_memo'])
            self.assertEqual(row['alg_count'], baseline['bulk_results'][0]['alg_count'] - 1)
            self.assertEqual(row['corner_count'], baseline['bulk_results'][0]['corner_count'])
            self.assertEqual(active['bulk_stats']['ltct_count'], 1)

    def test_ltct_does_not_change_balanced_or_nonparity_scrambles(self):
        for parity, balanced in ((True, True), (False, False)):
            def setup(cube, scramble):
                if parity:
                    cube.edge_perm[UF], cube.edge_perm[UR] = UR, UF
                    cube.corner_perm[UFR], cube.corner_perm[UFL] = UFL, UFR
                cube.corner_ori[DFR] = 1
                if balanced:
                    cube.corner_ori[DFL] = 2
                else:
                    cube.corner_ori[UFR] = 2
            with patch('app.Cube.apply_scramble', setup):
                normal, _ = self.post(dict(action='bulk', bulk_scrambles='R'))
                enabled, _ = self.post(dict(action='bulk', bulk_scrambles='R', include_ltct='on'))
            self.assertEqual(normal['bulk_results'], enabled['bulk_results'])

    def test_pseudoswap_flip_uses_target_permutation(self):
        scramble = "R D' F L2 D2 L D L2 U R F2 D2 F2 B2 R U2 B2 R2 B2 U2 R'"
        context, _ = self.post(dict(action='bulk', bulk_scrambles=scramble,
                                   use_pseudoswap='on', pseudoswap_edge_1='0', pseudoswap_edge_2='2'))
        row = context['bulk_results'][0]
        self.assertEqual(row['edge_memo'], 'DU RN LW OQ PG [Flips: BM]')
        self.assertEqual(row['edge_count'], 10)
        self.assertEqual(row['flip_count'], 1)
        normal, _ = self.post(dict(action='bulk', bulk_scrambles=scramble))
        self.assertEqual(normal['bulk_results'][0]['flip_count'], 0)

    def test_standalone_corner_cycle_returns_to_twisted_primary_buffer(self):
        context, _ = self.post(dict(
            action='bulk',
            bulk_scrambles="R' U2 F L' U' B U2 L F2 R' D' F2 B R2 L2 D2 F' D2 B Uw2",
            use_pseudoswap='on', include_basic_sandwiching='on',
            include_ltct='on', include_t2c='on',
            edge_floating_buffers=['UF', 'UB', 'UR', 'UL', 'FR', 'FL', 'DF', 'DB', 'DR', 'DL', 'BR', 'BL'],
            corner_floating_buffers=CORNER_BUFFER_OPTIONS))
        row = context['bulk_results'][0]
        self.assertEqual(row['alg_count'], 7)
        self.assertEqual(row['corner_memo'], '[Buffer D] WB [Buffer C] VG [LTCT: V[H]]')
        self.assertEqual(row['corner_floating'][-1]['to_buffer'], UFR)
        self.assertTrue(row['corner_floating'][-1]['standalone_return'])
        self.assertEqual(row['corner_buffers_used'], 2)

    def test_pseudoswap_flipped_buffer_regression(self):
        context, _ = self.post(dict(
            action='bulk',
            bulk_scrambles="F B2 D' R2 U D2 R' B R2 F2 U' B2 L2 D' R2 L2 F2 B' L Uw2",
            use_pseudoswap='on', include_basic_sandwiching='on',
            include_ltct='on', include_t2c='on',
            edge_floating_buffers=['UF', 'UB', 'UR', 'UL', 'FR', 'FL', 'DF', 'DB', 'DR', 'DL', 'BR', 'BL'],
            corner_floating_buffers=CORNER_BUFFER_OPTIONS))
        row = context['bulk_results'][0]
        self.assertEqual(row['alg_count'], 8)
        self.assertEqual(row['edge_floating'], [])
        self.assertEqual(row['edge_buffers_used'], 1)

    def test_standalone_cycle_cannot_abandon_flipped_buffer(self):
        scramble = "F L2 F2 R2 U2 B2 U2 R' B2 D2 U' R' B' D2 U R' U2 R"
        context, _ = self.post(dict(action='bulk', bulk_scrambles=scramble, edge_floating_buffers='DR'))
        row = context['bulk_results'][0]
        self.assertEqual(row['edge_memo'], 'PS QH FD UE VT XV [Flips: BM]')
        for enabled in ([], ['BR']):
            disabled, _ = self.post(dict(action='bulk', bulk_scrambles=scramble, edge_floating_buffers=enabled))
            self.assertEqual(disabled['bulk_results'][0]['edge_memo'], 'PS QH FD UE VT XV [Flips: BM]')
        self.assertEqual(row['edge_count'], 12)
        self.assertEqual(row['edge_buffers_used'], 1)
        self.assertFalse(any('to_buffer' in item for item in row['edge_floating']))

    def test_real_scramble_sandwich_reaches_bulk_form_and_statistics(self):
        scramble = "L U2 U D B U2 R R2 D' U2 B2 L' B' U L2 D U2 B' L' U2 B2 D"
        disabled, _ = self.post(dict(action='bulk', bulk_scrambles=scramble))
        enabled, html = self.post(dict(action='bulk', bulk_scrambles=scramble,
                                      include_basic_sandwiching='on'))
        row = enabled['bulk_results'][0]
        self.assertIn('[Sandwich A: WJ] HD', row['edge_memo'])
        self.assertEqual(row['sandwich_count'], 1)
        self.assertEqual(row['alg_count'], disabled['bulk_results'][0]['alg_count'] - 1)
        self.assertEqual(enabled['bulk_stats']['sandwich_scrambles'], 1)
        self.assertIn('Basic sandwiching: Enabled', html)
        self.assertIn('sandwich-highlight', html)

    def test_twists_are_separate_and_use_custom_letters(self):
        def setup(cube, scramble):
            cube.corner_ori[UFL] = cube.corner_ori[UBR] = 1
            cube.corner_ori[UBL] = cube.corner_ori[DFR] = 2

        with patch('app.Cube.apply_scramble', setup):
            context, _ = self.post(dict(action='bulk', bulk_scrambles='R',
                letter_UFL='B', letter_UBR='Q', letter_UBL='A', letter_DFR='R'))
        row = context['bulk_results'][0]
        self.assertEqual(row['corner_memo'], '[CW Twists: BQ] [CCW Twists: AR]')
        self.assertEqual(row['corner_count'], 0)
        self.assertEqual(row['corner_buffers_used'], 0)
        self.assertEqual(row['twist_alg_count'], 2)
        self.assertEqual(context['bulk_stats']['alg_count'], 2)

    def test_twist_formula_and_custom_buffer_exclusion(self):
        def setup(cube, scramble):
            cube.corner_ori[UFR] = cube.corner_ori[UBR] = cube.corner_ori[UBL] = 1
            cube.corner_ori[UFL] = 2
            cube.corner_ori[DFR] = 1

        with patch('app.Cube.apply_scramble', setup):
            context, _ = self.post(dict(action='bulk', bulk_scrambles='R', corner_buffer=str(DFR)))
        row = context['bulk_results'][0]
        self.assertEqual(row['cw_twist_count'], 3)
        self.assertEqual(row['ccw_twist_count'], 1)
        self.assertEqual(row['twist_alg_count'], 3)
        self.assertNotIn('DFR', row['clockwise_twisted_corners'])
        self.assertEqual(row['corner_count'], 0)

    def test_custom_buffer_is_excluded_before_rounding_flip_algorithms(self):
        def setup(cube, scramble):
            for position in (UF, UB, UR, UL):
                cube.edge_ori[position] = 1

        with patch('app.Cube.apply_scramble', setup):
            context, _ = self.post(dict(action='bulk', bulk_scrambles='R', edge_buffer=str(UB)))
        row = context['bulk_results'][0]
        self.assertEqual(row['flipped_edges'], ['UF', 'UR', 'UL'])
        self.assertEqual(row['flip_count'], 3)
        self.assertEqual(row['flip_alg_count'], 2)

    def test_flips_are_separate_memo_and_algorithms(self):
        def setup(cube, scramble):
            cube.edge_ori[UF] = cube.edge_ori[UL] = 1

        with patch('app.Cube.apply_scramble', setup):
            context, _ = self.post(dict(action='bulk', bulk_scrambles='R',
                                       letter_UF='S', letter_FU='W',
                                       letter_UL='N', letter_LU='T'))
        row = context['bulk_results'][0]
        self.assertEqual(row['edge_memo'], '[Flips: NT]')
        self.assertEqual(row['edge_count'], 0)
        self.assertEqual(row['edge_buffers_used'], 0)
        self.assertEqual(row['flip_count'], 1)
        self.assertEqual(row['alg_count'], 1)
        self.assertEqual(row['flipped_edges'], ['UL'])
        self.assertEqual(context['bulk_stats']['alg_count'], 1)

    def test_odd_flip_count_rounds_up_without_removing_permutation_targets(self):
        def setup(cube, scramble):
            cube.edge_perm[UB], cube.edge_perm[UR], cube.edge_perm[FR] = UR, FR, UB
            cube.edge_ori[6] = cube.edge_ori[UL] = cube.edge_ori[FL] = 1
            cube.edge_ori[UB] = 1  # Fourth flip belongs to a permuted piece.

        with patch('app.Cube.apply_scramble', setup):
            context, _ = self.post(dict(action='bulk', bulk_scrambles='R'))
        row = context['bulk_results'][0]
        self.assertEqual(row['flip_count'], 3)
        self.assertEqual(row['flip_alg_count'], 2)
        self.assertGreater(row['edge_count'], 0)
        self.assertEqual(row['alg_count'], (row['edge_count'] + 1) // 2 + 2)
        self.assertNotIn('UB', row['flipped_edges'])

    def test_corner_switches_use_form_priority_and_update_bulk_stats(self):
        def setup(cube, scramble):
            cube.corner_perm[UFR], cube.corner_perm[UFL], cube.corner_perm[UBR] = UFL, UBR, UFR
            cube.corner_perm[UBL], cube.corner_perm[DFR], cube.corner_perm[DFL] = DFR, DFL, UBL

        order = ['UFR', 'DFR'] + [name for name in CORNER_BUFFER_OPTIONS if name not in ('UFR', 'DFR')]
        data = MultiDict([
            ('action', 'bulk'), ('bulk_scrambles', 'R'),
            ('corner_floating_buffers', 'UBL'), ('corner_floating_buffers', 'DFR'),
            ('letter_DFR', 'Z'),
        ] + [('corner_floating_order', name) for name in order])
        with patch('app.Cube.apply_scramble', setup):
            context, html = self.post(data)
        row = context['bulk_results'][0]
        self.assertEqual(row['corner_count'], 4)
        self.assertEqual(row['corner_buffers_used'], 2)
        self.assertEqual(row['corner_buffer_names_used'], ['UFR', 'DFR'])
        self.assertIn('[Buffer Z]', row['corner_memo'])
        usage = {item['name']: item['percent'] for item in context['bulk_stats']['corner_buffer_usage']}
        self.assertEqual(usage['DFR'], 100)
        self.assertEqual(usage['UBL'], 0)

    def test_buffer_usage_counts_actual_switches_over_valid_scrambles(self):
        original = Cube.apply_scramble

        def setup(cube, scramble):
            if scramble == 'cycles':
                cube.edge_perm[UF], cube.edge_perm[UB], cube.edge_perm[UR] = UB, UR, UF
                cube.edge_perm[UL], cube.edge_perm[FR], cube.edge_perm[FL] = FR, FL, UL
            else:
                original(cube, scramble)

        with patch('app.Cube.apply_scramble', setup):
            context, html = self.post(dict(
                action='bulk', bulk_scrambles="cycles\nR R'\ninvalid",
                edge_floating_buffers=['UL', 'DF'],
            ))
        stats = context['bulk_stats']
        usage = {item['name']: item for item in stats['edge_buffer_usage']}
        self.assertEqual(context['bulk_results'][0]['edge_buffer_names_used'], ['UF', 'UL'])
        for name in ('UF', 'UL'):
            self.assertEqual(usage[name]['count'], 1)
            self.assertEqual(usage[name]['percent'], 50)
        self.assertEqual(usage['DF']['percent'], 0)
        self.assertTrue(all(item['count'] == 0 for item in stats['corner_buffer_usage']))
        self.assertIn('Buffer usage by scramble', html)

    def post(self, data):
        contexts = []
        def capture(sender, template, context, **extra):
            contexts.append(context)
        with template_rendered.connected_to(capture, app), contextlib.redirect_stdout(io.StringIO()):
            response = app.test_client().post('/', data=data)
        self.assertEqual(response.status_code, 200)
        return contexts[0], response.get_data(as_text=True)

    def test_summary_excludes_invalid_and_blank_lines(self):
        context, html = self.post(dict(action='bulk', bulk_scrambles="R R'\n\nR\nRw3"))
        solved, odd, invalid = context['bulk_results']
        self.assertEqual([r['line_number'] for r in context['bulk_results']], [1, 3, 4])
        self.assertEqual(solved['target_count'], 0)
        self.assertEqual(solved['buffers_used'], 0)
        self.assertEqual(solved['alg_count'], 0)
        self.assertEqual(odd['parity'], 'Yes')
        self.assertIn('error', invalid)
        stats = context['bulk_stats']
        self.assertEqual((stats['count'], stats['failed']), (2, 1))
        self.assertEqual(stats['parity_percent'], 50)
        self.assertEqual(stats['target_count'], odd['target_count'] / 2)
        self.assertEqual(stats['alg_count'], ((odd['edge_count'] + 1) // 2 +
                                            (odd['corner_count'] + 1) // 2) / 2)
        self.assertIn('Scramble set results', html)

    def test_bulk_matches_single_with_custom_settings(self):
        settings = MultiDict([
            ('edge_buffer', '1'), ('corner_buffer', '2'),
            ('edge_floating_buffers', 'FR'), ('edge_floating_buffers', 'DF'),
            ('use_pseudoswap', 'on'), ('pseudoswap_edge_1', '0'),
            ('pseudoswap_edge_2', '2'), ('letter_UB', 'Z'),
        ])
        scrambles = ["Rw Uw Rw' Uw'", 'R', "R U2 F' L D B2"]
        bulk_data = settings.copy()
        bulk_data.update(dict(action='bulk', bulk_scrambles='\n'.join(scrambles)))
        bulk, _ = self.post(bulk_data)
        for scramble, row in zip(scrambles, bulk['bulk_results']):
            single_data = settings.copy()
            single_data.add('scramble', scramble)
            single, _ = self.post(single_data)
            for key in ('edge_memo', 'corner_memo', 'edge_count', 'corner_count',
                        'edge_buffers_used', 'corner_buffers_used', 'parity'):
                self.assertEqual(row[key], single[key], (scramble, key))
        self.assertEqual(bulk['bulk_results'][1]['parity'], 'Yes')

    def test_empty_all_invalid_and_oversized_batches(self):
        for text, message in [('\n ', 'Enter at least one'),
                              ('R\n' * 1001, 'at most 1,000')]:
            context, html = self.post(dict(action='bulk', bulk_scrambles=text))
            self.assertIn(message, context['error'])
            self.assertIsNone(context['bulk_stats'])
        context, html = self.post(dict(action='bulk', bulk_scrambles='<script>\nUw3'))
        self.assertIsNone(context['bulk_stats'])
        self.assertEqual(len(context['bulk_results']), 2)
        self.assertIn('&lt;script&gt;', html)
        self.assertIn('No valid scrambles', html)

    def test_numbered_lines_match_plain_scrambles(self):
        plain = "R2 U R'\nRw Uw2\nF2 D'"
        numbered = "  1. R2 U R'\n12)\tRw Uw2\n3.F2 D'"
        expected, _ = self.post(dict(action='bulk', bulk_scrambles=plain))
        actual, _ = self.post(dict(action='bulk', bulk_scrambles=numbered))
        self.assertEqual(actual['bulk_results'], expected['bulk_results'])
        self.assertEqual(actual['bulk_stats'], expected['bulk_stats'])
        self.assertEqual(actual['bulk_scrambles'], numbered)

    def test_number_only_line_is_not_counted_as_solved(self):
        context, _ = self.post(dict(action='bulk', bulk_scrambles='1.\n2) Rw3\n3. R2'))
        self.assertEqual(context['bulk_stats']['count'], 1)
        self.assertEqual(context['bulk_stats']['failed'], 2)
        self.assertIn('Missing scramble', context['bulk_results'][0]['error'])
        self.assertIn('Rw3', context['bulk_results'][1]['error'])


if __name__ == '__main__':
    unittest.main()
