// Authored action frames: match both participants, rank specificity, carry effects forward.
// No network, model, user profiling, or changes to which CoLPI words are eligible.
function memoActionProfile(cue) {
    const word = (cue.original || cue.text).trim().toLowerCase();
    const entry = MEMO_LEXICON[word] || {};
    return {word, ...entry, tags: new Set(entry.affordances?.tags || [])};
}

function memoActionPlan(cues) {
    const profiles = cues.map(memoActionProfile);
    const states = cues.map(() => new Set());
    const uses = new Map();
    // Direction contract: left cue initiates; right cue receives the action.
    // Reversing a pair selects a different action, never a passive paraphrase.
    const frames = [
        {id: 'person-climb', family: 'climb', score: 180, a: ['person'], b: ['climbable'],
            verb: ['climbs', 'climb'], effects: [],
            sentence: (a, b) => `${a} climbs ${b}, gripping each rung and stepping upward.`},
        {id: 'ladder-rest', family: 'support', score: 170, a: ['climbable'], b: ['heavy'],
            verb: ['leans against', 'lean against'], effects: [],
            sentence: (a, b) => `${a} leans against ${b}, with its upper end resting firmly on the heavy surface.`},
        {id: 'storage-contents', family: 'contain', score: 190, a: ['storage'], b: ['small-storable'],
            verb: ['contains', 'contain'], effects: [],
            sentence: (a, b) => `${a} opens to reveal ${b} tucked inside. Look at the container first, then its contents.`},
        {id: 'contents-storage', family: 'enter', score: 190, a: ['small-storable'], b: ['storage'],
            verb: ['enters', 'enter'], effects: [],
            sentence: (a, b) => `${a} slides into ${b}; the door or lid closes behind it. Follow the object into the container.`},
        {id: 'headwear-person', family: 'dress', score: 190, a: ['headwear'], b: ['person'],
            verb: ['adorns', 'adorn'], effects: [],
            sentence: (a, b) => `${a} settles onto the head of ${b}, who wears it like a wig or hat.`},
        {id: 'person-headwear', family: 'dress', score: 190, a: ['person'], b: ['headwear'],
            verb: ['wears', 'wear'], effects: [],
            sentence: (a, b) => `${a} reaches up and puts on ${b}.`},
        {id: 'person-element', family: 'study', score: 225, a: ['person'], b: ['element-tile'],
            verb: ['studies', 'study'], effects: [],
            sentence: (a, b) => `${a} points to ${b}, tracing its chemical symbol and atomic number with a finger.`},
        {id: 'tile-label', family: 'label', score: 220, a: ['element-tile'], b: ['physical'],
            verb: ['labels', 'label'], effects: [],
            sentence: (a, b) => `${a} becomes a stamp and prints its element symbol and atomic number onto ${b}.`},
        {id: 'roll-body', family: 'roll', score: 145, a: ['rollable'], b: ['body-surface'],
            verb: ['rolls into', 'roll into'], effects: [],
            sentence: (a, b) => `${a} rolls into the exposed abdomen of ${b}, making the muscles tense at the unexpected touch.`},
        {id: 'strong-lift', family: 'lift', score: 145, a: ['strong'], b: ['heavy'],
            verb: ['lifts', 'lift'], effects: [],
            sentence: (a, b) => `${a} braces their torso and lifts ${b} with both hands, straining under its weight.`},
        {id: 'back-display', family: 'display', score: 145, a: ['back-surface'], b: ['signage'],
            verb: ['displays', 'display'], effects: [],
            sentence: (a, b) => `${a} turns around to reveal ${b} pasted across its back panel. Follow the unit first, then the poster on its back.`},
        {id: 'sign-spin', family: 'spin', score: 135, a: ['signage'], b: ['rollable'],
            verb: ['spins', 'spin'], effects: ['moving'],
            sentence: (a, b) => `${a} curls into a little rotating display stand and spins ${b} as the product on show.`},
        {id: 'roll-hair', family: 'tangle', score: 175, a: ['rollable'], b: ['hair'],
            verb: ['snags', 'snag'], effects: ['tangled'],
            sentence: (a, b) => `${a} rolls into ${b} and gets caught among the strands. Picture the object lodged in the hair on someone’s head.`},
        {id: 'spring-flight', family: 'launch', score: 205, a: ['springy'], b: ['flying'],
            verb: ['launches', 'launch'], effects: ['moving'],
            sentence: (a, b) => `${a} compresses like a spring, then rebounds and launches ${b} into an upward flight.`},
        {id: 'send-message', family: 'message', score: 140, a: ['person'], b: ['message'],
            verb: ['sends', 'send'], effects: [],
            sentence: (a, b) => `${a} presses send, launching ${b} from the screen like a paper airplane.`},
        {id: 'message-alert', family: 'message', score: 140, a: ['message'], b: ['person'],
            verb: ['alerts', 'alert'], effects: [],
            sentence: (a, b) => `${a} flashes and rings, waking ${b} with its notification.`},
        {id: 'person-animal', family: 'greet', score: 130, a: ['person'], b: ['animal'],
            verb: ['pets', 'pet'], effects: [],
            sentence: (a, b) => `${a} reaches out first and gently pets ${b}.`},
        {id: 'animal-person', family: 'greet', score: 130, a: ['animal'], b: ['person'],
            verb: ['nudges', 'nudge'], effects: [],
            sentence: (a, b) => `${a} moves first and nudges ${b} to get attention.`},
        {id: 'person-food', family: 'taste', score: 70, a: ['person'], b: ['edible'],
            verb: ['tastes', 'taste'], effects: [],
            sentence: (a, b) => `${a} takes an exaggerated bite of ${b}, pausing to savor its texture.`},
        {id: 'food-person', family: 'taste', score: 65, a: ['edible'], b: ['person'],
            verb: ['tempts', 'tempt'], effects: [],
            sentence: (a, b) => `${a} catches the attention of ${b}, who takes a small bite and chews slowly.`},
        {id: 'juggle', family: 'handle', score: 60, a: ['person'], b: ['portable'],
            verb: ['juggles', 'juggle'], effects: ['moving'],
            sentence: (a, b) => `${a} tosses ${b} up and catches it repeatedly, making each throw higher.`},
        {id: 'inspect', family: 'examine', score: 55, a: ['person'], b: ['portable'],
            verb: ['examines', 'examine'], effects: [],
            sentence: (a, b) => `${a} lifts ${b} close to their face and turns it slowly to examine every side.`},
        {id: 'catch', family: 'catch', score: 60, a: ['portable'], b: ['person'],
            verb: ['lands with', 'land with'], effects: [],
            sentence: (a, b) => `${a} sails through the air toward ${b}, who catches it with both hands.`},
        {id: 'container-catch', family: 'catch', score: 65, a: ['container'], b: ['portable'],
            verb: ['catches', 'catch'], effects: [],
            sentence: (a, b) => `${a} tips open to catch ${b}, which lands inside with a small thump.`},
        {id: 'soft-squeeze', family: 'squeeze', score: 90, a: ['soft'], b: ['person'],
            verb: ['cushions', 'cushion'], effects: [],
            sentence: (a, b) => `${a} springs forward and cushions ${b}, softening their landing.`},
        {id: 'metal-clang', family: 'sound', score: 85, a: ['metal'], b: ['metal'],
            verb: ['strikes', 'strike'], effects: ['sounding'],
            sentence: (a, b) => `${a} taps against ${b}, making a sharp metallic clang.`},
        {id: 'fabric-person', family: 'wrap', score: 75, a: ['fabric'], b: ['person'],
            verb: ['wraps around', 'wrap around'], effects: [],
            sentence: (a, b) => `${a} swirls around ${b} like a loose cape, then settles over their shoulders.`},
        {id: 'sticky-keys', family: 'spill', score: 125, a: ['liquid', 'sticky'], b: ['keyed'],
            verb: ['spills across', 'spill across'], effects: ['wet', 'sticky', 'jammed'],
            sentence: (a, b) => `${a} spills between the keys of ${b}, leaving them sticky and difficult to press.`},
        {id: 'wet-keys', family: 'spill', score: 110, a: ['liquid'], b: ['keyed'],
            verb: ['splashes across', 'splash across'], effects: ['wet'],
            sentence: (a, b) => `${a} splashes across ${b}; droplets collect between the keys.`},
        {id: 'visor-splash', family: 'splash', score: 120, a: ['liquid'], b: ['visored'],
            verb: ['splashes', 'splash'], effects: ['wet'],
            sentence: (a, b) => `${a} splashes across the visor of ${b}, leaving a glistening trail in front of their eyes.`},
        {id: 'fill-vessel', family: 'pour', score: 115, a: ['liquid'], b: ['vessel'],
            verb: ['fills', 'fill'], effects: ['wet', 'filled'],
            sentence: (a, b) => `${a} pours into ${b}, rising right up to the rim.`},
        {id: 'soak-fabric', family: 'soak', score: 115, a: ['liquid'], b: ['absorbent'],
            verb: ['soaks', 'soak'], effects: ['wet'],
            sentence: (a, b) => `${a} soaks into ${b}, making it heavy and dripping wet.`},
        {id: 'freeze-liquid', family: 'freeze', score: 120, a: ['liquid'], b: ['cold'],
            verb: ['freezes around', 'freeze around'], effects: ['coated'],
            sentence: (a, b) => `${a} freezes into a thin shell around ${b}; imagine the liquid turning solid as it touches the cold surface.`},
        {id: 'drink', family: 'drink', score: 100, a: ['drinkable'], b: ['person'],
            verb: ['refreshes', 'refresh'], effects: [],
            sentence: (a, b) => `${a} flows toward ${b}, who catches the stream in their mouth and takes a big gulp.`},
        {id: 'sip', family: 'drink', score: 105, a: ['person'], b: ['drinkable'],
            verb: ['sips', 'sip'], effects: [],
            sentence: (a, b) => `${a} takes a sip of ${b}, then makes an exaggerated satisfied expression.`},
        {id: 'liquid-splash', family: 'splash', score: 45, a: ['liquid'], b: ['physical'],
            verb: ['splashes', 'splash'], effects: ['wet'],
            sentence: (a, b) => `${a} splashes onto ${b}, scattering droplets over its surface.`},
        {id: 'filled-pour', family: 'pour', score: 200, state: ['filled'], b: ['physical'],
            verb: ['pours over', 'pour over'], effects: ['wet'],
            sentence: (a, b) => `${a}, now full from the previous image, tips and pours its contents over ${b}.`},
        {id: 'drip-keys', family: 'drip', score: 180, state: ['wet'], b: ['keyed'],
            verb: ['drips onto', 'drip onto'], effects: ['wet'],
            sentence: (a, b) => `${a}, still wet from the previous image, drips onto ${b}; droplets land between the keys.`},
        {id: 'drip-vessel', family: 'drip', score: 170, state: ['wet'], b: ['vessel'],
            verb: ['drips into', 'drip into'], effects: ['wet'],
            sentence: (a, b) => `${a}, still wet, drips into ${b}; listen to each drop landing inside.`},
        {id: 'drip', family: 'drip', score: 155, state: ['wet'], b: ['physical'],
            verb: ['drips onto', 'drip onto'], effects: ['wet'],
            sentence: (a, b) => `${a}, still wet from the previous image, drips onto ${b}, passing the wetness along.`},
        {id: 'sticky-transfer', family: 'stick', score: 165, state: ['sticky'], b: ['portable'],
            verb: ['sticks to', 'stick to'], effects: ['sticky'],
            sentence: (a, b) => `${a}, now sticky, clings to ${b}; imagine trying to pull the two apart.`},
        {id: 'magnet-metal', family: 'attract', score: 110, a: ['magnetic'], b: ['metal'],
            verb: ['attracts', 'attract'], effects: ['moving'],
            sentence: (a, b) => `${a} pulls ${b} toward it with a sudden metallic snap.`},
        {id: 'metal-magnet', family: 'attract', score: 110, a: ['metal'], b: ['magnetic'],
            verb: ['snaps toward', 'snap toward'], effects: [],
            sentence: (a, b) => `${a} slides across the surface and snaps onto ${b}.`},
        {id: 'cog-fabric', family: 'snag', score: 110, a: ['mechanical'], b: ['fabric'],
            verb: ['snags', 'snag'], effects: ['tangled'],
            sentence: (a, b) => `${a} turns and catches ${b}, winding the fabric around its moving parts.`},
        {id: 'tangled-wrap', family: 'wrap', score: 160, state: ['tangled'], b: ['physical'],
            verb: ['wraps around', 'wrap around'], effects: ['tangled'],
            sentence: (a, b) => `${a}, already tangled, winds around ${b} in a loose spiral.`},
        {id: 'roll-knock', family: 'roll', score: 100, a: ['rollable'], b: ['knockable'],
            verb: ['topples', 'topple'], effects: ['moving'],
            sentence: (a, b) => `${a} rolls into ${b}, tipping it over with a wobble.`},
        {id: 'momentum', family: 'bump', score: 150, state: ['moving'], b: ['knockable'],
            verb: ['topples', 'topple'], effects: ['moving'],
            sentence: (a, b) => `${a} keeps moving and knocks over ${b}, continuing the chain reaction.`},
        {id: 'round-roll', family: 'roll', score: 65, a: ['rollable'], b: ['physical'],
            verb: ['rolls toward', 'roll toward'], effects: [],
            sentence: (a, b) => `${a} rolls toward ${b}, tracing a looping path before reaching it.`},
        {id: 'play-music', family: 'play', score: 85, a: ['person'], b: ['musical'],
            verb: ['plays', 'play'], effects: ['sounding'],
            sentence: (a, b) => `${a} plays ${b}, stretching a single note into an impossibly long sound.`},
        {id: 'sound-startle', family: 'sound', score: 80, a: ['noisy'], b: ['animate'],
            verb: ['startles', 'startle'], effects: [],
            sentence: (a, b) => `${a} makes a sudden loud sound, and ${b} jumps in surprise.`},
        {id: 'continuing-note', family: 'sound', score: 160, state: ['sounding'], b: ['animate'],
            verb: ['startles', 'startle'], effects: [],
            sentence: (a, b) => `${a} keeps sounding from the previous action, making ${b} jump in surprise.`},
        {id: 'scent', family: 'scent', score: 75, a: ['aromatic'], b: ['animate'],
            verb: ['tempts', 'tempt'], effects: [],
            sentence: (a, b) => `${a} releases a strong scent that draws ${b} closer for a sniff.`},
        {id: 'water-plant', family: 'pour', score: 100, a: ['liquid'], b: ['plant'],
            verb: ['drenches', 'drench'], effects: ['wet'],
            sentence: (a, b) => `${a} runs over ${b}; droplets gather on the plant and fall from its edges.`},
    ];
    const has = (tags, required = []) => required.every(tag => tags.has(tag));
    return profiles.slice(1).map((b, i) => {
        const a = profiles[i];
        if (!a.tags.size || !b.tags.size) return null;
        const candidates = frames.filter(frame => has(a.tags, frame.a) && has(b.tags, frame.b)
            && has(states[i], frame.state)).map(frame => {
                let score = frame.score - 18 * (uses.get(frame.family) || 0);
                // Prefer effects that can participate in the very next connection.
                if (frame.effects.includes('wet') && profiles[i + 2]?.tags.has('physical')) score += 8;
                if (frame.effects.includes('moving') && profiles[i + 2]?.tags.has('knockable')) score += 8;
                return {frame, score};
            }).sort((x, y) => y.score - x.score || x.frame.id.localeCompare(y.frame.id));
        if (!candidates.length) return null;
        const {frame, score} = candidates[0];
        states[i + 1] = new Set(frame.effects);
        if (frame.effects.includes('wet') && (a.tags.has('sticky') || states[i].has('sticky'))) {
            states[i + 1].add('sticky');
            if (b.tags.has('keyed')) states[i + 1].add('jammed');
        }
        uses.set(frame.family, (uses.get(frame.family) || 0) + 1);
        const number = a.representation?.number || a.number;
        return {id: frame.id, score, verb: frame.verb[number === 'plural' ? 1 : 0],
            effects: [...states[i + 1]], explain: (left, right) => {
                let text = frame.sentence(left, right);
                const bases = {points: 'point', becomes: 'become', braces: 'brace', curls: 'curl', compresses: 'compress', rebounds: 'rebound', launches: 'launch', presses: 'press', flashes: 'flash', reaches: 'reach', moves: 'move', springs: 'spring', is: 'are', has: 'have', catches: 'catch', takes: 'take', chews: 'chew',
                    tosses: 'toss', makes: 'make', sails: 'sail', tips: 'tip', taps: 'tap',
                    lifts: 'lift', turns: 'turn', spills: 'spill', splashes: 'splash', pours: 'pour',
                    soaks: 'soak', freezes: 'freeze', flows: 'flow', drips: 'drip', clings: 'cling',
                    pulls: 'pull', slides: 'slide', snaps: 'snap', winds: 'wind', rolls: 'roll',
                    keeps: 'keep', knocks: 'knock', plays: 'play', releases: 'release', runs: 'run',
                    swirls: 'swirl', settles: 'settle', squeezes: 'squeeze', jumps: 'jump'};
                const base = word => bases[word] || word;
                if (number === 'plural') {
                    let rest = text.slice(left.length);
                    // The source may have a state appositive before its verb.
                    rest = rest.replace(/^(, [^,]+,)? (\w+)/, (_, appositive = '', verb) => `${appositive} ${base(verb)}`);
                    rest = rest.replace(/ and (catches|turns|snaps|knocks|settles)\b/, (_, verb) => ` and ${base(verb)}`);
                    text = left + rest;
                }
                if ((b.representation?.number || b.number) === 'plural') {
                    text = text.replace(/, who (\w+)/, (_, verb) => `, who ${base(verb)}`)
                        .replace(/ and chews\b/, ' and chew');
                }
                return text;
            }};
    });
}
