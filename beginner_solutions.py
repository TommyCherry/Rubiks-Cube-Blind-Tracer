"""User-maintained Old Pochmann examples (UR edges, UBL corners).

Each recipe is setup + named permutation + undo setup. These are single
sticker targets, unlike the expert page's paired 3-style examples.
"""

OP_EDGE_ALGORITHMS = {
    'Ja-perm': "x R2' F R F' R U2 Rw' U Rw U2 x'",
    'Jb-perm': "R U R' F' R U R' U' R' F R2 U' R' U'",
    'T-perm': "R U R' U' R' F R2 U' R' U' R U R' F'",
}

OP_EDGE_RECIPES = {
    'UB': 'Ja-perm',
    'UF': 'Jb-perm',
    'UL': 'T-perm',
    'LU': "L' Dw L' T-perm L Dw' L",
    'LF': "Dw' L T-perm L' Dw",
    'LD': "D Lw' Jb-perm Lw D'",
    'LB': "Dw L' T-perm L Dw'",
    'FU': "Lw' Ja-perm Lw",
    'FR': "Dw2 L T-perm L' Dw2",
    'FD': "Lw' Jb-perm Lw",
    'FL': "L' T-perm L",
    'RB': "Dw L T-perm L' Dw'",
    'RD': "D' Lw' Jb-perm Lw D",
    'RF': "Dw' L' T-perm L Dw",
    'BU': "Lw Jb-perm Lw'",
    'BL': "L T-perm L'",
    'BD': "Lw Ja-perm Lw'",
    'BR': "Dw2 L' T-perm L Dw2",
    'DF': 'Lw2 Ja-perm Lw2',
    'DR': "D2 L2 T-perm L2 D2",
    'DB': 'Lw2 Jb-perm Lw2',
    'DL': 'L2 T-perm L2',
}


def op_edge_examples(targets, letter_scheme):
    """Preserve target order, repeated cycle-break targets, and custom letters."""
    examples = []
    for target in targets:
        recipe = OP_EDGE_RECIPES.get(target)
        row = dict(memo=letter_scheme[target], positions=['UR', target])
        if recipe is None:
            row['error'] = 'No OP edge algorithm has been defined for this target.'
        else:
            row.update(recipe=recipe, algorithm=' '.join(
                OP_EDGE_ALGORITHMS.get(token, token) for token in recipe.split()))
        examples.append(row)
    return examples


OP_CORNER_ALGORITHM = "F R U' R' U' R U R' F' R U R' U' R' F R F'"

# The supplied setup letters are Speffz. Store sticker positions so changing the
# displayed letter scheme cannot change which physical target an algorithm solves.
OP_CORNER_SETUPS = {
    'UFR': '',          # C: helper
    'UBR': 'R2 D R2',   # B
    'UFL': 'F2 D R2',   # D
    'LUF': 'F',         # F
    'LDF': 'D R',       # G
    'LDB': "D2 F'",     # H
    'FUL': 'F2 R',      # I
    'FUR': 'F R',       # J
    'FDR': 'R',         # K
    'FDL': "D F'",      # L
    'RUF': "R' F'",     # M
    'RUB': "R2 F'",     # N
    'RDB': "D' R",      # O
    'RDF': "F'",        # P
    'BUR': "R'",        # Q
    'BDL': 'D2 R',      # S
    'BDR': "D' F'",     # T
    'DFL': 'F2',        # U
    'DFR': 'D R2',      # V
    'DBR': 'R2',        # W
    'DBL': "D' R2",     # X
}


def inverse_setup(setup):
    return ' '.join(move if move.endswith('2') else move[:-1] if move.endswith("'") else move + "'"
                    for move in reversed(setup.split()))


def op_corner_examples(targets, letter_scheme):
    examples = []
    for target in targets:
        setup = OP_CORNER_SETUPS.get(target)
        row = dict(kind='corner', memo=letter_scheme[target], positions=['UBL', target])
        if setup is None:
            row['error'] = 'No OP corner algorithm has been defined for this target.'
        else:
            undo = inverse_setup(setup)
            row.update(recipe=' '.join(part for part in (setup, 'Y-perm', undo) if part),
                       algorithm=' '.join(part for part in (setup, OP_CORNER_ALGORITHM, undo) if part))
        examples.append(row)
    return examples
