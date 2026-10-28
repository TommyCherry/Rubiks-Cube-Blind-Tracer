# Rubik's Cube Blindfolded Memo Tracer
### DEVELOPER'S NOTE -- ideas for future development:
#### Being able to search other people's WCA IDs and their history
#### Weakswap implementation for MBLD tracing
#### Interface for users to query the WCA DB for scrambles with certain properties without coding (filter selection)

A web-based tool for generating blindfolded (BLD) memo traces for 3×3 Rubik's Cube scrambles.

The application takes a scramble, simulates the resulting cube state, and traces the edge and corner permutation cycles needed for blindfolded solving. It supports custom buffers, custom letter schemes, cycle-break detection, orientation tracking, presence of floating opportunities, and parity-based pseudoswapping.

## Features

### Scramble Input

- Option 1: Enter any valid 3×3 scramble manually.
- Option 2: Generate random 3×3 scrambles using the csTimer scramble generator.
- Supports standard face turns, wide turns, slice moves, and cube rotations (`x`, `y`, `z`, including prime and `2` modifiers), and gracefully handles invalid inputs. Memo and the cube map use the starting orientation: `R y R` gives the same result as `R B`, and `U x` matches `U`. Rotations affect subsequent moves without relabeling the final state. Rotations alone leave a solved cube solved. Wide and slice turns use the same starting-frame convention.

### Bulk Scramble Analysis

Open **Bulk scramble analysis**, paste one scramble per line, and select **Trace scramble set**. Batches support up to 1,000 scrambles and use the same primary buffers, edge and corner floating priorities, pseudoswap settings, and custom letters as individual tracing. Blank lines are ignored; invalid lines are reported individually and excluded from statistics.

Bulk batches are saved automatically in PostgreSQL when `DATABASE_URL` is configured, or locally in SQLite (`instance/bulk.sqlite3`; override with `BULK_DATABASE`). Use **Exact estimated alg count** to type or select a count, then **Search / sort** to filter or order results low-to-high or high-to-low. Reset restores all lines. Queries reuse saved traces and their original settings; summary statistics always cover the full batch. Bookmark the results URL to return to a batch. Anyone with that URL can view it. The local SQLite fallback uses Python’s standard library. Vercel requires PostgreSQL; see the [Phase 1 setup and migration guide](docs/postgres-phase1.md).

When signed in with a WCA ID, matching bulk scrambles show expandable competition details: competition, round ID, solve number, and scramble group. Matches use your 3BLD history in the local WCA database, ignoring whitespace differences. All matching groups are shown; the WCA results data does not identify your personal group assignment. Details follow the currently logged-in profile, including when viewing saved batches.

Each scramble shows edge and corner memo, target counts, estimated algorithm count, permutation parity, and the number of edge and corner buffers actually used. The summary shows average targets (total and by piece type), average estimated algorithms, parity percentage, average buffers, and the minimum/maximum total target count.

Algorithm counts are estimates: `ceil(edge targets / 2) + ceil(corner targets / 2) + ceil(flipped edges / 2)`. In-place edge flips appear separately as `[Flips: SW NT]` using your letter scheme and are excluded from target counts. In-place corner twists appear as `[CW Twists: BQ] [CCW Twists: AR]`, with one custom letter per corner. They are excluded from target counts and add `min(cw, ccw) + abs(cw - ccw)` algorithms. Selected primary buffers are excluded from flip and twist lists and counts. Counts do not add separate parity algorithms. Parity is measured before pseudoswap. A buffer counts only if it supplies targets; edge and corner buffers count separately. Enabled edge and corner floating switches are included in buffer counts.

### Edge and Corner Tracing

The program simulates the scrambled cube and automatically determines the blindfolded solving trace for:

- Edges
- Corners
- Multiple permutation cycles
- Cycle breaks
- Flipped edges
- Twisted corners
- Parity

Edge orientation and corner orientation are tracked throughout the trace so that memo corresponds to the correct sticker rather than only the cubie.

### Custom Buffers

Beginner and expert modes accept any of the 24 edge or 24 corner buffer stickers, including `LUB` and `BUL` on the `UBL` piece. The first letter identifies the sticker face. Expert floating priorities stay piece-based, with a separate sticker choice on each piece. Traces, floating memo labels, buffer usage, and edge example cases use the selected stickers. Old Pochmann examples support both stickers of the UR edge and all three stickers of the UBL corner. Existing numeric buffer settings and saved presets keep their original sticker defaults.

Choose your preferred BLD buffer independently for:

- Edges
- Corners

The tracing algorithm dynamically adjusts its cycles and memo to the selected buffer.

### Custom Letter Scheme

The application includes a Speffz letter scheme by default.

Users can customize the letter assigned to each sticker to match their own BLD letter scheme. Custom schemes are stored locally in the browser so they remain available between sessions.

### Cycle Break Detection

When the buffer cycle ends while unsolved pieces remain, the tracer automatically identifies additional cycles and inserts the necessary cycle-break targets.

Cycle breaks are also displayed separately in the Solve Info section.

### Floating Detection

The tracer detects opportunities where the current buffer becomes solved during memo while additional unsolved cycles remain.

These positions can be used by advanced BLD solvers to switch buffers ("float") instead of performing a conventional cycle break.

### Pseudoswapping

Optional parity-based edge pseudoswapping is supported.

When a scramble has permutation parity, the user can select two edges to treat as swapped in the target state. The edge tracer then generates memo relative to that pseudo-solved state rather than the normally solved cube.

Pseudoswapping:

- Activates only on parity scrambles.
- Allows any two edge positions to be selected.
- Changes the actual target permutation used by the tracing algorithm.
- Leaves corner tracing unchanged.
- Produces a trace that solves to the selected pseudo state.

This is implemented at the permutation-tracing level rather than by modifying the finished memo afterward.

### Solve Information

Additional information about each scramble is displayed alongside the generated memo, including:

- Number of edge targets
- Number of corner targets
- Parity
- Edge cycle breaks
- Corner cycle breaks
- Floating opportunities
- Flipped edges
- Twisted corners

### Cube Visualization

The scrambled cube state is displayed as a 2D cube net.

The visualization supports:

- Custom color schemes
- Cube orientation changes
- X, Y, and Z rotations

## How It Works

The cube is represented using separate permutation and orientation arrays:

```python
edge_perm
edge_ori

corner_perm
corner_ori
```

For example:

```python
edge_perm[position] = piece
```

describes which edge piece currently occupies each edge position.

Scrambles modify these arrays using cubie-level move definitions.

The BLD tracer then follows permutation cycles beginning from the selected buffer. Orientation information is propagated through each cycle to determine the actual sticker target.

For pseudoswapping, the desired solved edge permutation can be changed from:

```python
[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
```

to a permutation containing the selected transposition. The same tracing algorithm can therefore trace either a conventionally solved state or a pseudo-solved state.

## Technology

- Python
- Flask
- HTML
- CSS
- JavaScript
- csTimer scramble generator

## Installation

Clone the repository:

```bash
git clone https://github.com/TommyCherry/Rubiks-Cube-Blind-Tracer.git
cd Rubiks-Cube-Blind-Tracer
```

Install the JavaScript dependencies:

```bash
npm install
```

Install the Python dependencies:

```bash
pip install -r requirements.txt
```

Run the Flask application:

```bash
python app.py
```

Then open the local address displayed by Flask in your browser.

### Story playground

Open **Story playground** from the tracer header, or visit
`/memo-story-playground`. Enter comma-separated or one-per-line images; spaces
within an image stay together (for example, `apple juice`). Bracketed tokens
such as `[Q]` or `[Parity]` remain separate cues and stop scene continuity.
The tool accepts up to 60 entries of 120 characters each, with a 7,200-character
input limit. Generate the story, adjust the 0–2 filler slider, try the built-in
example, or clear the page. Slider changes apply to the last generated words;
submit again after editing the input.

The regular “Generate story” button uses the same local dictionary, action frames
and explanations as scramble results. It needs no scramble, account, database,
CoLPI lookup, or model download. Typed words are not saved or submitted to the
server, and output is rendered as plain text. Custom words are user-authored,
not censored CoLPI suggestions.

The optional **Generate with browser AI** button uses
[WebLLM](https://webllm.mlc.ai/docs/user/get_started.html), pinned to `0.2.85`,
and Qwen2.5 1.5B Instruct. It dynamically starts a module worker only when clicked;
the worker loads the runtime from esm.run/jsDelivr and model assets from WebLLM's
configured model hosts (Hugging Face and its compiled-library host). No API key,
server-side AI route, paid inference, or extra Python/npm dependency is required.
The first download is roughly 1 GB; browser caches can reuse the assets later.
WebGPU and HTTPS/localhost are required. The supported model configurations
estimate about 1.6 GB GPU memory for f16 and 1.9 GB for f32; actual availability
and performance vary. The client chooses f16 when supported, otherwise f32.
See the [pinned model configuration](https://github.com/mlc-ai/web-llm/blob/v0.2.85/src/config.ts).

AI accepts up to 12 images per request and generates separate scenes across
bracketed boundaries. It uses fresh messages, not previous user conversations.
The model returns structured JSON with an opening, exactly one connecting phrase
between adjacent images, an ending, and an explanation. The app inserts the
original images in order as separate colored spans; the model no longer has to
emit specially formatted placeholders. Schema limits keep the connective text
short. The parser checks types, sizes, and the number of links before display.
Already-loaded older workers remain readable during a deployment transition.
This validates structure, not factual accuracy or semantic quality; content/style
instructions are not a guaranteed moderation filter. All output stays plain text.
The local filler slider does not constrain the AI story.

Model assets use WebLLM's supported IndexedDB cache backend instead of the
browser Cache API (`Cache.add` failed in our Chrome test while direct fetch
worked). A worker-local downloader allows at most two simultaneous asset requests,
checks the complete response body, and retries transient failures twice. Retries
request a fresh host redirect and bypass the HTTP cache. Existing completed
IndexedDB assets remain available between attempts. The helper is restricted to
MLC model assets on Hugging Face and the official compiled-library host; it does
not change ordinary site requests or proxy model files through Flask/Vercel.

Loading progress and errors appear on the page. **Stop & free GPU memory**
terminates the worker, including downloads or generation, and prevents stale
responses from overwriting newer results. Cached files may remain in browser
storage. Loading has a ten-minute timeout; each generation has a two-minute
limit. Unsupported GPUs, download failures, memory problems and invalid outputs
leave the regular local generator available. Response-limit and GPU failures have distinct messages; generation failures no
longer tell users to reduce an already-valid word count. Detailed worker errors
go to the browser console for diagnosis. There is no paid fallback. This initial AI
integration is limited to the playground, not automatic bulk generation.

### Example memo words

Generated edge and corner memos load English letter-pair examples from
[CoLPI](https://bestsiteever.net/colpi/) underneath the memo. The lookup runs
separately from tracing and does not need a database or CoLPI login. Repeated
pairs retain their positions; single letters and bracketed technique annotations
are left unchanged. Ordinary A–Z (and CoLPI's `ʧ`) pairs are supported.

Defaults prefer familiar everyday vocabulary using the authored tiers in
`memo_word_familiarity.py`: for example, QUAD outranks QUANDALE DINGLE and PARK
outranks PIKACHU when both occur in CoLPI's censored grid suggestions. Parenthetical
spelling hints, simple plurals, and combinations of known common words are
recognized. These are conservative product preferences, not population-frequency
measurements; unknown or equally ranked candidates keep CoLPI's original order.
Ranking considers only returned, censored, privately allowed suggestions and
never inserts a word absent from that pair's candidates. Default loading still
uses one cached grid request, not a separate detail request for every pair.
Picker alternatives receive the same ranking after their individual offensive
flags are checked. Saved account words and current-page overrides retain priority.

Local story rendering errors are isolated from word lookup: a failed story leaves
the successfully fetched word examples visible and does not stop other panels.

The one-syllable filter is remembered in the browser and applies to both memo
cards. Longer examples also show an approximate short cue, such as Pikachu → pik;
enabling the filter makes that cue the main text. These locally generated cues
prefer stored pronunciation metadata: approximate orthographic syllable chunks,
a reviewed one-syllable clip, and optional pair-specific exceptions. The initial
43 pronunciation entries include gua-ca-mo-le → guac, rac-quet → rack, and
pi-ka-chu → pik. Clips may retain a consonant from the next syllable, and a
sound-equivalent spelling need not contain both literal pair letters. The earlier
GX → gax preference is an explicit exception, not a general letter-forcing rule.
Unreviewed multisyllabic words have no short cue rather than a fabricated
consonant-vowel-pair combination. A spelling heuristic still recognizes likely
one-syllable words without metadata; pronunciation and syllable boundaries can
vary by accent. Capitalization highlights only literal matching pair letters;
it does not present a substituted C as a literal Q. The original CoLPI example remains visible for reference. Missing cues
keep their letter pair visible rather than dropping a target from the memo.

Word examples also include an “Example sentence-like story” without an added
opening command. Each solve has low/high sliders from 0 to 2 for an approximate
average number of filler words per pair (in steps of 0.1). Both its edge and
corner stories use that range; other bulk solves are unaffected. At zero,
images are separated by dots. Short segments may have fewer filler words than
requested because nothing is inserted across a technique boundary. Memo images
are teal and connecting words are brown, with a color legend beside the sliders.
Missing images, single letters and technique annotations remain bracketed.
Stories follow the one-syllable setting and pair-letter capitalization. The
smaller explanation is generated locally from the same adjacent-image connections.
No LLM, API key, login, or paid inference service is required for stories. CoLPI
word lookup still needs a network connection. The earlier paid story endpoint
and AI button have been removed.

`static/memo_lexicon.js` contains the first 368 vocabulary entries, seeded from
CoLPI's censored English grid with a few illustrative additions. Entries record
part of speech, category, grammatical number, and properties such as portable,
edible, musical, or container. Common images also have concrete descriptions.
For 68 less tangible cues, a `representation` supplies a concrete mnemonic
stand-in with its own category, grammatical number, properties, and first/repeated
phrasing. Examples include Siri → a glowing phone, love → a heart-shaped cushion,
and rage → a person stamping a foot. Connections use the stand-in's physical
properties; the compact memo retains the original cue. Explanations explicitly
say which cue the image represents, including when short sounds are enabled.
These are suggested memory associations, not dictionary definitions or factual
claims about the represented subjects. They do not add words to CoLPI results or
bypass censorship/private exclusions.

This is partial coverage, not a complete semantic dictionary of CoLPI. Unreviewed
words and custom phrases use neutral spatial links without invented definitions.
`static/memo_story.js` connects adjacent images by category/property, varies
compatible connections, preserves annotations, and uses original words for
explanations even when short sounds are displayed. Lower filler settings use
fragments; explanations remain full sentences. The default is now 2 filler words
per pair to leave room for articles, relative clauses (who/which), and modal verbs
such as can. Filler allocation is a word budget, not a requirement to pad a sentence:
whole grammatical units are preferred to extra adverbs. Explanations connect
clauses with conjunctions and transitions such as “and then” and “meanwhile,”
with occasional “could” constructions. Spatial fallbacks vary among behind,
above, opposite, and underneath. At zero, the compact memo remains dot-separated,
while explanations still describe meaningful connections. Word overrides regenerate both.

Supported role chains now link wearables → wearers → vehicles → operators and
people → imagined thoughts → head. A wearable can turn an object into a character,
so a blindfold-wearing cog can become a taxi passenger. Vehicle metadata supplies
driver, rider, pilot, captain, or paddler roles; proper names omit articles.
The short chain and explanation come from the same role plan. At low filler
budgets, the compact chain stays dot-separated instead of cutting a role phrase
in half, while its explanation retains the scene. Technique annotations stop
role propagation. Personal thoughts are explicitly imaginary; the rules do not
infer real beliefs or change CoLPI/private filtering. Other chains continue to
use the ordinary category/property connections.

Every shipped lexicon entry now has an `affordances` profile: physical `tags`,
`canDo` actions, `canReceive` actions, `associations`, sensory `detail`, and its
`basis`. Shared category traits are supplemented by reviewed word-specific
traits (81 entries in this first pass). Empty lists mean no supported knowledge,
not permission to invent properties. Symbolic cues use their depicted stand-in's
traits instead of treating an abstract concept as a physical substance.

`static/memo_actions.js` matches authored action frames against both participants.
Specific frames (sticky liquid on keyboard keys, liquid on a visor) outrank broad
ones; recent action families receive a repetition penalty. A small lookahead
bonus favors effects useful for the next image. Frames can pass wet, sticky,
filled, tangled, moving, or sounding state to the next image. State is local to
one contiguous memo group and resets at annotations and between solves. For
example, juice soaks a teddy bear, the bear drips onto a keyboard, and the sticky
keyboard clings to a cog. A full cup can tip its contents over the next image.
Only compatible authored effects are used; this is not a general physics model.

The same selected frame supplies the compact action and the explanatory
consequence. If the filler budget cannot fit a complete action phrase, that gap
stays dot-separated while the explanation retains the scene. Cue spans remain
in order, with no inserted associated object becoming another target. Associated
objects are currently vocabulary for authors, not automatically inserted cues.
Existing role-chain rules still handle clothing, passengers, drivers, and thoughts.
Unknown/custom words retain conservative fallback links. The imported private
review queue is larger than the shipped lexicon; it is not all semantically annotated.
No LLM or paid inference is used at runtime or by the dictionary import script.

To extend coverage, add verified traits to an entry's `affordances.tags` and keep
its human-readable action lists consistent. Add a frame only with explicit source
and target constraints, singular/plural verb forms, an explanation, and defined
effects; test both valid and invalid matches as well as effect reset boundaries.

To draft additional entries from the public censored grid, load your private
`MEMO_WORD_EXCLUSIONS` environment setting and run:

```bash
python scripts/draft_memo_dictionary.py
```

This writes `instance/memo_dictionary_review.json` (ignored by git), keeping the
pair-to-choices mapping separate from word definitions. It verifies censorship,
applies private exclusions, and flags unfamiliar words for review rather than
inventing properties. It includes grid suggestions, not every alternative in
CoLPI's pair-detail database. Review definitions and properties before adding
entries to the public lexicon; do not publish the private review file or exclusion
list. `--html path/to/page.html` supports an offline snapshot. Runtime filtering
still happens in the existing CoLPI endpoints; dictionary membership never makes
an otherwise excluded suggestion eligible. No database migration is needed.

Each pair has a “Choose word” picker (in bulk, click its word first). Alternatives
are fetched on demand from CoLPI's pair-detail page, with censorship verified
and each offensive flag checked; private exclusions apply as well. Users may
instead type a custom word or restore the default. Overrides update every
occurrence of that pair on the current page, including stories and short cues.
Signed-in users can check “Save to my account” before applying a word to reuse
it on later visits in either mode. Otherwise overrides last only on the current
page. The picker also offers removal of a saved account word; “Restore default”
alone affects only the current page. Signed-out users see a WCA login link.
Choices are private to the account and never sent to CoLPI. Custom text is user-authored
and displayed as plain text; it is not a moderated CoLPI suggestion.

Account words use the preset database. Local SQLite creates `memo_word_choices`
automatically; PostgreSQL requires `migrations/003_memo_word_choices.sql`.
Apply pending migrations with `python scripts/persistent_data.py init` using
`DATABASE_URL_DIRECT` before deploying this feature. Database outages leave
page-only overrides usable and show an error for account saving.

The server reads the public anonymous suggestion grid and requires CoLPI to
report `showOffensive: false` and English before returning any words. Censorship
cannot be disabled through the tracer. Filtering relies on CoLPI's community
moderation; unflagged submissions are not independently reviewed. Suggestions
are cached for five minutes. If the provider is unavailable or its response
format changes, examples are omitted and the original memo stays usable.

`memo_word_policy.py` loads optional extra exclusions from the server-only
`MEMO_WORD_EXCLUSIONS` environment variable, a JSON array of full entries.
The real list belongs in your ignored `.env` locally and in Vercel environment
variables for each intended deployment environment; never put it in frontend
code, tests, or committed configuration. Tests use fictional examples only.
A harmless example of the format is `["purple dragon", "silver robot"]`.
For a shell-sourced `.env`, quote the JSON as a shell value (including escaping
any apostrophes in entries). Paste the raw JSON array, without shell quotes,
into Vercel. Restart locally or redeploy after configuration changes.

Only add real exclusions after observing the full entry in CoLPI's censored
English grid. Matching ignores case, accents, spacing and punctuation but
matches full entries rather than generic keywords. The next ranked suggestion
is tried when one is excluded; if none qualify, no example is returned. Cached
words are checked again before reaching the browser. An unset variable means
no extra exclusions; CoLPI's censorship remains mandatory. Malformed private
configuration disables word examples with a generic error instead of exposing
its contents or silently bypassing the extra filter. This list is not a
comprehensive semantic classifier.

### Production persistence

See the [Neon setup, schema initialization, SQLite import, and verification guide](docs/postgres-phase1.md). Presets and saved bulk results use `DATABASE_URL` when set; local development keeps SQLite when it is absent. Vercel/production requires `DATABASE_URL`. Official history also uses PostgreSQL when configured, with local MySQL fallback. See the [Phase 2 reduced WCA import and deployment guide](docs/postgres-phase2.md).

Presets are listed separately for beginner and expert mode. Full loads only apply
to the current mode. The other mode's presets can supply letters, colors, and cube
orientation through the explicit copy button; buffers, methods, and solving
options are preserved. Existing presets keep their saved mode and remain usable.
Preset names must still be unique across your profile, with a total limit of 30.

“Profile presets are temporarily unavailable” means the server could not access
preset storage, rather than a mismatch between beginner and expert settings.
Check `DATABASE_URL`, database connectivity, and that schema initialization has
completed using the persistence guide above. After restoring access, use “Retry
loading presets”. For local-only development, start with `DATABASE_URL` unset to
use local SQLite presets; these are separate from your online profile data.

### WCA OAuth redirect configuration

The authorization request and token exchange both use `WCA_REDIRECT_URI`.
When this environment variable is unset, it defaults to
`http://localhost:5001/auth/wca/callback` for local development.

For production on Vercel, set `WCA_REDIRECT_URI` to the production callback
URL (no trailing slash):

```text
WCA_REDIRECT_URI=https://rubiks-cube-blind-tracer.vercel.app/auth/wca/callback
```

Also set `FLASK_SECRET_KEY` to a persistent, randomly generated secret in Vercel's
environment variables, alongside `WCA_CLIENT_ID` and `WCA_CLIENT_SECRET`, and
redeploy after changing them. Generate a key with
`python -c 'import secrets; print(secrets.token_hex(32))'`. Use the same key across
all workers and deployments; do not generate it during application startup.
Production refuses to start without it, because changing keys invalidates the
session containing the WCA sign-in state. Local development can use a temporary
key, but restarting the app then invalidates existing sessions.

Sign-in starts on the origin configured in `WCA_REDIRECT_URI`, including when
opened from a deployment alias, so the session cookie reaches the callback.
After fixing configuration, start a fresh sign-in from the site instead of
reloading an old callback URL.

Register that exact same production callback URL as a redirect URI in your
WCA OAuth application. Keep `http://localhost:5001/auth/wca/callback`
registered as well for local development.

## Project Structure

```text
Rubiks-Cube-Blind-Tracer/
├── Cube.py
├── app.py
├── package.json
├── package-lock.json
├── static/
│   ├── cstimer_module.js
│   ├── script.js
│   └── style.css
└── templates/
    └── index.html
```

### `Cube.py`

Contains the underlying cube model, move simulation, permutation/orientation tracking, BLD cycle tracing, cycle-break detection, floating detection, and pseudoswap logic.

### `app.py`

Flask backend connecting the cube/tracing logic to the browser interface.

### `templates/index.html`

Main application interface.

### `static/script.js`

Client-side functionality including scramble generation, interface controls, and letter-scheme behavior.

### `static/style.css`

Application styling and responsive layout.

### `static/cstimer_module.js`

Provides csTimer scramble generation through a Web Worker.

## BLD Conventions

The tracer currently uses a cubie representation with:

- 12 edge positions
- 8 corner positions
- Edge orientation modulo 2
- Corner orientation modulo 3

Memo targets are represented internally as `(position, orientation)` pairs and are translated into sticker names before being converted to letters.

The default letter scheme is Speffz.

## Current Status

The application is under active development.

Implemented functionality includes:

- 3×3 scramble simulation
- Random scramble generation
- Edge tracing
- Corner tracing
- Orientation-aware sticker tracing
- Custom edge buffers
- Custom corner buffers
- Custom letter schemes
- Speffz support
- Cycle-break detection
- Floating detection
- Parity detection
- Edge pseudoswapping
- Flipped-edge detection
- Twisted-corner detection
- Cube visualization
- Custom color schemes
- Cube orientation controls
- Responsive web interface

More advanced blindfolded memo and tracing features may be added in the future.

## Acknowledgments

Random scramble generation uses the csTimer scramble-generation module.

csTimer is licensed under the GNU General Public License v3.0 (GPL-3.0). See the relevant csTimer project and license information for details.
Standalone edge and corner cycles automatically float when they start at a memo-pair boundary, contain an even number of targets including the opening/closing targets, and open and close on the same sticker. This rule requires the opening buffer to be enabled in the remaining floating priority order; the opening sticker becomes the buffer and both bookend targets are removed. For example, `VT XV` becomes `[Buffer V] TX`. Counts and buffer usage reflect this reduction.

### LTCT

Enable **Include LTCT** with the UFR corner buffer. On parity scrambles with unequal in-place CW/CCW twist counts (excluding the buffer), one corner from the larger group is marked `[LTCT: parity-target[twist-sticker]]` (for example, `[LTCT: V[R]]` for a CCW-twisted A corner) instead of appearing in the regular twist list. Eligible scrambles use the two edges selected in the pseudoswap form. The combined parity/twist algorithm saves one algorithm against the separate twist estimate; target counts exclude the twist as before. Balanced twist counts and non-parity scrambles are unchanged. Bulk results report the number of scrambles using LTCT.

### T2C fallback

Enable **Include T2C when LTCT is not used** to reserve a two-piece corner cycle whose opening and closing stickers differ on the same piece. This applies only on parity scrambles and only when LTCT is not active. The chosen cycle is removed from ordinary tracing and displayed last as `[T2C: …]`, after other memo and twists. It counts as one algorithm; its three sticker targets remain included in target totals. Bulk results report how many scrambles use T2C.

### Official Solve History

After importing the WCA database, run `python3 -m flask --app app optimize-history-db` once. This adds a composite lookup index on `scrambles` so history can find matching competition/event/round/attempt records without scanning the full scramble table. Existing records are preserved, and rerunning the command skips an equivalent existing index. Run it again if a future import recreates the table; building the index on a large database can take a little time.

**My Official Solve History** offers 3x3 blindfolded and 3x3 multiple blindfolded (`333mbf`). The multi-blind view lists every available scramble group (including extras) from competitions where your WCA ID has results in any event. Each multi-blind database record is split on newlines into numbered cube rows, each with its own Trace button. Use **Import attempt to Bulk** to import only that attempt and group. Cube numbers are shown separately from attempt numbers and groups; these are not personal attempt records. Both views support individual tracing and **Import All to Bulk**. The existing WCA `scrambles` columns are sufficient; no database migration is required. The old `/my-3bld-history` URL remains supported.

### Conjugacy-class practice

On the homepage, expand **Practice a conjugacy class**, enter an exact class (for example `3e3e'1e' 3c`), and select **Generate practice scramble**. The generated scramble is placed in the main input; select **Generate Memo** to analyze it. The class remains in the practice input after analysis so you can generate another example.

The parser accepts concatenated or whitespace-separated edge (`e`) and corner (`c`) cycles, case-insensitive letters, and straight or typographic primes. Unlisted pieces remain solved. It rejects invalid lengths, excess pieces, mismatched permutation parity, odd numbers of primed edge cycles, and a single primed corner cycle. Both nonzero corner orientation totals use the same prime notation; the sampler randomly chooses compatible totals. Solved-only classes do not generate a practice scramble.

`conjugacy.py` constructs random legal states directly, sampling piece assignments, cycle orders and orientations. The browser runs the bundled csTimer two-phase solver in a dedicated worker, then inverts the solution. `/api/conjugacy-verify` checks the exact original target state and class before inserting the result. No external solving service or additional solver dependency is used. The solver has bounded search and a 45-second worker timeout, with retryable errors; solutions are not guaranteed shortest.

The local `static/cstimer_module.js` bundle has a small integration patch: its exported API adds `solveFacelets(facelets)` using the internal `Wb.Search` (depth 21, probe limit 1,000,000), and its worker dispatcher accepts `solve-facelets`. Preserve these additions when updating the vendor bundle. `tests/test_conjugacy_practice.py` runs the real bundled solver under Node to verify facelet conversion and scramble round trips, as well as testing the parser, sampler, and API validation.

When edge floating reaches an in-place flipped edge at an even target boundary, it becomes the buffer if it is the only pending isolated flip; tracing then uses the configured cycle-break order. If another isolated flip remains, `[2Flip: … …]` pairs it with the next flipped piece in the full floating order (wrapping if necessary). Only the initiating buffer needs floating enabled; its partner is solved as part of the flip algorithm. Each pair costs one algorithm and contributes no memo targets. Intervening unsolved floating buffers remain eligible. Paired flips and flips absorbed into a buffer are excluded from the trailing `[Flips: …]` list. Fixed-buffer tracing and corner tracing are unchanged.

### Solution examples

After generating a memo, select **Show example moves** to see the first manmade
3-style edge algorithm for each ordinary target pair. Examples respect floating
buffer boundaries and use sticker positions independently of your letter scheme.
Each algorithm is checked against the exact cube state before display. These are
edge examples, not a complete solution: corner algorithms, parity, flips, and
combined techniques are not yet covered; sandwiches use their original pairs.

Data comes from [BLDDB](https://blddb.net/edge.html) and its
[public repository](https://github.com/nbwzx/blddb), whose license is
[GPL-3.0](https://github.com/nbwzx/blddb/blob/main/LICENSE). The app fetches data
on demand, caches it under `instance/blddb` for 24 hours, and uses cached data if
refresh fails. Algorithm contributors and a case link appear beside each example.
The data is not bundled with the application source.

### Device-only settings presets

Beginner and Expert presets can be saved without an account. Use **Save new preset** to store the current settings in this browser, then select a preset and **Load preset** on a later visit. Signed-in users can choose **This device (no account needed)** or **WCA profile** in **Save presets to**. Both support copying letters, colors, and orientation from the other mode. Device presets are separate from WCA profile presets and do not sync or migrate automatically. Clearing site data removes them, and private browsing may discard them when the session ends.
