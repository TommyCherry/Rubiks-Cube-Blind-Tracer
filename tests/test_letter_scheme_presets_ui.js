const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

// Read the reference as face grids, including the user's replacements for crosses.
// Entries are in reading order, omitting the center of each face.
const reference = {
    U: ['UBL UB UBR UL UR UFL UF UFR', 'D E G C G A A J', '#ffd92f'],
    L: ['LUB LU LUF LB LF LDB LD LDF', 'E D C X T Q L M', '#2468d8'],
    F: ['FUL FU FUR FL FR FDL FD FDR', 'B B L S Q N J Y', '#e53935'],
    R: ['RUF RU RUB RF RB RDF RD RDB', 'K H I R Z Z P S', '#20a84a'],
    B: ['BUR BU BUL BR BL BDR BD BDL', 'H F F Y W T N P', '#ff8c00'],
    D: ['DFL DF DFR DL DR DBL DB DBR', 'W I X K O O M R', '#ffffff'],
};

const speffz = {};
[
    ['UB UR UF UL', 'UBL UBR UFR UFL'],
    ['LU LF LD LB', 'LUB LUF LDF LDB'],
    ['FU FR FD FL', 'FUL FUR FDR FDL'],
    ['RU RB RD RF', 'RUF RUB RDB RDF'],
    ['BU BL BD BR', 'BUR BUL BDL BDR'],
    ['DF DR DB DL', 'DFL DFR DBR DBL'],
].forEach((groups, face) => groups.forEach(group => group.split(' ').forEach((position, index) => {
    speffz[position] = String.fromCharCode(65 + face * 4 + index);
})));
const speffzColors = {U: '#ffffff', F: '#20a84a', R: '#e53935', L: '#ff8c00', B: '#2468d8', D: '#ffd92f'};

function fixture() {
    const stickers = Object.values(reference).flatMap(([positions]) => positions.split(' '))
        .map(position => ({name: `letter_${position}`, value: '?', dataset: {speffz: speffz[position]}}));
    const buttons = {};
    const pickers = Object.fromEntries(Object.keys(reference).map(face => [`color-${face.toLowerCase()}`, {value: '#000000'}]));
    const saved = {};
    let refreshCount = 0;
    const context = {
        document: {
            getElementById(id) {
                if (['apply-chi-chu', 'reset-speffz', 'apply-chinese-speffz'].includes(id)) return {addEventListener: (event, callback) => {buttons[id] = callback;}};
                return pickers[id];
            },
            querySelectorAll: () => stickers,
        },
        colorScheme: {U: '#000000'}, cubeOrientation: {U: '#123456'},
        updateCubeColors() { saved.rendered = {...context.cubeOrientation}; },
        saveCubeColors() { saved.colors = {...context.colorScheme}; saved.orientation = {...context.cubeOrientation}; },
        saveLetterScheme() { saved.letters = Object.fromEntries(stickers.map(sticker => [sticker.name, sticker.value])); refreshCount++; },
    };
    vm.runInNewContext(fs.readFileSync('static/letter_scheme_presets.js', 'utf8'), context);
    return {apply: (id = 'apply-chi-chu') => buttons[id](), stickers, pickers, context, saved, refreshCount: () => refreshCount};
}

test('Chi Chu matches every sticker of the supplied net and the five overrides', () => {
    const {apply, stickers, saved} = fixture();
    apply();
    assert.equal(stickers.length, 48);
    assert.equal(new Set(stickers.map(sticker => sticker.name)).size, 48);
    for (const [positions, letters] of Object.values(reference)) {
        positions.split(' ').forEach((position, index) => {
            assert.equal(saved.letters[`letter_${position}`], letters.split(' ')[index], position);
        });
    }
    for (const [position, letter] of Object.entries({UFR: 'J', RUF: 'K', FUR: 'L', UF: 'A', FU: 'B'})) {
        assert.equal(saved.letters[`letter_${position}`], letter);
    }
    for (const length of [2, 3]) {
        const letters = stickers.filter(sticker => sticker.name.slice(7).length === length).map(sticker => sticker.value);
        assert.equal(new Set(letters).size, 24);
    }
});

test('applying resets rotated colors, updates pickers, persists both settings, and refreshes labels', () => {
    const page = fixture();
    page.apply();
    const expectedColors = Object.fromEntries(Object.entries(reference).map(([face, row]) => [face, row[2]]));
    assert.deepEqual(page.saved.colors, expectedColors);
    assert.deepEqual(page.saved.orientation, expectedColors);
    assert.deepEqual(page.saved.rendered, expectedColors);
    for (const [face, color] of Object.entries(expectedColors)) assert.equal(page.pickers[`color-${face.toLowerCase()}`].value, color);
    assert.equal(page.refreshCount(), 1);
    page.context.cubeOrientation.U = '#abcdef';
    page.stickers[0].value = 'Z';
    page.apply();
    assert.deepEqual(page.saved.orientation, expectedColors);
    assert.equal(page.saved.letters.letter_UBL, 'D');
    assert.equal(page.refreshCount(), 2);
});


test('Chinese Speffz changes only U/V/W/X for both edges and corners and sets standard orientation', () => {
    const page = fixture();
    page.apply(); // Start from Chi Chu's letters and orientation.
    page.apply('apply-chinese-speffz');
    const replacements = {U: 'W', V: 'X', W: 'Y', X: 'Z'};
    for (const [position, letter] of Object.entries(speffz)) {
        assert.equal(page.saved.letters[`letter_${position}`], replacements[letter] || letter, position);
    }
    assert.deepEqual(page.saved.colors, speffzColors);
    assert.deepEqual(page.saved.orientation, speffzColors);
    page.apply('apply-chinese-speffz'); // Reapplying must not remap W/X a second time.
    assert.equal(page.saved.letters.letter_DF, 'W');
    assert.equal(page.saved.letters.letter_DFL, 'W');
    assert.equal(page.saved.letters.letter_DB, 'Y');
    assert.equal(page.saved.letters.letter_DBR, 'Y');
});

test('vanilla Speffz reset restores all letters, face colors, and white-up green-front orientation', () => {
    const page = fixture();
    for (const previous of ['apply-chi-chu', 'apply-chinese-speffz']) {
        page.apply(previous);
        page.context.cubeOrientation = {U: '#e53935', F: '#ffffff'};
        page.apply('reset-speffz');
        for (const [position, letter] of Object.entries(speffz)) {
            assert.equal(page.saved.letters[`letter_${position}`], letter, position);
        }
        assert.deepEqual(page.saved.colors, speffzColors);
        assert.deepEqual(page.saved.orientation, speffzColors);
        assert.deepEqual(page.saved.rendered, speffzColors);
        for (const [face, color] of Object.entries(speffzColors)) {
            assert.equal(page.pickers[`color-${face.toLowerCase()}`].value, color);
        }
    }
    assert.equal(page.refreshCount(), 4);
});
