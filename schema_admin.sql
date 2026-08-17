-- Adds admin write support for the in-app "Add Project" form (docs / Jupyter
-- notebook / Python script uploads). Applied manually on swe-2, same flow as
-- schema_projects.sql: docker exec -i mysql mysql -uroot < schema_admin.sql
--
-- Replace __ADMIN_PASSWORD__ below with a freshly generated password before
-- running -- do not commit or echo the real value into chat.

ALTER TABLE portfolio.projects
  ADD COLUMN content_type ENUM('docs', 'notebook', 'python') NOT NULL DEFAULT 'docs' AFTER track;

-- Separate, more-privileged user for the admin write path only. Kept apart
-- from portfolio_web (SELECT-only) so a bug in the admin form can't touch
-- blog_posts or widen the public read path's privileges. No DELETE --
-- hiding a project stays visibility = 'draft', same as the manual-SQL flow.
CREATE USER IF NOT EXISTS 'portfolio_admin'@'%' IDENTIFIED BY '__ADMIN_PASSWORD__';
GRANT SELECT, INSERT, UPDATE ON portfolio.projects TO 'portfolio_admin'@'%';
GRANT SELECT, INSERT, UPDATE ON portfolio.project_links TO 'portfolio_admin'@'%';
FLUSH PRIVILEGES;
