import unittest
from app import trace_scramble, PARITY_CASES, SPEFFZ, parity_case_groups, CORNER_BUFFER_OPTIONS, PARITY_CASE_KEYS
from Cube import UF, UR, UB, UL, UFR


class ParityOverrideTests(unittest.TestCase):
    def trace(self, **extra):
        settings = dict(edge_buffer=UF, corner_buffer=UFR, use_pseudoswap=True,
                        pseudoswap_edge_1=UF, pseudoswap_edge_2=UR,
                        floating_buffers=[], corner_floating_buffers=[], letter_scheme=SPEFFZ)
        settings.update(extra)
        return trace_scramble('R', **settings)

    def test_case_catalog(self):
        self.assertEqual([len(group['cases']) for group in PARITY_CASES], [21, 18, 15, 12, 9, 6, 3])
        keys = [case['key'] for group in PARITY_CASES for case in group['cases']]
        self.assertEqual(len(set(keys)), 84)

    def test_reordered_cases_and_primary(self):
        order = list(reversed(CORNER_BUFFER_OPTIONS))
        groups = parity_case_groups(order, 'UFL')
        expected = ['UFL'] + [name for name in order if name != 'UFL']
        self.assertEqual([group['buffer'] for group in groups], expected[:-1])
        self.assertEqual([len(group['cases']) for group in groups], [21, 18, 15, 12, 9, 6, 3])
        for index, group in enumerate(groups):
            self.assertEqual({case['piece'] for case in group['cases']}, set(expected[index + 1:]))
            self.assertTrue(all(case['key'] in PARITY_CASE_KEYS for case in group['cases']))
        self.assertEqual(len(PARITY_CASE_KEYS), 168)

    def test_override_matches_explicit_global_pair(self):
        baseline = self.trace()
        self.assertIsNotNone(baseline['parity_case'])
        override = self.trace(parity_pseudoswaps={baseline['parity_case']: [UB, UL]})
        self.assertEqual(override, self.trace(pseudoswap_edge_1=UB, pseudoswap_edge_2=UL))
        self.assertEqual(self.trace(parity_pseudoswaps={'unrelated': [UB, UL]}), baseline)

    def test_disabled_pseudoswap_ignores_override(self):
        key = self.trace()['parity_case']
        self.assertEqual(self.trace(use_pseudoswap=False, parity_pseudoswaps={key: [UB, UL]}),
                         self.trace(use_pseudoswap=False))

    def test_same_edge_rejected(self):
        key = self.trace()['parity_case']
        with self.assertRaises(ValueError):
            self.trace(parity_pseudoswaps={key: [UF, UF]})
