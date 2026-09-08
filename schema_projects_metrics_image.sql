-- Adds visual-proof (image_key, pointing at PROJECT_FILES_BUCKET) and an
-- optional before/after stat callout to projects. Both nullable -- most
-- projects won't set either; the detail page only renders what's present.

ALTER TABLE portfolio.projects
  ADD COLUMN image_key VARCHAR(255) NULL AFTER details_markdown,
  ADD COLUMN metric_before VARCHAR(50) NULL AFTER image_key,
  ADD COLUMN metric_after VARCHAR(50) NULL AFTER metric_before,
  ADD COLUMN metric_label VARCHAR(120) NULL AFTER metric_after;

-- Real number from the DBA-performance writeup: composite index cut this
-- query's EXPLAIN ANALYZE time from 26.8ms to 1.6ms.
UPDATE portfolio.projects
SET metric_before = '26.8ms', metric_after = '1.6ms', metric_label = 'Query time after composite index'
WHERE slug = 'dba-performance';
