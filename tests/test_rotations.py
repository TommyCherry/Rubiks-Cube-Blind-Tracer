import unittest

from Cube import Cube


class RotationTests(unittest.TestCase):
    def assert_same_state(self, actual, expected):
        cubes = [Cube(), Cube()]
        for cube, scramble in zip(cubes, (actual, expected)):
            cube.apply_scramble(scramble)
        self.assertEqual(cubes[0].get_state(), cubes[1].get_state())

    def test_following_moves_use_rotated_frame(self):
        for rotation, faces in (
            ("x", "FRDBLU"), ("x'", "BRUFLD"), ("x2", "DRBULF"),
            ("y", "UBRDFL"), ("y'", "UFLDBR"), ("y2", "ULBDRF"),
            ("z", "LUFRDB"), ("z'", "RDFLUB"), ("z2", "DLFURB"),
        ):
            with self.subTest(rotation=rotation):
                self.assert_same_state(
                    f"{rotation} U R F D L B", " ".join(faces))

    def test_rotations_alone_and_trailing_rotations_preserve_state(self):
        for rotation in ("x", "y", "z", "x'", "y'", "z'", "x2", "y2", "z2"):
            with self.subTest(rotation=rotation):
                self.assert_same_state(rotation, "")
                self.assert_same_state(f"R U F {rotation}", "R U F")

    def test_composed_rotations_and_inverse(self):
        self.assert_same_state("x y U R F", "F U R")
        for axis in "xyz":
            self.assert_same_state(f"{axis} {axis}' R U F", "R U F")
            self.assert_same_state(f"{axis}2 {axis}2 R U F", "R U F")
            self.assert_same_state(" ".join([axis] * 4) + " R U F", "R U F")

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
