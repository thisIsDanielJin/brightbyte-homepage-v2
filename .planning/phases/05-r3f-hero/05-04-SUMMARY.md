---
phase: 05-r3f-hero
plan: 04
subsystem: ui
tags: [react, three, r3f, next-dynamic, requestIdleCallback, lighthouse, lcp, performance]

requires:
  - phase: 05-r3f-hero (05-02)
    provides: HeroCanvas ssr:false island + HeroScene glass centerpiece + fade-in wrapper
  - phase: 05-r3f-hero (05-03)
    provides: production Lighthouse gate + WCAG-AA rendered-glass check + isolation invariant (the LCP blocker this plan targeted)
provides:
  - Idle-gated HeroScene mount (requestIdleCallback + setTimeout fallback) that moves three.js bootup off the LCP critical path (TBT 1450ms → ~184ms)
  - Empirical proof that the canvas was NOT the simulated-LCP bottleneck; the base-page critical chain is
affects: [05-05 base-page critical-path optimization, 05-03 human-verify checkpoint]

actuals:
  tokens: 14000
  tasks: 1
  commits: 1

tech-stack:
  added: []
  patterns:
    - "Idle-gated dynamic mount: gate ONLY the child behind requestIdleCallback (setTimeout fallback), render the layout wrapper unconditionally to keep CLS = 0"

key-files:
  created: []
  modified:
    - components/hero/HeroCanvas.tsx
    - components/hero/constants.ts

key-decisions:
  - "Idle-gate the <HeroScene> child mount (not the module-level dynamic import) so ssr:false isolation and the D-06 early return stay byte-identical"
  - "Keep the code change even though it did not close the D-12 gate — it is a real, standalone TBT win (1450ms → 184ms, perf score 0.58 → 0.81)"
  - "Do NOT relax the D-12 budget; the gate resolution moves to a new base-page critical-path plan (05-05), per user decision 'Fix the real cause (A)'"

patterns-established:
  - "Idle-mount pattern: useState(false) + useEffect(requestIdleCallback ?? setTimeout(IDLE_MOUNT_TIMEOUT_MS)) with cleanup; wrapper geometry unconditional for CLS = 0"

requirements-completed: []

coverage:
  - id: D1
    description: "HeroScene mount deferred to browser idle (post-LCP) via requestIdleCallback with setTimeout fallback; three.js TBT no longer on the LCP critical path (1450ms → ~184ms)"
    requirement: "HERO-02"
    verification:
      - kind: automated_ui
        ref: "tests/screenshots/hero-lighthouse-de.json (TBT=184ms, perf=0.81, CLS=0)"
        status: pass
    human_judgment: false
  - id: D2
    description: "D-12 simulated LCP < 2.5s on Moto G4"
    requirement: "HERO-02"
    verification:
      - kind: automated_ui
        ref: "npx lighthouse Moto G4 CPU4x → simLCP 4541ms"
        status: fail
    human_judgment: true
    rationale: "Gate NOT met. Root cause is the base-page critical chain (H1 + render-blocking CSS/JS), not the canvas — proven by a canvas-free probe still simulating ~2.8s. Resolution deferred to 05-05 (user chose 'fix the real cause'). Not shippable until 05-05 closes it."

duration: 18min
completed: 2026-08-24
status: halted
---

# Phase 5 · Plan 04: Idle-Gate HeroScene Mount Summary

**Idle-gated the three.js Canvas mount post-LCP — cut TBT 1450ms → 184ms and proved the canvas was never the simulated-LCP bottleneck; the base page is.**

## Performance

- **Duration:** ~18 min
- **Tasks:** 1 (implemented; gate not met → `status: halted`)
- **Files modified:** 2 (+ gate artifact + STATE.md)

## Accomplishments

- Idle-gated the `<HeroScene>` child mount in `HeroCanvas.tsx` behind `requestIdleCallback` (with a `setTimeout(IDLE_MOUNT_TIMEOUT_MS=200)` fallback for browsers without rIC, e.g. older Safari) plus unmount cleanup. The three.js import + Canvas creation now happen at browser idle, off the LCP critical path.
- **TBT dropped 1450ms → ~184ms; Lighthouse perf score 0.58 → 0.81; CLS stayed 0.** A genuine, standalone performance improvement.
- All hard invariants preserved: module-level `dynamic({ssr:false})` unchanged (isolation invariant still exits 0), D-06 reduced-motion / no-WebGL early return unchanged and before the idle gate, the `absolute inset-0` wrapper rendered unconditionally (CLS = 0), and the `onReady` → `dataset.ready` 500ms fade-in intact.
- Added `IDLE_MOUNT_TIMEOUT_MS` to `constants.ts` (no new design token, no raw hex).

## Files Created/Modified

- `components/hero/HeroCanvas.tsx` — idle gate around the `<HeroScene>` child; header comment corrected (the LCP element is the `<h1>`, not the gradient).
- `components/hero/constants.ts` — `IDLE_MOUNT_TIMEOUT_MS = 200` (setTimeout fallback delay).
- `tests/screenshots/hero-lighthouse-de.json` — regenerated; a representative **failing** run (simLCP 4541, honest, not cherry-picked).

## Why this plan is `halted`, not `complete`

The D-12 gate (simulated LCP < 2.5s on Moto G4) is still **not met** (~4.5s). The plan's premise — "the gradient is the LCP element; defer the canvas to protect it" — turned out to be factually wrong:

1. **The LCP element is the `<h1>` headline** (paints ~370ms observed), not the gradient. CSS-gradient backgrounds are not LCP candidates per spec.
2. **A canvas-free probe (mount fully disabled) still simulates ~2.8s LCP** (2794–2873ms) — three.js was never the bottleneck.
3. No modulepreload leak; the 239KB three.js chunk is genuinely lazy.
4. Double-rAF-before-rIC made it worse and was reverted.

**Root cause:** the residual ~2.8s is Lighthouse's lantern CPU-4× simulation of the **base-page critical chain** (render-blocking CSS + framework JS gating the H1 paint), independent of three.js. **Observed** on-device LCP is 0.3–1.3s — the site is genuinely fast; only the *simulated* metric fails.

## Decisions Made

- **User decision (2026-08-24): "Fix the real cause (A)."** Attack the base-page critical path (reduce/inline render-blocking CSS; cut ~128KB framework JS gating the H1) in a new plan **05-05**, keeping this 05-04 TBT win.
- Kept the code change despite the gate miss — it's a real improvement and is a prerequisite for the base page being the *only* remaining lever.

## Next Phase Readiness

- **Blocked on 05-05:** the D-12 gate resolution moves there. Do NOT resume the 05-03 human-verify checkpoint until 05-05 closes the gate.
- The idle-gate code is committed and stable; 05-05 builds on top of it against a different file surface (app-level CSS/JS delivery, not the hero components).

---
*Phase: 05-r3f-hero*
*Completed: 2026-08-24 (halted — gate resolution in 05-05)*
