(() => {
    const method = document.getElementById('beginner-method');
    if (!method) return;
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
    function resetCycleOrders() {
        orders.forEach(list => {
            let order = JSON.parse(list.dataset.defaultOrder);
            if (list.dataset.cycleBreakOrder === 'edge' && method.value === 'm2_op') {
                order = ['UB', ...order.filter(name => name !== 'UB')];
            }
            const items = [...list.children];
            order.forEach(name => list.appendChild(items.find(item => item.dataset.piece === name)));
            list.dispatchEvent(new Event('cycle-break-order-change'));
        });
    }
    document.addEventListener('letter-scheme-change', refreshLetters);
    document.addEventListener('DOMContentLoaded', refreshLetters);
    document.getElementById('reset-beginner-cycle-order').addEventListener('click', resetCycleOrders);
    refreshLetters();
    const choose = (select, position) => {
        select.value = [...select.options].find(option => option.textContent.trim() === position).value;
        select.dispatchEvent(new Event('change', {bubbles: true}));
    };
    method.addEventListener('change', () => {
        if (method.value === 'custom') return;
        choose(edge, method.value === 'm2_op' ? 'DF' : 'UR');
        choose(corner, 'UBL');
        pseudoswap.checked = false;
        pseudoswap.dispatchEvent(new Event('change', {bubbles: true}));
        resetCycleOrders();
    });
    // A manually changed buffer combination no longer represents either preset.
    for (const control of [edge, corner]) control.addEventListener('change', event => {
        if (!event.isTrusted) return;
        const expected = method.value === 'm2_op' ? 'DF' : 'UR';
        if (edge.selectedOptions[0].textContent.trim() !== expected || corner.selectedOptions[0].textContent.trim() !== 'UBL') {
            method.value = 'custom';
        }
    });
})();
