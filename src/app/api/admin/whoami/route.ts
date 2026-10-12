import { NextResponse } from "next/server";
import { requireTailscaleIdentity } from "@/lib/admin-auth";

// The nav calls this to decide whether to show the Admin link. middleware.ts already
// 403s it off the tailnet; the re-check mirrors the other admin routes.
export function GET(request: Request) {
  return requireTailscaleIdentity(request) ?? NextResponse.json({ ok: true });
}
