import mysql from "mysql2/promise";

let pool: mysql.Pool | undefined;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.BLOG_DB_HOST,
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
