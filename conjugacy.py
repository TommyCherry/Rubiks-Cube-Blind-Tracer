"""Exact cycle-class sampling and conversion to standard URFDLB facelets."""
import random
import re
from Cube import Cube, EDGE_TARGET_NAMES, CORNER_TARGET_NAMES


def parse_class(text):
    if not isinstance(text, str) or not text.strip() or len(text) > 200:
        raise ValueError("Enter a conjugacy class, for example 3e3e'1e' 3c.")
    compact = re.sub(r'\s+', '', text.lower().replace('’', "'").replace('′', "'"))
    tokens = re.findall(r"([0-9]+)([ec])('?)", compact)
    if not tokens or ''.join(n + k + p for n, k, p in tokens) != compact:
        raise ValueError("Use cycle lengths followed by e or c and an optional prime, such as 3e3e'1e' 3c.")
    cycles = {'e': [], 'c': []}
    for number, kind, prime in tokens:
        length = int(number)
        if not 1 <= length <= (12 if kind == 'e' else 8):
            raise ValueError("Edge cycle lengths must be 1–12; corner cycle lengths must be 1–8.")
        cycles[kind].append((length, bool(prime)))
    for kind, limit in [('e', 12), ('c', 8)]:
        if sum(length for length, _ in cycles[kind]) > limit:
            raise ValueError(f"The class uses more than {limit} {'edges' if kind == 'e' else 'corners'}.")
    if sum(prime for _, prime in cycles['e']) % 2:
        raise ValueError("A legal cube needs an even number of primed edge cycles.")
    if sum(prime for _, prime in cycles['c']) == 1:
        raise ValueError("One primed corner cycle cannot balance its twist. Use zero or at least two.")
    if sum(length - 1 for length, _ in cycles['e']) % 2 != sum(length - 1 for length, _ in cycles['c']) % 2:
        raise ValueError("Edge and corner permutation parity must match. An even-length cycle changes parity.")
    return cycles


def generate_state(text, rng=None):
    cycles = parse_class(text)
    rng = rng or random.SystemRandom()
    cube = Cube()
    # Sample corner cycle totals uniformly among legal assignments, with no rejection loop.
    count = sum(prime for _, prime in cycles['c'])
    ways = [[1, 0, 0]]
    for _ in range(count):
        ways.append([ways[-1][(total - 1) % 3] + ways[-1][(total - 2) % 3] for total in range(3)])
    corner_totals = []
    needed = 0
    for remaining in range(count, 0, -1):
        one = ways[remaining - 1][(needed - 1) % 3]
        two = ways[remaining - 1][(needed - 2) % 3]
        total = 1 if rng.randrange(one + two) < one else 2
        corner_totals.append(total)
        needed = (needed - total) % 3
    for kind, permutation, orientations, modulus in [
        ('e', cube.edge_perm, cube.edge_ori, 2), ('c', cube.corner_perm, cube.corner_ori, 3)
    ]:
        positions = list(range(len(permutation)))
        rng.shuffle(positions)
        offset = 0
        for length, prime in cycles[kind]:
            members = positions[offset:offset + length]
            offset += length
            total = (1 if kind == 'e' else corner_totals.pop()) if prime else 0
            assigned = [rng.randrange(modulus) for _ in range(length - 1)]
            assigned.append((total - sum(assigned)) % modulus)
            for index, position in enumerate(members):
                permutation[position] = members[(index + 1) % length]
                orientations[position] = assigned[index]
    return cube


# Facelet numbers are zero-based in URFDLB order. Each row follows our
# orientation-index order (the first character of each TARGET_NAMES entry).
EDGE_FACELETS = [(7,19), (1,46), (5,10), (3,37), (23,12), (21,41),
                 (28,25), (34,52), (32,16), (30,43), (48,14), (50,39)]
CORNER_FACELETS = [(8,9,20), (6,18,38), (2,45,11), (0,36,47),
                   (29,26,15), (27,44,24), (35,17,51), (33,53,42)]


def to_facelets(cube):
    facelets = list('U' * 9 + 'R' * 9 + 'F' * 9 + 'D' * 9 + 'L' * 9 + 'B' * 9)
    for permutation, orientations, slots, names, modulus in [
        (cube.edge_perm, cube.edge_ori, EDGE_FACELETS, EDGE_TARGET_NAMES, 2),
        (cube.corner_perm, cube.corner_ori, CORNER_FACELETS, CORNER_TARGET_NAMES, 3),
    ]:
        for position, piece in enumerate(permutation):
            for sticker in range(modulus):
                facelets[slots[position][(sticker + orientations[position]) % modulus]] = names[(piece, sticker)][0]
    return ''.join(facelets)
