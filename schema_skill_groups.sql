-- Skill groups (the columns on /admin/skills and the homepage Stack section) move from a
-- hardcoded list in src/lib/skill-categories.ts into the database, so columns can be added,
-- renamed and deleted from the admin board.
--
-- "Uncategorized" is a protected group (the app refuses to rename or delete it). Skills that
-- have no row in skill_categories are shown there too.
--
-- Apply on the PRIMARY (read_only=0), as root:
--   docker exec -i mysql sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD"' < schema_skill_groups.sql
-- (-i is required: without it stdin is discarded and mysql exits 0 having done nothing.)

CREATE TABLE IF NOT EXISTS portfolio.skill_groups (
  name VARCHAR(40) COLLATE utf8mb4_unicode_ci NOT NULL PRIMARY KEY,
  sort_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO portfolio.skill_groups (name, sort_order) VALUES
  ('Uncategorized', 0),
  ('Languages', 10),
  ('Databases', 20),
  ('Data Eng', 30),
  ('Infra', 40),
  ('Analysis', 50);

-- Renaming a group renames it on every skill; deleting a group that still has skills fails.
ALTER TABLE portfolio.skill_categories
  ADD CONSTRAINT fk_skill_categories_group FOREIGN KEY (category)
    REFERENCES portfolio.skill_groups (name) ON UPDATE CASCADE ON DELETE RESTRICT;

GRANT SELECT, INSERT, UPDATE, DELETE ON portfolio.skill_groups TO 'portfolio_admin'@'%';
GRANT SELECT ON portfolio.skill_groups TO 'portfolio_web'@'%';
