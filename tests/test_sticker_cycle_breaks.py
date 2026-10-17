import unittest
from unittest.mock import patch
import tempfile
from pathlib import Path

from Cube import Cube, format_edge_trace, format_corner_trace


class StickerCycleBreakTests(unittest.TestCase):
    def test_selected_sticker_rotates_entire_cycle_and_preserves_closing_twist(self):
        for kind, count, modulus, formatter in [
            ('edge', 12, 2, format_edge_trace), ('corner', 8, 3, format_corner_trace)
        ]:
            for opening in range(1, modulus):
                cube = Cube()
                perm = getattr(cube, kind + '_perm')
                ori = getattr(cube, kind + '_ori')
                perm[1], perm[2] = perm[2], perm[1]
                perm[3], perm[4] = perm[4], perm[3]
                ori[1], ori[3] = 1, modulus - 1
                trace = getattr(cube, 'trace_' + kind + 's')
                piece_order = [3, 1] + [p for p in range(count) if p not in (3, 1)]
                zero = trace(even_cycle_break_order=piece_order, odd_cycle_break_order=piece_order,
                             return_cycle_breaks=True, return_cycles=True)
                stickers = formatter([(p, o) for p in piece_order
                                      for o in [opening] + [i for i in range(modulus) if i != opening]])
                result = trace(sticker_cycle_break_order=stickers,
                               return_cycle_breaks=True, return_cycles=True)
                self.assertEqual(result[1], [3, 1])
                self.assertEqual(result[1], zero[1])
                self.assertEqual(result[0], [(p, (o + opening) % modulus) for p, o in zero[0]])
                self.assertEqual(result[2][0][0], (3, opening))
                # A misoriented cycle closes on a different sticker of the same piece.
                self.assertNotEqual(result[2][0][0][1], result[2][0][-1][1])

    def test_buffer_solved_and_visited_pieces_are_skipped(self):
        for kind, count, modulus, formatter in [
            ('edge', 12, 2, format_edge_trace), ('corner', 8, 3, format_corner_trace)
        ]:
            cube = Cube()
            perm = getattr(cube, kind + '_perm')
            perm[1], perm[2] = perm[2], perm[1]
            order = formatter([(p, o) for p in range(count) for o in reversed(range(modulus))])
            _, breaks, cycles = getattr(cube, 'trace_' + kind + 's')(
                sticker_cycle_break_order=order, return_cycle_breaks=True, return_cycles=True)
            self.assertEqual(breaks, [1])
            self.assertEqual(cycles[0][0], (1, modulus - 1))
            for invalid in [order[:-1], [order[0]] * len(order)]:
                with self.assertRaises(ValueError):
                    getattr(cube, 'trace_' + kind + 's')(sticker_cycle_break_order=invalid)

    def test_beginner_single_and_bulk_use_selected_stickers(self):
        from app import app, EDGE_TARGETS, CORNER_TARGETS
        def scramble(cube, _):
            for perm in (cube.edge_perm, cube.corner_perm):
                perm[1], perm[2] = perm[2], perm[1]
        edge = format_edge_trace([(1, 1)])[0]
        corner = format_corner_trace([(1, 2)])[0]
        data = {'scramble': 'R', 'bulk_scrambles': 'R', 'beginner_cycle_order_mode': 'sticker',
                'edge_sticker_cycle_break_order': [edge] + [s for s in EDGE_TARGETS if s != edge],
                'corner_sticker_cycle_break_order': [corner] + [s for s in CORNER_TARGETS if s != corner]}
        with tempfile.TemporaryDirectory() as directory, patch.dict(app.config, BULK_DATABASE=str(Path(directory) / 'bulk.sqlite3')):
            for action in ['single', 'bulk']:
                with patch('app.Cube.apply_scramble', scramble), patch('app.render_template', return_value='ok') as render:
                    response = app.test_client().post('/beginner', data=dict(data, action=action))
                self.assertEqual(response.status_code, 200)
                context = render.call_args.kwargs
                self.assertIsNone(context['error'])
                result = context['bulk_results'][0] if action == 'bulk' else context
                self.assertEqual(result['edge_cycles'][0][0], edge)
                self.assertEqual(result['corner_cycles'][0][0], corner)
                self.assertEqual(context['beginner_cycle_order_mode'], 'sticker')

    def test_beginner_rejects_invalid_sticker_orders(self):
        from app import app
        for kind in ['edge', 'corner']:
            with patch('app._trace_scramble') as trace:
                response = app.test_client().post('/beginner', data={
                    'scramble': 'R', 'beginner_cycle_order_mode': 'sticker',
                    f'{kind}_sticker_cycle_break_order': ['UF', 'UF']})
            trace.assert_not_called()
            self.assertIn(f'Invalid {kind} sticker cycle-break order.', response.get_data(as_text=True))
