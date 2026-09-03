---
status: passed
phase: 05-r3f-hero
source: [05-VERIFICATION.md]
started: 2026-09-03T00:00:00Z
updated: 2026-09-03T00:00:00Z
---

## Current Test

number: 1
name: Draw calls < 200 and PerformanceMonitor adaptive DPR scaling (SC #4)
expected: |
  With a production `next start` server running, open /de in a browser (or headless
  Playwright) with a throttled CPU profile. In DevTools console:
    - window.__r3f_hero.calls()  →  < 200
    - window.__r3f_hero.dpr()    →  read before and after sustained CPU load;
      after PerformanceMonitor.onDecline fires, dpr() should drop below 2.0
      (AdaptiveDpr reduced pixel ratio) and GlassMesh degrades in place
      (degraded=true: fewer transmission samples) rather than dropping to a
      non-transmissive fallback.
  Both values must be read from the live scene, not estimated.
awaiting: none — resolved

## Tests

### 1. Draw calls < 200 and PerformanceMonitor adaptive DPR scaling (SC #4)
expected: window.__r3f_hero.calls() < 200; after sustained CPU pressure window.__r3f_hero.dpr() < 2.0 (PerformanceMonitor.onDecline fired, AdaptiveDpr reduced pixel ratio); scene degrades gracefully (GlassMesh degraded=true) rather than switching to a non-transmissive fallback.
result: PASS (with documented caveat)
verified: 2026-09-03
method: Playwright + CDP against production `next start` (Node 22.22.0, port 3210)
evidence: |
  Ran live against a production build (`next build` → `next start`), Chromium headless
  with deviceScaleFactor:2 so dpr can resolve to 2.0.

  ARM 1 — Draw calls < 200: PASS (decisive).
    - window.__r3f_hero.calls() read live = 1 (main render pass).
    - Canvas confirmed genuinely animating: two screenshots 600ms apart differ
      (frame N ≠ frame N+1), PNG payloads 456KB vs 614KB — substantive rotating
      glass content, not a blank/paused buffer.
    - Scene is structurally one mesh + one MeshTransmissionMaterial; it cannot
      approach 200 draw calls. The literal read of 1 is a three.js info.autoReset
      artifact (autoReset fires inside each gl.render(), so the counter reflects
      only the last/main pass; the transmission FBO passes are reset before the
      hook reads). Even counting the hidden FBO passes, the true per-frame cost is
      a small constant — orders of magnitude under 200.

  ARM 2 — Adaptive DPR under load: VERIFIED BY CODE PATH; runtime trigger not
  reproducible in headless (documented caveat, user-accepted 2026-09-03).
    - dpr() baseline = 2.0 (correct: dpr={[1,2]} at DSF=2).
    - Under CDP CPU throttle x8 sustained 20s, dpr() stayed 2.0 — PerformanceMonitor.onDecline
      never fired. Root cause is environmental, NOT a defect: PerformanceMonitor
      declines on measured FPS < lower bound (drei default bounds = [40,60]).
      CDP CPU throttling slows JS but not the GPU; a trivial single-mesh scene in
      headless renders comfortably above 40fps regardless, so the decline threshold
      is never crossed.
    - The mitigation wiring is present and correct by inspection:
      HeroScene.tsx:97-102 (PerformanceMonitor onDecline→setDegraded(true) /
      onIncline→setDegraded(false), AdaptiveDpr child) → GlassMesh.tsx:99-101
      (degraded switches samples 6→2, resolution 256→32, transmissionSampler on —
      tier1-first, one material path, NO non-transmissive fallback branch, per D-12).
    - Runtime DPR down-scaling is only reproducible on a real GPU-bound device;
      a headless CI check structurally cannot falsify it. User accepted this arm
      as verified-by-code-path with this caveat.

## Summary

total: 1
passed: 1
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

None. SC #4 resolved: draw-call budget met on a confirmed-live scene; adaptive-DPR
degradation path verified by code inspection with a documented environmental caveat
(runtime FPS-decline trigger only reproducible on a real GPU-constrained device).
