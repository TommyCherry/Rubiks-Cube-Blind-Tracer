(() => {
    const defaults = {U: '#ffffff', R: '#e53935', F: '#20a84a', D: '#ffd92f', L: '#ff8c00', B: '#2468d8'};
    function refresh() {
        let colors = defaults;
        try {
            colors = typeof cubeOrientation !== 'undefined' ? cubeOrientation :
                JSON.parse(localStorage.getItem('bldCubeOrientation') || 'null') || defaults;
        } catch (_) {}
        for (const face of Object.keys(defaults)) {
            const color = /^#[0-9a-f]{6}$/i.test(colors[face]) ? colors[face] : defaults[face];
            document.documentElement.style.setProperty(`--scramble-${face}`, color);
        }
    }
    document.addEventListener('DOMContentLoaded', refresh);
    document.addEventListener('change', refresh);
    document.addEventListener('letter-scheme-change', refresh);
    document.addEventListener('click', () => queueMicrotask(refresh));
})();
