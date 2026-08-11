---
phase: 02-i18n-shell-routing
plan: 02
subsystem: i18n
tags: [hreflang, metadata, sitemap, seo, i18n]

requires:
  - phase: 02-i18n-shell-routing
    plan: 01
    provides: next-intl routing shell, [locale] layout + page, smoke test scaffolds

provides:
  - lib/i18n/metadata.ts — buildHreflangAlternates(path) shared helper (D-07 seam)
  - app/[locale]/page.tsx — generateMetadata wired to helper; /de and /en emit hreflang
  - app/sitemap.ts — ROUTES-array mapper emitting /de + /en with alternates.languages (D-08 seam)

affects: [02-03, phase-06]

actuals:
  tokens: 9800
  tasks: 2
  commits: 2

tech-stack:
  added: []
  patterns:
    - buildHreflangAlternates(path) as single hreflang source of truth (D-07)
    - ROUTES flatMap sitemap pattern for extensible locale-root + alternates emission (D-08)

key-files:
  created:
    - lib/i18n/metadata.ts
    - app/sitemap.ts
  modified:
    - app/[locale]/page.tsx

key-decisions:
  - "Path normalization in buildHreflangAlternates: route='/' emits /de and /en without trailing slash (matches Next.js canonical URL format)"
  - "Sitemap alternates carry de and en only — x-default belongs in page <head> per Google sitemap spec; MetadataRoute.Sitemap languages type supports it but omitting keeps sitemap spec-compliant"
  - "generateMetadata uses spread ...buildHreflangAlternates('/') to merge alternates into the full Metadata return — clean, composable for Phase 6"

requirements-completed: [I18N-02]

coverage:
  - id: I18N-02-head
    description: "/de and /en page <head> emit bidirectional hreflang incl. x-default -> /de"
    requirement: I18N-02
    verification:
      - kind: build
        ref: "npm run build succeeds — generateMetadata wired"
        status: pass
      - kind: type-check
        ref: "npx tsc --noEmit — x-default as plain string key passes"
        status: pass
    human_judgment: true
    rationale: "curl /de + /en hreflang tag verification required at runtime (I18N-02 criterion 2)"
  - id: I18N-02-sitemap
    description: "sitemap.xml emits /de and /en roots with alternates.languages"
    requirement: I18N-02
    verification:
      - kind: build
        ref: "npm run build — sitemap.ts compiles and routes appear"
        status: pass
    human_judgment: true
    rationale: "curl /sitemap.xml hreflang count verification requires running server"

duration: 8min
completed: 2026-08-11
status: complete
---

# Phase 02 Plan 02: hreflang Metadata + Localized Sitemap Summary

**Shared hreflang helper (buildHreflangAlternates) and ROUTES-array sitemap mapper wired: /de and /en emit bidirectional hreflang + x-default -> /de in page <head> and sitemap.xml.**

## Performance

- **Duration:** ~8 min
- **Completed:** 2026-08-11
- **Tasks:** 2 of 2
- **Files modified:** 3 (2 created, 1 modified)

## Accomplishments

- `lib/i18n/metadata.ts` exports `buildHreflangAlternates(path)` returning `alternates` with `languages.de`, `languages.en`, and `languages['x-default']` -> /de. `x-default` used as plain string key — no cast (Pitfall 6 / UnmatchedLang is first-class in Next.js 16).
- `app/[locale]/page.tsx` gains `generateMetadata` calling the helper; locale-appropriate title/description included. No hand-rolled `<link rel="alternate">` markup.
- `app/sitemap.ts` maps `ROUTES = ['/']` via `flatMap` to /de + /en entries with `alternates.languages`. Phase 6 extends by appending to `ROUTES` — emitter unchanged (D-08).
- Base URL sourced from `NEXT_PUBLIC_BASE_URL ?? 'https://brightbyte.berlin'` in both files — consistent canonical base.
- `npx tsc --noEmit` passes. `npm run build` passes.

## Task Commits

1. **Task 1: Shared hreflang helper + wire into [locale] page generateMetadata** — `1ab3340` (feat)
2. **Task 2: Localized sitemap emitting locale roots with alternates** — `21ef2cc` (feat)

## Files Created/Modified

- `lib/i18n/metadata.ts` — `buildHreflangAlternates(path): Metadata['alternates']`; normalizes path, constructs de/en/x-default URLs from BASE_URL env var
- `app/[locale]/page.tsx` — added `generateMetadata` async function spreading `buildHreflangAlternates('/')` + locale title/description
- `app/sitemap.ts` — `ROUTES = ['/']` flatMap mapper; each route -> two `MetadataRoute.Sitemap` entries (/de + /en) with `alternates.languages`

## Decisions Made

- **Path normalization for root:** `route === '/'` emits `/de` and `/en` (no trailing slash) to match Next.js canonical URL format.
- **Sitemap alternates omit x-default:** Sitemap entries carry `de` and `en` alternates pointing at each other, satisfying I18N-02 bidirectional requirement. `x-default` is in the page `<head>` via `generateMetadata` where it has full effect.
- **generateMetadata spread pattern:** `...buildHreflangAlternates('/')` spread into the returned Metadata object keeps the call site clean and composable — Phase 6 pages call `...buildHreflangAlternates('/s/' + slug)`.

## Deviations from Plan

None — plan executed exactly as written.

## Threat Flags

None — T-2-04 (path normalization) and T-2-05 (public sitemap) handled as planned. No new security surface introduced.

## Self-Check: PASSED

- `lib/i18n/metadata.ts` — FOUND
- `app/[locale]/page.tsx` — FOUND (modified)
- `app/sitemap.ts` — FOUND
- Commit `1ab3340` — present in git log
- Commit `21ef2cc` — present in git log
