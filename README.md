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
- Supports standard face turns and cube rotations and gracefully handles invalid inputs.

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

### Production persistence

See the [Neon setup, schema initialization, SQLite import, and verification guide](docs/postgres-phase1.md). Presets and saved bulk results use `DATABASE_URL` when set; local development keeps SQLite when it is absent. Vercel/production requires `DATABASE_URL`. Official history also uses PostgreSQL when configured, with local MySQL fallback. See the [Phase 2 reduced WCA import and deployment guide](docs/postgres-phase2.md).

### WCA OAuth redirect configuration

The authorization request and token exchange both use `WCA_REDIRECT_URI`.
When this environment variable is unset, it defaults to
`http://localhost:5001/auth/wca/callback` for local development.

For production on Vercel, set `WCA_REDIRECT_URI` to the production callback
URL (no trailing slash):

```text
WCA_REDIRECT_URI=https://rubiks-cube-blind-tracer.vercel.app/auth/wca/callback
```

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
