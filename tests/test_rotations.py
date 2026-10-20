import unittest

from Cube import Cube


class RotationTests(unittest.TestCase):
    def assert_same_state(self, actual, expected):
        cubes = [Cube(), Cube()]
        for cube, scramble in zip(cubes, (actual, expected)):
            cube.apply_scramble(scramble)
        self.assertEqual(cubes[0].get_state(), cubes[1].get_state())

    def test_trailing_rotations_change_memo_frame(self):
        for rotation, faces in (
            ("x", "BRUFLD"), ("x'", "FRDBLU"), ("x2", "DRBULF"),
            ("y", "UFLDBR"), ("y'", "UBRDFL"), ("y2", "ULBDRF"),
            ("z", "RDFLUB"), ("z'", "LUFRDB"), ("z2", "DLFURB"),
        ):
            for face, expected in zip("URFDLB", faces):
                for suffix in ("", "'", "2"):
                    with self.subTest(rotation=rotation, face=face, suffix=suffix):
                        self.assert_same_state(f"{face}{suffix} {rotation}", expected + suffix)

    def test_rotations_alone_keep_cube_solved(self):
        for rotation in ("x", "y", "z", "x'", "y'", "z'", "x2", "y2", "z2"):
            with self.subTest(rotation=rotation):
                self.assert_same_state(rotation, "")
                self.assert_same_state(f"{rotation} U R F D L B", "U R F D L B")

    def test_composed_rotations_and_inverse(self):
        self.assert_same_state("x y U R F", "U R F")
        self.assert_same_state("U x y", "R")
        self.assert_same_state("U x R", "B R")
        self.assert_same_state("x U x'", "F")
        for axis in "xyz":
            self.assert_same_state(f"{axis} {axis}' R U F", "R U F")
            self.assert_same_state(f"{axis}2 {axis}2 R U F", "R U F")
            self.assert_same_state(" ".join([axis] * 4) + " R U F", "R U F")

    def test_rotating_existing_state_matches_one_scramble(self):
        actual = Cube()
        actual.apply_scramble("R U F2 L' D")
        actual.apply_scramble("x y' z2")
        expected = Cube()
        expected.apply_scramble("R U F2 L' D x y' z2")
        self.assertEqual(actual.get_state(), expected.get_state())

    def test_rotations_mix_with_wide_and_slice_turns(self):
        for axis, wide, opposite in (("x", "Rw", "L"), ("y", "Uw", "D"), ("z", "Fw", "B")):
            for suffix in ("", "'", "2"):
                with self.subTest(axis=axis, suffix=suffix):
                    inverse = {"": "'", "'": "", "2": "2"}[suffix]
                    self.assert_same_state(
                        f"Fw M {axis}{suffix} R Uw E S F",
                        f"Fw M {wide}{suffix} {opposite}{inverse} R Uw E S F")

    def test_invalid_rotation_modifiers(self):
        for move in ("x3", "y2'", "zw", "xx", "zfoo"):
            with self.subTest(move=move), self.assertRaises(ValueError):
                Cube().apply_scramble(move)


if __name__ == "__main__":
    unittest.main()
