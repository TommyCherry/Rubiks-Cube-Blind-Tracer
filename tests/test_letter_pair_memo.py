import unittest
from unittest.mock import patch
from app import app


class LetterPairMemoTests(unittest.TestCase):
    def test_page_and_navigation(self):
        client = app.test_client()
        with patch('app.suggestions_for') as lookup:
            response = client.get('/letter-pair-memo')
            self.assertEqual(response.status_code, 200)
            self.assertIn(b'name="pairs"', response.data)
            self.assertIn(b'Letter pair memo playground (in testing mode)', response.data)
            self.assertIn(b'This playground is in testing mode.', response.data)
            self.assertNotIn(b'data-memo-words=', response.data)
            lookup.assert_not_called()
        for mode in ['beginner', 'expert']:
            self.assertIn(b'href="/letter-pair-memo"', client.get('/' + mode).data)

    def test_pairs_reuse_word_renderer_and_account_controls(self):
        response = app.test_client().post('/letter-pair-memo', data={'pairs': 'ab, CD\nef，ab Q'})
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'AB CD EF AB Q</p>', response.data)
        for fragment in [b'data-memo-words="pairs-memo"', b'id="pairs-memo"',
                         b'memo_words.js', b'memo_story.js', b'data-story-settings="single"',
                         b'data-one-syllable', b'id="memo-account"', b'id="site-language"']:
            self.assertIn(fragment, response.data)
        self.assertNotIn(b'memo_webllm', response.data)

    def test_validation_and_safe_input(self):
        client = app.test_client()
        for value in ['', 'ABC', '12', '<script>alert(1)</script>', 'AB ' * 61, 'A' * 1001]:
            response = client.post('/letter-pair-memo', data={'pairs': value})
            self.assertEqual(response.status_code, 400)
            self.assertNotIn(b'data-memo-words=', response.data)
            self.assertNotIn(b'<script>alert(1)</script>', response.data)
        self.assertEqual(client.post('/letter-pair-memo', data={'pairs': 'AB ' * 60}).status_code, 200)
