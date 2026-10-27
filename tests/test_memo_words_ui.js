const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = ['memo_lexicon.js', 'memo_actions.js', 'memo_story.js', 'memo_words.js'].map(name => fs.readFileSync(`static/${name}`, 'utf8')).join('\n');

function element() {
    const attributes = {}, handlers = {};
    let ownText = '';

    return {children: [], get textContent() { return ownText + this.children.map(child => child.textContent || '').join(''); },
        set textContent(value) { ownText = value; this.children = []; }, classList: {add() {}},
        setAttribute(key, value) { attributes[key] = value; }, getAttribute(key) { return attributes[key]; }, removeAttribute(key) { delete attributes[key]; },
        addEventListener(type, fn) { handlers[type] = fn; }, click() { return handlers.click?.(); }, input() { return handlers.input?.(); }, change() { return handlers.change?.(); },
        replaceWith(replacement) { this.replacement = replacement; },
        showModal() {}, close() { handlers.close?.(); }, remove() {},
        append(...items) { this.children.push(...items); },
        appendChild(item) { this.children.push(item); }, replaceChildren() { ownText = ''; this.children = []; }};
}
async function fixture(memo, response = {censored: true, words: {AB: 'ABACUS', CD: '<b>CARD</b>'}}, failure = false, bulk = false, options = null, accountState = null, withScopes = false, language = 'en') {
    const panel = Object.assign(element(), {dataset: {memoWords: 'edge-memo'}});
    if (bulk) panel.dataset.bulkWords = '';
    const otherPanel = Object.assign(element(), {dataset: {memoWords: 'other-memo', bulkWords: '', storyRow: 'solve-2'}});
    const controls = withScopes ? ['solve-1', 'solve-2'].map(scope => {
        const low = Object.assign(element(), {value: '0.5'});
        const high = Object.assign(element(), {value: '1.5'});
        const output = element();
        return {dataset: {storySettings: scope}, low, high, output,
            querySelector: selector => selector === '[data-filler-low]' ? low : selector === '[data-filler-high]' ? high : output};
    }) : [];
    if (withScopes) panel.dataset.storyRow = 'solve-1';
    const showButtons = (withScopes ? ['solve-1', 'solve-2'] : ['single']).map(scope => Object.assign(element(), {dataset: {showStories: scope}}));
    let ready, calls = 0, change, click;
    const button = {disabled: false, setAttribute() {}, addEventListener(_, fn) { click = fn; }};
    const status = element();
    const filter = {checked: false, addEventListener(_, fn) { change = fn; }};
    const storage = new Map([['tracer-language', language]]);
    const languageSelector = Object.assign(element(), {value: language});
    const context = {Event, AbortController, setTimeout, clearTimeout, clearInterval, setInterval: () => 1,
        window: {addEventListener() {}, removeEventListener() {}},
        localStorage: {getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value)},
        document: {documentElement: {lang: language}, createTextNode: text => ({textContent: text}), body: element(), addEventListener(_, fn) { ready = fn; }, querySelectorAll: selector => selector === '[data-memo-words]' ? (withScopes ? [panel, otherPanel] : [panel]) : selector === '[data-one-syllable]' ? [filter] : selector === '[data-story-settings]' ? controls : selector === '[data-show-stories]' ? showButtons : [],
            getElementById: id => id === 'site-language' ? languageSelector : id === 'memo-account' ? (accountState ? {dataset: {signedIn: accountState.signedOut ? 'false' : 'true', csrf: 'test-csrf'}} : null) : id === 'load-bulk-memo-words' ? (bulk ? button : null) : id === 'bulk-memo-words-status' ? status : ({textContent: memo}), createElement: element},
        fetch: async (url, init) => { calls++;
            if (url === '/api/memo-story') {
                accountState.lastStoryRequest = JSON.parse(init.body);
                return {ok: !accountState.storyError, json: async () => accountState.storyError ? {error: 'Service unavailable'} : {scenes: accountState.storyScenes}};
            }
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
    return {panel, otherPanel, controls, showButtons, context, languageSelector, get calls() { return calls; }, button, status, click: () => click(), recover() { failure = false; }, filter, storage, toggle() { filter.checked = !filter.checked; change(); }};
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
    assert.equal(context.memoWordCue('ASSISTANT').short, null);
    assert.equal(context.memoWordCue('SEXUAL').short, null);
    assert.equal(context.memoWordCue('GALAXY', 'GX').short, 'gax');
    assert.equal(context.memoWordCue('PIKACHU', 'PK').short, 'pik');
    assert.equal(context.memoWordCue('BUTTERFLY', 'BF').short, 'fly');
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

test('bulk lookups load automatically and reuse one request for repeated pairs', async () => {
    const f = await fixture('GX GX PK', {censored: true, words: {GX: 'GALAXY', PK: 'PIKACHU'}}, false, true);
    assert.equal(f.calls, 1);
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
    assert.equal(f.calls, 3);
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
    assert.equal(context.memoExampleStory(cues), 'Kirby pushes astronaut juggles pixel, which bumps cog.');
    assert.equal(context.memoExampleStory([
        {text: 'cube', image: true}, {text: 'ZZ', image: false},
        {text: '[Buffer C]', image: false}, {text: 'moon', image: true}
    ]), 'cube. [ZZ] [Buffer C] moon.');
});
test('bulk story uses highlighted cues and updates with the short-cue setting', async () => {
    const f = await fixture('GX PK A', {censored: true, words: {GX: 'GALAXY', PK: 'PIKACHU'}}, false, true);
    await f.click();
    assert.match(f.panel.children.at(-1).children[1].textContent, /^The GalaXy.*PiKachu\. \[A\]$/);
    f.toggle();
    assert.match(f.panel.children.at(-1).children[1].textContent, /^The GaX.*PiK\. \[A\]$/);
    assert.equal(f.calls, 1);
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
    assert.match(f.panel.children.at(-1).children[1].textContent, /Glow boX.*Glow boX/);
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

test('filler ranges affect only their solve, enforce bounds, and color connectors separately', async () => {
    const f = await fixture('GX PK GX PK GX', {censored: true, words: {GX: 'GALAXY', PK: 'PIKACHU'}}, false, true, null, null, true);
    await f.click();
    const untouched = f.otherPanel.children.at(-1).children[1].textContent;
    const first = f.controls[0];
    first.high.value = '0'; first.high.input();
    assert.equal(first.low.value, '0');
    const sentence = f.panel.children.at(-1).children[1];
    assert.equal(sentence.textContent, 'GalaXy → PiKachu → GalaXy → PiKachu → GalaXy.');
    assert.equal(sentence.children.filter(child => child.className === 'story-cue').length, 5);
    assert.equal(sentence.children.filter(child => child.className === 'story-filler').length, 5);
    first.low.value = '2'; first.low.input();
    assert.equal(first.high.value, '2');
    const fillers = sentence.children.filter(child => child.className === 'story-filler')
        .map(child => child.textContent).join(' ').match(/[a-z]+/g);
    assert.ok(fillers.length > 0 && fillers.length <= 10);
    assert.ok(!fillers.some(word => ['can', 'could', 'would'].includes(word)));
    assert.equal(f.otherPanel.children.at(-1).children[1].textContent, untouched);
    assert.equal(f.calls, 1);
});


test('local stories work signed out without extra requests and use original meanings for short cues', async () => {
    const f = await fixture('BY GL KB A', {censored: true, words: {BY: 'boy', GL: 'girl', KB: 'keyboard (qwerty)'}}, false, true);
    await f.click();
    const story = f.panel.children.at(-1);
    assert.equal(story.children.length, 3);
    assert.match(story.children[2].textContent, /young person/);
    assert.match(story.children[2].textContent, /keys that click/);
    assert.match(story.children[2].textContent, /\[A\]$/);
    f.toggle();
    assert.match(f.panel.children.at(-1).children[2].textContent, /keys that click/);
    assert.equal(f.calls, 1);
});

test('connections use categories, portable properties, and grammatical plurals', async () => {
    const {context} = await fixture('AB');
    const cue = text => ({text, image: true});
    assert.equal(context.memoConnection(cue('boy'), cue('girl'), 0, 2).compact, ' waves to ');
    assert.equal(context.memoConnection(cue('boy'), cue('girl'), 1, 2).compact, ' stands behind ');
    assert.equal(context.memoConnection(cue('girl'), cue('keyboard (qwerty)'), 0, 2).compact, ' types on ');
    assert.equal(context.memoConnection(cue('boy'), cue('galaxy'), 0, 2).compact, ' moves toward ');
    assert.equal(context.memoConnection(cue('boy'), cue('teddy bear'), 0, 2).compact, ' picks up ');
    assert.equal(context.memoConnection(cue('oyster'), cue('nuggets'), 0, 1).compact, ' reveals ');
    assert.equal(context.memoConnection(cue('teddy bear'), cue('cog'), 0, 2).compact, ' bumps into ');
    assert.equal(context.memoConnection(cue('queue'), cue('saxophone'), 0, 1).compact, ' surrounds ');
    assert.match(context.memoStoryPlan([cue('nuggets'), cue('elf')], 1).meaning, /nuggets.*catch the attention of the elf/);
    assert.match(context.memoExampleStory([cue('ducks'), cue('keyboard (qwerty)')], 2), /ducks touch the/);
    assert.match(context.memoStoryPlan([cue('ducks'), cue('keyboard (qwerty)')], 1).meaning, /ducks touch/);
    assert.match(context.memoStoryPlan([cue('oyster'), cue('keyboard (qwerty)')], 1).meaning, /oyster.*reveals/);
});

test('unknown words get directional links, boundaries block connections, and markup stays plain text', async () => {
    const {context} = await fixture('AB');
    const plan = context.memoStoryPlan([{text: '<script>unknown</script>', image: true}, {text: 'boy', image: true},
        {text: '[Parity]', image: false}, {text: 'oyster', image: true}], 2);
    assert.match(plan.meaning, /<script>unknown<\/script> pushes/);
    assert.match(plan.meaning, /\[Parity\] Keep/);
    assert.doesNotMatch(plan.meaning, /toy labeled|bounces/);
    const f = await fixture('AB CD', {censored: true, words: {AB: '<img onerror=alert(1)>', CD: 'boy'}});
    assert.equal(f.panel.children.at(-1).children[2].children.length, 0);
});

test('concrete stand-ins drive connections without replacing the memo cue', async () => {
    const {context} = await fixture('AB');
    const cue = text => ({text, image: true});
    const plan = context.memoStoryPlan([cue('boy'), cue('SiRi'), cue('jar')], 2);
    assert.equal(context.memoLexeme(cue('SiRi')).category, 'object');
    assert.equal(context.memoConnection(cue('boy'), cue('SiRi'), 0, 2).compact, ' picks up ');
    assert.match(plan.meaning, /tosses a phone .*representing “SiRi”/);
    assert.match(plan.meaning, /the glowing phone representing “SiRi” keeps moving and knocks over the jar/);
    assert.deepEqual(Array.from(plan.parts.filter(p => p.kind === 'cue'), p => p.text), ['boy', 'SiRi', 'jar']);
});

test('stand-ins retain number agreement and work as standalone images across boundaries', async () => {
    const {context} = await fixture('AB');
    const cue = text => ({text, image: true});
    const plan = context.memoStoryPlan([cue('two (ii)'), cue('box'), {text: '[Parity]', image: false}, cue('love')], 2);
    assert.match(plan.meaning, /Two upright wooden counting sticks representing “two \(ii\)” are inside/);
    assert.match(plan.meaning, /\[Parity\] Keep a soft heart-shaped cushion representing “love” as a separate image/);
    assert.match(context.memoStoryPlan([cue('rage'), cue('teddy bear')], 1).meaning, /person stamping a foot representing “rage” tosses/);
});

test('stand-in meanings survive short cues and render without additional requests', async () => {
    const f = await fixture('SR JR', {censored: true, words: {SR: 'SIRI', JR: 'JAR'}}, false, true);
    await f.click();
    assert.match(f.panel.children.at(-1).children[2].textContent, /phone.*representing “SiRi”/);
    f.toggle();
    assert.match(f.panel.children.at(-1).children[2].textContent, /phone.*representing “SiRi”/);
    assert.equal(f.panel.children.at(-1).children[2].children.length, 0);
    assert.equal(f.calls, 1);
});

test('all authored stand-ins include physical grammar and an explicit cue association', async () => {
    const {context} = await fixture('AB');
    const dictionary = vm.runInNewContext('MEMO_LEXICON', context);
    let count = 0;
    for (const [word, entry] of Object.entries(dictionary)) {
        if (!entry.representation) continue;
        count++;
        const r = entry.representation;
        assert.ok(r.phrase && r.definite, word);
        assert.ok(['singular', 'plural', 'mass'].includes(r.number), word);
        assert.ok(Array.isArray(r.properties), word);
        const result = context.memoStoryPlan([{text: word, image: true}], 1);
        assert.ok(result.meaning.includes(`representing “${word}”`), word);
    }
    assert.ok(count >= 60);
});

test('grammar budget adds articles, relative clauses and conjunctions without moving cues', async () => {
    const {context} = await fixture('AB');
    const cues = ['boy', 'girl', 'phone'].map(text => ({text, image: true}));
    assert.equal(context.memoExampleStory(cues, 2), 'The boy greets the girl, who juggles the phone.');
    assert.equal(context.memoExampleStory(cues.slice(0, 2), 2), 'The boy greets the girl.');
    const plan = context.memoStoryPlan([...cues, {text: 'jar', image: true}], 2);
    assert.match(plan.meaning, /Then, /);
    assert.match(plan.meaning, /Then, .*keeps moving and knocks over/);
    assert.deepEqual(Array.from(plan.parts.filter(p => p.kind === 'cue'), p => p.text), ['boy', 'girl', 'phone', 'jar']);
    const filler = plan.parts.filter(p => p.kind === 'filler').map(p => p.text).join(' ');
    assert.ok((filler.match(/[a-z]+/gi) || []).length <= 8);
    assert.equal(context.memoExampleStory(cues, 0), 'boy → girl → phone.');
    assert.match(context.memoStoryPlan(cues, 0).meaning, /greets/);
});

test('directional fallbacks vary and actions agree with singular and plural images', async () => {
    const {context} = await fixture('AB');
    const cue = text => ({text, image: true});
    const cues = ['unknown one', 'unknown two', 'unknown three', 'unknown four', 'unknown five'].map(cue);
    const plan = context.memoStoryPlan(cues, 2);
    assert.match(plan.meaning, /pushes/);
    assert.match(plan.meaning, /lifts/);
    assert.match(plan.meaning, /pulls/);
    assert.match(plan.meaning, /spins/);
    assert.doesNotMatch(plan.meaning, /\b(can|could|would|might|may|should)\b/);
    assert.match(context.memoExampleStory([cue('ducks'), cue('girl')], 2), /ducks nudge the girl/);
});

test('reviewed sound clips override literal pair forcing and expose syllable boundaries', async () => {
    const {context} = await fixture('AB');
    const guac = context.memoWordCue('GUACAMOLE', 'GQ');
    assert.equal(guac.short, 'guac');
    assert.deepEqual(Array.from(guac.syllables), ['gua', 'ca', 'mo', 'le']);
    assert.equal(context.memoWordCue('guacamole', 'gq').short, 'guac');
    assert.equal(context.memoWordCue('guacamole', 'ZZ').short, 'guac');
    assert.equal(context.memoWordCue('RACQUET', 'RQ').short, 'rack');
    assert.equal(context.memoWordCue('GALAXY', 'GX').short, 'gax');
    assert.equal(context.memoWordCue('GALAXY', 'GL').short, 'gal');
    assert.equal(context.memoWordCue('QUEUE', 'QU').generated, false);
    assert.equal(context.memoWordCue('XYLOPHONE', 'XY').short, 'zile');
    assert.equal(context.memoWordCue('unreviewedword', 'ZZ').short, null);
});

test('guac renders in cards and bulk stories while GQ and the original word remain available', async () => {
    for (const bulk of [false, true]) {
        const f = await fixture('GQ A', {censored: true, words: {GQ: 'GUACAMOLE'}}, false, bulk);
        if (bulk) await f.click();
        f.toggle();
        const item = f.panel.children[0];
        assert.equal(bulk ? item.textContent : item.children[1].textContent, 'guac');
        if (bulk) {
            item.click();
            assert.match(f.panel.children[3].textContent, /GQ — GUACAMOLE.*Short cue: guac/);
        } else assert.equal(item.children[0].textContent, 'GQ');
        assert.match(f.panel.children.at(-1).children[1].textContent, /guac/);
        assert.doesNotMatch(f.panel.textContent, /GuQ/);
        assert.match(f.panel.children.at(-1).children[2].textContent, /guacamole/i);
    }
});

test('pronunciation metadata has nonempty syllable chunks and explicit short sounds', async () => {
    const {context} = await fixture('AB');
    const dictionary = vm.runInNewContext('MEMO_LEXICON', context);
    for (const [word, entry] of Object.entries(dictionary)) {
        if (!entry.pronunciation) continue;
        const p = entry.pronunciation;
        assert.ok(p.syllables.length && p.syllables.every(s => typeof s === 'string' && s.trim()), word);
        assert.ok(typeof p.shortCue === 'string' && p.shortCue.length >= 2, word);
        const spelling = word.replace(/\([^)]*\)/g, '').replace(/\s/g, '');
        assert.equal(p.syllables.join('').replace(/\s/g, ''), spelling, word);
    }
});

test('wearer, passenger, driver and thought roles connect the supplied example', async () => {
    const {context} = await fixture('AB');
    const words = ['blindfold', 'cog', 'taxi', 'Ian', 'Jesus', 'head'];
    const cues = words.map(text => ({text, image: true}));
    cues.push({text: 'Q', image: false});
    const plan = context.memoStoryPlan(cues, 2);
    assert.equal(plan.parts.map(p => p.text).join(''), 'blindfold-wearing cog takes a taxi with driver Ian thinking about Jesus in their head. [Q]');
    assert.deepEqual(Array.from(plan.parts.filter(p => p.kind === 'cue'), p => p.text), words);
    assert.match(plan.meaning, /The blindfold wraps itself around the cog/);
    assert.match(plan.meaning, /taxi has Ian as its driver/);
    assert.match(plan.meaning, /In this imaginary scene, Ian is thinking about Jesus/);
    assert.match(plan.meaning, /inside Ian’s head\. \[Q\]$/);
    assert.doesNotMatch(plan.meaning, /is religious/);
});

test('role rules generalize across wearers, vehicles and operators without crossing boundaries', async () => {
    const {context} = await fixture('AB');
    const cue = text => ({text, image: true});
    const cues = ['hat', 'boy', 'helicopter', 'chef', 'oyster', 'head'].map(cue);
    const full = context.memoStoryPlan(cues, 2);
    assert.match(full.parts.map(p => p.text).join(''), /hat-wearing boy takes a helicopter with pilot chef thinking about oyster in their head/);
    assert.match(full.meaning, /helicopter has the chef as its pilot/);
    const zero = context.memoStoryPlan(cues, 0);
    assert.equal(zero.parts.map(p => p.text).join(''), 'hat → boy → helicopter → chef → oyster → head.');
    assert.equal(zero.meaning, full.meaning);
    const split = context.memoStoryPlan([cue('taxi'), {text: '[Parity]', image: false}, cue('Ian')], 2);
    assert.doesNotMatch(split.meaning, /driver/);
    assert.match(context.memoStoryPlan(['hat', 'ducks', 'bus'].map(cue), 2).meaning, /ducks get into the bus/);
});

test('action frames select specific physical interactions for apple juice', async () => {
    const {context} = await fixture('AB');
    const cue = text => ({text, image: true});
    for (const [target, id] of [['cup', 'fill-vessel'], ['astronaut', 'visor-splash'],
        ['keyboard (qwerty)', 'sticky-keys'], ['teddy bear', 'soak-fabric'], ['ice', 'freeze-liquid'], ['boy', 'drink']]) {
        assert.equal(context.memoActionPlan([cue('apple juice'), cue(target)])[0].id, id);
    }
    assert.equal(context.memoActionPlan([cue('boy'), cue('apple juice')])[0].id, 'sip');
    assert.match(context.memoStoryPlan([cue('apple juice'), cue('keyboard (qwerty)')], 2).meaning, /leaving them sticky/);
    assert.match(context.memoStoryPlan([cue('apple juice'), cue('cup')], 2).meaning, /golden splash/);
});

test('effects propagate through the scene, reset at boundaries, and do not leak to other solves', async () => {
    const {context} = await fixture('AB');
    const cue = text => ({text, image: true});
    const cues = ['apple juice', 'teddy bear', 'keyboard (qwerty)', 'cog'].map(cue);
    const plan = context.memoActionPlan(cues);
    assert.deepEqual(Array.from(plan, a => a.id), ['soak-fabric', 'drip-keys', 'sticky-transfer']);
    assert.ok(plan[1].effects.includes('jammed'));
    const story = context.memoStoryPlan(cues, 2);
    assert.match(story.meaning, /still wet/);
    assert.match(story.meaning, /now sticky/);
    assert.deepEqual(Array.from(story.parts.filter(p => p.kind === 'cue'), p => p.text), cues.map(c => c.text));
    assert.equal(context.memoActionPlan([cue('teddy bear'), cue('keyboard (qwerty)')])[0], null);
    assert.doesNotMatch(context.memoStoryPlan([cue('apple juice'), cue('teddy bear'), {text:'[Parity]', image:false}, cue('keyboard (qwerty)'), cue('cog')], 2).meaning, /still wet|now sticky/);
    assert.deepEqual(Array.from(context.memoActionPlan(['apple juice', 'cup', 'teddy bear'].map(cue)), a => a.id), ['fill-vessel', 'filled-pour']);
});

test('context scoring varies repeated actions and supports mechanics, sound, and magnetism', async () => {
    const {context} = await fixture('AB');
    const cue = text => ({text, image: true});
    const repeated = context.memoActionPlan(['boy','phone','girl','phone'].map(cue));
    assert.equal(repeated[0].id, 'juggle');
    assert.equal(repeated[2].id, 'inspect');
    assert.deepEqual(Array.from(context.memoActionPlan(['ball','domino','vase'].map(cue)), a => a.id), ['roll-knock','momentum']);
    assert.deepEqual(Array.from(context.memoActionPlan(['cog','sock','vase'].map(cue)), a => a.id), ['cog-fabric','tangled-wrap']);
    assert.deepEqual(Array.from(context.memoActionPlan(['boy','saxophone','cat'].map(cue)), a => a.id), ['play-music','continuing-note']);
    assert.equal(context.memoActionPlan(['magnet','cog'].map(cue))[0].id,'magnet-metal');
    assert.equal(context.memoActionPlan(['unknown custom word','cup'].map(cue))[0],null);
});

test('action stories honor filler bounds, singular/plural grammar, and symbolic stand-ins', async () => {
    const {context} = await fixture('AB');
    const cue = text => ({text, image: true});
    const cues = ['apple juice','teddy bear','keyboard (qwerty)'].map(cue);
    for(const average of [0,0.5,1,1.5,2]) {
        const plan=context.memoStoryPlan(cues,average);
        const filler=plan.parts.filter(p=>p.kind==='filler').map(p=>p.text).join(' ');
        assert.ok((filler.match(/[a-z]+/gi)||[]).length<=Math.round(average*cues.length));
        assert.match(plan.meaning,/soaks into/);
    }
    assert.match(context.memoStoryPlan(['nuggets','boy'].map(cue),2).meaning,/nuggets.*catch the attention/);
    const symbolic=context.memoStoryPlan(['apple juice','Siri'].map(cue),2);
    assert.match(symbolic.meaning,/phone.*representing “Siri”/);
    assert.match(symbolic.parts.map(p=>p.text).join(''),/Siri/);
    assert.ok(context.memoActionProfile(cue('love')).tags.has('absorbent'));
});

test('every shipped entry has an extended profile, with unknowns kept conservative', async () => {
    const {context}=await fixture('AB');
    const dictionary=vm.runInNewContext('MEMO_LEXICON', context);
    for(const [word,entry] of Object.entries(dictionary)) {
        for(const field of ['tags','canDo','canReceive','associations']) assert.ok(Array.isArray(entry.affordances[field]),`${word}: ${field}`);
        assert.equal(typeof entry.affordances.detail,'string');
    }
    assert.equal(context.memoActionProfile({text:'unreviewed input'}).tags.size,0);
    assert.ok(dictionary['apple juice'].affordances.associations.includes('cup'));
});

test('bulk action stories render without extra requests and keep meaning under short sounds', async () => {
    const f = await fixture('AJ TB KB', {censored:true, words:{AJ:'apple juice',TB:'teddy bear',KB:'keyboard (qwerty)'}}, false, true);
    await f.click();
    assert.match(f.panel.children.at(-1).children[1].textContent, /soaks/);
    assert.match(f.panel.children.at(-1).children[2].textContent, /still wet/);
    f.toggle();
    assert.match(f.panel.children.at(-1).children[1].textContent, /juice/);
    assert.match(f.panel.children.at(-1).children[2].textContent, /still wet/);
    assert.equal(f.calls,1);
});

test('head as the second image does not invent a missing thinker or discard words', async () => {
    const f = await fixture('BY HD', {censored:true, words:{BY:'boy',HD:'head'}}, false, true);
    await f.click();
    assert.equal(f.panel.children[0].textContent,'BoY');
    assert.equal(f.panel.children[2].textContent,'HeaD');
    assert.doesNotMatch(f.panel.textContent,/unavailable/);
    assert.doesNotMatch(f.panel.children.at(-1).children[2].textContent,/thinking about|inside .*head/);
    assert.equal(f.button.disabled,true);
});

test('a story exception preserves word examples, other panels, and successful bulk loading', async () => {
    const f = await fixture('BY HD', {censored:true, words:{BY:'boy',HD:'head'}}, false, true, null, null, true);
    const normal = f.context.memoStoryPlan;
    let calls=0;
    f.context.memoStoryPlan=(...args)=>{ if (++calls===1) throw new Error('Synthetic story failure'); return normal(...args); };
    f.context.console={error(){}};
    f.toggle();
    assert.equal(f.panel.children[0].textContent,'BoY');
    assert.match(f.panel.children.at(-1).textContent,/Story generation is unavailable/);
    assert.doesNotMatch(f.otherPanel.textContent,/unavailable/);
    assert.equal(f.otherPanel.children[0].textContent,'BoY');
    assert.equal(f.button.disabled,true);
    assert.equal(f.calls,1);
    f.controls[0].high.input();
    assert.doesNotMatch(f.panel.textContent,/unavailable/);
});

for (const bulk of [false, true]) test(`Chinese workbook words render without English stories (bulk=${bulk})`, async () => {
    const f = await fixture('AB AC AI Q [Parity]', {language:'zh',source:'chinese_workbook',words:{AB:'阿波罗',AC:'鹌鹑蛋',AI:null}}, false, bulk, null, null, false, 'zh');
    if (bulk) await f.click();
    assert.match(f.panel.textContent,/阿波罗/);
    assert.match(f.panel.textContent,/鹌鹑蛋/);
    assert.match(f.panel.textContent,/AI/);
    assert.match(f.panel.textContent,/\[Parity\]/);
    assert.doesNotMatch(f.panel.textContent,/Example sentence|short cue|Choose word/);
    f.toggle();
    assert.match(f.panel.textContent,/阿波罗/);
});

test('changing language reloads loaded pairs and restores English stories', async () => {
    const f = await fixture('AB');
    const urls=[];
    f.context.fetch=async url=>{urls.push(url);return {ok:true,json:async()=>url.includes('language=zh')
        ? {language:'zh',source:'chinese_workbook',words:{AB:'阿波罗'}}
        : {language:'en',censored:true,words:{AB:'abacus'}}};};
    f.languageSelector.value='zh';
    await f.languageSelector.change();
    assert.match(f.panel.textContent,/阿波罗/);
    assert.doesNotMatch(f.panel.textContent,/Example sentence/);
    f.languageSelector.value='en';
    await f.languageSelector.change();
    assert.match(f.panel.textContent,/ABacus/);
    assert.match(f.panel.textContent,/Example sentence/);
    assert.equal(urls.length,2);
});

test('reversed person/message and person/animal cues have distinct active roles', async () => {
    const {context}=await fixture('AB');
    const cue=text=>({text,original:text,image:true});
    for (const [left,right,verb,explanation] of [
        ['boy','email','sends',/boy.*presses send.*email/],
        ['email','boy','alerts',/email.*flashes and rings.*boy/],
        ['boy','dog','pets',/boy.*reaches out first.*dog/],
        ['dog','boy','nudges',/dog.*moves first.*boy/],
    ]) {
        const cues=[cue(left),cue(right)];
        const plan=context.memoStoryPlan(cues,2);
        assert.match(plan.parts.map(p=>p.text).join(''),new RegExp(`${left} ${verb} the ${right}`));
        assert.match(plan.meaning,explanation);
        assert.doesNotMatch(plan.meaning,/beside|near|is .* by/);
        assert.equal(context.memoExampleStory(cues,0),`${left} → ${right}.`);
    }
});

test('direction survives a three-image chain and stops at annotations', async () => {
    const {context}=await fixture('AB');
    const cue=text=>({text,image:true});
    const plan=context.memoStoryPlan(['boy','email','girl'].map(cue),2);
    assert.match(plan.meaning,/boy.*presses send.*email.*Then.*email.*flashes and rings.*girl/);
    assert.deepEqual(Array.from(plan.parts.filter(p=>p.kind==='cue'),p=>p.text),['boy','email','girl']);
    const split=context.memoStoryPlan([cue('boy'),{text:'[Parity]',image:false},cue('email')],0);
    assert.doesNotMatch(split.meaning,/presses send|flashes and rings/);
});

test('AA through AG uses physical attributes and explicit stand-ins instead of generic pushes', async () => {
    const {context}=await fixture('AB');
    const words=['AA battery','ABs','Air Conditioner','AD (advertisement)','ApplE','AFro','AnGel'];
    const cues=words.map(text=>({text,original:text,image:true}));
    assert.deepEqual(Array.from(context.memoActionPlan(cues),a=>a.id),
        ['roll-body','strong-lift','back-display','sign-spin','roll-hair','spring-flight']);
    const plan=context.memoStoryPlan(cues,2);
    assert.deepEqual(Array.from(plan.parts.filter(p=>p.kind==='cue'),p=>p.text),words);
    assert.match(plan.meaning,/rolls into the exposed abdomen of a person with defined abdominal muscles/);
    assert.match(plan.meaning,/person with defined abs.*braces their torso and lifts/);
    assert.match(plan.meaning,/pasted across its back panel/);
    assert.match(plan.meaning,/display stand and spins the ApplE/);
    assert.match(plan.meaning,/ApplE rolls into.*afro wig.*caught among the strands/);
    assert.match(plan.meaning,/afro.*rebounds and launches.*AnGel/);
    assert.doesNotMatch(plan.meaning,/the image|pushes|could|can /);
});

test('new physical rules generalize beyond the supplied pairs and retain direction', async () => {
    const {context}=await fixture('AB');
    const cue=text=>({text,original:text,image:true});
    for(const [words,id] of [
        [['ball','abs'],'roll-body'],
        [['air conditioner','poster'],'back-display'],
        [['poster','orange'],'sign-spin'],
        [['orange','wig'],'roll-hair'],
        [['ball','hair'],'roll-hair'],
        [['trampoline','angel'],'spring-flight'],
    ]) assert.equal(context.memoActionPlan(words.map(cue))[0].id,id);
    assert.notEqual(context.memoActionPlan(['angel','afro'].map(cue))[0]?.id,'spring-flight');
    const split=context.memoStoryPlan([cue('apple'),{text:'[Parity]',image:false},cue('afro')],2);
    assert.doesNotMatch(split.meaning,/gets caught|launches/);
});

test('afro, Jesus Christ and xenon use wearable and periodic-table representations', async () => {
    const {context}=await fixture('AB');
    const cues=['AFro','Jesus Christ','XEnon','ToY','HI (hello)','ZiGzagoon (pokemon)'].map(text=>({text,original:text,image:true}));
    const actions=context.memoActionPlan(cues);
    assert.equal(actions[0].id,'headwear-person');
    assert.equal(actions[1].id,'person-element');
    assert.equal(actions[2].id,'tile-label');
    const plan=context.memoStoryPlan(cues,2);
    assert.match(plan.meaning,/afro wig.*settles onto the head of Jesus Christ/);
    assert.match(plan.meaning,/Jesus Christ faces toward you/);
    assert.match(plan.meaning,/Jesus Christ turns away from you/);
    assert.match(plan.meaning,/colourless noble gas, element 54 on the periodic table/);
    assert.match(plan.meaning,/tile marked Xe, 54/);
    assert.match(plan.meaning,/prints its element symbol and atomic number onto the ToY/);
    assert.doesNotMatch(plan.meaning,/the image|lifts.*XEnon/);
    assert.deepEqual(Array.from(plan.parts.filter(p=>p.kind==='cue'),p=>p.text),cues.map(c=>c.text));
});

test('facing convention reverses with object/person order and resets at boundaries', async () => {
    const {context}=await fixture('AB');
    const cue=text=>({text,image:true});
    assert.match(context.memoStoryPlan(['wig','boy'].map(cue),2).meaning,/boy faces toward you/);
    assert.match(context.memoStoryPlan(['boy','wig'].map(cue),2).meaning,/boy faces away from you/);
    assert.match(context.memoStoryPlan(['toy','boy','email'].map(cue),2).meaning,/boy faces toward you.*boy turns away from you/);
    const split=context.memoStoryPlan([cue('toy'),{text:'[Parity]',image:false},cue('boy')],2);
    assert.doesNotMatch(split.meaning,/faces|turns/);
    assert.doesNotMatch(context.memoStoryPlan(['mystery','boy'].map(cue),2).meaning,/the image/);
});

test('Jay uses a ladder to reach a safe and discover its contents', async () => {
    const {context}=await fixture('AB');
    const words=['JaY','LaDder','SaFe','BaNana'];
    const cues=words.map(text=>({text,original:text,image:true}));
    const plan=context.memoStoryPlan(cues,2);
    assert.equal(plan.parts.map(p=>p.text).join(''),'JaY climbs the LaDder to reach the SaFe containing BaNana.');
    assert.match(plan.meaning,/A person named JaY climbs/);
    assert.match(plan.meaning,/From the top of the LaDder, JaY reaches the SaFe, placed on a high shelf/);
    assert.match(plan.meaning,/SaFe opens to reveal the BaNana tucked inside/);
    assert.doesNotMatch(plan.meaning,/pushes|lifts|pulls/);
    assert.deepEqual(Array.from(plan.parts.filter(p=>p.kind==='cue'),p=>p.text),words);
    const sparse=context.memoStoryPlan(cues,0);
    assert.equal(sparse.parts.map(p=>p.text).join(''),'JaY → LaDder → SaFe → BaNana.');
    assert.match(sparse.meaning,/JaY reaches the SaFe/);
});

test('climbing and storage rules generalize, reverse, and respect boundaries', async () => {
    const {context}=await fixture('AB');
    const cue=text=>({text,original:text,image:true});
    const plan=context.memoStoryPlan(['boy','ladder','box','apple'].map(cue),2);
    assert.equal(plan.parts.map(p=>p.text).join(''),'boy climbs the ladder to reach the box containing apple.');
    assert.equal(context.memoActionPlan(['safe','banana'].map(cue))[0].id,'storage-contents');
    assert.equal(context.memoActionPlan(['banana','safe'].map(cue))[0].id,'contents-storage');
    assert.equal(context.memoActionPlan(['ladder','safe'].map(cue))[0].id,'ladder-rest');
    assert.notEqual(context.memoActionPlan(['safe','air conditioner'].map(cue))[0]?.id,'storage-contents');
    const split=context.memoStoryPlan([cue('jay'),{text:'[Parity]',image:false},cue('ladder'),cue('safe')],2);
    assert.doesNotMatch(split.meaning,/Jay reaches|jay reaches|climbs/);
    assert.match(split.meaning,/leans against/);
});

test('single words appear automatically while the green story control reveals stories without another request', async () => {
    const f=await fixture('AB');
    assert.equal(f.calls,1);
    assert.match(f.panel.textContent,/ABacus/);
    assert.equal(f.panel.children.at(-1).hidden,true);
    f.showButtons[0].click();
    assert.equal(f.panel.children.at(-1).hidden,false);
    assert.equal(f.showButtons[0].getAttribute('aria-expanded'),'true');
    assert.equal(f.calls,1);
    f.toggle();
    assert.equal(f.panel.children.at(-1).hidden,false);
});

test('bulk story buttons reveal only their own solve while all words load automatically', async () => {
    const f=await fixture('AB', {censored:true,words:{AB:'abacus'}}, false,true,null,null,true);
    assert.equal(f.calls,1);
    assert.equal(f.panel.children.at(-1).hidden,true);
    assert.equal(f.otherPanel.children.at(-1).hidden,true);
    f.showButtons[0].click();
    assert.equal(f.panel.children.at(-1).hidden,false);
    assert.equal(f.otherPanel.children.at(-1).hidden,true);
    assert.equal(f.controls[0].hidden,false);
    assert.equal(f.calls,1);
});

test('testing-mode story toggle hides and reopens one scramble without hiding its words', async () => {
    const f=await fixture('AB', {censored:true,words:{AB:'abacus'}}, false,true,null,null,true);
    f.showButtons[0].click();
    f.showButtons[1].click();
    assert.equal(f.showButtons[0].textContent,'Hide memo sentences/stories (in testing mode)');
    f.showButtons[0].click();
    assert.equal(f.showButtons[0].textContent,'Show memo sentences/stories (in testing mode)');
    assert.equal(f.showButtons[0].getAttribute('aria-expanded'),'false');
    assert.equal(f.panel.children.at(-1).hidden,true);
    assert.equal(f.controls[0].hidden,true);
    assert.equal(f.otherPanel.children.at(-1).hidden,false);
    assert.equal(f.panel.children[0].textContent,'ABacus');
    f.showButtons[0].click();
    assert.equal(f.panel.children.at(-1).hidden,false);
    assert.equal(f.controls[0].hidden,false);
    assert.equal(f.calls,1);
});
