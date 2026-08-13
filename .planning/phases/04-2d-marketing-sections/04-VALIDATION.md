---
phase: 4
slug: 2d-marketing-sections
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-08-13
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Seeded as draft by plan-phase; the Validation Architecture in 04-RESEARCH.md is the source. Filled/verified by /gsd-validate-phase.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright 1.49.x (`@playwright/test`) + `@axe-core/playwright` 4.12.1 (both installed) |
| **Config file** | `playwright.config.ts` (extend existing; add 375px + 1440px projects × de/en) |
| **Quick run command** | `npx tsc --noEmit && npm run test:invariants` |
| **Full suite command** | `npm run test:content && npx playwright test` |
| **Estimated runtime** | ~60–120 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick command (`tsc --noEmit` + invariants) — must stay green (IDENT-01, stega:false, locale-from-URL guards)
- **After every plan wave:** Run full suite (content presence + Playwright section specs)
- **Before `/gsd-verify-work`:** Full suite green in both locales at both breakpoints; axe zero-violations
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

> Populated by /gsd-validate-phase from PLAN.md tasks. Observable behaviors to sample (from 04-RESEARCH.md ## Validation Architecture):

| Behavior | Requirement | Wave | Test Type | Automated Command | Status |
|----------|-------------|------|-----------|-------------------|--------|
| All 9 sections render DE+EN at 375px + 1440px | SEC-01..09 | — | e2e screenshot | `npx playwright test sections` | ⬜ pending |
| Contact form success path (200 + confirmation, no reload) | SEC-07 | — | e2e | `npx playwright test contact` | ⬜ pending |
| Contact form error path (inline error, no reload) | SEC-07 | — | e2e | `npx playwright test contact` | ⬜ pending |
| axe-playwright zero violations, all sections | QA-01/QA-03 | — | a11y | `npx playwright test a11y` | ⬜ pending |
| `:focus-visible` present on all interactive elements | SEC-10/QA-03 | — | e2e | `npx playwright test focus` | ⬜ pending |
| No animation under `prefers-reduced-motion: reduce` | SEC-11 | — | e2e | `npx playwright test reduced-motion` | ⬜ pending |
| Tokenless public-read returns Sanity content (D-03) | SEC-* | — | integration | `npm run test:content` (anon) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `playwright.config.ts` — 375px + 1440px projects × de/en locales
- [ ] Section render + screenshot spec scaffolds (per 04-RESEARCH.md — ~11 spec files)
- [ ] axe-playwright zero-violations assertion helper
- [ ] `npm install resend` — only missing runtime dependency (04-RESEARCH.md finding 2)
- [ ] Existing `tests/invariants/*.sh` + `tests/sanity/content-presence.mjs` stay green (regression gate)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Per-section ui-skills visual critique | QA-02 | Subjective design-quality judgment; not automatable | `npx ui-skills start` → load smallest relevant skill per section; iterate against desktop+mobile screenshots |
| Sanity `production` dataset set to Public (D-03) | SEC-* | External Sanity console toggle (USER ACTION), not code | Toggle at sanity.io/manage/project/ddrca30s/datasets → production → Public; then anon `test:content` returns data |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (Playwright projects, resend install)
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
