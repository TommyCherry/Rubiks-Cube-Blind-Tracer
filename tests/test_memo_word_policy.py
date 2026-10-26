import json
import os
import unittest
from unittest.mock import patch

import colpi
from memo_word_policy import excluded_memo_word, ranked_candidates
from test_memo_words import page


class MemoWordPolicyTests(unittest.TestCase):
    def setUp(self):
        # Fictional examples only; production exclusions must never enter Git.
        env = patch.dict(os.environ, MEMO_WORD_EXCLUSIONS=json.dumps(
            ['purple dragon', 'silver robot', "sample move (R U R' U')"]))
        env.start()
        self.addCleanup(env.stop)

    def test_configured_entries_and_formatting(self):
        for word in ('PURPLE DRAGON', 'Purple-Dragon', 'Ｐｕｒｐｌｅ Ｄｒａｇｏｎ',
                     'PurpleDragon', 'silver robot'):
            self.assertTrue(excluded_memo_word(word))
        for word in ('purple', 'dragon', 'purple dragonfly', 'silver robot toy', 'YAWN'):
            self.assertFalse(excluded_memo_word(word))

    def test_fallback_and_no_remaining_candidate(self):
        grid = {'PD': {'t': 'PURPLE DRAGON, PINK DOT'},
                'SR': {'t': 'SILVER ROBOT, PURPLE DRAGON'}}
        self.assertEqual(colpi.parse_suggestions(page(grid=grid)), {'PD': 'PINK DOT'})

    def test_parenthetical_context_stays_intact(self):
        text = "SAMPLE MOVE (R U R' U'), STAR"
        self.assertEqual(list(ranked_candidates(text)), ["SAMPLE MOVE (R U R' U')", 'STAR'])
        self.assertEqual(colpi.parse_suggestions(page(grid={'SM': {'t': text}})), {'SM': 'STAR'})

    def test_cached_words_are_checked_against_private_config(self):
        with patch.object(colpi, '_cache', {'PD': 'PURPLE DRAGON', 'YW': 'YAWN'}), patch.object(colpi, '_expires', float('inf')):
            self.assertEqual(colpi.suggestions_for(['PD', 'YW']), {'PD': None, 'YW': 'YAWN'})

    def test_missing_config_keeps_colpi_filter_without_extra_exclusions(self):
        with patch.dict(os.environ, {}, clear=True):
            self.assertFalse(excluded_memo_word('purple dragon'))

    def test_invalid_configuration_fails_without_echoing_values(self):
        for raw in ('private-invalid-value', '{}', '[123]', '[""]'):
            with patch.dict(os.environ, MEMO_WORD_EXCLUSIONS=raw):
                with self.assertRaises(ValueError) as error:
                    excluded_memo_word('word')
                self.assertNotIn(raw, str(error.exception))
