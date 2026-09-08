import mysql from "mysql2/promise";

let pool: mysql.Pool | undefined;

// portfolio_web only ever has SELECT grants (see schema_admin.sql), so
// this pool can safely read from the replica when one is configured --
// there's no write path here to worry about seeing stale data from its
// own just-committed write. Falls back to the primary if
// BLOG_DB_HOST_REPLICA isn't set, so this is a no-op until configured.
export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.BLOG_DB_HOST_REPLICA || process.env.BLOG_DB_HOST,
      user: process.env.BLOG_DB_USER,
      password: process.env.BLOG_DB_PASSWORD,
      database: process.env.BLOG_DB_NAME,
      connectionLimit: 5,
    });
  }
  return pool;
}

let adminPool: mysql.Pool | undefined;

// Separate, more-privileged pool for the admin write path only (see
// schema_admin.sql) -- never import this from a public-facing page.
export function getAdminPool() {
  if (!adminPool) {
    adminPool = mysql.createPool({
      host: process.env.BLOG_DB_HOST,
      user: process.env.ADMIN_DB_USER,
      password: process.env.ADMIN_DB_PASSWORD,
      database: process.env.BLOG_DB_NAME,
      connectionLimit: 2,
    });
  }
  return adminPool;
}
