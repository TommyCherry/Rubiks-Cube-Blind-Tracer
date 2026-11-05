import json
from pathlib import Path
import shutil
import subprocess
import unittest

from app import app
from Cube import Cube


class BeginnerScrambleTests(unittest.TestCase):
    def test_selector_is_beginner_only_and_preserved_after_submit(self):
        client = app.test_client()
        self.assertIn('id="scramble-type"', client.get('/beginner').text)
        self.assertNotIn('id="scramble-type"', client.get('/expert').text)
        for mode in ('edges', 'corners'):
            html = client.post('/beginner', data={'scramble': 'R U', 'scramble_type': mode}).text
            self.assertIn(f'value="{mode}" selected', html)

    @unittest.skipUnless(shutil.which('node'), 'Node is needed for the bundled generator')
    def test_piece_only_scrambles_leave_other_pieces_solved(self):
        result = subprocess.run(['node', '-e', """
const generator = require('./static/cstimer_module.js');
generator.setSeed('beginner-piece-scrambles');
console.log(JSON.stringify(['edges', 'corners'].map(type =>
    [type, Array.from({length: 5}, () => generator.getScramble(type))])));
"""], cwd=Path(__file__).resolve().parents[1], capture_output=True,
            text=True, check=True, timeout=60)
        for mode, scrambles in json.loads(result.stdout):
            for scramble in scrambles:
                cube = Cube()
                cube.apply_scramble(scramble)
                self.assertFalse(cube.is_solved())
                untouched, size = ('corner', 8) if mode == 'edges' else ('edge', 12)
                self.assertEqual(getattr(cube, untouched + '_perm'), list(range(size)))
                self.assertEqual(getattr(cube, untouched + '_ori'), [0] * size)
