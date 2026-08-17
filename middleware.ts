import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Gates the admin write path to Tailscale-authenticated requests only.
// swe-2's tailscaled reverse-proxies both `tailscale serve` (tailnet-only)
// and `tailscale funnel` (public internet) traffic to this app; it stamps
// Tailscale-User-Login only on requests from an authenticated tailnet peer
// -- anonymous Funnel/public traffic never has it. There's no app-level
// reverse proxy in front of this, so that header is the only signal.
export function middleware(request: NextRequest) {
  const isDev = process.env.NODE_ENV === "development";
  const hasTailscaleIdentity = request.headers.has("Tailscale-User-Login");

  if (!isDev && !hasTailscaleIdentity) {
    return NextResponse.json(
      { error: "Admin routes are only reachable from the tailnet." },
      { status: 403 },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
