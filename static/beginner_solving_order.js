(() => {
    const preset = document.getElementById('beginner-order-preset');
    if (!preset) return;
    const memo = document.getElementById('beginner-memo-order');
    const execution = document.getElementById('beginner-execution-order');
    const steps = document.getElementById('beginner-order-steps');
    const key = 'beginnerSolvingOrder';
    const kinds = first => first === 'corners' ? ['corner', 'edge'] : ['edge', 'corner'];
    const valid = value => value === 'corners' || value === 'edges';

    function refresh() {
        const memoKinds = kinds(memo.value);
        const executionKinds = kinds(execution.value);
        preset.value = [...memoKinds, ...executionKinds].map(kind => kind[0].toUpperCase()).join('');
        const labels = [...memoKinds.map(kind => kind === 'corner' ? 'Memo corners' : 'Memo edges'),
            ...executionKinds.map(kind => kind === 'corner' ? 'Solve corners' : 'Solve edges')];
        if (document.getElementById('beginner-parity-step')) labels.splice(3, 0, 'Execute parity algorithm');
        [...steps.children].forEach((step, index) => { step.textContent = labels[index]; });
        const memos = document.querySelector('.memo-section');
        if (memos) memoKinds.forEach(kind => {
            const card = memos.querySelector(`[data-memo-kind="${kind}"]`);
            if (card) memos.insertBefore(card, memos.querySelector('.trace-details'));
        });
        const examples = document.getElementById('beginner-execution-examples');
        if (examples) [executionKinds[0], 'parity', executionKinds[1]].forEach(kind => {
            const group = examples.querySelector(`[data-execution-kind="${kind}"]`);
            if (group) examples.appendChild(group);
        });
        try { localStorage.setItem(key, JSON.stringify({memo: memo.value, execution: execution.value})); } catch (_) {}
    }
    try {
        const saved = JSON.parse(localStorage.getItem(key) || 'null');
        if (saved && valid(saved.memo) && valid(saved.execution)) {
            memo.value = saved.memo;
            execution.value = saved.execution;
        }
    } catch (_) {}
    preset.addEventListener('change', () => {
        memo.value = preset.value[0] === 'C' ? 'corners' : 'edges';
        execution.value = preset.value[2] === 'C' ? 'corners' : 'edges';
        refresh();
    });
    memo.addEventListener('change', refresh);
    execution.addEventListener('change', refresh);
    refresh();
})();
