import { NextResponse } from "next/server";
import { requireTailscaleIdentity, requireSameOrigin } from "@/lib/admin-auth";
import { setSkillCategory } from "@/lib/skill-categories";

export async function PATCH(request: Request) {
  const forbidden = requireTailscaleIdentity(request) ?? requireSameOrigin(request);
  if (forbidden) return forbidden;

  const body = await request.json();
  const skill = String(body.skill ?? "").trim();
  const category = String(body.category ?? "").trim();
  if (!skill || !category) {
    return NextResponse.json({ error: "skill and category are required." }, { status: 400 });
  }

  try {
    await setSkillCategory(skill, category);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save category." },
      { status: 400 },
    );
  }
}
