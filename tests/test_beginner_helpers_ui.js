const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

test('helper preview prioritizes stably, preserves manual lists, and saves choices', () => {
    function control(props) {
        const listeners = {};
        return Object.assign({addEventListener(name, fn) {(listeners[name] ||= []).push(fn);},
            fire(name) {(listeners[name] || []).forEach(fn => fn());}}, props);
    }
    const prioritize = control({checked: false});
    const mode = control({value: 'sticker'});
    const helper = control({value: 'BU', checked: false, dataset: {beginnerHelper: 'edge'}});
    const piece = name => ({style: {}, classList: {toggle(name, value) {this[name] = value;}}, dataset: {piece: name}, querySelectorAll: () => [{textContent: name.toLowerCase()}]});
    const edgeStickers = {dataset: {}, children: ['UF', 'UB', 'BU'].map(piece)};
    const edgePieces = {dataset: {}, children: ['UF', 'UB'].map(piece)};
    const corner = {dataset: {}, children: ['UFR', 'UBL'].map(piece)};
    const previews = {edge: {}, corner: {}};
    let saved;
    const document = control({
        getElementById: id => id === 'beginner-prioritize-helpers' ? prioritize : mode,
        querySelectorAll: () => [helper],
        querySelector: selector => {
            const kind = selector.includes('"edge"') ? 'edge' : 'corner';
            if (selector.startsWith('[data-helper-order-preview')) return previews[kind];
            return kind === 'corner' ? corner : selector.includes('"sticker"') ? edgeStickers : edgePieces;
        },
    });
    vm.runInNewContext(fs.readFileSync('static/beginner_helpers.js', 'utf8'), {
        document, localStorage: {getItem: () => null, setItem: (_, value) => {saved = JSON.parse(value);}},
    });
    const visualOrder = list => [...list.children].sort((a, b) => Number(a.style.order) - Number(b.style.order)).map(item => item.dataset.piece);
    const normal = previews.edge.textContent;
    helper.checked = true;
    helper.fire('change');
    assert.equal(previews.edge.textContent, normal);
    prioritize.checked = true;
    prioritize.fire('change');
    assert.equal(previews.edge.textContent, 'bu (BU) → uf (UF) → ub (UB)');
    assert.deepEqual(visualOrder(edgeStickers), ['BU', 'UF', 'UB']);
    assert.equal(edgeStickers.children[2].classList['helper-prioritized'], true);
    assert.deepEqual(edgeStickers.children.map(item => item.dataset.piece), ['UF', 'UB', 'BU']);
    assert.deepEqual(saved, {prioritize: true, edge: ['BU'], corner: []});
    mode.value = 'piece';
    mode.fire('change');
    assert.equal(previews.edge.textContent, 'ub (UB) → uf (UF)');
    assert.deepEqual(visualOrder(edgePieces), ['UB', 'UF']);
    prioritize.checked = false;
    prioritize.fire('change');
    assert.equal(previews.edge.textContent, 'uf (UF) → ub (UB)');
    mode.value = 'sticker';
    mode.fire('change');
    assert.equal(previews.edge.textContent, normal);
    assert.deepEqual(visualOrder(edgeStickers), ['UF', 'UB', 'BU']);
    assert.ok(edgeStickers.children.every(item => !item.classList['helper-prioritized']));
});
