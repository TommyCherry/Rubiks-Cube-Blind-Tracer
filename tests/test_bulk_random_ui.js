const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
function fixture(value, fail = false) {
    const ids = {};
    for (const id of ['generate-bulk-scrambles','bulk-random-count','bulk-scrambles','generate-bulk-memo','bulk-generation-status']) {
        ids[id] = {value: id === 'bulk-random-count' ? value : 'original', handlers: {},
            addEventListener(name, fn) { this.handlers[name] = fn; }, dispatchEvent() {}};
    }
    const workers = [];
    class Worker {
        constructor() { workers.push(this); }
        postMessage(message) { queueMicrotask(() => fail ? this.onerror() : this.onmessage({data: [message[0], 'scramble', 'R U F']})); }
        terminate() { this.terminated = true; }
    }
    vm.runInNewContext(fs.readFileSync('static/bulk_random.js', 'utf8'), {
        document: {getElementById: id => ids[id]}, Worker, Event, setTimeout, clearTimeout,
    });
    return {ids, workers, run: () => ids['generate-bulk-scrambles'].handlers.click()};
}
test('generates requested number with one worker, then enables memo submission', async () => {
    const f = fixture('3'); await f.run();
    assert.equal(f.ids['bulk-scrambles'].value, 'R U F\nR U F\nR U F');
    assert.equal(f.workers.length, 1); assert.equal(f.workers[0].terminated, true);
    assert.equal(f.ids['generate-bulk-memo'].disabled, false);
});
test('invalid counts do not start generation', async () => {
    for (const value of ['', '0', '-1', '1.5', '1001']) {
        const f = fixture(value); await f.run(); assert.equal(f.workers.length, 0);
        assert.equal(f.ids['bulk-scrambles'].value, 'original');
    }
});
test('failure preserves input, releases worker and enables retry', async () => {
    const f = fixture('2', true); await f.run();
    assert.equal(f.ids['bulk-scrambles'].value, 'original');
    assert.equal(f.workers[0].terminated, true);
    assert.equal(f.ids['generate-bulk-scrambles'].disabled, false);
});
