(() => {
    const edgeMethod = document.getElementById('beginner-edge-method');
    const cornerMethod = document.getElementById('beginner-corner-method');
    if (!edgeMethod || !cornerMethod) return;
    const edge = document.getElementById('edge-buffer');
    const corner = document.getElementById('corner-buffer');
    const pseudoswap = document.getElementById('usePseudoswap');
    const orders = [...document.querySelectorAll('.beginner-cycle-breaks [data-cycle-break-order]')];
    const orderMode = document.getElementById('beginner-cycle-order-mode');
    const modeStorageKey = 'beginnerCycleOrderMode';
    function updateOrderMode() {
        orders.forEach(list => { list.hidden = list.dataset.orderMode !== orderMode.value; });
        try { localStorage.setItem(modeStorageKey, orderMode.value); } catch (_) {}
    }
    try {
        const saved = localStorage.getItem(modeStorageKey);
        if (saved === 'piece' || saved === 'sticker') orderMode.value = saved;
    } catch (_) {}
    orderMode.addEventListener('change', updateOrderMode);
    updateOrderMode();
    function refreshLetters() {
        document.querySelectorAll('[data-cycle-letter]').forEach(label => {
            const sticker = document.querySelector(`input[name="letter_${label.dataset.cycleLetter}"]`);
            label.textContent = sticker.value.trim().toUpperCase() || '—';
        });
    }
    function resetCycleOrders(kind = null) {
        orders.filter(list => !kind || list.dataset.cycleBreakOrder === kind).forEach(list => {
            let order = JSON.parse(list.dataset.defaultOrder);
            if (list.dataset.cycleBreakOrder === 'edge' && edgeMethod.value === 'DF') {
                order = ['UB', ...order.filter(name => name !== 'UB')];
            }
            const items = [...list.children];
            order.forEach(name => list.appendChild(items.find(item => item.dataset.piece === name)));
            list.dispatchEvent(new Event('cycle-break-order-change'));
        });
    }
    document.addEventListener('letter-scheme-change', refreshLetters);
    document.addEventListener('DOMContentLoaded', refreshLetters);
    document.getElementById('reset-beginner-cycle-order').addEventListener('click', () => resetCycleOrders());
    refreshLetters();
    const choose = (select, position) => {
        select.value = [...select.options].find(option => option.textContent.trim() === position).value;
        select.dispatchEvent(new Event('change', {bubbles: true}));
    };
    for (const [kind, preset, control, choices] of [
        ['edge', edgeMethod, edge, ['UR', 'DF']],
        ['corner', cornerMethod, corner, ['UBL', 'LUB', 'UFR']],
    ]) {
        const sync = () => {
            const sticker = [...control.options].find(option => option.value === control.value)?.textContent.trim();
            preset.value = choices.includes(sticker) ? sticker : 'custom';
        };
        preset.addEventListener('change', () => {
            if (preset.value === 'custom') return;
            choose(control, preset.value);
            pseudoswap.checked = false;
            pseudoswap.dispatchEvent(new Event('change', {bubbles: true}));
            resetCycleOrders(kind);
        });
        control.addEventListener('change', sync);
        sync();
    }
})();
