# Phase 2: Official Solve History on Neon

This phase uses the **same Neon database and runtime `DATABASE_URL` as Phase 1**.
It does not modify preset or bulk tables, routes, OAuth, or history templates.
The four source tables remain untouched in local MySQL.

## What is imported, and why it is smaller

| PostgreSQL table | Source projection | Reason |
| --- | --- | --- |
| `competitions` | All IDs, names, years, months, days | History headings and dates; other competition metadata is unused. |
| `results` | Only `event_id = '333bf'`; original ID, competition/event/round IDs, person ID | Only 3BLD history consumes result records. |
| `result_attempts` | All rows joined to the retained 3BLD results | Preserve attempt numbers, signed values including DNF/DNS/zero, and even duplicate source rows. |
| `scrambles` | All `333bf` and `333mbf` rows; every source column | Preserve groups, IDs, extras, exact text and line endings. Includes 3BLD extras used by the scan utility. |
| `wca_attendance` | Distinct `(person_id, competition_id)` from **all events**, restricted to competitions that have `333mbf` scrambles | Multi-blind shows sets at competitions the person attended in any event, whether or not they attempted multi-blind. |

The 3BLD query keeps its existing joins, sorting, and exclusion of extra scrambles.
The PostgreSQL multi-blind query uses `wca_attendance` for its `EXISTS` check;
local MySQL still uses all-event `results`. No other multi-blind query semantics
change. It still includes extra sets and splits newline-separated cubes for display.
No `333mbf` result/attempt records need to be imported because the existing feature
shows competition scramble sets, not personal multi-blind results.

At implementation time the local projection contained 18,632 competitions,
193,510 3BLD results, 611,265 attempts, 108,467 scrambles, and 243,744 attendance
pairs. A complete test import occupied approximately 120 MiB including indexes
in PostgreSQL (versus roughly 2.5 GB of original MySQL table data). This is a
measurement of the local test copy, not a Neon storage/billing guarantee. Run
`inspect` against your current export for updated counts.

## Environment

- Keep Vercel's pooled `DATABASE_URL` pointed at the existing Phase 1 database.
- Export `DATABASE_URL_DIRECT` in your local migration shell, pointing to the
  **same database/branch**, using Neon's direct URL with its TLS parameters.
- No additional Vercel variables are required. OAuth variables and
  `FLASK_SECRET_KEY` stay unchanged.
- Source MySQL configuration is optional when using the previous local defaults:

| Local environment variable | Default |
| --- | --- |
| `WCA_MYSQL_HOST` | `localhost` |
| `WCA_MYSQL_PORT` | `3306` |
| `WCA_MYSQL_USER` | `root` |
| `WCA_MYSQL_PASSWORD` | Empty |
| `WCA_MYSQL_DATABASE` | `wca_results` |

These MySQL settings also configure the local fallback. Do not set them on Vercel
for Phase 2. A configured but unavailable PostgreSQL database never falls back to
MySQL. Vercel/production without `DATABASE_URL` fails closed via the existing
Phase 1 production guard. Local development without it still uses MySQL.

If a password is needed, load it without putting it in shell history:

```sh
printf 'Local MySQL password (input hidden): '
stty -echo
IFS= read -r WCA_MYSQL_PASSWORD
stty echo
printf '\n'
export WCA_MYSQL_PASSWORD
```

Use the same hidden-input process for `DATABASE_URL_DIRECT` if it is not already
exported. Do not paste credentials into source files or commands committed to Git.
The scripts do not automatically load `.env` files.

## 1. Initialize schema

Run from the repository root with your Python environment active:

```sh
python3 -m pip install -r requirements.txt
python3 scripts/persistent_data.py init
```

The existing versioned migration runner skips the recorded Phase 1 migration and
applies `migrations/002_wca_history.sql`. It creates only history tables and their
indexes, plus the existing runner's migration record. No PostgreSQL schema is
created during history web requests. A second `init` is a no-op after success.

## 2. Inspect and import

Keep the source export stable: do not refresh or replace the MySQL WCA tables
during import or between import and verification. Imports use a consistent,
read-only InnoDB snapshot. The source account needs SELECT access to the four
source tables; the destination migration role needs DDL/TEMP and write access to
the Phase 2 tables.

```sh
python3 scripts/wca_history.py inspect
python3 scripts/wca_history.py import-mysql
```

The importer uses an unbuffered MySQL cursor, batches of 2,000 rows, and PostgreSQL
`COPY`; it never loads the full export into Python memory. Adjust the bounded
batch size if needed:

```sh
python3 scripts/wca_history.py import-mysql --batch-size 1000
```

Each projection is streamed into a temporary staging table and checked against
its source row count and order-independent SHA-256 row fingerprint. All five
history tables are then replaced **in one transaction**. Preset and bulk tables
are never read, cleared, or written by the importer. Original source IDs remain
unchanged; history IDs are not generated locally.

The script is **safely rerunnable, not checkpoint-resumable**: rerunning starts
from the beginning and publishes a fresh complete snapshot, including updates
and deletions. Failure or interruption before commit leaves the previous snapshot
intact. Identical reruns do not duplicate attempts. Concurrent importers are
serialized by a PostgreSQL advisory lock.

Allow storage for both the old snapshot and the staged replacement plus indexes
and transaction overhead during refreshes. Readers can continue reading the old
snapshot while staging runs; publication takes table write locks, not locks on
Phase 1 tables. Run imports from your machine or a migration job, not a Vercel web
request. Large refreshes can take longer over the network.

## 3. Verify

```sh
python3 scripts/wca_history.py verify
```

This is read-only on both databases. It compares counts and fingerprints of every
projected field, including exact scramble strings, Unicode, negative values,
and duplicate multiplicities. It compares actual history queries for a sampled
3BLD competitor and an attendee without a multi-blind result at that competition.
Add your own WCA ID and other known cases:

```sh
python3 scripts/wca_history.py verify --wca-id 2015CHER07
```

`--wca-id` is repeatable. Use an ID of your choice; the example is not a credential.
Every table/query must print `MATCH`, followed by `Completed successfully.` and
exit code 0. A changed source snapshot can cause verification to fail; rerun the
import from a stable source before treating it as a transport problem.

An additional local smoke test can use the pooled `DATABASE_URL` with the new
code: log in, open My Official Solve History and public lookup, select 3BLD and
multi-blind, inspect DNF/DNS/missing scrambles/multiple groups/extras, and import a
history set into bulk. Check existing presets and saved bulk URLs still work.
Keep your local OAuth redirect while doing local login tests.

For automated PostgreSQL integration tests, set `TEST_DATABASE_URL` to a separate
test database's direct URL (the role must be able to create temporary test schemas):

```sh
python3 -m unittest discover -s tests -p 'test_postgres*.py'
```

Tests create and remove randomly named schemas, cover both phases, and skip if
`TEST_DATABASE_URL` is absent. The unrelated existing full-suite bulk limit test
still expects 1,000 rows while the application allows 10,000.

## 4. Deploy

1. Apply schema, import, and verify before deploying the new app code. The old
   Phase 1 deployment can continue using its preset and bulk tables meanwhile.
2. Commit the Phase 2 code/schema/script/docs/tests and push through your existing
   Vercel Git deployment workflow, or deploy the reviewed working tree from a
   linked Vercel project with `vercel --prod`.
3. Keep Vercel Production `DATABASE_URL` unchanged. Do not add MySQL credentials
   or the direct migration URL to the production runtime.
4. On production, verify your profile's 3BLD history and multi-blind sets, public
   lookup, history-to-bulk import, and preset saving. Also reopen an existing bulk
   URL to confirm its history annotations work.

For future WCA updates, refresh the local export, then rerun import and verify.
Never rebuild the whole Neon database: that would discard the Phase 1 user data.
