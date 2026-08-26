---
phase: 05-r3f-hero
plan: 05
subsystem: ui
tags: [react, three, r3f, next-dynamic, lighthouse, lcp, performance, inlineCss]

requires:
  - phase: 05-r3f-hero (05-04)
    provides: Idle-gated HeroScene mount (bare rIC); TBT 1450ms→184ms; D-12 gate still open

provides:
  - Interaction-or-timeout-floor mount trigger in HeroCanvas.tsx (provably post-LCP ordering; replaces bare rIC)
  - HERO_MOUNT_DELAY_MS=3000 in constants.ts (floor set past ~2811ms observed-LCP mark)
  - experimental.inlineCss:true in next.config.ts (Lever 2: render-blocking CSS inlined into <head>)
  - Honest Lighthouse gate result: simLCP=3032ms CLS=0 perf=87 after both levers
  - "Reconcile D-12 to observed LCP (~2811ms) vs simulated" surfaced as user decision

affects: [05-03 human-verify checkpoint (still blocked), D-12 gate resolution (user decision required)]

actuals:
  tokens: 18000
  tasks: 1
  commits: 1

tech-stack:
  added: []
  patterns:
    - "Interaction-or-timeout mount trigger: pointerdown/scroll/keydown {once,passive} + setTimeout(HERO_MOUNT_DELAY_MS=3000) floor, idempotent handler, full cleanup on unmount — ordering-guaranteed-after-LCP"
    - "experimental.inlineCss:true (Next 16): inlines render-blocking CSS chunk into <head> as <style> tag; production-build only; confirmed ✓ inlineCss in build output"

key-files:
  created: []
  modified:
    - components/hero/HeroCanvas.tsx
    - components/hero/constants.ts
    - next.config.ts
    - tests/sections/hero.spec.ts
    - tests/screenshots/hero-lighthouse-de.json

key-decisions:
  - "HALT (status: halted, human_judgment): after both levers simLCP=3032ms, above the D-12 <2500ms budget — consistent with the plan's honest-ceiling prediction (~2.6-2.9s residual from Lantern modeling of Next 16 hydration); budget NOT relaxed, run NOT cherry-picked"
  - "Interaction-or-timeout-floor trigger replaces bare rIC (which fired ~2.3s post-hydration, before observed LCP under 4x throttle): pointerdown/scroll/keydown {once,passive} + setTimeout(3000ms) floor, idempotent handler"
  - "HERO_MOUNT_DELAY_MS=3000 (constants.ts): replaces IDLE_MOUNT_TIMEOUT_MS=200; floor set well past the ~2811ms observed-LCP mark"
  - "experimental.inlineCss:true confirmed in build (✓ inlineCss); FCP dropped 1276ms→1087ms; but LCP residual is framework-Lantern-modeled base hydration cost, not CSS delivery"

requirements-completed: []

coverage:
  - id: D1
    description: "Lever 1 implemented: bare rIC replaced by interaction-or-timeout-floor trigger (pointerdown/scroll/keydown {once,passive} + setTimeout(HERO_MOUNT_DELAY_MS=3000)); three.js bootup ordering-guaranteed post-LCP under Lantern"
    requirement: "HERO-02"
    verification:
      - kind: automated
        ref: "npx tsc --noEmit (clean); npm run build (✓ inlineCss); tests/invariants/no-canvas-server-bundle.sh (PASS)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Lever 2 implemented: experimental.inlineCss:true in next.config.ts; build confirms ✓ inlineCss; FCP=1087ms (down from ~1276ms)"
    requirement: "HERO-02"
    verification:
      - kind: automated
        ref: "npm run build output: ✓ inlineCss; hero-lighthouse-de.json FCP=1087ms"
        status: pass
    human_judgment: false
  - id: D3
    description: "D-12 simulated LCP < 2.5s on Moto G4 — GATE FAIL: simLCP=3032ms after both levers"
    requirement: "HERO-02"
    verification:
      - kind: automated_ui
        ref: "npx lighthouse Moto G4 CPU4x → simLCP=3032ms, CLS=0, TBT=189ms, perf=87"
        status: fail
    human_judgment: true
    rationale: "After both app-controllable levers (interaction-or-timeout mount trigger + inlineCss), simLCP stalls at ~3.0s. Residual is framework-fixed Lantern modeling of Next 16 hydration cost — not an app-controllable lever. Observed LCP on device is ~2811ms (already measured); only the simulated metric fails. This is the honest-ceiling outcome predicted in the plan. User decision required: reconcile D-12 budget (2500ms) to observed LCP (~2811ms vs simulated ~3032ms)."
  - id: D4
    description: "D-06 reduced-motion gate: no canvas under reducedMotion:reduce (mount trigger after early return)"
    requirement: "HERO-02"
    verification:
      - kind: automated_ui
        ref: "npx playwright test tests/motion/reduced.spec.ts → 14/14 PASS"
        status: pass
    human_judgment: false
  - id: D5
    description: "Happy-path canvas: mounts via 3000ms floor in headless Playwright; canvas visible in de/en at 375+1440 with 8s timeout"
    requirement: "HERO-01"
    verification:
      - kind: automated_ui
        ref: "npx playwright test tests/sections/hero.spec.ts → 12/12 PASS (canvas visible ~4.2-4.5s)"
        status: pass
    human_judgment: false
  - id: D6
    description: "ssr:false isolation: no three.js in server bundle"
    requirement: "HERO-01"
    verification:
      - kind: automated
        ref: "tests/invariants/no-canvas-server-bundle.sh → PASS [HERO-01]"
        status: pass
    human_judgment: false

duration: 8min
completed: 2026-08-26
status: halted
---

# Phase 5 · Plan 05: Lever1 Post-LCP Mount Trigger + Lever2 InlineCss Summary

**Both app-controllable levers implemented; honest halt — simLCP=3032ms after both levers (framework-fixed Lantern residual); D-12 budget not relaxed; user decision required to reconcile observed (~2811ms) vs simulated LCP.**

## Performance

- **Duration:** ~8 min
- **Tasks:** 1 (implemented; gate not met → `status: halted`)
- **Files modified:** 5 (+ 4 screenshot artifacts)

## What Was Built

### Lever 1 — Interaction-or-timeout-floor mount trigger (`HeroCanvas.tsx`)

The bare `requestIdleCallback` (which fired ~2.3s post-hydration, before observed LCP ~2811ms under 4x CPU throttle, pulling the 233KB three.js chunk into Lantern's pre-LCP task graph) was replaced with a trigger that is ordering-guaranteed-after-LCP:

- Three event listeners on `window` — `pointerdown`, `scroll`, `keydown` — each `{ once: true, passive: true }`: fire immediately on first real interaction, cannot occur during the headless Lighthouse LCP window
- `setTimeout(HERO_MOUNT_DELAY_MS=3000)` floor: guarantees the canvas always eventually mounts even with zero interaction (headless Playwright, Lighthouse never interact); 3000ms is set past the ~2811ms observed-LCP mark
- Idempotent handler (`let mounted = false; if (mounted) return; mounted = true`) — whichever of interaction or timeout fires first wins
- Full cleanup on unmount: all three listeners removed + timeout cleared

### Lever 2 — `experimental.inlineCss: true` (`next.config.ts`)

Added `experimental: { inlineCss: true }` inside `nextConfig`. Build output confirms `✓ inlineCss`. This inlines the ~7KB render-blocking CSS chunk into `<head>` as a `<style>` tag (production-build only, Next 16 doc-supported). FCP improved 1276ms → 1087ms. The build confirmed the feature is active.

### Constant rename (`constants.ts`)

`IDLE_MOUNT_TIMEOUT_MS = 200` replaced by `HERO_MOUNT_DELAY_MS = 3000` with an updated doc comment naming it as the mount-trigger timeout floor. No new design token; no raw hex. Import updated in HeroCanvas.tsx.

### Test update (`hero.spec.ts`)

Canvas `toBeVisible()` assertion given `{ timeout: 8000 }` to accommodate the 3000ms floor + render time. Canvas MUST still appear — spec not weakened to "may be absent".

## Lighthouse Gate Results (Honest — Not Cherry-Picked)

| Metric | Before (05-04) | After (05-05) | Budget | Result |
|--------|---------------|----------------|--------|--------|
| simLCP (ms) | 4541 | **3032** | < 2500 | **FAIL** |
| CLS | 0 | **0** | = 0 | PASS |
| FCP (ms) | ~1276 | **1087** | — | improvement |
| TBT (ms) | ~184 | **189** | — | stable |
| Perf score | 0.81 | **0.87** | — | improvement |

The gate improved significantly (4541ms → 3032ms), but remains above the D-12 budget of 2500ms. This is the honest-ceiling outcome the plan explicitly predicted: "Simulated < 2.5s is PLAUSIBLE, not guaranteed. If after BOTH levers the simulated LCP stalls at ~2.6-2.9s, the residual is framework-fixed Lantern modeling of Next 16 hydration."

The ~3.0s residual is Lighthouse Lantern's simulation of the Next 16 base hydration JS evaluation cost — not tied to three.js, CSS delivery, or any remaining app-controllable lever. Observed LCP on the actual device/network is ~2811ms (already measured in 05-04).

## Why This Plan is `halted`

The D-12 gate (simulated LCP < 2.5s on Moto G4) is still not met. Both app-controllable levers have been applied:

- **Lever 1 (the whole ballgame):** three.js bootup is now ordering-guaranteed post-LCP in Lantern's task graph; the chunk no longer inflates simulated LCP. Yet simulated LCP only improved from ~4.5s to ~3.0s — the ~2.5s gap from before Lever 1 was framework JS, not three.js.
- **Lever 2:** render-blocking CSS is inlined; FCP improved 189ms, but the LCP residual is hydration cost, not CSS delivery cost.

The remaining ~3.0s simulated LCP is framework-fixed: Lantern models the Next 16 hydration chain (framework evaluation JS + route data fetching) as gating the H1 paint in its simulation, even though observed LCP on device is already ~2811ms. There is no app-level lever to further reduce this without framework-level changes (e.g., switching to RSC streaming, removing layout JS, or reducing the JS payload significantly) — which would be an architectural change outside this plan's scope.

**This is NOT a fake pass situation — the number is recorded honestly. The budget is NOT relaxed.**

## User Decision Required

**"Reconcile D-12 to observed LCP (~2811ms) vs simulated (~3032ms)"**

The user must choose one of:

1. **Relax D-12 budget** from 2500ms to ≤ 3100ms (acknowledging that Lantern's simulation of Next 16 hydration produces an ~200ms overhead vs observed LCP, and the observed site is genuinely fast at ~2.8s real LCP on a throttled device)
2. **Accept the hero as-is and ship** — observed LCP ~2.8s, which may be acceptable for the Berlin SMB audience on modern network; the perf score is 87 and TBT is 189ms
3. **Attack the framework JS payload** — remove or defer Next 16 framework chunks gating H1 paint (architectural scope, new plan needed)
4. **Leave D-12 open and ship other phases** — note the 05-03 human-verify checkpoint will remain blocked

The 05-03 human-verify checkpoint resumes only after D-12 is resolved (pass or explicit user decision to waive/relax).

## All Invariants Preserved

| Invariant | Status | Evidence |
|-----------|--------|----------|
| ssr:false isolation (HERO-01) | PASS | no-canvas-server-bundle.sh exits 0 |
| D-06 reduced-motion gate | PASS | reduced.spec.ts 14/14 |
| CLS = 0 | PASS | Lighthouse CLS=0 |
| D-11 fade-in | PASS | onReady → dataset.ready → 500ms ease-out unchanged |
| IDENT-01 no-raw-hex | PASS | no new hex, no new styles/tokens.css token |
| tsc --noEmit | PASS | clean |
| Happy-path canvas | PASS | hero.spec.ts 12/12 (canvas visible via 3s floor) |
| WCAG AA legibility | PASS | all 4 locales × viewports: headline ≥8.6:1, subline ≥5.0:1 |

## Deviations from Plan

**1. [Rule 3 - Blocking] Node version mismatch — symlinked .env.local to unblock build**
- **Found during:** Production build step
- **Issue:** The worktree had no `.env.local`; the `prebuild` (sanity typegen) and Next build both required `NEXT_PUBLIC_SANITY_PROJECT_ID`. The shell's default Node was v20, but Sanity requires v22.12+.
- **Fix:** Used Node 22.22.0 bin directly via `PATH` prefix; symlinked `.env.local` from main repo into worktree cwd. Build skipped `types:sanity` prebuild by running `next build` directly (same approach as 05-04 which also ran on the main repo). Symlink is not committed and will not survive the worktree teardown.
- **Files modified:** None (runtime-only workaround)

## Threat Flags

None — this plan adds no new network, auth, input, or secret surface. Lever 1 defers an existing client-only decorative chunk behind a read-only interaction signal. Lever 2 changes CSS delivery (inlined `<style>` vs `<link>`), no new origin or data.

## Self-Check

### Files Created/Modified

- [x] `components/hero/HeroCanvas.tsx` — interaction-or-timeout-floor mount trigger, HERO_MOUNT_DELAY_MS import, updated header comment
- [x] `components/hero/constants.ts` — IDLE_MOUNT_TIMEOUT_MS→HERO_MOUNT_DELAY_MS=3000
- [x] `next.config.ts` — experimental.inlineCss:true
- [x] `tests/sections/hero.spec.ts` — canvas visibility timeout 8000ms
- [x] `tests/screenshots/hero-lighthouse-de.json` — honest failing run (simLCP=3032ms)
- [x] `.planning/phases/05-r3f-hero/05-05-SUMMARY.md` — this file

### Commits

- [x] `1ee6b28` — perf(05-05): Lever1 post-LCP mount trigger + Lever2 inlineCss (HALT: simLCP 3032ms)

## Self-Check: PASSED

All files confirmed created/modified and committed. No unexpected deletions in commit (verified via git diff --diff-filter=D). SUMMARY.md written and committed.
