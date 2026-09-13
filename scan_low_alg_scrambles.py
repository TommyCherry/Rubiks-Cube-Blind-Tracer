"""Scan the local WCA database using the sandwiching, LTCT, T2C, all floating buffers and UF/UR pseudoswap."""
import argparse
import json
from pathlib import Path
import time

from app import get_db_connection, trace_scramble, SPEFFZ, UF, UR, UFR, EDGE_BUFFER_OPTIONS, CORNER_BUFFER_OPTIONS


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--max-algs', type=int, default=6)
    parser.add_argument('--output', default='instance/low_alg_3bld.json')
    args = parser.parse_args()
    if args.max_algs < 0:
        parser.error('--max-algs must be non-negative')
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    settings = dict(edge_buffer=UF, corner_buffer=UFR, use_pseudoswap=True,
                    pseudoswap_edge_1=UF, pseudoswap_edge_2=UR,
                    floating_buffers=list(range(len(EDGE_BUFFER_OPTIONS))),
                    corner_floating_buffers=list(range(len(CORNER_BUFFER_OPTIONS))),
                    include_basic_sandwiching=True, include_ltct=True, include_t2c=True,
                    letter_scheme=SPEFFZ)
    matches, failures = [], []
    cannes = []
    count = 0
    started = time.monotonic()
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT s.id, s.competition_id, c.name AS competition,
                   s.round_type_id AS round, s.group_id AS scramble_group,
                   s.scramble_num, s.is_extra, s.scramble
            FROM scrambles s
            JOIN competitions c ON c.id = s.competition_id
            WHERE s.event_id = '333bf'
            ORDER BY s.id
        """)
        for row in cursor:
            count += 1
            try:
                if not row['scramble'] or not row['scramble'].strip():
                    raise ValueError('Empty scramble')
                result = trace_scramble(row['scramble'], **settings)
                if row['competition_id'] == 'CannesOpen2015':
                    cannes.append(dict(row, alg_count=result['alg_count']))
                if result['alg_count'] <= args.max_algs:
                    matches.append(dict(row, alg_count=result['alg_count']))
            except ValueError as exc:
                failures.append(dict(row, error=str(exc)))
            if count % 10000 == 0:
                print(f'{count:,} scanned; {len(matches):,} matches; {time.monotonic() - started:.0f}s', flush=True)
    finally:
        cursor.close()
        connection.close()
    matches.sort(key=lambda row: (row['alg_count'], row['competition_id'], row['id']))
    report = dict(scanned=count, max_algs=args.max_algs,
                  settings=settings,
                  competition_evaluations={'CannesOpen2015': cannes},
                  matches=matches, failures=failures)
    output.write_text(json.dumps(report, indent=2) + '\n')
    text_path = output.with_suffix('.txt')
    def format_row(row):
        return (f"{row['alg_count']} algs | {row['competition']} | Round {row['round']} | Group {row['scramble_group']} | Scramble {row['scramble_num']}"
                + (' (extra)' if row['is_extra'] else '') + f"\n{row['scramble']}\n")
    text = ('Settings: UF / UFR; sandwiching, LTCT, T2C; UF/UR pseudoswap; all floating buffers.\n'
            + 'Edge priority: ' + ', '.join(EDGE_BUFFER_OPTIONS) + '\n'
            + 'Corner priority: ' + ', '.join(CORNER_BUFFER_OPTIONS) + '\n\n'
            + f'All 3BLD scrambles with {args.max_algs} or fewer estimated algorithms\n\n')
    text += '\n'.join(format_row(row) for row in matches)
    text += '\n\nCannes Open 2015 — all 3BLD scrambles (no alg-count cutoff)\n\n'
    text += '\n'.join(format_row(row) for row in cannes)
    text_path.write_text(text)
    print(f'Complete: {count:,} scanned, {len(matches):,} matches, {len(failures):,} invalid. Results: {text_path}', flush=True)


if __name__ == '__main__':
    main()
