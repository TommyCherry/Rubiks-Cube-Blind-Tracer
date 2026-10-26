const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('static/memo_words.js', 'utf8');

function element() {
    const attributes = {}, handlers = {};
    return {children: [], textContent: '', classList: {add() {}},
        setAttribute(key, value) { attributes[key] = value; }, getAttribute(key) { return attributes[key]; },
        addEventListener(type, fn) { handlers[type] = fn; }, click() { return handlers.click?.(); },
        replaceWith(replacement) { this.replacement = replacement; },
        showModal() {}, close() { handlers.close?.(); }, remove() {},
        append(...items) { this.children.push(...items); },
        appendChild(item) { this.children.push(item); }, replaceChildren() { this.children = []; }};
}
async function fixture(memo, response = {censored: true, words: {AB: 'ABACUS', CD: '<b>CARD</b>'}}, failure = false, bulk = false, options = null, accountState = null) {
    const panel = Object.assign(element(), {dataset: {memoWords: 'edge-memo'}});
    if (bulk) panel.dataset.bulkWords = '';
    let ready, calls = 0, change, click;
    const button = {disabled: false, addEventListener(_, fn) { click = fn; }};
    const status = element();
    const filter = {checked: false, addEventListener(_, fn) { change = fn; }};
    const storage = new Map();
    const context = {Event, AbortController, setTimeout, clearTimeout, clearInterval, setInterval: () => 1,
        window: {addEventListener() {}, removeEventListener() {}},
        localStorage: {getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value)},
        document: {body: element(), addEventListener(_, fn) { ready = fn; }, querySelectorAll: selector => selector === '[data-memo-words]' ? [panel] : [filter],
            getElementById: id => id === 'memo-account' ? (accountState ? {dataset: {signedIn: accountState.signedOut ? 'false' : 'true', csrf: 'test-csrf'}} : null) : id === 'load-bulk-memo-words' ? (bulk ? button : null) : id === 'bulk-memo-words-status' ? status : ({textContent: memo}), createElement: element},
        fetch: async (url, init) => { calls++;
            if (url === '/api/memo-word-session') return {ok: true, json: async () => ({signed_in: accountState.loggedIn, csrf: 'new-csrf'})};
            if (url === '/api/memo-word-choices') {
                if (init.method === 'PUT') {
                    if (accountState.failSave) return {ok: false, json: async () => ({error: 'Storage unavailable'})};
                    const data = JSON.parse(init.body); accountState.words[data.pair] = data.word;
                }
                if (init.method === 'DELETE') delete accountState.words[JSON.parse(init.body).pair];
                return {ok: true, json: async () => ({words: accountState.words, saved: true})};
            }
            return {ok: !failure, json: async () => url.includes('memo-word-options') ? options : response}; }};
    vm.runInNewContext(source, context);
    await ready();
    return {panel, context, get calls() { return calls; }, button, status, click: () => click(), recover() { failure = false; }, filter, storage, toggle() { filter.checked = !filter.checked; change(); }};
}

test('preserves pair boundaries, repeats, single letters, and nested technique annotations', async () => {
    const f = await fixture('AB CD A [Buffer C] AB [Flips: EF GH] [LTCT: X[Y]]');
    assert.equal(f.panel.children.length, 8);
    assert.equal(f.panel.children[0].children[1].textContent, 'ABacus');
    assert.equal(f.panel.children[1].children[1].textContent, '<b>CarD</b>');
    assert.equal(f.panel.children[2].textContent, 'A');
    assert.equal(f.panel.children[3].textContent, '[Buffer C]');
    assert.equal(f.panel.children[4].children[1].textContent, 'ABacus');
    assert.equal(f.panel.children[5].textContent, '[Flips: EF GH]');
    assert.equal(f.panel.children[6].textContent, '[LTCT: X[Y]]');
});
test('missing words keep pair visible and censorship failures show no words', async () => {
    const missing = await fixture('ZZ');
    assert.match(missing.panel.children[0].children[1].textContent, /No example/);
    for (const censored of [false, undefined]) {
        const f = await fixture('AB', {censored, words: {AB: 'Do not render'}});
        assert.match(f.panel.textContent, /unavailable/);
        assert.equal(f.panel.children.length, 0);
    }
    assert.match((await fixture('AB', {}, true)).panel.textContent, /unavailable/);
});
test('empty memo and annotations alone require no network lookup', async () => {
    for (const memo of ['', 'A [CW Twists: B C]']) {
        assert.equal((await fixture(memo)).calls, 0);
    }
});


test('approximate cues include Pikachu and preserve already short words', async () => {
    const {context} = await fixture('AB');
    assert.equal(context.memoWordCue('PIKACHU').short, 'pik');
    assert.equal(context.memoWordCue('CAT').generated, false);
    assert.equal(context.memoWordCue('ABACUS').short, 'ab');
    assert.equal(context.memoWordCue('ASSISTANT').short, 'as');
    assert.equal(context.memoWordCue('SEXUAL').short, null);
    assert.equal(context.memoWordCue('GALAXY', 'GX').short, 'gax');
    assert.equal(context.memoWordCue('PIKACHU', 'PK').short, 'pik');
    assert.equal(context.memoWordCue('BUTTERFLY', 'BF').short, 'buf');
    assert.equal(context.memoWordCue('GALAXY', 'gx').short, 'gax');
});

test('rendered short cues use the actual memo pair', async () => {
    const f = await fixture('GX', {censored: true, words: {GX: 'GALAXY'}});
    assert.match(f.panel.children[0].children[2].textContent, /Short cue: GaX/);
    f.toggle();
    assert.equal(f.panel.children[0].children[1].textContent, 'GaX');
});

test('one-syllable filter switches to generated cue, remembers setting and restores original', async () => {
    const f = await fixture('PK A [Buffer C]', {censored: true, words: {PK: 'PIKACHU'}});
    assert.equal(f.panel.children[0].children[1].textContent, 'PiKachu');
    assert.match(f.panel.children[0].children[2].textContent, /Short cue: PiK/);
    f.toggle();
    assert.equal(f.panel.children[0].children[1].textContent, 'PiK');
    assert.match(f.panel.children[0].children[2].textContent, /From PiKachu/);
    assert.equal(f.panel.children[1].textContent, 'A');
    assert.equal(f.panel.children[2].textContent, '[Buffer C]');
    assert.equal(f.storage.get('memo-one-syllable'), 'true');
    f.toggle();
    assert.equal(f.panel.children[0].children[1].textContent, 'PiKachu');
    assert.equal(f.calls, 1);
});

test('bulk lookups are opt-in and reuse one request for repeated pairs', async () => {
    const f = await fixture('GX GX PK', {censored: true, words: {GX: 'GALAXY', PK: 'PIKACHU'}}, false, true);
    assert.equal(f.calls, 0);
    await f.click();
    assert.equal(f.calls, 1);
    assert.equal(f.panel.children.length, 7);
    assert.equal(f.panel.children[0].textContent, 'GalaXy');
    f.toggle();
    assert.equal(f.panel.children[0].textContent, 'GaX');
    assert.equal(f.button.disabled, true);
});
test('bulk lookup failures can be retried', async () => {
    const f = await fixture('AB', {censored: true, words: {AB: 'ABACUS'}}, true, true);
    await f.click();
    assert.equal(f.button.disabled, false);
    assert.match(f.status.textContent, /retry/);
    f.recover();
    await f.click();
    assert.equal(f.button.disabled, true);
    assert.equal(f.calls, 2);
});

test('compact bulk words toggle accessible details without repeating pair cards', async () => {
    const f = await fixture('GX PK', {censored: true, words: {GX: 'GALAXY', PK: 'PIKACHU'}}, false, true);
    await f.click();
    const [galaxy, separator, pikachu, detail] = f.panel.children;
    assert.equal(separator.textContent, ' · ');
    assert.equal(galaxy.children.length, 0);
    assert.equal(detail.hidden, true);
    galaxy.click();
    assert.equal(detail.hidden, false);
    assert.match(detail.textContent, /GX — GalaXy.*GaX/);
    assert.equal(galaxy.getAttribute('aria-expanded'), 'true');
    pikachu.click();
    assert.match(detail.textContent, /PK — PiKachu.*PiK/);
    assert.equal(galaxy.getAttribute('aria-expanded'), 'false');
    pikachu.click();
    assert.equal(detail.hidden, true);
});

test('pair casing marks both letters in order, with distinct occurrences for doubles', async () => {
    const {context} = await fixture('AB');
    assert.equal(context.memoPairCase('yawn', 'YW'), 'YaWn');
    assert.equal(context.memoPairCase('GALAXY', 'GX'), 'GalaXy');
    assert.equal(context.memoPairCase('gax', 'GX'), 'GaX');
    assert.equal(context.memoPairCase('banana', 'AA'), 'bAnAna');
    assert.equal(context.memoPairCase('cat', 'CC'), 'cat');
    assert.equal(context.memoPairCase('wax', 'XW'), 'wax');
    assert.equal(context.memoPairCase('fish', 'ZZ'), 'fish');
});

test('example stories preserve cue order and stop at missing words or annotations', async () => {
    const {context} = await fixture('AB');
    const cues = ['Kirby', 'astronaut', 'pixel', 'cog'].map(text => ({text, image: true}));
    assert.equal(context.memoExampleStory(cues), 'Picture Kirby beside astronaut, with pixel resting on cog.');
    assert.equal(context.memoExampleStory([
        {text: 'cube', image: true}, {text: 'ZZ', image: false},
        {text: '[Buffer C]', image: false}, {text: 'moon', image: true}
    ]), 'Picture cube. [ZZ] [Buffer C] Picture moon.');
});
test('bulk story uses highlighted cues and updates with the short-cue setting', async () => {
    const f = await fixture('GX PK A', {censored: true, words: {GX: 'GALAXY', PK: 'PIKACHU'}}, false, true);
    await f.click();
    assert.equal(f.panel.children.at(-1).children[1].textContent, 'Picture GalaXy beside PiKachu. [A]');
    f.toggle();
    assert.equal(f.panel.children.at(-1).children[1].textContent, 'Picture GaX beside PiK. [A]');
    assert.equal(f.calls, 1);
});

test('story explanation describes the full images beneath the short-cue story', async () => {
    const f = await fixture('GX PK', {censored: true, words: {GX: 'GALAXY', PK: 'PIKACHU'}}, false, true);
    await f.click();
    const expected = 'In this imagined scene, “GalaXy” and “PiKachu” appear side by side.';
    assert.equal(f.panel.children.at(-1).children[2].textContent, expected);
    assert.equal(f.panel.children.at(-1).children[2].className, 'memo-story-meaning');
    f.toggle();
    assert.equal(f.panel.children.at(-1).children[2].textContent, expected);
    assert.equal(f.calls, 1);
});

test('explanations cover five-image scenes and respect technique boundaries', async () => {
    const {context} = await fixture('AB');
    const cues = ['Kirby', 'astronaut', 'pixel', 'cog', 'moon'].map(text => ({text, image: true}));
    assert.equal(context.memoStoryMeaning(cues), 'In this imagined scene, “Kirby” and “astronaut” appear side by side. An image of “pixel” rests on a model of “cog”, near a representation of “moon”.');
    assert.equal(context.memoStoryMeaning([{text: 'cube', image: true}, {text: '[Buffer C]', image: false}, {text: 'moon', image: true}]),
        'Imagine a scene centered on an image of “cube”. Keep “[Buffer C]” as a separate memo cue. Imagine a scene centered on an image of “moon”.');
});

test('pair picker applies CoLPI and custom overrides to repeats and stories, then resets', async () => {
    const f = await fixture('GX GX', {censored: true, words: {GX: 'GALAXY'}}, false, true,
        {pair: 'GX', censored: true, words: ['GALAXY', 'GLOW BOX']});
    await f.click();
    f.panel.children[0].click();
    let detail = f.panel.children[3];
    await detail.children.at(-1).click();
    let dialog = f.context.document.body.children.at(-1);
    const select = dialog.children[2].children[0];
    assert.equal(select.children.length, 2);
    select.value = 'GLOW BOX';
    dialog.children[3].click();
    assert.equal(f.panel.children[0].textContent, 'Glow boX');
    assert.equal(f.panel.children[2].textContent, 'Glow boX');
    assert.match(f.panel.children.at(-1).children[1].textContent, /Glow boX beside Glow boX/);
    f.panel.children[0].click();
    await f.panel.children[3].children.at(-1).click();
    dialog = f.context.document.body.children.at(-1);
    dialog.children[4].children[0].value = '<b>green fox</b>';
    dialog.children[5].click();
    assert.equal(f.panel.children[0].textContent, '<b>Green foX</b>');
    f.panel.children[0].click();
    await f.panel.children[3].children.at(-1).click();
    f.context.document.body.children.at(-1).children[6].click();
    assert.equal(f.panel.children[0].textContent, 'GalaXy');
});
test('single memo missing words can be customized when CoLPI alternatives fail', async () => {
    const f = await fixture('ZZ', {censored: true, words: {}}, false, false, {censored: false});
    await f.panel.children[0].children.at(-1).click();
    const dialog = f.context.document.body.children.at(-1);
    assert.equal(dialog.children[3].disabled, true);
    dialog.children[4].children[0].value = '   ';
    dialog.children[5].click();
    assert.match(dialog.children.at(-1).textContent, /between 1 and 120/);
    dialog.children[4].children[0].value = 'zigzag';
    dialog.children[5].click();
    assert.equal(f.panel.children[0].children[1].textContent, 'ZigZag');
});

test('account words restore, save and remain usable after a failed account save', async () => {
    const state = {words: {GX: 'Glow box'}};
    const f = await fixture('GX', {censored: true, words: {GX: 'GALAXY'}}, false, false,
        {pair: 'GX', censored: true, words: ['GALAXY']}, state);
    assert.equal(f.panel.children[0].children[1].textContent, 'Glow boX');
    await f.panel.children[0].children.at(-1).click();
    let dialog = f.context.document.body.children.at(-1);
    dialog.children[8].children[0].checked = true;
    dialog.children[4].children[0].value = 'green fox';
    await dialog.children[5].click();
    assert.equal(state.words.GX, 'green fox');
    assert.equal(f.panel.children[0].children[1].textContent, 'Green foX');
    await f.panel.children[0].children.at(-1).click();
    dialog = f.context.document.body.children.at(-1);
    dialog.children[8].children[0].checked = true;
    dialog.children[4].children[0].value = 'glowing box';
    state.failSave = true;
    await dialog.children[5].click();
    assert.equal(state.words.GX, 'green fox');
    assert.match(dialog.children[9].textContent, /still applied on this page/);
    assert.equal(f.panel.children[0].children[1].textContent, 'Glowing boX');
});
test('signed-out picker provides a login link instead of an account checkbox', async () => {
    const f = await fixture('AB');
    await f.panel.children[0].children.at(-1).click();
    const control = f.context.document.body.children.at(-1).children[8];
    assert.equal(control.href, '/auth/wca?memo=1');
    assert.equal(control.target, '_blank');
    assert.equal(control.rel, 'noopener');
    assert.match(control.textContent, /log in with WCA/);
});

test('login in another tab keeps the picker draft and enables account save in place', async () => {
    const state = {words: {}, signedOut: true, loggedIn: true};
    const f = await fixture('GX', {censored: true, words: {GX: 'GALAXY'}}, false, false,
        {pair: 'GX', censored: true, words: ['GALAXY', 'GLOW BOX']}, state);
    await f.panel.children[0].children.at(-1).click();
    const dialog = f.context.document.body.children.at(-1);
    const draft = dialog.children[4].children[0];
    const selected = dialog.children[2].children[0];
    draft.value = 'green fox'; selected.value = 'GLOW BOX';
    const login = dialog.children[8];
    await login.click();
    assert.equal(draft.value, 'green fox');
    assert.equal(selected.value, 'GLOW BOX');
    assert.equal(f.context.document.body.children.length, 1);
    assert.equal(login.replacement.textContent, 'Save to my account');
    assert.equal(login.replacement.children[0].checked, true);
    assert.deepEqual(state.words, {});
    await dialog.children[5].click();
    assert.equal(state.words.GX, 'green fox');
});
