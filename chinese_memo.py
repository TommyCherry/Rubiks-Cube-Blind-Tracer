"""Chinese memo words from the supplied July 2026 workbook (竖总表)."""
import json
from pathlib import Path

from memo_word_policy import excluded_memo_word

ENTRIES = json.loads((Path(__file__).parent / 'data/chinese_memo_words.json').read_text())['entries']


def chinese_suggestions(pairs):
    # Apply the deployment's private exclusions to this source as well.
    return {pair: entry['word'] if entry and not excluded_memo_word(entry['word']) else None
            for pair in pairs for entry in [ENTRIES.get(pair)]}
