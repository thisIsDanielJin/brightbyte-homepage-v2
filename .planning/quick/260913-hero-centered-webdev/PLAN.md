---
type: quick
slug: hero-centered-webdev
created: 2026-09-13
status: planned
---

# Quick Task: Centered hero + full-bleed dots + webdev repositioning

## Objective

Three coupled changes to the hero, planned together because they share the same files:

1. **Centered layout** — restructure the hero from split (text left / canvas focal right)
   to a **centered** composition: overline → headline → subline → CTA → proof, all
   center-aligned in a single column, with the point cloud as a full-bleed backdrop
   behind everything. Verified against `mengto/landing-page` (ui-skills): one offer,
   one clear CTA, benefit-first headline, proof next to the claim.
2. **Full-section dots + fit the centered layout** — make the wave travel the ENTIRE
   hero (not just the right portion), tuned: bigger dots, wider wave band, higher
   frequency (more of the field lit at once / more visible wave activity), slightly
   slower sweep speed. Playwright-verified.
3. **Copy repositioning** — BrightByte is not "just web design." It builds/ships
   complete websites for clients → lean the copy toward web **development / shipping
   whole sites**, not decoration. Rewrite headline, subline, overline, CTA (DE + EN).

## Context (discovered)

- **Layout** is in `components/sections/HeroSection.tsx`:
  - Currently `max-w-[720px]` left-aligned column; headline `text-6xl…8xl`.
  - Two scrims: mobile `bg-surface/90`, desktop **left-anchored** gradient
    `md:w-2/3 from-surface/95 … to-transparent` (assumes focal art on the right).
    → For a centered layout the LEFT-anchored gradient is wrong; needs a symmetric /
    center-friendly legibility treatment instead.
  - Overline text is **hardcoded** at line 85: `Berlin · Webdesign Studio` (NOT i18n).
- **Copy** lives in `messages/de.json` + `messages/en.json` under `Hero`
  (headline, subline, cta, scrollHint). Sanity siteSettings can override at runtime
  but the i18n fallback is what renders now.
- **Dots** live in `components/hero/constants.ts` + `PointCloud.tsx`. Already centered
  background (`POINTCLOUD_POSITION_DESKTOP=[0,0,-0.5]`, scale 1.9, 32×18×8=4608 pts,
  base 16 / lit 26, WAVE_SPEED 0.55, WAVE_WIDTH 0.5). Fallback SVG in `HeroFallback.tsx`.

## Scope

### 3a. Layout → centered (`HeroSection.tsx`)
- Center the content column: `mx-auto text-center`, tighten `max-w` (headline
  ~`max-w-[900px]`, subline `max-w-[560px] mx-auto`), center the overline, CTA, proof,
  and scroll hint.
- Replace the left-anchored desktop gradient scrim with a **centered legibility
  treatment**: a soft full-width vertical wash (e.g. `bg-gradient-to-b` subtle, or a
  centered radial `bg-surface/70` behind the text block only) so the copy stays WCAG AA
  over the now-full-bleed dots WITHOUT killing the dots at the edges. Keep mobile band.
- Keep D-11/CLS contract: `min-h-dvh`, absolute-inset backdrop unchanged, z-layering
  (backdrop → canvas → scrim z-0 → text z-10) intact.

### 3b. Dots → full-section + tuned (`constants.ts`, maybe `PointCloud.tsx`)
- **Full section:** widen the wave's X travel so the lit front crosses the entire hero
  width (the cloud is already centered/scale 1.9; confirm the wave span covers the full
  visible extent — likely just scale/grid width + wave margin, no new mechanism).
- **Tuning (constants):**
  - Bigger dots: `POINTCLOUD_BASE_SIZE` 16 → ~20, `LIT_SIZE` 26 → ~34.
  - Wider wave: `WAVE_WIDTH` 0.5 → ~0.9 (softer, more points lit at once).
  - Higher frequency: more wave presence — either shorten the wrap span so the front
    recurs more often, OR (cleaner) keep one front but widen it (covered above). If
    "frequency" = more visible lit dots, the WAVE_WIDTH bump handles it; if it means
    the wave should recur faster, reduce effective span. Decide during build from the
    eyeball. Do NOT overshoot into "everything always lit."
  - Slower speed: `WAVE_SPEED` 0.55 → ~0.4.
- Update fallback SVG dot radius to match bigger live dots (`HeroFallback.tsx`).

### 3c. Copy → web-development framing (`messages/de.json`, `messages/en.json`, overline)
- Rewrite `Hero.headline`, `Hero.subline`, `Hero.cta` (keep scrollHint) in DE + EN so
  the promise is **building/shipping complete websites**, not "web design." Use
  landing-page copy rules: outcome + audience, specificity, benefit-first, strong CTA.
  Draft direction (final wording decided during build, user can veto):
  - DE headline: e.g. "Websites, die für dich arbeiten" / "Deine Website, fertig
    gebaut und live" (dev/shipping, not decoration).
  - EN headline: e.g. "Websites that work for your business" / "Your website, built
    and shipped."
  - Subline: keep the direct-with-me, fixed-price differentiators but frame around
    "complete site, designed AND built" / "from design to launch."
- Update the hardcoded overline in `HeroSection.tsx:85` from "Berlin · Webdesign Studio"
  to a web-development framing (e.g. "Berlin · Web Development Studio" — but keep it
  short; the overline is DE-context so weigh a German phrasing).

## Constraints / invariants (unchanged)
- IDENT-01: zero raw hex / no `text-gray-*` / no inline styles in `HeroSection.tsx`
  (tokens only). Dot hex stays in `constants.ts` with source-token comments.
- CLS = 0 (D-11): backdrop always painted, no layout shift on canvas mount.
- 1 draw call budget (D-12): tuning is uniforms/constants only — must stay 1 draw call.
- Hydration: any fallback SVG coord change stays rounded (no SSR/client float drift).
- next-intl: DE + EN must both be updated (parity) or the missing-key check trips.

## Verification (mandatory)
- `npm run build` clean (Node 22).
- **Playwright eyeball** (`next start` or dev, /de + /en, 1440×900 AND 375×812):
  - Layout reads centered, hierarchy correct, CTA prominent, copy legible over dots.
  - Wave sweeps the FULL hero width, dots bigger, wave wider, slower — eyeball 2 frames.
  - `window.__r3f_hero.calls()` still = 1.
  - 0 hydration errors in console.
- Copy: confirm DE + EN both render the new web-dev framing.

## Commits (atomic)
1. `feat(hero): rewrite copy toward web development / shipping sites (DE+EN + overline)`
2. `feat(hero): center hero layout + centered legibility scrim`
3. `feat(hero): full-section wave — bigger dots, wider+slower wave (constants)`
(Order may merge 2+3 if the eyeball needs them tuned together.)

## Revert path
- Current split layout + "Webdesign" copy = HEAD before this task
  (`ea80be5` hydration fix / `7651bae` full-width bg). One-file reverts each.

## Open decisions (RESOLVED 2026-09-13 — user-confirmed, build to these)
- **Headline = Option A** (locked):
  - DE: `Deine Website, fertig gebaut und live`
  - EN: `Your website, built and shipped`
  - Subline: reframe around "designed AND built, direct with me, fixed price" — keep
    the fixed-price + direct-contact differentiators, drop the "web design" framing.
    Draft DE: `Design, Entwicklung und Launch — komplett von mir, zum Festpreis.`
    Draft EN: `Design, development and launch — all from me, at a fixed price.`
    (final subline wording author's discretion at build; keep specificity + benefit-first.)
  - CTA: keep `Projekt anfragen` / `Start a project` (already strong per landing-page).
- **"Increase frequency" = FASTER RECURRENCE** (user-confirmed): the wave should sweep /
  restart sooner so wave activity is more frequent — SHORTEN the effective wrap span
  (or add a shorter period) IN ADDITION to the WAVE_WIDTH widening. Both: wider band AND
  more frequent passes. Still must not become "everything always lit" — eyeball the balance.
- **Overline = `Berlin Web Development Studio`** (user-confirmed) — NO middle dot
  (drop the ` · ` separator; plain "Berlin Web Development Studio").
