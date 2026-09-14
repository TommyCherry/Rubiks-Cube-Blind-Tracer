import json
import random
import shutil
import subprocess
import unittest
from pathlib import Path

from app import app
from Cube import Cube
from conjugacy import generate_state, parse_class, to_facelets

ROOT = Path(__file__).resolve().parents[1]


class PracticeTests(unittest.TestCase):
    def test_invalid_classes(self):
        for text in [None, '', 'hello', '3e junk', '0e', '13e', '9c', '8e8e',
                     "1e'", "3c'", '2e', '2c', '3e3e3e3e1e', '1' * 201]:
            with self.subTest(text=text), self.assertRaises(ValueError):
                parse_class(text)

    def test_sampling_legality_and_variation(self):
        rng = random.Random(7)
        for text in ["3e3e'1e' 3c", '12e8c', "1e'1e'1c'1c'", "3c'3c'1c'", '2e2c', '1e1c']:
            states = set()
            for _ in range(30):
                cube = generate_state(text, rng)
                states.add(cube.get_state())
                self.assertEqual(sorted(cube.edge_perm), list(range(12)))
                self.assertEqual(sorted(cube.corner_perm), list(range(8)))
                self.assertEqual(sum(cube.edge_ori) % 2, 0)
                self.assertEqual(sum(cube.corner_ori) % 3, 0)
                corner_parity = sum(cube.corner_perm[i] > cube.corner_perm[j]
                                    for i in range(8) for j in range(i + 1, 8)) % 2
                self.assertEqual(cube.has_parity(), bool(corner_parity))
            if text != '1e1c':
                self.assertGreater(len(states), 1)
        self.assertEqual(generate_state(" 3E 3e’ 1e′ 3C ", rng).conjugacy_class(), "3e3e'1e' 3c")

    @unittest.skipUnless(shutil.which('node'), 'Node is needed to test the bundled browser solver')
    def test_solver_roundtrip_and_api_verification(self):
        client = app.test_client()
        targets = []
        for text in ["3e3e'1e' 3c", '12e8c', "1e'1e'1c'1c'", "3c'3c'1c'", '2e2c'] * 3:
            response = client.post('/api/conjugacy-state', json={'conjugacy_class': text})
            self.assertEqual(response.status_code, 200)
            targets.append(response.json)
        # Exercise all basic moves as well as complex mixed orientations.
        cubes = []
        for moves in ['U', 'R', 'F', 'D', 'L', 'B', "R F U2 L B' D R2"]:
            cube = Cube()
            cube.apply_scramble(moves)
            cubes.append(cube)
        js = """
const solver = require('./static/cstimer_module.js');
let input = '';
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => console.log(JSON.stringify(
    JSON.parse(input).map(state => solver.solveFacelets(state)))));
"""
        result = subprocess.run(['node', '-e', js], cwd=ROOT, text=True,
                                input=json.dumps([t['facelets'] for t in targets] + [to_facelets(c) for c in cubes]),
                                capture_output=True, check=True, timeout=60)
        solutions = json.loads(result.stdout)
        for target, solution in zip(targets, solutions):
            self.assertNotIn('Error', solution)
            moves = solution.split()
            scramble = ' '.join(move if move.endswith('2') else move[:-1] if move.endswith("'") else move + "'"
                                for move in reversed(moves))
            response = client.post('/api/conjugacy-verify', json={'token': target['token'], 'scramble': scramble})
            self.assertEqual(response.status_code, 200, response.json)
            self.assertEqual(response.json['conjugacy_class'], target['conjugacy_class'])
        for cube, solution in zip(cubes, solutions[len(targets):]):
            cube.apply_scramble(solution)
            self.assertTrue(cube.is_solved())

    def test_api_rejects_invalid_and_mismatched_requests(self):
        client = app.test_client()
        for payload in [[], {}, {'conjugacy_class': '1e'}, {'conjugacy_class': "1e'"}]:
            self.assertEqual(client.post('/api/conjugacy-state', json=payload).status_code, 400)
        target = client.post('/api/conjugacy-state', json={'conjugacy_class': '3e'}).json
        for payload in [[], {}, {'token': 'invalid', 'scramble': 'U'},
                        {'token': target['token'], 'scramble': 'U'},
                        {'token': target['token'], 'scramble': 'invalid'}]:
            self.assertEqual(client.post('/api/conjugacy-verify', json=payload).status_code, 400)
