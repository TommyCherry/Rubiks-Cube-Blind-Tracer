// Run with: node --test tests/test_conjugacy_practice_ui.js
const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync('static/conjugacy_practice.js', 'utf8');

function setup(count, failAt = Infinity) {
    const elements = {};
    const details = {open: false};
    for (const id of ['generate-conjugacy', 'conjugacy-input', 'conjugacy-count', 'bulk-scrambles', 'conjugacy-status', 'generateScrambleButton', 'scramble']) {
        elements[id] = {value: '', disabled: false, handlers: {}, classList: {add() {}, remove() {}},
            addEventListener(event, fn) { this.handlers[event] = fn; }, removeAttribute() {},
            dispatchEvent() {}, closest() { return details; }, reportValidity() { this.invalid = true; }};
    }
    elements['conjugacy-count'].value = String(count);
    elements['conjugacy-input'].value = '3e';
    elements['bulk-scrambles'].value = 'existing bulk';
    elements.scramble.value = 'existing single';
    let verified = 0, workers = 0, terminated = 0, requests = 0;
    vm.runInNewContext(source, {
        document: {getElementById: id => elements[id]}, Event: class {},
        AbortSignal: {timeout() {}}, setTimeout, clearTimeout,
        Worker: class {
            constructor() { workers++; }
            postMessage() { queueMicrotask(() => this.onmessage({data: [1, '', "R U"]})); }
            terminate() { terminated++; }
        },
        fetch: async (url, options) => {
            requests++;
            const data = JSON.parse(options.body);
            if (url.endsWith('state')) return {ok: true, json: async () => ({facelets: 'state', token: 'signed', conjugacy_class: '3e'})};
            verified++;
            return {ok: verified !== failAt, json: async () => verified === failAt ? {error: 'Verification failed'} : {scramble: data.scramble, conjugacy_class: '3e'}};
        }
    });
    return {elements, details, run: () => elements['generate-conjugacy'].handlers.click(), stats: () => ({verified, workers, terminated, requests})};
}

test('single scramble stays in single memo input', async () => {
    const ui = setup(1); await ui.run();
    assert.equal(ui.elements.scramble.value, "U' R'");
    assert.equal(ui.elements['bulk-scrambles'].value, 'existing bulk');
});
test('100 verified scrambles populate bulk input using one worker', async () => {
    const ui = setup(100); await ui.run();
    assert.equal(ui.elements['bulk-scrambles'].value.split('\n').length, 100);
    assert.equal(ui.elements.scramble.value, 'existing single');
    assert.equal(ui.details.open, true);
    assert.deepEqual(ui.stats(), {verified: 100, workers: 1, terminated: 1, requests: 200});
    assert.equal(ui.elements['generate-conjugacy'].disabled, false);
});
test('invalid counts never start generation', async () => {
    for (const count of [0, 101, 1.5, '']) {
        const ui = setup(count); await ui.run();
        assert.equal(ui.stats().requests, 0);
        assert.equal(ui.elements['conjugacy-count'].invalid, true);
    }
});
test('failed batch preserves existing inputs and releases worker and controls', async () => {
    const ui = setup(3, 2); await ui.run();
    assert.equal(ui.elements['bulk-scrambles'].value, 'existing bulk');
    assert.equal(ui.elements.scramble.value, 'existing single');
    assert.equal(ui.stats().terminated, 1);
    assert.equal(ui.elements['conjugacy-count'].disabled, false);
    assert.equal(ui.elements['conjugacy-status'].textContent, 'Verification failed');
});
