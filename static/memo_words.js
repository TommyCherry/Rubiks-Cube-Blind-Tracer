// Approximate English cues, deliberately local so filtering needs no extra lookup.
function memoWordCue(word, pair = '') {
    const plain = word.replace(/\([^)]*\)/g, '').trim().toLowerCase();
    const overrides = {pikachu: 'pik', pokemon: 'poke', abacus: 'ab',
        astronaut: 'ast', aquarium: 'tank', elephant: 'elf', butterfly: 'fly',
        banana: 'ban', bicycle: 'bike', computer: 'comp', unicorn: 'horn'};
    const singleWords = new Set(['fire', 'wire', 'hour', 'our', 'ice', 'ace', 'axe', 'eye', 'one']);
    function syllables(text) {
        if (singleWords.has(text)) return 1;
        let normalized = text.replace(/(?:[^aeiouy])e$/, match => match[0]);
        return (normalized.match(/[aeiouy]+/g) || []).length || text.length;
    }
    if (/^[a-z]+$/.test(plain) && syllables(plain) === 1) return {word, short: word, generated: false};
    let cue = overrides[plain];
    if (!cue) {
        const first = (plain.match(/[a-z]+/) || [''])[0];
        // Keep the first vowel sound and one following consonant: Pikachu -> pik.
        cue = first.match(/^[^aeiouy]*[aeiouy]+(?:ch|sh|th|ck|[bcdfghjklmnpqrstvwxz])?/)?.[0];
    }
    const letters = pair.toLowerCase();
    if (/^[a-z]{2}$/.test(letters)) {
        const [first, second] = letters;
        const containsPair = text => {
            const start = (text || '').indexOf(first);
            return start !== -1 && text.indexOf(second, start + 1) !== -1;
        };
        if (!containsPair(cue)) {
            // Compress around the pair, retaining a vowel from the image word:
            // galaxy/GX -> gax, Pikachu/PK -> pik, butterfly/BF -> buf.
            const start = plain.indexOf(first);
            const vowel = (plain.slice(Math.max(0, start + 1)).match(/[aeiou]/)
                || plain.match(/[aeiou]/) || ['a'])[0];
            const candidate = /[aeiouy]/.test(first + second)
                ? first + second : first + vowel + second;
            if (syllables(candidate) === 1) cue = candidate;
        }
    }
    // Never emit common offensive fragments accidentally formed by truncation.
    const blocked = new Set(['ass', 'sex', 'cum', 'tit', 'cock', 'dick', 'fuc', 'fuck', 'shit', 'nig', 'cunt']);
    if (!cue || cue.length < 2 || blocked.has(cue) || syllables(cue) !== 1) cue = null;
    return {word, short: cue, generated: true};
}

// Highlight two distinct occurrences in pair order, including repeated letters.
function memoPairCase(word, pair) {
    const letters = Array.from(word.toLowerCase());
    const targets = Array.from(pair.toLowerCase());
    if (targets.length !== 2) return word;
    const first = letters.indexOf(targets[0]);
    const second = first < 0 ? -1 : letters.indexOf(targets[1], first + 1);
    if (second < 0) return word;
    letters[first] = letters[first].toUpperCase();
    letters[second] = letters[second].toUpperCase();
    return letters.join('');
}

// Keep the displayed pairing and all bracketed technique annotations intact.
function memoWordTokens(memo) {
    const tokens = [];
    let token = '', depth = 0;
    for (const char of memo.trim()) {
        if (/\s/.test(char) && depth === 0) {
            if (token) tokens.push(token);
            token = '';
        } else {
            token += char;
            if (char === '[') depth++;
            if (char === ']') depth = Math.max(0, depth - 1);
        }
    }
    if (token) tokens.push(token);
    return tokens;
}

// Local story scaffolding: keep every cue in order, and stop at annotations or
// missing images rather than inventing a word or crossing a technique boundary.
function memoExampleStory(cues) {
    const sentences = [];
    let group = [];
    function flush() {
        if (!group.length) return;
        const joins = ['', ' beside ', ', with ', ' resting on ', ' near '];
        sentences.push('Picture ' + group.map((cue, i) => joins[i] + cue).join('') + '.');
        group = [];
    }
    cues.forEach(({text, image}) => {
        if (!image) { flush(); sentences.push(text.startsWith('[') ? text : `[${text}]`); }
        else { group.push(text); if (group.length === 5) flush(); }
    });
    flush();
    return sentences.join(' ');
}

function memoStoryMeaning(cues) {
    const descriptions = [];
    let group = [];
    const quote = text => `“${text}”`;
    function flush() {
        if (!group.length) return;
        const [a, b, c, d, e] = group.map(quote);
        let scene = b
            ? `In this imagined scene, ${a} and ${b} appear side by side.`
            : `Imagine a scene centered on an image of ${a}.`;
        if (c) {
            scene += d
                ? ` An image of ${c} rests on a model of ${d}${e ? `, near a representation of ${e}` : ''}.`
                : ` An image of ${c} is placed nearby, connecting the two.`;
        }
        descriptions.push(scene);
        group = [];
    }
    cues.forEach(({original, text, image}) => {
        if (!image) {
            flush();
            descriptions.push(`Keep ${quote(text)} as a separate memo cue.`);
        } else {
            // Interpret the original image, not an invented one-syllable sound.
            group.push(original || text);
            if (group.length === 5) flush();
        }
    });
    flush();
    return descriptions.join(' ');
}

document.addEventListener('DOMContentLoaded', async () => {
    const panels = [...document.querySelectorAll('[data-memo-words]')];
    if (!panels.length) return;
    const pairKey = token => token.replace(/[a-z]/g, char => char.toUpperCase());
    const isPair = token => /^[A-Zʧ]{2}$/.test(pairKey(token));
    const entries = panels.map(panel => ({panel,
        tokens: memoWordTokens(document.getElementById(panel.dataset.memoWords).textContent)}));
    const words = {};
    const overrides = new Map();
    const savedWords = new Map();
    const changedAccountPairs = new Set();
    const account = document.getElementById('memo-account')?.dataset || {};
    let signedIn = account.signedIn === 'true';
    let accountWarning = '';
    const wordFor = token => overrides.has(pairKey(token))
        ? overrides.get(pairKey(token)) || words[pairKey(token)]
        : savedWords.get(pairKey(token)) || words[pairKey(token)];
    const loaded = new Set();
    const filters = [...document.querySelectorAll('[data-one-syllable]')];
    let oneSyllable = false;
    try { oneSyllable = localStorage.getItem('memo-one-syllable') === 'true'; } catch (_) {}
    let render = () => {};
    async function accountRequest(method = 'GET', data) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 10000);
        try {
            const response = await fetch('/api/memo-word-choices', {
                method, signal: controller.signal, cache: 'no-store',
                headers: {'Content-Type': 'application/json', 'X-Memo-CSRF': account.csrf || ''},
                ...(data ? {body: JSON.stringify(data)} : {}),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Account word choices are unavailable.');
            return result;
        } catch (error) {
            if (error.name === 'AbortError') throw new Error(method === 'GET'
                ? 'Loading account word choices timed out.'
                : 'The account request timed out. It may have completed; reload to check.');
            throw error;
        } finally { clearTimeout(timer); }
    }
    if (signedIn) {
        accountRequest().then(result => {
            Object.entries(result.words).forEach(([pair, word]) => {
                if (!changedAccountPairs.has(pair)) savedWords.set(pair, word);
            });
            render();
        }).catch(error => { accountWarning = error.message; });
    }
    function choiceButton(token) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'memo-change-word';
        button.textContent = 'Choose word';
        button.setAttribute('aria-label', `Choose a word for ${token}`);
        button.addEventListener('click', () => openWordPicker(pairKey(token)));
        return button;
    }
    async function openWordPicker(pair) {
        const dialog = document.createElement('dialog');
        dialog.className = 'memo-word-picker';
        dialog.setAttribute('aria-label', `Choose a word for ${pair}`);
        const title = document.createElement('h3');
        title.textContent = `Word for ${pair}`;
        const help = document.createElement('p');
        help.textContent = 'Applies to every occurrence of this pair. Save to your account to reuse it on future visits, or leave unchecked to use it only on this page. Words are not submitted to CoLPI.';
        const status = document.createElement('p');
        status.setAttribute('role', 'status');
        status.textContent = 'Loading CoLPI alternatives…';
        const label = document.createElement('label');
        label.textContent = 'Choose from CoLPI';
        const select = document.createElement('select');
        select.disabled = true;
        label.appendChild(select);
        const useChoice = document.createElement('button');
        useChoice.type = 'button'; useChoice.textContent = 'Use selected word'; useChoice.disabled = true;
        const customLabel = document.createElement('label');
        customLabel.textContent = 'Or enter your own word';
        const input = document.createElement('input');
        input.type = 'text'; input.maxLength = 120; input.value = wordFor(pair) || '';
        customLabel.appendChild(input);
        const useCustom = document.createElement('button');
        useCustom.type = 'button'; useCustom.textContent = 'Use my word';
        const reset = document.createElement('button');
        reset.type = 'button'; reset.textContent = 'Restore default';
        const close = document.createElement('button');
        close.type = 'button'; close.textContent = 'Cancel';
        let accountControl = document.createElement(signedIn ? 'label' : 'a');
        const saveAccount = document.createElement('input');
        saveAccount.type = 'checkbox'; saveAccount.checked = false;
        let loginInterval, loginDeadline, checkingLogin = false, pickerClosed = false;
        function stopLoginChecks() {
            clearInterval(loginInterval); clearTimeout(loginDeadline);
            if (typeof window !== 'undefined') window.removeEventListener('focus', checkLogin);
        }
        async function checkLogin() {
            if (checkingLogin || pickerClosed || signedIn) return;
            checkingLogin = true;
            const checkController = new AbortController();
            const timeout = setTimeout(() => checkController.abort(), 5000);
            try {
                const response = await fetch('/api/memo-word-session', {cache: 'no-store', signal: checkController.signal});
                if (!response.ok) return;
                const result = await response.json();
                if (!result.signed_in || !result.csrf || pickerClosed) return;
                signedIn = true;
                account.csrf = result.csrf;
                const label = document.createElement('label');
                label.textContent = 'Save to my account';
                label.appendChild(saveAccount);
                accountControl.replaceWith(label);
                accountControl = label;
                saveAccount.checked = true;
                status.textContent = 'Signed in. Your draft is unchanged. Apply your chosen word to save it to your account.';
                stopLoginChecks();
            } catch (_) {
                // Keep the original page and draft intact if sign-in is cancelled
                // or temporarily unreachable. The login link remains available.
            } finally { checkingLogin = false; clearTimeout(timeout); }
        }
        if (signedIn) {
            accountControl.textContent = 'Save to my account';
            accountControl.appendChild(saveAccount);
        } else {
            accountControl.textContent = 'Save to my account (log in with WCA)';
            accountControl.href = (account.loginUrl || '/auth/wca') + '?memo=1';
            accountControl.target = '_blank';
            accountControl.rel = 'noopener';
            accountControl.addEventListener('click', () => {
                stopLoginChecks();
                status.textContent = 'Finish WCA sign-in in the new tab, then return here. Your word and selection will stay in this picker.';
                window.addEventListener('focus', checkLogin);
                loginInterval = setInterval(checkLogin, 2000);
                loginDeadline = setTimeout(() => {
                    stopLoginChecks();
                    if (!signedIn && !pickerClosed) status.textContent = 'Sign-in has not been detected. You can click the login link to try again; your draft is unchanged.';
                }, 300000);
                return checkLogin();
            });
        }
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 10000);
        dialog.addEventListener('close', () => { pickerClosed = true; stopLoginChecks(); controller.abort(); clearTimeout(timer); dialog.remove(); });
        async function apply(value) {
            if (!value.trim() || value.trim().length > 120) {
                status.textContent = 'Enter a word between 1 and 120 characters.'; return;
            }
            overrides.set(pair, value.trim());
            render();
            if (signedIn && saveAccount.checked) {
                changedAccountPairs.add(pair);
                useChoice.disabled = useCustom.disabled = reset.disabled = true;
                status.textContent = 'Saving word to your account…';
                try {
                    await accountRequest('PUT', {pair, word: value.trim()});
                    savedWords.set(pair, value.trim());
                } catch (error) {
                    status.textContent = `${error.message} Your word is still applied on this page.`;
                    useChoice.disabled = select.disabled; useCustom.disabled = reset.disabled = false;
                    return;
                }
            }
            dialog.close();
        }
        useChoice.addEventListener('click', () => { if (!useChoice.disabled) return apply(select.value); });
        useCustom.addEventListener('click', () => apply(input.value));
        input.addEventListener('keydown', event => {
            if (event.key === 'Enter') { event.preventDefault(); apply(input.value); }
        });
        reset.addEventListener('click', () => { overrides.set(pair, null); dialog.close(); render(); });
        close.addEventListener('click', () => dialog.close());
        dialog.append(title, help, label, useChoice, customLabel, useCustom, reset, close, accountControl, status);
        if (signedIn) {
            const removeSaved = document.createElement('button');
            removeSaved.type = 'button'; removeSaved.textContent = 'Remove saved account word';
            removeSaved.addEventListener('click', async () => {
                removeSaved.disabled = true;
                changedAccountPairs.add(pair);
                try {
                    await accountRequest('DELETE', {pair});
                    savedWords.delete(pair); overrides.set(pair, null); render(); dialog.close();
                } catch (error) { status.textContent = error.message; removeSaved.disabled = false; }
            });
            dialog.appendChild(removeSaved);
        }
        document.body.appendChild(dialog);
        dialog.showModal();
        try {
            const response = await fetch('/api/memo-word-options?pair=' + encodeURIComponent(pair), {signal: controller.signal});
            if (!response.ok) throw new Error('Unavailable');
            const result = await response.json();
            if (result.censored !== true || result.pair !== pair || !Array.isArray(result.words)) throw new Error('Unverified');
            result.words.forEach(word => {
                const option = document.createElement('option');
                option.value = word; option.textContent = word;
                select.appendChild(option);
            });
            select.disabled = useChoice.disabled = result.words.length === 0;
            status.textContent = (result.words.length ? 'Choose an alternative or enter your own.' : 'No alternatives available. You can enter your own word.') + (accountWarning ? ` ${accountWarning}` : '');
        } catch (_) {
            status.textContent = 'CoLPI alternatives are unavailable. You can still enter your own word.';
        } finally { clearTimeout(timer); }
    }
    filters.forEach(filter => {
        filter.checked = oneSyllable;
        filter.addEventListener('change', () => {
            oneSyllable = filter.checked;
            filters.forEach(item => { item.checked = oneSyllable; });
            try { localStorage.setItem('memo-one-syllable', String(oneSyllable)); } catch (_) {}
            render();
        });
    });
    async function loadEntries(selected) {
    selected.forEach(({panel}) => {
        if (panel.dataset.storyRow) document.getElementById(panel.dataset.storyRow).hidden = false;
    });
    const pairs = [...new Set(selected.flatMap(entry => entry.tokens.filter(isPair).map(pairKey)))];
    if (!pairs.length) {
        selected.forEach(({panel}) => { panel.hidden = false; panel.textContent = 'No ordinary letter pairs to look up.'; });
        return true;
    }
    selected.forEach(({panel}) => { panel.hidden = false; panel.textContent = 'Loading word examples…'; });
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
        const response = await fetch('/api/memo-words?pairs=' + encodeURIComponent(pairs.join(',')),
            {signal: controller.signal});
        if (!response.ok) throw new Error('Unavailable');
        const result = await response.json();
        if (result.censored !== true) throw new Error('Censorship not verified');
        Object.assign(words, result.words);
        selected.forEach(({panel}) => loaded.add(panel));
        render = () => entries.filter(({panel}) => loaded.has(panel)).forEach(({panel, tokens}) => {
            panel.replaceChildren();
            const bulk = panel.dataset.bulkWords !== undefined;
            const detail = bulk ? document.createElement('div') : null;
            const buttons = [];
            if (detail) {
                detail.id = `${panel.dataset.memoWords}-word-detail`;
                detail.className = 'bulk-word-detail';
                detail.hidden = true;
                detail.setAttribute('role', 'status');
            }
            tokens.forEach((token, index) => {
                if (bulk) {
                    if (index) {
                        const separator = document.createElement('span');
                        separator.textContent = ' · ';
                        separator.setAttribute('aria-hidden', 'true');
                        panel.appendChild(separator);
                    }
                    const original = wordFor(token);
                    const cue = isPair(token) && original ? memoWordCue(original, pairKey(token)) : null;
                    const item = document.createElement(isPair(token) ? 'button' : 'span');
                    item.className = isPair(token) ? 'bulk-word-button' : 'bulk-word-annotation';
                    item.textContent = cue ? memoPairCase((oneSyllable ? cue.short || token : original).toLowerCase(), token) : token;
                    if (isPair(token)) {
                        item.type = 'button';
                        item.setAttribute('aria-label', `${token}: ${item.textContent}. Show word details`);
                        item.setAttribute('aria-expanded', 'false');
                        item.setAttribute('aria-controls', detail.id);
                        item.addEventListener('click', () => {
                            const opening = item.getAttribute('aria-expanded') !== 'true';
                            buttons.forEach(button => button.setAttribute('aria-expanded', 'false'));
                            item.setAttribute('aria-expanded', String(opening));
                            detail.textContent = `${token} — ${(original ? memoPairCase(original, token) : 'No example available')}` + (cue?.generated
                                ? (cue.short ? ` · Short cue: ${memoPairCase(cue.short, token)} (approx.)` : ' · No short cue available')
                                : (cue ? ' · One syllable' : ''));
                            detail.appendChild(choiceButton(token));
                            detail.hidden = !opening;
                        });
                        buttons.push(item);
                    }
                    panel.appendChild(item);
                    return;
                }
                const item = document.createElement('span');
                item.className = 'memo-word';
                if (isPair(token)) {
                    const label = document.createElement('strong');
                    label.textContent = token;
                    const word = document.createElement('span');
                    const original = wordFor(token);
                    const cue = original ? memoWordCue(original, pairKey(token)) : null;
                    word.textContent = cue ? (oneSyllable ? (cue.short ? memoPairCase(cue.short, token) : 'No short cue available') : memoPairCase(original, token)) : 'No example available';
                    item.append(label, word);
                    if (cue?.generated && cue.short) {
                        const note = document.createElement('small');
                        note.textContent = oneSyllable ? `From ${memoPairCase(original, token)} · approximate cue` : `Short cue: ${memoPairCase(cue.short, token)} (approx.)`;
                        item.appendChild(note);
                    }
                    item.appendChild(choiceButton(token));
                } else {
                    item.textContent = token;
                    item.classList.add('memo-word-annotation');
                }
                panel.appendChild(item);
            });
            if (detail) panel.appendChild(detail);
            const story = document.createElement('p');
            story.className = 'memo-example-story';
            const heading = document.createElement('strong');
            heading.textContent = 'Example story: ';
            const sentence = document.createElement('span');
            const storyCues = tokens.map(token => {
                const original = isPair(token) ? wordFor(token) : null;
                const cue = original ? memoWordCue(original, pairKey(token)) : null;
                const selected = cue ? (oneSyllable ? cue.short : original) : null;
                return {text: selected ? memoPairCase(selected.toLowerCase(), token) : token,
                    original: original ? memoPairCase(original.toLowerCase(), token) : null, image: Boolean(selected)};
            });
            sentence.textContent = memoExampleStory(storyCues);
            story.append(heading, sentence);
            const meaning = document.createElement('small');
            meaning.className = 'memo-story-meaning';
            meaning.textContent = memoStoryMeaning(storyCues);
            story.appendChild(meaning);
            panel.appendChild(story);
        });
        render();
        return true;
    } catch (_) {
        selected.forEach(({panel}) => { panel.textContent = 'Word examples are unavailable right now. Your letter memo is ready to use.'; });
        return false;
    } finally { clearTimeout(timer); }
    }
    const bulkButton = document.getElementById('load-bulk-memo-words');
    const bulkStatus = document.getElementById('bulk-memo-words-status');
    const bulkEntries = entries.filter(({panel}) => panel.dataset.bulkWords !== undefined);
    if (bulkButton && bulkEntries.length) {
        bulkButton.addEventListener('click', async () => {
            if (bulkButton.disabled) return;
            bulkButton.disabled = true;
            bulkStatus.textContent = 'Loading word examples for the displayed scrambles…';
            const success = await loadEntries(bulkEntries);
            bulkStatus.textContent = success ? 'Word examples loaded for the displayed scrambles.' : 'Word examples could not be loaded. You can retry.';
            bulkButton.textContent = success ? 'Memo words & stories shown' : 'Retry memo words & stories';
            bulkButton.disabled = success;
        });
    }
    const automatic = entries.filter(({panel}) => panel.dataset.bulkWords === undefined);
    if (automatic.length) await loadEntries(automatic);
});
