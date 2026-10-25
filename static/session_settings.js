// Restore settings on fresh visits, while keeping submitted result pages intact.
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('memo-form');
    const root = document.querySelector('.solve-settings');
    if (!form || !root) return;
    const key = `tracer-settings-v1-${form.dataset.mode}`;
    const controls = [...root.querySelectorAll('input[name], select[name]')]
        .filter(control => control.type !== 'hidden');
    const lists = [...root.querySelectorAll('[data-cycle-break-order], .floating-buffer-list')];
    const listKey = list => list.id || list.querySelector('input[name]')?.name;
    const piece = child => child.dataset.piece || child.dataset.buffer;
    let restoring = false;
    function save() {
        if (restoring) return;
        try {
            const fields = {};
            controls.forEach(control => {
                fields[control.name] ||= [];
                if (!['checkbox', 'radio'].includes(control.type) || control.checked) {
                    fields[control.name].push(control.value);
                }
            });
            localStorage.setItem(key, JSON.stringify({fields,
                orders: Object.fromEntries(lists.map(list => [listKey(list), [...list.children].map(piece)]))}));
        } catch (_) { /* Storage may be disabled or full. Tracing still works. */ }
    }
    if (form.dataset.requestMethod === 'GET') {
        restoring = true;
        try {
            const saved = JSON.parse(localStorage.getItem(key) || 'null');
            if (saved?.fields && saved?.orders) {
                controls.forEach(control => {
                    const values = saved.fields[control.name];
                    if (!Array.isArray(values)) return;
                    if (['checkbox', 'radio'].includes(control.type)) control.checked = values.includes(control.value);
                    else if (values.length && (control.tagName !== 'SELECT' || [...control.options].some(option => option.value === values[0]))) {
                        control.value = values[0];
                    }
                });
                // Method changes reset custom orders; restore the actual controls instead.
                controls.filter(control => control.id !== 'beginner-method').forEach(control => {
                    control.dispatchEvent(new Event('change', {bubbles: true}));
                });
                lists.forEach(list => {
                    const order = saved.orders[listKey(list)];
                    if (!Array.isArray(order)) return;
                    const children = [...list.children];
                    order.forEach(value => {
                        const child = children.find(item => piece(item) === value);
                        if (child) list.appendChild(child);
                    });
                });
                document.dispatchEvent(new Event('letter-scheme-change'));
            }
        } catch (_) { /* Ignore damaged or unavailable browser storage. */ }
        restoring = false;
    }
    form.addEventListener('input', save);
    form.addEventListener('change', save);
    form.addEventListener('submit', save);
    window.addEventListener('pagehide', save);
    const observer = new MutationObserver(save);
    lists.forEach(list => observer.observe(list, {childList: true}));
    save();

    const memo = document.getElementById('generated-memo');
    if (form.dataset.requestMethod === 'POST' && memo) {
        requestAnimationFrame(() => {
            memo.scrollIntoView({behavior: 'instant', block: 'start'});
            memo.focus({preventScroll: true});
        });
    }
});
