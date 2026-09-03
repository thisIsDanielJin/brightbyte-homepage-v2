---
phase: 6
slug: seo-layer-programmatic-pages
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-09-03
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Derived from `06-RESEARCH.md` § Validation Architecture. The per-task map below is finalized by the planner (task IDs) and validate-phase.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright (already in project from Phase 4) |
| **Config file** | `playwright.config.ts` (exists) |
| **Quick run command** | `npx playwright test tests/seo/ --project=chromium` |
| **Full suite command** | `npx playwright test` |
| **Estimated runtime** | ~30–60 seconds (seo/ subset), full suite longer |

---

## Sampling Rate

- **After every task commit:** Run `npx playwright test tests/seo/ --project=chromium`
- **After every plan wave:** Run `npx playwright test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** ~60 seconds
- **Discipline:** sitemap/robots specs MUST run against `next start` (production build), NOT `next dev` (SC #2/#3/#4 verify on Vercel preview / `next start`).

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | — | — | SEO-01 | — | `/de/s/webentwickler-berlin` renders 200, not 404 | smoke | `npx playwright test tests/seo/seo-pages.spec.ts -g "renders DE tracer"` | ❌ W0 | ⬜ pending |
| TBD | — | — | SEO-01 | — | `/en/s/<en-slug>` renders 200, not 404 | smoke | `npx playwright test tests/seo/seo-pages.spec.ts -g "renders EN tracer"` | ❌ W0 | ⬜ pending |
| TBD | — | — | SEO-01 | — | `generateStaticParams` returns 50 entries | unit | `npx playwright test tests/seo/seo-pages.spec.ts -g "static params"` | ❌ W0 | ⬜ pending |
| TBD | — | — | SEO-02 | — | `<script type="application/ld+json">` FAQPage present on DE page | DOM | `npx playwright test tests/seo/seo-pages.spec.ts -g "FAQPage JSON-LD"` | ❌ W0 | ⬜ pending |
| TBD | — | — | SEO-02 | — | FAQPage has ≥1 Question item | DOM | same spec | ❌ W0 | ⬜ pending |
| TBD | — | — | SEO-03 | — | `/sitemap.xml` returns 200, contains `/de/s/webentwickler-berlin` | smoke | `npx playwright test tests/seo/sitemap.spec.ts` | ❌ W0 | ⬜ pending |
| TBD | — | — | SEO-03 | — | sitemap entry has `xhtml:link` with differing de/en slugs | DOM/parse | same spec | ❌ W0 | ⬜ pending |
| TBD | — | — | SEO-03 | — | `/robots.txt` returns 200, contains sitemap reference | smoke | `npx playwright test tests/seo/robots.spec.ts` | ❌ W0 | ⬜ pending |
| TBD | — | — | I18N-02 | — | DE page `<head>` contains `hreflang="x-default"` → `/de/s/` | DOM | `npx playwright test tests/seo/seo-pages.spec.ts -g "hreflang x-default"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/seo/seo-pages.spec.ts` — covers SEO-01, SEO-02, I18N-02 (render, JSON-LD, hreflang)
- [ ] `tests/seo/sitemap.spec.ts` — covers SEO-03 sitemap
- [ ] `tests/seo/robots.spec.ts` — covers SEO-03 robots.txt
- [ ] Playwright specs for sitemap/robots must be run against `next start` (production build), not `next dev`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Valid JSON-LD passes Google Rich Results Test | SEO-02 | Google's validator is an external web service; no local automated equivalent | Deploy to Vercel preview → paste each page-type URL into Google Rich Results Test → confirm 0 errors for WebPage + FAQPage + BreadcrumbList (SEO page), LocalBusiness/ProfessionalService (home), WebPage (sections) |
| Bidirectional hreflang correct post-deploy | I18N-02 | Full correctness (each locale lists all others + itself, x-default → /de) is asserted against the real deployed HTML, not the dev server | `curl` each locale variant on the Vercel preview URL; grep the `<head>` for the full hreflang set + x-default → /de |
| Sitemap validates against a sitemap validator | SEO-03 | External sitemap-validator tooling | Submit the deployed `/sitemap.xml` to a sitemap validator; confirm all 50 URLs + `alternates.languages` parse cleanly |
| EN slug set approved before migration | SEO-01 | One-way decision (D-03) — published EN slugs become a ranking contract | Wave 0 checkpoint outputs 25 proposed EN slugs; user signs off before the migration script runs |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
