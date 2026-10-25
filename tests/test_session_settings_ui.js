const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('static/session_settings.js', 'utf8');
function fixture(storage = new Map(), method = 'GET', mode = 'beginner', broken = false) {
    function element(props = {}) {
        const listeners = {};
        return Object.assign({addEventListener(type, fn) { (listeners[type] ||= []).push(fn); },
            dispatchEvent(event) { (listeners[event.type] || []).forEach(fn => fn(event)); }}, props);
    }
    const buffer = element({name: 'edge_buffer', id: 'edge-buffer', type: 'select-one', tagName: 'SELECT', value: '2', options: [{value: '2'}, {value: '6'}]});
    const toggle = element({name: 'use_pseudoswap', type: 'checkbox', value: 'on', checked: true});
    const letter = element({name: 'letter_UF', type: 'text', value: 'C'});
    const list = {id: 'order', children: ['UF','UB'].map(piece => ({dataset: {piece}})),
        appendChild(child) { this.children = this.children.filter(item => item !== child); this.children.push(child); }};
    const form = element({dataset: {mode, requestMethod: method}});
    const root = {querySelectorAll: selector => selector.startsWith('input') ? [buffer, toggle, letter] : [list]};
    let scrolled = false;
    const memo = {scrollIntoView() { scrolled = true; }, focus() {}};
    const document = element({getElementById: id => id === 'memo-form' ? form : memo, querySelector: () => root});
    const window = element();
    vm.runInNewContext(source, {document, window, Event, requestAnimationFrame: fn => fn(), MutationObserver: class {observe() {}},
        localStorage: {getItem(key) { if (broken) throw Error(); return storage.get(key); }, setItem(key, value) { if (broken) throw Error(); storage.set(key, value); }}});
    document.dispatchEvent(new Event('DOMContentLoaded'));
    return {buffer, toggle, letter, form, window, list, scrolled};
}
test('settings survive closing and reopening, including unchecked options and order', () => {
    const storage = new Map();
    const first = fixture(storage);
    first.buffer.value = '6'; first.toggle.checked = false; first.letter.value = 'Z';
    first.list.children.reverse();
    first.form.dispatchEvent(new Event('input'));
    const second = fixture(storage);
    assert.equal(second.buffer.value, '6');
    assert.equal(second.toggle.checked, false);
    assert.equal(second.letter.value, 'Z');
    assert.equal(second.list.children[0].dataset.piece, 'UB');
    assert.equal(fixture(storage, 'GET', 'expert').buffer.value, '2');
});
test('POST keeps submitted settings and scrolls; fresh visits do not scroll', () => {
    const storage = new Map(); const first = fixture(storage);
    first.buffer.value = '6'; first.window.dispatchEvent(new Event('pagehide'));
    const posted = fixture(storage, 'POST');
    assert.equal(posted.buffer.value, '2'); assert.equal(posted.scrolled, true);
    assert.equal(fixture().scrolled, false);
});
test('unavailable or malformed storage does not prevent scrolling or tracing', () => {
    assert.equal(fixture(new Map(), 'POST', 'beginner', true).scrolled, true);
    assert.equal(fixture(new Map([['tracer-settings-v1-beginner', '{bad']])).buffer.value, '2');
});
