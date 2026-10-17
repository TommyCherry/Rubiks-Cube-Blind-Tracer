(() => {
    const button = document.getElementById('load-solution-examples');
    if (!button) return;
    const status = document.getElementById('solution-status');
    const list = document.getElementById('solution-examples');
    const cases = JSON.parse(document.getElementById('solution-cases').textContent);
    if (button.dataset.source === 'beginner') {
        const cornerList = document.getElementById('corner-solution-examples');
        button.addEventListener('click', () => {
            list.replaceChildren();
            cornerList?.replaceChildren();
            for (const item of cases) {
                const row = document.createElement('li');
                const heading = document.createElement('strong');
                heading.textContent = `${item.memo} · ${item.positions.join(' → ')}`;
                const recipe = document.createElement(item.recipe ? 'code' : 'p');
                recipe.textContent = item.recipe || item.error;
                row.append(heading, recipe);
                if (item.algorithm) {
                    const details = document.createElement('details');
                    const summary = document.createElement('summary');
                    summary.textContent = 'Full algorithm';
                    const moves = document.createElement('code');
                    moves.textContent = item.algorithm;
                    details.append(summary, moves);
                    row.append(details);
                }
                (item.kind === 'corner' ? cornerList : list).append(row);
            }
            status.textContent = cases.length ? 'OP examples loaded.' : 'No supported targets in this trace.';
            button.hidden = true;
        });
        return;
    }
    const supported = item => item.positions.length === 3 && new Set(item.positions.map(position => [...position].sort().join(''))).size === 3;
    button.addEventListener('click', async () => {
        button.disabled = true;
        status.textContent = 'Loading and checking BLDDB algorithms…';
        try {
            const response = await fetch('/api/solution-examples', {
                method: 'POST', headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({cases: cases.filter(supported).map(item => item.positions)})
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Could not load example moves.');
            let index = 0;
            list.replaceChildren();
            for (const item of cases) {
                const row = document.createElement('li');
                const heading = document.createElement('strong');
                heading.textContent = `${item.memo} · ${item.positions.join(' → ')}`;
                row.append(heading);
                const example = supported(item) ? data.examples[index++] : null;
                const moves = document.createElement(example?.algorithm ? 'code' : 'p');
                moves.textContent = example?.algorithm || example?.error || 'Needs a parity or special-case algorithm; not an ordinary 3-style cycle.';
                row.append(moves);
                if (example) {
                    const link = document.createElement('a');
                    link.href = example.url;
                    link.target = '_blank'; link.rel = 'noopener';
                    link.textContent = 'View case on BLDDB';
                    row.append(link);
                    if (example.contributors?.length) {
                        const credits = document.createElement('details');
                        const summary = document.createElement('summary');
                        summary.textContent = 'Algorithm sources';
                        const names = document.createElement('p');
                        names.textContent = example.contributors.join(', ');
                        credits.append(summary, names); row.append(credits);
                    }
                }
                list.append(row);
            }
            status.textContent = cases.length ? 'Edge examples loaded. Additional cases may be needed to finish the solve.' : 'No ordinary edge pairs in this trace.';
            button.hidden = true;
        } catch (error) { status.textContent = error.message; }
        finally { button.disabled = false; }
    });
})();
