(() => {
    const method = document.getElementById('beginner-method');
    if (!method) return;
    const edge = document.getElementById('edge-buffer');
    const corner = document.getElementById('corner-buffer');
    const pseudoswap = document.getElementById('usePseudoswap');
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
