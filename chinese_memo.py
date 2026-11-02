"""Workbook defaults and concrete Chinese letter-pair alternatives."""
import json
from pathlib import Path

from memo_word_policy import excluded_memo_word

_DATA = Path(__file__).parent / 'data'
ENTRIES = json.loads((_DATA / 'chinese_memo_words.json').read_text())['entries']
_ALTERNATIVES = json.loads((_DATA / 'chinese_memo_alternatives.json').read_text())
ANCHORS = _ALTERNATIVES['anchors']
WORDS = _ALTERNATIVES['words']
PINYIN = _ALTERNATIVES['pinyin']


def chinese_options(pair):
    """Rank ordinary words first, with explicitly labeled image scenes for gaps.

    Scene initials refer to the two named objects, not intervening action words.
    I/U/V/ʧ use labeled letter shapes because they do not start Mandarin pinyin.
    """
    if len(pair) != 2 or any(letter not in ANCHORS for letter in pair):
        return []
    options = []
    seen = set()

    def add(word, kind, label):
        if word not in seen and not excluded_memo_word(word):
            seen.add(word)
            options.append(dict(word=word, kind=kind, label=label))

    for word in WORDS.get(pair, []):
        add(word, 'word', f'{word}（{PINYIN[word]}）')
    # At least two additional images even for pairs with no ordinary word.
    if len(options) < 3:
        for index in range(2):
            left, right = (ANCHORS[letter][index] for letter in pair)
            if any(excluded_memo_word(anchor['word']) for anchor in (left, right)):
                continue
            word = f"{left['word']}旁的{right['word']}" if index == 0 else f"{left['word']}上的{right['word']}"
            cues = ' + '.join(f"{letter}: {anchor.get('pinyin', '字形联想')}" for letter, anchor in zip(pair, (left, right)))
            add(word, 'scene', f'{word} — 场景（{cues}）')
    original = ENTRIES.get(pair, {}).get('word')
    if original:
        add(original, 'workbook', f'{original} — 原词表')
    return options


def chinese_suggestions(pairs):
    suggestions = {}
    for pair in pairs:
        original = ENTRIES.get(pair, {}).get('word')
        if original:
            # Preserve existing defaults and the original exclusion behavior.
            suggestions[pair] = None if excluded_memo_word(original) else original
        else:
            options = chinese_options(pair)
            suggestions[pair] = options[0]['word'] if options else None
    return suggestions
