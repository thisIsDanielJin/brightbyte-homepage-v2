---
phase: 05-r3f-hero
plan: 02
subsystem: ui
tags: [r3f, three.js, react-three-fiber, drei, mesh-transmission-material, performance-monitor, adaptive-dpr, intersection-observer, webgl, tailwind-v4, playwright]

# Dependency graph
requires:
  - phase: 05-r3f-hero (Plan 01 tracer)
    provides: HeroCanvas (ssr:false gate + dynamic import + data-ready fade-in wrapper), HeroScene (minimal Canvas), constants.ts (token-derived scene constants), HeroFallback (static gradient), no-canvas-server-bundle.sh (HERO-01), extended Playwright hero + reduced-motion coverage
provides:
  - components/hero/GlassMesh.tsx — single icosahedron + MeshTransmissionMaterial, token-driven lights (no HDRI), Y-axis rotation, responsive placement, tier1-first degraded prop
  - Fully-wired HeroScene: IntersectionObserver → frameloop always/never on the SAME Canvas (no remount, D-05), PerformanceMonitor + AdaptiveDpr, onDecline/onIncline → degraded material toggle
  - The frosted-glass hero centerpiece rendering behind the z-10 text column, cross-fading in over the always-painted gradient (D-11) with ssr:false isolation intact
affects: [05-03 (phase perf + legibility gate — draw calls < 200, LCP/CLS budget, WCAG-AA legibility scrim; tier2 non-transmissive fallback is a scoped follow-up ONLY if this tier1-first path misses the mobile budget)]

# Actuals (#2632)
actuals:
  tokens: 2816    # chars/4 over the components/hero/ diff (HEAD~1..HEAD), ~11.3k chars
  tasks: 1        # Task 1 (the opening checkpoint was pre-resolved to tier1-first by user decision)
  commits: 1      # 1 feature commit (+ this SUMMARY commit)

# Tech tracking
tech-stack:
  added: []   # no new deps — R3F stack installed in Plan 01; this plan only consumes drei MeshTransmissionMaterial/PerformanceMonitor/AdaptiveDpr
  patterns:
    - "Offscreen render-loop pause: IntersectionObserver → isVisible state → frameloop={isVisible?'always':'never'} on the SAME <Canvas> (controlled prop, never a remount — RESEARCH Pattern 2 / Pitfall 5)"
    - "Adaptive quality without a custom FPS counter: <PerformanceMonitor onDecline/onIncline> + <AdaptiveDpr /> auto-scaling dpr within [1,2] (floor 1.0), onDecline toggling an in-place material degradation prop"
    - "Single-material tier1-first degradation: MeshTransmissionMaterial samples/resolution reduced + transmissionSampler enabled on decline — one material path everywhere, no non-transmissive branch"
    - "Token-driven R3F lighting (no HDRI/Environment): ambient/directional/point colors sourced only from constants.ts hex derived from styles/tokens.css"
    - "Responsive scene composition via useThree((s) => s.size.width) picking desktop (right-of-center focal mass) vs mobile (centered, pushed back) placement — continuous canvas-size response, one width guardrail"

key-files:
  created:
    - components/hero/GlassMesh.tsx
  modified:
    - components/hero/HeroScene.tsx
    - components/hero/constants.ts

key-decisions:
  - "CHECKPOINT RESOLVED: mobile degradation strategy locked to tier1-first by explicit user decision — keep the full MeshTransmissionMaterial transmission look on ALL devices; on PerformanceMonitor.onDecline degrade IN PLACE (samples 6→2, resolution 256→32, transmissionSampler=true). No separate non-transmissive mobile material path. Tier 2 is a scoped Plan 03 follow-up only if the perf gate misses budget."
  - "degraded state lives in HeroScene (owns the PerformanceMonitor lifecycle) and is passed to GlassMesh as a prop — keeps GlassMesh a pure presentational mesh and the perf policy in one place"
  - "Responsive placement split at GLASS_BREAKPOINT_PX=768 via useThree width; desktop position [0.9,0,0]/scale 1.25 (focal mass ~65-70% right), mobile [0,0.15,-0.6]/scale 0.95 (centered, pushed back so it does not crowd the full-width text column) — local scene constants, no new design token"
  - "transmissionSampler only enabled on the degraded path (Pitfall 3 — internal buffer can't see transparent siblings; safe for this single-mesh scene, documented in GlassMesh JSDoc)"
  - "HeroScene starts isVisible=true (hero is above the fold on first paint); IntersectionObserver corrects immediately if scrolled out — avoids a first-frame pause flash"

patterns-established:
  - "R3F offscreen pause: frameloop controlled prop from IntersectionObserver on the unchanged Canvas element (D-05, no remount)"
  - "In-place transmission degradation: a single degraded boolean flips samples/resolution/transmissionSampler — the look is preserved, only the cost drops"

requirements-completed: [HERO-01, HERO-02]

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "A single frosted-glass rounded solid (icosahedron + MeshTransmissionMaterial) renders behind the hero text, lit only by Phase-1 token colors, rotating slowly on Y — no raw hex in GlassMesh.tsx, no HDRI/Environment (D-01/D-03/D-04/D-09)"
    requirement: HERO-01
    verification:
      - kind: other
        ref: "grep -vE '^\\s*(//|\\*|/\\*)' components/hero/GlassMesh.tsx | grep -cE '#[0-9A-Fa-f]{6}' == 0 (no-inline-hex ok)"
        status: pass
      - kind: automated_ui
        ref: "tests/sections/hero.spec.ts#Hero — de/en › renders and hero headline is non-empty (canvas visible + aria-hidden ancestor, mobile-375 + desktop-1440)"
        status: pass
      - kind: other
        ref: "npx tsc --noEmit (clean) && npm run build (succeeds)"
        status: pass
  - id: D2
    description: "The render loop pauses (frameloop='never') when the hero is scrolled out of the viewport without remounting the Canvas, and PerformanceMonitor + AdaptiveDpr drive tier1-first mobile degradation within budget (D-05, D-12, ROADMAP SC #4)"
    requirement: HERO-01
    verification:
      - kind: other
        ref: "Code: IntersectionObserver → frameloop={isVisible?'always':'never'} on the same <Canvas>; <PerformanceMonitor onDecline={()=>setDegraded(true)}> + <AdaptiveDpr />; GlassMesh samples/resolution/transmissionSampler switch on degraded"
        status: pass
      - kind: manual_procedural
        ref: "Plan 03 perf gate: draw calls < 200, PerformanceMonitor DPR adaptation on throttle, offscreen pause measurement (deferred per plan <verification>)"
        status: unknown
  - id: D3
    description: "The ssr:false isolation (HERO-01) and the reduced-motion / no-WebGL gate (HERO-02, D-06) from Plan 01 remain intact after the scene expansion — no <canvas> under reduced motion, no three code in the server bundle"
    requirement: HERO-02
    verification:
      - kind: other
        ref: "bash tests/invariants/no-canvas-server-bundle.sh → PASS [HERO-01], exit 0"
        status: pass
      - kind: automated_ui
        ref: "tests/sections/hero.spec.ts + tests/motion/reduced.spec.ts → canvas count 0 under prefers-reduced-motion (de+en, mobile-375+desktop-1440)"
        status: pass
    human_judgment: false

# Metrics
duration: ~25min
completed: 2026-08-24
status: complete
---

# Phase 5 Plan 02: R3F Hero Glass Centerpiece Summary

**The proven tracer mesh becomes the real centerpiece: a single frosted-glass icosahedron wrapped in `MeshTransmissionMaterial`, lit entirely by Phase-1 token colors (no HDRI), rotating slowly on Y, with the render loop paused offscreen via IntersectionObserver, `PerformanceMonitor` + `AdaptiveDpr` driving the locked tier1-first in-place degradation, and the ssr:false isolation + reduced-motion gate from Plan 01 fully intact.**

## Checkpoint Resolution

Plan 02 opens with `<task type="checkpoint:decision" gate="blocking">` to lock the mobile degradation strategy for `MeshTransmissionMaterial`. **This checkpoint resolved to `tier1-first` by explicit user decision** (recorded in the orchestrator prompt). Implementation followed the locked strategy exactly:

- Full `MeshTransmissionMaterial` transmission look on **all** devices — one material path.
- `PerformanceMonitor.onDecline` degrades **in place**: `samples` 6→2, `resolution` 256→32, `transmissionSampler={true}`.
- **No** separate non-transmissive (`meshPhysicalMaterial`) mobile branch. Tier 2 remains a scoped Plan 03 follow-up, invoked only if the Plan 03 perf gate misses the Moto G4 / LCP budget.

## Performance

- **Duration:** ~25 min
- **Completed:** 2026-08-24
- **Tasks:** 1 implementation task (the opening checkpoint was pre-resolved by user decision, not re-asked)
- **Files:** 1 created (GlassMesh.tsx), 2 modified (HeroScene.tsx, constants.ts)

## Accomplishments
- **Created `components/hero/GlassMesh.tsx`** — a single `<mesh>` with `<icosahedronGeometry args={[1,4]} />` and `<MeshTransmissionMaterial>` (drei **named** import, never barrel). Token-driven lighting: `ambientLight` + `directionalLight` colored `SURFACE_HEX`, `pointLight` colored `ACCENT_HEX` — **no `drei <Environment>`, no HDRI** (D-09, RESEARCH Pattern 4). Y-axis rotation via `useFrame` at `ROTATION_SPEED`. `roughness = GLASS_ROUGHNESS = 0.05` (≤ 0.05, Pitfall 6). Responsive placement chosen from `useThree((s) => s.size.width)`: desktop focal mass right-of-center, mobile centered + pushed back. **Zero raw hex** on non-comment lines (inline grep gate passes).
- **Wired `components/hero/HeroScene.tsx`** — `IntersectionObserver` → `isVisible` state drives `frameloop={isVisible ? 'always' : 'never'}` on the **same** `<Canvas>` (controlled prop, no remount — Pitfall 5, D-05). Wrapped the scene in `<PerformanceMonitor onDecline={() => setDegraded(true)} onIncline={() => setDegraded(false)}>` with `<AdaptiveDpr />` and `<GlassMesh degraded={degraded} />`. Preserved `dpr={[1,2]}` (floor 1.0, never lower), `gl={{ antialias:false }}`, `onCreated={onReady}`, `style={{position:'absolute',inset:0}}`, camera from constants.
- **Added local scene placement constants** to `constants.ts` (`GLASS_BREAKPOINT_PX`, `GLASS_POSITION_DESKTOP/MOBILE`, `GLASS_SCALE_DESKTOP/MOBILE`) — pure R3F world-space values, **no new design token** in styles/tokens.css.
- **Verified the fade-in** without re-implementing it: HeroCanvas's `data-[ready=true]:opacity-100` wrapper + `onReady` from `onCreated` already cross-fades the glass in over the still-painted gradient (~500ms ease-out, D-11) — confirmed via the canvas-visible Playwright branch.
- **Preserved the isolation + accessibility contracts:** HeroCanvas's reduced-motion / WebGL gate and HeroSection untouched; `no-canvas-server-bundle.sh` still exits 0.

## Task Commits
1. **Task 1: Build GlassMesh + wire HeroScene** — `9d790eb` (feat)

## Files Created/Modified
- `components/hero/GlassMesh.tsx` — **created**: single icosahedron + `MeshTransmissionMaterial`, token-driven lights, `useFrame` Y-rotation, `useThree`-derived responsive placement, `degraded` prop switching samples/resolution/transmissionSampler. JSDoc documents the SCENE CONTRACT, the tier1-first lock, and the transmissionSampler single-mesh assumption.
- `components/hero/HeroScene.tsx` — **modified**: expanded from the tracer Canvas to the full scene (IntersectionObserver frameloop, PerformanceMonitor, AdaptiveDpr, GlassMesh + degraded state). All Plan 01 Canvas props (`dpr`, `gl`, `onCreated`, `style`, camera) retained.
- `components/hero/constants.ts` — **modified**: added the responsive placement constants; existing color/material/timing constants untouched (each hex still carries its `// from --color-*` source-token comment).

## Decisions Made
- **tier1-first (user-locked):** single transmission material path everywhere; in-place degradation on decline. See "Checkpoint Resolution" above.
- **`degraded` owned by HeroScene:** the PerformanceMonitor lifecycle and the perf policy live together in HeroScene; GlassMesh stays a pure presentational mesh receiving `degraded` as a prop.
- **`isVisible` initialised `true`:** the hero is above the fold on first paint, so starting `true` avoids a one-frame pause flash; the observer corrects on the next tick if it is actually offscreen.
- **`transmissionSampler` only on the degraded path:** the internal buffer can't render transparent siblings (Pitfall 3) — safe for this single-mesh scene and documented in the GlassMesh JSDoc; guard if a second transparent object is ever added.

## Deviations from Plan
None — the plan executed exactly as written. No Rule 1/2/3 auto-fixes were needed (tsc, build, hex gate, and isolation invariant all passed on the first run); no Rule 4 architectural decisions arose. The opening `checkpoint:decision` was resolved to `tier1-first` by user decision before implementation and was not re-asked.

## Regression Gate Results
- `npx tsc --noEmit`: **clean**.
- Inline hex gate on GlassMesh.tsx (`grep -vE '^\s*(//|\*|/\*)' | grep -cE '#[0-9A-Fa-f]{6}'` == 0): **no-inline-hex ok**.
- `npm run build`: **succeeds**.
- `bash tests/invariants/no-canvas-server-bundle.sh` (HERO-01): **PASS, exit 0** — three.js/@react-three code absent from the server bundle; isolation preserved.
- `npm run test:invariants` (full chain): **PASS** — IDENT-01 (no raw hex in app/), I18N-01, CMS-03 (single client + no stega). No IDENT-01 regression.
- **Full production Playwright suite vs `next start` (CI=1, own server, port 3000 pre-cleared): 133 passed, 1 failed.** The single failure is the **accepted pre-existing** `tests/i18n/smoke.spec.ts:63 [mobile-375] language switcher /de → /en` (language-switcher link not visible at 375px; unrelated to Phase 5 — identical to Plan 01's result). The hero canvas-visible happy path and the reduced-motion canvas-count-0 specs **stayed green** — no regression from the glass expansion.

## Screenshots
The production Playwright run regenerated tracked PNGs under `tests/screenshots/`. The **4 hero screenshots** (`hero-{de,en}-{375,1440}px.png`) changed as expected — they now show the rendered frosted-glass scene. The other regenerated screenshots (about/pricing/services/testimonials/work) are **unrelated non-hero QA jitter** and, per the plan directive and Plan 01's precedent (screenshots are incidental test outputs, not `files_modified` artifacts), **were NOT committed** — all screenshots left unstaged.

## Next Phase Readiness
- **Plan 03 (phase gate)** should: register `no-canvas-server-bundle.sh` into the `test:invariants` chain; measure draw calls < 200, PerformanceMonitor DPR adaptation on throttle, and the offscreen pause in a production build; hard-gate the WCAG-AA legibility scrim (D-08) over the now-live glass; and confirm the tier1-first mobile budget on a low-end device profile — invoking the tier2 non-transmissive fallback **only** if tier1-first misses LCP/draw-call budget.
- No blockers.

---
*Phase: 05-r3f-hero*
*Completed: 2026-08-24*

## Self-Check: PASSED
- All created/modified source files exist on disk (GlassMesh.tsx created; HeroScene.tsx + constants.ts modified) and the SUMMARY was written.
- Task 1 commit `9d790eb` present in git history.
