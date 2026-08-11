---
phase: 01-identity-design-tokens
plan: 02
subsystem: identity
tags: [logo, svg, brand-voice, identity, plus-jakarta-sans, fonttools, svgo, ident-03, ident-04]

requires:
  - "01-01: styles/tokens.css with canonical hex values for fills"
  - "01-01: Plus Jakarta Sans woff2 font file in .next/static/media/"

provides:
  - "public/logo-light.svg — wordmark for light backgrounds, text-as-paths, <5KB, token-matched fills"
  - "public/logo-dark.svg — wordmark for dark backgrounds, text-as-paths, <5KB, token-matched fills"
  - "docs/brand-voice.md — 1-page bilingual brand voice guide (DE/EN forbidden words, CTA rules, approved copy)"

affects:
  - Phase 4 (Logo component consumer — needs variant='light'|'dark' prop pattern per RESEARCH Pitfall 4)
  - Phase 4+ (all copy written against docs/brand-voice.md)

actuals:
  tokens: 9800
  tasks: 2
  commits: 2

tech-stack:
  added:
    - "svgo@4.0.2 (devDependency — SVG optimization)"
    - "fontTools 4.51.0 (system Python — font glyph-to-path generation)"
  patterns:
    - "Text-as-paths generation: Python fontTools + varLib.instancer at wt700 and wt400 → SVGPathPen → optimized with svgo"
    - "svgo.config.mjs with convertColors:false + keepRoleAttr:true to preserve token hex values and role=img"
    - "Dark variant = same path geometry, only fills swapped (not a separate design pass)"

key-files:
  created:
    - public/logo-light.svg
    - public/logo-dark.svg
    - docs/brand-voice.md
    - svgo.config.mjs
  modified:
    - package.json (svgo devDependency added)

key-decisions:
  - "Path generation via fontTools instancer (wt700 / wt400) from the already-downloaded .next/static/media woff2 — no extra font download needed"
  - "svgo with convertColors:false preserves exact token-matched hex values (#18181B, #52525B, #F4F4F5, #A1A1AA) and keepRoleAttr:true preserves role=img"
  - "ViewBox calculated from font metrics (cap-height clear space on all sides, two-line layout BrightByte/Berlin)"

requirements-completed: [IDENT-03, IDENT-04]

coverage:
  - id: D7
    description: "public/logo-light.svg and public/logo-dark.svg — text-as-paths SVGs with token-matched fills, <5KB, role=img, no script"
    requirement: IDENT-03
    verification:
      - kind: other
        ref: "! grep -q '<text' public/logo-*.svg — exits 0"
        status: pass
      - kind: other
        ref: "grep -q '#18181B' public/logo-light.svg — exits 0"
        status: pass
      - kind: other
        ref: "grep -q '#F4F4F5' public/logo-dark.svg — exits 0"
        status: pass
    human_judgment: true
    rationale: "Aesthetic legibility at 120px on both surfaces requires human visual review — cannot be automated"
  - id: D8
    description: "docs/brand-voice.md — 1-page bilingual voice guide with full forbidden-word lists and approved copy table"
    requirement: IDENT-04
    verification:
      - kind: other
        ref: "grep -q 'maßgeschneidert' docs/brand-voice.md && grep -q 'cutting-edge' docs/brand-voice.md — exits 0"
        status: pass
      - kind: other
        ref: "grep -qi 'Projekt anfragen' docs/brand-voice.md — exits 0"
        status: pass
    human_judgment: false

duration: 18min
completed: 2026-08-11
status: complete
---

# Phase 01 Plan 02: Logo + Brand Voice Summary

**Plus Jakarta Sans wordmark (text-as-paths, token-matched fills, svgo-optimized) + 1-page bilingual brand voice guide — completing Phase 1 identity deliverables IDENT-03 and IDENT-04**

## Performance

- **Duration:** 18 min
- **Started:** 2026-08-11T12:11:21Z
- **Completed:** 2026-08-11T12:29:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- `public/logo-light.svg` — BrightByte Berlin wordmark for light surfaces: BrightByte in Plus Jakarta Sans weight 700 / tracking -0.03em / fill `#18181B`; Berlin weight 400 / tracking +0.12em / fill `#52525B`. 4.88KB, zero `<text>` nodes, zero `font-family`, zero `<script>`, `role="img" aria-label="BrightByte Berlin"`.
- `public/logo-dark.svg` — same path geometry, fills swapped to `#F4F4F5` (BrightByte) and `#A1A1AA` (Berlin) for dark surfaces. Same accessibility attributes.
- Fill hex values trace directly to tokens.css: `--color-primary` (#18181B), `--color-secondary` (#52525B), `--color-on-dark` (#F4F4F5), `--color-muted-on-dark` (#A1A1AA).
- `docs/brand-voice.md` — scannable 1-page guide: one-sentence essence, 8-rule table (tone/register/sentence-length/forbidden-words-DE/forbidden-words-EN/credibility/headlines/CTAs), bilingual Approved Copy Elements table with all 7 element types.
- Raw-hex invariant gate (no-raw-hex.sh) remains green — SVGs in `public/` are not scanned by the app/ grep gate.

## Task Commits

1. **Task 1: Wordmark logo** — `dea12e8` (feat)
2. **Task 2: Brand voice guide** — `1a836ea` (feat)

## Files Created/Modified

- `public/logo-light.svg` — BrightByte Berlin wordmark (light backgrounds)
- `public/logo-dark.svg` — BrightByte Berlin wordmark (dark backgrounds)
- `docs/brand-voice.md` — Brand voice reference card, all v2 copy written against this
- `svgo.config.mjs` — svgo config: convertColors:false + keepRoleAttr:true
- `package.json` — svgo@4.0.2 added as devDependency

## Decisions Made

- **Path generation approach:** Used Python fontTools + `varLib.instancer` to instantiate the Plus Jakarta Sans variable font at wt700 (BrightByte) and wt400 (Berlin) from the already-downloaded `.next/static/media/` woff2 file. SVGPathPen with TransformPen applied scale + tracking offset per glyph advance width. No extra font download or Figma required.
- **svgo configuration:** `convertColors: false` preserves the token-matched uppercase hex values that the verify grep gate checks. `keepRoleAttr: true` preserves `role="img"` which svgo's preset-default normally strips as a non-standard SVG attribute.
- **Dark variant geometry:** Identical path data to light variant — only fill attributes differ. No separate layout pass. Ensures pixel-perfect consistency and halves maintenance surface.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] svgo stripped role="img" and lowercased hex values with default settings**
- **Found during:** Task 1 (first svgo run)
- **Issue:** `svgo` with default `preset-default` config strips `role` (not a standard SVG attribute in its ruleset) and lowercases all hex values (`#18181B` → `#18181b`). The plan's verify command uses `grep -q '#18181B'` (uppercase), which would fail. Additionally, `role="img"` is an accessibility requirement.
- **Fix:** Created `svgo.config.mjs` with `convertColors: false` (preserves case) and `keepRoleAttr: true` (preserves role). Both SVGs re-optimized with this config. Size impact: +11 bytes (4880→4891), still well under 5KB.
- **Files modified:** `svgo.config.mjs` (created), both SVGs regenerated
- **Commit:** `dea12e8`

---

**Total deviations:** 1 auto-fixed (Rule 1 — tool behavior, not a logic bug)
**Impact on plan:** Essential correctness fix. Without it the verify gate would fail and role=img would be missing.

## Known Stubs

None — both SVGs are production-quality assets with real glyph path data. The brand voice guide is a complete reference document.

## Threat Surface Scan

Both SVGs checked:
- Zero `<script>` elements
- Zero `<use>` with external href
- Zero `xlink:href`
- Zero `<text>` nodes (no font dependency)
- Authored paths only — not sourced from untrusted input

Threat T-01-02 (SVG XSS via public/ static asset) is mitigated as specified in the plan threat model.

## Self-Check

---
## Self-Check: PASSED

- `public/logo-light.svg` exists: FOUND
- `public/logo-dark.svg` exists: FOUND
- `docs/brand-voice.md` exists: FOUND
- Commit `dea12e8` exists: FOUND
- Commit `1a836ea` exists: FOUND
- No `<text>` nodes in SVGs: VERIFIED
- Fill values present (#18181B, #52525B, #F4F4F5, #A1A1AA): VERIFIED
- raw-hex invariant gate: PASS
