(() => {
    const button = document.getElementById('generate-conjugacy');
    const input = document.getElementById('conjugacy-input');
    const countInput = document.getElementById('conjugacy-count');
    const bulkInput = document.getElementById('bulk-scrambles');
    const status = document.getElementById('conjugacy-status');
    const randomButton = document.getElementById('generateScrambleButton');
    const scrambleInput = document.getElementById('scramble');

    async function post(url, data) {
        const response = await fetch(url, {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data), signal: AbortSignal.timeout(15000)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Generation failed. Please try again.');
        return result;
    }

    function solve(worker, facelets) {
        return new Promise((resolve, reject) => {
            // Reuse the solver tables across this batch; terminate it when done.
            const finish = (error, result) => {
                clearTimeout(timer);
                worker.onmessage = worker.onerror = null;
                if (error) reject(error); else resolve(result);
            };
            const timer = setTimeout(() => finish(new Error('The solver timed out. Please try again.')), 45000);
            worker.onerror = () => finish(new Error('Could not load the solver. Please refresh and try again.'));
            worker.onmessage = event => {
                const solution = event.data[2];
                if (typeof solution !== 'string' || !/^(?:[URFDLB](?:2|')?\s*)*$/.test(solution)) {
                    finish(new Error('The solver could not solve this state within its search limit. Please try again.'));
                    return;
                }
                const scramble = solution.trim().split(/\s+/).filter(Boolean).reverse()
                    .map(move => move.endsWith('2') ? move : move.endsWith("'") ? move.slice(0, -1) : move + "'")
                    .join(' ');
                finish(null, scramble);
            };
            worker.postMessage([1, 'solve-facelets', [facelets]]);
        });
    }

    button.addEventListener('click', async () => {
        if (button.disabled) return;
        const count = Number(countInput.value);
        if (!Number.isInteger(count) || count < 1 || count > 100) {
            countInput.reportValidity();
            return;
        }
        const requestedClass = input.value;
        button.disabled = randomButton.disabled = input.disabled = countInput.disabled = true;
        input.removeAttribute('aria-invalid');
        status.classList.remove('error');
        status.textContent = 'Checking your class…';
        let worker;
        const scrambles = [];
        try {
            let classification;
            for (let i = 0; i < count; i++) {
                // Request each signed state just before solving so large batches
                // do not expire while waiting for earlier solves.
                const target = await post('/api/conjugacy-state', {conjugacy_class: requestedClass});
                classification = target.conjugacy_class;
                status.textContent = `Generating scramble ${i + 1} of ${count} for ${classification}… The first solve may take a few seconds.`;
                worker ||= new Worker('/static/cstimer_module.js');
                const scramble = await solve(worker, target.facelets);
                const verified = await post('/api/conjugacy-verify', {scramble, token: target.token});
                scrambles.push(verified.scramble);
            }
            if (count === 1) {
                scrambleInput.value = scrambles[0];
                scrambleInput.dispatchEvent(new Event('input', {bubbles: true}));
                status.textContent = `Ready: ${classification}. Scramble inserted above—select Generate Memo to analyze it.`;
            } else {
                bulkInput.value = scrambles.join('\n');
                bulkInput.closest('details').open = true;
                bulkInput.dispatchEvent(new Event('input', {bubbles: true}));
                status.textContent = `Ready: ${count} scrambles for ${classification}. Select Trace scramble set below to analyze them.`;
            }
        } catch (error) {
            status.classList.add('error');
            status.textContent = error.name === 'TimeoutError'
                ? 'The request timed out. Please try again.' : error.message;
        } finally {
            worker?.terminate();
            button.disabled = randomButton.disabled = input.disabled = countInput.disabled = false;
        }
    });
    countInput.addEventListener('input', () => {
        button.textContent = Number(countInput.value) > 1 ? 'Generate practice scrambles' : 'Generate practice scramble';
    });
    [input, countInput].forEach(control => control.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            event.preventDefault();
            button.click();
        }
    }));
})();
