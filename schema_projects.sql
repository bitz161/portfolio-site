-- Adds a MySQL-backed projects showcase to the `portfolio` database
-- (same database as blog_posts). Replaces the previously-hardcoded
-- src/lib/projects.ts array -- adding, editing, or hiding a project is now
-- "run an UPDATE/INSERT," never "edit code and redeploy."

CREATE TABLE portfolio.projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  track VARCHAR(100) NOT NULL,
  progress_status ENUM('not-started', 'in-progress', 'done') NOT NULL DEFAULT 'not-started',
  -- Independent of progress_status: a 'done' project can still be a draft
  -- (not ready to show), and an 'in-progress' one can be published early.
  visibility ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  summary VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  skills JSON NOT NULL,
  -- Long-form writeup, rendered as Markdown on the detail page (same
  -- pattern as blog_posts.content).
  details_markdown MEDIUMTEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- A project can point at zero or more external destinations (GitHub repo,
-- Kaggle notebook, live dashboard, etc.) -- kept as its own table rather
-- than a single column since some projects will have more than one.
CREATE TABLE portfolio.project_links (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  label VARCHAR(100) NOT NULL,
  url VARCHAR(1000) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_project_links_project FOREIGN KEY (project_id)
    REFERENCES portfolio.projects(id) ON DELETE CASCADE
);

-- The site's app user is read-only, same as it already is for blog_posts.
GRANT SELECT ON portfolio.projects TO 'portfolio_web'@'%';
GRANT SELECT ON portfolio.project_links TO 'portfolio_web'@'%';
FLUSH PRIVILEGES;
