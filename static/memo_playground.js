function parsePlaygroundWords(text) {
    if (text.length > 7200) throw new Error('Please keep the input under 7,200 characters.');
    const words = text.split(/[,\r\n]+/).map(word => word.trim()).filter(Boolean);
    if (!words.length) throw new Error('Enter at least one word or phrase.');
    if (words.length > 60) throw new Error('Please use at most 60 images or separate cues.');
    if (words.some(word => word.length > 120)) throw new Error('Each image or separate cue must be at most 120 characters.');
    return words.map(text => ({text, original: text, image: !/^\[.*\]$/.test(text)}));
}

document.addEventListener('DOMContentLoaded', () => {
    const byId = id => document.getElementById(id);
    const form = byId('story-playground-form');
    if (!form) return;
    const input = byId('story-input'), density = byId('story-density');
    const status = byId('story-playground-status'), result = byId('story-playground-result');
    const sentence = byId('story-playground-sentence'), meaning = byId('story-playground-meaning');
    let lastCues = null;
    function showStory(cues) {
        const average = Math.max(0, Math.min(2, Number(density.value) || 0));
        const plan = memoStoryPlan(cues, average);
        sentence.replaceChildren();
        plan.parts.forEach(part => {
            const span = document.createElement('span');
            span.className = `story-${part.kind}`;
            span.textContent = part.text;
            sentence.appendChild(span);
        });
        meaning.textContent = plan.meaning;
        result.hidden = false;
        status.textContent = 'Story generated.';
    }
    function generate() {
        try {
            const cues = parsePlaygroundWords(input.value);
            showStory(cues);
            lastCues = cues;
        } catch (error) {
            const message = error?.message || '';
            status.textContent = message.startsWith('Please') || message.startsWith('Each image')
                || message === 'Enter at least one word or phrase.'
                ? message : 'Story generation failed. Try changing the words.';
            result.hidden = true;
            lastCues = null;
        }
    }
    form.addEventListener('submit', event => { event.preventDefault(); generate(); });
    density.addEventListener('input', () => {
        byId('story-density-value').textContent = density.value;
        if (lastCues) {
            try { showStory(lastCues); }
            catch (_) { status.textContent = 'Story generation failed. Try changing the words.'; result.hidden = true; }
        }
    });
    byId('story-example').addEventListener('click', () => {
        input.value = 'apple juice, teddy bear, keyboard (qwerty), cog';
        generate();
    });
    byId('story-clear').addEventListener('click', () => {
        input.value = '';
        lastCues = null;
        sentence.replaceChildren();
        meaning.textContent = '';
        status.textContent = '';
        result.hidden = true;
        input.focus();
    });
});
