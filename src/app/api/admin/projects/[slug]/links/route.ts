import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { getAdminPool } from "@/lib/db";

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

// Add-only: portfolio_admin has no DELETE grant, so removing/reordering
// existing links still goes through the manual SQL flow in PROJECTS.md.
export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const forbidden = requireTailscaleIdentity(request) ?? requireSameOrigin(request);
  if (forbidden) return forbidden;

  const { slug } = await params;
  const body = await request.json();
  const label = String(body.label ?? "").trim();
  const url = String(body.url ?? "").trim();
  if (!label || !url) {
    return NextResponse.json({ error: "Both a label and a URL are required." }, { status: 400 });
  }

  const pool = getAdminPool();
  const [rows] = await pool.query<RowDataPacket[]>(`SELECT id FROM projects WHERE slug = ? LIMIT 1`, [slug]);
  const project = rows[0];
  if (!project) {
    return NextResponse.json({ error: `No project with slug "${slug}".` }, { status: 404 });
  }

  const [countRows] = await pool.query<RowDataPacket[]>(
    `SELECT COALESCE(MAX(sort_order), -1) AS maxOrder FROM project_links WHERE project_id = ?`,
    [project.id],
  );
  const nextOrder = (countRows[0].maxOrder as number) + 1;

  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO project_links (project_id, label, url, sort_order) VALUES (?, ?, ?, ?)`,
    [project.id, label, url, nextOrder],
  );

  return NextResponse.json({ ok: true, id: result.insertId, label, url });
}
