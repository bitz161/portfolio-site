# Public domain: swedb.site

Registered at GoDaddy. DNS and the tunnel are on Cloudflare (free plan). The site itself still runs on swe-2.

```
visitor ──► Cloudflare (TLS, DNS, DDoS) ──tunnel──► cloudflared (swe-2) ──► portfolio:3000
tailnet ──► swe-2.tail174d56.ts.net (Tailscale serve/funnel) ───────────► portfolio:3000   (admin lives here)
```

## What runs where

| Piece | Where | Notes |
|---|---|---|
| Domain registration | GoDaddy | renews each year at GoDaddy's renewal price (check it before the first renewal) |
| Nameservers | `armando.ns.cloudflare.com`, `sneh.ns.cloudflare.com` | set at GoDaddy → Domain → DNS → Nameservers |
| Tunnel `swe-2-portfolio` | Cloudflare → Networking → Tunnels | routes `swedb.site` and `www.swedb.site` to `http://portfolio:3000` |
| Connector | swe-2, container `cloudflared` (`--restart unless-stopped`, network `stack_default`) | started with `docker run`, not part of compose, so no systemd edit was needed |
| Tunnel token | swe-2 `/home/swe/stack/.cloudflared-token`, mode 600 | never put it in chat, git or `.env` backups |

Restart the connector (for example after rotating the token in the dashboard):

```bash
cd /home/swe/stack
docker rm -f cloudflared
docker run -d --name cloudflared --restart unless-stopped --network stack_default --memory 128m \
  -e TUNNEL_TOKEN="$(cat .cloudflared-token)" cloudflare/cloudflared:latest tunnel --no-autoupdate run
```

## Admin stays tailnet-only (important)

The admin gate trusts the `Tailscale-User-Login` header. Tailscale adds it itself, but a Cloudflare tunnel
delivers whatever the visitor sends, so the header means nothing there. `src/lib/origin-guard.ts` treats any
request carrying `cf-ray` / `cf-connecting-ip` (Cloudflare always adds them) as public, and `/admin` and
`/api/admin/*` refuse it. Use the admin on the tailnet name, not on `swedb.site`.

Test after any change to the gate or to the tunnel (expect 403 for all of them):

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://swedb.site/admin
curl -s -o /dev/null -w '%{http_code}\n' -H 'Tailscale-User-Login: x@y.test' https://swedb.site/admin
curl -s -o /dev/null -w '%{http_code}\n' -H 'Tailscale-User-Login: x@y.test' https://swedb.site/api/admin/projects
```

## Canonical URL

`SITE_URL=https://swedb.site` in swe-2's `/home/swe/stack/.env` feeds `metadataBase` in `src/app/layout.tsx`
(open-graph and canonical URLs). It needs the `portfolio` container recreated to take effect.

## Email

Cloudflare Email Routing (free) can forward `hello@swedb.site` to a personal inbox: Cloudflare → swedb.site → Email →
Email Routing. Needs the destination address verified once.
