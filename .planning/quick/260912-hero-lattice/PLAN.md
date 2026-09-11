---
quick_id: 260912-194
slug: hero-lattice
description: Replace the frosted-glass 3D hero with a "Bright Lattice" wireframe signature
date: 2026-09-12
status: complete
planner_model: opus
executor_model: opus
---

# Quick Task: Hero "Bright Lattice" redesign

Replace the weak frosted-glass 3D hero centerpiece with a **Bright Lattice**: a slowly
rotating wireframe polyhedron whose edges are the object, with a single accent-colored
pulse of light traveling the edge network like current on a circuit board.

## Why (decision record)

User chose this over 3 alternatives (rescue-the-glass / material-shader / kill-3D) and
picked the "Bright lattice" motif over "byte field" and "typographic signal" on 2026-09-12.

The glass is weak because `MeshTransmissionMaterial` with `transmission:1` needs high
geometry detail + an HDRI/bright scene to refract + high buffer resolution to look
stunning — and ALL of those were killed by the D-12 mobile LCP budget (`GLASS_DETAIL`
cut 4→2 = visibly faceted; `resolution` 128, `samples` 3 = blurry; no Environment per
D-09 = nothing to refract but a flat gradient → muddy/dark). The current object is the
compromise and it reads as one.

The lattice inverts the tradeoff: **crisp at any resolution (lines need no transmission
buffer), ~2 draw calls, so the D-12 budget stops being a design constraint.** It is
bespoke (no default 3D hero is a pulse-traced lattice) and on-brand (uses the accent
token; "engineered, precise, calm" fits confidence-through-restraint + SMB trust).

## Scope

### Files to CHANGE
- `components/hero/GlassMesh.tsx` → rename/rewrite to `components/hero/LatticeMesh.tsx`
  - Geometry: `IcosahedronGeometry(1, 1)` → `EdgesGeometry` → `<lineSegments>` with
    `LineBasicMaterial`. Detail **1** (not 2) = clean readable edge network.
    Line color = muted surface tone via token constant (near-white on dark backdrop).
  - **The pulse (signature):** small accent-colored point/sphere traveling edge-to-edge
    along the wireframe on a timed loop. Walk the edge vertex-pair list; in `useFrame`
    lerp position along the current edge, advance to next edge at t≥1. Accent color from
    `ACCENT_HEX`. This is the ONE bold element — keep everything else quiet.
  - Keep slow single-axis Y rotation (`ROTATION_SPEED`); consider a whisper of X tilt so
    it is not a flat spin.
  - **DELETE the 3 lights** (ambient/directional/point) — `LineBasicMaterial` is unlit.
  - Keep responsive placement (desktop right-of-center ~65%, mobile centered/back) via
    `useThree` width — reuse `GLASS_POSITION_*` / `GLASS_SCALE_*` constants (rename to
    `LATTICE_*` for clarity, optional).
  - OPTIONAL depth layer: a second larger, fainter lattice rotating opposite for parallax.
    Cut if it adds noise (Chanel's "remove one accessory") — evaluate on screenshot.
- `components/hero/HeroScene.tsx`
  - Remove `<GlassMesh degraded>` → `<LatticeMesh>`. Remove the `degraded` state +
    `PerformanceMonitor` onDecline/onIncline IF draw calls stay trivially low (verify via
    `window.__r3f_hero.calls()` — expect < ~10). Keep `AdaptiveDpr` only if measurably
    needed; lattice likely does not need it. Keep the `DebugHook` (perf gate reads it).
  - Keep `frameloop` visibility pause (D-05), `onCreated`/`onReady` cross-fade.
- `components/hero/constants.ts`
  - Delete `GLASS_IOR`, `GLASS_ROUGHNESS`, `GLASS_THICKNESS`, `GLASS_SAMPLES`,
    `GLASS_RESOLUTION`, `GLASS_DETAIL`, `GLASS_SAMPLES_MOBILE`, `GLASS_RESOLUTION_MOBILE`.
  - Add lattice params: `LATTICE_DETAIL = 1`, line color constant (source-token comment),
    `PULSE_SPEED`, pulse size. Keep `ROTATION_SPEED`, camera, placement, fade, idle consts.
  - Keep the IDENT-01 source-token comment discipline on every hex (file is outside the
    `no-raw-hex.sh` scan scope but comments keep derivation auditable).
- `components/hero/HeroFallback.tsx` (reduced-motion / no-WebGL / pre-hydration state)
  - **Decision: render a STATIC SVG lattice** (option b) so reduced-motion + no-WebGL
    users still see the signature (shape only, no animation, no pulse). A signature only
    visible to motion-enabled users is a half-signature. Must stay `absolute inset-0`,
    CLS = 0, no `'use client'`, no hooks. Accent used sparingly or not at all (static).

### Files that STAY AS-IS (good bones — do not touch)
- `components/hero/HeroCanvas.tsx` — isolation chain + the 2026-09-12 hydration fix
  (`mounted` gate so first client render matches server). Only the `HeroFallback` import
  target changes if the fallback is restructured.
- Isolation invariants: `no-canvas-server-bundle.sh` (three.js must not reach server
  bundle — dynamic ssr:false stays), `no-raw-hex.sh` (scans app/ only).

## Constraints (carry-over, non-negotiable)
- HERO-01 isolation: three.js only via `dynamic(ssr:false)` from HeroCanvas.
- HERO-02 / D-06: reduced-motion + no-WebGL → static fallback, NO canvas mounted.
- D-05: frameloop pauses offscreen.
- D-11: idle mount + ~500ms cross-fade over the always-painted gradient; CLS = 0.
- IDENT-01: token-derived colors only; source-token comment on every hex in constants.ts.
- D-12 mobile LCP budget: lattice must be cheaper than the glass it replaces (verify draw
  calls + no new heavy per-frame cost). This is the whole point — should be easy to hold.
- Bilingual: hero has no new copy; no i18n changes expected.

## Verification (before marking done)
1. `npm run build` clean (or `next start`) — no type errors, no hydration console errors.
2. Playwright screenshot `/de` AND `/en` hero at 1440px + 375px — lattice visible, crisp,
   pulse animating, placement correct (right-of-center desktop, centered mobile).
   Note: headless WebGL may under-render; if so, verify structurally + check a real browser.
3. `window.__r3f_hero.calls()` < ~10 draw calls (confirms the perf win).
4. Reduced-motion emulation → static SVG lattice shows (not blank gradient), no canvas.
5. Zero console errors on load (regression guard for the hydration fix).
6. Run existing hero invariant tests: `no-canvas-server-bundle.sh`, `no-raw-hex.sh`.

## Notes / open micro-decisions for build time
- Pulse implementation: simplest is one moving `<mesh>` sphere; alternative is a shader
  on the lines (glowing segment) — start with the sphere, it is cheaper and easier.
- If the single lattice reads too sparse, add the optional depth layer; if too busy,
  keep one. Decide from the 1440px screenshot.
- Consider `additive`-ish brightness on the pulse without a bloom pass (bloom = postprocess
  cost, avoid for the budget). A slightly larger soft sprite can fake glow cheaply.
