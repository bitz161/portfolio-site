import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { getAdminPool } from "@/lib/db";
import { getAdminMinioClient, PROJECT_FILES_BUCKET } from "@/lib/minio";
import { requireTailscaleIdentity, requireSameOrigin } from "@/lib/admin-auth";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

// One screenshot/diagram per project -- reuploading replaces it in place at
// a fixed key, same overwrite-in-place tradeoff already accepted for blog
// cover images (mirrors that pattern rather than timestamp-prefixing, since
// there's only ever one "current" proof image per project).
export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const forbidden = requireTailscaleIdentity(request) ?? requireSameOrigin(request);
  if (forbidden) return forbidden;

  const { slug } = await params;
  const pool = getAdminPool();
  const [existing] = await pool.query<RowDataPacket[]>(`SELECT id FROM projects WHERE slug = ? LIMIT 1`, [slug]);
  if (existing.length === 0) {
    return NextResponse.json({ error: `No project with slug "${slug}".` }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "An image file is required." }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `File is too large (${Math.round(file.size / 1024 / 1024)}MB, max 10MB).` },
      { status: 400 },
    );
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image." }, { status: 400 });
  }

  const ext = file.name.includes(".") ? file.name.split(".").pop() : "png";
  const key = `projects/${slug}/cover.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await getAdminMinioClient().putObject(PROJECT_FILES_BUCKET, key, buffer, buffer.length, {
      "Content-Type": file.type,
    });
    await pool.query<ResultSetHeader>(`UPDATE projects SET image_key = ? WHERE slug = ?`, [key, slug]);
    return NextResponse.json({ ok: true, key });
  } catch (err) {
    console.error("Failed to upload project image:", err);
    return NextResponse.json({ error: "Failed to upload image. See server logs for details." }, { status: 500 });
  }
}
