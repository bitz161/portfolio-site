# Portfolio rebuild: "Midnight Studio" (Steel & Ember)

Date: 2026-10-12. Branch: `rebuild/midnight-studio`. Previous design preserved at tag
`v1-editorial-masthead` / branch `legacy/editorial-masthead`.

## Goal

Rebuild every page of the portfolio from zero in the style of the motion showcase demo
(dark, Instrument Serif display type, drifting gradient light, springs, FLIP, shared-element
transitions), recolored to the Steel & Ember palette. The user wants to build first and
adjust afterwards, so this spec records decisions, not final copy.

## Scope

- Rebuilt from zero: every page, layout, component, stylesheet, the admin UI, all motion.
- Carried over after review (not rewritten): `src/lib/*`, `src/app/api/*`, `middleware.ts`,
  `Dockerfile`, `deploy.ps1`. They are thin, validated SQL/MinIO wrappers with known fixes
  (utf8mb4, tee'd-fetch drain, same-origin check, Tailscale gate). Rewriting them would produce
  the same code and risk regressions. Revisit if the user wants them rewritten anyway.
- Data: same MySQL `portfolio` schema and MinIO buckets. Additive columns only if a page needs one.
  Data fix: `dba-performance` is `progress_status='not-started'` although the work is done.

## Stack

Next.js 16.3 App Router (existing), React 19.2, Tailwind v4, `motion` (motion/react) for springs,
drag, layout/FLIP and scroll reveals, React `<ViewTransition>` for cross-route shared elements
(no config needed in Next 16). Fonts via `next/font/google`: Instrument Serif, Inter, JetBrains Mono.
Tailwind v4 hover gate: `@custom-variant hover (&:hover);` site-wide (see project memory).

## Design tokens

| Token | Value |
|---|---|
| bg | `#0b0c0e` |
| text | `#ecebe8` |
| muted | `#8d8f94` |
| line | `rgba(255,255,255,.09)` |
| surface | `rgba(255,255,255,.035)` |
| steel (a) | `#4f7fa8` |
| ember (b) | `#e2703a` |
| brass (c, success) | `#c9a24a` |

Labels in accent use a lightened tint for AA contrast. Gradient text appears once per page at most
(hero key word), as in the demo.

Motion: ease `(0.2,0,0,1)`, emphasized `(0.05,0.7,0.1,1)`, accelerate `(0.3,0,1,1)`;
durations 160/320/600 ms; UI spring k180 c18, draggable spring k180 c12; stagger 60-90 ms, total
under 500 ms. `prefers-reduced-motion` → instant or crossfade. Admin: tokens, almost no motion.

## Pages

- `/`: hero (masked headline, orbs + cursor parallax, magnetic CTA) → by-the-numbers count-up
  (real DB values only) → projects with filter chips (FLIP) → skills by admin category →
  latest posts → contact ("Let's talk data", copy-email button morphs to success + brass confetti).
- `/projects`: full grid, filters, status badges. Tile → detail morph via `<ViewTransition>`.
- `/projects/[slug]`: morphed hero, sticky rail (project chain, links, updated date), draggable
  before/after metric card, Markdown writeup with syntax highlighting, prev/next navigation.
- `/blog`, `/blog/[slug]`: cover morphs into post hero; ~68ch reading column; read progress.
- `/about`: portrait, bio, DBA→DE timeline reveal, contact links.
- `not-found`: "empty set" SQL joke, restyled.
- `/admin/*`: same features as today (projects create/edit/image/links, blog create/edit/cover,
  skill categories), restyled, functional layout.
- Nav: glass bar, hides on scroll down, shows on scroll up, top scroll progress line; mobile
  full-screen menu with staggered links.

## Verification

- `tsc --noEmit` + `next build` clean.
- Local dev against swe-2 MySQL/MinIO over the tailnet (`.env.local`, gitignored). Note: local
  admin writes hit the live database; test writes get reverted.
- Real browser check of every page, signature interaction, reduced-motion mode and mobile width
  before asking the user to review. Deploy only after the user approves.
