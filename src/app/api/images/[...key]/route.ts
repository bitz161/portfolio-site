import { NextResponse } from "next/server";
import { getMinioClient, BLOG_BUCKET } from "@/lib/minio";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/images/[...key]">,
) {
  const { key } = await ctx.params;

  const object = await getMinioClient().getObject(BLOG_BUCKET, key.join("/")).catch(() => null);
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
