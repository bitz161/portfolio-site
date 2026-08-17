// One-off migration: moves the 3 hardcoded projects from the old
// src/lib/projects.ts static array into the new MySQL-backed
// portfolio.projects / portfolio.project_links tables.
//
// Run once: node scripts/migrate_projects.mjs
// Connects directly to swe-2's MySQL over Tailscale as root (needs INSERT,
// not available to the app's read-only portfolio_web user).

import mysql from "mysql2/promise";

const conn = await mysql.createConnection({
  host: "100.124.72.42",
  port: 3306,
  user: "root",
  password: process.env.MYSQL_ROOT_PASSWORD,
  database: "portfolio",
  charset: "utf8mb4",
});

const projects = [
  {
    slug: "data-modeling",
    title: "Data Modeling: Visa-Sponsor Jobs",
    track: "Database Management",
    progress_status: "done",
    visibility: "published",
    summary:
      "Normalize a flat, real-world jobs dataset into a 3NF MySQL schema and build analytical SQL on top.",
    description:
      "Starting from a flat table of 1,392 visa-sponsorship job postings across 414 companies, this project designs a normalized schema (companies, locations, sources, jobs), migrates the data, and writes window-function, CTE, and rollup queries to answer real questions about the market.",
    skills: ["MySQL", "3NF schema design", "ERD", "Window functions", "CTEs"],
    sort_order: 1,
    details: `
## Schema

Four tables, normalized out of one flat source table:

- **\`companies\`** (414 rows) — \`id\`, \`name\` (unique)
- **\`locations\`** (340 rows) — \`id\`, \`location_text\` (unique), \`country\`
- **\`sources\`** (4 rows) — \`id\`, \`name\` (unique) — which scrape/API a posting came from
- **\`jobs\`** (1,392 rows) — the posting itself: \`title\`, FKs to the three tables above, \`remote_type\`, \`visa_sponsorship\`, \`job_field\`, \`seniority\`, \`link\`, plus a generated \`link_hash CHAR(64)\` (\`SHA2(link, 256)\`, \`UNIQUE\`) — MySQL can't put a normal unique index on a 1000-char URL, so uniqueness is enforced on a hash of it instead.

\`job_field\`, \`remote_type\`, \`visa_sponsorship\`, and \`seniority\` were deliberately **left as plain columns** rather than normalized into lookup tables — too low-cardinality at this volume to earn the join complexity. That call gets revisited in the DBA project once the data volume changes the tradeoff.

Foreign keys: \`company_id\` is \`ON DELETE CASCADE\` (a job can't exist without its company); \`location_id\`/\`source_id\` are \`ON DELETE SET NULL\` (losing the lookup shouldn't delete the job).

## Sample query — top employers by country

A window function ranking companies by job count within each country:

\`\`\`sql
SELECT country, company_name, job_count, rank_in_country
FROM (
  SELECT
    l.country,
    c.name AS company_name,
    COUNT(*) AS job_count,
    RANK() OVER (PARTITION BY l.country ORDER BY COUNT(*) DESC) AS rank_in_country
  FROM jobs j
  JOIN companies c ON c.id = j.company_id
  LEFT JOIN locations l ON l.id = j.location_id
  WHERE l.country IS NOT NULL
  GROUP BY l.country, c.name
) ranked
WHERE rank_in_country <= 3
ORDER BY country, rank_in_country;
\`\`\`

Result for Germany, run live against the database:

| country | company_name | job_count | rank_in_country |
|---|---|---|---|
| Germany | adjoe | 44 | 1 |
| Germany | The Exploration Company | 34 | 2 |
| Germany | raisin | 19 | 3 |

Three other queries round out the analytical set: a CTE finding companies that post both remote *and* onsite roles, a \`ROLLUP\` for country × job-field subtotals (using \`GROUPING()\` to correctly distinguish the synthetic grand-total row from genuinely-unknown data — a real bug hit and fixed while building this), and an exploratory query on which source produces the most remote-eligible listings.

## A data quality note

A handful of company names carry mojibake from the original scrape (a UTF-8/Latin-1 mismatch baked into the source data before it ever reached this schema) — found but deliberately not fixed here, since it doesn't affect the schema or query logic being demonstrated. It became the motivating example for the Data Engineering project's data-quality check.
`,
    links: [],
  },
  {
    slug: "data-pipeline",
    title: "Data Engineering: Automated Ingestion Pipeline",
    track: "Database Management",
    progress_status: "done",
    visibility: "published",
    summary:
      "Airflow-orchestrated ETL that lands raw data in MinIO, transforms it, and loads it into MySQL on a schedule.",
    description:
      "Builds on the Data Modeling project's schema by feeding it real data through a scheduled, idempotent pipeline with a data-quality check step, using Airflow for orchestration and MinIO as the landing zone.",
    skills: ["Airflow", "ETL", "MinIO", "Data quality checks"],
    sort_order: 2,
    details: `
## Pipeline

Three Airflow tasks, chained via XCom:

\`\`\`
arbeitnow.com API → extract → MinIO landing/{ds}/page_1.json
                                        │
                                        ▼
                          transform_and_load → jobs table (MySQL)
                                        │
                                        ▼
                              data_quality_check
\`\`\`

1. **\`extract\`** pulls the [arbeitnow.com](https://www.arbeitnow.com/api/job-board-api) job board API and writes the raw, untransformed JSON straight to a MinIO landing bucket, partitioned by execution date — so a bug in the transform step is always replayable from exactly what was received.
2. **\`transform_and_load\`** upserts \`companies\`/\`locations\`/\`sources\` lookups, then loads \`jobs\` rows with \`INSERT IGNORE\`, keyed on the schema's existing \`link_hash\` uniqueness — the same generated column the Data Modeling project built to work around MySQL's index-length limit on long URLs turns out to be exactly the right natural dedup key for a recurring job too. No separate run-tracking table needed.
3. **\`data_quality_check\`** asserts the table isn't empty and has no rows with a missing title, failing the DAG run if either check fails.

## Idempotency, verified for real

Running the DAG twice against the same day's board data landed 175 rows the first time, then **0 additional rows** the second time — not a claim, an actual test result.

## Least-privilege credentials

The DAG connects as \`pipeline_writer\`, scoped to \`SELECT\`/\`INSERT\`/\`UPDATE\` on the jobs schema only. MinIO access is similarly scoped: the pipeline's access key can only touch the landing bucket, mirroring the pattern this site's own blog already uses for its MinIO image bucket.

## A bug, found and fixed

The first run landed real data but corrupted one title's en-dash into a replacement character. \`mysql.connector\` wasn't given an explicit charset, so it fell back to one that mangled multi-byte UTF-8 on insert — the same *class* of encoding bug flagged as a known issue in the Data Modeling project, but this time inside a pipeline under my control, so it was fixable at the source: pass \`charset="utf8mb4"\` explicitly. Reloaded and re-verified — no mojibake in the corrected run.

## Result

175 real jobs loaded, bringing the \`jobs\` table from 1,392 to 1,567 rows — all genuinely new, no collisions with the original migrated dataset.
`,
    links: [],
  },
  {
    slug: "dba-performance",
    title: "DBA: Performance Tuning at Scale",
    track: "Database Management",
    progress_status: "done",
    visibility: "published",
    summary:
      "Load the schema with a million synthetic rows and run a full slow-query diagnosis and tuning case study.",
    description:
      "Stress-tests the Data Modeling project's schema with a large synthetic dataset, then works through EXPLAIN plans, indexing, and schema fixes with before/after benchmarks, plus a backup/restore runbook.",
    skills: ["EXPLAIN", "Indexing", "Benchmarking", "Backup/restore"],
    sort_order: 3,
    details: `
## Scaling up

Cloned the Data Modeling project's exact schema into its own database, seeded with the real rows plus **1,000,000 synthetic rows** — generated set-based (a six-way cross join of ten digits, not a slow recursive loop), reusing the existing companies/locations/sources rather than inventing new lookup data. About 4 minutes end to end for the full million-row insert.

## Finding a query worth tuning

The Data Modeling project's own writeup flagged the exact case that would eventually matter: a composite index would be worth it "if the real query patterns filter on both country and date range together" — written when the dataset was too small (1,392 rows) for that to pay off. At a million rows, it does.

Query: senior roles posted in a date window, most recent first — no existing index covered \`seniority\`.

**Before** adding an index: \`EXPLAIN ANALYZE\` reported **26.8 ms** actual execution time, scanning 335,892 rows via the date index before filtering by seniority.

**After** \`CREATE INDEX idx_seniority_date_posted ON jobs (seniority, date_posted)\`: **1.6 ms** — a single index range scan satisfies both predicates directly. Roughly a 17x drop in the query plan's own reported execution time.

## The benchmark had a real gotcha

The first timing attempt spawned a fresh database client process for every run — the process-spawn overhead (~70ms) completely swamped a query that only takes single-digit milliseconds, showing *zero* visible improvement and contradicting what \`EXPLAIN ANALYZE\` had just shown. Fixed by benchmarking inside a single session (a stored-procedure loop, 200 iterations, timed server-side): **745µs → 416µs**, a real but smaller ~1.8x improvement — smaller because a warmed buffer pool narrows the gap between "good index" and "scan-then-filter" once the data's already cached in memory. Both numbers are true; they answer different questions about cold vs. warm cache performance.

## Backup & restore — tested, not just documented

\`\`\`
mysqldump --single-transaction --routines --triggers ... | gzip > backup.sql.gz
\`\`\`

\`--single-transaction\` takes a consistent snapshot without locking tables — safe against a database the ingestion pipeline is actively writing to. Restored into a fresh test database and verified row-by-row:

| table | original | restored |
|---|---|---|
| jobs | 1,567 | 1,567 |
| companies | 495 | 495 |
| locations | 381 | 381 |
| sources | 5 | 5 |

Exact match. The 1,567-row database compresses to 72K.
`,
    links: [],
  },
];

for (const p of projects) {
  const [result] = await conn.execute(
    `INSERT INTO projects
      (slug, title, track, progress_status, visibility, summary, description, skills, details_markdown, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       title = VALUES(title), track = VALUES(track), progress_status = VALUES(progress_status),
       visibility = VALUES(visibility), summary = VALUES(summary), description = VALUES(description),
       skills = VALUES(skills), details_markdown = VALUES(details_markdown), sort_order = VALUES(sort_order)`,
    [
      p.slug,
      p.title,
      p.track,
      p.progress_status,
      p.visibility,
      p.summary,
      p.description,
      JSON.stringify(p.skills),
      p.details.trim(),
      p.sort_order,
    ],
  );
  console.log(`${p.slug}: inserted/updated, id/affectedRows =`, result.insertId, result.affectedRows);
}

const [rows] = await conn.query(
  "SELECT id, slug, title, progress_status, visibility, sort_order FROM projects ORDER BY sort_order",
);
console.table(rows);

await conn.end();
