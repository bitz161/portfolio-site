import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { getAdminPool } from "@/lib/db";
import { getAdminMinioClient, BLOG_BUCKET } from "@/lib/minio";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

function requireTailscaleIdentity(request: Request) {
  const isDev = process.env.NODE_ENV === "development";
  if (!isDev && !request.headers.has("Tailscale-User-Login")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

function requireSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return null;
  const host = request.headers.get("host");
  if (!host || new URL(origin).host !== host) {
    return NextResponse.json({ error: "Cross-origin requests are not allowed." }, { status: 403 });
  }
  return null;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const forbidden = requireTailscaleIdentity(request) ?? requireSameOrigin(request);
  if (forbidden) return forbidden;

  const { slug } = await params;
  const formData = await request.formData();

  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim() || null;
  const content = String(formData.get("content") ?? "").trim();
  const status = String(formData.get("status") ?? "");
  const publishedAtRaw = String(formData.get("published_at") ?? "").trim();

  if (!title || !content) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }
  if (!["draft", "published"].includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }
  let publishedAt: string | null = null;
  if (publishedAtRaw) {
    const parsed = new Date(publishedAtRaw);
    if (Number.isNaN(parsed.getTime())) {
      return NextResponse.json({ error: "Invalid published_at." }, { status: 400 });
    }
    publishedAt = parsed.toISOString().slice(0, 19).replace("T", " ");
  } else if (status === "published") {
    publishedAt = new Date().toISOString().slice(0, 19).replace("T", " ");
  }

  const pool = getAdminPool();
  const [existing] = await pool.query<RowDataPacket[]>(
    `SELECT id, cover_image_url FROM blog_posts WHERE slug = ? LIMIT 1`,
    [slug],
  );
  const post = existing[0];
  if (!post) {
    return NextResponse.json({ error: `No post with slug "${slug}".` }, { status: 404 });
  }

  let coverImageUrl = post.cover_image_url as string | null;
  const coverFile = formData.get("cover_image");
  if (coverFile instanceof File && coverFile.size > 0) {
    if (coverFile.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: `Cover image is too large (${Math.round(coverFile.size / 1024 / 1024)}MB, max 10MB).` },
        { status: 400 },
      );
    }
    const buffer = Buffer.from(await coverFile.arrayBuffer());
    const key = `covers/${slug}/${coverFile.name || "cover"}`;
    await getAdminMinioClient().putObject(BLOG_BUCKET, key, buffer, buffer.length, {
      "Content-Type": coverFile.type || "application/octet-stream",
    });
    coverImageUrl = `/api/images/${key}`;
  }

  try {
    await pool.query(
      `UPDATE blog_posts
       SET title = ?, excerpt = ?, content = ?, cover_image_url = ?, status = ?, published_at = ?
       WHERE slug = ?`,
      [title, excerpt, content, coverImageUrl, status, publishedAt, slug],
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to update blog post:", err);
    return NextResponse.json({ error: "Failed to update post. See server logs for details." }, { status: 500 });
  }
}
