---
phase: 1
slug: identity-design-tokens
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-08-11
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `@playwright/test` + `@axe-core/playwright` (contrast audit) + bash grep gate (raw-hex/gray invariant) + `next build` (token CSS compile smoke) |
| **Config file** | `playwright.config.ts` — none yet; Wave 0 installs (Plan 01 Task 2) |
| **Quick run command** | `bash tests/invariants/no-raw-hex.sh` |
| **Full suite command** | `npm test` (runs `test:invariants` then `test:a11y`) |
| **Estimated runtime** | ~30 seconds (chromium only, single page) |

---

## Sampling Rate

- **After every task commit:** Run `bash tests/invariants/no-raw-hex.sh` (once the gate exists) + `npx next build` for token/CSS tasks
- **After every plan wave:** Run `npm test` (full suite)
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | IDENT-01, IDENT-02 | T-01-SC | Legit dep install (axe/playwright approved) | build smoke | `npx next build && grep -q -- '--color-accent: #1C39BB' styles/tokens.css` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | IDENT-01 | T-01-SC | No untrusted install; grep gate | invariant/grep | `bash tests/invariants/no-raw-hex.sh` | ❌ W0 | ⬜ pending |
| 01-01-03 | 01 | 1 | IDENT-02 | — | Contrast AA verified pre-component | axe audit | `npx playwright test tests/a11y/contrast.spec.ts` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 2 | IDENT-03 | T-01-02 | SVG has no script / external refs | grep/parse | `! grep -q '<text\|<script' public/logo-*.svg && grep -q '#18181B' public/logo-light.svg` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 2 | IDENT-04 | — | N/A (doc) | grep | `grep -q 'maßgeschneidert' docs/brand-voice.md && grep -q 'cutting-edge' docs/brand-voice.md` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Created by Plan 01 (the tracer/walking-skeleton):

- [ ] `playwright.config.ts` — baseURL `http://localhost:3000`, webServer entry, chromium project (Plan 01 Task 2)
- [ ] `tests/a11y/contrast.spec.ts` — @axe-core color-contrast audit against `/token-audit`, Text Muted region excluded (Plan 01 Task 3)
- [ ] `tests/invariants/no-raw-hex.sh` — grep gate for raw hex + gray utilities in `app/` (Plan 01 Task 2)
- [ ] Package installs: `@playwright/test`, `@axe-core/playwright@4.12.1` (Plan 01 Task 2)
- [ ] `app/token-audit/page.tsx` — token-pair fixture the contrast audit targets (Plan 01 Task 1)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Wordmark reads as calm/editorial and legible at 120px on both #FFFFFF and #0F0F10 | IDENT-03 | Aesthetic judgment cannot be automated; contrast of paths is verified but "reads as refined" is a human call | Open both SVGs at 120px width on a white and a #0F0F10 background; confirm legibility and cool-architectural feel |
| Type at all sizes reads as calm/editorial/professional | IDENT-02 | Subjective typographic quality | View `/token-audit` at heading + body sizes; confirm the single-grotesk weight-driven hierarchy reads as designed, not default |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 60s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-08-11
