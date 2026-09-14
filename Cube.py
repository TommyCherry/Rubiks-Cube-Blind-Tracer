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

    def conjugacy_class(self):
        """Cycle lengths with nonzero net orientation marked by a prime.

        Use the requested convention: both corner twist directions share a
        prime. List edges before corners, longest cycles first, with oriented
        cycles before misoriented cycles of the same length.
        """
        groups = []
        for permutation, orientations, modulus, kind in (
            (self.edge_perm, self.edge_ori, 2, "e"),
            (self.corner_perm, self.corner_ori, 3, "c"),
        ):
            visited = set()
            cycles = []
            for start in range(len(permutation)):
                if start in visited:
                    continue
                position, length, orientation = start, 0, 0
                while position not in visited:
                    visited.add(position)
                    length += 1
                    orientation += orientations[position]
                    position = permutation[position]
                misoriented = orientation % modulus != 0
                if length > 1 or misoriented:
                    cycles.append((length, misoriented))
            cycles.sort(key=lambda cycle: (-cycle[0], cycle[1]))
            groups.append("".join(
                str(length) + kind + ("'" if misoriented else "")
                for length, misoriented in cycles
            ))
        return " ".join(group for group in groups if group) or "Solved"

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
        target_perm=None,
        order=None
    ):
        """
        Find the next unsolved, unvisited edge position
        relative to the desired target permutation.
        """

        if target_perm is None:
            target_perm = list(range(12))

        for position in EDGE_BUFFER_ORDER if order is None else order:

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
        pseudoswap_edge_2=None,
        floating_buffers=None,
        auto_standalone=False,
        deferred_flips=None,
        flip_order=None,
        even_cycle_break_order=None,
        odd_cycle_break_order=None,
        odd_cycle_break_overrides=None
    ):
        """Trace edges, optionally switching through enabled floating buffers.

        floating_buffers contains enabled edge position IDs in priority order.
        If the starting buffer is listed, only entries after it are considered.
        With return_floating, an actual switch adds from_buffer and to_buffer
        to the opportunity record; after_target is its offset in the trace.
        Omitting floating_buffers preserves the normal fixed-buffer trace.
        """
        if even_cycle_break_order is not None and (len(even_cycle_break_order) != 12 or set(even_cycle_break_order) != set(range(12))):
            raise ValueError('Invalid even edge cycle-break order.')
        if odd_cycle_break_order is not None and (len(odd_cycle_break_order) != 12 or set(odd_cycle_break_order) != set(range(12))):
            raise ValueError('Invalid odd edge cycle-break order.')
        odd_cycle_break_overrides = odd_cycle_break_overrides or {}
        for target, order in odd_cycle_break_overrides.items():
            if target not in format_edge_trace([(p, o) for p in range(12) for o in range(2)]) or len(order) != 12 or set(order) != set(range(12)):
                raise ValueError('Invalid edge target-specific cycle-break order.')
        pending_flips = set(deferred_flips or [])
        flip_order = list(flip_order or floating_buffers or [])
        flip_order += [p for p in range(12) if p not in flip_order]
        floating_buffers = list(floating_buffers or [])
        opportunity_recorded = False
        if any(type(position) is not int or position not in range(12)
               for position in floating_buffers):
            raise ValueError("Floating buffers must be edge position IDs (0–11).")
        if len(set(floating_buffers)) != len(floating_buffers):
            raise ValueError("Floating buffers must not contain duplicates.")
        if buffer in floating_buffers:
            floating_buffers = floating_buffers[floating_buffers.index(buffer) + 1:]

        parity = self.has_parity()

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

        # The closing orientation includes every edge in the buffer cycle,
        # relative to the target permutation (including pseudoswap).
        targets, cycle_visited, buffer_ori = self.trace_edge_cycle(buffer, target_perm)
        trace.extend(targets)
        visited.update(cycle_visited)
        if targets:
            cycles.append(targets.copy())
        buffer_target_count = len(trace)
        buffer_solved_at = buffer_target_count if buffer_ori == 0 else None

        # ---------------------------------------------------------
        # Trace remaining cycles
        # ---------------------------------------------------------

        while True:
            cycle_break = self.find_edge_cycle_break(
                visited,
                buffer,
                target_perm,
                order=even_cycle_break_order if len(trace) % 2 == 0 else odd_cycle_break_overrides.get(format_edge_trace([trace[-1]])[0], odd_cycle_break_order)
            )


            # Check before consuming the next cycle: a solved buffer can
            # float at a pair boundary, including before the first target.
            if (
                buffer_solved_at is not None
                and buffer_solved_at % 2 == 0
                and not opportunity_recorded
                and (cycle_break is not None or any(p in pending_flips for p in floating_buffers))
            ):
                opportunity_recorded = True
                floating_opportunities.append({
                    "after_target": buffer_solved_at
                })

                next_buffer = next((
                    position for position in floating_buffers
                    if position not in visited
                    and (
                        self.edge_perm[position] != target_perm[position]
                        or self.edge_ori[position] != 0
                        or position in pending_flips
                    )
                ), None)

                if next_buffer in pending_flips:
                    index = flip_order.index(next_buffer)
                    partner_order = flip_order[index + 1:] + flip_order[:index]
                    partner = next((p for p in partner_order if p in pending_flips), None)
                    if partner is not None:
                        floating_opportunities[-1].update({
                            "two_flip": [next_buffer, partner],
                        })
                        pending_flips.difference_update((next_buffer, partner))
                        visited.update((next_buffer, partner))
                        # Keep intervening buffers eligible; the partner will
                        # be skipped because it has already been solved.
                        floating_buffers = floating_buffers[floating_buffers.index(next_buffer) + 1:]
                        opportunity_recorded = False
                        continue

                if next_buffer is not None:
                    floating_opportunities[-1].update({
                        "from_buffer": buffer,
                        "to_buffer": next_buffer,
                    })
                    buffer = next_buffer
                    floating_buffers = floating_buffers[
                        floating_buffers.index(next_buffer) + 1:
                    ]
                    targets, cycle_visited, buffer_ori = self.trace_edge_cycle(
                        buffer, target_perm
                    )
                    if buffer in pending_flips:
                        pending_flips.remove(buffer)
                        buffer_ori = 1
                        floating_opportunities[-1]["flipped_buffer"] = buffer
                    # A buffer's own cycle needs no cycle-break bookends.
                    trace.extend(targets)
                    visited.update(cycle_visited)
                    if targets:
                        cycles.append(targets.copy())
                    buffer_target_count = len(trace)
                    buffer_solved_at = (
                        buffer_target_count if buffer_ori == 0 else None
                    )
                    # Track the new buffer independently, while offsets and
                    # target counts remain relative to the complete memo.
                    opportunity_recorded = False
                    continue

            if cycle_break is None:
                break

            # A complete even cycle at a pair boundary can use its own
            # opening sticker as buffer, omitting both cycle-break targets.
            if (auto_standalone and cycle_break in floating_buffers
                    and len(trace) % 2 == 0):
                standalone_targets, standalone_visited, closing_ori = self.trace_edge_cycle(cycle_break, target_perm)
                if standalone_targets and len(standalone_targets) % 2 == 0 and closing_ori == 0:
                    floating_opportunities.append({
                        "after_target": len(trace),
                        "from_buffer": buffer,
                        "to_buffer": cycle_break,
                        "standalone": True,
                    })
                    # Solve this independent cycle without discarding the
                    # active buffer's outstanding flip. Resume that buffer
                    # afterwards so later misoriented cycles still resolve it.
                    trace.extend(standalone_targets)
                    cycles.append(standalone_targets.copy())
                    visited.update(standalone_visited)
                    floating_opportunities.append({
                        "after_target": len(trace),
                        "from_buffer": cycle_break,
                        "to_buffer": buffer,
                        "standalone_return": True,
                    })
                    buffer_target_count = len(trace)
                    buffer_solved_at = buffer_target_count if buffer_ori == 0 else None
                    opportunity_recorded = False
                    continue

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

            # -----------------------------------------------------
            # Track progress toward solving the selected buffer.
            # -----------------------------------------------------

            buffer_target_count = len(trace)
            buffer_ori ^= closing_ori
            buffer_solved_at = buffer_target_count if buffer_ori == 0 else None

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
                return targets, visited, next_sticker_ori

            targets.append((next_piece, next_sticker_ori))
            current = next_piece
            current_sticker_ori = next_sticker_ori
    
    def find_corner_cycle_break(self, visited, buffer=UFR, order=None):
        for position in CORNER_BUFFER_ORDER if order is None else order:

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
        return_floating=False,
        floating_buffers=None,
        auto_standalone=False,
        even_cycle_break_order=None,
        odd_cycle_break_order=None,
        odd_cycle_break_overrides=None
    ):
        """Trace corners, switching to enabled buffers after solved pairs.

        Buffer priorities and switch records follow the edge tracing API.
        With no floating buffers, retain fixed-buffer tracing.
        """
        if even_cycle_break_order is not None and (len(even_cycle_break_order) != 8 or set(even_cycle_break_order) != set(range(8))):
            raise ValueError('Invalid even corner cycle-break order.')
        if odd_cycle_break_order is not None and (len(odd_cycle_break_order) != 8 or set(odd_cycle_break_order) != set(range(8))):
            raise ValueError('Invalid odd corner cycle-break order.')
        odd_cycle_break_overrides = odd_cycle_break_overrides or {}
        for target, order in odd_cycle_break_overrides.items():
            if target not in format_corner_trace([(p, o) for p in range(8) for o in range(3)]) or len(order) != 8 or set(order) != set(range(8)):
                raise ValueError('Invalid corner target-specific cycle-break order.')
        floating_buffers = list(floating_buffers or [])
        if any(type(position) is not int or position not in range(8)
               for position in floating_buffers):
            raise ValueError("Floating buffers must be corner position IDs (0–7).")
        if len(set(floating_buffers)) != len(floating_buffers):
            raise ValueError("Floating buffers must not contain duplicates.")
        if buffer in floating_buffers:
            floating_buffers = floating_buffers[floating_buffers.index(buffer) + 1:]
        opportunity_recorded = False
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
                buffer,
                order=even_cycle_break_order if len(trace) % 2 == 0 else odd_cycle_break_overrides.get(format_corner_trace([trace[-1]])[0], odd_cycle_break_order)
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
                and not opportunity_recorded
            ):
                opportunity_recorded = True
                floating_opportunities.append({
                    "after_target": buffer_solved_at
                })
                next_buffer = next((
                    position for position in floating_buffers
                    if position not in visited
                    and (self.corner_perm[position] != position
                         or self.corner_ori[position] != 0)
                ), None)
                if next_buffer is not None:
                    floating_opportunities[-1].update({
                        "from_buffer": buffer,
                        "to_buffer": next_buffer,
                    })
                    buffer = next_buffer
                    floating_buffers = floating_buffers[
                        floating_buffers.index(next_buffer) + 1:
                    ]
                    targets, cycle_visited, closing_ori = self.trace_corner_cycle(buffer)
                    trace.extend(targets)
                    visited.update(cycle_visited)
                    if targets:
                        cycles.append(targets.copy())
                    # Closing orientation is the negative sum of cycle twists.
                    buffer_ori = (-closing_ori) % 3
                    buffer_target_count = len(trace)
                    buffer_solved_at = buffer_target_count if buffer_ori == 0 else None
                    opportunity_recorded = False
                    continue

            # -----------------------------------------------------
            # Trace the cycle break normally.
            # -----------------------------------------------------

            # A complete even cycle at a pair boundary can use its own
            # opening sticker as buffer, omitting both cycle-break targets.
            if (auto_standalone and cycle_break in floating_buffers
                    and len(trace) % 2 == 0):
                standalone_targets, standalone_visited, closing_ori = self.trace_corner_cycle(cycle_break)
                if standalone_targets and len(standalone_targets) % 2 == 0 and closing_ori == 0:
                    floating_opportunities.append({
                        "after_target": len(trace),
                        "from_buffer": buffer,
                        "to_buffer": cycle_break,
                        "standalone": True,
                    })
                    # This independent cycle does not change the active
                    # buffer or resolve its outstanding orientation.
                    trace.extend(standalone_targets)
                    cycles.append(standalone_targets.copy())
                    visited.update(standalone_visited)
                    floating_opportunities.append({
                        "after_target": len(trace),
                        "from_buffer": cycle_break,
                        "to_buffer": buffer,
                        "standalone_return": True,
                    })
                    buffer_target_count = len(trace)
                    buffer_solved_at = buffer_target_count if buffer_ori == 0 else None
                    opportunity_recorded = False
                    continue

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

            buffer_target_count = len(trace)
            buffer_ori = (buffer_ori - closing_ori) % 3
            buffer_solved_at = buffer_target_count if buffer_ori == 0 else None

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
    
    def rotate_face_map_x(self, face_map):
        """
        Update the notation reference frame after an x rotation.

        The map stores which original face is now at each position.
        An x rotation brings F to U, U to B, B to D, and D to F.

        R and L are unchanged.
        """
        old = face_map.copy()

        face_map["U"] = old["F"]
        face_map["B"] = old["U"]
        face_map["D"] = old["B"]
        face_map["F"] = old["D"]


    def rotate_face_map_y(self, face_map):
        """
        Update the notation reference frame after a y rotation.
        """
        old = face_map.copy()

        face_map["F"] = old["R"]
        face_map["R"] = old["B"]
        face_map["B"] = old["L"]
        face_map["L"] = old["F"]


    def rotate_face_map_z(self, face_map):
        """
        Update the notation reference frame after a z rotation.
        """
        old = face_map.copy()

        face_map["U"] = old["L"]
        face_map["R"] = old["U"]
        face_map["D"] = old["R"]
        face_map["L"] = old["D"]

    def apply_scramble(self, scramble):
        moves = scramble.split()

        valid_faces = {"U", "R", "F", "D", "L", "B"}

        face_map = {
            "U": "U",
            "R": "R",
            "F": "F",
            "D": "D",
            "L": "L",
            "B": "B",
        }

        for move in moves:

            # Separate the face from the modifier.
            # Examples:
            # R  -> ("R", "")
            # U' -> ("U", "'")
            # F2 -> ("F", "2")

            face = move[0]
            modifier = move[1:]

            if face not in valid_faces:
                raise ValueError(f"Invalid move: {move}")

            # -------------------------------------------------
            # Wide move
            # -------------------------------------------------

            if modifier.startswith("w"):
                wide_modifier = modifier[1:]
                if wide_modifier not in {"", "'", "2"}:
                    raise ValueError(f"Invalid move: {move}")

                opposite = {
                    "R": "L",
                    "L": "R",
                    "U": "D",
                    "D": "U",
                    "F": "B",
                    "B": "F",
                }

                # Turn the opposite face.
                actual_face = face_map[opposite[face]]
                self.move(actual_face + wide_modifier)

                # Then perform the corresponding rotation.
                rotation = {
                    "R": ("x", 1),
                    "L": ("x", -1),
                    "U": ("y", 1),
                    "D": ("y", -1),
                    "F": ("z", 1),
                    "B": ("z", -1),
                }

                axis, direction = rotation[face]

                # Prime reverses the rotation.
                if wide_modifier == "'":
                    direction *= -1

                # A double wide move means a 180° rotation.
                turns = 2 if wide_modifier == "2" else 1

                for _ in range(turns):
                    if axis == "x":
                        if direction == 1:
                            self.rotate_face_map_x(face_map)
                        else:
                            for _ in range(3):
                                self.rotate_face_map_x(face_map)

                    elif axis == "y":
                        if direction == 1:
                            self.rotate_face_map_y(face_map)
                        else:
                            for _ in range(3):
                                self.rotate_face_map_y(face_map)

                    elif axis == "z":
                        if direction == 1:
                            self.rotate_face_map_z(face_map)
                        else:
                            for _ in range(3):
                                self.rotate_face_map_z(face_map)

            # -------------------------------------------------
            # Normal face move
            # -------------------------------------------------

            else:
                if modifier not in {"", "'", "2"}:
                    raise ValueError(f"Invalid move: {move}")

                actual_face = face_map[face]

                self.move(actual_face + modifier)
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
