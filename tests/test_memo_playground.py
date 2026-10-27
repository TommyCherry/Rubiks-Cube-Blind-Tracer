import unittest
from unittest.mock import patch
from app import app


class StoryPlaygroundTests(unittest.TestCase):
    def test_public_page_uses_local_engine_but_is_not_linked_from_tracer(self):
        client = app.test_client()
        with patch('app.suggestions_for') as lookup:
            response = client.get('/memo-story-playground')
            self.assertEqual(response.status_code, 200)
            for name in ['memo_lexicon.js', 'memo_actions.js', 'memo_story.js', 'memo_playground.js', 'memo_webllm.js', 'memo_webllm_ui.js']:
                self.assertIn(name.encode(), response.data)
            self.assertNotIn(b'memo_words.js', response.data)
            self.assertIn(b'id="story-input"', response.data)
            self.assertIn(b'id="story-ai-generate"', response.data)
            self.assertIn(b'data-worker-url="/static/memo_webllm_worker.js"', response.data)
            self.assertNotIn(b'https://esm.run', response.data)
            lookup.assert_not_called()
        for mode in ['beginner', 'expert']:
            self.assertNotIn(b'href="/memo-story-playground"', client.get('/'+mode).data)
