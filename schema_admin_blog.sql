-- Extends the existing portfolio_admin user (see schema_admin.sql) to also
-- write blog_posts, for the in-app blog control panel under /admin/blog.
-- Applied manually on swe-2: docker exec -i mysql mysql -uroot < schema_admin_blog.sql
--
-- The companion MinIO change -- extending the portfolio-admin service
-- account's embedded policy to also cover the `blog` bucket (previously
-- project-files only) -- was applied directly via `mc admin user svcacct
-- edit`, not through a file in this repo (same as the original key's setup
-- in the 2026-08-17 session).

GRANT SELECT, INSERT, UPDATE ON portfolio.blog_posts TO 'portfolio_admin'@'%';
FLUSH PRIVILEGES;
