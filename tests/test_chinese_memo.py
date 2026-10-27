import unittest
from unittest.mock import patch
from app import app
from chinese_memo import ENTRIES


class ChineseMemoTests(unittest.TestCase):
    def test_workbook_lookup_without_colpi(self):
        self.assertEqual(len(ENTRIES), 506)
        with patch('app.suggestions_for') as colpi, patch.dict('os.environ', {'MEMO_WORD_EXCLUSIONS': '[]'}):
            response = app.test_client().get('/api/memo-words?language=zh&pairs=AB,AC,AI,UU,AB')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['words'], {'AB': '阿波罗', 'AC': '鹌鹑蛋', 'AI': None, 'UU': None})
        self.assertEqual(response.json['language'], 'zh')
        self.assertNotIn('censored', response.json)  # Not misrepresented as CoLPI's censored list.
        colpi.assert_not_called()

    def test_private_exclusions_apply(self):
        with patch.dict('os.environ', {'MEMO_WORD_EXCLUSIONS': '["阿波罗"]'}):
            self.assertIsNone(app.test_client().get('/api/memo-words?language=zh&pairs=AB').json['words']['AB'])

    def test_english_and_validation(self):
        with patch('app.suggestions_for', return_value={'AB': 'abacus'}) as colpi:
            self.assertEqual(app.test_client().get('/api/memo-words?pairs=AB').json['words'], {'AB': 'abacus'})
            colpi.assert_called_once()
        for query in ['language=fr&pairs=AB', 'language=zh&pairs=<script>']:
            self.assertEqual(app.test_client().get('/api/memo-words?' + query).status_code, 400)
