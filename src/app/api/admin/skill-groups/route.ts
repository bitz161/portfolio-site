import { NextResponse } from "next/server";
import { requireTailscaleIdentity, requireSameOrigin } from "@/lib/admin-auth";
import { addSkillGroup, deleteSkillGroup, renameSkillGroup } from "@/lib/skill-categories";

// Columns on the /admin/skills board. POST {name} adds, PATCH {from,to} renames, DELETE {name} removes an empty one.
async function handle(request: Request, op: (body: Record<string, unknown>) => Promise<unknown>) {
  const forbidden = requireTailscaleIdentity(request) ?? requireSameOrigin(request);
  if (forbidden) return forbidden;
  try {
    const result = await op(await request.json());
    return NextResponse.json({ ok: true, name: result ?? null });
  } catch (err) {
    // our own validation errors carry no driver code; raw MySQL errors stay in the server log
    if ((err as { code?: string }).code) console.error("skill-groups:", err);
    const message = err instanceof Error && !(err as { code?: string }).code ? err.message : "Database error. See server logs.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export const POST = (req: Request) => handle(req, (b) => addSkillGroup(String(b.name ?? "")));
export const PATCH = (req: Request) => handle(req, (b) => renameSkillGroup(String(b.from ?? ""), String(b.to ?? "")));
export const DELETE = (req: Request) => handle(req, (b) => deleteSkillGroup(String(b.name ?? "")));
