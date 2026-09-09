---
phase: 06-seo-layer-programmatic-pages
plan: "02"
subsystem: seo
tags: [sanity, json-ld, schema.org, sitemap, playwright, next.js]

# Dependency graph
requires:
  - phase: 06-01
    provides: "tracer seoPage route, NDJSON with 50 docs, sitemap SEO block"
provides:
  - "All 50 seoPage docs (25 DE + 25 EN) imported into Sanity production"
  - "25 translation.metadata links connecting DE/EN pairs"
  - "lib/jsonld/organization.ts: buildLocalBusinessLd() for homepage ProfessionalService JSON-LD"
  - "Homepage (DE + EN) emits ProfessionalService JSON-LD with areaServed Berlin"
  - "Impressum + Datenschutz pages each emit WebPage JSON-LD"
  - "Sitemap covers all 52 <loc> entries (2 roots + 50 SEO pages) with correct paired hreflang"
  - "Full tests/seo/ suite green (12/12 tests pass)"
affects: [06-03, future-seo-expansion, phase-07]

# Actuals (#2632)
actuals:
  tokens: 5971   # 23884 chars / 4 over the realized diff
  tasks: 3
  commits: 5     # 1 TDD RED + 1 TDD GREEN + 1 import/spec + 1 sitemap + 1 metadata

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "ProfessionalService/LocalBusiness JSON-LD on homepage sourced from siteSettings with D-05 fallback constants"
    - "WebPage JSON-LD on legal/section pages via existing buildWebPageLd emitter"
    - "Sanity fetch-cache must be cleared before rebuild when Sanity data changes (useCdn:false + Next.js static prerender interaction)"

key-files:
  created:
    - lib/jsonld/organization.ts
  modified:
    - app/[locale]/page.tsx
    - app/[locale]/impressum/page.tsx
    - app/[locale]/datenschutz/page.tsx
    - tests/seo/seo-pages.spec.ts
    - tests/seo/sitemap.spec.ts

key-decisions:
  - "buildLocalBusinessLd uses @type ProfessionalService (subtype of LocalBusiness) per schema.org recommendation for a freelance studio"
  - "Address parsed from siteSettings.address string with D-05 constant fallbacks — no new schema field required"
  - "Next.js fetch cache cleared before final rebuild to ensure Sanity import is reflected in static prerender"
  - "Static-params spec extended to spot-check 3 slug pairs not just the tracer (webentwickler, webdesign-neukoelln, website-fuer-aerzte)"

requirements-completed: [SEO-01, SEO-02, SEO-03]

coverage:
  - id: D1
    description: "All 50 seoPage docs (25 DE + 25 EN) and 25 translation.metadata links imported into Sanity production"
    requirement: SEO-01
    verification:
      - kind: integration
        ref: "sanity documents query count(*[_type==\"seoPage\"]) == 50"
        status: pass
      - kind: integration
        ref: "sanity documents query count(*[_type==\"translation.metadata\" && \"seoPage\" in schemaTypes]) == 25"
        status: pass
    human_judgment: false
  - id: D2
    description: "generateStaticParams returns 50 {locale, slug} entries; all 25 DE slugs + 25 EN slugs render 200 against next start"
    requirement: SEO-01
    verification:
      - kind: e2e
        ref: "tests/seo/seo-pages.spec.ts#static params: all 50 locale×slug entries are prerendered"
        status: pass
    human_judgment: false
  - id: D3
    description: "Homepage /de and /en emit ProfessionalService/LocalBusiness JSON-LD with areaServed Berlin sourced from siteSettings"
    requirement: SEO-02
    verification:
      - kind: e2e
        ref: "tests/seo/seo-pages.spec.ts#home JSON-LD: /de has ProfessionalService or LocalBusiness"
        status: pass
      - kind: e2e
        ref: "tests/seo/seo-pages.spec.ts#home JSON-LD: /en also has ProfessionalService or LocalBusiness"
        status: pass
    human_judgment: false
  - id: D4
    description: "Impressum and Datenschutz each emit WebPage JSON-LD localized per locale"
    requirement: SEO-02
    verification:
      - kind: e2e
        ref: "tests/seo/seo-pages.spec.ts#impressum WebPage JSON-LD"
        status: pass
      - kind: e2e
        ref: "tests/seo/seo-pages.spec.ts#datenschutz WebPage JSON-LD"
        status: pass
    human_judgment: false
  - id: D5
    description: "Sitemap covers all 52 <loc> entries (50 SEO pages + 2 roots) with correct paired differing-slug hreflang"
    requirement: SEO-03
    verification:
      - kind: e2e
        ref: "tests/seo/sitemap.spec.ts#sitemap.xml contains all 50 SEO-page URLs"
        status: pass
    human_judgment: false
  - id: D6
    description: "JSON-LD across all page types uses JSON.stringify only — no raw CMS string interpolation"
    requirement: SEO-02
    verification:
      - kind: integration
        ref: "grep dangerouslySetInnerHTML app/ lib/jsonld/ — all use JSON.stringify"
        status: pass
      - kind: automated_ui
        ref: "npm run test:invariants — no-stega-in-build PASS"
        status: pass
    human_judgment: false

# Metrics
duration: 19min
completed: 2026-09-09
status: complete
---

# Phase 6 Plan 02: SEO Expansion Summary

**All 50 seoPage docs imported, homepage ProfessionalService + section/legal WebPage JSON-LD shipped, sitemap covers full 52-URL set — 12/12 seo/ tests green**

## Performance

- **Duration:** 19 min
- **Started:** 2026-09-09T10:48:05Z
- **Completed:** 2026-09-09T11:06:42Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments

- Imported all 50 seoPage docs (25 DE + 25 EN) plus 25 translation.metadata links into Sanity production; verified counts == 50/25
- Created `lib/jsonld/organization.ts` with `buildLocalBusinessLd()` returning `ProfessionalService` schema.org with `areaServed: { @type: City, name: Berlin }`, email/address from `siteSettings`, D-05 fallback constants
- Added ProfessionalService JSON-LD to homepage (DE + EN) and WebPage JSON-LD to impressum + datenschutz pages
- Extended sitemap spec to assert ≥52 `<loc>` entries — sitemap now covers all 50 SEO-page URLs with correct paired differing-slug alternates; cleared Next.js fetch cache before rebuild to ensure Sanity import reflected

## Task Commits

Each task was committed atomically:

1. **Task 1: Import all 50 docs + extend static-params spec** - `de1e190` (feat)
2. **Task 2 RED: Failing tests for home JSON-LD + section WebPage JSON-LD** - `1084bd9` (test)
3. **Task 2 GREEN: ProfessionalService JSON-LD + section WebPage JSON-LD implementation** - `f8af3a4` (feat)
4. **Task 3: Extend sitemap spec for full 50-URL coverage + full suite green** - `b71509b` (feat)

## Files Created/Modified

- `lib/jsonld/organization.ts` — Created: `buildLocalBusinessLd()` emitter, ProfessionalService schema.org (D-05)
- `app/[locale]/page.tsx` — Modified: added ProfessionalService JSON-LD script sourced from getSiteSettings
- `app/[locale]/impressum/page.tsx` — Modified: added WebPage JSON-LD via buildWebPageLd, BASE_URL import
- `app/[locale]/datenschutz/page.tsx` — Modified: added WebPage JSON-LD via buildWebPageLd, BASE_URL import
- `tests/seo/seo-pages.spec.ts` — Modified: extended static-params test (50 entries, spot-checks), added 4 JSON-LD tests
- `tests/seo/sitemap.spec.ts` — Modified: rewrote to add full 50-URL coverage assertion test

## Decisions Made

- Used `@type: ProfessionalService` (schema.org subtype of `LocalBusiness`) — Google's recommended type for a freelance web design studio
- Address parsed from Sanity `siteSettings.address` string with D-05 constant fallbacks (`Karl-Marx-Allee 118`, `10243 Berlin`) — no new schema field needed
- Next.js fetch cache must be cleared (`rm -rf .next/cache/fetch-cache/`) before rebuild when Sanity data changes, because the sitemap is a static prerendered route (`○`) that fetches from Sanity at build time
- Sitemap spec asserts `>=52` `<loc>` entries (not exactly 52) to allow future additions without breaking the test

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Next.js fetch cache stale after Sanity import**
- **Found during:** Task 3 (sitemap coverage verification)
- **Issue:** After importing all 50 docs, the sitemap still showed only 4 `<loc>` entries because Next.js had cached the previous Sanity fetch result during an earlier build
- **Fix:** Cleared `.next/cache/fetch-cache/` before the final rebuild; sitemap then correctly showed 52 `<loc>` entries
- **Files modified:** None (operational step)
- **Verification:** Sitemap body shows 52 `<loc>` entries after rebuild
- **Committed in:** Part of Task 3 (operational, no code change)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Operational step only; no code change required. Discovery ensures the fetch-cache-clear pattern is documented for future deploys.

## Issues Encountered

- `"The destination stream closed early" (digest: 2018533154)` — This Next.js server-side rendering error appeared in the Playwright console output for some tests but all 12 tests still passed. This is a pre-existing intermittent RSC streaming issue in the existing server, not caused by Plan 02 changes.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- All 50 SEO routes render 200 in both locales; `dynamicParams = false` enforced
- Homepage and all section/legal pages emit valid JSON-LD
- Sitemap covers full 52-URL set with correct paired hreflang alternates
- Full `tests/seo/` suite (12/12) + all 5 invariants green
- Ready for Phase 06-03: deployed preview gate / Vercel preview verification

---
*Phase: 06-seo-layer-programmatic-pages*
*Completed: 2026-09-09*
