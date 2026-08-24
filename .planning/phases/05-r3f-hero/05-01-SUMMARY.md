---
phase: 05-r3f-hero
plan: 01
subsystem: ui
tags: [r3f, three.js, react-three-fiber, drei, motion, webgl, next-dynamic, ssr-false, reduced-motion, tailwind-v4, playwright]

# Dependency graph
requires:
  - phase: 04-content-sections
    provides: HeroSection shell (container, z-10 text column, .hero-backdrop gradient, Sanity copy + next-intl fallback), MotionSection, ContactSection client-island pattern, useReducedMotion from motion/react
provides:
  - components/hero/ module — HeroFallback (static gradient), constants.ts (token-derived scene constants), HeroScene (minimal Canvas), HeroCanvas (ssr:false gate + dynamic import + fade-in wrapper)
  - Proven ssr:false isolation chain (page.tsx Server → HeroSection → HeroCanvas → dynamic(import HeroScene, {ssr:false})) with no server-bundle leak
  - HERO-01 build invariant (tests/invariants/no-canvas-server-bundle.sh) detecting three.js/@react-three module code in the Next server bundle
  - Reduced-motion + no-WebGL one-way accessibility gate (D-06) — zero <canvas> in DOM, gradient fallback with CLS = 0
  - R3F stack installed at pinned versions; motion promoted to a direct dependency
  - Extended Playwright coverage — canvas visibility (WebGL-sniffed) + reduced-motion canvas-absence in hero.spec.ts and reduced.spec.ts
affects: [05-02 (glass mesh expansion — MeshTransmissionMaterial, PerformanceMonitor, IntersectionObserver offscreen-pause, responsive scale), 05-03 (phase gate — registers no-canvas invariant, LCP/CLS/draw-call budget)]

# Actuals (#2632)
actuals:
  tokens: 12937   # chars/4 over the full plan diff incl package-lock.json, excl regenerated screenshots
  tasks: 3
  commits: 3

# Tech tracking
tech-stack:
  added: [three@0.185.1, "@react-three/fiber@9.7.0", "@react-three/drei@10.7.8", motion@13.1.0 (promoted transitive→direct)]
  patterns:
    - "ssr:false isolation chain: 'use client' island + module-level dynamic(() => import('./Scene').then(m => m.Scene), { ssr:false })"
    - "next/dynamic named-export resolution via .then((m) => m.Named) — required when the lazy component is a named (not default) export"
    - "Reduced-motion / no-WebGL early-return gate BEFORE any Canvas (no element mounted at all — not paused)"
    - "CLS-zero backdrop swap: always-painted .hero-backdrop fallback + Canvas faded in over it via data-ready opacity transition"
    - "Token-derived JS constants file with per-hex source-token comments (outside the app/-scoped no-raw-hex.sh scan)"

key-files:
  created:
    - components/hero/HeroFallback.tsx
    - components/hero/constants.ts
    - components/hero/HeroScene.tsx
    - components/hero/HeroCanvas.tsx
    - tests/invariants/no-canvas-server-bundle.sh
  modified:
    - components/sections/HeroSection.tsx
    - package.json
    - package-lock.json
    - tests/sections/hero.spec.ts
    - tests/motion/reduced.spec.ts

key-decisions:
  - "next/dynamic loads HeroScene via .then((m) => m.HeroScene) because HeroScene is a named export — a bare import() typed the loader as the module namespace and broke tsc + the onReady prop contract"
  - "HERO-01 invariant signature narrowed to three.js/@react-three MODULE markers (not getContext('webgl')) — the canUseWebGL() DOM probe legitimately lives in the prerendered client island and is not a leak"
  - "aria-hidden lives on the HeroCanvas wrapper ancestor, not the R3F-created inner <canvas> — R3F does not forward it; the a11y outcome (canvas absent from a11y tree) is identical and matches UI-SPEC"
  - "Two .hero-backdrop divs under reduced motion (HeroSection's always-painted one + HeroFallback from the gate) is intentional and CLS-safe"
  - "Exact-pinned all four deps (stripped npm's default carets) to match the next/sharp pin style and the CLAUDE.md version lock"

patterns-established:
  - "R3F Canvas isolation: dynamic ssr:false at module top level inside a 'use client' island; scene file never imported by a Server Component"
  - "Deterministic Playwright Canvas testing: in-page WebGL sniff (page.evaluate on a probe canvas) selects the canvas-visible vs gradient-fallback branch so the suite is green with or without headless WebGL"
  - "Decorative Canvas a11y assertion via canvas.closest('[aria-hidden=\"true\"]') — holds regardless of R3F wrapper nesting depth"

requirements-completed: [HERO-01, HERO-02]

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "R3F Canvas mounts behind the hero text via the ssr:false isolation chain with no three.js/@react-three code in the server bundle (HERO-01)"
    requirement: HERO-01
    verification:
      - kind: other
        ref: "bash tests/invariants/no-canvas-server-bundle.sh (PASS [HERO-01]; three code absent from .next/server, present in .next/static)"
        status: pass
      - kind: automated_ui
        ref: "tests/sections/hero.spec.ts#Hero — de/en › renders and hero headline is non-empty (canvas visible + aria-hidden ancestor, mobile-375 + desktop-1440)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Under prefers-reduced-motion: reduce, no <canvas> is rendered at all — the static gradient fallback shows with zero layout shift (HERO-02, D-06)"
    requirement: HERO-02
    verification:
      - kind: automated_ui
        ref: "tests/sections/hero.spec.ts#no canvas in #hero when prefers-reduced-motion: reduce (de+en, both viewports)"
        status: pass
      - kind: automated_ui
        ref: "tests/motion/reduced.spec.ts#no canvas element in DOM under prefers-reduced-motion (D-06 / HERO-02)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Gradient (.hero-backdrop) is the SSR/LCP element and always paints; Canvas is client-only (absent from SSR HTML) and fades in over it; no hydration warnings"
    verification:
      - kind: integration
        ref: "curl next start /de → .hero-backdrop present + 0 <canvas> in SSR HTML; next start console shows no hydration warnings"
        status: pass
    human_judgment: false

# Metrics
duration: ~35min
completed: 2026-08-24
status: complete
---

# Phase 5 Plan 01: R3F Hero Tracer Summary

**Minimal three.js Canvas (single icosahedron) mounted behind the hero text through a proven `next/dynamic({ ssr:false })` isolation chain — no server-bundle leak, no hydration error, and a reduced-motion/no-WebGL gate that renders zero `<canvas>` with the gradient fallback at CLS = 0.**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-08-24 (this session)
- **Completed:** 2026-08-24
- **Tasks:** 3 (1 chore/scaffold, 1 tracer/tdd, 1 verification)
- **Files modified:** 10 (5 created, 5 modified; regenerated QA screenshots left unstaged)

## Accomplishments
- Installed the R3F stack at exact-pinned versions (three@0.185.1, @react-three/fiber@9.7.0, @react-three/drei@10.7.8) and promoted `motion@13.1.0` from a transitive-only dependency (via Sanity) to a direct dependency required by HeroCanvas's `motion/react` import.
- Wired the full ssr:false isolation chain and proved it end-to-end: three.js/@react-three code is **absent** from `.next/server` and **present** in `.next/static`; zero `<canvas>` in SSR HTML; no hydration warnings against `next start`.
- Implemented the D-06 one-way accessibility gate: under `prefers-reduced-motion: reduce` OR when `canUseWebGL()` is false, HeroCanvas early-returns the gradient `HeroFallback` — no Canvas element is ever mounted.
- Authored the HERO-01 build invariant (`no-canvas-server-bundle.sh`) and the extended Playwright coverage (WebGL-sniffed canvas visibility + reduced-motion canvas-absence), all green against a production build.

## Task Commits

Each task was committed atomically:

1. **Task 1 (Wave 0): Install R3F stack, scaffold constants + test/invariant gaps** — `dceae72` (chore)
2. **Task 2: Wire minimal R3F Canvas through the ssr:false isolation chain (tracer)** — `40b7995` (feat; includes a Rule-1 fix to the invariant surfaced by the tracer)
3. **Task 3: Verify tracer end-to-end vs production build** — `14d1b80` (test; corrected two imprecise Task-1 assertions to match the correct implementation)

_TDD note: the tracer's RED behavior specs were authored in Task 1; the runtime behaviors intentionally transitioned RED→GREEN across Task 2 (code) → Task 3 (production Playwright), as the plan specified._

## Files Created/Modified
- `components/hero/HeroFallback.tsx` — static `.hero-backdrop` gradient extracted as a pure component (no 'use client'); the reduced-motion / no-WebGL / pre-hydration state.
- `components/hero/constants.ts` — 16 named scene constants; every hex has a `// from --color-*` source-token comment (lives outside the app/-scoped no-raw-hex.sh scan).
- `components/hero/HeroScene.tsx` — minimal R3F Canvas (icosahedron + standard material + ambient/directional light), `onReady` from `onCreated`; the one permitted inline `style` on `<Canvas>`.
- `components/hero/HeroCanvas.tsx` — 'use client' island: module-level `dynamic(() => import('./HeroScene').then(m => m.HeroScene), { ssr:false })`, reduced-motion + `canUseWebGL()` early-return gate, opacity fade-in wrapper via `data-ready`.
- `components/sections/HeroSection.tsx` — backdrop div swapped for always-painted `.hero-backdrop` + `<HeroCanvas />` over it; z-10 text column and copy untouched; header comment updated.
- `tests/invariants/no-canvas-server-bundle.sh` — HERO-01 gate (executable); scans `.next/server` for three.js/@react-three module code.
- `tests/sections/hero.spec.ts` / `tests/motion/reduced.spec.ts` — canvas visibility (WebGL-sniffed) + reduced-motion canvas-count-0 assertions.
- `package.json` / `package-lock.json` — four deps added/pinned; styled-components untouched.

## Decisions Made
- **named-export dynamic import:** `dynamic(() => import('./HeroScene').then((m) => m.HeroScene), { ssr:false })` — a bare `import('./HeroScene')` typed the loader as the module namespace, failing tsc and the `onReady` prop contract. Confirmed against `node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md` ("Importing Named Exports").
- **invariant signature narrowed** to three.js/@react-three module markers (dropped `getContext('webgl'`) — see Deviations Rule 1 below.
- **exact-pinned deps** (stripped npm's default carets) to match the next@16.3.0 / sharp@0.35.3 pin style and the CLAUDE.md version lock.
- **fade-in duration** left as the literal `500ms` in the Tailwind arbitrary-value class (matches `--duration-entrance`; `HERO_FADE_MS` documents the source), per the plan action and UI-SPEC D-11.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] next/dynamic named-export type error**
- **Found during:** Task 2 (HeroCanvas wiring)
- **Issue:** `dynamic(() => import('./HeroScene'), { ssr:false })` failed tsc — the loader must resolve to the component, but HeroScene is a named (not default) export, so the type was the module namespace and `onReady` was rejected.
- **Fix:** Resolve the named export: `.then((m) => m.HeroScene)`, per the Next 16 lazy-loading doc.
- **Files modified:** components/hero/HeroCanvas.tsx
- **Verification:** `tsc --noEmit` clean.
- **Committed in:** `40b7995`

**2. [Rule 1 - Bug] HERO-01 invariant false positive on the WebGL capability probe**
- **Found during:** Task 2 (running no-canvas-server-bundle.sh after build) — exactly the dead-end the tracer exists to catch.
- **Issue:** The Task-1 grep signature `getContext('webgl` matched `.next/server/chunks/ssr/…` — but the only hit was `canUseWebGL()`'s DOM probe inside HeroCanvas, a Client Component Next legitimately prerenders. No actual three.js/@react-three code was in the server bundle (verified absent from `.next/server`, present in `.next/static`). The isolation chain was correct; the invariant was over-broad.
- **Fix:** Narrowed the signature to three.js/@react-three MODULE markers (`@react-three/fiber|@react-three/drei|three/build/three|react-three-fiber|__THREE__|REVISION.*three`). Negative-tested: the new signature still matches the real three code in the client bundle (≥1 chunk), so it is not a no-op regex and would still FAIL on a genuine server-side leak.
- **Files modified:** tests/invariants/no-canvas-server-bundle.sh
- **Verification:** PASS [HERO-01] against server bundle; signature confirmed to match real three code in `.next/static`.
- **Committed in:** `40b7995`

**3. [Rule 1 - Bug] Two imprecise Task-1 Playwright assertions (aria-hidden location + double-fallback)**
- **Found during:** Task 3 (production Playwright run — the tracer's RED→GREEN gate).
- **Issue:** (a) The suite asserted `aria-hidden="true"` on the `<canvas>` element itself, but R3F does not forward it — the attribute is on the wrapper ancestor (the canvas IS excluded from the a11y tree, which is correct and matches UI-SPEC). (b) `#hero .hero-backdrop` resolved to 2 elements under reduced motion (HeroSection's always-painted div + the HeroFallback returned by the gate), tripping Playwright strict mode. Both are correct implementation behaviors; the assertions encoded false expectations.
- **Fix:** (a) Assert `canvas.closest('[aria-hidden="true"]') !== null` (holds at any nesting depth). (b) Use `.first()` on the intentional double `.hero-backdrop`.
- **Files modified:** tests/sections/hero.spec.ts
- **Verification:** hero + reduced-motion suite 22/22 green (mobile-375 + desktop-1440, de + en).
- **Committed in:** `14d1b80`

---

**Total deviations:** 3 auto-fixed (1 blocking type error, 2 bugs — one in the invariant, one in the test assertions). No architectural changes (no Rule 4). No scope creep — the scene remains the minimal tracer mesh; no material/lighting/perf work was added.
**Impact on plan:** All three were necessary for correctness and are precisely the dead-ends the tracer is designed to surface on one commit before Plan 02 expands the scene. The isolation boundary, the reduced-motion gate, and the CLS-zero swap are all proven correct.

## Issues Encountered
- **Node version:** the shell default is Node v20.17.0, below the Sanity v6 prebuild requirement (≥22.12). The repo pins Node 22 via `.nvmrc`; activated `nvm use 22` (v22.22.0) for all install/build/test commands. Precondition satisfied.
- **Regenerated QA screenshots:** the Playwright runs updated 17 tracked PNGs under `tests/screenshots/` (the hero ones now show the rendered Canvas). These are incidental test outputs, not plan artifacts (`files_modified` does not list them), so they were left unstaged.

## Regression Gate Results
- `tsc --noEmit`: clean.
- `npm run test:invariants` (per-commit chain, unchanged): 4/4 PASS (IDENT-01, I18N-01, CMS-03 config + build). No IDENT-01 regression.
- `no-canvas-server-bundle.sh` (HERO-01, phase-gate — not yet in the chain per plan): PASS.
- **Full production Playwright suite vs `next start`: 133 passed, 1 failed** — the single failure is the accepted pre-existing `tests/i18n/smoke.spec.ts:63 (6) language switcher navigates /de → /en` on **mobile-375** (language-switcher link not visible at 375px; unrelated to Phase 5, which touched no i18n/nav code). Nothing else is red.

## Next Phase Readiness
- The architecture is proven for **Plan 02** to expand: GlassMesh with MeshTransmissionMaterial, PerformanceMonitor + AdaptiveDpr, IntersectionObserver offscreen-pause (`frameloop`), responsive glass scale/centroid, and the WCAG-AA legibility scrim (Option A centroid offset or Option B scrim).
- **Plan 03** should register `no-canvas-server-bundle.sh` into the `test:invariants` chain (phase gate) and add the LCP/CLS/draw-call budget checks.
- No blockers. `styled-components` remains an untouched v1 remnant (out of scope). Pre-deploy: the R3F stack adds bundle weight only to the client Canvas chunk — Plan 02/03 own the perf budget.

---
*Phase: 05-r3f-hero*
*Completed: 2026-08-24*

## Self-Check: PASSED
- All 5 created source/test/invariant files exist on disk (HeroFallback, constants, HeroScene, HeroCanvas, no-canvas-server-bundle.sh).
- All 3 task commits present in git history (dceae72, 40b7995, 14d1b80).
