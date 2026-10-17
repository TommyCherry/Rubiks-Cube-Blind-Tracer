const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function setup(stored = 'en', blocked = false) {
    const events = {};
    const selector = {value: '', addEventListener: (name, fn) => { events[name] = fn; }};
    const text = {nodeType: 3, nodeValue: 'Generate Memo', parentElement: {closest: () => false}};
    const root = {nodeType: 1, childNodes: [text], closest: () => false, hasAttribute: () => false};
    let observe;
    const context = {
        window: {},
        localStorage: {getItem() {if (blocked) throw Error('blocked'); return stored;}, setItem(key, value) {if (blocked) throw Error('blocked'); stored = value;}},
        document: {documentElement: root, getElementById: () => selector, addEventListener(name, fn) {events[name] = fn;}},
        MutationObserver: class {constructor(fn) {observe = fn;} disconnect() {} observe() {}},
    };
    vm.runInNewContext(fs.readFileSync('static/i18n.js', 'utf8'), context);
    events.DOMContentLoaded();
    return {translate: context.window.TracerI18n.translate, text, root,
        change(language) {selector.value = language; events.change();},
        mutate(value) {text.nodeValue = value; observe([{type: 'characterData', target: text}]);},
        stored: () => stored};
}

test('language selection persists and reverses without losing original text', () => {
    const page = setup();
    page.change('zh');
    assert.equal(page.text.nodeValue, '生成记忆编码');
    assert.equal(page.root.lang, 'zh-Hans');
    assert.equal(page.stored(), 'zh');
    page.change('en');
    assert.equal(page.text.nodeValue, 'Generate Memo');
    assert.equal(page.root.lang, 'en');
});

test('restores Chinese, translates asynchronous messages, and restores new English source', () => {
    const page = setup('zh');
    page.mutate('Ready: 3 scrambles for 3e 3c. Select Trace scramble set below to analyze them.');
    assert.equal(page.text.nodeValue, '已就绪：共轭类 3e 3c 的 3 个打乱。请选择下方“追踪整组打乱”进行分析。');
    page.change('en');
    assert.equal(page.text.nodeValue, 'Ready: 3 scrambles for 3e 3c. Select Trace scramble set below to analyze them.');
});

test('preserves notation and interpolated names; specific patterns take priority', () => {
    const {translate} = setup('zh');
    for (const value of ["R U R' U'", 'UBL', "3e3e\'1e\' 3c", 'AB CD BE', '<img src=x>']) assert.equal(translate(value), value);
    assert.equal(translate('Round 1 · 12 cubes'), '轮次 1 · 12 个魔方');
    assert.equal(translate('Saved “My setup” to your profile.'), '已将“My setup”保存到个人资料。');
    assert.equal(translate('  Copy\n'), '  复制\n');
});

test('language switching still works when browser storage is blocked', () => {
    const page = setup('en', true);
    page.change('zh');
    assert.equal(page.text.nodeValue, '生成记忆编码');
    page.change('en');
    assert.equal(page.text.nodeValue, 'Generate Memo');
});
