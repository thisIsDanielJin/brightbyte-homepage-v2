---
phase: 07
slug: p2-differentiators-polish
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-09-11
---

# Phase 07 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright (`@playwright/test`) |
| **Config file** | `playwright.config.ts` |
| **Quick run command** | `npx playwright test tests/sections/case-study.spec.ts --project=chromium` |
| **Full suite command** | `npx playwright test` |
| **Estimated runtime** | ~45 seconds (existing suite ~30s + 5 new spec files) |

---

## Sampling Rate

- **After every task commit:** Run `npx playwright test tests/sections/case-study.spec.ts tests/sections/work-links.spec.ts --project=chromium`
- **After every plan wave:** Run `npx playwright test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** ~45 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | SC | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|----|-----------:|-----------------|-----------|-------------------|-------------|--------|
| 07-01-01 | 01 | 1 | SC #1 | — | Sanity fields rendered as JSX text nodes, never dangerouslySetInnerHTML | smoke | `npx playwright test tests/sections/case-study.spec.ts --project=chromium` | ❌ W0 | ⬜ pending |
| 07-01-02 | 01 | 1 | SC #1 | — | Cards with hasCaseStudy are `<a>` links; others remain `<div>` | unit | `npx playwright test tests/sections/work-links.spec.ts --project=chromium` | ❌ W0 | ⬜ pending |
| 07-01-03 | 01 | 1 | SC #1 | — | npx tsc --noEmit exits 0 (catches locale threading issue) | type | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 07-02-01 | 02 | 2 | SC #1 | — | /de/work/learnstep and /de/work/lumo render with H1, problem, solution, outcome | smoke | `npx playwright test tests/sections/case-study.spec.ts --project=chromium` | ❌ W0 | ⬜ pending |
| 07-03-01 | 03 | 2 | SC #2 | — | /de renders #faq with accordion items | smoke | `npx playwright test tests/sections/faq.spec.ts --project=chromium` | ❌ W0 | ⬜ pending |
| 07-03-02 | 03 | 2 | SC #2 | — | /de renders #process with 3 steps | smoke | `npx playwright test tests/sections/process.spec.ts --project=chromium` | ❌ W0 | ⬜ pending |
| 07-04-01 | 04 | 3 | SC #4 | — | D-11: data-ready=true on HeroCanvas wrapper; opacity transitions to 1 | smoke | `npx playwright test tests/hero/fade-in.spec.ts --project=chromium` | ❌ W0 | ⬜ pending |
| 07-04-02 | 04 | 3 | SC #3 | — | axe zero violations on all pages including /work/[slug] routes | a11y | `npx playwright test tests/a11y/axe.spec.ts --project=chromium` | ✅ (extend paths) | ⬜ pending |
| 07-04-03 | 04 | 3 | SC #4 | — | Motion params match spec; reduced-motion fires instantly | motion | `npx playwright test tests/motion/reduced.spec.ts --project=chromium` | ✅ (extend) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/sections/case-study.spec.ts` — stubs for SC #1: case study pages render H1/problem/solution/outcome
- [ ] `tests/sections/work-links.spec.ts` — stubs for SC #1: conditional link upgrade verification
- [ ] `tests/sections/faq.spec.ts` — stubs for SC #2: homepage FAQ section presence
- [ ] `tests/sections/process.spec.ts` — stubs for SC #2: homepage process section presence
- [ ] `tests/hero/fade-in.spec.ts` — stubs for D-11 fix: data-ready=true and opacity=1 after mount

*Existing infrastructure (`tests/a11y/axe.spec.ts`, `tests/motion/reduced.spec.ts`, `tests/sections/work.spec.ts`) covers the remaining requirements — Wave 0 extensions only.*

---

## Manual-Only Verifications

| Behavior | SC | Why Manual | Test Instructions |
|----------|-----|------------|-------------------|
| Sanity content authoring: Blumenspiess/Learnstep/Lumo case study data entered in Studio | SC #1 | Content creation is a human task; automated tests verify rendering once data exists | Open Studio at `/studio`, navigate to each project document, fill problem/solution/outcomeText/outcomeValue/outcomeLabel fields, set hasCaseStudy=true |
| Vercel Speed Insights green Core Web Vitals on production deploy | SC #3 | Requires real Vercel production deploy and real user traffic / Lighthouse run | Deploy to production via `vercel --prod`, check Speed Insights dashboard for LCP/CLS/INP after deploy |
| Phase gate: all 4 SCs verified end-to-end | All | Requires both automated suite green + human sign-off | Run full Playwright suite green, then human-verify SC #1 (case study pages render with real Sanity content), SC #2 (new sections visible on homepage), SC #3 (axe 0 violations + Speed Insights), SC #4 (motion review pass) |

---

## Security Notes (ASVS L1)

Phase 7 adds no authentication, no new API routes, no new form fields. Relevant checks:

- **V5 Input / CMS content:** `problem`, `solution`, `outcomeText` rendered as JSX text nodes — never `dangerouslySetInnerHTML`. Established pattern in `SeoPageLayout.tsx` (T-06-05 carries forward).
- **V5 JSON-LD:** If case study pages emit JSON-LD structured data, `JSON.stringify` is the only serialization sink — no inline CMS strings in `<script>` content.
- **hasCaseStudy flag:** UI-only conditional — no server-side route protection needed (pages are public).

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING (❌) references
- [ ] No watch-mode flags
- [ ] Feedback latency < 45s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
