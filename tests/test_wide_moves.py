import unittest

from Cube import Cube


class WideMoveTests(unittest.TestCase):
    def assert_same_state(self, wide, outer):
        actual = Cube()
        actual.apply_scramble(wide)
        expected = Cube()
        expected.scramble(outer)
        self.assertEqual(actual.get_state(), expected.get_state())

    def test_reported_wide_commutator(self):
        # Follow the centers after each wide turn; restore the original
        # orientation for tracing. The stationary layers are L, B, D, R.
        self.assert_same_state("Rw Uw Rw' Uw'", "L B D' R'")

    def test_wide_turns_map_following_moves_to_the_correct_face(self):
        cases = [
            ("Rw U Rw'", "L F L'"),
            ("Lw U Lw'", "R B R'"),
            ("Uw R Uw'", "D B D'"),
            ("Dw R Dw'", "U F U'"),
            ("Fw U Fw'", "B L B'"),
            ("Bw U Bw'", "F R F'"),
            ("Rw' U Rw", "L' B L"),
            ("Lw' U Lw", "R' F R"),
            ("Rw2 U Rw2", "L2 D L2"),
        ]
        for wide, outer in cases:
            with self.subTest(wide=wide):
                self.assert_same_state(wide, outer)

    def test_inverse_and_four_quarter_turns(self):
        for face in 'URFDLB':
            for sequence in (f'{face}w {face}w\'',
                             ' '.join([f'{face}w'] * 4),
                             f'{face}w2 {face}w2'):
                with self.subTest(sequence=sequence):
                    self.assert_same_state(sequence, '')

    def test_invalid_wide_modifiers_raise_value_error(self):
        for move in ('Rw3', "Uw2'", 'Fww', 'Bwfoo'):
            with self.subTest(move=move), self.assertRaises(ValueError):
                Cube().apply_scramble(move)


if __name__ == '__main__':
    unittest.main()
