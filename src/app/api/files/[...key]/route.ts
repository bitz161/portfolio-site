import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { getAdminMinioClient, PROJECT_FILES_BUCKET } from "@/lib/minio";

// Public read-only proxy for notebook-output images and downloadable
// original .ipynb/.py files -- mirrors /api/images/[...key], but points at
// PROJECT_FILES_BUCKET, which only the portfolio-admin MinIO key can reach.
export async function GET(
  _request: Request,
  ctx: { params: Promise<{ key: string[] }> },
) {
  const { key } = await ctx.params;
  const objectName = key.join("/");

  try {
    const client = getAdminMinioClient();
    const stat = await client.statObject(PROJECT_FILES_BUCKET, objectName);
    const stream = await client.getObject(PROJECT_FILES_BUCKET, objectName);

    return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
      headers: {
        "Content-Type": stat.metaData?.["content-type"] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
