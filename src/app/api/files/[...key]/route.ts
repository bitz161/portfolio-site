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

  const object = await getAdminMinioClient().getObject(PROJECT_FILES_BUCKET, key.join("/")).catch(() => null);
  if (!object?.ok || !object.body) {
    // Drain rather than cancel: Next's patched fetch tees response bodies, and
    // cancelling one tee branch never resolves while the other is unread.
    await object?.arrayBuffer().catch(() => {});
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(object.body, {
    headers: {
      "Content-Type": object.headers.get("content-type") ?? "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
