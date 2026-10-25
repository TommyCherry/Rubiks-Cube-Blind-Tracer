const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function fixture(savedMode = null) {
    const storage = new Map(savedMode ? [['beginnerCycleOrderMode', savedMode]] : []);
    function element(properties = {}) {
        const listeners = {};
        return Object.assign({
            addEventListener(name, callback) { (listeners[name] ||= []).push(callback); },
            dispatchEvent(event) { (listeners[event.type] || []).forEach(callback => callback(event)); },
        }, properties);
    }
    const orders = ['edge', 'corner'].map(kind => element({
        dataset: {orderMode: 'piece', cycleBreakOrder: kind, defaultOrder: JSON.stringify(kind === 'edge' ? ['UF', 'UB', 'DF'] : ['UFR', 'UBL'])},
        children: (kind === 'edge' ? ['DF', 'UF', 'UB'] : ['UBL', 'UFR']).map(piece => ({dataset: {piece}})),
        appendChild(item) { this.children = this.children.filter(child => child !== item); this.children.push(item); },
    }));
    const ids = {
        'beginner-cycle-order-mode': element({value: 'piece'}),
        'beginner-edge-method': element({value: 'UR'}),
        'beginner-corner-method': element({value: 'UBL'}),
        'edge-buffer': element({options: ['UF', 'UB', 'UR', 'DF'].map((name, i) => ({textContent: name, value: String(i)}))}),
        'corner-buffer': element({options: ['UFR', 'UBL', 'LUB'].map((name, i) => ({textContent: name, value: String(i)}))}),
        'usePseudoswap': element({checked: true}),
        'reset-beginner-cycle-order': element(),
    };
    const sticker = {value: ' q '};
    const label = {dataset: {cycleLetter: 'UF'}};
    const document = element({
        getElementById: name => ids[name],
        querySelectorAll: selector => selector === '[data-cycle-letter]' ? [label] : orders,
        querySelector: () => sticker,
    });
    vm.runInNewContext(fs.readFileSync('static/beginner_methods.js', 'utf8'), {document, Event, localStorage: {getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value)}});
    return {document, ids, orders, sticker, label, storage};
}

test('letters follow custom edits, saved schemes, and resets without changing piece order', () => {
    const {document, sticker, label, orders} = fixture();
    assert.equal(label.textContent, 'Q');
    sticker.value = 'Z';
    document.dispatchEvent(new Event('letter-scheme-change'));
    assert.equal(label.textContent, 'Z');
    sticker.value = '';
    document.dispatchEvent(new Event('DOMContentLoaded'));
    assert.equal(label.textContent, '—');
    assert.deepEqual(orders[0].children.map(item => item.dataset.piece), ['DF', 'UF', 'UB']);
});

test('method presets reset priorities, M2 puts UB first, and order changes are persisted', () => {
    const {ids, orders} = fixture();
    let saves = 0;
    orders.forEach(order => order.addEventListener('cycle-break-order-change', () => saves++));
    ids['beginner-edge-method'].value = 'DF';
    ids['beginner-edge-method'].dispatchEvent(new Event('change'));
    assert.deepEqual(orders[0].children.map(item => item.dataset.piece), ['UB', 'UF', 'DF']);
    assert.deepEqual(orders[1].children.map(item => item.dataset.piece), ['UBL', 'UFR']);
    assert.equal(saves, 1);
    assert.equal(ids['edge-buffer'].value, '3');
    assert.equal(ids.usePseudoswap.checked, false);
    ids['beginner-edge-method'].value = 'custom';
    ids['reset-beginner-cycle-order'].dispatchEvent(new Event('click'));
    assert.deepEqual(orders[0].children.map(item => item.dataset.piece), ['UF', 'UB', 'DF']);
});


test('piece/sticker selection is remembered and switching preserves each list order', () => {
    const {ids, orders, storage} = fixture('sticker');
    assert.equal(ids['beginner-cycle-order-mode'].value, 'sticker');
    assert.ok(orders.every(list => list.hidden));
    orders[1].dataset.orderMode = 'sticker';
    ids['beginner-cycle-order-mode'].dispatchEvent(new Event('change'));
    assert.equal(orders[1].hidden, false);
    assert.equal(orders[0].hidden, true);
    ids['beginner-cycle-order-mode'].value = 'piece';
    ids['beginner-cycle-order-mode'].dispatchEvent(new Event('change'));
    assert.equal(orders[0].hidden, false);
    assert.equal(orders[1].hidden, true);
    assert.equal(storage.get('beginnerCycleOrderMode'), 'piece');
    assert.deepEqual(orders[0].children.map(item => item.dataset.piece), ['DF', 'UF', 'UB']);
});


test('corner presets change only corners, including the LUB sticker', () => {
    const {ids, orders} = fixture();
    const edgeOrder = orders[0].children.map(item => item.dataset.piece);
    ids['beginner-edge-method'].value = 'DF';
    ids['beginner-edge-method'].dispatchEvent(new Event('change'));
    for (const [sticker, value] of [['UBL', '1'], ['LUB', '2'], ['UFR', '0']]) {
        ids['beginner-corner-method'].value = sticker;
        ids['beginner-corner-method'].dispatchEvent(new Event('change'));
        assert.equal(ids['corner-buffer'].value, value);
        assert.equal(ids['edge-buffer'].value, '3');
        assert.equal(ids['beginner-edge-method'].value, 'DF');
        assert.equal(ids.usePseudoswap.checked, false);
    }
    ids['corner-buffer'].value = '2';
    ids['corner-buffer'].dispatchEvent(new Event('change'));
    assert.equal(ids['beginner-corner-method'].value, 'LUB');
    ids['beginner-edge-method'].value = 'UR';
    ids['beginner-edge-method'].dispatchEvent(new Event('change'));
    assert.equal(ids['corner-buffer'].value, '2');
});
