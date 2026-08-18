import { NextResponse } from "next/server";

// Defense-in-depth: middleware.ts already gates /admin and /api/admin/* on
// the Tailscale-User-Login header, but each admin write route re-checks it
// directly in case it's ever reached some other way.
export function requireTailscaleIdentity(request: Request) {
  const isDev = process.env.NODE_ENV === "development";
  if (!isDev && !request.headers.has("Tailscale-User-Login")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

// Lightweight CSRF defense: Tailscale-User-Login reflects network identity,
// not app-level session state, so a page loaded from anywhere else in the
// tailnet could otherwise POST here cross-origin and still carry that
// header. Reject any request whose Origin doesn't match this host.
export function requireSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return null; // non-browser clients (curl, server-to-server) have no Origin
  const host = request.headers.get("host");
  if (!host || new URL(origin).host !== host) {
    return NextResponse.json({ error: "Cross-origin requests are not allowed." }, { status: 403 });
  }
  return null;
}
