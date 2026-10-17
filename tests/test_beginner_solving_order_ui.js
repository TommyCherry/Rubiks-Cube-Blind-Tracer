const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function fixture(saved, blocked = false, parity = false) {
    const control = value => ({value, handlers: {}, addEventListener(name, fn) {this.handlers[name] = fn;},
        change(value) {this.value = value; this.handlers.change();}});
    const preset = control('CEEC'), memo = control('corners'), execution = control('edges');
    const steps = {children: Array.from({length: parity ? 5 : 4}, () => ({}))};
    const parent = (children, attr) => ({children,
        querySelector(selector) {return this.children.find(child => selector === '.trace-details' ? child.kind === 'details' : selector === `[${attr}="${child.kind}"]`) || null;},
        insertBefore(item, before) {this.children = this.children.filter(child => child !== item); const index = before ? this.children.indexOf(before) : this.children.length; this.children.splice(index, 0, item);},
        appendChild(item) {this.insertBefore(item, null);},
    });
    const memos = parent([{kind: 'edge'}, {kind: 'corner'}, {kind: 'details'}], 'data-memo-kind');
    const examples = parent([{kind: 'edge'}, ...(parity ? [{kind: 'parity'}] : []), {kind: 'corner'}], 'data-execution-kind');
    const ids = {'beginner-order-preset': preset, 'beginner-memo-order': memo,
        'beginner-parity-step': parity ? {} : null, 'beginner-execution-order': execution, 'beginner-order-steps': steps, 'beginner-execution-examples': examples};
    let stored;
    vm.runInNewContext(fs.readFileSync('static/beginner_solving_order.js', 'utf8'), {
        document: {getElementById: id => ids[id], querySelector: () => memos},
        localStorage: {getItem() {if (blocked) throw Error('blocked'); return JSON.stringify(saved);},
            setItem(key, value) {if (blocked) throw Error('blocked'); stored = JSON.parse(value);}},
    });
    return {preset, memo, execution, steps, memos, examples, stored: () => stored};
}

test('CEEC defaults to corner memo followed by edge execution in actual DOM order', () => {
    const page = fixture(null);
    assert.equal(page.preset.value, 'CEEC');
    assert.deepEqual(page.steps.children.map(step => step.textContent), ['Memo corners', 'Memo edges', 'Solve edges', 'Solve corners']);
    assert.deepEqual(page.memos.children.map(card => card.kind), ['corner', 'edge', 'details']);
    assert.deepEqual(page.examples.children.map(group => group.kind), ['edge', 'corner']);
});

test('all presets and independent controls stay in sync and persist', () => {
    const page = fixture(null);
    for (const [code, memo, execution] of [['CEEC', 'corners', 'edges'], ['CECE', 'corners', 'corners'], ['ECEC', 'edges', 'edges'], ['ECCE', 'edges', 'corners']]) {
        page.preset.change(code);
        assert.equal(page.memo.value, memo);
        assert.equal(page.execution.value, execution);
        assert.equal(page.memos.children[0].kind, memo.slice(0, -1));
        assert.equal(page.examples.children[0].kind, execution.slice(0, -1));
        assert.deepEqual(page.stored(), {memo, execution});
    }
    page.memo.change('corners');
    page.execution.change('edges');
    assert.equal(page.preset.value, 'CEEC');
});

test('restores valid preferences and tolerates invalid or blocked browser storage', () => {
    assert.equal(fixture({memo: 'edges', execution: 'corners'}).preset.value, 'ECCE');
    assert.equal(fixture({memo: 'invalid', execution: 'edges'}).preset.value, 'CEEC');
    const page = fixture(null, true);
    page.preset.change('ECEC');
    assert.equal(page.memos.children[0].kind, 'edge');
});


test('parity stays between execution stages and appears in the step preview', () => {
    const page = fixture(null, false, true);
    assert.deepEqual(page.examples.children.map(group => group.kind), ['edge', 'parity', 'corner']);
    assert.deepEqual(page.steps.children.map(step => step.textContent), ['Memo corners', 'Memo edges', 'Solve edges', 'Execute parity algorithm', 'Solve corners']);
    page.execution.change('corners');
    assert.equal(page.preset.value, 'CECE');
    assert.deepEqual(page.examples.children.map(group => group.kind), ['corner', 'parity', 'edge']);
    assert.deepEqual(page.steps.children.map(step => step.textContent), ['Memo corners', 'Memo edges', 'Solve corners', 'Execute parity algorithm', 'Solve edges']);
});
