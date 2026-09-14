import os
import json
import sqlite3
from contextlib import closing
import re
import secrets
from urllib.parse import urlencode
import requests
import mysql.connector

from flask import abort, Flask, render_template, request, redirect, session, url_for

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
app.secret_key = os.environ.get("FLASK_SECRET_KEY") or secrets.token_hex(32)
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
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


def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        database="wca_results"
    )


@app.cli.command("optimize-history-db")
def optimize_history_db():
    """Add the scramble lookup index needed by official history queries."""
    columns = ("competition_id", "event_id", "round_type_id", "is_extra", "scramble_num")
    with closing(get_db_connection()) as connection:
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
        connection.execute("INSERT INTO bulk_batches VALUES (?, ?)",
                           (batch_id, json.dumps(metadata)))
        connection.executemany("INSERT INTO bulk_scrambles VALUES (?, ?, ?, ?)",
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
    except mysql.connector.Error:
        app.logger.warning("WCA history lookup unavailable for bulk results", exc_info=True)
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
        counts = [row[0] for row in connection.execute(
            "SELECT DISTINCT alg_count FROM bulk_scrambles WHERE batch_id = ? AND alg_count IS NOT NULL ORDER BY alg_count",
            (batch_id,))]
    results = [json.loads(row["result"]) for row in rows]
    # Older saved batches predate cycle classification; derive it without retracing.
    for result in results:
        if "error" not in result and "conjugacy_class" not in result:
            cube = Cube()
            cube.apply_scramble(result["scramble"])
            result["conjugacy_class"] = cube.conjugacy_class()
    history_warning = annotate_bulk_history(results)
    return render_template("bulk_page.html", **json.loads(batch["metadata"]),
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
                   letter_scheme, corner_floating_buffers=None, include_basic_sandwiching=False, include_ltct=False, include_t2c=False, include_3twist=False, edge_even_cycle_break_order=None, corner_even_cycle_break_order=None, edge_odd_cycle_break_order=None, corner_odd_cycle_break_order=None, edge_odd_cycle_break_overrides=None, corner_odd_cycle_break_overrides=None):
    """Shared tracing and memo formatting for individual and bulk input."""
    cube = Cube()
    cube.apply_scramble(scramble)
    conjugacy_class = cube.conjugacy_class()

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
    original_edge_ori = cube.edge_ori.copy()
    for position in flip_positions:
        cube.edge_ori[position] = 0
    try:
        edge_trace, edge_cycle_breaks, edge_cycles, edge_floating = cube.trace_edges(
            buffer=edge_buffer,
            return_cycle_breaks=True,
            return_cycles=True,
            return_floating=True,
            use_pseudoswap=use_pseudoswap,
            pseudoswap_edge_1=pseudoswap_edge_1,
            pseudoswap_edge_2=pseudoswap_edge_2,
            floating_buffers=floating_buffers,
            auto_standalone=True,
            even_cycle_break_order=edge_even_cycle_break_order,
            odd_cycle_break_order=edge_odd_cycle_break_order,
            odd_cycle_break_overrides=edge_odd_cycle_break_overrides
        )
    finally:
        cube.edge_ori = original_edge_ori

    twist_positions = {
        orientation: [position for position, value in enumerate(cube.corner_ori)
                      if position != corner_buffer
                      and cube.corner_perm[position] == position and value == orientation]
        for orientation in (1, 2)
    }
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
            return_cycle_breaks=True,
            return_cycles=True,
            return_floating=True,
            floating_buffers=corner_floating_buffers,
            auto_standalone=True,
            even_cycle_break_order=corner_even_cycle_break_order,
            odd_cycle_break_order=corner_odd_cycle_break_order,
            odd_cycle_break_overrides=corner_odd_cycle_break_overrides
        )
    finally:
        cube.corner_ori = original_corner_ori
        cube.corner_perm = original_corner_perm

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
    switches = [item for item in edge_floating if "to_buffer" in item]
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
                    label = letter_scheme[EDGE_BUFFER_OPTIONS[position]]
                    segment = f"[Buffer {label}] {segment}"
                parts.append(segment)
            start = offset
            position = switch["to_buffer"]
        edge_memo = " ".join(parts)
        edge_buffers_used = len(used_buffers)
    flip_pairs = [
        "".join(convert_to_letters(format_edge_trace([(position, 0), (position, 1)]), letter_scheme))
        for position in flip_positions
    ]
    if flip_pairs:
        edge_memo = (edge_memo + " [Flips: " + " ".join(flip_pairs) + "]").strip()
    flip_alg_count = (len(flip_positions) + 1) // 2
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
                    label = letter_scheme[CORNER_BUFFER_OPTIONS[position]]
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
        technique_buffer=technique_buffer,
        effective_pseudoswap_edges=[pseudoswap_edge_1, pseudoswap_edge_2],
        t2c_active=bool(t2c_targets),
        ltct_active=ltct_active,
        ltct_direction=ltct_direction,
        ltct_corner=CORNER_BUFFER_OPTIONS[ltct_position] if ltct_active else None,
        edge_memo=edge_memo,
        corner_memo=corner_memo,
        edge_count=edge_count,
        corner_count=corner_count,
        edge_buffers_used=edge_buffers_used,
        corner_buffers_used=corner_buffers_used,
        edge_buffer_names_used=[EDGE_BUFFER_OPTIONS[position] for position in sorted(used_buffers)],
        corner_buffer_names_used=[CORNER_BUFFER_OPTIONS[position] for position in sorted(corner_used_buffers)],
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
        flip_count=len(flip_positions),
        flip_alg_count=flip_alg_count,
        cw_twist_count=cw_twist_count,
        ccw_twist_count=ccw_twist_count,
        twist_alg_count=twist_alg_count,
        sandwich_count=edge_sandwiches + corner_sandwiches,
        alg_count=(edge_count + 1) // 2 + (len(corner_letters) + 1) // 2 + int(bool(t2c_targets)) + flip_alg_count + twist_alg_count - edge_sandwiches - corner_sandwiches - int(ltct_active),
        buffers_used=edge_buffers_used + corner_buffers_used,
    )


@app.route("/", methods=["GET", "POST"])
def home():
    edge_buffer = 0
    corner_buffer = 0
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
    pseudoswap_edge_1 = UF
    pseudoswap_edge_2 = UR

    scramble = ""
    bulk_scrambles = request.form.get("bulk_scrambles", "")
    bulk_results = []
    include_t2c = request.form.get("include_t2c") == "on"
    include_ltct = request.form.get("include_ltct") == "on"
    include_basic_sandwiching = request.form.get("include_basic_sandwiching") == "on"
    include_3twist = request.form.get("include_3twist") == "on"
    bulk_stats = None
    edge_break_order = [EDGE_BUFFER_OPTIONS[i] for i in EDGE_BUFFER_ORDER]
    corner_break_order = [CORNER_BUFFER_OPTIONS[i] for i in CORNER_BUFFER_ORDER]
    odd_break_overrides = dict(edge={}, corner={})
    odd_break_orders = dict(edge=edge_break_order.copy(), corner=corner_break_order.copy())
    parity_pseudoswaps = {}
    trace_result = {}

    error = None

    # Start with Speffz
    letter_scheme = SPEFFZ.copy()

    if request.method == "POST":
        scramble = request.form.get("scramble", "").strip()

        # Get selected buffers from form
        edge_buffer = int(
            request.form.get("edge_buffer", 0)
        )

        corner_buffer = int(
            request.form.get("corner_buffer", 0)
        )

        # Get pseudoswap settings from form
        use_pseudoswap = request.form.get("use_pseudoswap") == "on"

        pseudoswap_edge_1 = int(
            request.form.get("pseudoswap_edge_1", UF)
        )

        pseudoswap_edge_2 = int(
            request.form.get("pseudoswap_edge_2", UR)
        )

        # Read the user's custom letters
        for target in EDGE_TARGETS + CORNER_TARGETS:
            letter = request.form.get(
                f"letter_{target}",
                SPEFFZ[target]
            ).strip().upper()

            letter_scheme[target] = letter

        try:
            for kind, options in (("edge", EDGE_BUFFER_OPTIONS), ("corner", CORNER_BUFFER_OPTIONS)):
                submitted = request.form.getlist(f"{kind}_even_cycle_break_order")
                if submitted:
                    if len(submitted) != len(options) or set(submitted) != set(options):
                        raise ValueError(f"Invalid {kind} even cycle-break order.")
                    if kind == "edge":
                        edge_break_order = submitted
                    else:
                        corner_break_order = submitted
            for kind, options in (("edge", EDGE_BUFFER_OPTIONS), ("corner", CORNER_BUFFER_OPTIONS)):
                submitted = request.form.getlist(f"{kind}_odd_cycle_break_order")
                if submitted:
                    if len(submitted) != len(options) or set(submitted) != set(options):
                        raise ValueError(f"Invalid {kind} odd cycle-break order.")
                    odd_break_orders[kind] = submitted
            for kind, targets, options in (("edge", EDGE_TARGETS, EDGE_BUFFER_OPTIONS), ("corner", CORNER_TARGETS, CORNER_BUFFER_OPTIONS)):
                for target in targets:
                    if request.form.get(f"{kind}_odd_override_{target}_enabled") != "on":
                        continue
                    order = request.form.getlist(f"{kind}_odd_override_{target}")
                    if len(order) != len(options) or set(order) != set(options):
                        raise ValueError(f"Invalid {kind} cycle-break order for {target}.")
                    odd_break_overrides[kind][target] = order
            for key in PARITY_CASE_KEYS:
                first = request.form.get(f"parity_{key}_first", "")
                second = request.form.get(f"parity_{key}_second", "")
                if first or second:
                    if (first not in [str(i) for i in range(12)]
                            or second not in [str(i) for i in range(12)] or first == second):
                        raise ValueError(f"Select two different edges for parity case {key}, or leave both as Default.")
                    parity_pseudoswaps[key] = [int(first), int(second)]
            submitted_corner_order = request.form.getlist("corner_floating_order")
            if submitted_corner_order:
                if (len(submitted_corner_order) != len(CORNER_BUFFER_OPTIONS)
                        or set(submitted_corner_order) != set(CORNER_BUFFER_OPTIONS)):
                    raise ValueError("Invalid corner floating buffer order.")
                corner_floating_order = submitted_corner_order
            enabled_corner_floating = request.form.getlist("corner_floating_buffers")
            if any(name not in CORNER_BUFFER_OPTIONS for name in enabled_corner_floating):
                raise ValueError("Invalid corner floating buffer.")
            enabled_corner_floating = list(dict.fromkeys(
                enabled_corner_floating + [CORNER_BUFFER_OPTIONS[corner_buffer]]
            ))
            submitted_order = request.form.getlist("edge_floating_order")
            if submitted_order:
                if (len(submitted_order) != len(EDGE_BUFFER_OPTIONS)
                        or set(submitted_order) != set(EDGE_BUFFER_OPTIONS)):
                    raise ValueError("Invalid edge floating buffer order.")
                edge_floating_order = submitted_order
            enabled_edge_floating = request.form.getlist("edge_floating_buffers")
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
            settings = dict(
                edge_odd_cycle_break_overrides={target: [EDGE_BUFFER_OPTIONS.index(name) for name in order] for target, order in odd_break_overrides["edge"].items()},
                corner_odd_cycle_break_overrides={target: [CORNER_BUFFER_OPTIONS.index(name) for name in order] for target, order in odd_break_overrides["corner"].items()},
                edge_odd_cycle_break_order=[EDGE_BUFFER_OPTIONS.index(name) for name in odd_break_orders["edge"]],
                corner_odd_cycle_break_order=[CORNER_BUFFER_OPTIONS.index(name) for name in odd_break_orders["corner"]],
                edge_even_cycle_break_order=[EDGE_BUFFER_OPTIONS.index(name) for name in edge_break_order],
                corner_even_cycle_break_order=[CORNER_BUFFER_OPTIONS.index(name) for name in corner_break_order],
                parity_pseudoswaps=parity_pseudoswaps,
                include_3twist=include_3twist,
                include_t2c=include_t2c,
                include_ltct=include_ltct,
                include_basic_sandwiching=include_basic_sandwiching,
                edge_buffer=edge_buffer, corner_buffer=corner_buffer,
                use_pseudoswap=use_pseudoswap,
                pseudoswap_edge_1=pseudoswap_edge_1,
                pseudoswap_edge_2=pseudoswap_edge_2,
                floating_buffers=floating_buffers, letter_scheme=letter_scheme,
                corner_floating_buffers=[
                    CORNER_BUFFER_OPTIONS.index(name) for name in corner_floating_order
                    if name in enabled_corner_floating
                ],
            )
            if request.form.get("action") == "bulk":
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
                        for name in options:
                            count = sum(name in row[f"{kind}_buffer_names_used"] for row in valid)
                            usage.append(dict(name=name, count=count,
                                              percent=100 * count / len(valid)))
                        bulk_stats[f"{kind}_buffer_usage"] = usage
            else:
                trace_result = trace_scramble(scramble, **settings)

        except ValueError as e:
            error = str(e)

    context = dict(
        odd_break_overrides=odd_break_overrides,
        odd_break_orders=odd_break_orders,
        edge_break_order=edge_break_order, corner_break_order=corner_break_order,
        parity_cases=parity_case_groups(corner_floating_order, CORNER_BUFFER_OPTIONS[corner_buffer], include_hidden=True), parity_pseudoswaps=parity_pseudoswaps,
        include_3twist=include_3twist,
        include_t2c=include_t2c,
        include_ltct=include_ltct,
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
    if bulk_results:
        metadata = dict(bulk_stats=bulk_stats, bulk_total=len(bulk_results),
                        include_basic_sandwiching=include_basic_sandwiching,
                        include_ltct=include_ltct, include_t2c=include_t2c)
        context.update(bulk_batch_id=save_bulk_batch(bulk_results, metadata),
                       bulk_total=len(bulk_results),
                       bulk_alg_counts=sorted({row["alg_count"] for row in bulk_results if "error" not in row}),
                       bulk_alg_filter="", bulk_sort="original")
    context["bulk_history_warning"] = annotate_bulk_history(bulk_results)
    return render_template("index.html", **context, bulk_scrambles=bulk_scrambles,
                           bulk_results=bulk_results, bulk_stats=bulk_stats)

@app.route("/auth/wca")
def wca_login():
    if not os.environ.get("WCA_CLIENT_ID") or not os.environ.get("WCA_CLIENT_SECRET"):
        return "Set WCA_CLIENT_ID and WCA_CLIENT_SECRET before signing in.", 503
    state = secrets.token_urlsafe(32)
    session["wca_oauth_state"] = state
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

    return redirect("/")

@app.route("/logout")
def logout():
    session.pop("wca_user", None)
    return redirect("/")

def get_3bld_history(wca_id):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    query = """
        SELECT
            c.name AS competition_name,
            r.competition_id,
            c.year,
            c.month,
            c.day,
            r.round_type_id,
            ra.attempt_number,
            ra.value,
            s.group_id,
            s.scramble
        FROM results r

        JOIN result_attempts ra
            ON ra.result_id = r.id

        JOIN competitions c
            ON c.id = r.competition_id

        LEFT JOIN scrambles s
            ON s.competition_id = r.competition_id
            AND s.event_id = r.event_id
            AND s.round_type_id = r.round_type_id
            AND s.is_extra = 0
            AND s.scramble_num = ra.attempt_number

        WHERE r.person_id = %s
            AND r.event_id = '333bf'

        ORDER BY
            c.year DESC,
            c.month DESC,
            c.day DESC,
            r.round_type_id,
            ra.attempt_number,
            s.group_id
    """

    cursor.execute(query, (wca_id,))
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

    cursor.close()
    connection.close()

    return grouped_history

def get_multiblind_history(wca_id):
    # Attendance is any recorded event result, not only multi-blind participation.
    # Each scramble record is an attempt containing newline-separated cubes.
    with closing(get_db_connection()) as connection:
        with closing(connection.cursor(dictionary=True)) as cursor:
            cursor.execute("""
                SELECT c.name AS competition_name, s.competition_id,
                       c.year, c.month, c.day, s.round_type_id,
                       s.group_id, s.scramble_num, s.is_extra, s.scramble
                FROM scrambles s
                JOIN competitions c ON c.id = s.competition_id
                WHERE s.event_id = %s
                  AND EXISTS (
                      SELECT 1 FROM results r
                      WHERE r.competition_id = s.competition_id AND r.person_id = %s
                  )
                ORDER BY c.year DESC, c.month DESC, c.day DESC,
                         s.competition_id, s.round_type_id, s.group_id,
                         s.is_extra, s.scramble_num
            """, ("333mbf", wca_id))
            rows = cursor.fetchall()
    attempts = []
    for row in rows:
        cubes = [line.strip() for line in (row["scramble"] or "").splitlines() if line.strip()]
        attempts.append(dict(row, attempt_number=row["scramble_num"], scrambles=[
            dict(cube_number=number, scramble=scramble)
            for number, scramble in enumerate(cubes, 1)
        ]))
    return attempts


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
        except mysql.connector.Error:
            app.logger.warning("Official history database unavailable", exc_info=True)
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
