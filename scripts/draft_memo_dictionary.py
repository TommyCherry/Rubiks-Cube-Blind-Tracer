"""Export a private review queue from CoLPI's censored grid; no LLM calls.

Run with MEMO_WORD_EXCLUSIONS loaded in the environment. The default output is
ignored by git. This exports grid suggestions, not every pair-detail alternative.
Review meanings before adding entries to static/memo_lexicon.js.
"""
import argparse
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
import requests
from colpi import PageParser, ColpiUnavailable, URL, valid_pair
from memo_word_policy import excluded_memo_word, ranked_candidates


def draft(html, known):
    parser = PageParser()
    parser.feed(html)
    props = (parser.page or {}).get('props', {})
    config = props.get('colpi', {})
    if config.get('showOffensive') is not False or config.get('currentLangCode') != 'en':
        raise ColpiUnavailable('Censored English suggestions could not be verified.')
    grid = props.get('grid')
    if not isinstance(grid, dict):
        raise ColpiUnavailable('Missing suggestion grid.')
    pairs, words = {}, {}
    for pair, entry in grid.items():
        if not valid_pair(pair) or not isinstance(entry, dict) or not isinstance(entry.get('t'), str):
            continue
        choices = []
        for word in ranked_candidates(entry['t']):
            if not word or len(word) > 120 or excluded_memo_word(word):
                continue
            key = word.lower().strip()
            if key not in choices:
                choices.append(key)
            words[key] = known.get(key, {'review': 'needed', 'pos': None, 'category': None,
                                         'description': None, 'number': None, 'properties': [],
                                         'affordances': {'tags': [], 'canDo': [], 'canReceive': [],
                                                         'associations': [], 'detail': '',
                                                         'basis': 'unreviewed'}})
        if choices:
            pairs[pair] = choices
    return {'source': URL, 'scope': 'censored English grid suggestions', 'pairs': pairs, 'words': words}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--html', type=Path, help='Use an already downloaded CoLPI page')
    parser.add_argument('--output', type=Path, default=ROOT / 'instance/memo_dictionary_review.json')
    args = parser.parse_args()
    source = (ROOT / 'static/memo_lexicon.js').read_text()
    known = json.loads(source.split('const MEMO_LEXICON = ', 1)[1].rstrip().removesuffix(';'))
    if args.html:
        html = args.html.read_text()
    else:
        response = requests.get(URL, timeout=(3, 10), headers={'Accept-Language': 'en'})
        response.raise_for_status()
        html = response.text
    result = draft(html, known)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    pending = sum(value.get('review') == 'needed' for value in result['words'].values())
    print(f"Wrote {len(result['pairs'])} pairs and {len(result['words'])} words; {pending} need review.")
    print('Review file stays private by default; no model or paid API was used.')


if __name__ == '__main__':
    main()
