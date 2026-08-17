# Adding Blog Posts

The blog has no admin UI — you write posts by hand: images go into MinIO,
post content goes into MySQL. The site (`/blog`, `/blog/[slug]`) reads both
live, on every request, so changes show up immediately with no redeploy.

All commands below run on **swe-2** (`ssh swe@100.124.72.42`), since that's
where the `mysql` and `minio` containers live.

---

## 1. Schema reference

Database `portfolio`, table `blog_posts`:

| Column             | Type                          | Notes                                                              |
|---------------------|-------------------------------|----------------------------------------------------------------------|
| `id`                | `INT AUTO_INCREMENT`          | primary key                                                          |
| `slug`              | `VARCHAR(191)` unique         | used in the URL: `/blog/<slug>`                                     |
| `title`             | `VARCHAR(255)`                |                                                                        |
| `excerpt`           | `VARCHAR(500)`, nullable      | short teaser shown on `/blog`; skip it and the list just shows the title |
| `content`           | `LONGTEXT`                    | the post body, written in **Markdown**                              |
| `cover_image_url`   | `VARCHAR(500)`, nullable      | shown at the top of the post; a path like `/api/images/<name>`      |
| `status`            | `ENUM('draft','published')`   | drafts never show up on the site                                    |
| `published_at`      | `DATETIME`, nullable          | must be `<= NOW()` for the post to appear — future-dating works as a scheduled post |
| `created_at` / `updated_at` | `TIMESTAMP`            | automatic, don't set these                                          |

The app connects as `portfolio_web`, which only has `SELECT` on this table
— it can't write. All writes happen by you, directly, as `root`.

---

## 2. Upload any images first

Images live in the MinIO `blog` bucket, not in MySQL. Copy a file from your
machine to swe-2, then into the bucket:

```bash
# from your Windows machine
scp my-image.jpg swe@100.124.72.42:/home/swe/stack/my-image.jpg

# on swe-2
docker cp /home/swe/stack/my-image.jpg minio:/tmp/my-image.jpg
docker exec minio mc alias set local http://localhost:9000 "$(grep MINIO_ROOT_USER /home/swe/stack/.env | cut -d= -f2)" "$(grep MINIO_ROOT_PASSWORD /home/swe/stack/.env | cut -d= -f2)"
docker exec minio mc cp /tmp/my-image.jpg local/blog/my-image.jpg
rm /home/swe/stack/my-image.jpg
```

(The `mc alias set` only needs to be run once per shell session — skip it
on subsequent uploads in the same session.)

Whatever name you give it after `local/blog/` (here, `my-image.jpg`) is
what you reference in Markdown/`cover_image_url` as:

```
/api/images/my-image.jpg
```

That path is served by the Next.js app itself (`src/app/api/images/[...key]/route.ts`),
which fetches from MinIO internally — MinIO is never exposed to the
internet directly.

---

## 3. Write the post

Markdown supports headings, paragraphs, lists, code blocks, links, and
inline images:

```markdown
Some intro text. **Bold**, *italic*, and `inline code` all work.

## A subheading

- bullet
- points

1. numbered
2. lists too

![alt text](/api/images/my-image.jpg)

Regular [links](https://example.com) work too.

> Blockquotes work as well.
```

**Don't start `content` with a `# Title` heading** — the page already
renders `title` as its own `<h1>` above the content, so a leading `#
Heading` just duplicates it. Start straight into body text; use `##` and
below for subheadings within the post.

---

## 4. Insert it

```bash
docker exec -e MYSQL_PWD="$(grep MYSQL_ROOT_PASSWORD /home/swe/stack/.env | cut -d= -f2)" -i mysql mysql --default-character-set=utf8mb4 -uroot << 'EOF'
INSERT INTO portfolio.blog_posts (slug, title, excerpt, content, cover_image_url, status, published_at)
VALUES (
  'my-post-slug',
  'My Post Title',
  'One or two sentences shown on the blog list page.',
  'Body text here...\n\n![alt text](/api/images/my-image.jpg)',
  '/api/images/my-image.jpg',
  'published',
  NOW()
);
EOF
```

Notes:
- `\n` inside the SQL string is a literal newline character in the Markdown — the shell/MySQL passes it through as-is.
- The `--default-character-set=utf8mb4` flag matters — without it, em-dashes, curly quotes, and other non-ASCII characters get mangled into mojibake (`—` becomes `â€"`) even though the table itself is UTF-8.
- Any literal `'` in your text needs to be escaped as `\'` inside the single-quoted SQL string (or doubled as `''`).
- Set `status` to `'draft'` and leave `published_at` as `NULL` to stage a post without publishing it.
- Set `published_at` to a future timestamp to schedule it — it simply won't appear until that time passes.

---

## 5. Editing or unpublishing later

```sql
-- edit
UPDATE portfolio.blog_posts SET title = 'New Title' WHERE slug = 'my-post-slug';

-- unpublish (keeps the row, just hides it)
UPDATE portfolio.blog_posts SET status = 'draft' WHERE slug = 'my-post-slug';

-- delete entirely
DELETE FROM portfolio.blog_posts WHERE slug = 'my-post-slug';
```

Run these the same way as the insert above — through `docker exec ... mysql -uroot`.

---

## 6. Sanity-check

```bash
curl -s http://127.0.0.1:3000/blog/my-post-slug -o /dev/null -w '%{http_code}\n'
```

Or just visit `https://swe-2.tail174d56.ts.net/blog/my-post-slug` from any
browser.
