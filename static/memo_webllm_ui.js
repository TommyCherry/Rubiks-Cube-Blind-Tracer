document.addEventListener('DOMContentLoaded', () => {
    const byId = id => document.getElementById(id);
    const button = byId('story-ai-generate');
    if (!button) return;
    const stop = byId('story-ai-stop'), status = byId('story-ai-status');
    const result = byId('story-ai-result'), input = byId('story-input');
    let client = new MemoWebLLMClient(button.dataset.workerUrl), epoch = 0, busy = false;
    const render = (id, parts) => {
        const node = byId(id);
        node.replaceChildren();
        for (const part of parts) {
            const span = document.createElement('span');
            span.className = `story-${part.kind}`;
            span.textContent = part.text;
            node.appendChild(span);
        }
    };
    function setBusy(value) {
        busy = value;
        button.disabled = value || !client.supported();
        input.readOnly = value;
        stop.hidden = !value && !client.ready;
    }
    function cancel() {
        epoch++;
        client.stop();
        client = new MemoWebLLMClient(button.dataset.workerUrl);
        setBusy(false);
        button.textContent = 'Load model & generate with browser AI';
    }
    if (!client.supported()) {
        button.disabled = true;
        status.textContent = 'Browser AI needs a WebGPU-compatible browser on HTTPS or localhost. The local generator above still works.';
    }
    button.addEventListener('click', async () => {
        if (busy) return;
        let cues;
        try {
            cues = parsePlaygroundWords(input.value);
            const images = cues.filter(cue => cue.image);
            if (!images.length || images.length > 12) throw new Error('Please enter 1–12 images for browser AI. Use the local generator for longer lists.');
        } catch (error) { status.textContent = error.message; return; }
        const current = ++epoch;
        result.hidden = true;
        setBusy(true);
        status.textContent = client.ready ? 'Creating your story on this device…' : 'Starting model download. You can stop at any time.';
        try {
            const plan = await client.generate(cues, text => { if (epoch === current) status.textContent = text; });
            if (epoch !== current) return;
            render('story-ai-sentence', plan.parts);
            render('story-ai-meaning', plan.explanation);
            result.hidden = false;
            status.textContent = 'Generated on this device. Your images were inserted in order; review the story for meaning.';
            button.textContent = 'Generate another AI story';
        } catch (error) {
            if (epoch !== current) return;
            status.textContent = `${error.message} You can use “Generate story” above without downloading a model.`;
            button.textContent = 'Retry browser AI';
        } finally { if (epoch === current) setBusy(false); }
    });
    stop.addEventListener('click', () => { cancel(); status.textContent = 'Browser AI stopped and GPU memory released. Downloaded files may remain cached.'; });
    for (const id of ['story-example', 'story-clear']) byId(id).addEventListener('click', () => {
        cancel(); result.hidden = true; status.textContent = '';
    });
    input.addEventListener('input', () => { result.hidden = true; });
    byId('story-playground-form').addEventListener('submit', () => {
        if (busy) { cancel(); status.textContent = 'Browser AI stopped; using the local generator.'; }
    });
    window.addEventListener('pagehide', () => client.stop());
});
