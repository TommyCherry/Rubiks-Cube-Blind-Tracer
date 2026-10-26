"""Read CoLPI's public, censored English suggestions without user cookies."""
import json
import re
import time
from html.parser import HTMLParser
from threading import Lock

import requests
from memo_word_policy import excluded_memo_word, ranked_candidates

URL = 'https://bestsiteever.net/colpi/'
_cache = None
_expires = 0
_lock = Lock()


class ColpiUnavailable(ValueError):
    pass


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.page = None

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if tag == 'div' and 'data-page' in attributes:
            self.page = json.loads(attributes['data-page'])


def parse_suggestions(html):
    parser = PageParser()
    parser.feed(html)
    props = (parser.page or {}).get('props', {})
    config = props.get('colpi', {})
    # Fail closed if the provider changes its format or censorship defaults.
    if config.get('showOffensive') is not False or config.get('currentLangCode') != 'en':
        raise ColpiUnavailable('Censored English suggestions could not be verified.')
    grid = props.get('grid')
    if not isinstance(grid, dict):
        raise ColpiUnavailable('Missing suggestion grid.')
    suggestions = {}
    for pair, entry in grid.items():
        if not isinstance(entry, dict):
            continue
        text = entry.get('t')
        if isinstance(text, str) and 0 < len(text) <= 500:
            # Grid tooltips contain CoLPI's top suggestions in ranked order.
            for word in ranked_candidates(text):
                if word and not excluded_memo_word(word):
                    suggestions[pair] = word
                    break
    return suggestions


def suggestions_for(pairs):
    global _cache, _expires
    with _lock:
        if _cache is None or time.monotonic() >= _expires:
            response = requests.get(URL, timeout=(3, 5), headers={
                'Accept': 'text/html', 'Accept-Language': 'en',
                'User-Agent': 'Rubiks-Cube-Blind-Tracer/1.0 (memo examples)',
            })
            response.raise_for_status()
            # Never send browser cookies or reuse a CoLPI login session.
            _cache = parse_suggestions(response.text)
            _expires = time.monotonic() + 300
        # Recheck at the response boundary too, including already cached words.
        return {pair: (word if word and not excluded_memo_word(word) else None)
                for pair in pairs for word in [_cache.get(pair)]}


def valid_pair(pair):
    return isinstance(pair, str) and re.fullmatch(r'[A-Zʧ]{2}', pair) is not None


def alternatives_for(pair):
    """Fetch public alternatives only when a user opens a pair's word picker."""
    response = requests.get(URL, params={'lp': pair}, timeout=(3, 5),
                            headers={'Accept': 'text/html', 'Accept-Language': 'en'})
    response.raise_for_status()
    parser = PageParser()
    parser.feed(response.text)
    props = (parser.page or {}).get('props', {})
    config = props.get('colpi', {})
    detail = props.get('lp') or {}
    if (config.get('showOffensive') is not False or config.get('currentLangCode') != 'en'
            or detail.get('pair') != pair or not isinstance(detail.get('words'), list)):
        raise ColpiUnavailable('Censored alternatives could not be verified.')
    words = []
    for entry in detail['words']:
        if not isinstance(entry, dict):
            continue
        word = entry.get('word')
        if (entry.get('offensive') is False and entry.get('pair') == pair
                and isinstance(word, str) and 0 < len(word.strip()) <= 120
                and not excluded_memo_word(word) and word.strip() not in words):
            words.append(word.strip())
    return words
