import contextlib
import io
import unittest

from Cube import Cube, UFR, UFL, UBR, UBL, DFR, DFL, DBR, DBL


class CornerFloatingTests(unittest.TestCase):
    def trace(self, cube, **kwargs):
        with contextlib.redirect_stdout(io.StringIO()):
            return cube.trace_corners(return_floating=True, **kwargs)

    def cycles(self):
        cube = Cube()
        cube.corner_perm[UFR], cube.corner_perm[UFL], cube.corner_perm[UBR] = UFL, UBR, UFR
        cube.corner_perm[UBL], cube.corner_perm[DFR], cube.corner_perm[DFL] = DFR, DFL, UBL
        return cube

    def test_switch_removes_bookends_and_preserves_cube(self):
        cube = self.cycles()
        before = cube.get_state()
        trace, breaks, cycles, switches = self.trace(
            cube, floating_buffers=[UFR, DFR, UBL],
            return_cycles=True, return_cycle_breaks=True)
        self.assertEqual(trace, [(UFL, 0), (UBR, 0), (DFL, 0), (UBL, 0)])
        self.assertEqual(breaks, [])
        self.assertEqual(cycles, [trace[:2], trace[2:]])
        self.assertEqual(switches, [dict(after_target=2, from_buffer=UFR, to_buffer=DFR)])
        self.assertEqual(cube.get_state(), before)

    def test_repeated_switches(self):
        cube = self.cycles()
        cube.corner_perm[DBR], cube.corner_perm[DBL] = DBL, DBR
        trace, switches = self.trace(cube, floating_buffers=[UFR, UBL, DBR])
        self.assertEqual([item['to_buffer'] for item in switches], [UBL, DBR])
        self.assertEqual([item['after_target'] for item in switches], [2, 4])
        self.assertEqual(len(trace), 5)

    def test_solved_primary_can_switch_at_zero(self):
        cube = Cube()
        cube.corner_perm[UBL], cube.corner_perm[DFR], cube.corner_perm[DFL] = DFR, DFL, UBL
        trace, switches = self.trace(cube, floating_buffers=[UFR, UBL])
        self.assertEqual(switches, [dict(after_target=0, from_buffer=UFR, to_buffer=UBL)])
        self.assertEqual(len(trace), 2)

    def test_twisted_or_odd_buffer_cannot_switch(self):
        twisted = self.cycles()
        twisted.corner_ori[UFR] = 1
        twisted.corner_ori[UBL] = 2
        odd = Cube()
        odd.corner_perm[UFR], odd.corner_perm[UFL] = UFL, UFR
        odd.corner_perm[UBL], odd.corner_perm[DFR] = DFR, UBL
        for cube in (twisted, odd):
            with self.subTest(state=cube.get_state()):
                _, switches = self.trace(cube, floating_buffers=[UFR, UBL])
                self.assertFalse(any('to_buffer' in item for item in switches))

    def test_disabled_and_prior_buffers_preserve_fixed_trace(self):
        cube = self.cycles()
        self.assertEqual(self.trace(cube), self.trace(cube, floating_buffers=[]))
        self.assertEqual(self.trace(cube), self.trace(cube, floating_buffers=[UBL, UFR]))

    def test_twisted_new_buffer_blocks_another_switch(self):
        cube = self.cycles()
        cube.corner_perm[DBR], cube.corner_perm[DBL] = DBL, DBR
        cube.corner_ori[UBL] = 1
        cube.corner_ori[DBR] = 2
        _, switches = self.trace(cube, floating_buffers=[UFR, UBL, DBR])
        self.assertEqual([item['to_buffer'] for item in switches if 'to_buffer' in item], [UBL])


if __name__ == '__main__':
    unittest.main()
