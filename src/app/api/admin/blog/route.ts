import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { getAdminPool } from "@/lib/db";
import { getAdminMinioClient, BLOG_BUCKET } from "@/lib/minio";
import { requireTailscaleIdentity, requireSameOrigin } from "@/lib/admin-auth";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // same cap as the project admin uploads
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export async function POST(request: Request) {
  const forbidden = requireTailscaleIdentity(request) ?? requireSameOrigin(request);
  if (forbidden) return forbidden;

  const formData = await request.formData();

  const slug = String(formData.get("slug") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim() || null;
  const content = String(formData.get("content") ?? "").trim();
  const status = String(formData.get("status") ?? "draft");
  const publishedAtRaw = String(formData.get("published_at") ?? "").trim();

  if (!slug || !title || !content) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }
  if (!SLUG_PATTERN.test(slug)) {
    return NextResponse.json(
      { error: "Slug must be lowercase letters, numbers, and hyphens only (e.g. my-post)." },
      { status: 400 },
    );
  }
  if (!["draft", "published"].includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }
  // published_at defaults to now for a published post, unless the user set
  // a future timestamp to schedule it; drafts leave it NULL.
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

  const [existing] = await pool.query<RowDataPacket[]>(`SELECT id FROM blog_posts WHERE slug = ? LIMIT 1`, [slug]);
  if (existing.length > 0) {
    return NextResponse.json({ error: `Slug "${slug}" is already in use.` }, { status: 409 });
  }

  let coverImageUrl: string | null = null;
  const coverFile = formData.get("cover_image");
  if (coverFile instanceof File && coverFile.size > 0) {
    if (coverFile.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: `Cover image is too large (${Math.round(coverFile.size / 1024 / 1024)}MB, max 10MB).` },
        { status: 400 },
      );
    }
    const buffer = Buffer.from(await coverFile.arrayBuffer());
    // Timestamp-prefixed so a later re-upload (via PATCH) gets a fresh key
    // instead of overwriting this one in place -- the image route serves
    // /api/images/* with a 1-year immutable Cache-Control, so an in-place
    // overwrite would leave browsers/proxies stuck on the old bytes.
    const key = `covers/${slug}/${Date.now()}-${coverFile.name || "cover"}`;
    await getAdminMinioClient().putObject(BLOG_BUCKET, key, buffer, buffer.length, {
      "Content-Type": coverFile.type || "application/octet-stream",
    });
    coverImageUrl = `/api/images/${key}`;
  }

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO blog_posts (slug, title, excerpt, content, cover_image_url, status, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [slug, title, excerpt, content, coverImageUrl, status, publishedAt],
    );
    return NextResponse.json({ ok: true, slug, id: result.insertId });
  } catch (err) {
    console.error("Failed to save blog post:", err);
    return NextResponse.json({ error: "Failed to save post. See server logs for details." }, { status: 500 });
  }
}
