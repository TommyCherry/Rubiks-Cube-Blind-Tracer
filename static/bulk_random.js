(() => {
    const button = document.getElementById('generate-bulk-scrambles');
    if (!button) return;
    const count = document.getElementById('bulk-random-count');
    const input = document.getElementById('bulk-scrambles');
    const submit = document.getElementById('generate-bulk-memo');
    const status = document.getElementById('bulk-generation-status');
    count.addEventListener('input', () => {
        button.textContent = `Generate ${count.value || '0'} random scrambles`;
    });
    button.addEventListener('click', async () => {
        const amount = Number(count.value);
        if (!Number.isInteger(amount) || amount < 1 || amount > 1000) {
            status.textContent = 'Enter a whole number from 1 to 1,000.';
            return;
        }
        button.disabled = count.disabled = submit.disabled = true;
        let worker;
        try {
            worker = new Worker('/static/cstimer_module.js');
            const scrambles = [];
            for (let i = 0; i < amount; i++) {
                status.textContent = `Generating scrambles: ${i}/${amount}`;
                const scramble = await new Promise((resolve, reject) => {
                    const finish = (error, value) => {
                        clearTimeout(timer);
                        worker.onmessage = worker.onerror = null;
                        error ? reject(error) : resolve(value);
                    };
                    const timer = setTimeout(() => finish(new Error('timeout')), 45000);
                    worker.onerror = () => finish(new Error('worker'));
                    worker.onmessage = event => {
                        if (event.data[0] !== i + 1) return;
                        const value = event.data[2];
                        if (typeof value !== 'string' || !value.trim()) finish(new Error('empty'));
                        else finish(null, value.trim());
                    };
                    worker.postMessage([i + 1, 'scramble', ['333']]);
                });
                scrambles.push(scramble);
            }
            input.value = scrambles.join('\n');
            input.dispatchEvent(new Event('input', {bubbles: true}));
            status.textContent = `Generated ${amount} scrambles. Press Generate Memo to analyze them.`;
        } catch (_) {
            status.textContent = 'Could not generate scrambles. Please try again.';
        } finally {
            if (worker) worker.terminate();
            button.disabled = count.disabled = submit.disabled = false;
        }
    });
})();
