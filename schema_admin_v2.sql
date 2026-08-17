-- Generalizes the single-purpose 'python' content type into a 'code' type
-- with a language field, so adding SQL/Bash/JS/etc later needs no further
-- migration. Safe to run: no project rows use content_type='python' yet
-- (verified via SELECT before writing this migration).

ALTER TABLE portfolio.projects
  MODIFY COLUMN content_type ENUM('docs', 'notebook', 'code') NOT NULL DEFAULT 'docs',
  ADD COLUMN code_language VARCHAR(20) NULL AFTER content_type;
