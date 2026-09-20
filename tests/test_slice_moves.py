import unittest

from Cube import Cube


class SliceMoveTests(unittest.TestCase):
    def assert_same_state(self, actual, expected):
        cubes = [Cube(), Cube()]
        for cube, scramble in zip(cubes, (actual, expected)):
            cube.apply_scramble(scramble)
        self.assertEqual(cubes[0].get_state(), cubes[1].get_state())

    def test_definitions_preserve_following_move_frame(self):
        definitions = {
            'E': "Uw' U", "E'": "Uw U'",
            'M': "Rw' R", "M'": "Rw R'",
            'S': "Fw F'", "S'": "Fw' F",
        }
        for move, expansion in definitions.items():
            for prefix in ('', "Rw Uw' F "):
                with self.subTest(move=move, prefix=prefix):
                    self.assert_same_state(prefix + move + ' R U F',
                                           prefix + expansion + ' R U F')

    def test_inverse_and_double_turns(self):
        for face in 'EMS':
            with self.subTest(face=face):
                self.assert_same_state(f"{face} {face}'", '')
                self.assert_same_state(f'{face}2 R U', f'{face} {face} R U')
                self.assert_same_state(' '.join([face] * 4), '')

    def test_invalid_modifiers(self):
        for move in ('E3', "M2'", 'Sw', 'SS'):
            with self.subTest(move=move), self.assertRaises(ValueError):
                Cube().apply_scramble(move)


if __name__ == '__main__':
    unittest.main()
