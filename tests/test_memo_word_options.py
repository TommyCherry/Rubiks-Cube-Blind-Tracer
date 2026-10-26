import html
import json
import os
import unittest
from unittest.mock import Mock, patch

import colpi
from app import app


def payload(show=False, pair='AB'):
    entries = [dict(word=word, offensive=flag, pair='AB') for word, flag in (
        ('ABACUS', False), ('PRIVATE TEST ENTRY', False), ('FLAGGED TEST ENTRY', True),
        ('UNVERIFIED TEST ENTRY', None), ('APPLE BOX', False), ('ABACUS', False))]
    entries.append(dict(word='WRONG PAIR', offensive=False, pair='CD'))
    props = dict(colpi=dict(showOffensive=show, currentLangCode='en'), lp=dict(pair=pair, words=entries))
    return '<div data-page="' + html.escape(json.dumps(dict(props=props)), quote=True) + '"></div>'


class MemoWordOptionsTests(unittest.TestCase):
    def test_filters_each_word_and_private_exclusions(self):
        with patch.dict(os.environ, MEMO_WORD_EXCLUSIONS='["private test entry"]'), patch.object(colpi.requests, 'get') as get:
            get.return_value = Mock(text=payload())
            self.assertEqual(colpi.alternatives_for('AB'), ['ABACUS', 'APPLE BOX'])
            self.assertEqual(get.call_args.kwargs['params'], {'lp': 'AB'})
            self.assertNotIn('cookies', get.call_args.kwargs)

    def test_fails_closed_if_censorship_or_pair_is_unverified(self):
        for content in (payload(show=True), payload(show=None), payload(pair='CD'), '<html>Unavailable</html>'):
            with patch.object(colpi.requests, 'get', return_value=Mock(text=content)):
                with self.assertRaises(colpi.ColpiUnavailable):
                    colpi.alternatives_for('AB')

    def test_api_validation_and_success(self):
        client = app.test_client()
        with patch('app.alternatives_for', return_value=['ABACUS']) as lookup:
            for pair in ('', 'A', 'ABCD', 'AB,CD'):
                self.assertEqual(client.get('/api/memo-word-options', query_string={'pair': pair}).status_code, 400)
            lookup.assert_not_called()
            response = client.get('/api/memo-word-options?pair=AB&censored=false')
            self.assertEqual(response.json, dict(pair='AB', words=['ABACUS'], censored=True))
        with patch('app.alternatives_for', side_effect=colpi.ColpiUnavailable('private diagnostic')):
            response = client.get('/api/memo-word-options?pair=AB')
            self.assertEqual(response.status_code, 503)
            self.assertNotIn(b'private diagnostic', response.data)
