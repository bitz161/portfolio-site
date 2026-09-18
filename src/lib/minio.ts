import { AwsClient } from "aws4fetch";

function objectUrl(bucket: string, key: string) {
  const encodedKey = key.split("/").map(encodeURIComponent).join("/");
  return `http://${process.env.BLOG_MINIO_ENDPOINT}:${process.env.BLOG_MINIO_PORT ?? 9000}/${bucket}/${encodedKey}`;
}

function createStorageClient(accessKeyId: string, secretAccessKey: string) {
  // MinIO signs against "us-east-1" unless the server sets MINIO_REGION.
  const client = new AwsClient({ accessKeyId, secretAccessKey, service: "s3", region: "us-east-1" });
  return {
    async putObject(bucket: string, key: string, body: Buffer, contentType: string) {
      const res = await client.fetch(objectUrl(bucket, key), {
        method: "PUT",
        body: new Uint8Array(body),
        headers: { "Content-Type": contentType },
      });
      if (!res.ok) throw new Error(`MinIO PUT ${bucket}/${key} failed with ${res.status}`);
    },
    getObject(bucket: string, key: string) {
      return client.fetch(objectUrl(bucket, key));
    },
  };
}

type StorageClient = ReturnType<typeof createStorageClient>;

let client: StorageClient | undefined;

export function getMinioClient() {
  client ??= createStorageClient(process.env.BLOG_MINIO_ACCESS_KEY!, process.env.BLOG_MINIO_SECRET_KEY!);
  return client;
}

export const BLOG_BUCKET = process.env.BLOG_MINIO_BUCKET ?? "blog";

let adminClient: StorageClient | undefined;

// Separate client using a key scoped only to PROJECT_FILES_BUCKET (see
// schema_admin.sql's companion MinIO key) -- keeps the admin upload path's
// credentials independent from the blog's.
export function getAdminMinioClient() {
  adminClient ??= createStorageClient(process.env.ADMIN_MINIO_ACCESS_KEY!, process.env.ADMIN_MINIO_SECRET_KEY!);
  return adminClient;
}

export const PROJECT_FILES_BUCKET =
  process.env.PROJECT_FILES_MINIO_BUCKET ?? "project-files";
