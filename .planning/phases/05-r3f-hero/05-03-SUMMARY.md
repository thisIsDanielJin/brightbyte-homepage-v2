---
phase: 05-r3f-hero
plan: 03
subsystem: ui
tags: [r3f, three.js, webgl, lighthouse, wcag-aa, performance-monitor, adaptive-dpr, draw-calls, ci-invariant, tailwind-v4, playwright]

# Dependency graph
requires:
  - phase: 05-r3f-hero (Plan 01 tracer + Plan 02 glass centerpiece)
    provides: HeroCanvas (ssr:false gate), HeroScene (PerformanceMonitor + AdaptiveDpr + IntersectionObserver frameloop), GlassMesh (MeshTransmissionMaterial, tier1-first degrade), no-canvas-server-bundle.sh (HERO-01), hero.spec.ts + reduced.spec.ts coverage
provides:
  - package.json test:invariants chain now includes no-canvas-server-bundle.sh (HERO-01 CI guard registered)
  - tests/sections/hero.spec.ts WCAG-AA-against-rendered-glass check (sample composite bg behind headline/subline from screenshot via sharp, assert >= 4.5:1) at 375+1440, de+en
  - components/sections/HeroSection.tsx D-08 Option B token scrim (bg-surface only) restoring AA over the rendered glass
  - components/hero/HeroScene.tsx read-only __r3f_hero debug hook (calls()/dpr()) for the production perf gate
  - Tier 2 escalation applied to GlassMesh/constants (samples/resolution/detail reduced) — RESEARCH Pattern 5
  - tests/screenshots/hero-lighthouse-de.json production Moto G4 Lighthouse artifact
affects: [phase gate sign-off — LCP simulated-budget decision is escalated to human-verify]

# Actuals (#2632)
actuals:
  tokens: 9500
  tasks: 2      # Tasks 1 & 2 executed; Task 3 (checkpoint:human-verify) intentionally NOT executed
  commits: 3    # T1 + T2 + this SUMMARY

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Rendered-glass WCAG-AA gate: screenshot -> sharp.extract(bbox*dpr) -> mean composite color -> WCAG 2.x contrast ratio vs immutable text token; threshold never weakened"
    - "D-08 Option B scrim, token-only: near-solid bg-surface/85 full-bleed band on mobile (centered glass over dark scene) + left-anchored bg-surface/90->transparent gradient on desktop (preserves right focal-mass reveal)"
    - "Read-only R3F debug hook: mount-only child calls useThree((s)=>s.gl) and sets window.__r3f_hero={calls,dpr}; unconditional (not prod-guarded) so the gate reads it vs next start; no new data/input surface"
    - "Production perf gate MUST run vs next start; warm the route (curl x2) before Lighthouse; kill :3000 first to avoid reuseExistingServer flake"

key-files:
  created:
    - tests/screenshots/hero-lighthouse-de.json
  modified:
    - package.json
    - tests/sections/hero.spec.ts
    - components/sections/HeroSection.tsx
    - components/hero/HeroScene.tsx
    - components/hero/GlassMesh.tsx
    - components/hero/constants.ts

key-decisions:
  - "no-canvas-server-bundle.sh chained into test:invariants after the existing four (with &&); it self-builds if .next/server is absent, so the chain is runnable standalone and at the phase gate (HERO-01 regression can no longer land silently)"
  - "WCAG-AA rendered-glass check samples the MEAN composite color over each copy element's bbox (scaled by devicePixelRatio) rather than a single pixel — averaging avoids sampling a glyph edge and measures the effective background WCAG cares about"
  - "D-08 fix used Option B (scrim), not Option A (centroid): Option A cannot help at mobile-375 where the glass is centered/pushed-back and the copy is full-width; the dark scene bled behind the text (1.0:1). Option B is the UI-SPEC-designated fallback, token-only (bg-surface + v4 opacity modifiers), pointer-events-none, z-0 (above canvas, below z-10 text)"
  - "Tier 2 escalation (RESEARCH Pattern 5) applied within Plan 03 (GLASS_SAMPLES 6->3, GLASS_RESOLUTION 256->128, icosahedron detail 4->2) — did NOT bring simulated LCP under budget because the miss is R3F-chunk main-thread bootup (~2s scripting under 4x CPU), not render-quality cost. Budget NOT relaxed (D-12 non-negotiable)."

requirements-completed: []   # HERO-01/HERO-02 gate not fully signed off — LCP simulated budget blocked + human-verify pending

# Metrics
duration: ~50min
completed: 2026-08-24
status: blocked
---

# Phase 5 Plan 03: R3F Hero Perf + Legibility Gate Summary

**The HERO-01 isolation invariant is now CI-registered and the D-08 rendered-glass legibility gate passes at both breakpoints in both locales (Option B token scrim). Production Lighthouse confirms CLS = 0, draw calls = 1 (< 200), and the DPR floor holds at 1.0 — but the simulated Moto G4 LCP (4494ms) exceeds the D-12 2.5s budget, driven entirely by ~2s of R3F/three.js client-chunk main-thread execution (TBT 1.45s), which the sanctioned Tier 2 render-quality reduction does not address. This is an architectural load-strategy blocker escalated below.**

## Tasks Executed (1–2 of 3)

- **Task 1 (auto) — DONE, committed `1bea0d8`:** registered `no-canvas-server-bundle.sh` in `test:invariants`; added the WCAG-AA-against-rendered-glass check; applied the D-08 Option B token scrim to fix the mobile legibility failure.
- **Task 2 (auto) — DONE (code + evidence), committed `c2695dc`:** added the read-only `__r3f_hero` debug hook; ran production Lighthouse (Moto G4, CPU 4x) vs `next start`; captured draw-call + DPR evidence under throttle; applied Tier 2 escalation when the LCP budget missed.
- **Task 3 (checkpoint:human-verify) — NOT executed** (per orchestrator scope): the taste bar + 6-step manual verification is handed back.

## MEASURED EVIDENCE (for the human-verify checkpoint)

All numbers are from a **production `next build && next start`** run (Node 22) — never dev (Pitfall 4).

### Lighthouse — mobile Moto G4 profile, `--throttling.cpuSlowdownMultiplier=4`, `/de`
Artifact: `tests/screenshots/hero-lighthouse-de.json`

| Metric | Measured | Budget (D-12) | Verdict |
|--------|----------|---------------|---------|
| **LCP (simulated/lantern)** | **4494 ms** | < 2500 ms | ❌ **MISS** |
| LCP (observed, in `metrics.observedLargestContentfulPaint`) | **1292 ms** | — | fast paint |
| **CLS** | **0** | 0 | ✅ |
| FCP | 765 ms (observed 1267 ms) | — | fast |
| TTFB (server-response-time) | 193 ms | — | fast |
| TBT | 1452 ms | — | high (cause of LCP miss) |
| Performance score | 0.58 | — | — |

**LCP element identity (D-11):** Lighthouse did NOT emit the `largest-contentful-paint-element` audit in this run (only the `largest-contentful-paint` metric is present), so the element could not be read programmatically from the JSON — this is one of the items the human should confirm visually at the checkpoint. The observed LCP (1292 ms) tracking the observed FCP (1267 ms) is consistent with the always-painted `.hero-backdrop` gradient / headline being the largest paint, NOT the canvas (which loads later via ssr:false). Confirm at the checkpoint via DevTools Performance → LCP marker.

**Root cause of the LCP miss (JS bootup attribution from the same JSON):**
- `_next/static/chunks/0wjosxeb70ty7.js` (the R3F/three.js client chunk): **~2013 ms of scripting** under 4x CPU throttle — dominates TBT.
- The simulated/lantern LCP model pushes LCP out to 4.5s because this main-thread work blocks the paint in the model, even though the **observed** paint is ~1.3s.

### Draw calls + PerformanceMonitor DPR (via `window.__r3f_hero`, CPU 4x throttle, vs `next start`)

| Metric | Measured | Budget | Verdict |
|--------|----------|--------|---------|
| **Draw calls** (`__r3f_hero.calls()`) | **1** | < 200 | ✅ (single mesh) |
| **DPR floor** (`__r3f_hero.dpr()`, sampled over 6s throttle + release) | **1.0** (samples: [1,1,1,1,1,1], released 1.0) | ≥ 1.0, never below | ✅ floor invariant holds |

Note on DPR: in headless Chromium the renderer ran at DPR 1.0 throughout; the AdaptiveDpr floor (`dpr={[1,2]}`) was never violated. The step-down/step-up *dynamics* under real GPU pressure are one of the manual checkpoint items (DevTools CPU 4x) — the automated read confirms the **floor never drops below 1.0**, which is the hard invariant.

### WCAG-AA against the ACTUAL RENDERED glass (D-08) — all PASS
Sampled composite background behind each copy element from a production screenshot; text token colors immutable; threshold 4.5:1 never weakened.

| Viewport | Locale | Headline #18181B | Subline #52525B | CTA #FFF/#1C39BB |
|----------|--------|------------------|-----------------|------------------|
| 375px | de | **8.64:1** ✅ | **5.01:1** ✅ | 8.93:1 ✅ |
| 375px | en | **9.23:1** ✅ | **5.06:1** ✅ | 8.93:1 ✅ |
| 1440px | de | **10.17:1** ✅ | **6.19:1** ✅ | 8.93:1 ✅ |
| 1440px | en | **10.81:1** ✅ | **6.26:1** ✅ | 8.93:1 ✅ |

(Before the Option B scrim, mobile-375 headline was 1.0:1 and subline 2.4:1 — dark scene bleeding behind full-width copy. The scrim restored AA; desktop already passed via the right-of-center glass focal mass.)

### Hydration + isolation
- `no-canvas-server-bundle.sh` (HERO-01): **PASS, exit 0** — three.js/@react-three absent from the server bundle; now registered in `test:invariants`.
- Full `test:invariants` chain (5/5): **PASS** (IDENT-01, I18N-01, CMS-03 config + build, HERO-01).
- **Hydration warnings:** not machine-captured in this run — one of the 6-step manual checkpoint items (confirm zero hydration warnings in the `next start` console on the hero route). Plan 01/02 both reported zero.

## Regression Gate Results
- `npx tsc --noEmit`: **clean**.
- `npm run build`: **succeeds**.
- Full hero suite (`tests/sections/hero.spec.ts`) vs `next start`: **12/12 passed** (render + reduced-motion + new WCAG-AA, both viewports, both locales).
- The accepted pre-existing failure `tests/i18n/smoke.spec.ts:63 [mobile-375] language switcher` remains the only expected red elsewhere (unrelated to Phase 5); no new regressions introduced.

## Screenshots
The Playwright runs regenerate `tests/screenshots/`. Expected changes from this plan: the **4 hero PNGs** (now showing the Option B scrim + Tier 2 glass) and the **new `hero-lighthouse-de.json`** artifact (committed — it is a listed `files_modified` artifact). Unrelated non-hero screenshot jitter was NOT committed.

## Deviations from Plan
- **[Rule-adjacent — sanctioned by the plan's escalation clause] Tier 2 escalation fired.** The tier1-first path (locked at the Plan 02 checkpoint) missed the LCP budget at this gate, so — per the plan — a scoped edit to `GlassMesh.tsx`/`constants.ts` dropped to Tier 2 (samples 6→3, resolution 256→128, geometry detail 4→2). Task 1's WCAG-AA rendered-glass gate was re-run after the Tier 2 edit and **still holds** (a Tier 2 that regressed legibility would be unacceptable — it did not). Plan 02 was NOT re-opened.
- No Rule 4 architectural change was made unilaterally — see the blocker below.

## BLOCKER — D-12 simulated LCP budget cannot be met with in-scope levers

**What:** Lighthouse simulated LCP = **4494 ms** ≥ the D-12 budget of 2500 ms on the Moto G4 / CPU-4x profile, against `next start`.

**Why Tier 2 did not fix it:** the miss is NOT render-quality cost. JS-bootup attribution shows the R3F/three.js client chunk (`0wjosxeb70ty7.js`) burning **~2013 ms of main-thread scripting** under 4x throttle (TBT 1452 ms). Reducing samples/resolution/geometry (Tier 2) lowers per-frame GPU cost but does not shrink the chunk's parse/execute cost that the lantern LCP model charges against the paint. The **observed** paint is fast (LCP 1292 ms, FCP 1267 ms) — the simulated metric is inflated by the JS execution blocking the main thread in the model.

**Why this is not something I can resolve in Plan 03:** the effective fix is an architectural change to the **canvas load strategy** — e.g. deferring the R3F chunk mount until after LCP (idle-callback / `requestIdleCallback` gate, or delaying `dynamic()` resolution until first idle), or code-splitting three.js off the critical path. That is (a) a Rule 4 structural decision and (b) explicitly a Plan 02 load-strategy concern that the Plan 03 escalation clause forbids me to re-open here. The plan also states the D-12 budget is non-negotiable, so I will not relax the threshold.

**Decision needed from human/orchestrator (options):**
1. **Accept on observed LCP (1292 ms):** treat the simulated 4.5s as a lantern-model artifact of the R3F bootup and sign off on the fast observed paint — then run the 6-step human-verify. (The observed paint, CLS=0, draw calls=1, DPR floor=1.0, and WCAG-AA all pass.)
2. **Add a canvas-load-deferral follow-up plan** (idle-gate the `dynamic()` mount so the three.js chunk executes after LCP) — a small, scoped new plan; re-measure LCP afterward.
3. **Reconsider the hero's JS budget** (e.g. lighter transmission approach / non-R3F fallback on low-end) — larger scope, likely re-opening Plan 02.

## Next Phase Readiness
- CI guard registered; legibility gate green; render-loop mitigations empirically confirmed. The single open item is the D-12 simulated LCP decision above, which gates the Task-3 human-verify sign-off.

---
*Phase: 05-r3f-hero*
*Completed (Tasks 1–2): 2026-08-24 — Task 3 checkpoint + LCP decision pending*

## Self-Check: PASSED
- `tests/screenshots/hero-lighthouse-de.json` exists on disk (Lighthouse artifact).
- Commits `1bea0d8` (Task 1) and `c2695dc` (Task 2) present in git history.
- `no-canvas-server-bundle.sh` confirmed present in `package.json` `test:invariants` (`registered ok`).
- WCAG-AA check green 4/4 (375+1440, de+en); full hero suite 12/12.
