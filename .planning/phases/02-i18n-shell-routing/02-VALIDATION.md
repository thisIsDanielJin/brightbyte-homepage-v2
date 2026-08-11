---
phase: 2
slug: i18n-shell-routing
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: validated
nyquist_compliant: true
wave_0_complete: true
created: 2026-08-11
validated: 2026-08-11
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright 1.62.1 |
| **Config file** | `playwright.config.ts` (exists — Phase 1) |
| **Quick run command** | `bash tests/invariants/no-locale-from-state.sh` (static grep, no server) |
| **Full suite command** | `npm test` (invariants + a11y + i18n specs) |
| **Estimated runtime** | ~30–60 seconds (i18n smoke suite) |

---

## Sampling Rate

- **After every task commit:** Run `bash tests/invariants/no-locale-from-state.sh` (fast, no server needed)
- **After every plan wave:** Run `npx playwright test tests/i18n/`
- **Before `/gsd-verify-work`:** Full suite must be green (`npm test`)
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 2-01-* | tracer | 1 | I18N-01 | T-2-01 | `hasLocale()` validates locale param; `notFound()` on invalid | smoke | `npx playwright test tests/i18n/smoke.spec.ts` | ✅ | ✅ green |
| 2-01-* | routing | 1 | I18N-01 | — | Locale from URL segment only, never state | static-grep | `bash tests/invariants/no-locale-from-state.sh` | ✅ | ✅ green |
| 2-02-* | hreflang | 2 | I18N-02 | — | Bidirectional hreflang + `x-default`→`/de` per URL | smoke | `npx playwright test tests/i18n/smoke.spec.ts` | ✅ | ✅ green |
| 2-03-* | switcher | 2 | I18N-03 | — | `<Link>` navigation preserves path, no client state | smoke/e2e | `npx playwright test tests/i18n/smoke.spec.ts` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

*(Task IDs finalized by the planner; this map binds each phase requirement to an automated command.)*

---

## Requirement → Behavior → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| I18N-01 | `/` redirects to `/de` | smoke | `npx playwright test tests/i18n/smoke.spec.ts` | ✅ green |
| I18N-01 | `/de` has `<html lang="de">` | smoke | `npx playwright test tests/i18n/smoke.spec.ts` | ✅ green |
| I18N-01 | `/en` has `<html lang="en">` | smoke | `npx playwright test tests/i18n/smoke.spec.ts` | ✅ green |
| I18N-01 | No localStorage / component-state locale reads | static-grep | `bash tests/invariants/no-locale-from-state.sh` | ✅ pass |
| I18N-02 | `/de` emits bidirectional hreflang + `x-default`→`/de` | smoke | `npx playwright test tests/i18n/smoke.spec.ts` | ✅ green |
| I18N-02 | `/en` emits bidirectional hreflang | smoke | `npx playwright test tests/i18n/smoke.spec.ts` | ✅ green |
| I18N-03 | Switcher navigates `/de`↔`/en` preserving path segment | smoke/e2e | `npx playwright test tests/i18n/smoke.spec.ts` | ✅ green |

---

## Wave 0 Requirements

- [x] `tests/i18n/smoke.spec.ts` — covers I18N-01, I18N-02, I18N-03 (redirect, `<html lang>`, hreflang, switcher navigation) — 6/6 green
- [x] `tests/invariants/no-locale-from-state.sh` — static grep guard: no `localStorage` / component-state locale derivation (I18N-01 locale-from-URL-only) — pass

*Playwright and the test framework are already installed (Phase 1) — no framework install needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `curl` verification of hreflang tags in raw HTML `<head>` | I18N-02 | Success criterion 2 explicitly calls for `curl` confirmation that tags are server-rendered (not hydrated client-side) | `curl -s http://localhost:3000/de \| grep hreflang` and `curl -s http://localhost:3000/en \| grep hreflang` — assert each lists the other locale + itself + `x-default`→`/de` |

*Automated Playwright coverage is primary; the `curl` check is a manual server-render confirmation per the roadmap success criterion.*

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 60s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** validated 2026-08-11

---

## Validation Audit 2026-08-11

| Metric | Count |
|--------|-------|
| Gaps found | 0 |
| Resolved | 0 |
| Escalated | 0 |

**State A audit.** VALIDATION.md pre-seeded as `draft` at plan time; validate-phase confirmed all Wave 0 tests exist and run green. Executed live: `npx playwright test tests/i18n/` → **6/6 passed** (6.7s); `bash tests/invariants/no-locale-from-state.sh` → **PASS**. Every requirement (I18N-01/02/03) is COVERED by automated verification — no auditor spawn or gap-fill needed. Phase is Nyquist-compliant.

Manual-Only items (D5 per-locale visual string diff; `curl` server-render hreflang confirmation) were confirmed passing in `02-UAT.md` (tests 1 & 3) and remain documented as manual by design, not as gaps.
