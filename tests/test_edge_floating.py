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

    def test_standalone_with_unresolved_buffer_flip_and_longer_cycles(self):
        for members in ([UL, FR, FL], [UL, FR, FL, DF, DB]):
            cube = Cube()
            cube.edge_perm[UF], cube.edge_perm[UB], cube.edge_perm[UR] = UB, UR, UF
            cube.edge_ori[UF] = 1
            for position, following in zip(members, members[1:] + members[:1]):
                cube.edge_perm[position] = following
            cube.edge_ori[DR] = 1
            before = cube.get_state()
            trace, breaks, cycles, switches = self.trace(
                cube, floating_buffers=list(range(12)), auto_standalone=True,
                return_cycle_breaks=True, return_cycles=True)
            self.assertEqual(trace[2:2 + len(members) - 1], [(p, 0) for p in members[1:]])
            self.assertNotIn(UL, breaks)
            self.assertEqual(breaks, [DR])
            self.assertEqual(trace[-2:], [(DR, 0), (DR, 1)])
            standalone = [item for item in switches if item.get('standalone')]
            self.assertEqual(standalone, [dict(after_target=2, from_buffer=UF, to_buffer=UL, standalone=True)])
            self.assertIn(dict(after_target=len(members) + 1, from_buffer=UL,
                               to_buffer=UF, standalone_return=True), switches)
            self.assertEqual(cube.get_state(), before)

    def test_standalone_requires_even_boundary_enabled_buffer_and_oriented_cycle(self):
        for variant in ('odd', 'disabled', 'misoriented'):
            cube = self.two_cycles()
            cube.edge_ori[UF] = 1
            buffers = list(range(12))
            if variant == 'odd':
                cube.edge_perm[UF], cube.edge_perm[UB], cube.edge_perm[UR] = UB, UF, UR
            elif variant == 'disabled':
                buffers.remove(UL)
            else:
                cube.edge_ori[UL] = 1
            _, switches = self.trace(cube, floating_buffers=buffers, auto_standalone=True)
            self.assertFalse(any(item.get('standalone') for item in switches))

    def test_reported_scramble_memo(self):
        from app import trace_scramble
        from Cube import UFR, SPEFFZ
        result = trace_scramble(
            "B2 U' R2 U L2 F2 D2 L2 U' R2 U' R2 L' B2 L B' R' U2 R' B2 U",
            edge_buffer=UF, corner_buffer=UFR, use_pseudoswap=False,
            pseudoswap_edge_1=UF, pseudoswap_edge_2=UB,
            floating_buffers=list(range(12)), corner_floating_buffers=list(range(8)),
            letter_scheme=SPEFFZ)
        self.assertEqual(result['edge_memo'], "[Buffer A] OK [Buffer D] HN [Flips: BM]")
        self.assertEqual(result['edge_count'], 4)
        self.assertEqual(result['edge_buffers_used'], 2)

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
