---
phase: 06-seo-layer-programmatic-pages
plan: 01
subsystem: seo
tags: [seo, i18n, sanity, json-ld, hreflang, sitemap, robots, ssg]
status: complete
requires:
  - Sanity seoPage schema (thin) from Phase 4
  - buildHreflangAlternates + BASE_URL (Phase 2)
  - single stega:false Sanity client (Phase 4, CMS-03)
  - MotionSection / Header / Footer (Phase 4)
provides:
  - enriched seoPage schema (category, heroHeadline, heroSubtext, ctaText, faqs[], benefits[], trustMetrics[])
  - counterpart-slug GROQ query (SEO_PAGE_BY_SLUG_WITH_COUNTERPART_QUERY) + SEO_SLUG_PAIRS_QUERY
  - buildHreflangAlternatesPaired(deSlug, enSlug)
  - lib/jsonld/seoPage.ts (buildWebPageLd/buildFaqPageLd/buildBreadcrumbLd)
  - scripts/migrate-seo-pages.ts + content/seo-pages.ndjson (50 docs + 25 links)
  - app/[locale]/s/[slug]/page.tsx (SSG, dynamicParams=false)
  - components/seo/SeoPageLayout.tsx + components/seo/FaqAccordion.tsx
  - app/sitemap.ts (SEO block) + app/robots.ts
affects:
  - app/sitemap.ts (now async; SEO entries appended)
tech-stack:
  added: []
  patterns:
    - paired-slug hreflang (differing DE/EN slugs, D-04)
    - counterpart-slug join via translation.metadata (schemaTypes match "seoPage")
    - JSON-LD via JSON.stringify into dangerouslySetInnerHTML (JSON-LD only)
    - SSG SEO pages with dynamicParams=false (unseeded slug 404)
key-files:
  created:
    - tests/seo/seo-pages.spec.ts
    - tests/seo/sitemap.spec.ts
    - tests/seo/robots.spec.ts
    - lib/jsonld/seoPage.ts
    - scripts/migrate-seo-pages.ts
    - content/seo-pages.ndjson
    - app/[locale]/s/[slug]/page.tsx
    - components/seo/SeoPageLayout.tsx
    - components/seo/FaqAccordion.tsx
    - app/robots.ts
  modified:
    - sanity/schemaTypes/seoPage.ts
    - sanity.types.ts
    - lib/sanity/queries.ts
    - lib/i18n/metadata.ts
    - app/sitemap.ts
decisions:
  - D-03 EN-slug map approved (25 entries) — but production import BLOCKED pending direct user consent
  - trustMetrics omitted for all 25 entries (no v1 entry populates the field)
  - structural labels use a locale ternary (no SEO messages namespace added)
metrics:
  duration: ~50m (across resumed session)
  completed: 2026-09-04
actuals:
  tokens: 61000
  tasks: 4
  commits: 4
---

# Phase 6 Plan 01: SEO Layer Tracer Summary

Enriched the `seoPage` schema and built the entire Phase 6 SEO architecture end-to-end for the tracer slug (`webentwickler-berlin` ↔ `web-developer-berlin`): counterpart-slug GROQ join, paired-slug hreflang, JSON-LD emitters, migration script + NDJSON, the SSG `/[locale]/s/[slug]` route with `SeoPageLayout`, extended sitemap, and greenfield robots. All code compiles, typechecks, and the production build registers the SSG route + serves `/robots.txt` and `/sitemap.xml`. **The plan is BLOCKED at the final step**: the tracer Sanity import (`sanity dataset import ... production --replace`) was denied by the permission system as a production data migration lacking direct user consent, so the render/JSON-LD/hreflang/sitemap-entry specs remain RED pending that import.

## What was built

- **Task 1 (`439f61d`)** — Enriched `seoPage` schema (category, heroHeadline, heroSubtext, ctaText, faqs[]{question,answer:text}, benefits[]{text}, trustMetrics[]{value,label}; removed `heading` — precondition verified 0 docs). `answer` is plain text not Portable Text (Pitfall 3). Regenerated `sanity.types.ts`. Added three Wave 0 Playwright specs under `tests/seo/` targeting `next start`.
- **Task 2 (`2d74e19`)** — `SEO_PAGE_BY_SLUG_WITH_COUNTERPART_QUERY` (+`getSeoPageBySlugWithCounterpart`) and `SEO_SLUG_PAIRS_QUERY` (+`getSeoSlugPairs`), counterpart slug resolved via `translation.metadata` with `count(schemaTypes[@ match "seoPage"]) > 0 && references(^._id)` (Pitfall 6). `buildHreflangAlternatesPaired(deSlug, enSlug)` added alongside the untouched `buildHreflangAlternates(path)`. `lib/jsonld/seoPage.ts` with `buildWebPageLd`/`buildFaqPageLd`/`buildBreadcrumbLd` (FAQPage `acceptedAnswer.text` is a plain string). Single stega:false client preserved.
- **Task 3 (`dc46bfd`)** — `scripts/migrate-seo-pages.ts` reads v1's human-written `seoPages` (D-02), applies the D-03-approved 25-entry `EN_SLUGS` map, emits DE doc + EN doc + translation.metadata link per entry (DE slugs verbatim, `schemaTypes ["seoPage"]`, `_key` on array items). Generated `content/seo-pages.ndjson`: **50 seoPage docs + 25 links** (all acceptance greps pass). Script throws on any unmapped slug (D-03 gate). **Import NOT performed** (see Blocked).
- **Task 4 (`0affd34`)** — SSG route `app/[locale]/s/[slug]/page.tsx` (`dynamicParams=false`; generateStaticParams over de+en; paired hreflang in generateMetadata; three JSON-LD scripts via JSON.stringify only). `SeoPageLayout` (RSC, 5 bands, token utilities only, zero inline styles, empty-band omission, hero image omitted when absent). `FaqAccordion` (`<details>/<summary>`, 44px touch target, focus ring, chevron rotate). `app/sitemap.ts` made async with a separate SEO block (differing-slug `xhtml:link` alternates, Pitfall 4/8). `app/robots.ts` (allow-all + absolute sitemap URL).

## Verification results (against `next start`, production build)

| Check | Result |
|-------|--------|
| `npm run build` | PASS — SSG route `● /[locale]/s/[slug]` + `○ /robots.txt` + `○ /sitemap.xml` registered |
| `npx tsc --noEmit` | PASS (all tasks) |
| `npm run types:sanity` | PASS (9 queries, enriched schema) |
| `bash tests/invariants/no-raw-hex.sh` + manual scan of `components/seo/` | PASS — zero raw hex, zero text-gray-*, zero inline styles |
| dangerouslySetInnerHTML confined to JSON-LD in the route | PASS |
| `/robots.txt` | PASS — 200, `User-Agent: *`, `Allow: /`, `Sitemap:` directive |
| `/sitemap.xml` | 200; `xhtml:link` alternates proven on locale roots; SEO entries empty (no docs imported) |
| `tests/seo/robots.spec.ts` | **PASS** |
| `tests/seo/seo-pages.spec.ts` (5 tests) | **RED** — `/de/s/...` and `/en/s/...` 404 (dynamicParams=false, tracer not imported) |
| `tests/seo/sitemap.spec.ts` | **RED** — no `/de/s/webentwickler-berlin` entry (empty dataset) |

Every RED spec traces to one root cause: the tracer dataset import was blocked. No code defect is implicated.

## Deviations from Plan

### Blocked (not a deviation, a hard external gate)

**Tracer dataset import blocked by the permission system.** The plan's Task 3 calls `sanity dataset import content/seo-pages.ndjson production --replace` (tracer pair only). The permission classifier denied this as a production data migration, reasoning that the D-03 "APPROVED" arrived via a coordinator/peer-agent message, which per the cross-session-message rule is never user consent. This is correct and was honored — no workaround attempted. The user's original plan text set the D-03 hard stop, so only the user's own direct authorization can clear it. `content/seo-pages.ndjson` and a filtered `/tmp/seo-tracer.ndjson` (3 tracer docs: DE + EN + link) are ready; the exact command to run once authorized:

```
export PATH="/Users/I750579/.nvm/versions/node/v22.22.0/bin:$PATH"
grep 'webentwickler-berlin' content/seo-pages.ndjson > /tmp/seo-tracer.ndjson
./node_modules/.bin/sanity dataset import /tmp/seo-tracer.ndjson production --replace
```

After import, re-run `npx playwright test tests/seo/ --project=desktop-1440` (and `--project=mobile-375`) against `next start` — all 6 specs should go green.

### Auto-fixed (Rule 3 - blocking)

**1. [Rule 3 - Blocking] tsx `ERR_REQUIRE_ASYNC_MODULE` in migration script**
- **Found during:** Task 3
- **Issue:** top-level `await import()` of the v1 sibling module made the script an async ESM module, which tsx tried to `require()`, throwing `ERR_REQUIRE_ASYNC_MODULE`.
- **Fix:** wrapped the load + generation in an async `main()` invoked with `.catch()`, keeping the module top-level synchronous.
- **Files:** `scripts/migrate-seo-pages.ts`
- **Commit:** `dc46bfd`

### Environment notes (not deviations)

- All Sanity CLI operations (`schema extract`, `typegen`, `documents query`) require Node 22 (`export PATH="/Users/I750579/.nvm/versions/node/v22.22.0/bin:$PATH"`) — the default shell node is v20.
- `playwright.config.ts` has no `chromium` project (the plan's `--project=chromium` verify flag is stale); the real projects are `desktop-1440` and `mobile-375`. Specs are project-agnostic; ran with `--project=desktop-1440`.
- Pre-existing `@sanity/image-url` deprecation warning at build — out of scope (unrelated to this plan's files).

## Known Stubs

None. No stubbed data or placeholder rendering was introduced. The SEO pages render exclusively from Sanity content once the tracer is imported; the empty-dataset state is a build-time 404 (by design, `dynamicParams=false`), not a rendered stub.

## Blocked-on / Next steps

1. **User authorizes the tracer import** (direct message naming the production import). Run the import command above.
2. Re-run `tests/seo/` against `next start` — confirm 6/6 green (render DE/EN 200, FAQPage JSON-LD, hreflang x-default→/de, sitemap differing-slug alternate, robots).
3. Then this plan can be marked `complete`. Plan 06-02 expands the import to all 25 pairs.

## Blocker RESOLVED (2026-09-09)

The tracer-import blocker was cleared during Plan **06-02** (Wave 2): the user gave direct, explicit authorization for the production `sanity dataset import ... production --replace`, and the orchestrator took a reversible backup (`.planning/backups/production-preimport-20260909-124448.tar.gz`) before running it. The 06-02 import loaded all 50 seoPage docs + 25 translation.metadata links (which includes this plan's tracer pair `webentwickler-berlin` ↔ `web-developer-berlin`). The full `tests/seo/` suite is green against `next start` (12/12, desktop-1440), which subsumes and confirms this plan's originally-RED tracer specs. Status reconciled `blocked` → `complete`.

## Self-Check: PASSED

All 15 tracked files exist on disk; all 4 task commits (`439f61d`, `2d74e19`, `dc46bfd`, `0affd34`) present in git history.
