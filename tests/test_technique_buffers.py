import unittest
from unittest.mock import patch
from app import trace_scramble, SPEFFZ
from Cube import UF, UR, UB, UL, UFR, UFL, UBR, UBL, DFR, DFL, DBR, DBL


class TechniqueBufferTests(unittest.TestCase):
    def trace(self, buffer, **extra):
        settings = dict(edge_buffer=UF, corner_buffer=buffer, use_pseudoswap=False,
                        pseudoswap_edge_1=UF, pseudoswap_edge_2=UR,
                        floating_buffers=[], corner_floating_buffers=[], letter_scheme=SPEFFZ,
                        include_ltct=True, include_t2c=True)
        settings.update(extra)
        return trace_scramble('R', **settings)

    def test_ltct_overrides_each_upper_buffer_swap(self):
        for buffer, swap in [(UFL, [UF, UL]), (UBR, [UB, UR]), (UBL, [UB, UL])]:
            def setup(cube, scramble):
                cube.edge_perm[UF], cube.edge_perm[UR] = UR, UF
                cube.corner_perm[buffer], cube.corner_perm[DFR] = DFR, buffer
                cube.corner_ori[buffer] = 2
                cube.corner_ori[DFL] = 1
            with self.subTest(buffer=buffer), patch('app.Cube.apply_scramble', setup):
                result = self.trace(buffer)
                self.assertTrue(result['ltct_active'])
                self.assertEqual(result['effective_pseudoswap_edges'], swap)

    def test_d_layer_matches_ordinary_tracing(self):
        for buffer in (DFR, DFL, DBR, DBL):
            with self.subTest(buffer=buffer):
                result = self.trace(buffer)
                self.assertFalse(result['ltct_active'])
                self.assertFalse(result['t2c_active'])
                self.assertEqual(result, self.trace(buffer, include_ltct=False, include_t2c=False))

    def test_t2c_overrides_upper_buffer_swap(self):
        for buffer, swap in [(UFL, [UF, UL]), (UBR, [UB, UR]), (UBL, [UB, UL])]:
            def setup(cube, scramble):
                cube.edge_perm[UF], cube.edge_perm[UR] = UR, UF
                cube.corner_perm[DFR], cube.corner_perm[DFL] = DFL, DFR
                cube.corner_ori[DFR] = 1
                cube.corner_ori[buffer] = 2
            with self.subTest(buffer=buffer), patch('app.Cube.apply_scramble', setup):
                result = self.trace(buffer, include_ltct=False)
                self.assertTrue(result['t2c_active'])
                self.assertEqual(result['effective_pseudoswap_edges'], swap)
