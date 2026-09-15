"""BLDDB manmade edge examples, fetched on demand and verified locally."""
import json
import re
import time
import tempfile
from pathlib import Path
from urllib.parse import urlencode

import requests
from Cube import Cube, EDGE_TARGET_NAMES

BASE = 'https://raw.githubusercontent.com/nbwzx/blddb/main/assets/json/'
POSITION_CODES = dict(zip(
    'UB UR UF UL LU LF LD LB FU FR FD FL RU RB RD RF BU BL BD BR DF DR DB DL'.split(),
    'EGACDTLX BQJS HZPR F WNY IOMK'.replace(' ', '')))


def expand_moves(algorithm):
    """Express slices, rotations and lowercase wides in the tracer's notation."""
    equivalents = {'M': 'Lw L\'', 'E': 'Dw D\'', 'S': 'Fw F\'',
                   'x': 'Rw L\'', 'y': 'Uw D\'', 'z': 'Fw B\''}
    result = []
    for token in algorithm.split():
        match = re.fullmatch(r"([URFDLBMESxyzurfdlb])(w?)(2'?|')?", token)
        if not match:
            raise ValueError('Unsupported algorithm notation')
        face, wide, suffix = match.groups()
        if face in 'urfdlb':
            face, wide = face.upper(), 'w'
        if face in equivalents and not wide:
            moves = equivalents[face].split()
            if suffix == "'":
                moves = [move[:-1] if move.endswith("'") else move + "'" for move in reversed(moves)]
            result.extend(moves * (2 if suffix and suffix.startswith('2') else 1))
        else:
            result.append(face + wide + ('2' if suffix and suffix.startswith('2') else suffix or ''))
    return ' '.join(result)


def verifies_case(positions, algorithm):
    cube = Cube()
    moves = expand_moves(algorithm).split()
    inverse = ' '.join(move if move.endswith('2') else move[:-1] if move.endswith("'") else move + "'" for move in reversed(moves))
    cube.apply_scramble(inverse)
    stickers = {value: key for key, value in EDGE_TARGET_NAMES.items()}
    cycle = [stickers[position] for position in positions]
    expected = Cube()
    for (position, orientation), (target, target_orientation) in zip(cycle, cycle[1:] + cycle[:1]):
        expected.edge_perm[position] = target
        expected.edge_ori[position] = orientation ^ target_orientation
    return cube.get_state() == expected.get_state()



def dataset(cache_dir, filename):
    path = Path(cache_dir) / filename
    if path.exists() and time.time() - path.stat().st_mtime < 86400:
        return json.loads(path.read_text())
    try:
        response = requests.get(BASE + filename, timeout=15)
        response.raise_for_status()
        data = response.json()
        if not isinstance(data, dict):
            raise ValueError('Invalid BLDDB data')
        path.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.NamedTemporaryFile(mode='w', dir=path.parent, delete=False) as output:
            json.dump(data, output)
            temporary = Path(output.name)
        temporary.replace(path)
        return data
    except (requests.RequestException, ValueError):
        if path.exists():
            return json.loads(path.read_text())
        raise


def edge_example(positions, algorithms, standard):
    row = {'positions': positions, 'url': 'https://v2.blddb.net/edge?' + urlencode({'position': '-'.join(positions), 'mode': 'manmade'})}
    code = ''.join(POSITION_CODES[position] for position in positions)
    entries = algorithms.get(standard.get(code, code), [])
    if not entries:
        return dict(row, error='No manmade algorithm found for this case.')
    algorithm = entries[0][0][0]
    try:
        valid = verifies_case(positions, algorithm)
    except (ValueError, KeyError, TypeError):
        valid = False
    if not valid:
        return dict(row, error='The first algorithm could not be verified for this case.')
    return dict(row, algorithm=algorithm, contributors=entries[0][1])
