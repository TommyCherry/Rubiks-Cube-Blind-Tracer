(() => {
    // Transcribed from the supplied Chi Chu net: U yellow, F red, R green,
    // L blue, B orange, D white. Names refer to stickers in that orientation.
    // The crossed-out buffer stickers use the explicitly requested letters.
    const chiChu = Object.freeze({
        // Edges, clockwise around each face from its top edge in the net.
        UB: 'E', UR: 'G', UF: 'A', UL: 'C',
        LU: 'D', LF: 'T', LD: 'L', LB: 'X',
        FU: 'B', FR: 'Q', FD: 'J', FL: 'S',
        RU: 'H', RB: 'Z', RD: 'P', RF: 'R',
        BU: 'F', BL: 'W', BD: 'N', BR: 'Y',
        DF: 'I', DR: 'O', DB: 'M', DL: 'K',
        // Corners, clockwise around each face from its upper-left corner.
        UBL: 'D', UBR: 'G', UFR: 'J', UFL: 'A',
        LUB: 'E', LUF: 'C', LDF: 'M', LDB: 'Q',
        FUL: 'B', FUR: 'L', FDR: 'Y', FDL: 'N',
        RUF: 'K', RUB: 'I', RDB: 'S', RDF: 'Z',
        BUR: 'H', BUL: 'F', BDL: 'P', BDR: 'T',
        DFL: 'W', DFR: 'X', DBR: 'R', DBL: 'O',
    });
    const chiChuColors = Object.freeze({
        U: '#ffd92f', F: '#e53935', R: '#20a84a',
        L: '#2468d8', B: '#ff8c00', D: '#ffffff',
    });

    const speffzColors = Object.freeze({
        U: '#ffffff', F: '#20a84a', R: '#e53935',
        L: '#ff8c00', B: '#2468d8', D: '#ffd92f',
    });
    const chineseSpeffzLetters = Object.freeze({U: 'W', V: 'X', W: 'Y', X: 'Z'});

    function applyScheme(letterForSticker, colors) {
        document.querySelectorAll('input.sticker').forEach(sticker => {
            sticker.value = letterForSticker(sticker);
        });
        // Replace both the base colors and any previously rotated orientation.
        colorScheme = {...colors};
        cubeOrientation = {...colors};
        for (const [face, color] of Object.entries(colors)) {
            document.getElementById(`color-${face.toLowerCase()}`).value = color;
        }
        updateCubeColors();
        saveCubeColors();
        // Also refreshes cycle-break letters, helper labels, and effective orders.
        saveLetterScheme();
    }
    document.getElementById('apply-chi-chu').addEventListener('click', () => {
        applyScheme(sticker => chiChu[sticker.name.slice('letter_'.length)], chiChuColors);
    });
    document.getElementById('reset-speffz').addEventListener('click', () => {
        applyScheme(sticker => sticker.dataset.speffz, speffzColors);
    });
    document.getElementById('apply-chinese-speffz').addEventListener('click', () => {
        applyScheme(sticker => chineseSpeffzLetters[sticker.dataset.speffz] || sticker.dataset.speffz, speffzColors);
    });
})();
