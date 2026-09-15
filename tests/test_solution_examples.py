import contextlib
import io
import unittest
from unittest.mock import patch

import requests
from app import app, _trace_scramble
from blddb import edge_example, verifies_case
from Cube import SPEFFZ

ALG = "L2 U L2 S' L2 S U' L2"
ALGORITHMS = {'ACE': [[[ALG], ['BLDDB contributor']]]}
STANDARD = {'ACE': 'ACE', 'CEA': 'ACE'}


class SolutionTests(unittest.TestCase):
    def test_direction_and_cyclic_buffers(self):
        self.assertTrue(verifies_case(['UF', 'UL', 'UB'], ALG))
        self.assertTrue(verifies_case(['UL', 'UB', 'UF'], ALG))
        self.assertFalse(verifies_case(['UF', 'UB', 'UL'], ALG))
        self.assertFalse(verifies_case(['UF', 'UL', 'UB'], ALG + ' R'))
        row = edge_example(['UL', 'UB', 'UF'], ALGORITHMS, STANDARD)
        self.assertEqual(row['algorithm'], ALG)

    def test_api_and_failures(self):
        client = app.test_client()
        with patch('app.dataset', side_effect=[ALGORITHMS, STANDARD]):
            response = client.post('/api/solution-examples', json={'cases': [['UF', 'UL', 'UB']]})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['examples'][0]['algorithm'], ALG)
        for cases in [None, [['UF', 'FU', 'UB']], [['UF', 'UB']], [['XX', 'UL', 'UB']]]:
            self.assertEqual(client.post('/api/solution-examples', json={'cases': cases}).status_code, 400)
        with patch('app.dataset', side_effect=requests.Timeout), patch.object(app.logger, 'warning'):
            self.assertEqual(client.post('/api/solution-examples', json={'cases': [['UF', 'UL', 'UB']]}).status_code, 503)

    def test_solution_pairs_follow_floating_segments(self):
        with contextlib.redirect_stdout(io.StringIO()):
            result = _trace_scramble('R U F', edge_buffer=0, corner_buffer=0,
                use_pseudoswap=False, pseudoswap_edge_1=0, pseudoswap_edge_2=2,
                floating_buffers=list(range(12)), letter_scheme=SPEFFZ)
        cases = result['solution_cases']
        self.assertEqual(sum(len(case['positions']) - 1 for case in cases), result['edge_count'])
        targets = result['edge_target_names']
        offset, buffer = 0, 'UF'
        from app import EDGE_BUFFER_OPTIONS
        for case in cases:
            for switch in result['edge_floating']:
                if switch['after_target'] == offset and 'to_buffer' in switch:
                    buffer = EDGE_BUFFER_OPTIONS[switch['to_buffer']]
            self.assertEqual(case['positions'][0], buffer)
            count = len(case['positions']) - 1
            self.assertEqual(case['positions'][1:], targets[offset:offset + count])
            offset += count

    def test_solution_section_on_both_modes(self):
        for route in ['/beginner', '/expert']:
            with contextlib.redirect_stdout(io.StringIO()):
                response = app.test_client().post(route, data={'scramble': 'R U'})
            self.assertEqual(response.status_code, 200)
            self.assertIn('id="solution-cases"', response.get_data(as_text=True))
