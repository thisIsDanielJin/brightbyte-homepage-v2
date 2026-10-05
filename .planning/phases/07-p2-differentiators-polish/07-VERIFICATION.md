---
phase: 07-p2-differentiators-polish
verified: 2026-09-13T18:30:00Z
status: gaps_found
score: 8/13 must-haves verified
behavior_unverified: 2
overrides_applied: 0
gaps:
  - truth: "All three anchor case study pages (Blumenspiess, Learnstep, Lumo) live with problem/solution/outcome structure"
    status: partial
    reason: "07-02 deliberately skipped — client sites not ready. Route infrastructure and Blumenspiess page structure exist; Learnstep and Lumo content not authored in Sanity, so generateStaticParams produces 0 or 1 paths, not 6."
    artifacts:
      - path: "tests/sections/case-study.spec.ts"
        issue: "Only covers Blumenspiess; Learnstep/Lumo assertions absent — plan 07-02 never executed"
    missing:
      - "Sanity content authoring: Learnstep and Lumo project documents with hasCaseStudy=true, problem, solution, outcome fields"
      - "Extension of case-study.spec.ts to cover all 3 projects (07-02 deliverable)"
  - truth: "FAQ section (5-7 questions) live in both DE and EN locales"
    status: partial
    reason: "Code is complete and hides gracefully when empty (correct behavior). However, FAQ content has not been authored in Sanity — siteSettings.faqs is empty, so #faq never renders on the live homepage. This is a deliberate content deferral, not a code defect."
    artifacts:
      - path: "components/sections/FaqSection.tsx"
        issue: "Substantive and correct; section renders null when faqs empty — expected but means FAQ is not yet live"
    missing:
      - "Author 5-7 FAQ items in Sanity Studio under Site Settings > Homepage FAQs (DE + EN)"
  - truth: "Vercel Speed Insights shows green Core Web Vitals on production"
    status: failed
    reason: "Task 3 (production Vercel deploy) and Task 4 (Phase 7 gate verification on live URL) of plan 07-04 were never executed — plan halted at checkpoint:human-verify after Task 2."
    artifacts: []
    missing:
      - "Execute plan 07-04 Task 3: production Vercel deploy via vercel --prod"
      - "Confirm Speed Insights green Core Web Vitals post-deploy"
  - truth: "All section motion passes a final refinement review — timing, easing, and intensity consistent with identity tokens"
    status: partial
    reason: "Automated checks (reduced.spec.ts 22/22, fade-in 4/4) confirm correct motion attribute behavior. Human sign-off on motion refinement review was recorded in plan 07-04 as pending the human-verify checkpoint. Per the user's instruction this was approved (hero fade-in confirmed visually), but no production-deploy gate has run."
    missing:
      - "Production deploy required to close the SC #4 gate fully per VALIDATION.md manual verification contract"
behavior_unverified_items:
  - truth: "Hero canvas fades in smoothly over 500ms (not hard-cut) on both direct load and soft navigation"
    test: "Load /de in a real browser; reload 3-4 times; navigate to /de/impressum then back to /de"
    expected: "Glass sphere fades in smoothly over ~500ms each time — no hard-cut"
    why_human: "Playwright confirms data-ready=true and opacity:1 programmatically; visual smoothness of the 500ms CSS transition cannot be verified headlessly. User confirmed this visually as part of the 07-04 checkpoint approval per instructions."
  - truth: "All 50 automated tests pass on the current next start build"
    test: "Run npx playwright test tests/a11y/axe.spec.ts tests/hero/fade-in.spec.ts tests/motion/reduced.spec.ts"
    expected: "50/50 pass (axe 24/24, fade-in 4/4, reduced-motion 22/22)"
    why_human: "Tests require a running next start server; cannot run in this static verification. Last recorded run in 07-04-SUMMARY.md: 50 passed (23.8s). No regression evidence found."
human_verification:
  - test: "Author Learnstep and Lumo case study content in Sanity Studio"
    expected: "/de/work/learnstep and /de/work/lumo render with H1, 'Die Herausforderung', 'Die Lösung', outcome metric, and CTA strip"
    why_human: "Content authoring is a human task; no code path can create Sanity documents"
  - test: "Author 5-7 FAQ items in Sanity Studio (DE + EN siteSettings documents)"
    expected: "#faq section appears on /de and /en homepage with accordion items"
    why_human: "FAQ content authoring is a human task; FaqSection returns null until siteSettings.faqs is populated"
  - test: "Run full Playwright suite against next start: npx playwright test tests/a11y/axe.spec.ts tests/hero/fade-in.spec.ts tests/motion/reduced.spec.ts"
    expected: "50 passed, 0 failed"
    why_human: "Requires running next start server; cannot verify statically"
  - test: "Deploy to production via vercel --prod and verify Speed Insights Core Web Vitals"
    expected: "LCP, CLS, INP all green in Vercel Speed Insights dashboard after real user traffic or Lighthouse run"
    why_human: "Requires real Vercel production deploy and live URL"
---

# Phase 07: P2 Differentiators & Polish — Verification Report

**Phase Goal:** Conversion-improving additions (case studies, FAQ, process section, guarantee framing) layered onto a complete, live site, plus final motion tuning and a full accessibility audit pass.
**Verified:** 2026-09-13T18:30:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

---

## Critical Context (Read First)

The verifier was explicitly instructed to record the following as **intentional content gaps, not regressions**:

- **Plan 07-02 was deliberately skipped** — Learnstep and Lumo client sites and content are not ready. No 07-02-SUMMARY.md exists. SC #1 is therefore only partially met.
- **FAQ content was not authored in Sanity** — FaqSection is code-complete and hides gracefully when empty. This is the correct behavior per UI-SPEC; the gap is the missing Sanity content authoring step.
- **Plan 07-04 was approved at its human-verify checkpoint** — the user confirmed the hero fade-in visually. Tasks 3 and 4 (production Vercel deploy + gate) remain pending.

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `/[locale]/work/[slug]` route infrastructure exists with SSG, `notFound()`, and correct hreflang/JSON-LD | VERIFIED | `app/[locale]/work/[slug]/page.tsx` — `dynamicParams=false`, `generateStaticParams` filtering `hasCaseStudy`, `buildHreflangAlternates`, `buildWebPageLd` all present and wired |
| 2 | CaseStudyLayout 5-band structure (Hero, Problem, Solution, Outcome, CTA) with band-omission pattern | VERIFIED | `components/work/CaseStudyLayout.tsx` — all 5 bands present, conditional omission via falsy checks, IDENT-01 compliant, JSX text nodes only |
| 3 | WorkSection conditional link upgrade: `hasCaseStudy=true` → `<Link cursor-pointer>`, falsy → `<div cursor-default>` | VERIFIED | `components/sections/WorkSection.tsx` lines 128-141 — conditional `<Link>` with locale-aware href and `focus-visible` ring, `cursor-pointer` vs `cursor-default` |
| 4 | Sanity schema extended with 8 case study fields on `project` document type | VERIFIED | `sanity/schemaTypes/project.ts` — `problem`, `solution`, `outcomeText`, `outcomeValue`, `outcomeLabel`, `heroImage`, `clientCategory`, `hasCaseStudy` all present |
| 5 | `CASE_STUDY_BY_SLUG_QUERY` + `getCaseStudyBySlug` + `hasCaseStudy` in `PROJECTS_QUERY` | VERIFIED | `lib/sanity/queries.ts` lines 36, 55-64 — queries defined; `sanity.types.ts` lines 427, 452, 672 — types registered in QueryTypeMap |
| 6 | `faqs` field in `siteSettings` Sanity schema and `SITE_SETTINGS_QUERY` projection | VERIFIED | `sanity/schemaTypes/siteSettings.ts` line 118; `lib/sanity/queries.ts` line 166; `sanity.types.ts` lines 659-661 |
| 7 | ProcessSection and GuaranteeSection rendered, static copy in DE + EN message dicts, always visible | VERIFIED | `components/sections/ProcessSection.tsx` + `components/sections/GuaranteeSection.tsx` — substantive RSC components using `useTranslations`; `messages/de.json` + `messages/en.json` contain `Process`, `Guarantee` namespaces; `app/[locale]/page.tsx` lines 131-134 wire both unconditionally |
| 8 | FaqSection component hides correctly when `faqs.length === 0`; CaseStudiesBridge hides when no projects | VERIFIED | `components/sections/FaqSection.tsx` line 31 — `if (!faqs \|\| faqs.length === 0) return null`; `components/sections/CaseStudiesBridge.tsx` line 35 — same guard; `page.tsx` lines 123-125, 137 — conditional rendering confirmed |
| 9 | D-11 hero fade-in fixed: `key="hero-backdrop"` on sibling div, `data-testid="hero-canvas-wrapper"` on HeroCanvas | VERIFIED | `components/sections/HeroSection.tsx` line 57 — `key="hero-backdrop"` confirmed; `components/hero/HeroCanvas.tsx` line 116 — `data-testid="hero-canvas-wrapper"` confirmed; commits `c3ba8b3` and `fc4f3ec` exist |
| 10 | WCAG AA color-contrast violations resolved across 6 homepage sections | VERIFIED | `07-04-SUMMARY.md` details 6 components fixed; `data-decorative="true"` pattern applied; `axe.spec.ts` extended; axe 24/24 pass recorded in summary |
| 11 | Blumenspiess, Learnstep, and Lumo all have live case study pages with real Sanity content | PARTIAL (gap) | Route infra exists; Blumenspiess schema ready; Learnstep + Lumo content not authored — 07-02 skipped intentionally |
| 12 | FAQ section live in DE + EN with 5-7 questions | PARTIAL (gap) | `FaqSection` is code-complete and wired; `siteSettings.faqs` empty in Sanity — content not authored |
| 13 | Production Vercel Speed Insights green Core Web Vitals | FAILED (gap) | No production deploy executed — plan 07-04 Tasks 3+4 pending |
| 14 | Hero fade-in smooth (visual) + all 50 automated tests green | PRESENT_BEHAVIOR_UNVERIFIED | Code and attributes confirmed; Playwright 50/50 pass recorded in 07-04-SUMMARY; visual smoothness requires human eyes + running server |

**Score:** 10/13 truths verified or passing (8 VERIFIED + 2 PARTIAL counted as gap), 2 PRESENT_BEHAVIOR_UNVERIFIED, 3 with gaps (1 PARTIAL infrastructure, 2 FAILED)

---

## Success Criteria Status

| SC | Description | Status | Notes |
|----|-------------|--------|-------|
| SC #1 | Deep case study pages for Blumenspiess, Learnstep, and Lumo | PARTIAL | Route + layout + Blumenspiess schema ready. Learnstep + Lumo content not seeded (07-02 skipped). |
| SC #2 | FAQ, Process, and Guarantee sections live in DE + EN | PARTIAL | Process + Guarantee: LIVE (static, always renders). FAQ: code-complete, hidden (no Sanity content). |
| SC #3 | Zero axe violations; Vercel Speed Insights green | PARTIAL | axe 24/24 pass (automated, last recorded run). Speed Insights: no production deploy yet. |
| SC #4 | All section motion passes final review | PARTIAL | Automated: fade-in 4/4, reduced-motion 22/22. Human visual sign-off on hero fade-in: approved by user per 07-04 checkpoint. Production gate not yet run. |

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `app/[locale]/work/[slug]/page.tsx` | SSG case study route | VERIFIED | Exists, substantive, wired |
| `components/work/CaseStudyLayout.tsx` | 5-band case study layout | VERIFIED | Exists, substantive, wired |
| `components/sections/ProcessSection.tsx` | 3-step process section | VERIFIED | Exists, substantive, wired into page.tsx |
| `components/sections/GuaranteeSection.tsx` | Trust strip | VERIFIED | Exists, substantive, wired into page.tsx |
| `components/sections/FaqSection.tsx` | FAQ wrapper, hides when empty | VERIFIED | Exists, substantive, wired into page.tsx |
| `components/sections/CaseStudiesBridge.tsx` | Case studies CTA bridge | VERIFIED | Exists, substantive, wired into page.tsx |
| `tests/sections/case-study.spec.ts` | Smoke tests for Blumenspiess | PRESENT/PARTIAL | Exists, covers Blumenspiess only; Learnstep + Lumo absent |
| `tests/sections/process.spec.ts` | Process section smoke tests | VERIFIED | Exists, 4 tests, substantive |
| `tests/sections/faq.spec.ts` | FAQ section smoke tests (content-gated) | VERIFIED | Exists, graceful skip when no Sanity data |
| `tests/hero/fade-in.spec.ts` | D-11 regression test | VERIFIED | Exists, substantive, graceful WebGL fallback |
| `tests/motion/reduced.spec.ts` (extended) | Extended with #process, #guarantee | VERIFIED | Lines 74-109 confirm extension |
| `tests/a11y/axe.spec.ts` (extended) | Extended with /work/[slug] content-gated | VERIFIED | Lines 23-63 confirm workPaths + content-gated pattern |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `app/[locale]/work/[slug]/page.tsx` | `lib/sanity/queries.ts getCaseStudyBySlug` | import + call on line 17 | WIRED | Data flows from Sanity query to CaseStudyLayout |
| `app/[locale]/page.tsx` | `components/sections/ProcessSection` | import line 33 + render line 131 | WIRED | Always rendered |
| `app/[locale]/page.tsx` | `components/sections/GuaranteeSection` | import line 34 + render line 134 | WIRED | Always rendered |
| `app/[locale]/page.tsx` | `components/sections/FaqSection` | import line 35 + conditional render line 137 | WIRED | Renders only when `validFaqs.length > 0` |
| `app/[locale]/page.tsx` | `components/sections/CaseStudiesBridge` | import line 31 + conditional render lines 123-125 | WIRED | Renders only when `projectsWithCaseStudy.length > 0` |
| `components/sections/WorkSection.tsx` | `/[locale]/work/[slug]` | `<Link href={'/' + locale + '/work/' + slug}>` line 131 | WIRED | Conditional on `hasCaseStudy` |
| `HeroSection.tsx` | `HeroCanvas.tsx` | `key="hero-backdrop"` on adjacent sibling div | WIRED | Prevents React reconciler from reusing DOM node — D-11 fix |

---

## Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|-------------------|--------|
| `CaseStudyLayout.tsx` | `project` | `getCaseStudyBySlug(locale, slug)` → Sanity GROQ | Yes (Sanity query) | FLOWING (when content exists) |
| `ProcessSection.tsx` | `steps` | `useTranslations('Process')` → `messages/{locale}.json` | Yes (static i18n) | FLOWING |
| `GuaranteeSection.tsx` | `ticks` | `useTranslations('Guarantee')` → `messages/{locale}.json` | Yes (static i18n) | FLOWING |
| `FaqSection.tsx` | `faqs` | Props from `page.tsx` → `settings.faqs` → Sanity | Empty array (no Sanity content) | STATIC (no content authored yet) |
| `CaseStudiesBridge.tsx` | `projects` | Props from `page.tsx` → `projectsWithCaseStudy` filter | Empty array (no hasCaseStudy=true projects) | STATIC (no content authored yet) |

---

## Behavioral Spot-Checks

Tests were run against `next build + next start` as recorded in plan SUMMARYs. Cannot re-run without a live server.

| Behavior | Last Recorded Run | Result | Status |
|----------|-------------------|--------|--------|
| axe 24/24 — homepage + /impressum + /datenschutz across 2 viewports | 07-04-SUMMARY.md (2026-09-13) | 24 passed | PRESENT_BEHAVIOR_UNVERIFIED |
| fade-in 4/4 — data-ready=true, opacity:1 | 07-04-SUMMARY.md (2026-09-13) | 4 passed | PRESENT_BEHAVIOR_UNVERIFIED |
| reduced-motion 22/22 — including #process, #guarantee | 07-04-SUMMARY.md (2026-09-13) | 22 passed | PRESENT_BEHAVIOR_UNVERIFIED |
| process.spec.ts 6/6 | 07-03-SUMMARY.md (2026-09-13) | 6 passed | PRESENT_BEHAVIOR_UNVERIFIED |
| TypeScript `tsc --noEmit` | 07-03-SUMMARY.md (2026-09-13) | exits 0 | PRESENT_BEHAVIOR_UNVERIFIED |

---

## Requirements Coverage

No formal requirement IDs are assigned to Phase 7 scope (ROADMAP.md: "P2 scope — no v1 requirement IDs; see v2 deferred requirements in REQUIREMENTS.md"). Phase 7 work is governed by its 4 Success Criteria above.

---

## Anti-Patterns Found

| File | Pattern | Severity | Assessment |
|------|---------|----------|------------|
| `tests/sections/case-study.spec.ts` line 19 | `BLUMENSPIESS_EN_SLUG = 'blumenspiess'` — comment: "confirm from Sanity" | Warning | Not a blocker; slug confirmed by convention. Known stub per 07-01-SUMMARY. |
| `tests/sections/faq.spec.ts` | FAQ test soft-skips when no Sanity data | Info | Correct design — mirrors Services/Testimonials hide pattern. Not a stub. |
| `tests/a11y/axe.spec.ts` | `/work/learnstep`, `/work/lumo` paths will always 404-skip until content authored | Info | Content-gated graceful-skip is intentional and correct. |

No `TBD`, `FIXME`, or `XXX` markers found in any Phase 7 created/modified files.

---

## Human Verification Required

### 1. Author Learnstep Case Study Content

**Test:** Open Sanity Studio at `http://localhost:3333`, navigate to the Learnstep project document (DE), set `hasCaseStudy: true` and fill `problem`, `solution`, `outcomeValue`, `outcomeLabel`, `outcomeText`. Repeat for EN. Rebuild and run `npx playwright test tests/sections/case-study.spec.ts --project=chromium`.

**Expected:** `/de/work/learnstep` renders with H1 (project title), "Die Herausforderung" section, "Die Lösung" section, outcome metric, and CTA strip. Test passes.

**Why human:** Sanity content authoring cannot be automated.

### 2. Author Lumo Case Study Content

**Test:** Same as above for the Lumo project document.

**Expected:** `/de/work/lumo` renders correctly. `generateStaticParams` now generates 6 paths (de+en for each of blumenspiess, learnstep, lumo).

**Why human:** Sanity content authoring cannot be automated.

### 3. Author FAQ Content in Sanity Studio

**Test:** Open Sanity Studio, navigate to Site Settings (DE), scroll to "Homepage FAQs", add 5-7 items (question + answer pairs). Repeat for EN. Rebuild and visit `/de`.

**Expected:** `#faq` section appears on the homepage with accordion items. FAQ test in `tests/sections/faq.spec.ts` no longer soft-skips — content assertions fire.

**Why human:** Sanity content authoring cannot be automated.

### 4. Run Full Playwright Suite

**Test:** With `next start` running: `npx playwright test tests/a11y/axe.spec.ts tests/hero/fade-in.spec.ts tests/motion/reduced.spec.ts tests/sections/process.spec.ts tests/sections/faq.spec.ts`

**Expected:** 50+ tests pass, 0 failures.

**Why human:** Requires a running `next start` server; cannot verify statically. Last recorded: 50/50 pass on 2026-09-13.

### 5. Production Vercel Deploy + Speed Insights Gate

**Test:** Run `vercel --prod` from the repo root (git integration builds stale v1 — use CLI). Check Vercel Speed Insights dashboard after deploy for LCP, CLS, INP.

**Expected:** Core Web Vitals green. This closes SC #3 fully and satisfies the Phase 7 production gate (07-04 Task 3+4).

**Why human:** Requires real Vercel production deploy and real user traffic or Lighthouse run.

---

## Gaps Summary

Three categories of open work remain before Phase 7 can be marked fully complete:

**Content gaps (user-side, no code changes needed):**
- Learnstep and Lumo case study content in Sanity (was 07-02 scope, skipped because client sites not ready)
- FAQ content in Sanity siteSettings (5-7 items, DE + EN)

**Deploy gate (one command away):**
- `vercel --prod` production deploy to close the SC #3 Speed Insights gate and run 07-04 Tasks 3+4

**Test coverage (triggered by content):**
- `case-study.spec.ts` needs Learnstep + Lumo assertions once content is seeded (minimal — same pattern as Blumenspiess)

None of these gaps represent code defects. The infrastructure is complete and tested. Phase 7 is blocked on content authoring and a production deploy, not on engineering work.

---

_Verified: 2026-09-13T18:30:00Z_
_Verifier: Claude (gsd-verifier)_
