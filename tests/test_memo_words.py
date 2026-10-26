import html
import json
import unittest
from unittest.mock import Mock, patch

import requests
import colpi
from app import app


def page(show=False, language='en', grid=None):
    props = {'colpi': {'showOffensive': show, 'currentLangCode': language},
             'grid': grid if grid is not None else {'AB': {'t': 'ABACUS, ABBA'}, 'CD': {'t': 'CARD'}}}
    return '<div data-page="' + html.escape(json.dumps({'props': props}), quote=True) + '"></div>'


class MemoWordsTests(unittest.TestCase):
    def test_censorship_is_required_and_cannot_be_disabled(self):
        for show in (True, None, 0, 'false'):
            with self.subTest(show=show), self.assertRaises(colpi.ColpiUnavailable):
                colpi.parse_suggestions(page(show=show))
        with self.assertRaises(colpi.ColpiUnavailable):
            colpi.parse_suggestions(page(language='fr'))
        with self.assertRaises(colpi.ColpiUnavailable):
            colpi.parse_suggestions('<html>Provider unavailable</html>')

    def test_ranked_suggestions_and_missing_pairs(self):
        with patch.object(colpi, '_cache', None), patch.object(colpi, '_expires', 0), patch.object(colpi.requests, 'get') as get:
            get.return_value = Mock(text=page())
            self.assertEqual(colpi.suggestions_for(['AB', 'ZZ']), {'AB': 'ABACUS', 'ZZ': None})
            self.assertEqual(colpi.suggestions_for(['CD']), {'CD': 'CARD'})
            get.assert_called_once()
            self.assertNotIn('cookies', get.call_args.kwargs)
            self.assertEqual(get.call_args.kwargs['timeout'], (3, 5))

    def test_api_validation_and_failure(self):
        client = app.test_client()
        with patch('app.suggestions_for', return_value={'AB': 'ABACUS'}) as lookup:
            result = client.get('/api/memo-words?pairs=AB,AB&censored=false')
            self.assertEqual(result.status_code, 200)
            self.assertTrue(result.json['censored'])
            lookup.assert_called_once_with(['AB'])
            for pairs in ('', 'A', '<script>', 'ABCD', 'AB,'):
                self.assertEqual(client.get('/api/memo-words', query_string={'pairs': pairs}).status_code, 400)
        with patch('app.suggestions_for', side_effect=requests.Timeout):
            self.assertEqual(client.get('/api/memo-words?pairs=AB').status_code, 503)

    def test_bulk_pairs_and_panels(self):
        pairs = [a + b for a in 'ABCDEFGHIJK' for b in 'ABCDEFGHIJK']
        with patch('app.suggestions_for', return_value={}) as lookup:
            response = app.test_client().get('/api/memo-words', query_string={'pairs': ','.join(pairs)})
            self.assertEqual(response.status_code, 200)
            lookup.assert_called_once_with(pairs)
        with patch('app.save_bulk_batch', return_value='example'), patch('app.suggestions_for') as lookup:
            for mode in ('beginner', 'expert'):
                response = app.test_client().post('/' + mode, data={'action': 'bulk', 'bulk_scrambles': 'R U\nF2'})
                self.assertEqual(response.status_code, 200)
                self.assertIn(b'id="load-bulk-memo-words"', response.data)
                self.assertIn(b'Show memo words &amp; stories', response.data)
                self.assertLess(response.data.index(b'Showing 2 of 2 lines'),
                                response.data.index(b'id="load-bulk-memo-words"'))
                self.assertLess(response.data.index(b'id="load-bulk-memo-words"'),
                                response.data.index(b'class="bulk-table-scroll"'))
                self.assertEqual(response.data.count(b'data-bulk-words data-story-row='), 4)
                self.assertEqual(response.data.count(b'class="bulk-story-row"'), 2)
                self.assertIn(b'colspan="6"' if mode == 'beginner' else b'colspan="8"', response.data)
            lookup.assert_not_called()

    def test_words_panels_render_in_both_modes_without_fetching_colpi(self):
        with patch('app.suggestions_for') as lookup:
            for mode in ('beginner', 'expert'):
                response = app.test_client().post('/' + mode, data={'scramble': 'R U F'})
                self.assertEqual(response.status_code, 200)
                self.assertIn(b'data-memo-words="edge-memo"', response.data)
                self.assertIn(b'data-memo-words="corner-memo"', response.data)
                self.assertNotIn(b'Censorship on', response.data)
                self.assertIn(b'Taken from', response.data)
            lookup.assert_not_called()


if __name__ == '__main__':
    unittest.main()
