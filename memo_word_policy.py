"""Editable, conservative exclusions for neutral mnemonic examples.

This is a local product preference, not a comprehensive content classifier.
It supplements (and never replaces) CoLPI's offensive-content filter.
"""
import re
import os
import json
from functools import lru_cache
import unicodedata

# Deployment-specific entries belong in MEMO_WORD_EXCLUSIONS, not source code.

class MemoPolicyConfigurationError(ValueError):
    """Invalid private configuration; messages must never contain its value."""


def normalize(text):
    text = unicodedata.normalize('NFKD', text.casefold())
    text = ''.join(char for char in text if not unicodedata.combining(char))
    return ' '.join(re.findall(r'[^\W_]+', text, flags=re.UNICODE))


@lru_cache(maxsize=1)
def _exclusions(raw):
    try:
        entries = json.loads(raw)
    except (ValueError, TypeError):
        raise MemoPolicyConfigurationError('MEMO_WORD_EXCLUSIONS must be a JSON array of strings.') from None
    if (not isinstance(entries, list)
            or any(not isinstance(entry, str) or not entry.strip() for entry in entries)):
        raise MemoPolicyConfigurationError('MEMO_WORD_EXCLUSIONS must be a JSON array of nonempty strings.')
    normalized = frozenset(normalize(entry) for entry in entries)
    return normalized, frozenset(entry.replace(' ', '') for entry in normalized)


def excluded_memo_word(word):
    """Apply private full-entry exclusions without exposing configuration values."""
    entries, joined = _exclusions(os.environ.get('MEMO_WORD_EXCLUSIONS', '[]'))
    normalized = normalize(word)
    return normalized in entries or normalized.replace(' ', '') in joined


def ranked_candidates(text):
    """Split CoLPI tooltip suggestions without splitting parenthetical context."""
    start = depth = 0
    for index, char in enumerate(text):
        if char == '(':
            depth += 1
        elif char == ')':
            depth = max(0, depth - 1)
        elif char == ',' and depth == 0:
            yield text[start:index].strip()
            start = index + 1
    yield text[start:].strip()
