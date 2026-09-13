import unittest
from Cube import Cube


class CycleBreakOrderTests(unittest.TestCase):
    def test_even_order_changes_first_break_for_both_piece_types(self):
        for kind, count in [('edge', 12), ('corner', 8)]:
            cube = Cube()
            perm = getattr(cube, kind + '_perm')
            perm[1], perm[2] = perm[2], perm[1]
            perm[3], perm[4] = perm[4], perm[3]
            order = [3] + [i for i in range(count) if i != 3]
            _, breaks = getattr(cube, 'trace_' + kind + 's')(
                return_cycle_breaks=True, even_cycle_break_order=order)
            self.assertEqual(breaks[0], 3)

    def test_odd_target_count_uses_standard_order(self):
        for kind, count in [('edge', 12), ('corner', 8)]:
            cube = Cube()
            perm = getattr(cube, kind + '_perm')
            for a, b in [(0, 1), (2, 3), (4, 5)]:
                perm[a], perm[b] = perm[b], perm[a]
            trace = getattr(cube, 'trace_' + kind + 's')
            standard = trace(return_cycle_breaks=True)[1][0]
            alternate = 4 if standard != 4 else 2
            order = [alternate] + [i for i in range(count) if i != alternate]
            self.assertEqual(trace(return_cycle_breaks=True, even_cycle_break_order=order)[1][0], standard)

    def test_invalid_order_rejected(self):
        for kind in ['edges', 'corners']:
            with self.assertRaises(ValueError):
                getattr(Cube(), 'trace_' + kind)(even_cycle_break_order=[0, 0])

    def test_submitted_odd_orders_drive_single_and_bulk_traces(self):
        import tempfile
        from pathlib import Path
        from unittest.mock import patch
        from app import app, EDGE_BUFFER_OPTIONS, CORNER_BUFFER_OPTIONS

        def setup(cube, scramble):
            for perm in (cube.edge_perm, cube.corner_perm):
                for a, b in [(0, 1), (2, 3), (4, 5)]:
                    perm[a], perm[b] = perm[b], perm[a]

        data = {'scramble': 'R', 'bulk_scrambles': 'R'}
        for kind, options in [('edge', EDGE_BUFFER_OPTIONS), ('corner', CORNER_BUFFER_OPTIONS)]:
            data[kind + '_odd_cycle_break_order'] = [options[4]] + [name for i, name in enumerate(options) if i != 4]
        with tempfile.TemporaryDirectory() as directory, patch.dict(app.config, BULK_DATABASE=str(Path(directory) / 'test.sqlite3')):
            for action in ['single', 'bulk']:
                with patch('app.Cube.apply_scramble', setup), patch('app.render_template', return_value='ok') as render:
                    response = app.test_client().post('/', data=dict(data, action=action))
                self.assertEqual(response.status_code, 200)
                context = render.call_args.kwargs
                row = context['bulk_results'][0] if action == 'bulk' else context
                self.assertEqual(row['edge_cycle_breaks'][0], EDGE_BUFFER_OPTIONS[4])
                self.assertEqual(row['corner_cycle_breaks'][0], CORNER_BUFFER_OPTIONS[4])
                self.assertEqual(context['odd_break_orders']['edge'], data['edge_odd_cycle_break_order'])

    def test_odd_order_ignored_at_even_boundary(self):
        for kind, count in [('edge', 12), ('corner', 8)]:
            cube = Cube()
            perm = getattr(cube, kind + '_perm')
            for a, b in [(1, 2), (3, 4)]:
                perm[a], perm[b] = perm[b], perm[a]
            trace = getattr(cube, 'trace_' + kind + 's')
            baseline = trace(return_cycle_breaks=True)[1]
            changed = trace(return_cycle_breaks=True, odd_cycle_break_order=list(reversed(range(count))))[1]
            self.assertEqual(baseline[0], changed[0])
            # The first cycle adds three targets: the next break must use odd order.
            self.assertNotEqual(baseline[1], changed[1])

    def test_submitted_even_orders_drive_single_and_bulk_traces(self):
        import tempfile
        from pathlib import Path
        from unittest.mock import patch
        from app import app, EDGE_BUFFER_OPTIONS, CORNER_BUFFER_OPTIONS

        def setup(cube, scramble):
            for perm in (cube.edge_perm, cube.corner_perm):
                perm[0], perm[1], perm[2] = 1, 2, 0
                for a, b in [(3, 4), (5, 6)]:
                    perm[a], perm[b] = perm[b], perm[a]

        data = {'scramble': 'R', 'bulk_scrambles': 'R'}
        for kind, options in [('edge', EDGE_BUFFER_OPTIONS), ('corner', CORNER_BUFFER_OPTIONS)]:
            data[kind + '_even_cycle_break_order'] = [options[5]] + [name for i, name in enumerate(options) if i != 5]
        with tempfile.TemporaryDirectory() as directory, patch.dict(app.config, BULK_DATABASE=str(Path(directory) / 'test.sqlite3')):
            for action in ['single', 'bulk']:
                with patch('app.Cube.apply_scramble', setup), patch('app.render_template', return_value='ok') as render:
                    response = app.test_client().post('/', data=dict(data, action=action))
                self.assertEqual(response.status_code, 200)
                context = render.call_args.kwargs
                row = context['bulk_results'][0] if action == 'bulk' else context
                self.assertEqual(row['edge_cycle_breaks'][0], EDGE_BUFFER_OPTIONS[5])
                self.assertEqual(row['corner_cycle_breaks'][0], CORNER_BUFFER_OPTIONS[5])
                self.assertEqual(context['edge_break_order'], data['edge_even_cycle_break_order'])


    def test_even_order_skips_buffer_solved_and_visited_pieces(self):
        for kind, count in [('edge', 12), ('corner', 8)]:
            with self.subTest(kind=kind):
                cube = Cube()
                perm = getattr(cube, kind + '_perm')
                perm[0], perm[1], perm[2] = 1, 2, 0
                perm[3], perm[4] = 4, 3
                perm[5], perm[6] = 6, 5
                # 0 is the buffer, 7 is solved, and 1/2 were already traced.
                order = [0, 7, 1, 2, 5, 6, 3, 4] + list(range(8, count))
                before = cube.get_state()
                targets, breaks = getattr(cube, 'trace_' + kind + 's')(
                    return_cycle_breaks=True, even_cycle_break_order=order)
                self.assertEqual(targets[:3], [(1, 0), (2, 0), (5, 0)])
                self.assertEqual(breaks[0], 5)
                self.assertEqual(cube.get_state(), before)

    def test_switches_from_odd_to_even_priority_after_cycle(self):
        for kind, count in [('edge', 12), ('corner', 8)]:
            with self.subTest(kind=kind):
                cube = Cube()
                perm = getattr(cube, kind + '_perm')
                for a, b in [(0, 1), (2, 3), (4, 5), (6, 7)]:
                    perm[a], perm[b] = perm[b], perm[a]
                even_order = [6] + [i for i in range(count) if i != 6]
                odd_order = [2] + [i for i in range(count) if i != 2]
                targets, breaks = getattr(cube, 'trace_' + kind + 's')(
                    return_cycle_breaks=True, even_cycle_break_order=even_order,
                    odd_cycle_break_order=odd_order)
                # One buffer target, then a three-target cycle => four targets.
                self.assertEqual(targets[:5], [(1, 0), (2, 0), (3, 0), (2, 0), (6, 0)])
                self.assertEqual(breaks[:2], [2, 6])

    def test_target_override_uses_oriented_unpaired_sticker(self):
        from Cube import format_edge_trace, format_corner_trace
        for kind, count, formatter in [('edge', 12, format_edge_trace), ('corner', 8, format_corner_trace)]:
            for orientation in (0, 1):
                with self.subTest(kind=kind, orientation=orientation):
                    cube = Cube()
                    perm = getattr(cube, kind + '_perm')
                    ori = getattr(cube, kind + '_ori')
                    for a, b in [(0, 1), (2, 3), (4, 5)]:
                        perm[a], perm[b] = perm[b], perm[a]
                    ori[0] = orientation
                    ori[1] = orientation if kind == 'edge' else (-orientation) % 3
                    trace = getattr(cube, 'trace_' + kind + 's')
                    baseline, breaks = trace(return_cycle_breaks=True)
                    target = formatter([baseline[0]])[0]
                    order = [4] + [i for i in range(count) if i != 4]
                    changed = trace(return_cycle_breaks=True, odd_cycle_break_overrides={target: order})
                    self.assertEqual(changed[1][0], 4)
                    other_sticker = formatter([(1, (baseline[0][1] + 1) % (2 if kind == 'edge' else 3))])[0]
                    self.assertEqual(trace(return_cycle_breaks=True, odd_cycle_break_overrides={other_sticker: order}), (baseline, breaks))

    def test_target_override_form_applies_in_bulk(self):
        import tempfile
        from pathlib import Path
        from unittest.mock import patch
        from app import app, EDGE_BUFFER_OPTIONS, CORNER_BUFFER_OPTIONS
        from Cube import format_edge_trace, format_corner_trace
        def setup(cube, scramble):
            for perm in (cube.edge_perm, cube.corner_perm):
                for a, b in [(0, 1), (2, 3), (4, 5)]:
                    perm[a], perm[b] = perm[b], perm[a]
        data = dict(action='bulk', bulk_scrambles='R')
        for kind, options, formatter in [('edge', EDGE_BUFFER_OPTIONS, format_edge_trace), ('corner', CORNER_BUFFER_OPTIONS, format_corner_trace)]:
            key = f'{kind}_odd_override_{formatter([(1, 0)])[0]}'
            data[key + '_enabled'] = 'on'
            data[key] = [options[4]] + [name for i, name in enumerate(options) if i != 4]
        with tempfile.TemporaryDirectory() as directory, patch.dict(app.config, BULK_DATABASE=str(Path(directory) / 'test.sqlite3')):
            with patch('app.Cube.apply_scramble', setup), patch('app.render_template', return_value='ok') as render:
                app.test_client().post('/', data=data)
        row = render.call_args.kwargs['bulk_results'][0]
        self.assertEqual(row['edge_cycle_breaks'][0], EDGE_BUFFER_OPTIONS[4])
        self.assertEqual(row['corner_cycle_breaks'][0], CORNER_BUFFER_OPTIONS[4])
