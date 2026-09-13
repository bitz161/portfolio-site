-- Lets the homepage's Skills & Tools grouping (Languages/Databases/Data Eng/
-- Infra/Analysis) be edited via /admin/skills instead of the hardcoded regex
-- that used to live in src/app/page.tsx. Applied manually on swe-2:
-- docker exec -i mysql mysql -uroot < schema_skill_categories.sql

CREATE TABLE IF NOT EXISTS portfolio.skill_categories (
  skill VARCHAR(80) PRIMARY KEY,
  category VARCHAR(40) NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Same admin user already used for projects/project_links/blog_posts (no
-- DELETE -- an unwanted row can just be re-categorized, consistent with the
-- rest of the admin write path never hard-deleting anything).
GRANT SELECT, INSERT, UPDATE ON portfolio.skill_categories TO 'portfolio_admin'@'%';

-- The public read-only pool (portfolio_web) reads this table too, to render
-- the homepage's Skills & Tools grouping. Forgetting this grant 500s the
-- homepage -- hit and fixed once already, don't repeat it.
GRANT SELECT ON portfolio.skill_categories TO 'portfolio_web'@'%';
FLUSH PRIVILEGES;
