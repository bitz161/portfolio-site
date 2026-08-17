# Adding / Editing Projects

Same philosophy as [`BLOG.md`](./BLOG.md): no admin UI, no code changes, no
redeploy. Projects live in MySQL and the site reads them live on every
request — insert a row, it shows up; flip `visibility` to `draft`, it
disappears.

All commands below run on **swe-2** (`ssh swe@100.124.72.42`), since that's
where the `mysql` container lives.

---

## 1. Schema reference

Database `portfolio` (same one `blog_posts` lives in), table `projects`:

| Column             | Type                                        | Notes                                                              |
|---------------------|---------------------------------------------|----------------------------------------------------------------------|
| `id`                | `INT AUTO_INCREMENT`                        | primary key                                                          |
| `slug`              | `VARCHAR(255)` unique                       | used in the URL: `/projects/<slug>`                                 |
| `title`             | `VARCHAR(255)`                              |                                                                        |
| `track`             | `VARCHAR(100)`                              | free text, e.g. `Database Management`, `Data Analyst` — shown as a badge |
| `progress_status`   | `ENUM('not-started','in-progress','done')`  | *how far along it is* — shown as a badge regardless of visibility   |
| `visibility`        | `ENUM('draft','published')`                 | *whether it's shown at all* — independent of progress; a finished project can stay a draft, an in-progress one can be published early |
| `summary`           | `VARCHAR(500)`                              | short blurb shown on the home page and `/projects` list             |
| `description`       | `TEXT`                                      | longer paragraph shown at the top of the detail page                |
| `skills`            | `JSON`                                      | array of strings, e.g. `["MySQL", "ERD"]`                           |
| `details_markdown`  | `MEDIUMTEXT`, nullable                      | the full writeup, rendered as **Markdown** on the detail page; leave `NULL` for a "Coming soon" placeholder |
| `sort_order`        | `INT`                                       | controls display order (ascending); the home page shows only the first 3 by this order |
| `created_at` / `updated_at` | `TIMESTAMP`                          | automatic, don't set these                                          |

Table `project_links` — zero or more external destinations per project
(GitHub, Kaggle, a live dashboard, etc.):

| Column       | Type                   | Notes                                    |
|--------------|------------------------|-------------------------------------------|
| `id`         | `INT AUTO_INCREMENT`   | primary key                                |
| `project_id` | `INT`                  | FK to `projects.id`, `ON DELETE CASCADE`   |
| `label`      | `VARCHAR(100)`         | button text, e.g. `GitHub`, `Kaggle notebook` |
| `url`        | `VARCHAR(1000)`        |                                             |
| `sort_order` | `INT`                  | display order                              |

The app connects as `portfolio_web`, which only has `SELECT` on both tables
— it can't write. All writes happen by you, directly, as `root`, same as
the blog.

---

## 2. Write the writeup (optional)

`details_markdown` supports the same Markdown as blog posts — headings,
lists, code blocks, tables, links:

```markdown
## Schema

Some explanation...

\`\`\`sql
SELECT * FROM whatever;
\`\`\`

| col | val |
|---|---|
| a  | 1  |
```

Leave it `NULL` (or don't set it) and the detail page falls back to a
"Coming soon" placeholder block automatically — a project can be published
with just the summary card and no long-form writeup yet.

---

## 3. Insert it

```bash
docker exec -e MYSQL_PWD="$(grep MYSQL_ROOT_PASSWORD /home/swe/stack/.env | cut -d= -f2)" -i mysql mysql --default-character-set=utf8mb4 -uroot << 'EOF'
INSERT INTO portfolio.projects
  (slug, title, track, progress_status, visibility, summary, description, skills, details_markdown, sort_order)
VALUES (
  'my-project-slug',
  'My Project Title',
  'Data Analyst',
  'done',
  'draft',
  'One or two sentences shown on cards.',
  'A longer paragraph shown at the top of the detail page.',
  '["Python", "Pandas"]',
  'Full writeup in **Markdown** goes here...',
  4
);

-- if it points somewhere external
INSERT INTO portfolio.project_links (project_id, label, url, sort_order)
VALUES (
  (SELECT id FROM portfolio.projects WHERE slug = 'my-project-slug'),
  'GitHub',
  'https://github.com/you/repo',
  1
);
EOF
```

Notes (same gotchas as the blog):
- `--default-character-set=utf8mb4` matters — without it, em-dashes and
  other non-ASCII characters get mangled into mojibake.
- Any literal `'` inside a string needs to be escaped as `\'` or doubled as
  `''`.
- `skills` is a JSON array — keep the quotes: `'["A", "B"]'`, not `'[A, B]'`.
- Start `visibility` at `'draft'` while you're still writing, flip to
  `'published'` when it's ready to show. Nothing needs a redeploy.

---

## 4. Editing, hiding, or reordering later

```sql
-- edit
UPDATE portfolio.projects SET title = 'New Title' WHERE slug = 'my-project-slug';

-- hide (keeps the row and its writeup, just removes it from the site)
UPDATE portfolio.projects SET visibility = 'draft' WHERE slug = 'my-project-slug';

-- publish
UPDATE portfolio.projects SET visibility = 'published' WHERE slug = 'my-project-slug';

-- reorder (lower sort_order shows first; home page only shows the first 3)
UPDATE portfolio.projects SET sort_order = 0 WHERE slug = 'my-project-slug';

-- delete entirely (also deletes its links, via ON DELETE CASCADE)
DELETE FROM portfolio.projects WHERE slug = 'my-project-slug';
```

Run these the same way as the insert above — through `docker exec ... mysql -uroot`.

---

## 5. Sanity-check

```bash
curl -s http://127.0.0.1:3000/projects/my-project-slug -o /dev/null -w '%{http_code}\n'
```

Or just visit `https://swe-2.tail174d56.ts.net/projects/my-project-slug`
from any browser. A `draft` project 404s on the public site even if you
know the URL.
