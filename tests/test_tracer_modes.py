import contextlib
import io
import unittest
from unittest.mock import patch

from app import app, _trace_scramble


class TracerModeTests(unittest.TestCase):
    def test_beginner_controls(self):
        response = app.test_client().get('/beginner')
        self.assertEqual(response.status_code, 200)
        html = response.get_data(as_text=True)
        for control in ['scramble', 'edge-buffer', 'corner-buffer', 'usePseudoswap',
                        'pseudoswapEdge1', 'pseudoswapEdge2', 'letter-scheme-heading']:
            self.assertIn(f'id="{control}"', html)
        self.assertIn('Solving settings', html)
        for control in ['conjugacy-input', 'edgeFloatingOrder', 'cornerFloatingOrder',
                        'include-ltct', 'include-t2c', 'include-3twist', 'advanced-heading']:
            self.assertNotIn(f'id="{control}"', html)
        self.assertNotIn('conjugacy_practice.js', html)

    def test_expert_and_existing_home_keep_full_controls(self):
        for path in ['/', '/expert']:
            response = app.test_client().get(path)
            self.assertEqual(response.status_code, 200)
            html = response.get_data(as_text=True)
            for control in ['conjugacy-input', 'conjugacy-count', 'edgeFloatingOrder',
                            'include-ltct', 'advanced-heading']:
                self.assertIn(f'id="{control}"', html)
            self.assertIn('href="/beginner"', html)
            self.assertIn('href="/expert"', html)

    def test_beginner_post_uses_visible_settings_only(self):
        data = {'scramble': 'R U', 'edge_buffer': '1', 'corner_buffer': '2',
                'use_pseudoswap': 'on', 'pseudoswap_edge_1': '1', 'pseudoswap_edge_2': '2',
                'letter_UF': 'Z', 'include_ltct': 'on', 'include_t2c': 'on',
                'include_3twist': 'on', 'include_basic_sandwiching': 'on',
                'edge_floating_buffers': ['UB', 'UR'],
                'corner_floating_buffers': ['UBR', 'UFL']}
        with patch('app._trace_scramble', wraps=_trace_scramble) as trace, contextlib.redirect_stdout(io.StringIO()):
            response = app.test_client().post('/beginner', data=data)
        self.assertEqual(response.status_code, 200)
        settings = trace.call_args.kwargs
        self.assertEqual(settings['edge_buffer'], 1)
        self.assertEqual(settings['corner_buffer'], 2)
        self.assertTrue(settings['use_pseudoswap'])
        self.assertEqual((settings['pseudoswap_edge_1'], settings['pseudoswap_edge_2']), (1, 2))
        self.assertEqual(settings['letter_scheme']['UF'], 'Z')
        for name in ['include_ltct', 'include_t2c', 'include_3twist', 'include_basic_sandwiching']:
            self.assertFalse(settings[name])
        self.assertEqual(len(settings['floating_buffers']), 1)
        self.assertEqual(len(settings['corner_floating_buffers']), 1)
        self.assertIn('id="edge-memo"', response.get_data(as_text=True))
        self.assertNotIn('conjugacy-summary', response.get_data(as_text=True))

    def test_beginner_m2_prefers_ub_for_both_cycle_break_orders(self):
        from Cube import DF, UBL, UB
        with patch('app._trace_scramble', wraps=_trace_scramble) as trace, contextlib.redirect_stdout(io.StringIO()):
            response = app.test_client().post('/beginner', data={
                'scramble': 'R U', 'beginner_method': 'm2_op',
                'edge_buffer': str(DF), 'corner_buffer': str(UBL)})
        self.assertEqual(response.status_code, 200)
        settings = trace.call_args.kwargs
        self.assertEqual(settings['edge_buffer'], DF)
        self.assertEqual(settings['corner_buffer'], UBL)
        self.assertFalse(settings['use_pseudoswap'])
        for key in ['edge_even_cycle_break_order', 'edge_odd_cycle_break_order']:
            self.assertEqual(settings[key][0], UB)
            self.assertEqual(set(settings[key]), set(range(12)))
        self.assertIn('value="m2_op" selected', response.get_data(as_text=True))

    def test_method_presets_are_beginner_only(self):
        self.assertIn('id="beginner-method"', app.test_client().get('/beginner').get_data(as_text=True))
        self.assertNotIn('id="beginner-method"', app.test_client().get('/expert').get_data(as_text=True))

    def test_beginner_letter_orders_apply_to_both_target_parities(self):
        from app import EDGE_BUFFER_OPTIONS, CORNER_BUFFER_OPTIONS
        from werkzeug.datastructures import MultiDict
        edges = list(reversed(EDGE_BUFFER_OPTIONS))
        corners = list(reversed(CORNER_BUFFER_OPTIONS))
        data = MultiDict({'scramble': 'R U', 'letter_BL': 'Z', 'letter_LB': 'Y',
                          'beginner_method': 'm2_op', 'edge_buffer': '6'})
        data.setlist('edge_even_cycle_break_order', edges)
        data.setlist('corner_even_cycle_break_order', corners)
        # Hidden expert controls must not override the beginner's single order.
        data.setlist('edge_odd_cycle_break_order', EDGE_BUFFER_OPTIONS)
        with patch('app._trace_scramble', wraps=_trace_scramble) as trace, contextlib.redirect_stdout(io.StringIO()):
            response = app.test_client().post('/beginner', data=data)
        settings = trace.call_args.kwargs
        for parity in ('even', 'odd'):
            self.assertEqual(settings[f'edge_{parity}_cycle_break_order'],
                             [EDGE_BUFFER_OPTIONS.index(name) for name in edges])
            self.assertEqual(settings[f'corner_{parity}_cycle_break_order'],
                             [CORNER_BUFFER_OPTIONS.index(name) for name in corners])
        html = response.get_data(as_text=True)
        self.assertIn('data-cycle-letter="BL">Z</span>', html)
        self.assertIn('data-cycle-letter="LB">Y</span>', html)
        self.assertIn('data-storage-scope="beginner-"', html)
        self.assertEqual(html.count('name="edge_even_cycle_break_order"'), 12)
        self.assertEqual(html.count('name="corner_even_cycle_break_order"'), 8)
        self.assertNotIn('name="edge_odd_cycle_break_order"', html)

    def test_beginner_rejects_incomplete_or_duplicate_cycle_orders(self):
        from app import EDGE_BUFFER_OPTIONS, CORNER_BUFFER_OPTIONS
        from werkzeug.datastructures import MultiDict
        for kind, options in [('edge', EDGE_BUFFER_OPTIONS), ('corner', CORNER_BUFFER_OPTIONS)]:
            for invalid in [options[:-1], [options[0]] * len(options)]:
                data = MultiDict({'scramble': 'R U'})
                data.setlist(f'{kind}_even_cycle_break_order', invalid)
                with patch('app._trace_scramble') as trace:
                    response = app.test_client().post('/beginner', data=data)
                trace.assert_not_called()
                self.assertIn(f'Invalid {kind} even cycle-break order.', response.get_data(as_text=True))
