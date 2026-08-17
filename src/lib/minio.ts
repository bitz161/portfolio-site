import { Client } from "minio";

let client: Client | undefined;

export function getMinioClient() {
  if (!client) {
    client = new Client({
      endPoint: process.env.BLOG_MINIO_ENDPOINT!,
      port: Number(process.env.BLOG_MINIO_PORT ?? 9000),
      useSSL: false,
      accessKey: process.env.BLOG_MINIO_ACCESS_KEY!,
      secretKey: process.env.BLOG_MINIO_SECRET_KEY!,
    });
  }
  return client;
}

export const BLOG_BUCKET = process.env.BLOG_MINIO_BUCKET ?? "blog";

let adminClient: Client | undefined;

// Separate client using a key scoped only to PROJECT_FILES_BUCKET (see
// schema_admin.sql's companion MinIO key) -- keeps the admin upload path's
// credentials independent from the blog's.
export function getAdminMinioClient() {
  if (!adminClient) {
    adminClient = new Client({
      endPoint: process.env.BLOG_MINIO_ENDPOINT!,
      port: Number(process.env.BLOG_MINIO_PORT ?? 9000),
      useSSL: false,
      accessKey: process.env.ADMIN_MINIO_ACCESS_KEY!,
      secretKey: process.env.ADMIN_MINIO_SECRET_KEY!,
    });
  }
  return adminClient;
}

export const PROJECT_FILES_BUCKET =
  process.env.PROJECT_FILES_MINIO_BUCKET ?? "project-files";
