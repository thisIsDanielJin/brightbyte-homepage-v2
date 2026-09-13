---
type: quick
slug: hero-centered-webdev
created: 2026-09-13
completed: 2026-09-13 19:19 CEST
status: complete
---

# Summary: Centered hero + full-bleed dots + web-dev repositioning

All three coupled changes shipped and verified. Task complete.

## What shipped

### 1. Copy → web-development framing (Commit `8440b2e`)
- Repo i18n (`messages/de.json`, `messages/en.json`) `Hero.headline` + `Hero.subline`:
  - DE headline: `Deine Website, fertig gebaut und live`
  - EN headline: `Your website, built and shipped`
  - DE subline: `Design, Entwicklung und Launch — komplett von mir, zum Festpreis.`
  - EN subline: `Design, development and launch — all from me, at a fixed price.`
- Overline (`HeroSection.tsx`): `Berlin · Webdesign Studio` → `Berlin Web Development Studio` (no middle dot).
- **Sanity CMS also patched** (see Runtime-copy note below) — the i18n is only the fallback.

### 2. Centered layout (Commit `698422e`)
- `HeroSection.tsx`: split left-aligned column → centered single column
  (`mx-auto text-center`, `max-w-[900px]` headline, `max-w-[560px]` subline centered,
  centered overline / CTA / proof / scroll hint).
- Replaced the left-anchored desktop gradient scrim with a **symmetric** treatment:
  - Mobile: near-solid `bg-surface/85` full-bleed band.
  - Desktop: centered vertical wash `bg-gradient-to-b from-surface/70 via-surface/80
    to-surface/70` — strongest through the vertical middle, fades at top/bottom so the
    wave stays visible at the edges.
- CLS-zero contract intact (backdrop always painted, z-layering unchanged).

### 3. Full-section wave, tuned (Commit `13d8c37`)
- `constants.ts`: `POINTCLOUD_BASE_SIZE` 16→20, `POINTCLOUD_LIT_SIZE` 26→34,
  `WAVE_WIDTH` 0.5→0.9 (wider band), `WAVE_SPEED` 0.55→0.4 (slower sweep).
- New `WAVE_SPAN_SCALE = 0.6`: scales ONLY the off-screen idle margin (not coverage),
  so the front recurs sooner ("increase frequency" = faster recurrence, user-confirmed)
  while still crossing the full grid width edge-to-edge.
- `PointCloud.tsx`: rewired `margin = WAVE_WIDTH * WAVE_SPAN_SCALE`,
  `waveSpanX = halfX*2 + margin*2` — full-width coverage preserved, shorter dead time.
- `HeroFallback.tsx`: SVG dot radius 2.6→3.2 to match bigger live dots.

## Verification (all passed, on `next start`)
- `npm run build` clean (Node 22.22 — Node 20 fails prebuild on Sanity typegen ≥22.12).
- Playwright, /de + /en, 1440×900 + 375×812:
  - Layout centered, hierarchy correct, CTA prominent, copy legible over dots.
  - Wave full-width, dots bigger, slower.
  - `window.__r3f_hero.calls()` === **1** (D-12 held) in all 4 cases.
  - **0** console errors, **0** hydration errors in all 4 cases.
  - Rendered headlines confirmed: DE `Deine Website, fertig gebaut und live`,
    EN `Your website, built and shipped`.

## Runtime-copy note (IMPORTANT for future copy edits)
The hero headline/subline render from **Sanity siteSettings**, NOT the repo i18n —
`HeroSection` uses `headline ?? t('headline')` and `page.tsx` passes
`settings.heroHeadline`. The i18n messages are only the fallback when Sanity is null.
There are **two** siteSettings docs (document-internationalization):
- `_id: "siteSettings"` (language `de`)
- `_id: "siteSettings.en"` (language `en`)
Both were patched via the Content Lake API this session (Editor token). To change hero
copy in future: edit BOTH Sanity docs (via Studio at `/studio` or API), not just the
repo messages — the plan's original assumption ("i18n fallback is what renders now")
was wrong; Sanity was overriding.

## Post-task human actions
- **DELETE the write token** — `SANITY_API_WRITE_TOKEN` is still in `.env.local` and at
  sanity.io/manage. It can modify all dataset content. Remove from `.env.local`
  (`sed -i '' '/SANITY_API_WRITE_TOKEN/d' .env.local`) and revoke in sanity.io/manage.
- `sanity.types.ts` has a small uncommitted diff pre-dating this task (unrelated) — leave or revert.

## Revert path
- Copy: revert `8440b2e` (repo) + re-patch Sanity docs to old strings.
- Layout: revert `698422e`.
- Wave: revert `13d8c37`.
