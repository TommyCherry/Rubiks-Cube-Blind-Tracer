console.log("MAIN JS FILE LOADED");
const STORAGE_KEY = "bldLetterScheme";
const COLOR_SCHEME_STORAGE_KEY = "bldColorScheme";
const ORIENTATION_STORAGE_KEY = "bldCubeOrientation";

const cstimerWorker = (function () {

    // Create a Web Worker running csTimer's module
    const worker = new Worker("/static/cstimer_module.js");

    // Stores the callback for each request
    const callbacks = {};

    // Gives every request a unique ID
    let msgid = 0;

    // Handle messages returned by the csTimer worker
    worker.onmessage = function (e) {
        const data = e.data;

        // data[0] = request ID
        // data[1] = request type
        // data[2] = returned result

        const callback = callbacks[data[0]];

        // We no longer need this callback
        delete callbacks[data[0]];

        // Give the returned result back to the Promise
        if (callback) {
            callback(data[2]);
        }
    };

    // Send a request to the csTimer worker
    function callWorkerAsync(type, details) {
        return new Promise(function (resolve) {

            // Create a new request ID
            ++msgid;

            // Remember which Promise belongs to this request
            callbacks[msgid] = resolve;

            // Send the request to csTimer
            worker.postMessage([
                msgid,
                type,
                details
            ]);
        });
    }

    // Public functions we want to use in our app
    return {
        getScramble: function (...args) {
            return callWorkerAsync(
                "scramble",
                args
            );
        }
    };

})();

const generateScrambleButton =
    document.getElementById("generateScrambleButton");

const scrambleInput =
    document.getElementById("scramble");

const usePseudoswap =
    document.getElementById("usePseudoswap");

const pseudoswapEdgeSelection =
    document.getElementById("pseudoswapEdgeSelection");

const edgeBufferSelect =
    document.getElementById("edge-buffer");

const cornerBufferSelect =
    document.getElementById("corner-buffer");


function updatePrimaryFloatingBuffer(
    selectElement,
    checkboxName,
    previousPrimary
) {
    const newPrimary =
        selectElement.options[
            selectElement.selectedIndex
        ].text.trim();

    const checkboxes = document.querySelectorAll(
        `input[name="${checkboxName}"]`
    );

    checkboxes.forEach(function (checkbox) {

        // Unlock the previous primary buffer
        if (checkbox.value === previousPrimary) {
            checkbox.disabled = false;
        }

        // Always select and lock the current primary buffer
        if (checkbox.value === newPrimary) {
            checkbox.checked = true;
            checkbox.disabled = true;
            if (previousPrimary !== null && previousPrimary !== newPrimary) {
                const item = checkbox.closest(".floating-buffer-item");
                item.parentElement.prepend(item);
            }
        }
    });

    return newPrimary;
}


// Restore and submit both lists, including their disabled primary checkboxes.
for (const kind of ["edge", "corner"]) {
    const list = document.getElementById(`${kind}FloatingOrder`);
    const enabled = JSON.parse(list.dataset.enabled);
    JSON.parse(list.dataset.order).forEach(function (name) {
        const item = [...list.children].find(item => item.dataset.buffer === name);
        item.querySelector('input[type="checkbox"]').checked = enabled.includes(name);
        list.appendChild(item);
    });

    document.getElementById("memo-form").addEventListener("formdata", function (event) {
        event.formData.delete(`${kind}_floating_buffers`);
        event.formData.delete(`${kind}_floating_order`);
        [...list.children].forEach(function (item) {
            event.formData.append(`${kind}_floating_order`, item.dataset.buffer);
            if (item.querySelector('input[type="checkbox"]').checked) {
                event.formData.append(`${kind}_floating_buffers`, item.dataset.buffer);
            }
        });
    });
}

document.querySelectorAll("[data-floating-select]").forEach(function (button) {
    button.addEventListener("click", function () {
        const list = document.getElementById(button.dataset.list);
        list.querySelectorAll('input[type="checkbox"]').forEach(function (checkbox) {
            checkbox.checked = checkbox.disabled || button.dataset.floatingSelect === "all";
        });
    });
});

let currentPrimaryEdgeBuffer =
    updatePrimaryFloatingBuffer(
        edgeBufferSelect,
        "edge_floating_buffers",
        null
    );

let currentPrimaryCornerBuffer =
    updatePrimaryFloatingBuffer(
        cornerBufferSelect,
        "corner_floating_buffers",
        null
    );


edgeBufferSelect.addEventListener("change", function () {
    currentPrimaryEdgeBuffer =
        updatePrimaryFloatingBuffer(
            edgeBufferSelect,
            "edge_floating_buffers",
            currentPrimaryEdgeBuffer
        );
});


cornerBufferSelect.addEventListener("change", function () {
    currentPrimaryCornerBuffer =
        updatePrimaryFloatingBuffer(
            cornerBufferSelect,
            "corner_floating_buffers",
            currentPrimaryCornerBuffer
        );
});

usePseudoswap.addEventListener("change", function () {
    pseudoswapEdgeSelection.hidden = !usePseudoswap.checked;
});

generateScrambleButton.addEventListener("click", function () {

    cstimerWorker.getScramble("333").then(function (scramble) {
        scrambleInput.value = scramble;
    });

});

// Save all editable stickers
function saveLetterScheme() {
    const scheme = {};

    document.querySelectorAll("input.sticker").forEach(sticker => {
        scheme[sticker.name] = sticker.value;
    });

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(scheme)
    );
}


// Load saved letters
function loadLetterScheme() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
        return;
    }

    const scheme = JSON.parse(saved);

    document.querySelectorAll("input.sticker").forEach(sticker => {
        if (scheme[sticker.name] !== undefined) {
            sticker.value = scheme[sticker.name];
        }
    });
}


// Reset everything to Speffz
function resetToSpeffz() {
    document.querySelectorAll("input.sticker").forEach(sticker => {
        sticker.value = sticker.dataset.speffz;
    });

    localStorage.removeItem(STORAGE_KEY);
}

// ---------------------------------------------------------
// Cube color scheme / text color / orientation 
// ---------------------------------------------------------

let colorScheme = {
    U: "#ffffff",
    F: "#20a84a",
    R: "#e53935",
    B: "#2468d8",
    L: "#ff8c00",
    D: "#ffd92f"
};


let cubeOrientation = { ...colorScheme };

// Chooses black or white text for letters on pieces based on the face color
function getContrastTextColor(hexColor) {
    const hex = hexColor.replace("#", "");

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Perceived brightness
    const brightness =
        (r * 299 + g * 587 + b * 114) / 1000;

    return brightness > 128 ? "black" : "white";
}

// Updates the visual cube to match the current cube orientation
function updateCubeColors() {
    for (const [face, color] of Object.entries(cubeOrientation)) {

        const textColor = getContrastTextColor(color);

        document
            .querySelectorAll(`.face-${face.toLowerCase()} .sticker`)
            .forEach(sticker => {
                sticker.style.backgroundColor = color;
                sticker.style.color = textColor;
            });
    }
}

// Saves the user's color scheme and current orientation
function saveCubeColors() {
    localStorage.setItem(
        COLOR_SCHEME_STORAGE_KEY,
        JSON.stringify(colorScheme)
    );

    localStorage.setItem(
        ORIENTATION_STORAGE_KEY,
        JSON.stringify(cubeOrientation)
    );
}

// Loads the user's saved color scheme and orientation
function loadCubeColors() {
    const savedColorScheme =
        localStorage.getItem(COLOR_SCHEME_STORAGE_KEY);

    const savedOrientation =
        localStorage.getItem(ORIENTATION_STORAGE_KEY);

    if (savedColorScheme) {
        colorScheme = JSON.parse(savedColorScheme);
    }

    if (savedOrientation) {
        cubeOrientation = JSON.parse(savedOrientation);
    } else {
        cubeOrientation = { ...colorScheme };
    }

    // Update the color pickers to show the saved base scheme
    document.getElementById("color-u").value = colorScheme.U;
    document.getElementById("color-f").value = colorScheme.F;
    document.getElementById("color-r").value = colorScheme.R;
    document.getElementById("color-b").value = colorScheme.B;
    document.getElementById("color-l").value = colorScheme.L;
    document.getElementById("color-d").value = colorScheme.D;

    updateCubeColors();
}


// Apply an x rotation to the current cube orientation
function rotateX() {
    const old = { ...cubeOrientation };

    cubeOrientation.U = old.F;
    cubeOrientation.F = old.D;
    cubeOrientation.D = old.B;
    cubeOrientation.B = old.U;

    updateCubeColors();
    saveCubeColors();
}

// Applies an x' rotation
function rotateXPrime() {
    rotateX();
    rotateX();
    rotateX();
}

// Applies an x2 rotation
function rotateX2() {
    rotateX();
    rotateX();
}

// Applies a y rotation
function rotateY() {
    const old = { ...cubeOrientation };

    cubeOrientation.F = old.R;
    cubeOrientation.R = old.B;
    cubeOrientation.B = old.L;
    cubeOrientation.L = old.F;

    updateCubeColors();
    saveCubeColors();
}

// Applies a y' rotation
function rotateYPrime() {
    rotateY();
    rotateY();
    rotateY();
}

// Applies a y2 rotation
function rotateY2() {
    rotateY();
    rotateY();
}

// Applies a z rotation
function rotateZ() {
    const old = { ...cubeOrientation };

    cubeOrientation.U = old.L;
    cubeOrientation.R = old.U;
    cubeOrientation.D = old.R;
    cubeOrientation.L = old.D;

    updateCubeColors();
    saveCubeColors();
}

// Applies a z' rotation
function rotateZPrime() {
    rotateZ();
    rotateZ();
    rotateZ();
}

// Applies a z2 rotation
function rotateZ2() {
    rotateZ();
    rotateZ();
}

// Reads the user's color-picker choices and updates the base color scheme
function updateColorScheme() {
    colorScheme = {
        U: document.getElementById("color-u").value,
        F: document.getElementById("color-f").value,
        R: document.getElementById("color-r").value,
        B: document.getElementById("color-b").value,
        L: document.getElementById("color-l").value,
        D: document.getElementById("color-d").value
    };

    cubeOrientation = { ...colorScheme };

    updateCubeColors();
    saveCubeColors();
}

// Resets all customizable settings to their defaults
function resetAllSettings() {

    const confirmed = confirm(
        "Reset your letter scheme, color scheme, and cube orientation to defaults?"
    );

    if (!confirmed) {
        return;
    }

    // Reset letter scheme to Speffz
    document.querySelectorAll("input.sticker").forEach(sticker => {
        sticker.value = sticker.dataset.speffz;
    });

    // Reset buffers
    document.getElementById("edge-buffer").value = "0";
    document.getElementById("corner-buffer").value = "0";

    // Reset base color scheme
    colorScheme = {
        U: "#ffffff",
        F: "#20a84a",
        R: "#e53935",
        B: "#2468d8",
        L: "#ff8c00",
        D: "#ffd92f"
    };

    // Reset cube orientation
    cubeOrientation = { ...colorScheme };

    // Reset color pickers
    document.getElementById("color-u").value = colorScheme.U;
    document.getElementById("color-f").value = colorScheme.F;
    document.getElementById("color-r").value = colorScheme.R;
    document.getElementById("color-b").value = colorScheme.B;
    document.getElementById("color-l").value = colorScheme.L;
    document.getElementById("color-d").value = colorScheme.D;

    // Clear saved settings
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(COLOR_SCHEME_STORAGE_KEY);
    localStorage.removeItem(ORIENTATION_STORAGE_KEY);

    // Update visual cube
    updateCubeColors();
}

function enableBufferDragging(listId) {
    const list = document.getElementById(listId);

    let draggedItem = null;

    list.addEventListener("dragstart", function (event) {
        const item = event.target.closest(".floating-buffer-item");

        if (!item) return;

        draggedItem = item;

        event.dataTransfer.effectAllowed = "move";

        item.classList.add("dragging");
    });

    list.addEventListener("dragend", function () {
        if (draggedItem) {
            draggedItem.classList.remove("dragging");
        }

        draggedItem = null;
    });

    list.addEventListener("dragover", function (event) {
        event.preventDefault();

        event.dataTransfer.dropEffect = "move";

        if (!draggedItem) return;

        const afterElement = getDragAfterElement(
            list,
            event.clientX
        );

        if (afterElement == null) {
            list.appendChild(draggedItem);
        } else {
            list.insertBefore(draggedItem, afterElement);
        }
    });
}


function getDragAfterElement(container, x) {
    const items = [
        ...container.querySelectorAll(
            ".floating-buffer-item:not(.dragging)"
        )
    ];

    return items.reduce(
        (closest, item) => {
            const box = item.getBoundingClientRect();

            const offset =
                x - box.left - box.width / 2;

            if (
                offset < 0 &&
                offset > closest.offset
            ) {
                return {
                    offset: offset,
                    element: item
                };
            }

            return closest;
        },
        {
            offset: Number.NEGATIVE_INFINITY,
            element: null
        }
    ).element;
}


enableBufferDragging("edgeFloatingOrder");
enableBufferDragging("cornerFloatingOrder");


// Run once the page is loaded
document.addEventListener("DOMContentLoaded", () => {
    const importedScrambles =
        sessionStorage.getItem("importedBulkScrambles");

    if (importedScrambles) {
        const bulkInput =
            document.getElementById("bulk-scrambles");

        if (bulkInput) {
            bulkInput.value = importedScrambles;
            sessionStorage.removeItem("importedBulkScrambles");
        }
    }

    loadLetterScheme();


    // Save whenever the user changes a sticker
    document.querySelectorAll("input.sticker").forEach(sticker => {
        sticker.addEventListener("input", saveLetterScheme);
    });


    // Save immediately before submitting to Flask
    document
        .getElementById("memo-form")
        .addEventListener("submit", saveLetterScheme);


    // Reset lettering scheme
    document
        .getElementById("reset-speffz")
        .addEventListener("click", resetToSpeffz);


    // Memo copy buttons
    document.querySelectorAll(".copy-button").forEach(button => {

        button.addEventListener("click", () => {

            const targetId = button.dataset.copyTarget;

            const memo = document
                .getElementById(targetId)
                .textContent
                .trim();

            navigator.clipboard.writeText(memo);

            button.textContent = "Copied!";

            setTimeout(() => {
                button.textContent = "Copy";
            }, 1200);

        });

    });

    // Pick colors for color scheme
    const colorPickers = {
        u: document.getElementById("color-u"),
        f: document.getElementById("color-f"),
        r: document.getElementById("color-r"),
        b: document.getElementById("color-b"),
        l: document.getElementById("color-l"),
        d: document.getElementById("color-d")
    };
    
    for (const picker of Object.values(colorPickers)) {
        picker.addEventListener("input", updateColorScheme);
    }

    // Load saved color scheme and orientation
    loadCubeColors();

    // Cube orientation controls
    document
        .getElementById("rotate-x")
        .addEventListener("click", rotateX);

    document
        .getElementById("rotate-x-prime")
        .addEventListener("click", rotateXPrime);

    document
        .getElementById("rotate-x2")
        .addEventListener("click", rotateX2);

    document
        .getElementById("rotate-y")
        .addEventListener("click", rotateY);

    document
        .getElementById("rotate-y-prime")
        .addEventListener("click", rotateYPrime);

    document
        .getElementById("rotate-y2")
        .addEventListener("click", rotateY2);

    document
        .getElementById("rotate-z")
        .addEventListener("click", rotateZ);

    document
        .getElementById("rotate-z-prime")
        .addEventListener("click", rotateZPrime);

    document
        .getElementById("rotate-z2")
        .addEventListener("click", rotateZ2);
    
    // Reset all settings
    document
    .getElementById("reset-all-settings")
    .addEventListener("click", resetAllSettings);

        
});



// Persist per-case parity choices independently of the letter scheme.
(() => {
    const controls = [...document.querySelectorAll('[data-parity-override]')];
    const key = 'cornerParityPseudoswaps';
    try {
        const saved = JSON.parse(localStorage.getItem(key) || '{}');
        controls.forEach(control => {
            if (!control.value && Object.hasOwn(saved, control.name)
                && [...control.options].some(option => option.value === saved[control.name])) {
                control.value = saved[control.name];
            }
        });
    } catch (_) { /* Keep server values when browser storage is unavailable. */ }
    const save = () => {
        try { localStorage.setItem(key, JSON.stringify(Object.fromEntries(controls.map(c => [c.name, c.value])))); } catch (_) {}
    };
    controls.forEach(control => control.addEventListener('change', save));
    document.getElementById('reset-parity-overrides')?.addEventListener('click', () => {
        controls.forEach(control => { control.value = ''; });
        save();
    });
})();

// Reorder existing controls so edits survive priority and primary changes.
(() => {
    const list = document.getElementById('cornerFloatingOrder');
    const primary = document.getElementById('corner-buffer');
    const section = document.getElementById('corner-parity-settings');
    if (!list || !primary || !section) return;
    const refresh = () => {
        const selected = primary.selectedOptions[0].textContent.trim();
        const order = [selected, ...[...list.children].map(item => item.dataset.buffer).filter(name => name !== selected)];
        order.forEach((name, index) => {
            const group = section.querySelector(`[data-parity-buffer="${name}"]`);
            group.hidden = index === order.length - 1;
            group.querySelector('summary').textContent = `${name} buffer — ${(order.length - index - 1) * 3} cases`;
            const grid = group.querySelector('.parity-case-grid');
            order.forEach((piece, targetIndex) => {
                grid.querySelectorAll(`[data-parity-piece="${piece}"]`).forEach(fieldset => {
                    fieldset.hidden = targetIndex <= index;
                    grid.appendChild(fieldset);
                });
            });
            section.appendChild(group);
        });
    };
    new MutationObserver(refresh).observe(list, { childList: true });
    primary.addEventListener('change', refresh);
    refresh();
})();

// Hidden inputs move with their panels, preserving submission order.
document.querySelectorAll('[data-cycle-break-order]').forEach(list => {
    const key = `${list.dataset.countParity || "even"}CycleBreakOrder-${list.dataset.cycleBreakOrder}${list.dataset.startingTarget ? '-' + list.dataset.startingTarget : ''}`;
    const toggle = list.closest('[data-odd-override]')?.querySelector('[data-override-enabled]');
    if (toggle) {
        try {
            const saved = localStorage.getItem(key + '-enabled');
            if (saved !== null) toggle.checked = saved === 'true';
        } catch (_) {}
        list.hidden = !toggle.checked;
        toggle.addEventListener('change', () => {
            list.hidden = !toggle.checked;
            if (toggle.checked) {
                const base = document.querySelector(`[data-cycle-break-order="${list.dataset.cycleBreakOrder}"][data-count-parity="odd"]:not([data-starting-target])`);
                [...base.children].forEach(item => list.appendChild([...list.children].find(child => child.dataset.piece === item.dataset.piece)));
            }
            save();
            try { localStorage.setItem(key + '-enabled', String(toggle.checked)); } catch (_) {}
        });
    }
    const save = () => {
        try { localStorage.setItem(key, JSON.stringify([...list.children].map(c => c.dataset.piece))); } catch (_) {}
    };
    try {
        const saved = JSON.parse(localStorage.getItem(key) || 'null');
        const items = [...list.children];
        if (Array.isArray(saved) && saved.length === items.length && new Set(saved).size === items.length
            && saved.every(name => items.some(item => item.dataset.piece === name))) {
            saved.forEach(name => list.appendChild(items.find(item => item.dataset.piece === name)));
        }
    } catch (_) {}
    list.addEventListener('click', event => {
        const button = event.target.closest('[data-move]');
        if (!button) return;
        const item = button.closest('li');
        if (button.dataset.move === 'up' && item.previousElementSibling) {
            list.insertBefore(item, item.previousElementSibling);
        } else if (button.dataset.move === 'down' && item.nextElementSibling) {
            list.insertBefore(item.nextElementSibling, item);
        }
        button.focus();
        save();
    });
    let dragged = null;
    list.addEventListener('dragstart', event => {
        dragged = event.target.closest('li');
        if (!dragged) return;
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', dragged.dataset.piece);
        dragged.classList.add('dragging');
    });
    list.addEventListener('dragover', event => {
        if (!dragged) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        const target = event.target.closest('li');
        if (!target || target === dragged || target.parentElement !== list) return;
        const rect = target.getBoundingClientRect();
        list.insertBefore(dragged, event.clientX < rect.left + rect.width / 2 ? target : target.nextSibling);
    });
    list.addEventListener('drop', event => {
        if (!dragged) return;
        event.preventDefault();
        save();
    });
    list.addEventListener('dragend', () => {
        dragged?.classList.remove('dragging');
        dragged = null;
        save();
    });
});
