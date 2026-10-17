import contextlib
import io
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from app import app, _trace_scramble, EDGE_BUFFER_OPTIONS, CORNER_BUFFER_OPTIONS, EDGE_TARGETS, CORNER_TARGETS


class BeginnerHelperTests(unittest.TestCase):
    def test_priority_is_stable_optional_and_shared_by_single_and_bulk(self):
        helpers = {'edge': ['LB', 'BU'], 'corner': ['LDB', 'BUR']}
        piece_orders = {'edge': EDGE_BUFFER_OPTIONS, 'corner': CORNER_BUFFER_OPTIONS}
        sticker_orders = {'edge': EDGE_TARGETS, 'corner': CORNER_TARGETS}
        with tempfile.TemporaryDirectory() as directory, patch.dict(app.config, BULK_DATABASE=str(Path(directory) / 'bulk.sqlite3')):
            for mode in ['piece', 'sticker']:
                for enabled in [False, True]:
                    for action in ['single', 'bulk']:
                        data = {'scramble': 'R U', 'bulk_scrambles': 'R U', 'action': action,
                                'beginner_cycle_order_mode': mode}
                        if enabled:
                            data['beginner_prioritize_helpers'] = 'on'
                        for kind in ['edge', 'corner']:
                            data[f'beginner_{kind}_helpers'] = helpers[kind]
                            data[f'{kind}_even_cycle_break_order'] = piece_orders[kind]
                            data[f'{kind}_sticker_cycle_break_order'] = sticker_orders[kind]
                        with patch('app._trace_scramble', wraps=_trace_scramble) as trace, patch('app.render_template', return_value='ok') as render, contextlib.redirect_stdout(io.StringIO()):
                            response = app.test_client().post('/beginner', data=data)
                        self.assertEqual(response.status_code, 200)
                        context = render.call_args.kwargs
                        self.assertIsNone(context['error'])
                        self.assertEqual(context['beginner_helpers'], helpers)
                        for kind in ['edge', 'corner']:
                            base = sticker_orders[kind] if mode == 'sticker' else piece_orders[kind]
                            normalize = (lambda value: value) if mode == 'sticker' else (lambda value: ''.join(sorted(value)))
                            selected = {normalize(value) for value in helpers[kind]}
                            expected = sorted(base, key=lambda value: normalize(value) not in selected) if enabled else base
                            if mode == 'sticker':
                                self.assertEqual(trace.call_args.kwargs[f'{kind}_sticker_cycle_break_order'], expected)
                                self.assertEqual(context['sticker_orders'][kind], base)
                            else:
                                expected_ids = [piece_orders[kind].index(value) for value in expected]
                                for parity in ['even', 'odd']:
                                    self.assertEqual(trace.call_args.kwargs[f'{kind}_{parity}_cycle_break_order'], expected_ids)
                                self.assertEqual(context[f'{kind}_break_order'], base)

    def test_rejects_unknown_helpers(self):
        for kind in ['edge', 'corner']:
            with patch('app._trace_scramble') as trace:
                response = app.test_client().post('/beginner', data={
                    'scramble': 'R', f'beginner_{kind}_helpers': ['invalid'], 'beginner_prioritize_helpers': 'on'})
            trace.assert_not_called()
            self.assertIn(f'Invalid {kind} helper sticker.', response.get_data(as_text=True))

    def test_helpers_are_beginner_only(self):
        self.assertIn('id="beginner-prioritize-helpers"', app.test_client().get('/beginner').get_data(as_text=True))
        self.assertNotIn('id="beginner-prioritize-helpers"', app.test_client().get('/expert').get_data(as_text=True))
