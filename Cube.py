# =========================================================
# PIECE CONSTANTS
# =========================================================

# Edges
UF = 0
UB = 1
UR = 2
UL = 3
FR = 4
FL = 5
DF = 6
DB = 7
DR = 8
DL = 9
BR = 10
BL = 11

# Corners
UFR = 0
UFL = 1
UBR = 2
UBL = 3
DFR = 4
DFL = 5
DBR = 6
DBL = 7


# =========================================================
# BUFFER / CYCLE BREAK ORDER
# =========================================================

EDGE_BUFFER_ORDER = [
    UF, UB, UR, UL,
    FR, FL, DF, DB, DR, DL, BR, BL
]

CORNER_BUFFER_ORDER = [
    UFR, UFL, UBR, UBL,
    DFR, DFL, DBR, DBL
]


# =========================================================
# TARGET NAMES
# =========================================================

EDGE_TARGET_NAMES = {
    (UF, 0): "UF",
    (UF, 1): "FU",

    (UB, 0): "UB",
    (UB, 1): "BU",

    (UR, 0): "UR",
    (UR, 1): "RU",

    (UL, 0): "UL",
    (UL, 1): "LU",

    (FR, 0): "FR",
    (FR, 1): "RF",

    (FL, 0): "FL",
    (FL, 1): "LF",

    (DF, 0): "DF",
    (DF, 1): "FD",

    (DB, 0): "DB",
    (DB, 1): "BD",

    (DR, 0): "DR",
    (DR, 1): "RD",

    (DL, 0): "DL",
    (DL, 1): "LD",

    (BR, 0): "BR",
    (BR, 1): "RB",

    (BL, 0): "BL",
    (BL, 1): "LB",
}

CORNER_TARGET_NAMES = {
    # UFR
    (UFR, 0): "UFR",
    (UFR, 1): "RUF",
    (UFR, 2): "FUR",

    # UFL
    (UFL, 0): "UFL",
    (UFL, 1): "FUL",
    (UFL, 2): "LUF",

    # UBR
    (UBR, 0): "UBR",
    (UBR, 1): "BUR",
    (UBR, 2): "RUB",

    # UBL
    (UBL, 0): "UBL",
    (UBL, 1): "LUB",
    (UBL, 2): "BUL",

    # DFR
    (DFR, 0): "DFR",
    (DFR, 1): "FDR",
    (DFR, 2): "RDF",

    # DFL
    (DFL, 0): "DFL",
    (DFL, 1): "LDF",
    (DFL, 2): "FDL",

    # DBR
    (DBR, 0): "DBR",
    (DBR, 1): "RDB",
    (DBR, 2): "BDR",

    # DBL
    (DBL, 0): "DBL",
    (DBL, 1): "BDL",
    (DBL, 2): "LDB",
}





# ---------------------------------------------------------
# Edge moves
#
# Format:
#
# "MOVE": (
#     [old positions],
#     [new positions],
#     [orientation changes]
# )
#
# edge orientation is modulo 2
# ---------------------------------------------------------

EDGE_MOVES = {

    # U
    "U": (
        [UF, UL, UB, UR],
        [UL, UB, UR, UF],
        [0, 0, 0, 0]
    ),

    "U'": (
        [UF, UR, UB, UL],
        [UR, UB, UL, UF],
        [0, 0, 0, 0]
    ),

    # R
    "R": (
        [UR, BR, DR, FR],
        [BR, DR, FR, UR],
        [0, 0, 0, 0]
    ),

    "R'": (
        [UR, FR, DR, BR],
        [FR, DR, BR, UR],
        [0, 0, 0, 0]
    ),

    # F
    "F": (
        [UF, FR, DF, FL],
        [FR, DF, FL, UF],
        [1, 1, 1, 1]
    ),

    "F'": (
        [UF, FL, DF, FR],
        [FL, DF, FR, UF],
        [1, 1, 1, 1]
    ),

    # D
    "D": (
        [DF, DR, DB, DL],
        [DR, DB, DL, DF],
        [0, 0, 0, 0]
    ),

    "D'": (
        [DF, DL, DB, DR],
        [DL, DB, DR, DF],
        [0, 0, 0, 0]
    ),

    # L
    "L": (
        [UL, FL, DL, BL],
        [FL, DL, BL, UL],
        [0, 0, 0, 0]
    ),

    "L'": (
        [UL, BL, DL, FL],
        [BL, DL, FL, UL],
        [0, 0, 0, 0]
    ),

    # B
    "B": (
        [UB, BL, DB, BR],
        [BL, DB, BR, UB],
        [1, 1, 1, 1]
    ),

    "B'": (
        [UB, BR, DB, BL],
        [BR, DB, BL, UB],
        [1, 1, 1, 1]
    ),
}


# ---------------------------------------------------------
# Corner moves
#
# corner orientation is modulo 3
# ---------------------------------------------------------

CORNER_MOVES = {

    # U
    "U": (
        [UFR, UFL, UBL, UBR],
        [UFL, UBL, UBR, UFR],
        [0, 0, 0, 0]
    ),

    "U'": (
        [UFR, UBR, UBL, UFL],
        [UBR, UBL, UFL, UFR],
        [0, 0, 0, 0]
    ),

    # R
    "R": (
        [UBR, DBR, DFR, UFR],
        [DBR, DFR, UFR, UBR],
        [2, 1, 2, 1]
    ),

    "R'": (
        [UBR, UFR, DFR, DBR],
        [UFR, DFR, DBR, UBR],
        [2, 1, 2, 1]
    ),

    # F
    "F": (
        [UFL, UFR, DFR, DFL],
        [UFR, DFR, DFL, UFL],
        [1, 2, 1, 2]
    ),

    "F'": (
        [UFL, DFL, DFR, UFR],
        [DFL, DFR, UFR, UFL],
        [1, 2, 1, 2]
    ),

    # D
    "D": (
        [DFR, DBR, DBL, DFL],
        [DBR, DBL, DFL, DFR],
        [0, 0, 0, 0]
    ),

    "D'": (
        [DFR, DFL, DBL, DBR],
        [DFL, DBL, DBR, DFR],
        [0, 0, 0, 0]
    ),

    # L
    "L": (
        [UFL, DFL, DBL, UBL],
        [DFL, DBL, UBL, UFL],
        [2, 1, 2, 1]
    ),

    "L'": (
        [UFL, UBL, DBL, DFL],
        [UBL, DBL, DFL, UFL],
        [2, 1, 2, 1]
    ),

    # B
    "B": (
        [UBR, UBL, DBL, DBR],
        [UBL, DBL, DBR, UBR],
        [1, 2, 1, 2]
    ),

    "B'": (
        [UBR, DBR, DBL, UBL],
        [DBR, DBL, UBL, UBR],
        [1, 2, 1, 2]
    ),
}

# ---------------------------------------------------------
# Speffz letter scheme
# ---------------------------------------------------------

SPEFFZ = {
    # =====================
    # Edges
    # =====================

    # U face
    "UB": "A",
    "UR": "B",
    "UF": "C",
    "UL": "D",

    # L face
    "LU": "E",
    "LF": "F",
    "LD": "G",
    "LB": "H",

    # F face
    "FU": "I",
    "FR": "J",
    "FD": "K",
    "FL": "L",

    # R face
    "RU": "M",
    "RB": "N",
    "RD": "O",
    "RF": "P",

    # B face
    "BU": "Q",
    "BL": "R",
    "BD": "S",
    "BR": "T",

    # D face
    "DF": "U",
    "DR": "V",
    "DB": "W",
    "DL": "X",


    # =====================
    # Corners
    # =====================

    # U face
    "UBL": "A",
    "UBR": "B",
    "UFR": "C",
    "UFL": "D",

    # L face
    "LUB": "E",
    "LUF": "F",
    "LDF": "G",
    "LDB": "H",

    # F face
    "FUL": "I",
    "FUR": "J",
    "FDR": "K",
    "FDL": "L",

    # R face
    "RUF": "M",
    "RUB": "N",
    "RDB": "O",
    "RDF": "P",

    # B face
    "BUR": "Q",
    "BUL": "R",
    "BDL": "S",
    "BDR": "T",

    # D face
    "DFL": "U",
    "DFR": "V",
    "DBR": "W",
    "DBL": "X",
}

class Cube:
    def __init__(self):
        self.edge_perm = list(range(12))
        self.edge_ori = [0] * 12

        self.corner_perm = list(range(8))
        self.corner_ori = [0] * 8

    def move(self, move):
            # Handle double moves by applying the quarter turn twice
            if move.endswith("2"):
                base_move = move[0]
                self.move(base_move)
                self.move(base_move)
                return

            # -------------------------
            # Edges
            # -------------------------

            old_positions, new_positions, ori_changes = EDGE_MOVES[move]

            old_perm = self.edge_perm.copy()
            old_ori = self.edge_ori.copy()

            for old_pos, new_pos, ori_change in zip(
                old_positions, new_positions, ori_changes
            ):
                self.edge_perm[new_pos] = old_perm[old_pos]

                self.edge_ori[new_pos] = (
                    old_ori[old_pos] + ori_change
                ) % 2

            # -------------------------
            # Corners
            # -------------------------

            old_positions, new_positions, ori_changes = CORNER_MOVES[move]

            old_perm = self.corner_perm.copy()
            old_ori = self.corner_ori.copy()

            for old_pos, new_pos, ori_change in zip(
                old_positions, new_positions, ori_changes
            ):
                self.corner_perm[new_pos] = old_perm[old_pos]

                self.corner_ori[new_pos] = (
                    old_ori[old_pos] + ori_change
                ) % 3

    def scramble(self, moves):
        for move in moves.split():
            self.move(move)

    def reset(self):
        self.edge_perm = list(range(12))
        self.edge_ori = [0] * 12

        self.corner_perm = list(range(8))
        self.corner_ori = [0] * 8

    def is_solved(self):
        return (
            self.corner_perm == list(range(8))
            and self.corner_ori == [0] * 8
            and self.edge_perm == list(range(12))
            and self.edge_ori == [0] * 12
        )
    
    def trace_edge_cycle(self, start, target_perm=None):
        """
        Trace one edge permutation cycle relative to target_perm.
        """

        if target_perm is None:
            target_perm = list(range(12))

        # Find the target position of each edge piece.
        target_position_of_piece = [0] * 12

        for position, piece in enumerate(target_perm):
            target_position_of_piece[piece] = position

        targets = []
        visited = set()

        current = start
        current_ori = 0

        while True:
            visited.add(current)

            # Piece currently occupying this position
            next_piece = self.edge_perm[current]

            # Orientation of the sticker reached
            next_ori = current_ori ^ self.edge_ori[current]

            # Position where this piece belongs in the target state
            next_position = target_position_of_piece[next_piece]

            # Cycle has returned to its starting position
            if next_position == start:
                return targets, visited, next_ori

            targets.append((next_position, next_ori))

            current = next_position
            current_ori = next_ori


    def find_edge_cycle_break(
        self,
        visited,
        buffer=UF,
        target_perm=None
    ):
        """
        Find the next unsolved, unvisited edge position
        relative to the desired target permutation.
        """

        if target_perm is None:
            target_perm = list(range(12))

        for position in EDGE_BUFFER_ORDER:

            if position == buffer:
                continue

            if position in visited:
                continue

            if (
                self.edge_perm[position] != target_perm[position]
                or self.edge_ori[position] != 0
            ):
                return position

        return None

    def trace_edges(
        self,
        buffer=UF,
        return_cycle_breaks=False,
        return_cycles=False,
        return_floating=False,
        use_pseudoswap=False,
        pseudoswap_edge_1=None,
        pseudoswap_edge_2=None
    ):
        parity = self.has_parity()

        print("\n--- PSEUDOSWAP DEBUG ---")
        print("parity:", parity)
        print("use_pseudoswap:", use_pseudoswap)
        print("pseudoswap_edge_1:", pseudoswap_edge_1)
        print("pseudoswap_edge_2:", pseudoswap_edge_2)

        if use_pseudoswap and parity:
            target_perm = self.get_edge_target_perm(
                pseudoswap_edge_1,
                pseudoswap_edge_2
            )
        else:
            target_perm = self.get_edge_target_perm()

        trace = []
        visited = set()
        cycle_breaks = []
        cycles = []
        floating_opportunities = []

        # ---------------------------------------------------------
        # Floating tracking
        # ---------------------------------------------------------

        buffer_target_count = 0
        buffer_solved_at = None

        # Find where the piece that belongs in the selected buffer
        # position in the target state currently is, and record
        # its orientation in the scrambled state.
        target_buffer_piece = target_perm[buffer]

        buffer_piece_position = self.edge_perm.index(
            target_buffer_piece
        )
        starting_buffer_ori = self.edge_ori[buffer_piece_position]

        # Track the buffer piece's orientation as cycles are traced.
        buffer_ori = starting_buffer_ori

        print("\n--- EDGE FLOATING START ---")
        print("buffer:", buffer)
        print("buffer piece starting position:", buffer_piece_position)
        print("starting_buffer_ori:", starting_buffer_ori)

        # ---------------------------------------------------------
        # Trace the selected buffer
        # ---------------------------------------------------------

        targets, cycle_visited, _ = (
            self.trace_edge_cycle(buffer, target_perm)
        )

        trace.extend(targets)
        visited.update(cycle_visited)

        if targets:
            cycles.append(targets.copy())

            buffer_target_count += len(targets)

            # For the initial buffer cycle, the closing orientation
            # is the orientation of the final target actually
            # included in the memo.
            initial_closing_ori = targets[-1][1]

            # After tracing the initial cycle, the buffer piece has
            # effectively returned to the selected buffer position.
            buffer_piece_position = buffer

            # Edge orientations are modulo 2.
            # XOR is equivalent to addition/subtraction modulo 2.
            buffer_ori = (
                starting_buffer_ori ^ initial_closing_ori
            )

            print("\n--- AFTER INITIAL EDGE CYCLE ---")
            print("targets:", targets)
            print("initial_closing_ori:", initial_closing_ori)
            print("buffer_ori:", buffer_ori)
            print("buffer_target_count:", buffer_target_count)

            # If orientation is now 0, the selected buffer is solved.
            if buffer_ori == 0:
                buffer_solved_at = buffer_target_count

        else:
            # No permutation targets were traced from the buffer.
            # Therefore the buffer piece started in its own position.
            buffer_piece_position = buffer
            buffer_ori = starting_buffer_ori

            if buffer_ori == 0:
                buffer_solved_at = 0

        print("\n--- AFTER INITIAL EDGE BUFFER PROCESSING ---")
        print("tracked buffer position:", buffer_piece_position)
        print("tracked buffer orientation:", buffer_ori)
        print("buffer_target_count:", buffer_target_count)
        print("buffer_solved_at:", buffer_solved_at)

        # ---------------------------------------------------------
        # Trace remaining cycles
        # ---------------------------------------------------------

        while True:
            cycle_break = self.find_edge_cycle_break(
                visited,
                buffer,
                target_perm
            )

            if cycle_break is None:
                break

            cycle_breaks.append(cycle_break)

            # Opening cycle-break target always has orientation 0.
            cycle = [(cycle_break, 0)]
            trace.append((cycle_break, 0))

            targets, cycle_visited, closing_ori = (
                self.trace_edge_cycle(cycle_break, target_perm)
            )

            trace.extend(targets)
            cycle.extend(targets)

            visited.update(cycle_visited)

            # Explicitly close the cycle on the cycle-break piece.
            trace.append((cycle_break, closing_ori))
            cycle.append((cycle_break, closing_ori))

            cycles.append(cycle)

            print("\n--- EDGE CYCLE BREAK ---")
            print("cycle break:", cycle_break)
            print("targets:", targets)
            print("closing_ori:", closing_ori)
            print("buffer_ori BEFORE:", buffer_ori)

            # -----------------------------------------------------
            # Track progress toward solving the selected buffer.
            # -----------------------------------------------------

            if buffer_solved_at is None:
                buffer_target_count += len(cycle)

                # Apply this cycle's orientation effect to the
                # original selected buffer piece.
                buffer_ori ^= closing_ori

                print("buffer_ori AFTER:", buffer_ori)

                # Once the buffer piece is oriented, the selected
                # buffer has become completely solved.
                if buffer_ori == 0:
                    buffer_solved_at = buffer_target_count

            # -----------------------------------------------------
            # Check whether another unsolved cycle still remains.
            # -----------------------------------------------------

            next_cycle_break = self.find_edge_cycle_break(
                visited,
                buffer,
                target_perm
            )

            print("buffer_target_count:", buffer_target_count)
            print("buffer_solved_at:", buffer_solved_at)
            print("next_cycle_break:", next_cycle_break)

            # Floating is possible if:
            #
            # 1. The selected buffer has become solved.
            # 2. It took an even, nonzero number of targets.
            # 3. Another unsolved edge cycle still remains.
            if (
                buffer_solved_at is not None
                and buffer_solved_at > 0
                and buffer_solved_at % 2 == 0
                and next_cycle_break is not None
                and not floating_opportunities
            ):
                floating_opportunities.append({
                    "after_target": buffer_solved_at
                })

        # ---------------------------------------------------------
        # Return requested tracing information
        # ---------------------------------------------------------

        # Return everything
        if return_cycle_breaks and return_cycles and return_floating:
            return (
                trace,
                cycle_breaks,
                cycles,
                floating_opportunities
            )

        # Return trace, cycle breaks, and separated cycles
        if return_cycle_breaks and return_cycles:
            return trace, cycle_breaks, cycles

        # Return trace and cycle breaks
        if return_cycle_breaks:
            return trace, cycle_breaks

        # Return trace and separated cycles
        if return_cycles:
            return trace, cycles

        # Return trace and floating opportunities
        if return_floating:
            return trace, floating_opportunities

        # Default: return only the complete trace
        return trace

    def trace_corner_cycle(self, start):
        targets = []
        visited = set()

        current = start
        current_sticker_ori = 0

        while True:
            visited.add(current)

            next_piece = self.corner_perm[current]

            next_sticker_ori = (
                current_sticker_ori - self.corner_ori[current]
            ) % 3

            if next_piece == start:
                print("--- CYCLE CLOSE ---")
                print("start:", start)
                print("current:", current)
                print("current_sticker_ori:", current_sticker_ori)
                print("corner_ori[current]:", self.corner_ori[current])
                print("next_sticker_ori:", next_sticker_ori)
                print(
                    "closing target:",
                    CORNER_TARGET_NAMES[(next_piece, next_sticker_ori)]
                )

                return targets, visited, next_sticker_ori

            targets.append((next_piece, next_sticker_ori))
            current = next_piece
            current_sticker_ori = next_sticker_ori
    
    def find_corner_cycle_break(self, visited, buffer=UFR):
        for position in CORNER_BUFFER_ORDER:

            if position == buffer:
                continue

            if position in visited:
                continue

            if (
                self.corner_perm[position] != position
                or self.corner_ori[position] != 0
            ):
                return position

        return None
    
    def trace_corners(
        self,
        buffer=UFR,
        return_cycle_breaks=False,
        return_cycles=False,
        return_floating=False
    ):
        trace = []
        visited = set()
        cycle_breaks = []
        cycles = []
        floating_opportunities = []

        # ---------------------------------------------------------
        # Floating tracking
        # ---------------------------------------------------------

        buffer_target_count = 0
        buffer_solved_at = None

        # Find where the actual buffer piece currently is and
        # record its orientation in the scrambled state.
        buffer_piece_position = self.corner_perm.index(buffer)
        starting_buffer_ori = self.corner_ori[buffer_piece_position]

        # Track the buffer piece's orientation as cycles are traced.
        buffer_ori = starting_buffer_ori

        # ---------------------------------------------------------
        # Trace the selected buffer
        # ---------------------------------------------------------

        targets, cycle_visited, _ = (
            self.trace_corner_cycle(buffer)
        )

        trace.extend(targets)
        visited.update(cycle_visited)

        if targets:
            cycles.append(targets.copy())

            buffer_target_count += len(targets)

            # For the initial buffer cycle, the closing target is
            # the final target actually included in the memo.
            initial_closing_ori = targets[-1][1]

            # After tracing the initial cycle, the buffer piece has
            # effectively returned to its buffer position.
            buffer_piece_position = buffer

            # Account for the buffer piece's original orientation
            # and the orientation of the last target in the cycle.
            buffer_ori = (
                starting_buffer_ori - initial_closing_ori
            ) % 3

            # If orientation is now 0, the selected buffer is solved.
            if buffer_ori == 0:
                buffer_solved_at = buffer_target_count

        else:
            # No permutation targets were traced from the buffer.
            # Therefore the buffer piece started in its own position.
            buffer_piece_position = buffer
            buffer_ori = starting_buffer_ori

            # A completely solved buffer means floating can
            # potentially be available immediately (after 0 targets).
            if buffer_ori == 0:
                buffer_solved_at = 0

        # ---------------------------------------------------------
        # Trace remaining cycles
        # ---------------------------------------------------------

        while True:
            cycle_break = self.find_corner_cycle_break(
                visited,
                buffer
            )

            if cycle_break is None:
                break

            # -----------------------------------------------------
            # Check for floating BEFORE tracing this cycle.
            #
            # Since cycle_break is not None, another unsolved cycle
            # exists right now. If the selected buffer is already
            # solved after an even number of targets, we can float
            # into this remaining cycle.
            # -----------------------------------------------------

            if (
                buffer_solved_at is not None
                and buffer_solved_at % 2 == 0
                and not floating_opportunities
            ):
                floating_opportunities.append({
                    "after_target": buffer_solved_at
                })

            # -----------------------------------------------------
            # Trace the cycle break normally.
            # -----------------------------------------------------

            cycle_breaks.append(cycle_break)

            # Opening cycle-break target always has orientation 0.
            cycle = [(cycle_break, 0)]
            trace.append((cycle_break, 0))

            targets, cycle_visited, closing_ori = (
                self.trace_corner_cycle(cycle_break)
            )

            trace.extend(targets)
            cycle.extend(targets)

            visited.update(cycle_visited)

            # Explicitly close the cycle on the cycle-break piece.
            trace.append((cycle_break, closing_ori))
            cycle.append((cycle_break, closing_ori))

            cycles.append(cycle)

            # -----------------------------------------------------
            # Track progress toward solving the selected buffer.
            # -----------------------------------------------------

            if buffer_solved_at is None:
                buffer_target_count += len(cycle)

                # Each cycle's closing orientation changes the
                # tracked orientation of the original buffer piece.
                buffer_ori = (
                    buffer_ori - closing_ori
                ) % 3

                # Once the original buffer piece is oriented, the
                # selected buffer has become completely solved.
                if buffer_ori == 0:
                    buffer_solved_at = buffer_target_count

        # ---------------------------------------------------------
        # Return requested tracing information
        # ---------------------------------------------------------

        if return_cycle_breaks and return_cycles and return_floating:
            return (
                trace,
                cycle_breaks,
                cycles,
                floating_opportunities
            )

        if return_cycle_breaks and return_cycles:
            return trace, cycle_breaks, cycles

        if return_cycle_breaks:
            return trace, cycle_breaks

        if return_cycles:
            return trace, cycles

        if return_floating:
            return trace, floating_opportunities

        return trace

    def has_parity(self):
        inversions = 0

        for i in range(12):
            for j in range(i + 1, 12):
                if self.edge_perm[i] > self.edge_perm[j]:
                    inversions += 1

        return inversions % 2 == 1
    
    # Modify the target permutation to swap two edges if pseudoswap is used
    def get_edge_target_perm(
        self,
        pseudoswap_edge_1=None,
        pseudoswap_edge_2=None
    ):
        # Normal solved edge state
        target_perm = list(range(12))

        # If two pseudoswap edges were provided,
        # swap those two pieces in the target state
        if (
            pseudoswap_edge_1 is not None
            and pseudoswap_edge_2 is not None
        ):
            if pseudoswap_edge_1 == pseudoswap_edge_2:
                raise ValueError(
                    "Pseudoswap edges must be different."
                )

            target_perm[pseudoswap_edge_1] = pseudoswap_edge_2
            target_perm[pseudoswap_edge_2] = pseudoswap_edge_1

        return target_perm

    def get_state(self):
        return (
            tuple(self.edge_perm),
            tuple(self.edge_ori),
            tuple(self.corner_perm),
            tuple(self.corner_ori)
        )
    def apply_scramble(self, scramble):
        moves = scramble.split()

        valid_moves = {
            "U", "U'", "U2",
            "R", "R'", "R2",
            "F", "F'", "F2",
            "D", "D'", "D2",
            "L", "L'", "L2",
            "B", "B'", "B2"
        }

        for move in moves:
            if move not in valid_moves:
                raise ValueError(f"Invalid move: {move}")

            self.move(move)

# =========================================================
# FORMATTING
# =========================================================


def format_edge_trace(trace):
    return [
        EDGE_TARGET_NAMES[target]
        for target in trace
    ]

def format_corner_trace(trace):
    return [
        CORNER_TARGET_NAMES[target]
        for target in trace
    ]

def convert_to_letters(trace, letter_scheme=SPEFFZ):
    return [
        letter_scheme[target]
        for target in trace
    ]

def format_memo(letters):
    return " ".join(
        "".join(letters[i:i + 2])
        for i in range(0, len(letters), 2)
    )

# =========================================================
# MAIN
# =========================================================

if __name__ == "__main__":
    scramble = input("Enter scramble: ")

    cube = Cube()

    cube.apply_scramble(scramble)

    edge_trace = cube.trace_edges()
    corner_trace = cube.trace_corners()

    edge_targets = format_edge_trace(edge_trace)
    corner_targets = format_corner_trace(corner_trace)

    edge_letters = convert_to_letters(edge_targets)
    corner_letters = convert_to_letters(corner_targets)

    print("\nEdge trace:")
    print(" ".join(edge_targets))

    print("Edge memo:")
    print(format_memo(edge_letters))

    print("\nCorner trace:")
    print(" ".join(corner_targets))

    print("Corner memo:")
    print(format_memo(corner_letters))