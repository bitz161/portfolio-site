/**
 * True when the request reached us through Cloudflare (the public domain's tunnel).
 *
 * Why this exists: the admin gate trusts the `Tailscale-User-Login` header, which tailscaled
 * stamps on tailnet requests and never on public Funnel traffic. A Cloudflare tunnel connects
 * straight to the app, so there the header comes from the visitor and means nothing. Cloudflare
 * always adds CF-Ray (and CF-Connecting-IP) to proxied requests and a client cannot remove them,
 * so their presence marks public traffic. Admin routes refuse it, whatever else the request says.
 */
export function viaCloudflare(headers: Headers): boolean {
  return headers.has("cf-ray") || headers.has("cf-connecting-ip") || headers.has("cf-visitor");
}
