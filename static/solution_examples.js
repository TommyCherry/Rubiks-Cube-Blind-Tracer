(() => {
    const button = document.getElementById('load-solution-examples');
    if (!button) return;
    const status = document.getElementById('solution-status');
    const list = document.getElementById('solution-examples');
    const cases = JSON.parse(document.getElementById('solution-cases').textContent);
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
