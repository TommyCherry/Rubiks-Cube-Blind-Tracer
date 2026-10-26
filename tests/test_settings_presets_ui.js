const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('static/settings_presets.js', 'utf8');

async function fixture(mode = 'beginner', fail = false, network = {}) {
    function element(props = {}) {
        const handlers = {};
        return Object.assign({value: '', dataset: {}, disabled: false,
            addEventListener(type, fn) { handlers[type] = fn; },
            dispatchEvent(event) { return handlers[event.type]?.(event); },
            classList: {toggle() {}}, focus() {},
            options: [], replaceChildren(...items) { this.options = items; this.value = ''; },
            add(option) { this.options.push(option); }}, props);
    }
    const ids = Object.fromEntries(['save-preset', 'load-preset', 'preset-list', 'preset-name',
        'preset-status', 'shared-preset-list', 'copy-shared-preset', 'retry-presets', 'memo-form',
        ...'UFRBLD'.split('').map(face => `color-${face.toLowerCase()}`)].map(id => [id, element()]));
    const letter = element({name: 'letter_UF', type: 'text', value: 'A'});
    const buffer = element({name: 'edge_buffer', type: 'select-one', tagName: 'SELECT', value: 'UR',
        options: [{value: 'UR'}, {value: 'DF'}]});
    const toggle = element({name: 'beginner_helper', type: 'checkbox', value: 'on', checked: true});
    const order = {id: 'order', dataset: {}, children: ['UF', 'UB'].map(piece => ({dataset: {piece}})),
        appendChild(child) { this.children = this.children.filter(item => item !== child); this.children.push(child); }};
    const root = {querySelectorAll: selector => selector.startsWith('input') ? [letter, buffer, toggle] : [order]};
    const colors = Object.fromEntries([... 'UFRBLD'].map(face => [face, '#abcdef']));
    const presets = ['beginner', 'expert'].map((mode, i) => ({id: i + 1, name: mode + ' setup', settings: {
        mode, fields: {letter_UF: ['Z'], edge_buffer: ['DF'], beginner_helper: []},
        orders: {order: ['UB', 'UF']}, colors, orientation: colors}}));
    let ready;
    const document = {addEventListener(type, fn) { ready = fn; },
        getElementById: id => ids[id], querySelector: selector => selector === '.preset-section' ? {dataset: {mode}} : root,
        dispatchEvent() {}};
    let saved;
    const timers = new Map();
    let nextTimer = 0;
    const context = {document, Event, AbortController,
        setTimeout(fn) { timers.set(++nextTimer, fn); return nextTimer; },
        clearTimeout(id) { timers.delete(id); }, Option: function(text, value) { this.text = text; this.value = value; },
        colorScheme: {}, cubeOrientation: {}, updateCubeColors() {}, saveCubeColors() {}, saveLetterScheme() {},
        localStorage: {setItem() {}},
        fetch: async (_, options) => {
            if (network.fetch) return network.fetch(options);
            if (fail) return {ok: false, json: async () => ({error: 'Storage unavailable'})};
            if (options?.method === 'POST') { saved = JSON.parse(options.body); return {ok: true, json: async () => ({id: 3, ...saved})}; }
            return {ok: true, json: async () => ({presets})};
        }};
    vm.runInNewContext(source, context);
    const pending = ready();
    if (!network.pending) await pending;
    return {pending, expire() { [...timers.values()].forEach(fn => fn()); }, ids, letter, buffer, toggle, order, context, get saved() { return saved; }, recover() { fail = false; }};
}

test('full preset lists are scoped by mode and existing presets remain available', async () => {
    for (const mode of ['beginner', 'expert']) {
        const f = await fixture(mode);
        assert.equal(f.ids['preset-list'].options.length, 2);
        assert.equal(f.ids['preset-list'].options[1].text, mode + ' setup');
        assert.notEqual(f.ids['shared-preset-list'].options[1].text, mode + ' setup');
    }
});

test('copying shared settings preserves buffers, helpers, orders and current preset selection', async () => {
    const f = await fixture();
    f.ids['shared-preset-list'].value = '2';
    await f.ids['copy-shared-preset'].dispatchEvent(new Event('click'));
    assert.equal(f.letter.value, 'Z');
    assert.equal(f.context.colorScheme.U, '#abcdef');
    assert.equal(f.context.cubeOrientation.F, '#abcdef');
    assert.equal(f.buffer.value, 'UR');
    assert.equal(f.toggle.checked, true);
    assert.equal(f.order.children[0].dataset.piece, 'UF');
    assert.equal(f.ids['preset-name'].value, '');
    assert.match(f.ids['preset-status'].textContent, /Solving options are unchanged/);
});

test('full load restores solving options and order, then saves in current mode', async () => {
    const f = await fixture();
    f.ids['preset-list'].value = '1';
    await f.ids['load-preset'].dispatchEvent(new Event('click'));
    assert.equal(f.buffer.value, 'DF');
    assert.equal(f.toggle.checked, false);
    assert.equal(f.order.children[0].dataset.piece, 'UB');
    await f.ids['save-preset'].dispatchEvent(new Event('click'));
    assert.equal(f.saved.settings.mode, 'beginner');
    assert.deepEqual(f.saved.settings.fields.beginner_helper, []);
    assert.deepEqual(f.saved.settings.orders.order, ['UB', 'UF']);
});

test('database failure can be retried without reloading or changing settings', async () => {
    const f = await fixture('beginner', true);
    assert.equal(f.ids['retry-presets'].hidden, false);
    assert.equal(f.ids['save-preset'].disabled, false);
    assert.equal(f.letter.value, 'A');
    f.recover();
    await f.ids['retry-presets'].dispatchEvent(new Event('click'));
    assert.equal(f.ids['retry-presets'].hidden, true);
    assert.equal(f.ids['save-preset'].disabled, false);
    assert.equal(f.ids['preset-list'].options.length, 2);
});


test('hanging load times out, exposes retry and never disables saving', async () => {
    const f = await fixture('beginner', false, {pending: true, fetch: () => new Promise(() => {})});
    assert.equal(f.ids['save-preset'].disabled, false);
    f.expire();
    await f.pending;
    assert.match(f.ids['preset-status'].textContent, /Loading presets timed out/);
    assert.equal(f.ids['retry-presets'].hidden, false);
    assert.equal(f.ids['save-preset'].disabled, false);
});

test('a hung response body also times out', async () => {
    const f = await fixture('beginner', false, {pending: true,
        fetch: async () => ({ok: true, json: () => new Promise(() => {})})});
    f.expire();
    await f.pending;
    assert.match(f.ids['preset-status'].textContent, /timed out/);
});

test('saving while loading preserves the new preset and success message', async () => {
    let finishLoad;
    const f = await fixture('beginner', false, {pending: true, fetch: options => {
        if (options.method === 'POST') return Promise.resolve({ok: true,
            json: async () => ({id: 3, ...JSON.parse(options.body)})});
        return new Promise(resolve => { finishLoad = resolve; });
    }});
    f.ids['preset-name'].value = 'New setup';
    await f.ids['save-preset'].dispatchEvent(new Event('click'));
    finishLoad({ok: true, json: async () => ({presets: []})});
    await f.pending;
    assert.equal(f.ids['preset-list'].options[1].text, 'New setup');
    assert.equal(f.ids['preset-list'].value, '3');
    assert.match(f.ids['preset-status'].textContent, /Saved/);
});

test('hanging save restores controls and explains uncertain save outcome', async () => {
    const network = {};
    const f = await fixture('beginner', false, network);
    network.fetch = () => new Promise(() => {});
    f.ids['preset-name'].value = 'New setup';
    const saving = f.ids['save-preset'].dispatchEvent(new Event('click'));
    assert.equal(f.ids['save-preset'].disabled, true);
    f.expire();
    await saving;
    assert.equal(f.ids['save-preset'].disabled, false);
    assert.equal(f.ids['retry-presets'].hidden, false);
    assert.match(f.ids['preset-status'].textContent, /may have been saved/);
});
