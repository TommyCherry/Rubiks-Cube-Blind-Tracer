// Deterministic adjacent-image connections. No network or model inference.
function memoLexeme(cue) {
    const word = (cue.original || cue.text || '').toLowerCase().trim();
    const entry = MEMO_LEXICON[word];
    const lexeme = {word, ...(entry || {category: 'unknown', number: 'unknown', properties: []})};
    // The cue stays unchanged; physical connections use its imagined stand-in.
    if (entry?.representation) {
        const {category, number, properties} = entry.representation;
        Object.assign(lexeme, {category, number, properties});
    }
    return lexeme;
}

function memoConnection(left, right, index, count = 2) {
    const a = memoLexeme(left), b = memoLexeme(right);
    const animate = ['person', 'animal'].includes(a.category);
    let choices;
    // Each choice has a one-, two-, and three-word compact form and a full verb.
    if (a.category === 'unknown' || b.category === 'unknown') choices = [['pushes', 'pushes forward', 'gently pushes forward', 'pushes'], ['lifts', 'lifts up', 'slowly lifts up', 'lifts'], ['pulls', 'pulls along', 'gently pulls along', 'pulls'], ['spins', 'spins around', 'slowly spins around', 'spins']];
    else if (a.word === 'oyster') choices = [['reveals', 'opens beside', 'slowly opens beside', 'opens its rough shell beside']];
    else if (a.word === 'keyboard (qwerty)') choices = [['startles', 'clicks beside', 'loudly clicks beside', 'clicks loudly beside']];
    else if (animate && b.word === 'keyboard (qwerty)') choices = [['touches', 'types on', 'quickly types on', 'types on']];
    else if (a.category === 'person' && b.category === 'person') choices = [
        ['greets', 'waves to', 'eagerly waves to', 'waves to'],
        ['follows', 'stands behind', 'quietly stands behind', 'stands behind'],
    ];
    else if (animate && b.properties.includes('musical')) choices = [['touches', 'plays with', 'gently plays with', 'plays a ringing note on']];
    else if (animate && b.category === 'food') choices = [
        ['sniffs', 'leans toward', 'curiously leans toward', 'leans toward'],
        ['nudges', 'noses toward', 'gently noses toward', 'nudges'],
    ];
    else if (a.category === 'person' && b.properties.includes('portable')) choices = [
        ['carries', 'picks up', 'carefully picks up', 'picks up'],
        ['touches', 'reaches for', 'slowly reaches for', 'reaches for'],
    ];
    else if (animate && b.category === 'place') choices = [['approaches', 'moves toward', 'slowly moves toward', 'moves toward']];
    else if (animate) choices = [['nudges', 'peers at', 'curiously peers at', 'peers at'], ['follows', 'moves around', 'slowly moves around', 'moves around']];
    else if (a.category === 'food' && ['person', 'animal'].includes(b.category)) choices = [['tempts', 'lies before', 'lies temptingly before', 'lies temptingly before']];
    else if (a.category === 'group' && b.properties.includes('musical')) choices = [['surrounds', 'gathers around', 'slowly gathers around', 'gathers around']];
    else if (a.word === 'face' && b.category === 'group') choices = [['watches', 'looks toward', 'intently looks toward', 'looks toward']];
    else if (a.properties.includes('portable') && b.category === 'body') choices = [['brushes', 'brushes against', 'lightly brushes against', 'brushes against']];
    else if (a.category === 'substance' && ['object', 'container'].includes(b.category)) choices = [['coats', 'spreads over', 'slowly spreads over', 'spreads over']];
    else if (a.properties.includes('container') && b.properties.includes('portable')) choices = [['contains', 'closes around', 'slowly closes around', 'closes around']];
    else if (a.properties.includes('portable') && b.properties.includes('portable') && !b.properties.includes('container')) choices = [['bumps', 'bumps into', 'gently bumps into', 'bumps into'], ['passes', 'slides past', 'slowly slides past', 'slides past']];
    else if (a.properties.includes('portable') && b.properties.includes('container')) choices = [['inside', 'rests inside', 'rests snugly inside', 'rests inside']];
    else choices = [['pushes', 'pushes forward', 'gently pushes forward', 'pushes'], ['lifts', 'lifts up', 'slowly lifts up', 'lifts'], ['pulls', 'pulls along', 'gently pulls along', 'pulls'], ['spins', 'spins around', 'slowly spins around', 'spins']];
    const selected = choices[index % choices.length];
    return {compact: count === 0 ? ' → ' : ` ${selected[Math.min(3, count) - 1]} `,
        verb: count === 0 ? selected[3] : count === 1
            ? ({beside: 'is beside', near: 'is near', inside: 'is inside', behind: 'is behind', above: 'is above', opposite: 'is opposite', underneath: 'is underneath'}[selected[0]] || selected[0]) : selected[3]};
}

// Orientation is a mnemonic convention, local to each adjacent connection.
// A person may turn between links; never carry orientation across a boundary.
function memoFacingPlan(cues) {
    const facing = new Map();
    const things = new Set(['object', 'body', 'food', 'substance', 'instrument', 'container', 'vehicle', 'clothing', 'plant']);
    return cues.slice(1).map((cue, i) => {
        const a = memoLexeme(cues[i]), b = memoLexeme(cue);
        let person, direction;
        if (things.has(a.category) && b.category === 'person') { person = i + 1; direction = 'toward'; }
        else if (a.category === 'person' && things.has(b.category)) { person = i; direction = 'away from'; }
        else return '';
        const turn = facing.has(person) && facing.get(person) !== direction;
        facing.set(person, direction);
        const label = cues[person].original || cues[person].text;
        const personEntry = memoLexeme(cues[person]);
        const subject = personEntry.representation ? `The person representing “${label}”` : personEntry.proper ? label : `The ${label}`;
        const plural = memoLexeme(cues[person]).number === 'plural';
        return `${subject} ${turn ? (plural ? 'turn' : 'turns') : (plural ? 'face' : 'faces')} ${direction} you for this link (${direction === 'toward' ? 'object → person' : 'person → object'}).`;
    });
}

// Short chains can assign roles to images instead of treating every gap independently.
// These are imagined scenes, never assertions about real people or their beliefs.
function memoRoleScene(cues, average) {
    if (cues.length < 2) return null;
    const lexemes = cues.map(memoLexeme), links = [], explanations = [];
    const orientations = memoFacingPlan(cues);
    const name = i => cues[i].original || cues[i].text;
    const introduced = new Set();
    const noun = i => {
        if (lexemes[i].namedPerson && !introduced.has(i)) {
            introduced.add(i);
            return `a person named ${name(i)}`;
        }
        return lexemes[i].proper ? name(i) : `the ${name(i)}`;
    };
    const has = (entry, tag) => entry.affordances?.tags.includes(tag);
    let roleCount = 0, wearer = -1, thinker = -1, climber = -1;
    for (let i = 1; i < cues.length; i++) {
        const a = lexemes[i - 1], b = lexemes[i];
        if (a.representation || b.representation) return null; // Keep explicit stand-in explanations.
        let connector, explanation;
        if (a.category === 'person' && has(b, 'climbable')) {
            connector = a.number === 'plural' ? ' climb the ' : ' climbs the ';
            explanation = `${noun(i - 1)} ${a.number === 'plural' ? 'climb' : 'climbs'} ${noun(i)} rung by rung.`;
            climber = i - 1;
        } else if (has(a, 'climbable') && climber >= 0 && climber === i - 2 && has(b, 'physical')) {
            connector = ' to reach the ';
            explanation = `From the top of ${noun(i - 1)}, ${noun(climber)} ${lexemes[climber].number === 'plural' ? 'reach' : 'reaches'} ${noun(i)}, placed on a high shelf.`;
        } else if (has(a, 'storage') && has(b, 'small-storable')) {
            connector = ' containing ';
            explanation = `${noun(i - 1)} ${a.number === 'plural' ? 'open' : 'opens'} to reveal ${noun(i)} tucked inside. Look at the container first, then its contents.`;
        } else if (a.properties.includes('wearable') && ['person', 'animal', 'object'].includes(b.category)) {
            connector = '-wearing ';
            explanation = `${noun(i - 1)} wraps itself around ${noun(i)}. Let ${noun(i)} act like a character in this scene.`;
            wearer = i;
        } else if (b.operator && (wearer === i - 1 || ['person', 'animal'].includes(a.category))) {
            connector = b.operator === 'rider' ? (a.number === 'plural' ? ' ride a ' : ' rides a ') : (a.number === 'plural' ? ' take a ' : ' takes a ');
            explanation = `${noun(i - 1)} ${b.operator === 'rider' ? (a.number === 'plural' ? 'ride' : 'rides') : (a.number === 'plural' ? 'get into' : 'gets into')} ${noun(i)}.`;
        } else if (a.operator && b.category === 'person') {
            connector = ` with ${a.operator} `;
            explanation = `${noun(i - 1)} ${a.number === 'plural' ? 'have' : 'has'} ${noun(i)} as its ${a.operator}.`;
        } else if (a.category === 'person' && lexemes[i + 1]?.word === 'head') {
            connector = ' thinking about ';
            explanation = `In this imaginary scene, ${noun(i - 1)} ${a.number === 'plural' ? 'are' : 'is'} thinking about ${noun(i)}.`;
            thinker = i - 1;
        } else if (b.word === 'head' && thinker >= 0 && thinker === i - 2) {
            connector = ' in their ';
            explanation = `Visualize that thought inside ${noun(thinker)}’s ${name(i)}.`;
        } else {
            // Only use a role chain when every transition has a supported role.
            // Unrelated chains still use the ordinary category/property planner.
            return null;
        }
        roleCount++;
        links.push(connector);
        explanations.push(explanation.charAt(0).toUpperCase() + explanation.slice(1) + (orientations[i - 1] && !(b.word === 'head' && thinker >= 0) ? ` ${orientations[i - 1]}` : ''));
    }
    if (!roleCount) return null;
    const cost = links.reduce((n, link) => n + (link.match(/[a-z]+/gi) || []).length, 0);
    const budget = Math.round(Math.max(0, Math.min(2, average)) * cues.length);
    const parts = [];
    cues.forEach((cue, i) => {
        // With a tight budget, retain the image chain and its rich explanation,
        // without cutting a role phrase into ungrammatical pieces.
        if (i) parts.push({text: cost <= budget ? links[i - 1] : ' → ', kind: 'filler'});
        parts.push({text: cue.text, kind: 'cue'});
    });
    parts.push({text: '.', kind: 'filler'});
    return {parts, meaning: explanations.join(' ')};
}

function memoStoryPlan(cues, average = 1) {
    const parts = [], sentences = [], described = new Set();
    let group = [];
    function phrase(cue) {
        const e = memoLexeme(cue), word = cue.original || cue.text;
        if (e.representation) {
            const first = !described.has(e.word);
            const image = first ? e.representation.phrase : e.representation.definite;
            described.add(e.word);
            return `${image} representing “${word}”${first && e.representation.explanation ? ` (${e.representation.explanation})` : ''}`;
        }
        if (e.category === 'unknown') return word;
        if (e.namedPerson && !described.has(e.word)) {
            described.add(e.word);
            return `a person named ${word}`;
        }
        let text = e.proper || e.number === 'mass' ? word : `the ${word}`;
        const detail = e.description || e.affordances?.detail;
        if (detail && !described.has(e.word)) {
            text += ` (${detail})`;
            described.add(e.word);
        }
        return text;
    }
    const verbBases = {pushes: 'push', lifts: 'lift', pulls: 'pull', spins: 'spin', sends: 'send', alerts: 'alert', pets: 'pet', cushions: 'cushion', appears: 'appear', floats: 'float', reveals: 'reveal', startles: 'startle', tempts: 'tempt', lies: 'lie', surrounds: 'surround', gathers: 'gather', watches: 'watch', looks: 'look', brushes: 'brush', coats: 'coat', spreads: 'spread', contains: 'contain', closes: 'close', bumps: 'bump', passes: 'pass', slides: 'slide', is: 'are', carries: 'carry', touches: 'touch', sniffs: 'sniff', nudges: 'nudge', noses: 'nose', approaches: 'approach', greets: 'greet', follows: 'follow', waves: 'wave', stands: 'stand', types: 'type', plays: 'play', leans: 'lean', picks: 'pick', reaches: 'reach', moves: 'move', peers: 'peer', rests: 'rest', opens: 'open', clicks: 'click', erupts: 'erupt'};
    function agree(verb, cue) {
        if (memoLexeme(cue).number !== 'plural') return verb;
        return verb.replace(/\b\w+\b/g, first => verbBases[first] || first);
    }
    function article(cue) {
        const e = memoLexeme(cue);
        // Abstract stand-ins keep their original cue labels in the short memo.
        if (e.proper || e.representation || e.category === 'unknown' || e.number !== 'singular') return '';
        return 'the';
    }
    function flush() {
        if (!group.length) return;
        if (parts.length) parts.push({text: ' ', kind: 'filler'});
        const scene = memoRoleScene(group, average);
        if (scene) {
            parts.push(...scene.parts);
            sentences.push(scene.meaning);
            group = [];
            return;
        }
        const actions = memoActionPlan(group);
        const orientations = memoFacingPlan(group);
        const gaps = group.length - 1;
        let budget = Math.min(4 * gaps + 1, Math.round(Math.max(0, Math.min(2, average)) * group.length));
        const leading = average >= 1.5 && gaps && article(group[0]);
        if (leading && budget) {
            parts.push({text: 'The ', kind: 'filler'});
            budget--;
        }
        group.forEach((cue, index) => {
            if (index) {
                const previous = group[index - 1];
                const count = Math.floor(index * budget / gaps) - Math.floor((index - 1) * budget / gaps);
                const action = actions[index - 1];
                const link = action ? {verb: action.verb, compact: ` ${action.verb} `} : memoConnection(previous, cue, index - 1, 1);
                const verb = agree(link.verb, previous);
                const relative = memoLexeme(previous).category === 'person' ? 'who' : 'which';
                const determiner = article(cue);
                let connector = count && (!action || action.verb.split(' ').length <= count) ? link.compact : ' → ';
                if (count) {
                    // Spend the budget on complete grammatical units before adverbs.
                    const variants = [{text: verb, cost: verb.split(' ').length}];
                    if (determiner) variants.push({text: `${verb} ${determiner}`, cost: verb.split(' ').length + 1});
                    if (index > 1) {
                        variants.push({text: `, ${relative} ${verb}`, cost: verb.split(' ').length + 1});
                        if (determiner) variants.push({text: `, ${relative} ${verb} ${determiner}`, cost: verb.split(' ').length + 2});
                    }
                    const selected = variants.filter(v => v.cost <= count).at(-1);
                    if (selected) connector = selected.text.startsWith(',') ? `${selected.text} ` : ` ${selected.text} `;
                }
                parts.push({text: connector, kind: 'filler'});
                // Explanations have no filler cap: make the same connection into a full clause.
                let sentence = action ? action.explain(phrase(previous), phrase(cue)).replace(/\.$/, '')
                    : `${phrase(previous)} ${verb} ${phrase(cue)}`;
                if (orientations[index - 1]) sentence += `. ${orientations[index - 1].replace(/\.$/, '')}`;
                if (index === 1) sentences.push(sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.');
                else if (index % 2 === 0 && !/[.!?] /.test(sentence) && !/[.!?] /.test(sentences.at(-1))) {
                    sentences[sentences.length - 1] = sentences.at(-1).replace(/\.$/, '') + `, and then ${sentence}.`;
                } else sentences.push(`Then, ${sentence}.`);
            }
            parts.push({text: cue.text, kind: 'cue'});
        });
        if (group.length === 1) sentences.push(`Keep ${phrase(group[0])} as a separate image.`);
        parts.push({text: '.', kind: 'filler'});
        group = [];
    }
    cues.forEach(cue => {
        if (cue.image) group.push(cue);
        else {
            flush();
            const marker = cue.text.startsWith('[') ? cue.text : `[${cue.text}]`;
            if (parts.length) parts.push({text: ' ', kind: 'filler'});
            parts.push({text: marker, kind: 'annotation'});
            sentences.push(marker);
        }
    });
    flush();
    return {parts, meaning: sentences.join(' ')};
}
function memoStoryParts(cues, average = 1) { return memoStoryPlan(cues, average).parts; }
function memoExampleStory(cues, average = 1) { return memoStoryParts(cues, average).map(part => part.text).join(''); }
