# Rubik's Cube Blindfolded Memo Tracer

A web-based tool for generating blindfolded (BLD) memo traces for 3×3 Rubik's Cube scrambles.

The application takes a scramble, simulates the resulting cube state, and traces the edge and corner permutation cycles needed for blindfolded solving. It supports custom buffers, custom letter schemes, cycle-break detection, orientation tracking, presence of floating opportunities, and parity-based pseudoswapping.

An intended next step is to expand upon floating opportunities. As of now, the Python program only allows for availability of floating to be detected once per piece type. Later, it will be ideal to allow the user to select which floating buffers to use and in what sequence and generate memo that accounts for floating, rather than all tracing from one buffer.

## Features

### Scramble Input

- Option 1: Enter any valid 3×3 scramble manually.
- Option 2: Generate random 3×3 scrambles using the csTimer scramble generator.
- Supports standard face turns and cube rotations and gracefully handles invalid inputs.

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
pip install flask
```

Run the Flask application:

```bash
python app.py
```

Then open the local address displayed by Flask in your browser.

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