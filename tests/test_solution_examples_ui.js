const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function fixture(cases) {
    const element = tag => ({tag, children: [], append(...children) {this.children.push(...children);},
        replaceChildren(...children) {this.children = children;}});
    let click;
    const button = {dataset: {source: 'beginner'}, addEventListener(event, callback) {click = callback;}};
    const status = element('p');
    const list = element('ol');
    const cornerList = element('ol');
    const controls = {'load-solution-examples': button, 'solution-status': status,
        'solution-examples': list, 'corner-solution-examples': cornerList, 'solution-cases': {textContent: JSON.stringify(cases)}};
    vm.runInNewContext(fs.readFileSync('static/solution_examples.js', 'utf8'), {
        document: {getElementById: id => controls[id], createElement: element},
        fetch() {throw new Error('Beginner examples must not request BLDDB.');},
    });
    return {click, button, list, cornerList, status};
}

test('beginner examples render each local target, setup recipe, and expandable algorithm without fetching', () => {
    const page = fixture([
        {memo: '中', positions: ['UR', 'FL'], recipe: "L' T-perm L", algorithm: "L' R U R' L"},
        {memo: 'A', positions: ['UR', 'UB'], recipe: 'Ja-perm', algorithm: 'x R2 F x\''},
    ]);
    page.click();
    assert.equal(page.list.children.length, 2);
    const first = page.list.children[0];
    assert.equal(first.children[0].textContent, '中 · UR → FL');
    assert.equal(first.children[1].textContent, "L' T-perm L");
    assert.equal(first.children[2].tag, 'details');
    assert.equal(first.children[2].children[0].textContent, 'Full algorithm');
    assert.equal(first.children[2].children[1].textContent, "L' R U R' L");
    assert.equal(page.status.textContent, 'OP examples loaded.');
    assert.equal(page.button.hidden, true);
});

test('empty edge traces render a local empty-state message', () => {
    const page = fixture([]);
    page.click();
    assert.equal(page.list.children.length, 0);
    assert.equal(page.status.textContent, 'No supported targets in this trace.');
});


test('corner examples render in their own list without mixing memo order', () => {
    const page = fixture([
        {memo: 'B', positions: ['UR', 'UF'], recipe: 'Jb-perm', algorithm: 'R'},
        {kind: 'corner', memo: 'Z', positions: ['UBL', 'UBR'], recipe: "R2 D R2 Y-perm R2 D' R2", algorithm: 'F'},
        {kind: 'corner', memo: 'C', positions: ['UBL', 'UFR'], recipe: 'Y-perm', algorithm: 'F'},
    ]);
    page.click();
    assert.equal(page.list.children.length, 1);
    assert.equal(page.cornerList.children.length, 2);
    assert.equal(page.cornerList.children[0].children[0].textContent, 'Z · UBL → UBR');
    assert.equal(page.cornerList.children[0].children[1].textContent, "R2 D R2 Y-perm R2 D' R2");
    assert.equal(page.cornerList.children[1].children[1].textContent, 'Y-perm');
});
