document.addEventListener('DOMContentLoaded', async () => {
    const panel = document.querySelector('.preset-section');
    const save = document.getElementById('save-preset');
    if (!save) return;
    const load = document.getElementById('load-preset');
    const list = document.getElementById('preset-list');
    const name = document.getElementById('preset-name');
    const status = document.getElementById('preset-status');
    const root = document.querySelector('.solve-settings');
    let presets = [];
    const orderLists = () => [...root.querySelectorAll('[data-cycle-break-order], .floating-buffer-list')];
    const orderKey = element => element.id || element.querySelector('input[name]').name;
    const piece = element => element.dataset.piece || element.dataset.buffer;
    const message = (text, error = false) => {
        status.textContent = text;
        status.classList.toggle('error', error);
    };
    async function api(options) {
        const response = await fetch('/api/settings-presets', options);
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Could not access presets. Please try again.');
        return result;
    }
    function snapshot() {
        const fields = {};
        root.querySelectorAll('input[name], select[name]').forEach(control => {
            fields[control.name] ||= [];
            if (control.type !== 'checkbox' || control.checked) fields[control.name].push(control.value);
        });
        return {mode: panel.dataset.mode, fields,
            orders: Object.fromEntries(orderLists().map(element => [orderKey(element), [...element.children].map(piece)])),
            colors: {...colorScheme}, orientation: {...cubeOrientation}};
    }
    function apply(preset) {
        const settings = preset.settings;
        if (settings.mode !== panel.dataset.mode) {
            sessionStorage.setItem('pendingSettingsPreset', String(preset.id));
            location.assign(settings.mode === 'beginner' ? '/beginner' : '/expert');
            return;
        }
        // Set values first, then trigger dependent visibility and primary-buffer logic.
        const controls = [...root.querySelectorAll('input[name], select[name]')];
        controls.filter(control => control.type !== 'hidden').forEach(control => {
            const values = settings.fields[control.name];
            if (!values) {
                if (control.id === 'beginner-method') control.value = 'custom';
                return;
            }
            if (control.type === 'checkbox') control.checked = values.includes(control.value);
            else control.value = values[0] ?? '';
        });
        controls.filter(control => control.type !== 'hidden' && control.id !== 'beginner-method').forEach(control => control.dispatchEvent(new Event('change', {bubbles: true})));
        // Change handlers may reorder primary buffers and custom cycle orders.
        // Restore the saved order after those handlers finish.
        orderLists().forEach(element => {
            const order = settings.orders[orderKey(element)];
            if (!order) return;
            const children = [...element.children];
            order.forEach(value => {
                const child = children.find(item => piece(item) === value);
                if (child) element.appendChild(child);
            });
            if (element.dataset.cycleBreakOrder) {
                const key = `${element.dataset.countParity || 'even'}CycleBreakOrder-${element.dataset.cycleBreakOrder}${element.dataset.startingTarget ? '-' + element.dataset.startingTarget : ''}`;
                localStorage.setItem(key, JSON.stringify([...element.children].map(piece)));
            }
        });
        colorScheme = {...settings.colors};
        cubeOrientation = {...settings.orientation};
        for (const [face, color] of Object.entries(colorScheme)) document.getElementById(`color-${face.toLowerCase()}`).value = color;
        updateCubeColors();
        saveCubeColors();
        saveLetterScheme();
        name.value = preset.name;
        list.value = String(preset.id);
        load.disabled = false;
        message(`Loaded “${preset.name}”. Generate a memo to use these settings.`);
    }
    function renderList(selected = '') {
        list.replaceChildren(new Option('Choose a preset', ''));
        presets.forEach(preset => list.add(new Option(`${preset.name} (${preset.settings.mode})`, preset.id)));
        list.value = String(selected);
        load.disabled = !list.value;
    }
    list.addEventListener('change', () => { load.disabled = !list.value; });
    load.addEventListener('click', () => {
        try {
            const preset = presets.find(item => String(item.id) === list.value);
            if (preset) apply(preset);
        } catch (error) { message(error.message, true); }
    });
    save.addEventListener('click', async () => {
        if (!name.value.trim()) { message('Enter a name for your preset.', true); name.focus(); return; }
        save.disabled = load.disabled = true;
        message('Saving settings…');
        try {
            const preset = await api({method: 'POST', headers: {'Content-Type': 'application/json', 'X-Preset-CSRF': panel.dataset.csrf},
                body: JSON.stringify({name: name.value.trim(), settings: snapshot()})});
            presets.push(preset);
            renderList(preset.id);
            message(`Saved “${preset.name}” to your profile.`);
        } catch (error) { message(error.message, true); }
        finally { save.disabled = false; load.disabled = !list.value; }
    });
    try {
        presets = (await api()).presets;
        renderList();
        const pending = sessionStorage.getItem('pendingSettingsPreset');
        sessionStorage.removeItem('pendingSettingsPreset');
        const preset = presets.find(item => String(item.id) === pending);
        if (preset) apply(preset);
    } catch (error) { message(error.message, true); }
});
