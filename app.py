from flask import Flask, render_template, request

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

@app.route("/", methods=["GET", "POST"])
def home():
    edge_buffer = "UF"
    corner_buffer = "UFR"

    edge_memo = None
    corner_memo = None

    edge_count = None
    corner_count = None

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
    pseudoswap_edge_1 = 0   # UF
    pseudoswap_edge_2 = 1   # UB

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
            request.form.get("pseudoswap_edge_1", 0)
        )

        pseudoswap_edge_2 = int(
            request.form.get("pseudoswap_edge_2", 1)
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
                pseudoswap_edge_2=pseudoswap_edge_2
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

        edge_target_names=edge_target_names,
        corner_target_names=corner_target_names,
        edge_targets=EDGE_TARGETS,
        corner_targets=CORNER_TARGETS,

        edge_buffer_options=EDGE_BUFFER_OPTIONS,
        corner_buffer_options=CORNER_BUFFER_OPTIONS,
        edge_buffer=edge_buffer,
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

        error=error
    )


if __name__ == "__main__":
    app.run(debug=True)