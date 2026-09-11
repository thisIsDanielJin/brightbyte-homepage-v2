---
phase: 07-p2-differentiators-polish
plan: "01"
subsystem: cms-schema,case-study-routes,work-grid
tags: [sanity, groq, typegen, case-study, work-grid, conditional-links, ssr-static]
status: complete

dependency_graph:
  requires: []
  provides:
    - sanity/schemaTypes/project.ts (8 new case study fields)
    - sanity/schemaTypes/siteSettings.ts (faqs array)
    - lib/sanity/queries.ts (CASE_STUDY_BY_SLUG_QUERY, getCaseStudyBySlug, hasCaseStudy in PROJECTS_QUERY, faqs in SITE_SETTINGS_QUERY)
    - sanity.types.ts (CASE_STUDY_BY_SLUG_QUERY_RESULT, updated PROJECTS_QUERY_RESULT with hasCaseStudy, updated SITE_SETTINGS_QUERY_RESULT with faqs)
    - app/[locale]/work/[slug]/page.tsx (SSG case study route)
    - components/work/CaseStudyLayout.tsx (5-band case study layout)
    - components/sections/WorkSection.tsx (conditional Link/div card wrapper)
    - tests/sections/work.spec.ts (updated assertions for Phase 7 conditional linking)
    - tests/sections/case-study.spec.ts (smoke tests for Blumenspiess)
    - tests/sections/work-links.spec.ts (redirect comment stub)
  affects:
    - Work grid rendering (conditional link wrapping)
    - generateStaticParams (now filters hasCaseStudy projects)

tech_stack:
  added: []
  patterns:
    - "Conditional Link/div card wrapper pattern for hasCaseStudy flag"
    - "Manual sanity.types.ts update when typegen cannot run (Node version constraint)"
    - "5-band case study layout with optional band omission pattern"

key_files:
  created:
    - app/[locale]/work/[slug]/page.tsx
    - components/work/CaseStudyLayout.tsx
    - tests/sections/case-study.spec.ts
    - tests/sections/work-links.spec.ts
  modified:
    - sanity/schemaTypes/project.ts
    - sanity/schemaTypes/siteSettings.ts
    - lib/sanity/queries.ts
    - sanity.types.ts
    - components/sections/WorkSection.tsx
    - tests/sections/work.spec.ts

decisions:
  - "Manual sanity.types.ts update instead of running typegen — sanity@latest typegen generate requires Node >=22.12 but current shell is Node 20.17. Types updated manually to match query projections exactly."
  - "PROJECTS_QUERY_RESULT hasCaseStudy field type is boolean | null (same as all other optional fields in the generated types) to match Sanity's boolean field with no required() validation."
  - "CTA_CLASS copied verbatim from SeoPageLayout.tsx line 72-73 to maintain identical button styling without creating a shared constant (avoids premature abstraction at this stage)."
  - "work-links.spec.ts kept as redirect comment per plan spec — assertions live in work.spec.ts to avoid duplication."
  - "Band omission pattern: each of Problem/Solution/Outcome bands renders conditionally (falsy check on field). CTA strip always renders."

metrics:
  duration: "~8 minutes"
  completed_date: "2026-09-11"
  tasks_completed: 2
  tasks_blocked_at_checkpoint: 1
  commits: 2

actuals:
  tokens: 45000
  tasks: 2
  commits: 2
---

# Phase 07 Plan 01: Case Study Architecture Tracer Summary

Sanity schema extensions for case studies + siteSettings FAQ array, GROQ query updates, manual type declarations, and a complete case study route (CaseStudyLayout + page.tsx) with conditional work grid linking. Stopped at the human-verify checkpoint (Task 3) pending Sanity Studio data authoring.

## What Was Built

### Task 1: Schema + Queries + Types (commit 85ed8b1)

**Sanity schema additions (all optional, additive, non-breaking):**

`sanity/schemaTypes/project.ts` — 8 new `defineField` entries appended after `language`:
- `problem` (text, rows:6) — client challenge narrative
- `solution` (text, rows:8) — what BrightByte built
- `outcomeText` (text, rows:4) — measured result narrative
- `outcomeValue` (string) — metric callout e.g. "+200%"
- `outcomeLabel` (string) — metric label e.g. "mehr Kundenanfragen"
- `heroImage` (image, hotspot:true) — case study hero image
- `clientCategory` (string) — category badge e.g. "Floristik"
- `hasCaseStudy` (boolean, initialValue:false) — conditional link flag

`sanity/schemaTypes/siteSettings.ts` — `faqs` array field inserted between `aboutPhoto` and `defaultSeo`. Mirrors `seoPage.ts` shape exactly (question: string required, answer: text rows:3 required).

**GROQ query updates:**
- `PROJECTS_QUERY`: added `hasCaseStudy` to projection
- `CASE_STUDY_BY_SLUG_QUERY` + `getCaseStudyBySlug`: new, selects all case study fields
- `SITE_SETTINGS_QUERY`: added `faqs[]{question, answer}`

**TypeScript types (manual update due to Node version constraint):**
- `PROJECTS_QUERY_RESULT`: added `hasCaseStudy: boolean | null`
- `CASE_STUDY_BY_SLUG_QUERY_RESULT`: new type with all case study fields
- `SITE_SETTINGS_QUERY_RESULT`: added `faqs: Array<{question, answer}> | null`
- `Project` document type: added all 8 new fields
- `SiteSettings` document type: added `faqs` array
- Query TypeMap: updated all 3 new/changed query string entries

### Task 2: Case Study Route + Layout + WorkSection (commit cde1988)

**`app/[locale]/work/[slug]/page.tsx`:**
- `dynamicParams = false` — SSG only, T-07-04
- `generateStaticParams`: filters `hasCaseStudy` projects across DE + EN
- `generateMetadata`: uses `buildHreflangAlternates('/work/' + slug)`
- WebPage JSON-LD via `buildWebPageLd`
- T-07-03: locale narrowed to `'de' | 'en'` ternary
- `notFound()` on null project

**`components/work/CaseStudyLayout.tsx`:**
- 5-band RSC layout wrapped in `<MotionSection>`:
  - Band 1: Hero (category pill, H1, outcome callout, summary, optional heroImage)
  - Band 2: Problem (omit if `!project.problem`)
  - Band 3: Solution (`bg-surface-subtle`, omit if `!project.solution`)
  - Band 4: Outcome (omit if no outcomeText and no outcomeValue)
  - Band 5: CTA strip (always rendered)
- IDENT-01 compliant: zero raw hex, zero `text-gray-*`
- All CMS strings as escaped JSX text nodes (T-07-01)
- `CTA_CLASS` copied verbatim from `SeoPageLayout.tsx`

**`components/sections/WorkSection.tsx` (updated):**
- `hasCaseStudy=true` → `<Link href="/{locale}/work/{slug}" data-testid="work-card" className="...cursor-pointer...">`
- `hasCaseStudy` falsy → `<div data-testid="work-card" className="...cursor-default...">`
- `locale` destructured in `WorkSectionInner` (was only in outer `WorkSection`)
- `Link` imported from `next/link`

**Tests:**
- `tests/sections/work.spec.ts`: D-11 "no links" assertion replaced with conditional-link contract
- `tests/sections/case-study.spec.ts`: smoke tests for Blumenspiess DE + EN (H1, eyebrow, outcome metric, CTA)
- `tests/sections/work-links.spec.ts`: redirect comment (logic in work.spec.ts)

## Stopped At Checkpoint (Task 3)

The plan has a `type="checkpoint:human-verify" gate="blocking"` task before proceeding. Human verification required:

1. Author Blumenspiess case study data in Sanity Studio (`hasCaseStudy: true`, problem, solution, outcomeValue, etc.)
2. Run `next start` and verify `/de/work/blumenspiess` renders H1, "Die Herausforderung", "Die Lösung", outcome metric, CTA strip
3. Run `npx playwright test tests/sections/work.spec.ts tests/sections/case-study.spec.ts --project=chromium`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Constraint] Manual sanity.types.ts update instead of typegen regeneration**
- **Found during:** Task 1, Step D
- **Issue:** `npx sanity@latest typegen generate` requires Node >=22.12; shell is on Node 20.17. The `sanity schema extract` command also fails without active env credentials loaded (`.env.local` cannot be sourced due to security rule for `.env.*` files in deny list).
- **Fix:** Manually updated `sanity.types.ts` to add all new type declarations matching the query projections exactly. TypeScript (`tsc --noEmit`) exits 0.
- **Files modified:** `sanity.types.ts`
- **Commit:** 85ed8b1

**2. [Rule 2 - Missing functionality] `locale` destructuring in `WorkSectionInner`**
- **Found during:** Task 2, Step D
- **Issue:** Plan specified to destructure `locale` from `WorkSectionInner`'s props, but the original component only destructured `{ projects }`. Adding conditional Link wrapping requires `locale`.
- **Fix:** Changed `function WorkSectionInner({ projects }: WorkSectionProps)` to `function WorkSectionInner({ projects, locale }: WorkSectionProps)` — correctly using the prop already present on the interface.
- **Files modified:** `components/sections/WorkSection.tsx`
- **Commit:** cde1988

## Known Stubs

The `case-study.spec.ts` test uses a hardcoded slug constant `BLUMENSPIESS_DE_SLUG = 'blumenspiess'` which needs to be verified against actual Sanity data:
- **File:** `tests/sections/case-study.spec.ts`
- **Line:** 16-17
- **Reason:** Cannot query Sanity at build time without running env credentials; slug commented with verification instructions.

## Self-Check: PASSED

Checking created files exist and commits are present.

| Check | Result |
|-------|--------|
| app/[locale]/work/[slug]/page.tsx | FOUND |
| components/work/CaseStudyLayout.tsx | FOUND |
| tests/sections/case-study.spec.ts | FOUND |
| tests/sections/work-links.spec.ts | FOUND |
| commit 85ed8b1 (task 1) | FOUND |
| commit cde1988 (task 2) | FOUND |
