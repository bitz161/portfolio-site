import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { getAdminPool } from "@/lib/db";
import { requireTailscaleIdentity, requireSameOrigin } from "@/lib/admin-auth";

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const forbidden = requireTailscaleIdentity(request) ?? requireSameOrigin(request);
  if (forbidden) return forbidden;

  const { slug } = await params;
  const body = await request.json();

  const title = String(body.title ?? "").trim();
  const track = String(body.track ?? "").trim();
  const progressStatus = String(body.progress_status ?? "");
  const visibility = String(body.visibility ?? "");
  const summary = String(body.summary ?? "").trim();
  const description = String(body.description ?? "").trim();
  const skills = Array.isArray(body.skills) ? body.skills.map((s: unknown) => String(s).trim()).filter(Boolean) : [];
  const details = typeof body.details === "string" ? body.details : null;
  const sortOrder = Number.isFinite(body.sort_order) ? Number(body.sort_order) : 0;

  if (!title || !track || !summary || !description) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }
  if (!["not-started", "in-progress", "done"].includes(progressStatus)) {
    return NextResponse.json({ error: "Invalid progress status." }, { status: 400 });
  }
  if (!["draft", "published"].includes(visibility)) {
    return NextResponse.json({ error: "Invalid visibility." }, { status: 400 });
  }

  const pool = getAdminPool();
  const [existing] = await pool.query<RowDataPacket[]>(`SELECT id FROM projects WHERE slug = ? LIMIT 1`, [slug]);
  if (existing.length === 0) {
    return NextResponse.json({ error: `No project with slug "${slug}".` }, { status: 404 });
  }

  try {
    await pool.query(
      `UPDATE projects
       SET title = ?, track = ?, progress_status = ?, visibility = ?, summary = ?,
           description = ?, skills = ?, details_markdown = ?, sort_order = ?
       WHERE slug = ?`,
      [title, track, progressStatus, visibility, summary, description, JSON.stringify(skills), details, sortOrder, slug],
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to update project:", err);
    return NextResponse.json({ error: "Failed to update project. See server logs for details." }, { status: 500 });
  }
}
