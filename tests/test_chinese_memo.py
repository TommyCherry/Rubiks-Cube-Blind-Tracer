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
        self.assertEqual(response.json['words'], {'AB': '阿波罗', 'AC': '鹌鹑蛋', 'AI': '矮人旁的I形钢梁', 'UU': 'U形磁铁旁的U形磁铁'})
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

    def test_all_supported_pairs_have_multiple_concrete_options(self):
        from itertools import product
        from chinese_memo import ANCHORS, WORDS, PINYIN, chinese_options
        self.assertEqual(set(ANCHORS), set('ABCDEFGHIJKLMNOPQRSTUVWXYZʧ'))
        with patch.dict('os.environ', {'MEMO_WORD_EXCLUSIONS': '[]'}):
            for a, b in product(ANCHORS, repeat=2):
                pair = a + b
                options = chinese_options(pair)
                words = [option['word'] for option in options]
                self.assertEqual(len(words), len(set(words)), pair)
                original = ENTRIES.get(pair, {}).get('word')
                self.assertGreaterEqual(len(set(words) - {original}), 2, pair)
                self.assertTrue(all(len(word) <= 120 for word in words))
                self.assertTrue(all(option['kind'] in {'word', 'scene', 'workbook'} for option in options))
        for pair, words in WORDS.items():
            for word in words:
                initials = ''.join(syllable[0] for syllable in PINYIN[word].split()[:2]).upper()
                self.assertEqual(initials, pair, (word, PINYIN[word]))
        self.assertEqual(chinese_options('??'), [])

    def test_chinese_options_api_and_filtering(self):
        client = app.test_client()
        with patch('app.alternatives_for') as colpi, patch.dict('os.environ', {'MEMO_WORD_EXCLUSIONS': '[]'}):
            result = client.get('/api/memo-word-options?language=zh&pair=RG').json
            self.assertEqual(result['words'][:3], ['肉干', '肉鸽', '乳鸽'])
            self.assertIn('染缸', result['words'])
            self.assertNotIn('如果', result['words'])
            self.assertNotIn('人格', result['words'])
            self.assertEqual(result['language'], 'zh')
            self.assertEqual(result['source'], 'chinese_memo')
            self.assertNotIn('censored', result)
            colpi.assert_not_called()
        with patch.dict('os.environ', {'MEMO_WORD_EXCLUSIONS': '["肉干", "染缸", "矮人"]'}):
            words = client.get('/api/memo-word-options?language=zh&pair=RG').json['words']
            self.assertNotIn('肉干', words)
            self.assertNotIn('染缸', words)
            words = client.get('/api/memo-word-options?language=zh&pair=AO').json['words']
            self.assertFalse(any('矮人' in word for word in words))
        with patch.dict('os.environ', {'MEMO_WORD_EXCLUSIONS': 'invalid'}):
            self.assertEqual(client.get('/api/memo-word-options?language=zh&pair=RG').status_code, 503)
        self.assertEqual(client.get('/api/memo-word-options?language=fr&pair=RG').status_code, 400)
        self.assertEqual(client.get('/api/memo-word-options?language=zh&pair=<script>').status_code, 400)

    def test_letter_shape_scenes_are_explicit_and_defaults_cover_gaps(self):
        client = app.test_client()
        with patch.dict('os.environ', {'MEMO_WORD_EXCLUSIONS': '[]'}):
            for pair in ('II', 'UU', 'VV', 'ʧʧ', 'AI', 'AA'):
                result = client.get('/api/memo-word-options', query_string={'language': 'zh', 'pair': pair}).json
                self.assertGreaterEqual(len(result['words']), 2)
                self.assertTrue(all(option['kind'] == 'scene' for option in result['options']))
                self.assertTrue(all('场景' in option['label'] for option in result['options']))
                default = client.get('/api/memo-words', query_string={'language': 'zh', 'pairs': pair}).json['words'][pair]
                self.assertEqual(default, result['words'][0])
