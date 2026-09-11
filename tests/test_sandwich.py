import unittest
from app import sandwich_memo, highlight_sandwiches


class SandwichTests(unittest.TestCase):
    def test_enabled_and_disabled(self):
        targets = list('ABCDBE')
        self.assertEqual(sandwich_memo(targets, targets, True), ('[Sandwich B: CD] AE', 1))
        self.assertEqual(sandwich_memo(targets, targets), ('AB CD BE', 0))

    def test_matches_targets_not_custom_letters(self):
        self.assertEqual(sandwich_memo(list('ABCDEF'), list('ABCDBE'), True), ('AB CD BE', 0))
        self.assertEqual(sandwich_memo(list('ABCDBE'), list('UVWXVY'), True), ('[Sandwich V: WX] UY', 1))

    def test_multiple_patterns_and_pair_boundaries(self):
        text = list('ABCDBEABCDBEZ')
        self.assertEqual(sandwich_memo(text, text, True), ('[Sandwich B: CD] AE [Sandwich B: CD] AE Z', 2))
        text = list('ZABCDBE')
        self.assertEqual(sandwich_memo(text, text, True)[1], 0)

    def test_highlight_escapes_custom_letters(self):
        html = str(highlight_sandwiches('[Sandwich B: <script>] AE'))
        self.assertIn('sandwich-highlight', html)
        self.assertNotIn('<script>', html)
        self.assertIn('&lt;script&gt;', html)
