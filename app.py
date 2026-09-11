import os
import secrets
from urllib.parse import urlencode
import requests
import mysql.connector

from flask import Flask, render_template, request, redirect, session, url_for

from Cube import (
    Cube,
    SPEFFZ,

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

def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        database="wca_results"
    )

@app.route("/", methods=["GET", "POST"])
def home():
    print("WCA USER SESSION:", session.get("wca_user"))
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
        print("\n--- FLASK PSEUDOSWAP DEBUG ---")
        print("FORM:", request.form)
        print("use_pseudoswap:", use_pseudoswap)
        print("edge 1:", pseudoswap_edge_1)
        print("edge 2:", pseudoswap_edge_2)

        # Read the user's custom letters
        for target in EDGE_TARGETS + CORNER_TARGETS:
            letter = request.form.get(
                f"letter_{target}",
                SPEFFZ[target]
            ).strip().upper()

            letter_scheme[target] = letter

        try:
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
            cube = Cube()
            cube.apply_scramble(scramble)

            # Trace edges and corners
            edge_trace, edge_cycle_breaks, edge_cycles, edge_floating = cube.trace_edges(
                buffer=edge_buffer,
                return_cycle_breaks=True,
                return_cycles=True,
                return_floating=True,
                use_pseudoswap=use_pseudoswap,
                pseudoswap_edge_1=pseudoswap_edge_1,
                pseudoswap_edge_2=pseudoswap_edge_2,
                floating_buffers=floating_buffers
            )

            corner_trace, corner_cycle_breaks, corner_cycles, corner_floating = cube.trace_corners(
                buffer=corner_buffer,
                return_cycle_breaks=True,
                return_cycles=True,
                return_floating=True
            )
            # print("CORNER FLOATING RESULT:", corner_floating)

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

            flipped_edges = [
                EDGE_BUFFER_OPTIONS[position]
                for position, orientation in enumerate(cube.edge_ori)
                if (
                    cube.edge_perm[position] == position
                    and orientation == 1
                )
            ]

            clockwise_twisted_corners = [
                CORNER_BUFFER_OPTIONS[position]
                for position, orientation in enumerate(cube.corner_ori)
                if (
                    cube.corner_perm[position] == position
                    and orientation == 1
                )
            ]

            counterclockwise_twisted_corners = [
                CORNER_BUFFER_OPTIONS[position]
                for position, orientation in enumerate(cube.corner_ori)
                if (
                    cube.corner_perm[position] == position
                    and orientation == 2
                )
            ]

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
            corner_count = len(corner_letters)

            parity = "Yes" if edge_count % 2 == 1 else "No"

            edge_memo = format_memo(edge_letters)
            edge_buffers_used = int(bool(edge_trace))
            corner_buffers_used = int(bool(corner_trace))
            switches = [item for item in edge_floating if "to_buffer" in item]
            if switches:
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
                        segment = format_memo(letters)
                        if position != edge_buffer:
                            label = letter_scheme[EDGE_BUFFER_OPTIONS[position]]
                            segment = f"[Buffer {label}] {segment}"
                        parts.append(segment)
                    start = offset
                    position = switch["to_buffer"]
                edge_memo = " ".join(parts)
                edge_buffers_used = len(used_buffers)
            corner_memo = format_memo(corner_letters)

        except ValueError as e:
            error = str(e)

    return render_template(
        "index.html",
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

@app.route("/my-3bld-history")
def my_3bld_history():
    wca_user = session.get("wca_user")

    if not wca_user:
        return redirect(url_for("wca_login"))

    wca_id = wca_user.get("wca_id")

    if not wca_id:
        return "Your WCA account does not have a WCA ID yet.", 400
    print("WCA ID being queried:", repr(wca_id))
    history = get_3bld_history(wca_id)

    return render_template(
        "history.html",
        wca_user=wca_user,
        history=history,
    )

if __name__ == "__main__":
    app.run(debug=True, port=5001)
