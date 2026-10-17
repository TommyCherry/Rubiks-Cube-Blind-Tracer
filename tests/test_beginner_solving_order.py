import unittest
from app import app


class BeginnerSolvingOrderTests(unittest.TestCase):
    def test_defaults_to_recommended_ceec(self):
        html = app.test_client().get('/beginner').get_data(as_text=True)
        self.assertIn('value="CEEC" selected', html)
        self.assertIn('CEEC — Recommended', html)
        self.assertNotIn('id="beginner-order-preset"', app.test_client().get('/expert').get_data(as_text=True))

    def test_submitted_orders_reorder_memos_and_examples_independently(self):
        for memo in ('corners', 'edges'):
            for execution in ('corners', 'edges'):
                response = app.test_client().post('/beginner', data={
                    'scramble': 'R U F', 'beginner_memo_order': memo, 'beginner_execution_order': execution})
                self.assertEqual(response.status_code, 200)
                html = response.get_data(as_text=True)
                other_memo = 'edges' if memo == 'corners' else 'corners'
                other_execution = 'edges' if execution == 'corners' else 'corners'
                self.assertLess(html.index(f'data-memo-kind="{memo[:-1]}"'), html.index(f'data-memo-kind="{other_memo[:-1]}"'))
                self.assertLess(html.index(f'data-execution-kind="{execution[:-1]}"'), html.index(f'data-execution-kind="{other_execution[:-1]}"'))
                code = ''.join(kind[0].upper() for kind in [memo, other_memo, execution, other_execution])
                self.assertIn(f'value="{code}" selected', html)

    def test_invalid_orders_fall_back_to_ceec(self):
        html = app.test_client().post('/beginner', data={
            'scramble': 'R', 'beginner_memo_order': 'invalid', 'beginner_execution_order': 'invalid'}).get_data(as_text=True)
        self.assertIn('value="CEEC" selected', html)
