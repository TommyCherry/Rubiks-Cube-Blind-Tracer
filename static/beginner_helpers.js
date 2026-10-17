(() => {
    const prioritize = document.getElementById('beginner-prioritize-helpers');
    if (!prioritize) return;
    const mode = document.getElementById('beginner-cycle-order-mode');
    const helpers = [...document.querySelectorAll('[data-beginner-helper]')];
    const storageKey = 'beginnerCycleHelpers';
    const pieceKey = target => [...target].sort().join('');

    function refresh() {
        for (const kind of ['edge', 'corner']) {
            const selected = new Set(helpers.filter(input => input.checked && input.dataset.beginnerHelper === kind)
                .map(input => mode.value === 'sticker' ? input.value : pieceKey(input.value)));
            const list = document.querySelector(`.beginner-cycle-breaks [data-cycle-break-order="${kind}"][data-order-mode="${mode.value}"]`);
            const items = [...list.children];
            const isHelper = item => selected.has(mode.value === 'sticker' ? item.dataset.piece : pieceKey(item.dataset.piece));
            const effective = prioritize.checked
                ? [...items.filter(isHelper), ...items.filter(item => !isHelper(item))] : items;
            const preview = document.querySelector(`[data-helper-order-preview="${kind}"]`);
            // Keep the editable base order intact so disabling priority restores it exactly.
            preview.textContent = effective.map(item => {
                const letters = [...item.querySelectorAll('[data-cycle-letter]')].map(label => label.textContent).join('/');
                return `${letters} (${item.dataset.piece})`;
            }).join(' → ');
        }
    }
    function save() {
        try {
            localStorage.setItem(storageKey, JSON.stringify({prioritize: prioritize.checked,
                edge: helpers.filter(input => input.checked && input.dataset.beginnerHelper === 'edge').map(input => input.value),
                corner: helpers.filter(input => input.checked && input.dataset.beginnerHelper === 'corner').map(input => input.value)}));
        } catch (_) { /* The current form still works without browser storage. */ }
        refresh();
    }
    try {
        const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
        if (saved && typeof saved.prioritize === 'boolean' && Array.isArray(saved.edge) && Array.isArray(saved.corner)) {
            prioritize.checked = saved.prioritize;
            helpers.forEach(input => { input.checked = saved[input.dataset.beginnerHelper].includes(input.value); });
        }
    } catch (_) {}
    [prioritize, ...helpers].forEach(input => input.addEventListener('change', save));
    mode.addEventListener('change', refresh);
    document.addEventListener('letter-scheme-change', refresh);
    document.addEventListener('cycle-break-order-updated', refresh);
    document.addEventListener('DOMContentLoaded', refresh);
    refresh();
})();
