(() => {
    const historyView = document.getElementById('history-view');
    const wcaField = document.getElementById('history-wca-field');
    const wcaInput = document.getElementById('history-wca-id');
    function updateHistoryView() {
        const other = historyView.value === 'other';
        wcaField.hidden = !other;
        wcaInput.disabled = !other;
        wcaInput.required = other;
    }
    historyView.addEventListener('change', updateHistoryView);
    updateHistoryView();
    const cards = Array.from(document.querySelectorAll('.competition-card'));
    const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const searchableCards = cards.map(card => ({card, text: normalize(card.dataset.search)}));

    cards.forEach(card => {
        const button = card.querySelector('.competition-toggle');
        const content = card.querySelector('.competition-content');
        const name = card.querySelector('h2').textContent;
        button.addEventListener('click', () => {
            const expanded = button.getAttribute('aria-expanded') !== 'true';
            button.setAttribute('aria-expanded', String(expanded));
            button.setAttribute('aria-label', `${expanded ? 'Collapse' : 'Expand'} ${name}`);
            button.querySelector('.competition-toggle-label').textContent = expanded ? 'Collapse' : 'Expand';
            content.hidden = !expanded;
            card.classList.toggle('is-collapsed', !expanded);
        });
    });

    const search = document.getElementById('competition-search');
    if (!search) return;
    const year = document.getElementById('competition-year');
    const sort = document.getElementById('competition-sort');
    const list = document.getElementById('history-competitions');
    function sortCompetitions() {
        const direction = sort.value === 'oldest' ? 1 : -1;
        const sorted = [...cards].sort((a, b) => direction * a.dataset.date.localeCompare(b.dataset.date));
        const fragment = document.createDocumentFragment();
        sorted.forEach(card => fragment.appendChild(card));
        list.appendChild(fragment);
        document.getElementById('competition-sort-description').textContent =
            sort.value === 'oldest' ? 'Oldest first' : 'Newest first';
    }
    function filterCompetitions() {
        const keywords = normalize(search.value).trim().split(/\s+/).filter(Boolean);
        let matches = 0;
        searchableCards.forEach(({card, text}) => {
            const visible = (!year.value || card.dataset.year === year.value)
                && keywords.every(keyword => text.includes(keyword));
            card.hidden = !visible;
            if (visible) matches++;
        });
        document.getElementById('competition-count').textContent = keywords.length || year.value
            ? `${matches} of ${cards.length}` : String(cards.length);
        document.getElementById('competition-no-matches').hidden = matches !== 0;
    }
    search.addEventListener('input', filterCompetitions);
    year.addEventListener('change', filterCompetitions);
    sort.addEventListener('change', sortCompetitions);
    sortCompetitions();
    filterCompetitions();
})();
