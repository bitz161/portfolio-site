import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { getMinioClient, BLOG_BUCKET } from "@/lib/minio";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/images/[...key]">,
) {
  const { key } = await ctx.params;
  const objectName = key.join("/");

  try {
    const stat = await getMinioClient().statObject(BLOG_BUCKET, objectName);
    const stream = await getMinioClient().getObject(BLOG_BUCKET, objectName);

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
