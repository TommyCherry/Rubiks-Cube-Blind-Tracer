import os
import unittest
from unittest.mock import patch

from colpi import parse_suggestions
from memo_word_familiarity import rank_candidates, familiarity
from test_memo_words import page


class FamiliarityTests(unittest.TestCase):
    def test_everyday_alternatives_beat_niche_names(self):
        words = parse_suggestions(page(grid={
            'QD': {'t': 'QUANDALE DINGLE, QUID, QUAD'},
            'PK': {'t': 'PIKACHU, PARK, POKEMON'},
            'GX': {'t': 'GALAXY, OPERA GX, GIGAMINX'},
        }))
        self.assertEqual(words, {'QD': 'QUAD', 'PK': 'PARK', 'GX': 'GALAXY'})

    def test_electric_eel_beats_xenon_when_provider_offers_it(self):
        self.assertEqual(rank_candidates(['XENON', 'XERO', 'ELECTRIC EEL'])[0], 'ELECTRIC EEL')
        self.assertEqual(rank_candidates(['XENON', 'XERO'])[0], 'XENON')

    def test_ties_unknowns_and_parenthetical_hints(self):
        self.assertEqual(rank_candidates(['mystery name', 'unreviewed phrase']), ['mystery name', 'unreviewed phrase'])
        self.assertEqual(rank_candidates(['CROW', 'KEYBOARD (QWERTY)']), ['CROW', 'KEYBOARD (QWERTY)'])
        self.assertEqual(familiarity(' keyboard (qwerty) '), familiarity('keyboard'))
        self.assertGreater(familiarity('apple box'), familiarity('abacus'))
        self.assertEqual(familiarity('chairs'), familiarity('chair'))

    def test_exclusions_are_applied_before_ranking_and_no_word_is_invented(self):
        with patch.dict(os.environ, MEMO_WORD_EXCLUSIONS='["park"]'):
            words = parse_suggestions(page(grid={'PK': {'t': 'PIKACHU, PARK, POKEMON'}}))
        self.assertEqual(words['PK'], 'PIKACHU')
        self.assertEqual(parse_suggestions(page(grid={'QD': {'t': 'QUID'}}))['QD'], 'QUID')
        with patch.dict(os.environ, MEMO_WORD_EXCLUSIONS='["park", "pikachu"]'):
            self.assertNotIn('PK', parse_suggestions(page(grid={'PK': {'t': 'PIKACHU, PARK'}})))
