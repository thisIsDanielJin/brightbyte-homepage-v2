---
phase: 5
slug: r3f-hero
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-08-21
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright (existing e2e suite) + `tsc --noEmit` + `tests/invariants/*.sh` + `tests/content/*` |
| **Config file** | `playwright.config.ts` (existing); invariant shell scripts under `tests/invariants/` |
| **Quick run command** | `npx tsc --noEmit && npm run test:invariants` |
| **Full suite command** | `npm run build && npm start & npx playwright test` (gate MUST run vs `next start`, NOT dev) |
| **Estimated runtime** | ~90–180 seconds (build + production Playwright) |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit && npm run test:invariants`
- **After every plan wave:** Run the full production Playwright suite against `next start`
- **Before `/gsd-verify-work`:** Full suite must be green; Lighthouse mobile (Moto G4) LCP < 2.5s / CLS = 0 measured against production build
- **Max feedback latency:** 180 seconds

---

## Per-Task Verification Map

> Seeded by plan-phase; the per-task rows are filled by `/gsd-validate-phase` after PLAN.md tasks exist.

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | HERO-01 / HERO-02 | — | N/A | e2e / build | TBD | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Install `three@0.185.1`, `@react-three/fiber@9.7.0`, `@react-three/drei@10.7.8` (none in package.json yet)
- [ ] Playwright spec stub asserting: reduced-motion → no `<canvas>` in DOM (HERO-02, success criterion #3)
- [ ] Playwright / build assertion: `next build` clean confirms `dynamic({ ssr:false })` isolation (HERO-01, success criterion #1)

*Existing Playwright + invariant + content infrastructure covers the regression surface.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| WCAG AA of headline/subline/CTA against the ACTUAL RENDERED glass background (D-08) | HERO-01 | Contrast against a live-rendered 3D backdrop can't be asserted statically | Screenshot the hero at 375 + 1440 vs `next start`; run contrast check on rendered pixels behind copy |
| LCP < 2.5s / CLS = 0 on Moto G4 profile with hero mounted (success criterion #2) | HERO-01 | Lighthouse mobile audit needs a throttled run against production, not CI-cheap | `npm run build && npm start`, then Lighthouse mobile (Moto G4 preset) on the hero route |
| Draw calls < 200 + PerformanceMonitor adaptive DPR active on throttled connection (success criterion #4) | HERO-01 | Requires live WebGL renderer.info inspection under throttling | Read `renderer.info.render.calls`; throttle CPU/network and confirm DPR steps down |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 180s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
