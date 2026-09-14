(() => {
    const button = document.getElementById('generate-conjugacy');
    const input = document.getElementById('conjugacy-input');
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

    function solve(facelets) {
        return new Promise((resolve, reject) => {
            // A dedicated worker can be terminated on timeout without interrupting
            // ordinary random scrambling or leaving an old solve in its queue.
            const worker = new Worker('/static/cstimer_module.js');
            const finish = (error, result) => {
                clearTimeout(timer);
                worker.terminate();
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
        button.disabled = randomButton.disabled = true;
        input.removeAttribute('aria-invalid');
        status.classList.remove('error');
        status.textContent = 'Checking your class…';
        try {
            const target = await post('/api/conjugacy-state', {conjugacy_class: input.value});
            status.textContent = `Generating ${target.conjugacy_class}… The first solve may take a few seconds.`;
            const scramble = await solve(target.facelets);
            status.textContent = 'Verifying the scramble…';
            const verified = await post('/api/conjugacy-verify', {scramble, token: target.token});
            scrambleInput.value = verified.scramble;
            scrambleInput.dispatchEvent(new Event('input', {bubbles: true}));
            status.textContent = `Ready: ${verified.conjugacy_class}. Scramble inserted above—select Generate Memo to analyze it.`;
        } catch (error) {
            status.classList.add('error');
            status.textContent = error.name === 'TimeoutError'
                ? 'The request timed out. Please try again.' : error.message;
        } finally {
            button.disabled = randomButton.disabled = false;
        }
    });
    input.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            event.preventDefault();
            button.click();
        }
    });
})();
