document.addEventListener('DOMContentLoaded', async () => {
    const panel = document.querySelector('.preset-section');
    const save = document.getElementById('save-preset');
    if (!save) return;
    const load = document.getElementById('load-preset');
    const list = document.getElementById('preset-list');
    const sharedList = document.getElementById('shared-preset-list');
    const copyShared = document.getElementById('copy-shared-preset');
    const retry = document.getElementById('retry-presets');
    const name = document.getElementById('preset-name');
    const status = document.getElementById('preset-status');
    const root = document.querySelector('.solve-settings');
    const storage = document.getElementById('preset-storage');
    const deviceKey = 'tracer-device-presets-v1';
    const onDevice = () => storage?.value === 'device';
    let presets = [];
    function devicePresets() {
        let raw;
        try { raw = localStorage.getItem(deviceKey); }
        catch (_) { throw new Error('Browser storage is unavailable. Allow site storage to use device presets.'); }
        try {
            const items = raw === null ? [] : JSON.parse(raw);
            if (!Array.isArray(items) || items.some(item => !item || typeof item.name !== 'string' ||
                !item.id || !['beginner', 'expert'].includes(item.settings?.mode) ||
                !item.settings.fields || !item.settings.orders || !item.settings.colors || !item.settings.orientation)) throw new Error();
            return items;
        } catch (_) { throw new Error('Device presets could not be read. Existing data has not been overwritten.'); }
    }
    let activity = 0;
    let storageGeneration = 0;
    const orderLists = () => [...root.querySelectorAll('[data-cycle-break-order], .floating-buffer-list')];
    const orderKey = element => element.id || element.querySelector('input[name]').name;
    const piece = element => element.dataset.piece || element.dataset.buffer;
    const message = (text, error = false) => {
        status.textContent = text;
        status.classList.toggle('error', error);
    };
    async function api(options = {}) {
        if (onDevice()) {
            const items = devicePresets();
            if (options.method !== 'POST') return {presets: items};
            const data = JSON.parse(options.body);
            if (!data.name || data.name.length > 80) throw new Error('Use a preset name between 1 and 80 characters.');
            if (items.some(item => item.name === data.name && item.settings.mode === data.settings.mode))
                throw new Error('That preset name already exists. Choose a new name.');
            const preset = {id: crypto.randomUUID(), ...data};
            try { localStorage.setItem(deviceKey, JSON.stringify([...items, preset])); }
            catch (_) { throw new Error('Could not save to this browser. Storage may be full or disabled.'); }
            return preset;
        }
        const controller = new AbortController();
        let timer;
        const timeout = new Promise((_, reject) => {
            timer = setTimeout(() => {
                reject(new Error(options.method === 'POST'
                    ? 'Saving timed out. Your preset may have been saved. Retry loading presets before saving again.'
                    : 'Loading presets timed out. Please retry. You can still try saving a new preset.'));
                controller.abort();
            }, 12000);
        });
        try {
            return await Promise.race([timeout, (async () => {
                const response = await fetch('/api/settings-presets', {...options, signal: controller.signal});
                const result = await response.json();
                if (!response.ok) throw new Error(result.error || 'Could not access presets. Please try again.');
                return result;
            })()]);
        } finally { clearTimeout(timer); }
    }
    function snapshot() {
        const fields = {};
        root.querySelectorAll('input[name], select[name]').forEach(control => {
            fields[control.name] ||= [];
            if (!['checkbox', 'radio'].includes(control.type) || control.checked) fields[control.name].push(control.value);
        });
        return {mode: panel.dataset.mode, fields,
            orders: Object.fromEntries(orderLists().map(element => [orderKey(element), [...element.children].map(piece)])),
            colors: {...colorScheme}, orientation: {...cubeOrientation}};
    }
    function apply(preset, sharedOnly = false) {
        const settings = preset.settings;
        if (!sharedOnly && settings.mode !== panel.dataset.mode) return;
        // Set values first, then trigger dependent visibility and primary-buffer logic.
        const controls = [...root.querySelectorAll('input[name], select[name]')]
            .filter(control => !sharedOnly || control.name.startsWith('letter_'));
        controls.filter(control => control.type !== 'hidden').forEach(control => {
            const values = settings.fields[control.name];
            if (!values) {
                if (control.dataset.bufferSticker) control.value = control.dataset.piece;
                if (control.id === 'beginner-method') control.value = 'custom';
                if (control.id === 'beginner-cycle-order-mode') control.value = 'piece';
                if (control.id === 'beginner-memo-order') control.value = 'corners';
                if (control.id === 'beginner-execution-order') control.value = 'edges';
                if (control.name.startsWith('beginner_') && control.type === 'checkbox') control.checked = false;
                return;
            }
            if (['checkbox', 'radio'].includes(control.type)) control.checked = values.includes(control.value);
            else if (control.tagName !== 'SELECT' || [...control.options].some(option => option.value === values[0])) {
                control.value = values[0] ?? '';
            }
        });
        controls.filter(control => control.type !== 'hidden' && control.id !== 'beginner-method').forEach(control => control.dispatchEvent(new Event('change', {bubbles: true})));
        // Change handlers may reorder primary buffers and custom cycle orders.
        // Restore the saved order after those handlers finish.
        (sharedOnly ? [] : orderLists()).forEach(element => {
            const order = settings.orders[orderKey(element)];
            if (!order) return;
            const children = [...element.children];
            order.forEach(value => {
                const child = children.find(item => piece(item) === value);
                if (child) element.appendChild(child);
            });
            if (element.dataset.cycleBreakOrder) {
                const key = `${element.dataset.storageScope || ''}${element.dataset.countParity || 'even'}CycleBreakOrder-${element.dataset.cycleBreakOrder}${element.dataset.startingTarget ? '-' + element.dataset.startingTarget : ''}`;
                localStorage.setItem(key, JSON.stringify([...element.children].map(piece)));
            }
        });
        colorScheme = {...settings.colors};
        cubeOrientation = {...settings.orientation};
        for (const [face, color] of Object.entries(colorScheme)) document.getElementById(`color-${face.toLowerCase()}`).value = color;
        updateCubeColors();
        saveCubeColors();
        saveLetterScheme();
        // Persist the final state after dependent handlers and order restoration.
        document.getElementById('memo-form').dispatchEvent(new Event('change', {bubbles: true}));
        document.dispatchEvent(new Event('cycle-break-order-updated'));
        if (sharedOnly) {
            message(`Copied letters, colors and orientation from “${preset.name}”. Solving options are unchanged. Save a new preset to keep this combination.`);
            return;
        }
        name.value = preset.name;
        list.value = String(preset.id);
        load.disabled = false;
        message(`Loaded “${preset.name}”. Generate a memo to use these settings.`);
    }
    function renderList(selected = '') {
        list.replaceChildren(new Option('Choose a preset', ''));
        sharedList.replaceChildren(new Option('Choose a preset', ''));
        presets.forEach(preset => {
            const target = preset.settings.mode === panel.dataset.mode ? list : sharedList;
            target.add(new Option(preset.name, preset.id));
        });
        list.value = String(selected);
        load.disabled = !list.value;
        copyShared.disabled = true;
    }
    sharedList.addEventListener('change', () => { copyShared.disabled = !sharedList.value; });
    copyShared.addEventListener('click', () => {
        try {
            const preset = presets.find(item => String(item.id) === sharedList.value);
            if (preset) apply(preset, true);
        } catch (error) { message(error.message, true); }
    });
    list.addEventListener('change', () => { load.disabled = !list.value; });
    load.addEventListener('click', () => {
        try {
            const preset = presets.find(item => String(item.id) === list.value);
            if (preset) apply(preset);
        } catch (error) { message(error.message, true); }
    });
    save.addEventListener('click', async () => {
        if (save.disabled) return;
        if (!name.value.trim()) { message('Enter a name for your preset.', true); name.focus(); return; }
        ++activity;
        if (storage) storage.disabled = true;
        save.disabled = load.disabled = true;
        retry.disabled = true;
        message('Saving settings…');
        try {
            const preset = await api({method: 'POST', headers: {'Content-Type': 'application/json', 'X-Preset-CSRF': panel.dataset.csrf},
                body: JSON.stringify({name: name.value.trim(), settings: snapshot()})});
            presets.push(preset);
            renderList(preset.id);
            message(onDevice() ? `Saved “${preset.name}” on this device.` : `Saved “${preset.name}” to your profile.`);
        } catch (error) { message(error.message, true); retry.hidden = false; }
        finally { if (storage) storage.disabled = false; save.disabled = false; retry.disabled = false; load.disabled = !list.value; }
    });
    async function refresh() {
        const currentActivity = ++activity;
        const currentStorage = storageGeneration;
        retry.hidden = true;
        message('Loading presets…');
        try {
            const fetched = (await api()).presets;
            if (currentStorage !== storageGeneration) return;
            // A save may finish while this older list request is in flight.
            presets = [...new Map([...fetched, ...presets].map(preset => [String(preset.id), preset])).values()];
            renderList(list.value);
            if (currentActivity === activity) message('');
        } catch (error) {
            if (currentActivity === activity) message(error.message, true);
            if (currentStorage === storageGeneration) retry.hidden = false;
        }
    }
    storage?.addEventListener('change', () => {
        ++storageGeneration;
        presets = [];
        renderList();
        return refresh();
    });
    retry.addEventListener('click', refresh);
    await refresh();
});
