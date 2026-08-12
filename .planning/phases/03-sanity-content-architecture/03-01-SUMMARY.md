---
phase: 03-sanity-content-architecture
plan: 01
subsystem: cms
tags: [sanity, next-sanity, groq, typegen, document-internationalization, i18n, stega]

# Dependency graph
requires:
  - phase: 02-i18n-shell-routing
    provides: URL-derived locale (/de,/en) that feeds the $locale GROQ param (D-10)
provides:
  - Node ≥22.12 toolchain pinned (.nvmrc) for the Sanity ecosystem
  - Installed Sanity stack (sanity 6.9.2, next-sanity 13.3.2, @sanity/client 7.26.2, doc-i18n 6.2.30, styled-components peer)
  - sanity/env.ts public config surface (projectId/dataset/apiVersion, no token)
  - Document-internationalized `service` schema + structured `price` object (D-05)
  - Embedded Studio at /studio (server layout + client host), excluded from locale proxy
  - lib/sanity/client.ts — the ONE stega:false / perspective:published read client (CMS-03)
  - lib/sanity/queries.ts — typed SERVICES_QUERY (language == $locale) + getServices(locale) (D-10 contract)
  - sanity typegen wiring (types:sanity + prebuild) → generated sanity.types.ts
affects: [04-content-sections, 06-seo-programmatic-pages]

# Actuals
actuals:
  tokens: 6000
  tasks: 11
  commits: 8

# Tech tracking
tech-stack:
  added: [sanity@6.9.2, next-sanity@13.3.2, "@sanity/client@7.26.2", "@sanity/document-internationalization@6.2.30", "@sanity/image-url", "@sanity/vision", styled-components]
  patterns:
    - "Single stega:false published read client (CMS-03 structural guarantee)"
    - "defineQuery-wrapped typed GROQ, $locale-filtered on the doc language field (D-10)"
    - "sanity typegen via sanity-typegen.json path glob (project has no src/)"
    - "Embedded Studio: server layout exports metadata/viewport, client page hosts NextStudio (Next 16 split)"

key-files:
  created:
    - lib/sanity/client.ts
    - lib/sanity/queries.ts
    - sanity-typegen.json
    - sanity.types.ts
    - app/studio/layout.tsx
    - content/tracer-services.ndjson
  modified:
    - package.json
    - .gitignore
    - app/studio/[[...tool]]/page.tsx

key-decisions:
  - "D-10 $locale-filter query contract confirmed as-is (user-resolved gate 03-01-09)"
  - "sanity-typegen.json added with path ./{app,lib,sanity}/**/*.{ts,tsx} — default ./src glob found 0 queries"
  - "schema.json gitignored (typegen intermediate); sanity.types.ts committed"
  - "Studio metadata moved to server layout.tsx (Next 16 forbids metadata export from 'use client')"
  - "SEC-03 pricing softened to concrete entry anchor (ab €1.500) + consultative full-site (Preis nach Erstgespräch) — user-approved deviation (D-05)"

patterns-established:
  - "Single-client invariant: exactly one createClient, stega:false + perspective:published + useCdn:false"
  - "Typed centralized query layer: every query in defineQuery, get*(locale) passes { locale }"

requirements-completed: [CMS-01, CMS-03]

coverage:
  - id: D1
    description: "Single stega:false / perspective:published read client (lib/sanity/client.ts)"
    requirement: CMS-03
    verification:
      - kind: other
        ref: "grep -c createClient over lib/+sanity/ → exactly 1; build output .next/server has 0 stega-range chars"
        status: pass
    human_judgment: false
  - id: D2
    description: "Typed $locale-filtered SERVICES_QUERY + getServices(locale) (lib/sanity/queries.ts); sanity.types.ts generated"
    requirement: CMS-03
    verification:
      - kind: other
        ref: "npm run types:sanity → 1 query registered in SanityQueries map; npx tsc --noEmit exit 0"
        status: pass
    human_judgment: false
  - id: D3
    description: "service DE/EN pair reads locale-correctly with D-05 price shape; npm run build green with prebuild typegen"
    requirement: CMS-01
    verification:
      - kind: integration
        ref: "authenticated published fetch: getServices('de') → [Landingpage(1500,priceFrom), Mehrseitige Website(null,onRequest)]; getServices('en') → EN pair; npm run build exit 0"
        status: pass
    human_judgment: false
  - id: D4
    description: "Anonymous (tokenless) public read of the production dataset returns published service docs"
    verification:
      - kind: integration
        ref: "tokenless GET .../data/query/production?perspective=published → currently returns []"
        status: fail
    human_judgment: true
    rationale: "Dataset aclMode is labeled 'public' but anonymous API reads return empty — a Sanity dashboard toggle (enable public API reads) is required before Phase 4's tokenless build-time reads will resolve. Cannot be toggled from code; needs the project owner in the Sanity dashboard."

# Metrics
duration: ~35min
completed: 2026-08-12
status: complete
---

# Phase 3 Plan 01: Tracer — end-to-end locale-filtered typed Sanity read Summary

**End-to-end Sanity slice proven: Node 22 + full ecosystem + embedded /studio + document-internationalized `service` schema + a single stega:false published client feeding a typed `$locale`-filtered `SERVICES_QUERY`, with `npm run build` green (prebuild typegen) and zero stega corruption.**

## Performance

- **Duration:** ~35 min (this session: tasks 10–11 + summary; tasks 01–09 by a prior executor)
- **Completed:** 2026-08-12
- **Tasks:** 11 (this session executed 10 and 11; 01–09 previously committed)
- **Files modified (this session):** 9

## Accomplishments
- `lib/sanity/client.ts` — the ONE `createClient` with `stega:false`, `perspective:'published'`, `useCdn:false` (CMS-03 structural invariant; a second client is what the Plan-03 guard forbids).
- `lib/sanity/queries.ts` — `SERVICES_QUERY = defineQuery('*[_type == "service" && language == $locale] | order(order asc){...}')` + `getServices(locale)` calling `client.fetch(SERVICES_QUERY, { locale })` (D-10 contract Phase 4 imports).
- Typegen wired: `types:sanity` (`sanity schema extract --force && sanity typegen generate`) + `prebuild`; `sanity.types.ts` generated with the query registered in the `SanityQueries` map so `client.fetch` is fully typed (no `any`).
- Authored a `service` DE/EN pair (landing + full-site) into the real `ddrca30s/production` dataset via NDJSON import, with `translation.metadata` links; proved `getServices('de')`/`getServices('en')` return locale-correct docs with the D-05 two-tier price shape.
- `npm run build` GREEN (prebuild typegen ran first, TypeScript passed, `/studio` route built); 0 stega-range chars in `.next/server`; `tsc --noEmit` green.

## Task Commits

1. **03-01-01: D-12 Node gate + .nvmrc** - `c224ca9`
2. **03-01-02: Install Sanity ecosystem** - `9f8cc81`
3. **03-01-03: Sanity env config surface** - `06cdfc2`
4. **03-01-05: price object + service schema** - `484dfb4`
5. **03-01-07: sanity.config/cli/structure + doc-i18n** - `8683f40`
6. **03-01-08: mount /studio + proxy exclusion** - `1fa0716`
7. **03-01-10: single client + typed $locale query + typegen** - `4f41969` (feat)
8. **03-01-11: tracer end-to-end green** - `b66aa2b` (feat)

(Tasks 04, 06, 09 were decision gates — no code commit.)

**Plan metadata:** (this commit, docs)

## Files Created/Modified
- `lib/sanity/client.ts` - the single stega:false published read client (CMS-03)
- `lib/sanity/queries.ts` - typed SERVICES_QUERY + getServices(locale) (D-10)
- `sanity-typegen.json` - typegen path glob (app/lib/sanity — no src/ dir)
- `sanity.types.ts` - generated types (1 query, 17 schema types)
- `app/studio/layout.tsx` - server layout exporting metadata/viewport/dynamic
- `app/studio/[[...tool]]/page.tsx` - reduced to 'use client' NextStudio host
- `content/tracer-services.ndjson` - DE/EN service pair + translation.metadata
- `package.json` - types:sanity + prebuild scripts
- `.gitignore` - schema.json (typegen intermediate)

## Decisions Made
- **D-10 confirmed as-is** — the `$locale`-filter-on-language query contract accepted by the user; no move to a translation-reference-resolution model.
- **typegen path config** — the default typegen glob is `./src/**`; this project keeps source at the repo root (`app/`, `lib/`, `sanity/`), so a `sanity-typegen.json` with `path: ./{app,lib,sanity}/**/*.{ts,tsx}` was required or typegen finds 0 queries.
- **SEC-03 pricing softening (D-05, user-approved)** — from "fixed pricing prominently displayed" to a concrete entry anchor (`ab €1.500`, `priceFrom`) plus consultative full-site pricing (`priceOnRequest`, no published number). The seeded landing service is `amount 1500 / priceFrom true / priceOnRequest false`; full-site is `amount null / priceOnRequest true`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added sanity-typegen.json (path glob) + --force on schema extract**
- **Found during:** Task 03-01-10 (typegen wiring)
- **Issue:** `sanity typegen generate` found 0 queries because its default `path` is `./src/**/*` and this repo has no `src/`. Separately, `sanity schema extract` errors if `schema.json` already exists (breaks re-runs / prebuild) without `--force`.
- **Fix:** Created `sanity-typegen.json` with `path: ./{app,lib,sanity}/**/*.{ts,tsx}`; changed the script to `sanity schema extract --force && sanity typegen generate`; gitignored the `schema.json` intermediate (kept `sanity.types.ts` committed as the plan lists it).
- **Files modified:** sanity-typegen.json, package.json, .gitignore
- **Verification:** `npm run types:sanity` reports "1 query and 17 schema types"; the query is registered in the `SanityQueries` map; `tsc --noEmit` green.
- **Committed in:** `4f41969`

**2. [Rule 1 - Bug] Split Studio metadata export into a server layout (Next 16)**
- **Found during:** Task 03-01-11 (build must be green)
- **Issue:** `app/studio/[[...tool]]/page.tsx` (authored in task 03-01-08) was a `'use client'` module that also did `export { metadata, viewport } from 'next-sanity/studio'`. Next 16 forbids exporting `metadata` from a client module — `npm run build` failed hard.
- **Fix:** Created `app/studio/layout.tsx` (Server Component) that exports `metadata`, `viewport`, and `dynamic = 'force-static'`; reduced `page.tsx` to the `'use client'` `NextStudio` host only.
- **Files modified:** app/studio/layout.tsx (new), app/studio/[[...tool]]/page.tsx
- **Verification:** `npm run build` exits 0, `/studio` route builds, `tsc --noEmit` green.
- **Committed in:** `b66aa2b`

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug). Both necessary to satisfy the plan's own acceptance criteria (typed query + green build). No scope creep.

## Issues Encountered
- **Tokenless anonymous read returns empty (open, needs dashboard action).** The `ddrca30s/production` dataset's `aclMode` is `public`, but an **unauthenticated** API query (`perspective=published`, no token) returns `[]`, while the **authenticated** identical query returns all 6 docs (all published — `_originalId: null`). This means the tracer's structural proof (build green, typed query, correct locale filtering, D-05 price shape, no stega) was verified via the authenticated published read, but the plan's intended **tokenless** read path (T-03-03, D-02) does not yet resolve for anonymous callers. Phase 4's build-time reads will need either public API reads enabled in the Sanity dashboard for this dataset, or a read token added to server-only env (NOT client-imported). This is captured as coverage deliverable **D4** (`human_judgment: true`) and must be resolved before Phase 4 renders content. It does not block this tracer's structural gate.

## User Setup Required
**One dashboard action required before Phase 4.** In the Sanity dashboard (project `ddrca30s`, dataset `production`), enable public/anonymous API reads (or decide to use a server-only read token). Verify with:
`curl -s "https://ddrca30s.api.sanity.io/v2025-08-01/data/query/production?query=*%5B_type=='service'%5D%7B_id%7D&perspective=published"` — should return the 4 service docs without an Authorization header.

## Next Phase Readiness
- The typed query layer + single stega:false client + document-i18n `service` schema are the seam Phase 4 imports. `getServices(locale)` is proven locale-correct.
- **Blocker for Phase 4:** anonymous/tokenless dataset reads (see Issues / D4) must be resolved (dashboard toggle or server-only token) before build-time content rendering.
- Expansion (testimonial, project, siteSettings, seoPage schemas; full content authoring; invariant guards) proceeds in Waves 2–3 now that the tracer is verified.

---
*Phase: 03-sanity-content-architecture*
*Completed: 2026-08-12*

## Self-Check: PASSED
- Files verified: lib/sanity/client.ts, lib/sanity/queries.ts, sanity-typegen.json, sanity.types.ts, app/studio/layout.tsx, content/tracer-services.ndjson (all FOUND)
- Commits verified: 4f41969 (task 10), b66aa2b (task 11) (both FOUND)
