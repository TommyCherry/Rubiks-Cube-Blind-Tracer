-- Reduced, read-only WCA history projection. No Phase 1 tables are changed.
-- Original IDs are supplied by the importer; no new history IDs are generated.
CREATE TABLE competitions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    day INTEGER NOT NULL
);

CREATE TABLE results (
    id BIGINT PRIMARY KEY,
    competition_id TEXT NOT NULL,
    event_id TEXT NOT NULL CHECK (event_id = '333bf'),
    round_type_id TEXT NOT NULL,
    person_id TEXT NOT NULL
);
CREATE INDEX idx_results_person_event ON results (person_id, event_id);

-- The source has no primary key here: preserve duplicate rows if present.
CREATE TABLE result_attempts (
    value INTEGER NOT NULL,
    attempt_number SMALLINT NOT NULL,
    result_id BIGINT NOT NULL
);
CREATE INDEX idx_result_attempts_result ON result_attempts (result_id);

CREATE TABLE scrambles (
    id BIGINT PRIMARY KEY,
    competition_id TEXT NOT NULL,
    event_id TEXT NOT NULL CHECK (event_id IN ('333bf', '333mbf')),
    round_type_id TEXT NOT NULL,
    group_id TEXT NOT NULL,
    is_extra SMALLINT NOT NULL CHECK (is_extra IN (0, 1)),
    scramble_num INTEGER NOT NULL,
    scramble TEXT NOT NULL
);
CREATE INDEX idx_scrambles_history ON scrambles
    (competition_id, event_id, round_type_id, is_extra, scramble_num);
CREATE INDEX idx_scrambles_event_competition ON scrambles (event_id, competition_id);

-- All-event attendance, restricted only to competitions with multi-blind sets.
-- It must NOT be derived just from the reduced 333bf results table.
CREATE TABLE wca_attendance (
    person_id TEXT NOT NULL,
    competition_id TEXT NOT NULL,
    PRIMARY KEY (person_id, competition_id)
);
