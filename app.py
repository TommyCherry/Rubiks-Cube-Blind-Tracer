import os
import json
import sqlite3
from collections import Counter
from persistence import (postgres_connection, insert_preset, UNIQUE_ERRORS,
                         preset_database_errors, PostgresConnection, StorageConfigurationError, DATABASE_ERRORS)
import psycopg
from history_queries import THREE_BLIND_SQL, multiblind_sql
from contextlib import closing
import re
import secrets
from urllib.parse import urlencode, urlsplit
from auth_config import session_secret
import requests
from colpi import suggestions_for, valid_pair, alternatives_for
import mysql.connector
from itsdangerous import URLSafeTimedSerializer, BadData
from conjugacy import generate_state, to_facelets
from blddb import dataset, edge_example, POSITION_CODES
from beginner_solutions import op_edge_examples, op_corner_examples, OP_PARITY_ALGORITHMS

from flask import jsonify, abort, Flask, render_template, request, redirect, session, url_for

from Cube import (
    Cube,
    SPEFFZ, EDGE_BUFFER_ORDER, CORNER_BUFFER_ORDER,

    UF, UB, UR, UL,
    FR, FL, DF, DB, DR, DL, BR, BL,

    UFR, UFL, UBR, UBL,
    DFR, DFL, DBR, DBL,

    format_edge_trace,
    format_corner_trace,
    convert_to_letters,
    format_memo
)

app = Flask(__name__)
app.secret_key = session_secret(os.environ)
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["DATABASE_URL"] = os.environ.get("DATABASE_URL")
app.config["PRESET_DATABASE"] = os.environ.get("PRESET_DATABASE", os.path.join(app.instance_path, "presets.sqlite3"))
app.config["BULK_DATABASE"] = os.environ.get("BULK_DATABASE", os.path.join(app.instance_path, "bulk.sqlite3"))
WCA_REDIRECT_URI = os.environ.get(
    "WCA_REDIRECT_URI", "http://localhost:5001/auth/wca/callback"
)


# The sticker targets we want to display in the editor
EDGE_TARGETS = [
    "UB", "UR", "UF", "UL",
    "LU", "LF", "LD", "LB",
    "FU", "FR", "FD", "FL",
    "RU", "RB", "RD", "RF",
    "BU", "BL", "BD", "BR",
    "DF", "DR", "DB", "DL"
]

CORNER_TARGETS = [
    "UBL", "UBR", "UFR", "UFL",
    "LUB", "LUF", "LDF", "LDB",
    "FUL", "FUR", "FDR", "FDL",
    "RUF", "RUB", "RDB", "RDF",
    "BUR", "BUL", "BDL", "BDR",
    "DFL", "DFR", "DBR", "DBL"
]

EDGE_BUFFER_OPTIONS = [
    "UF", "UB", "UR", "UL",
    "FR", "FL", "DF", "DB",
    "DR", "DL", "BR", "BL"
]

CORNER_BUFFER_OPTIONS = [
    "UFR", "UFL", "UBR", "UBL",
    "DFR", "DFL", "DBR", "DBL"
]

BUFFER_STICKERS = {
    kind: {piece: formatter([(p, o) for o in range(modulus)])
           for p, piece in enumerate(options)}
    for kind, options, modulus, formatter in (
        ("edge", EDGE_BUFFER_OPTIONS, 2, format_edge_trace),
        ("corner", CORNER_BUFFER_OPTIONS, 3, format_corner_trace))
}


def parse_buffer(value, kind):
    """Accept sticker names and legacy numeric piece IDs from saved presets."""
    options = EDGE_BUFFER_OPTIONS if kind == "edge" else CORNER_BUFFER_OPTIONS
    if str(value) in [str(p) for p in range(len(options))]:
        return int(value), options[int(value)]
    for position, piece in enumerate(options):
        if value in BUFFER_STICKERS[kind][piece]:
            return position, value
    raise ValueError(f"Invalid {kind} buffer sticker.")


def parity_case_groups(order, primary=None, include_hidden=False):
    order = list(order)
    if primary is not None:
        order.remove(primary)
        order.insert(0, primary)
    groups = []
    for index, name in enumerate(order):
        cases = []
        for target_index, target in enumerate(order):
            if target == name or (not include_hidden and target_index <= index):
                continue
            position = CORNER_BUFFER_OPTIONS.index(target)
            for sticker in format_corner_trace([(position, 0), (position, 1), (position, 2)]):
                cases.append(dict(key=f"{name}_{sticker}", target=sticker,
                                  piece=target, visible=target_index > index))
        if cases:
            groups.append(dict(buffer=name, cases=cases, count=3 * (7 - index)))
    return groups


PARITY_CASES = parity_case_groups(CORNER_BUFFER_OPTIONS)
PARITY_CASE_KEYS = {case["key"] for group in parity_case_groups(CORNER_BUFFER_OPTIONS, include_hidden=True)
                    for case in group["cases"]}


HISTORY_DATABASE_ERRORS = (mysql.connector.Error, psycopg.Error, StorageConfigurationError)


def get_db_connection():
    postgres = postgres_connection(app.config)
    if postgres is not None:
        return postgres
    return mysql.connector.connect(
        host=os.environ.get("WCA_MYSQL_HOST", "localhost"),
        port=int(os.environ.get("WCA_MYSQL_PORT", "3306")),
        user=os.environ.get("WCA_MYSQL_USER", "root"),
        password=os.environ.get("WCA_MYSQL_PASSWORD", ""),
        database=os.environ.get("WCA_MYSQL_DATABASE", "wca_results")
    )


@app.cli.command("optimize-history-db")
def optimize_history_db():
    """Add the scramble lookup index needed by official history queries."""
    columns = ("competition_id", "event_id", "round_type_id", "is_extra", "scramble_num")
    with closing(get_db_connection()) as connection:
        if isinstance(connection, PostgresConnection):
            with connection:
                connection.execute("""CREATE INDEX IF NOT EXISTS idx_scrambles_history
                    ON scrambles (competition_id, event_id, round_type_id, is_extra, scramble_num)""")
            print("Official history lookup index is ready.")
            return
        with closing(connection.cursor(dictionary=True)) as cursor:
            cursor.execute("SHOW INDEX FROM scrambles")
            indexes = {}
            for row in cursor.fetchall():
                indexes.setdefault(row["Key_name"], {})[row["Seq_in_index"]] = row["Column_name"]
            for parts in indexes.values():
                if tuple(parts.get(i) for i in range(1, len(columns) + 1)) == columns:
                    print("Official history lookup index already exists.")
                    return
            cursor.execute("""
                CREATE INDEX idx_scrambles_history ON scrambles
                    (competition_id, event_id, round_type_id, is_extra, scramble_num)
            """)
    print("Created official history lookup index.")


def bulk_connection():
    postgres = postgres_connection(app.config)
    if postgres is not None:
        return postgres
    path = app.config["BULK_DATABASE"]
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    connection = sqlite3.connect(path)
    connection.row_factory = sqlite3.Row
    connection.executescript("""
        CREATE TABLE IF NOT EXISTS bulk_batches (
            id TEXT PRIMARY KEY, metadata TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS bulk_scrambles (
            batch_id TEXT NOT NULL REFERENCES bulk_batches(id),
            line_number INTEGER NOT NULL, alg_count INTEGER, result TEXT NOT NULL,
            PRIMARY KEY (batch_id, line_number)
        );
        CREATE INDEX IF NOT EXISTS bulk_alg_count
            ON bulk_scrambles(batch_id, alg_count, line_number);
    """)
    return connection


def save_bulk_batch(results, metadata):
    batch_id = secrets.token_urlsafe(24)
    with closing(bulk_connection()) as connection, connection:
        connection.execute("INSERT INTO bulk_batches (id, metadata) VALUES (?, ?)",
                           (batch_id, json.dumps(metadata)))
        connection.executemany("INSERT INTO bulk_scrambles (batch_id, line_number, alg_count, result) VALUES (?, ?, ?, ?)",
                               [(batch_id, row["line_number"], row.get("alg_count"),
                                 json.dumps(row)) for row in results])
    return batch_id


def annotate_bulk_history(results):
    """Match against the current viewer's history without persisting profile data."""
    wca_id = (session.get("wca_user") or {}).get("wca_id")
    if not wca_id or not results:
        return None
    try:
        history = get_3bld_history(wca_id)
    except HISTORY_DATABASE_ERRORS:
        app.logger.warning("WCA history lookup unavailable for bulk results")
        return "Competition details are temporarily unavailable. Your bulk traces are still available."
    matches = {}
    for attempt in history:
        for scramble in attempt["scrambles"]:
            key = " ".join(scramble["scramble"].split())
            match = dict(competition_name=attempt["competition_name"],
                         competition_id=attempt["competition_id"],
                         round_type_id=attempt["round_type_id"],
                         solve=attempt["attempt_number"], group=scramble["group_id"])
            entries = matches.setdefault(key, [])
            if match not in entries:
                entries.append(match)
    for row in results:
        row["wca_matches"] = matches.get(" ".join(row["scramble"].split()), [])
    return None


BEGINNER_METRICS = {
    "edge_count": "Edge target counts", "corner_count": "Corner target counts",
    "target_count": "Total target counts", "cycle_break_count": "Cycle breaks",
    "edge_cycle_break_count": "Edge cycle breaks",
    "corner_cycle_break_count": "Corner cycle breaks",
    "in_place_flips": "Flipped edges", "in_place_twists": "Twisted corners",
}


def beginner_distributions(results):
    valid = [row for row in results if "error" not in row]
    for row in valid:
        row["edge_cycle_break_count"] = len(row["edge_cycle_breaks"])
        row["corner_cycle_break_count"] = len(row["corner_cycle_breaks"])
        row["cycle_break_count"] = row["edge_cycle_break_count"] + row["corner_cycle_break_count"]
        if "in_place_flips" not in row or "in_place_twists" not in row:
            cube = Cube()
            cube.apply_scramble(row["scramble"])
            row["in_place_flips"] = sum(p == i and o != 0 for i, (p, o) in enumerate(zip(cube.edge_perm, cube.edge_ori)))
            row["in_place_twists"] = sum(p == i and o != 0 for i, (p, o) in enumerate(zip(cube.corner_perm, cube.corner_ori)))
    summaries = []
    for key, label in BEGINNER_METRICS.items():
        counts = Counter(row[key] for row in valid)
        summaries.append(dict(key=key, label=label, minimum=min(counts, default=None),
                              maximum=max(counts, default=None), bins=[
            dict(value=value, count=count, percent=100 * count / len(valid))
            for value, count in sorted(counts.items())]))
    return summaries


def filter_beginner_results(results, args):
    bounds = {}
    for key in BEGINNER_METRICS:
        for suffix in ("min", "max"):
            name = f"{key}_{suffix}"
            value = args.get(name, "").strip()
            if value and not re.fullmatch(r"[0-9]{1,6}", value):
                abort(400, description="Filter bounds must be non-negative whole numbers.")
            bounds[name] = int(value) if value else None
        low, high = bounds[f"{key}_min"], bounds[f"{key}_max"]
        if low is not None and high is not None and low > high:
            abort(400, description="Filter minimum cannot exceed maximum.")
    parity = args.get("parity", "")
    if parity not in ("", "Yes", "No"):
        abort(400, description="Invalid parity filter.")
    if not parity and all(value is None for value in bounds.values()):
        return results
    return [row for row in results if "error" not in row
            and (not parity or row["parity"] == parity)
            and all((bounds[f"{key}_min"] is None or row[key] >= bounds[f"{key}_min"])
                    and (bounds[f"{key}_max"] is None or row[key] <= bounds[f"{key}_max"])
                    for key in BEGINNER_METRICS)]


@app.get("/bulk/<batch_id>")
def query_bulk(batch_id):
    count = request.args.get("alg_count", "").strip()
    if count and (not re.fullmatch(r"[0-9]{1,9}", count)):
        abort(400, description="Algorithm count must be a non-negative whole number (up to 9 digits).")
    sort = request.args.get("sort", "original")
    orders = {"original": "line_number", "asc": "alg_count IS NULL, alg_count ASC, line_number",
              "desc": "alg_count IS NULL, alg_count DESC, line_number"}
    if sort not in orders:
        abort(400, description="Invalid sort order.")
    with closing(bulk_connection()) as connection:
        batch = connection.execute("SELECT metadata FROM bulk_batches WHERE id = ?", (batch_id,)).fetchone()
        if batch is None:
            abort(404)
        parameters = [batch_id]
        where = "batch_id = ?"
        if count:
            where += " AND alg_count = ?"
            parameters.append(int(count))
        rows = connection.execute(
            f"SELECT result FROM bulk_scrambles WHERE {where} ORDER BY {orders[sort]}", parameters).fetchall()
        counts = [row["alg_count"] for row in connection.execute(
            "SELECT DISTINCT alg_count FROM bulk_scrambles WHERE batch_id = ? AND alg_count IS NOT NULL ORDER BY alg_count",
            (batch_id,))]
    results = [json.loads(row["result"]) for row in rows]
    # Older saved batches predate cycle classification; derive it without retracing.
    for result in results:
        if "error" not in result and ("conjugacy_class" not in result or "scramble_facelets" not in result):
            cube = Cube()
            cube.apply_scramble(result["scramble"])
            result["conjugacy_class"] = cube.conjugacy_class()
            result["scramble_facelets"] = to_facelets(cube)
    metadata = json.loads(batch["metadata"])
    if metadata.get("beginner"):
        distributions = beginner_distributions(results)
        # Saved batches may predate newly added distribution metrics.
        if not count:
            metadata["bulk_distributions"] = distributions
        else:
            metadata.setdefault("bulk_distributions", distributions)
        results = filter_beginner_results(results, request.args)
    history_warning = annotate_bulk_history(results)
    return render_template("bulk_page.html", **metadata,
                           bulk_results=results, bulk_history_warning=history_warning,
                           bulk_batch_id=batch_id, bulk_alg_counts=counts,
                           bulk_alg_filter=count, bulk_sort=sort)


def sandwich_memo(targets, letters, enabled=False):
    """Reduce non-overlapping AB CD BE patterns at target-pair boundaries."""
    parts = []
    count = 0
    index = 0
    while index < len(targets):
        window = targets[index:index + 6]
        if (enabled and len(window) == 6 and window[1] == window[4]
                and len(set(window)) == 5):
            a, b, c, d, _, e = letters[index:index + 6]
            parts.append(f"[Sandwich {b}: {c}{d}] {a}{e}")
            count += 1
            index += 6
        else:
            parts.append("".join(letters[index:index + 2]))
            index += 2
    return " ".join(parts), count


@app.template_filter("highlight_sandwiches")
def highlight_sandwiches(memo):
    from markupsafe import Markup, escape
    # Escape custom letters before introducing our own highlight markup.
    return Markup(re.sub(r"(\[Sandwich [^\]]*\])", r'<mark class="sandwich-highlight">\1</mark>', str(escape(memo))))


def trace_scramble(scramble, **settings):
    """Apply final corner-buffer restrictions before returning a trace."""
    settings = settings.copy()
    overrides = settings.pop("parity_pseudoswaps", {})
    if settings["corner_buffer"] in (DFR, DFL, DBR, DBL):
        settings.update(include_ltct=False, include_t2c=False)
    result = _trace_scramble(scramble, **settings)
    if result["ltct_active"] or result["t2c_active"]:
        buffer = result["technique_buffer"]
        if buffer in (DFR, DFL, DBR, DBL):
            settings.update(include_ltct=False, include_t2c=False)
            result = _trace_scramble(scramble, **settings)
        swaps = {UFL: (UF, UL), UBR: (UB, UR), UBL: (UB, UL)}
        if (result["ltct_active"] or result["t2c_active"]) and buffer in swaps:
            first, second = swaps[buffer]
            settings.update(use_pseudoswap=True, pseudoswap_edge_1=first,
                            pseudoswap_edge_2=second)
            result = _trace_scramble(scramble, **settings)
    if (settings.get("use_pseudoswap") and not result["ltct_active"]
            and not result["t2c_active"] and result["parity_case"] in overrides):
        first, second = overrides[result["parity_case"]]
        if first not in range(12) or second not in range(12) or first == second:
            raise ValueError("A parity override must select two different edges.")
        settings.update(pseudoswap_edge_1=first, pseudoswap_edge_2=second)
        result = _trace_scramble(scramble, **settings)
    return result


def _trace_scramble(scramble, *, edge_buffer, corner_buffer, use_pseudoswap,
                   pseudoswap_edge_1, pseudoswap_edge_2, floating_buffers,
                   letter_scheme, beginner_flip_targets=False, beginner_twist_targets=False, corner_floating_buffers=None, edge_flip_order=None, include_basic_sandwiching=False, include_ltct=False, include_t2c=False, include_3twist=False, include_parity_3twist=False, edge_even_cycle_break_order=None, corner_even_cycle_break_order=None, edge_odd_cycle_break_order=None, corner_odd_cycle_break_order=None, edge_odd_cycle_break_overrides=None, corner_odd_cycle_break_overrides=None, edge_sticker_cycle_break_order=None, corner_sticker_cycle_break_order=None, edge_buffer_orientations=None, corner_buffer_orientations=None):
    """Shared tracing and memo formatting for individual and bulk input."""
    edge_buffer_orientations = edge_buffer_orientations or {}
    corner_buffer_orientations = corner_buffer_orientations or {}
    edge_buffer_stickers = format_edge_trace([(p, edge_buffer_orientations.get(p, 0)) for p in range(12)])
    corner_buffer_stickers = format_corner_trace([(p, corner_buffer_orientations.get(p, 0)) for p in range(8)])
    cube = Cube()
    cube.apply_scramble(scramble)
    conjugacy_class = cube.conjugacy_class()
    scramble_facelets = to_facelets(cube)

    ltct_positions = {
        orientation: [position for position, value in enumerate(cube.corner_ori)
                      if position != corner_buffer and cube.corner_perm[position] == position
                      and value == orientation]
        for orientation in (1, 2)
    }
    ltct_active = (include_ltct and cube.has_parity()
                   and len(ltct_positions[1]) != len(ltct_positions[2]))
    ltct_direction = None
    ltct_position = None
    if ltct_active:
        ltct_direction = 1 if len(ltct_positions[1]) > len(ltct_positions[2]) else 2
        ltct_position = ltct_positions[ltct_direction][-1]
        use_pseudoswap = True

    # Identify flips relative to the same target permutation used by tracing.
    target_perm = (cube.get_edge_target_perm(pseudoswap_edge_1, pseudoswap_edge_2)
                   if use_pseudoswap and cube.has_parity() else cube.get_edge_target_perm())
    flip_positions = [position for position, orientation in enumerate(cube.edge_ori)
                      if position != edge_buffer
                      and cube.edge_perm[position] == target_perm[position] and orientation == 1]
    if beginner_flip_targets:
        # Keep flipped pieces in ordinary cycle tracing, including both stickers.
        flip_positions = []
    original_edge_ori = cube.edge_ori.copy()
    for position in flip_positions:
        cube.edge_ori[position] = 0
    try:
        edge_trace, edge_cycle_breaks, edge_cycles, edge_floating = cube.trace_edges(
            buffer=edge_buffer,
            buffer_orientations=edge_buffer_orientations,
            return_cycle_breaks=True,
            return_cycles=True,
            return_floating=True,
            use_pseudoswap=use_pseudoswap,
            pseudoswap_edge_1=pseudoswap_edge_1,
            pseudoswap_edge_2=pseudoswap_edge_2,
            floating_buffers=floating_buffers,
            auto_standalone=True,
            deferred_flips=flip_positions,
            flip_order=edge_flip_order,
            even_cycle_break_order=edge_even_cycle_break_order,
            odd_cycle_break_order=edge_odd_cycle_break_order,
            odd_cycle_break_overrides=edge_odd_cycle_break_overrides,
            sticker_cycle_break_order=edge_sticker_cycle_break_order
        )
    finally:
        cube.edge_ori = original_edge_ori

    two_flips = [item["two_flip"] for item in edge_floating if "two_flip" in item]
    consumed_flips = {p for pair in two_flips for p in pair}
    consumed_flips.update(item["flipped_buffer"] for item in edge_floating if "flipped_buffer" in item)
    flip_positions = [p for p in flip_positions if p not in consumed_flips]

    twist_positions = {
        orientation: [position for position, value in enumerate(cube.corner_ori)
                      if position != corner_buffer
                      and cube.corner_perm[position] == position and value == orientation]
        for orientation in (1, 2)
    }
    if beginner_twist_targets:
        # Leave twists in the cube so normal cycle tracing emits both targets,
        # respecting the user's cycle-break order and opening sticker.
        twist_positions = {1: [], 2: []}
    t2c_targets = []
    t2c_pieces = set()
    if include_t2c and not ltct_active and cube.has_parity():
        for start in range(8):
            targets, pieces, closing_ori = cube.trace_corner_cycle(start)
            if len(pieces) == 2 and closing_ori != 0:
                t2c_targets = [(start, 0)] + targets + [(start, closing_ori)]
                t2c_pieces = pieces
                break
    original_corner_perm = cube.corner_perm.copy()
    original_corner_ori = cube.corner_ori.copy()
    for positions in twist_positions.values():
        for position in positions:
            cube.corner_ori[position] = 0
    # Reserve the whole T2C cycle for the final algorithm, then trace the rest.
    for position in t2c_pieces:
        cube.corner_perm[position] = position
        cube.corner_ori[position] = 0
    try:
        corner_trace, corner_cycle_breaks, corner_cycles, corner_floating = cube.trace_corners(
            buffer=corner_buffer,
            buffer_orientations=corner_buffer_orientations,
            return_cycle_breaks=True,
            return_cycles=True,
            return_floating=True,
            floating_buffers=corner_floating_buffers,
            auto_standalone=True,
            even_cycle_break_order=corner_even_cycle_break_order,
            odd_cycle_break_order=corner_odd_cycle_break_order,
            odd_cycle_break_overrides=corner_odd_cycle_break_overrides,
            sticker_cycle_break_order=corner_sticker_cycle_break_order
        )
    finally:
        cube.corner_ori = original_corner_ori
        cube.corner_perm = original_corner_perm

    # Extend the final parity target through one unpaired twist, leaving
    # its closing sticker for LTCT. Opposite-direction twist pairs stay intact.
    if (include_parity_3twist and ltct_active and len(corner_trace) % 2
            and len(twist_positions[ltct_direction])
            - len(twist_positions[3 - ltct_direction]) >= 2):
        parity_target = format_corner_trace([corner_trace[-1]])[0]
        order = (corner_odd_cycle_break_overrides or {}).get(
            parity_target, corner_odd_cycle_break_order)
        if order is None:
            order = CORNER_BUFFER_ORDER
        position = next(p for p in order
                        if p in twist_positions[ltct_direction] and p != ltct_position)
        cycle = [(position, 0), (position, (-ltct_direction) % 3)]
        corner_trace.extend(cycle)
        corner_cycles.append(cycle)
        corner_cycle_breaks.append(position)
        twist_positions[ltct_direction].remove(position)

    # Convert each cycle to readable sticker targets
    edge_cycle_targets = [
        format_edge_trace(cycle)
        for cycle in edge_cycles
    ]

    corner_cycle_targets = [
        format_corner_trace(cycle)
        for cycle in corner_cycles
    ]

    # Convert cycle-break piece IDs to readable names
    edge_cycle_break_names = [
        EDGE_BUFFER_OPTIONS[position]
        for position in edge_cycle_breaks
    ]

    corner_cycle_break_names = [
        CORNER_BUFFER_OPTIONS[position]
        for position in corner_cycle_breaks
    ]

    flipped_edges = [EDGE_BUFFER_OPTIONS[position] for position in flip_positions]

    clockwise_twisted_corners = [CORNER_BUFFER_OPTIONS[position] for position in twist_positions[1]]
    counterclockwise_twisted_corners = [CORNER_BUFFER_OPTIONS[position] for position in twist_positions[2]]

    # Convert trace targets to readable sticker names
    edge_target_names = format_edge_trace(edge_trace)
    corner_target_names = format_corner_trace(corner_trace)

    # Convert targets to user's letters
    edge_letters = convert_to_letters(
        edge_target_names,
        letter_scheme
    )

    corner_letters = convert_to_letters(
        corner_target_names,
        letter_scheme
    )

    edge_count = len(edge_letters)
    corner_count = len(corner_letters) + len(t2c_targets)

    parity = "Yes" if cube.has_parity() else "No"

    edge_memo, edge_sandwiches = sandwich_memo(edge_trace, edge_letters, include_basic_sandwiching)
    edge_buffers_used = int(bool(edge_trace))
    corner_buffers_used = int(bool(corner_trace))
    used_buffers = {edge_buffer} if edge_trace else set()
    switches = [item for item in edge_floating if "to_buffer" in item or "two_flip" in item]
    if switches:
        edge_sandwiches = 0
        parts = []
        used_buffers = set()
        start = 0
        position = edge_buffer
        for switch in switches + [
            {"after_target": len(edge_letters), "to_buffer": None}
        ]:
            offset = switch["after_target"]
            letters = edge_letters[start:offset]
            if letters:
                used_buffers.add(position)
                segment, count = sandwich_memo(edge_trace[start:offset], letters, include_basic_sandwiching)
                edge_sandwiches += count
                if position != edge_buffer:
                    label = letter_scheme[edge_buffer_stickers[position]]
                    segment = f"[Buffer {label}] {segment}"
                parts.append(segment)
            if "two_flip" in switch:
                pairs = ["".join(convert_to_letters(format_edge_trace([(p, 0), (p, 1)]), letter_scheme))
                         for p in switch["two_flip"]]
                parts.append("[2Flip: " + " ".join(pairs) + "]")
            start = offset
            position = switch.get("to_buffer", position)
        edge_memo = " ".join(parts)
        edge_buffers_used = len(used_buffers)
    # Pair within each floating-buffer segment, never across a buffer change.
    solution_cases = []
    start, position = 0, edge_buffer
    for switch in switches + [{"after_target": len(edge_target_names)}]:
        end = switch["after_target"]
        for index in range(start, end, 2):
            targets = edge_target_names[index:min(index + 2, end)]
            solution_cases.append(dict(positions=[edge_buffer_stickers[position]] + targets,
                                       memo="".join(edge_letters[index:min(index + 2, end)])))
        start = end
        position = switch.get("to_buffer", position)
    flip_pairs = [
        "".join(convert_to_letters(format_edge_trace([(position, 0), (position, 1)]), letter_scheme))
        for position in flip_positions
    ]
    if flip_pairs:
        edge_memo = (edge_memo + " [Flips: " + " ".join(flip_pairs) + "]").strip()
    flip_alg_count = len(two_flips) + (len(flip_positions) + 1) // 2
    corner_used_buffers = {corner_buffer} if corner_trace else set()
    # The final odd corner target is executed by LTCT, so show it there.
    corner_display_letters = corner_letters.copy()
    if ltct_active:
        corner_display_letters[-1] = ""
    corner_memo, corner_sandwiches = sandwich_memo(corner_trace, corner_display_letters, include_basic_sandwiching)
    corner_memo = corner_memo.rstrip()
    corner_switches = [item for item in corner_floating if "to_buffer" in item]
    if corner_switches:
        corner_sandwiches = 0
        parts = []
        corner_used_buffers = set()
        start = 0
        position = corner_buffer
        for switch in corner_switches + [
            {"after_target": len(corner_letters), "to_buffer": None}
        ]:
            offset = switch["after_target"]
            letters = corner_display_letters[start:offset]
            if letters:
                corner_used_buffers.add(position)
                segment, count = sandwich_memo(corner_trace[start:offset], letters, include_basic_sandwiching)
                corner_sandwiches += count
                if position != corner_buffer or start > 0:
                    label = letter_scheme[corner_buffer_stickers[position]]
                    segment = f"[Buffer {label}] {segment}"
                parts.append(segment)
            start = offset
            position = switch["to_buffer"]
        corner_memo = " ".join(parts)
        corner_buffers_used = len(corner_used_buffers)

    for orientation, label in ((1, "CW Twists"), (2, "CCW Twists")):
        letters = [
            letter_scheme[CORNER_BUFFER_OPTIONS[position]]
            for position in twist_positions[orientation]
            if position != ltct_position
        ]

        if not letters:
            continue

        # ---------------------------------------------------------
        # 3-twist formatting
        # ---------------------------------------------------------
        # Only use 3-twists on non-parity scrambles.
        # If one twist direction has at least 2 more corners than
        # the other, the final two twists in that direction are
        # displayed as a 3-twist with the buffer.
        difference = (
            len(twist_positions[1]) -
            len(twist_positions[2])
        )

        use_three_twist_here = (
            include_3twist
            and parity == "No"
            and abs(difference) >= 2
            and (
                (orientation == 1 and difference > 0)
                or
                (orientation == 2 and difference < 0)
            )
            and len(letters) >= 2
        )

        if use_three_twist_here:
            normal_letters = letters[:-2]
            three_twist_letters = letters[-2:]

            if normal_letters:
                corner_memo = (
                    corner_memo
                    + f" [{label}: {format_memo(normal_letters)}]"
                ).strip()

            direction = "CW" if orientation == 1 else "CCW"

            corner_memo = (
                corner_memo
                + f" [{direction} 3-twist: {''.join(three_twist_letters)}]"
            ).strip()

        else:
            corner_memo = (
                corner_memo
                + f" [{label}: {format_memo(letters)}]"
            ).strip()
    if ltct_active:
        sticker = format_corner_trace([(ltct_position, ltct_direction)])[0]
        letter = letter_scheme[sticker]
        corner_memo = corner_memo.rstrip() + f" [LTCT: {corner_letters[-1]}[{letter}]]"
        corner_memo = corner_memo.strip()
    if t2c_targets:
        t2c_letters = convert_to_letters(format_corner_trace(t2c_targets), letter_scheme)
        corner_memo = (corner_memo.rstrip() + f" [T2C: {''.join(t2c_letters)}]").strip()
        corner_cycle_targets.append(format_corner_trace(t2c_targets))
        corner_target_names.extend(format_corner_trace(t2c_targets))
    cw_twist_count = len(twist_positions[1])
    ccw_twist_count = len(twist_positions[2])
    twist_alg_count = min(cw_twist_count, ccw_twist_count) + abs(cw_twist_count - ccw_twist_count)

    technique_buffer = corner_buffer
    for switch in corner_floating:
        if "to_buffer" in switch:
            # LTCT absorbs the last target; T2C follows the entire trace.
            if not ltct_active or switch["after_target"] < len(corner_trace):
                technique_buffer = switch["to_buffer"]

    parity_case = None
    if len(corner_trace) % 2 and not ltct_active and not t2c_targets:
        parity_buffer = corner_buffer
        for switch in corner_floating:
            if "to_buffer" in switch and switch["after_target"] < len(corner_trace):
                parity_buffer = switch["to_buffer"]
        parity_case = f"{CORNER_BUFFER_OPTIONS[parity_buffer]}_{format_corner_trace([corner_trace[-1]])[0]}"

    return dict(
        parity_case=parity_case,
        conjugacy_class=conjugacy_class,
        scramble_facelets=scramble_facelets,
        technique_buffer=technique_buffer,
        effective_pseudoswap_edges=[pseudoswap_edge_1, pseudoswap_edge_2],
        t2c_active=bool(t2c_targets),
        ltct_active=ltct_active,
        ltct_direction=ltct_direction,
        ltct_corner=CORNER_BUFFER_OPTIONS[ltct_position] if ltct_active else None,
        solution_cases=solution_cases,
        edge_memo=edge_memo,
        corner_memo=corner_memo,
        edge_count=edge_count,
        corner_count=corner_count,
        edge_buffers_used=edge_buffers_used,
        corner_buffers_used=corner_buffers_used,
        edge_buffer_names_used=[edge_buffer_stickers[position] for position in sorted(used_buffers)],
        corner_buffer_names_used=[corner_buffer_stickers[position] for position in sorted(corner_used_buffers)],
        edge_target_names=edge_target_names,
        corner_target_names=corner_target_names,
        flipped_edges=flipped_edges,
        clockwise_twisted_corners=clockwise_twisted_corners,
        counterclockwise_twisted_corners=counterclockwise_twisted_corners,
        edge_floating=edge_floating,
        corner_floating=corner_floating,
        parity=parity,
        edge_cycles=edge_cycle_targets,
        corner_cycles=corner_cycle_targets,
        edge_cycle_breaks=edge_cycle_break_names,
        corner_cycle_breaks=corner_cycle_break_names,
        target_count=edge_count + corner_count,
        two_flip_count=len(two_flips),
        flip_count=len(flip_positions) + 2 * len(two_flips),
        flip_alg_count=flip_alg_count,
        cw_twist_count=cw_twist_count,
        ccw_twist_count=ccw_twist_count,
        twist_alg_count=twist_alg_count,
        sandwich_count=edge_sandwiches + corner_sandwiches,
        alg_count=(edge_count + 1) // 2 + (len(corner_letters) + 1) // 2 + int(bool(t2c_targets)) + flip_alg_count + twist_alg_count - edge_sandwiches - corner_sandwiches - int(ltct_active),
        buffers_used=edge_buffers_used + corner_buffers_used,
    )


@app.post("/api/solution-examples")
def solution_examples():
    data = request.get_json(silent=True)
    cases = data.get("cases") if isinstance(data, dict) else None
    if not isinstance(cases, list) or len(cases) > 100:
        return jsonify(error="Provide up to 100 edge cases."), 400
    for case in cases:
        if (not isinstance(case, list) or len(case) != 3
                or any(not isinstance(position, str) or position not in POSITION_CODES for position in case)
                or len({frozenset(position) for position in case}) != 3):
            return jsonify(error="Each case must contain three distinct edge pieces."), 400
    if not cases:
        return jsonify(examples=[])
    try:
        cache = os.path.join(app.instance_path, "blddb")
        algorithms = dataset(cache, "edgeAlgToInfoManmade.json")
        standard = dataset(cache, "edgeAlgToStandard.json")
        return jsonify(examples=[edge_example(case, algorithms, standard) for case in cases])
    except (requests.RequestException, ValueError, KeyError, IndexError, TypeError, OSError):
        app.logger.warning("BLDDB example lookup unavailable", exc_info=True)
        return jsonify(error="BLDDB examples are temporarily unavailable. Your trace is still available."), 503


@app.get("/api/memo-words")
def memo_words():
    raw = request.args.get("pairs", "")
    pairs = list(dict.fromkeys(raw.split(",")))
    if len(raw) > 3000 or len(pairs) > 729 or not all(valid_pair(pair) for pair in pairs):
        return jsonify(error="Provide up to 729 two-letter pairs."), 400
    try:
        return jsonify(words=suggestions_for(pairs), censored=True, language="en")
    except (requests.RequestException, ValueError, TypeError, AttributeError):
        app.logger.warning("Censored CoLPI suggestions unavailable")
        return jsonify(error="Censored word examples are temporarily unavailable."), 503


@app.get("/api/memo-word-options")
def memo_word_options():
    pair = request.args.get("pair", "")
    if not valid_pair(pair):
        return jsonify(error="Provide one two-letter pair."), 400
    try:
        return jsonify(pair=pair, words=alternatives_for(pair), censored=True)
    except (requests.RequestException, ValueError, TypeError, AttributeError):
        return jsonify(error="Word alternatives are temporarily unavailable."), 503


def preset_connection():
    postgres = postgres_connection(app.config)
    if postgres is not None:
        return postgres
    path = app.config["PRESET_DATABASE"]
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    connection = sqlite3.connect(path)
    connection.row_factory = sqlite3.Row
    connection.execute("""CREATE TABLE IF NOT EXISTS settings_presets (
        id INTEGER PRIMARY KEY, user_id TEXT NOT NULL, name TEXT NOT NULL,
        settings TEXT NOT NULL, UNIQUE(user_id, name))""")
    connection.execute("""CREATE TABLE IF NOT EXISTS memo_word_choices (
        user_id TEXT NOT NULL, pair TEXT NOT NULL, word TEXT NOT NULL,
        PRIMARY KEY (user_id, pair))""")
    return connection


@app.context_processor
def memo_account_context():
    signed_in = bool((session.get("wca_user") or {}).get("id"))
    token = session.setdefault("memo_word_csrf", secrets.token_urlsafe(32)) if signed_in else ""
    return dict(memo_signed_in=signed_in, memo_word_csrf=token)


@app.route("/api/memo-word-choices", methods=["GET", "PUT", "DELETE"])
def memo_word_choices():
    user_id = (session.get("wca_user") or {}).get("id")
    if not user_id:
        return jsonify(error="Sign in with WCA to save word choices."), 401
    if request.method != "GET":
        token = request.headers.get("X-Memo-CSRF", "")
        if not token or not secrets.compare_digest(token, session.get("memo_word_csrf", "")):
            return jsonify(error="Refresh the page before saving word choices."), 403
        if request.content_length and request.content_length > 4096:
            return jsonify(error="Word choice is too large."), 400
        data = request.get_json(silent=True)
        if not isinstance(data, dict) or not valid_pair(data.get("pair")):
            return jsonify(error="Provide one two-letter pair."), 400
        word = data.get("word")
        if request.method == "PUT" and (not isinstance(word, str) or not 1 <= len(word.strip()) <= 120):
            return jsonify(error="Enter a word between 1 and 120 characters."), 400
    try:
        with closing(preset_connection()) as connection, connection:
            if request.method == "GET":
                rows = connection.execute("SELECT pair, word FROM memo_word_choices WHERE user_id = ?", (str(user_id),)).fetchall()
                return jsonify(words={row["pair"]: row["word"] for row in rows})
            if request.method == "DELETE":
                connection.execute("DELETE FROM memo_word_choices WHERE user_id = ? AND pair = ?", (str(user_id), data["pair"]))
            else:
                connection.execute("""INSERT INTO memo_word_choices (user_id, pair, word) VALUES (?, ?, ?)
                    ON CONFLICT (user_id, pair) DO UPDATE SET word = excluded.word""",
                    (str(user_id), data["pair"], word.strip()))
        return jsonify(saved=True)
    except DATABASE_ERRORS as error:
        app.logger.warning("Memo choice storage unavailable (%s)", type(error).__name__)
        return jsonify(error="Account word choices are temporarily unavailable. You can still use a word on this page."), 503


@app.route("/api/settings-presets", methods=["GET", "POST"])
@preset_database_errors
def settings_presets():
    user = session.get("wca_user") or {}
    if not user.get("id"):
        return jsonify(error="Sign in with WCA to use profile presets."), 401
    user_id = str(user["id"])
    if request.method == "GET":
        with closing(preset_connection()) as connection:
            rows = connection.execute("SELECT id, name, settings FROM settings_presets WHERE user_id = ? ORDER BY name", (user_id,)).fetchall()
        return jsonify(presets=[dict(id=row["id"], name=row["name"], settings=json.loads(row["settings"])) for row in rows])
    token = request.headers.get("X-Preset-CSRF", "")
    if not token or not secrets.compare_digest(token, session.get("preset_csrf", "")):
        return jsonify(error="Refresh the page before saving your preset."), 403
    if request.content_length and request.content_length > 200000:
        return jsonify(error="Settings preset is too large."), 400
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify(error="Enter a preset name and settings."), 400
    name, settings = data.get("name"), data.get("settings")
    if not isinstance(name, str) or not 1 <= len(name.strip()) <= 80:
        return jsonify(error="Use a preset name between 1 and 80 characters."), 400
    if (not isinstance(settings, dict) or settings.get("mode") not in ("beginner", "expert")
            or not isinstance(settings.get("fields"), dict)
            or not isinstance(settings.get("orders"), dict)):
        return jsonify(error="Invalid settings preset."), 400
    for key, values in {**settings["fields"], **settings["orders"]}.items():
        if (len(key) > 100 or not isinstance(values, list) or len(values) > 100
                or any(not isinstance(value, str) or len(value) > 100 for value in values)):
            return jsonify(error="Invalid settings values."), 400
    for key in ("colors", "orientation"):
        colors = settings.get(key)
        if (not isinstance(colors, dict) or set(colors) != set("UFRBLD")
                or any(not isinstance(value, str) or not re.fullmatch(r"#[0-9a-fA-F]{6}", value) for value in colors.values())):
            return jsonify(error="Invalid cube colors."), 400
    with closing(preset_connection()) as connection, connection:
        if connection.execute("SELECT count(*) AS count FROM settings_presets WHERE user_id = ?", (user_id,)).fetchone()["count"] >= 30:
            return jsonify(error="Your profile can hold up to 30 presets."), 400
        try:
            preset_id = insert_preset(connection, user_id, name.strip(), json.dumps(settings))
        except UNIQUE_ERRORS:
            connection.rollback()
            return jsonify(error="That preset name already exists. Choose a new name."), 409
    return jsonify(id=preset_id, name=name.strip(), settings=settings), 201


@app.route("/beginner", methods=["GET", "POST"], endpoint="beginner", defaults={"beginner": True})
@app.route("/expert", methods=["GET", "POST"], endpoint="expert")
@app.route("/", methods=["GET", "POST"])
def home(beginner=False):
    if request.path == "/" and request.method == "GET":
        return redirect(url_for("beginner"))
    session.setdefault("preset_csrf", secrets.token_urlsafe(32))
    form = request.form
    if beginner:
        # Only settings offered on this page may affect beginner solves.
        allowed = {"scramble", "bulk_scrambles", "action", "edge_buffer", "corner_buffer",
                   "use_pseudoswap", "pseudoswap_edge_1", "pseudoswap_edge_2", "beginner_method"}
        allowed.update(f"letter_{target}" for target in EDGE_TARGETS + CORNER_TARGETS)
        allowed.update(f"{kind}_even_cycle_break_order" for kind in ("edge", "corner"))
        allowed.update({"beginner_cycle_order_mode", "edge_sticker_cycle_break_order", "corner_sticker_cycle_break_order",
                        "beginner_edge_helpers", "beginner_corner_helpers", "beginner_prioritize_helpers",
                        "beginner_memo_order", "beginner_execution_order"})
        form = form.copy()
        for key in list(form):
            if key not in allowed:
                del form[key]
    beginner_memo_order = form.get('beginner_memo_order', 'corners') if beginner else 'edges'
    beginner_execution_order = form.get('beginner_execution_order', 'edges') if beginner else 'edges'
    if beginner_memo_order not in ('corners', 'edges'):
        beginner_memo_order = 'corners' if beginner else 'edges'
    if beginner_execution_order not in ('corners', 'edges'):
        beginner_execution_order = 'edges'
    default_edge_buffer = UR if beginner else UF
    default_corner_buffer = UBL if beginner else UFR
    edge_buffer = default_edge_buffer
    corner_buffer = default_corner_buffer
    edge_buffer_sticker = EDGE_BUFFER_OPTIONS[edge_buffer]
    corner_buffer_sticker = CORNER_BUFFER_OPTIONS[corner_buffer]
    buffer_sticker_choices = {kind: {piece: stickers[0] for piece, stickers in groups.items()}
                              for kind, groups in BUFFER_STICKERS.items()}
    edge_floating_order = EDGE_BUFFER_OPTIONS.copy()
    enabled_edge_floating = []
    corner_floating_order = CORNER_BUFFER_OPTIONS.copy()
    enabled_corner_floating = []

    edge_memo = None
    corner_memo = None

    edge_count = None
    corner_count = None
    edge_buffers_used = 0
    corner_buffers_used = 0

    edge_target_names = None
    corner_target_names = None

    edge_cycle_targets = []
    corner_cycle_targets = []

    edge_cycle_break_names = []
    corner_cycle_break_names = []

    flipped_edges = []
    clockwise_twisted_corners = []
    counterclockwise_twisted_corners = []

    edge_floating = []
    corner_floating = []

    parity = None

    use_pseudoswap = False
    pseudoswap_edge_1 = UB if beginner else UF
    pseudoswap_edge_2 = UL if beginner else UR

    scramble = ""
    bulk_scrambles = form.get("bulk_scrambles", "")
    bulk_results = []
    include_t2c = form.get("include_t2c") == "on"
    include_ltct = form.get("include_ltct") == "on"
    include_parity_3twist = form.get("include_parity_3twist") == "on"
    include_basic_sandwiching = form.get("include_basic_sandwiching") == "on"
    include_3twist = form.get("include_3twist") == "on"
    bulk_stats = None
    edge_break_order = [EDGE_BUFFER_OPTIONS[i] for i in EDGE_BUFFER_ORDER]
    corner_break_order = [CORNER_BUFFER_OPTIONS[i] for i in CORNER_BUFFER_ORDER]
    odd_break_overrides = dict(edge={}, corner={})
    beginner_method = form.get("beginner_method", "custom") if beginner else "custom"
    if beginner_method not in ("custom", "op_op", "op_op_ufr", "m2_op"):
        beginner_method = "custom"
    if beginner and form.get("edge_buffer") in (str(DF), "DF"):
        edge_break_order = ["UB"] + [name for name in edge_break_order if name != "UB"]
    odd_break_orders = dict(edge=edge_break_order.copy(), corner=corner_break_order.copy())
    beginner_cycle_order_mode = form.get("beginner_cycle_order_mode", "piece") if beginner else "piece"
    beginner_helpers = {kind: form.getlist(f"beginner_{kind}_helpers") if beginner else []
                        for kind in ("edge", "corner")}
    beginner_prioritize_helpers = beginner and form.get("beginner_prioritize_helpers") == "on"
    default_sticker_orders = {
        "edge": format_edge_trace([(p, o) for p in EDGE_BUFFER_ORDER for o in range(2)]),
        "corner": format_corner_trace([(p, o) for p in CORNER_BUFFER_ORDER for o in range(3)]),
    }
    sticker_orders = {kind: order.copy() for kind, order in default_sticker_orders.items()}
    if beginner and form.get("edge_buffer") in (str(DF), "DF"):
        sticker_orders["edge"].remove("UB")
        sticker_orders["edge"].insert(0, "UB")
    parity_pseudoswaps = {}
    trace_result = {}

    error = None

    # Start with Speffz
    letter_scheme = SPEFFZ.copy()

    if request.method == "POST":
        scramble = form.get("scramble", "").strip()

        # Get pseudoswap settings from form
        use_pseudoswap = form.get("use_pseudoswap") == "on"

        pseudoswap_edge_1 = int(
            form.get("pseudoswap_edge_1", pseudoswap_edge_1)
        )

        pseudoswap_edge_2 = int(
            form.get("pseudoswap_edge_2", pseudoswap_edge_2)
        )

        # Read the user's custom letters
        for target in EDGE_TARGETS + CORNER_TARGETS:
            letter = form.get(
                f"letter_{target}",
                SPEFFZ[target]
            ).strip().upper()

            letter_scheme[target] = letter

        try:
            edge_buffer, edge_buffer_sticker = parse_buffer(form.get("edge_buffer", default_edge_buffer), "edge")
            corner_buffer, corner_buffer_sticker = parse_buffer(form.get("corner_buffer", default_corner_buffer), "corner")
            for kind, groups in BUFFER_STICKERS.items():
                for piece, stickers in groups.items():
                    selected = form.get(f"{kind}_buffer_sticker_{piece}", piece)
                    if selected not in stickers:
                        raise ValueError(f"Invalid {kind} buffer sticker.")
                    buffer_sticker_choices[kind][piece] = selected
            buffer_sticker_choices["edge"][EDGE_BUFFER_OPTIONS[edge_buffer]] = edge_buffer_sticker
            buffer_sticker_choices["corner"][CORNER_BUFFER_OPTIONS[corner_buffer]] = corner_buffer_sticker
            for kind, targets in (("edge", EDGE_TARGETS), ("corner", CORNER_TARGETS)):
                if any(target not in targets for target in beginner_helpers[kind]):
                    raise ValueError(f"Invalid {kind} helper sticker.")
            if beginner_cycle_order_mode not in ("piece", "sticker"):
                raise ValueError("Invalid cycle-break ordering mode.")
            if beginner and beginner_cycle_order_mode == "sticker":
                for kind, targets in (("edge", EDGE_TARGETS), ("corner", CORNER_TARGETS)):
                    submitted = form.getlist(f"{kind}_sticker_cycle_break_order")
                    if submitted:
                        if len(submitted) != len(targets) or set(submitted) != set(targets):
                            raise ValueError(f"Invalid {kind} sticker cycle-break order.")
                        sticker_orders[kind] = submitted
            for kind, options in (("edge", EDGE_BUFFER_OPTIONS), ("corner", CORNER_BUFFER_OPTIONS)):
                submitted = form.getlist(f"{kind}_even_cycle_break_order")
                if submitted:
                    if len(submitted) != len(options) or set(submitted) != set(options):
                        raise ValueError(f"Invalid {kind} even cycle-break order.")
                    if kind == "edge":
                        edge_break_order = submitted
                    else:
                        corner_break_order = submitted
            if beginner:
                # Beginners choose one piece priority for the entire solve.
                odd_break_orders = dict(edge=edge_break_order.copy(), corner=corner_break_order.copy())
            for kind, options in (("edge", EDGE_BUFFER_OPTIONS), ("corner", CORNER_BUFFER_OPTIONS)):
                submitted = form.getlist(f"{kind}_odd_cycle_break_order")
                if submitted:
                    if len(submitted) != len(options) or set(submitted) != set(options):
                        raise ValueError(f"Invalid {kind} odd cycle-break order.")
                    odd_break_orders[kind] = submitted
            for kind, targets, options in (("edge", EDGE_TARGETS, EDGE_BUFFER_OPTIONS), ("corner", CORNER_TARGETS, CORNER_BUFFER_OPTIONS)):
                for target in targets:
                    if form.get(f"{kind}_odd_override_{target}_enabled") != "on":
                        continue
                    order = form.getlist(f"{kind}_odd_override_{target}")
                    if len(order) != len(options) or set(order) != set(options):
                        raise ValueError(f"Invalid {kind} cycle-break order for {target}.")
                    odd_break_overrides[kind][target] = order
            for key in PARITY_CASE_KEYS:
                first = form.get(f"parity_{key}_first", "")
                second = form.get(f"parity_{key}_second", "")
                if first or second:
                    if (first not in [str(i) for i in range(12)]
                            or second not in [str(i) for i in range(12)] or first == second):
                        raise ValueError(f"Select two different edges for parity case {key}, or leave both as Default.")
                    parity_pseudoswaps[key] = [int(first), int(second)]
            submitted_corner_order = form.getlist("corner_floating_order")
            if submitted_corner_order:
                if (len(submitted_corner_order) != len(CORNER_BUFFER_OPTIONS)
                        or set(submitted_corner_order) != set(CORNER_BUFFER_OPTIONS)):
                    raise ValueError("Invalid corner floating buffer order.")
                corner_floating_order = submitted_corner_order
            enabled_corner_floating = form.getlist("corner_floating_buffers")
            if any(name not in CORNER_BUFFER_OPTIONS for name in enabled_corner_floating):
                raise ValueError("Invalid corner floating buffer.")
            enabled_corner_floating = list(dict.fromkeys(
                enabled_corner_floating + [CORNER_BUFFER_OPTIONS[corner_buffer]]
            ))
            submitted_order = form.getlist("edge_floating_order")
            if submitted_order:
                if (len(submitted_order) != len(EDGE_BUFFER_OPTIONS)
                        or set(submitted_order) != set(EDGE_BUFFER_OPTIONS)):
                    raise ValueError("Invalid edge floating buffer order.")
                edge_floating_order = submitted_order
            enabled_edge_floating = form.getlist("edge_floating_buffers")
            if any(name not in EDGE_BUFFER_OPTIONS for name in enabled_edge_floating):
                raise ValueError("Invalid edge floating buffer.")
            # The primary checkbox is disabled in the UI, but still marks
            # where the usable portion of the priority order begins.
            primary_edge = EDGE_BUFFER_OPTIONS[edge_buffer]
            enabled_edge_floating = list(dict.fromkeys(enabled_edge_floating + [primary_edge]))
            floating_buffers = [
                EDGE_BUFFER_OPTIONS.index(name) for name in edge_floating_order
                if name in enabled_edge_floating
            ]
            def helper_priority(order, kind, sticker_mode=False):
                if not beginner_prioritize_helpers:
                    return order
                # Stable partition: keep the user's order within both groups.
                helpers = set(beginner_helpers[kind])
                if not sticker_mode:
                    helpers = {"".join(sorted(target)) for target in helpers}
                return sorted(order, key=lambda target: (
                    target if sticker_mode else "".join(sorted(target))) not in helpers)

            settings = dict(
                beginner_flip_targets=beginner,
                beginner_twist_targets=beginner,
                edge_buffer_orientations={p: BUFFER_STICKERS["edge"][piece].index(buffer_sticker_choices["edge"][piece])
                                          for p, piece in enumerate(EDGE_BUFFER_OPTIONS)},
                corner_buffer_orientations={p: BUFFER_STICKERS["corner"][piece].index(buffer_sticker_choices["corner"][piece])
                                            for p, piece in enumerate(CORNER_BUFFER_OPTIONS)},
                edge_sticker_cycle_break_order=helper_priority(sticker_orders["edge"], "edge", True) if beginner_cycle_order_mode == "sticker" else None,
                corner_sticker_cycle_break_order=helper_priority(sticker_orders["corner"], "corner", True) if beginner_cycle_order_mode == "sticker" else None,
                edge_odd_cycle_break_overrides={target: [EDGE_BUFFER_OPTIONS.index(name) for name in order] for target, order in odd_break_overrides["edge"].items()},
                corner_odd_cycle_break_overrides={target: [CORNER_BUFFER_OPTIONS.index(name) for name in order] for target, order in odd_break_overrides["corner"].items()},
                edge_odd_cycle_break_order=[EDGE_BUFFER_OPTIONS.index(name) for name in helper_priority(odd_break_orders["edge"], "edge")],
                corner_odd_cycle_break_order=[CORNER_BUFFER_OPTIONS.index(name) for name in helper_priority(odd_break_orders["corner"], "corner")],
                edge_even_cycle_break_order=[EDGE_BUFFER_OPTIONS.index(name) for name in helper_priority(edge_break_order, "edge")],
                corner_even_cycle_break_order=[CORNER_BUFFER_OPTIONS.index(name) for name in helper_priority(corner_break_order, "corner")],
                parity_pseudoswaps=parity_pseudoswaps,
                include_3twist=include_3twist,
                include_t2c=include_t2c,
                include_ltct=include_ltct,
                include_parity_3twist=include_parity_3twist,
                include_basic_sandwiching=include_basic_sandwiching,
                edge_buffer=edge_buffer, corner_buffer=corner_buffer,
                use_pseudoswap=use_pseudoswap,
                pseudoswap_edge_1=pseudoswap_edge_1,
                pseudoswap_edge_2=pseudoswap_edge_2,
                floating_buffers=floating_buffers, letter_scheme=letter_scheme,
                edge_flip_order=[EDGE_BUFFER_OPTIONS.index(name) for name in edge_floating_order],
                corner_floating_buffers=[
                    CORNER_BUFFER_OPTIONS.index(name) for name in corner_floating_order
                    if name in enabled_corner_floating
                ],
            )
            if form.get("action") == "bulk":
                lines = [(number, line.strip()) for number, line in
                         enumerate(bulk_scrambles.splitlines(), 1) if line.strip()]
                if not lines:
                    raise ValueError("Enter at least one scramble, one per line.")
                if len(lines) > 10000:
                    raise ValueError("Please enter at most 3,000 scrambles per batch.")
                for number, line in lines:
                    # Strip pasted list labels, not digits within move notation.
                    line = re.sub(r"^\d+[.)]\s*", "", line).strip()
                    row = dict(line_number=number, scramble=line)
                    try:
                        if not line:
                            raise ValueError("Missing scramble after list number.")
                        row.update(trace_scramble(line, **settings))
                    except ValueError as exc:
                        row["error"] = str(exc)
                    bulk_results.append(row)
                valid = [row for row in bulk_results if "error" not in row]
                if valid:
                    metrics = ("edge_count", "corner_count", "target_count",
                               "alg_count", "edge_buffers_used", "corner_buffers_used",
                               "buffers_used")
                    bulk_stats = {key: sum(row[key] for row in valid) / len(valid)
                                  for key in metrics}
                    bulk_stats.update(
                        count=len(valid), failed=len(lines) - len(valid),
                        parity_percent=100 * sum(row["parity"] == "Yes" for row in valid) / len(valid),
                        min_targets=min(row["target_count"] for row in valid),
                        max_targets=max(row["target_count"] for row in valid),
                        t2c_count=sum(row["t2c_active"] for row in valid),
                        ltct_count=sum(row["ltct_active"] for row in valid),
                        sandwich_count=sum(row["sandwich_count"] for row in valid),
                        sandwich_scrambles=sum(row["sandwich_count"] > 0 for row in valid),
                    )
                    for kind, options in (("edge", EDGE_BUFFER_OPTIONS),
                                          ("corner", CORNER_BUFFER_OPTIONS)):
                        usage = []
                        for piece in options:
                            name = buffer_sticker_choices[kind][piece]
                            count = sum(name in row[f"{kind}_buffer_names_used"] for row in valid)
                            usage.append(dict(name=name, count=count,
                                              percent=100 * count / len(valid)))
                        bulk_stats[f"{kind}_buffer_usage"] = usage
            else:
                trace_result = trace_scramble(scramble, **settings)
                # Draw the actual scramble, before any tracing-only pseudoswap.
                preview_cube = Cube()
                preview_cube.apply_scramble(scramble)
                trace_result["scrambled_sticker_faces"] = {
                    formatter([(position, slot)])[0]: formatter([
                        (piece, (slot - orientations[position]) % modulus)
                    ])[0][0]
                    for permutation, orientations, formatter, modulus in (
                        (preview_cube.edge_perm, preview_cube.edge_ori, format_edge_trace, 2),
                        (preview_cube.corner_perm, preview_cube.corner_ori, format_corner_trace, 3),
                    )
                    for position, piece in enumerate(permutation)
                    for slot in range(modulus)
                }

        except ValueError as e:
            error = str(e)

    context = dict(
        buffer_stickers=BUFFER_STICKERS, buffer_sticker_choices=buffer_sticker_choices,
        edge_buffer_sticker=edge_buffer_sticker, corner_buffer_sticker=corner_buffer_sticker,
        beginner_memo_order=beginner_memo_order, beginner_execution_order=beginner_execution_order,
        default_edge_buffer=default_edge_buffer, default_corner_buffer=default_corner_buffer,
        odd_break_overrides=odd_break_overrides,
        odd_break_orders=odd_break_orders,
        edge_break_order=edge_break_order, corner_break_order=corner_break_order,
        beginner_helpers=beginner_helpers, beginner_prioritize_helpers=beginner_prioritize_helpers,
        beginner_cycle_order_mode=beginner_cycle_order_mode,
        sticker_orders=sticker_orders, default_sticker_orders=default_sticker_orders,
        default_edge_break_order=[EDGE_BUFFER_OPTIONS[i] for i in EDGE_BUFFER_ORDER],
        default_corner_break_order=[CORNER_BUFFER_OPTIONS[i] for i in CORNER_BUFFER_ORDER],
        parity_cases=parity_case_groups(corner_floating_order, CORNER_BUFFER_OPTIONS[corner_buffer], include_hidden=True), parity_pseudoswaps=parity_pseudoswaps,
        include_3twist=include_3twist,
        include_t2c=include_t2c,
        include_ltct=include_ltct,
        include_parity_3twist=include_parity_3twist,
        include_basic_sandwiching=include_basic_sandwiching,
        scramble=scramble,

        edge_memo=edge_memo,
        corner_memo=corner_memo,
        edge_count=edge_count,
        corner_count=corner_count,
        edge_buffers_used=edge_buffers_used,
        corner_buffers_used=corner_buffers_used,

        edge_target_names=edge_target_names,
        corner_target_names=corner_target_names,
        edge_targets=EDGE_TARGETS,
        corner_targets=CORNER_TARGETS,

        edge_buffer_options=EDGE_BUFFER_OPTIONS,
        corner_buffer_options=CORNER_BUFFER_OPTIONS,
        edge_buffer=edge_buffer,
        edge_floating_order=edge_floating_order,
        enabled_edge_floating=enabled_edge_floating,
        corner_floating_order=corner_floating_order,
        enabled_corner_floating=enabled_corner_floating,
        corner_buffer=corner_buffer,

        edge_cycles=edge_cycle_targets,
        corner_cycles=corner_cycle_targets,

        edge_cycle_breaks=edge_cycle_break_names,
        corner_cycle_breaks=corner_cycle_break_names,

        flipped_edges=flipped_edges,
        clockwise_twisted_corners=clockwise_twisted_corners,
        counterclockwise_twisted_corners=counterclockwise_twisted_corners,

        edge_floating=edge_floating,
        corner_floating=corner_floating,

        parity=parity,
        
        letter_scheme=letter_scheme,
        SPEFFZ=SPEFFZ,

        use_pseudoswap=use_pseudoswap,
        pseudoswap_edge_1=pseudoswap_edge_1,
        pseudoswap_edge_2=pseudoswap_edge_2,

        error=error,

        wca_user=session.get("wca_user")
    )
    context.update(trace_result)
    if beginner:
        context['beginner_parity_algorithm'] = (
            OP_PARITY_ALGORITHMS.get((EDGE_BUFFER_OPTIONS[edge_buffer], CORNER_BUFFER_OPTIONS[corner_buffer]))
            if trace_result.get('parity') == 'Yes' else None)
        context['beginner_op_supported'] = edge_buffer == UR
        context['beginner_corner_op_supported'] = corner_buffer == UBL
        context['beginner_corner_solution_examples'] = (
            op_corner_examples(trace_result.get('corner_target_names', []), letter_scheme, corner_buffer_sticker)
            if corner_buffer == UBL else [])
        context['beginner_solution_examples'] = (
            op_edge_examples(trace_result.get('edge_target_names', []), letter_scheme, edge_buffer_sticker)
            if edge_buffer == UR else [])
    if bulk_results:
        if beginner:
            context["bulk_distributions"] = beginner_distributions(bulk_results)
        metadata = dict(beginner=beginner, bulk_stats=bulk_stats, bulk_total=len(bulk_results),
                        include_basic_sandwiching=include_basic_sandwiching,
                        include_ltct=include_ltct,
                        include_parity_3twist=include_parity_3twist, include_t2c=include_t2c)
        if beginner:
            metadata["bulk_distributions"] = context["bulk_distributions"]
        try:
            batch_id = save_bulk_batch(bulk_results, metadata)
        except DATABASE_ERRORS as error:
            app.logger.warning("Bulk storage unavailable (%s)", type(error).__name__)
            batch_id = None
            context["bulk_storage_warning"] = (
                "These results could not be saved because storage is unavailable. "
                "Your traces and statistics are shown below, but saved-batch filtering "
                "and sorting are unavailable. Keep this page open or copy your results.")
        context.update(bulk_batch_id=batch_id,
                       bulk_total=len(bulk_results),
                       bulk_alg_counts=sorted({row["alg_count"] for row in bulk_results if "error" not in row}),
                       bulk_alg_filter="", bulk_sort="original")
    context["bulk_history_warning"] = annotate_bulk_history(bulk_results)
    return render_template("index.html", beginner=beginner, beginner_method=beginner_method, **context, bulk_scrambles=bulk_scrambles,
                           bulk_results=bulk_results, bulk_stats=bulk_stats)

@app.route("/auth/wca")
def wca_login():
    if not os.environ.get("WCA_CLIENT_ID") or not os.environ.get("WCA_CLIENT_SECRET"):
        return "Set WCA_CLIENT_ID and WCA_CLIENT_SECRET before signing in.", 503
    # Set the state cookie on the same origin that receives the callback.
    callback = urlsplit(WCA_REDIRECT_URI)
    origin = f"{callback.scheme}://{callback.netloc}"
    if request.host_url.rstrip("/") != origin:
        return redirect(origin + url_for("wca_login", **({'memo': '1'} if request.args.get('memo') == '1' else {})))
    state = secrets.token_urlsafe(32)
    session["wca_oauth_state"] = state
    session["wca_memo_login"] = request.args.get("memo") == "1"
    return redirect("https://www.worldcubeassociation.org/oauth/authorize?" + urlencode({
        "client_id": os.environ["WCA_CLIENT_ID"],
        "redirect_uri": WCA_REDIRECT_URI,
        "response_type": "code",
        "scope": "public",
        "state": state,
    }))


@app.route("/auth/wca/callback")
def wca_callback():
    expected_state = session.pop("wca_oauth_state", None)
    state = request.args.get("state", "")
    if not expected_state or not secrets.compare_digest(expected_state, state):
        return "Invalid or expired WCA sign-in attempt. Please sign in again.", 400
    if request.args.get("error"):
        return "WCA authorization was declined or could not be completed.", 400
    code = request.args.get("code")

    if not code:
        return "WCA did not provide an authorization code.", 400

    token_response = requests.post(
        "https://www.worldcubeassociation.org/oauth/token",
        data={
            "grant_type": "authorization_code",
            "client_id": os.environ["WCA_CLIENT_ID"],
            "client_secret": os.environ["WCA_CLIENT_SECRET"],
            "code": code,
            "redirect_uri": WCA_REDIRECT_URI,
        },
        timeout=10,
    )

    if not token_response.ok:
        return {
            "error": "Could not obtain WCA access token.",
            "details": token_response.text,
        }, 400

    token_data = token_response.json()

    access_token = token_data["access_token"]

    user_response = requests.get(
        "https://www.worldcubeassociation.org/api/v0/me",
        headers={
            "Authorization": f"Bearer {access_token}"
        },
        timeout=10,
    )

    if not user_response.ok:
        return {
            "error": "Could not retrieve WCA user.",
            "details": user_response.text,
        }, 400

    user_data = user_response.json()

    wca_user = user_data["me"]

    session["wca_user"] = {
        "id": wca_user["id"],
        "name": wca_user["name"],
        "wca_id": wca_user.get("wca_id"),
        "avatar_url": wca_user["avatar"]["thumb_url"],
    }

    if session.pop("wca_memo_login", False):
        return redirect(url_for("wca_memo_complete"))
    return redirect("/")


@app.get("/auth/wca/memo-complete")
def wca_memo_complete():
    return render_template("memo_login_complete.html")


@app.get("/api/memo-word-session")
def memo_word_session():
    signed_in = bool((session.get("wca_user") or {}).get("id"))
    token = session.setdefault("memo_word_csrf", secrets.token_urlsafe(32)) if signed_in else ""
    response = jsonify(signed_in=signed_in, csrf=token)
    response.headers['Cache-Control'] = 'no-store'
    return response

@app.route("/logout")
def logout():
    session.pop("wca_user", None)
    return redirect("/")

def get_3bld_history(wca_id):
    with closing(get_db_connection()) as connection:
        with closing(connection.cursor(dictionary=True)) as cursor:
            cursor.execute(THREE_BLIND_SQL, (wca_id,))
            history = cursor.fetchall()

    grouped_history = []

    for row in history:
        attempt_key = (
            row["competition_id"],
            row["round_type_id"],
            row["attempt_number"]
        )

        if (
            not grouped_history
            or grouped_history[-1]["key"] != attempt_key
        ):
            grouped_history.append({
                "key": attempt_key,
                "competition_name": row["competition_name"],
                "competition_id": row["competition_id"],
                "year": row["year"],
                "month": row["month"],
                "day": row["day"],
                "round_type_id": row["round_type_id"],
                "attempt_number": row["attempt_number"],
                "value": row["value"],
                "scrambles": []
            })

        if row["scramble"]:
            grouped_history[-1]["scrambles"].append({
                "group_id": row["group_id"],
                "scramble": row["scramble"]
            })

    return grouped_history

def get_multiblind_history(wca_id):
    # Attendance is any recorded event result, not only multi-blind participation.
    # Each scramble record is an attempt containing newline-separated cubes.
    with closing(get_db_connection()) as connection:
        with closing(connection.cursor(dictionary=True)) as cursor:
            cursor.execute(multiblind_sql(isinstance(connection, PostgresConnection)), ("333mbf", wca_id))
            rows = cursor.fetchall()
    attempts = []
    for row in rows:
        cubes = [line.strip() for line in (row["scramble"] or "").splitlines() if line.strip()]
        attempts.append(dict(row, attempt_number=row["scramble_num"], scrambles=[
            dict(cube_number=number, scramble=scramble)
            for number, scramble in enumerate(cubes, 1)
        ]))
    return attempts


@app.post("/api/conjugacy-state")
def conjugacy_state():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify(error="Enter a conjugacy class."), 400
    try:
        cube = generate_state(data.get("conjugacy_class"))
        if cube.is_solved():
            raise ValueError("This class describes a solved cube. Include at least one unsolved cycle for practice.")
    except ValueError as error:
        return jsonify(error=str(error)), 400
    facelets = to_facelets(cube)
    classification = cube.conjugacy_class()
    token = URLSafeTimedSerializer(app.secret_key, salt="conjugacy-practice").dumps(
        {"facelets": facelets, "class": classification})
    return jsonify(facelets=facelets, conjugacy_class=classification, token=token)


@app.post("/api/conjugacy-verify")
def conjugacy_verify():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify(error="Missing generated scramble."), 400
    scramble, token = data.get("scramble"), data.get("token")
    if not isinstance(scramble, str) or len(scramble) > 1000 or not isinstance(token, str) or len(token) > 2000:
        return jsonify(error="Invalid scramble verification request."), 400
    try:
        expected = URLSafeTimedSerializer(app.secret_key, salt="conjugacy-practice").loads(token, max_age=300)
    except BadData:
        return jsonify(error="This generation request expired. Please generate another scramble."), 400
    try:
        cube = Cube()
        cube.apply_scramble(scramble)
    except ValueError:
        return jsonify(error="The solver returned invalid moves. Please try again."), 400
    if to_facelets(cube) != expected["facelets"] or cube.conjugacy_class() != expected["class"]:
        return jsonify(error="The scramble did not match the requested state. Please try again."), 400
    return jsonify(scramble=scramble, conjugacy_class=expected["class"])


@app.route("/my-3bld-history")
@app.route("/my-official-solve-history")
def my_3bld_history():
    wca_user = session.get("wca_user")

    lookup_id = request.args.get("wca_id", "").strip().upper()
    history_view = request.args.get("view", "other" if lookup_id else "mine")
    if history_view not in ("mine", "other"):
        abort(400, description="Unsupported history view.")
    if history_view == "mine" and not wca_user:
        return redirect(url_for("wca_login"))
    wca_id = (wca_user or {}).get("wca_id") if history_view == "mine" else lookup_id
    event = request.args.get("event", "333bf")
    if event not in ("333bf", "333mbf"):
        abort(400, description="Unsupported history event.")
    history_error = None
    history = []
    status = 200
    if history_view == "mine" and not wca_id:
        history_error = "Your WCA account does not have a WCA ID yet. You can search another person's history below."
        status = 400
    elif history_view == "other" and not lookup_id:
        if "wca_id" in request.args:
            history_error = "Enter a WCA ID to search for someone's history."
            status = 400
    elif history_view == "other" and not re.fullmatch(r"[0-9]{4}[A-Z]{4}[0-9]{2}", lookup_id):
        history_error = "Enter a valid WCA ID, such as 2015CHER07 (4 digits, 4 letters, 2 digits)."
        status = 400
    else:
        try:
            history = get_multiblind_history(wca_id) if event == "333mbf" else get_3bld_history(wca_id)
        except HISTORY_DATABASE_ERRORS:
            app.logger.warning("Official history database unavailable")
            history_error = "Official solve history is temporarily unavailable. Please try again later."

    # Preserve the query's newest-first order, even when competitions share a date.
    competitions = {}
    for attempt in history:
        competition = competitions.setdefault(attempt["competition_id"], {
            "id": attempt["competition_id"], "name": attempt["competition_name"],
            "year": attempt["year"], "month": attempt["month"], "day": attempt["day"],
            "attempts": [],
        })
        competition["attempts"].append(attempt)

    return render_template(
        "history.html",
        wca_user=wca_user, competitions=list(competitions.values()),
        history=history, event=event, history_error=history_error,
        history_view=history_view, lookup_id=lookup_id, viewed_wca_id=wca_id,
    ), status

if __name__ == "__main__":
    app.run(debug=True, port=5001)
