import contextlib
import io
import unittest

from Cube import Cube, UF, UB, UR, UL, FR, FL, DF, DB, DR


class EdgeFloatingTests(unittest.TestCase):
    def trace(self, cube, **kwargs):
        with contextlib.redirect_stdout(io.StringIO()):
            return cube.trace_edges(return_floating=True, **kwargs)

    def two_cycles(self):
        cube = Cube()
        cube.edge_perm[UF], cube.edge_perm[UB], cube.edge_perm[UR] = UB, UR, UF
        cube.edge_perm[UL], cube.edge_perm[FR], cube.edge_perm[FL] = FR, FL, UL
        return cube

    def test_switch_uses_priority_and_omits_cycle_break_bookends(self):
        cube = self.two_cycles()
        before = cube.get_state()
        trace, breaks, cycles, opportunities = self.trace(
            cube, floating_buffers=[UF, UB, DF, FR, UL],
            return_cycle_breaks=True, return_cycles=True,
        )
        self.assertEqual(trace, [(UB, 0), (UR, 0), (FL, 0), (UL, 0)])
        self.assertEqual(breaks, [])
        self.assertEqual(cycles, [trace[:2], trace[2:]])
        self.assertEqual(opportunities, [
            {'after_target': 2, 'from_buffer': UF, 'to_buffer': FR}
        ])
        self.assertEqual(cube.get_state(), before)

    def test_no_eligible_later_buffer_preserves_trace(self):
        cube = self.two_cycles()
        self.assertEqual(self.trace(cube, floating_buffers=[FR, UF, UB, DF]),
                         self.trace(cube))
        self.assertEqual(self.trace(cube, floating_buffers=[]), self.trace(cube))

    def test_repeated_switches(self):
        cube = self.two_cycles()
        cube.edge_perm[DF], cube.edge_perm[DB], cube.edge_perm[DR] = DB, DR, DF
        trace, breaks, cycles, opportunities = self.trace(
            cube, floating_buffers=[UF, UL, DF],
            return_cycle_breaks=True, return_cycles=True,
        )
        self.assertEqual(trace, [(UB, 0), (UR, 0), (FR, 0), (FL, 0),
                                 (DB, 0), (DR, 0)])
        self.assertEqual(breaks, [])
        self.assertEqual(opportunities, [
            {'after_target': 2, 'from_buffer': UF, 'to_buffer': UL},
            {'after_target': 4, 'from_buffer': UL, 'to_buffer': DF},
        ])

    def test_exhausted_buffers_continue_with_cycle_breaks(self):
        cube = self.two_cycles()
        cube.edge_perm[DF], cube.edge_perm[DB], cube.edge_perm[DR] = DB, DR, DF
        trace, breaks, cycles, opportunities = self.trace(
            cube, floating_buffers=[UF, UL],
            return_cycle_breaks=True, return_cycles=True,
        )
        self.assertEqual(trace[-4:], [(DF, 0), (DB, 0), (DR, 0), (DF, 0)])
        self.assertEqual(breaks, [DF])
        self.assertEqual(sum('to_buffer' in item for item in opportunities), 1)

    def test_new_buffer_with_odd_cycle_cannot_switch(self):
        cube = self.two_cycles()
        cube.edge_perm[UL], cube.edge_perm[FR], cube.edge_perm[FL] = FR, UL, FL
        cube.edge_perm[DF], cube.edge_perm[DB] = DB, DF
        _, opportunities = self.trace(cube, floating_buffers=[UF, UL, DF])
        self.assertEqual(sum('to_buffer' in item for item in opportunities), 1)

    def test_new_buffer_must_be_oriented_before_switching(self):
        cube = self.two_cycles()
        cube.edge_ori[UL] = 1
        cube.edge_ori[DF] = 1
        cube.edge_perm[DB], cube.edge_perm[DR] = DR, DB
        _, opportunities = self.trace(cube, floating_buffers=[UF, UL, DB])
        self.assertEqual(opportunities, [
            {'after_target': 2, 'from_buffer': UF, 'to_buffer': UL},
            {'after_target': 6, 'from_buffer': UL, 'to_buffer': DB},
        ])

    def test_switch_from_initially_solved_buffer(self):
        cube = Cube()
        cube.edge_perm[UB], cube.edge_perm[UR], cube.edge_perm[UL] = UR, UL, UB
        trace, opportunities = self.trace(cube, floating_buffers=[UB])
        self.assertEqual(trace, [(UR, 0), (UL, 0)])
        self.assertEqual(opportunities[0]['after_target'], 0)
        self.assertEqual(opportunities[0]['to_buffer'], UB)

    def test_invalid_floating_buffers_rejected(self):
        for buffers in ([12], [-1], ['UF'], [UB, UB]):
            with self.subTest(buffers=buffers), self.assertRaises(ValueError):
                self.trace(Cube(), floating_buffers=buffers)

    def test_opportunity_before_last_remaining_cycle(self):
        cube = Cube()
        cube.edge_perm[UF], cube.edge_perm[UB], cube.edge_perm[UR] = UB, UR, UF
        cube.edge_perm[UL], cube.edge_perm[FR], cube.edge_perm[FL] = FR, FL, UL
        before = cube.get_state()
        trace, opportunities = self.trace(cube)
        self.assertEqual(opportunities, [{'after_target': 2}])
        self.assertEqual(trace, [(UB, 0), (UR, 0), (UL, 0), (FR, 0), (FL, 0), (UL, 0)])
        self.assertEqual(cube.get_state(), before)

    def test_solved_starting_buffer_can_float_immediately(self):
        cube = Cube()
        cube.edge_perm[UB], cube.edge_perm[UR], cube.edge_perm[UL] = UR, UL, UB
        self.assertEqual(self.trace(cube)[1], [{'after_target': 0}])

    def test_no_opportunity_without_remaining_work(self):
        cube = Cube()
        cube.edge_perm[UF], cube.edge_perm[UB], cube.edge_perm[UR] = UB, UR, UF
        self.assertEqual(self.trace(cube)[1], [])
        self.assertEqual(self.trace(Cube())[1], [])

    def test_odd_target_count_cannot_float(self):
        cube = Cube()
        cube.edge_perm[UF], cube.edge_perm[UB] = UB, UF
        cube.edge_perm[UR], cube.edge_perm[UL] = UL, UR
        self.assertEqual(self.trace(cube)[1], [])

    def test_flipped_buffer_cannot_float_until_oriented(self):
        cube = Cube()
        cube.edge_perm[UF], cube.edge_perm[UB], cube.edge_perm[UR] = UB, UR, UF
        cube.edge_ori[UF] = 1
        cube.edge_ori[UL] = 1
        cube.edge_perm[FR], cube.edge_perm[FL] = FL, FR
        self.assertEqual(self.trace(cube)[1], [{'after_target': 4}])


if __name__ == '__main__':
    unittest.main()
