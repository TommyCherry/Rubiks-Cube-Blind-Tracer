import html
import json
import os
import unittest
from unittest.mock import patch
from scripts.draft_memo_dictionary import draft
from colpi import ColpiUnavailable


class DictionaryDraftTests(unittest.TestCase):
    def page(self, censored=True):
        payload = {'props': {'colpi': {'showOffensive': not censored, 'currentLangCode': 'en'},
            'grid': {'BY': {'t': 'boy, sample private phrase'}, 'KB': {'t': 'keyboard (QWERTY)'},
                     'GL': {'t': 'girl'}, 'XX': {'t': 'boy'}}}}
        return '<div data-page="' + html.escape(json.dumps(payload), quote=True) + '"></div>'

    def test_private_filter_review_status_and_shared_word_entries(self):
        with patch.dict(os.environ, MEMO_WORD_EXCLUSIONS='["sample private phrase"]'):
            result = draft(self.page(), {'boy': {'category': 'person'}})
        self.assertEqual(result['pairs']['BY'], ['boy'])
        self.assertEqual(result['pairs']['XX'], ['boy'])
        self.assertEqual(len(result['words']), 3)
        self.assertEqual(result['words']['girl']['review'], 'needed')
        self.assertEqual(result['words']['keyboard (qwerty)']['description'], None)
        self.assertNotIn('sample private phrase', json.dumps(result))

    def test_censorship_is_required(self):
        with self.assertRaises(ColpiUnavailable):
            draft(self.page(False), {})
