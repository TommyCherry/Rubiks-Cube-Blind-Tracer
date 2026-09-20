"""Shared history SQL for the app and migration parity verification."""

THREE_BLIND_SQL = """
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


def multiblind_sql(postgres=False):
    # Only these fixed table names are interpolated; all values are bound.
    attendance_table = "wca_attendance" if postgres else "results"
    return f"""
                SELECT c.name AS competition_name, s.competition_id,
                       c.year, c.month, c.day, s.round_type_id,
                       s.group_id, s.scramble_num, s.is_extra, s.scramble
                FROM scrambles s
                JOIN competitions c ON c.id = s.competition_id
                WHERE s.event_id = %s
                  AND EXISTS (
                      SELECT 1 FROM {attendance_table} r
                      WHERE r.competition_id = s.competition_id AND r.person_id = %s
                  )
                ORDER BY c.year DESC, c.month DESC, c.day DESC,
                         s.competition_id, s.round_type_id, s.group_id,
                         s.is_extra, s.scramble_num
            """
