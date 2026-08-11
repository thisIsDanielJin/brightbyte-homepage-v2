---
phase: 02-i18n-shell-routing
reviewed: 2026-08-11T00:00:00Z
depth: standard
files_reviewed: 12
files_reviewed_list:
  - app/[locale]/layout.tsx
  - app/[locale]/page.tsx
  - app/page.tsx
  - app/sitemap.ts
  - components/LocaleSwitcher.tsx
  - i18n/navigation.ts
  - i18n/request.ts
  - i18n/routing.ts
  - lib/i18n/metadata.ts
  - next.config.ts
  - proxy.ts
  - tests/i18n/smoke.spec.ts
findings:
  critical: 0
  warning: 3
  info: 4
  total: 7
status: issues_found
---

# Phase 2: Code Review Report

**Reviewed:** 2026-08-11
**Depth:** standard
**Files Reviewed:** 12 (of 13 in scope — `app/layout.tsx` was intentionally deleted in Plan 02-01 per Pitfall 2, so there is nothing to review)
**Status:** issues_found

## Summary

Second adversarial review round. The three prior-round blockers (CR-01 `proxy.ts`
export shape, CR-02 `next/root-params` namespace-vs-named import, CR-03 the
uninvoked `no-locale-from-state.sh` gate) and prior warnings (WR-01 per-locale
canonical, WR-02 `aria-current="page"`, WR-03 sitemap `x-default`) are all
confirmed fixed in the current tree and in git history — no regressions found.

API usage was re-verified against the installed packages
(`node_modules/next-intl@4.13.6`, `next/dist/server/request/root-params.*`)
rather than training-data assumptions, per AGENTS.md. The Next.js 16 / next-intl
4 surface is now correct: `export function proxy`, `createNavigation`,
`getRequestConfig` returning `locale` explicitly, the named
`import { locale as getLocale } from 'next/root-params'`, and `x-default` as a
first-class alternates key.

No Critical issues this round. Three Warnings remain, all in the
maintainability/correctness-hardening tier. The most important is that locale
validation still lives **only** in `i18n/request.ts`; the `[locale]` layout and
page consume the URL-derived `locale` without their own guard, and
`dynamicParams` is not pinned to `false` — so an unknown `/xx` segment can
render `<html lang="xx">` and a `${BASE_URL}/xx` canonical before/independently
of the request-config `notFound()`. The other two are content-sprawl and
duplicated-logic issues that will be amplified by Phase 6's ~30 programmatic
pages.

## Structural Findings (fallow)

No structural pre-pass (`<structural_findings>`) was provided with this review.

## Narrative Findings (AI reviewer)

## Warnings

### WR-01: Unvalidated `locale` from `params` reaches `<html lang>` and canonical URL (validation only in request.ts)

**File:** `app/[locale]/layout.tsx:70-73`, `app/[locale]/page.tsx:25-42`
**Issue:** Both components do `const { locale } = await params` and use the raw
value directly — `<html lang={locale}>` in the layout and
`` canonical: `${BASE_URL}/${locale}` `` in the page — with no
`hasLocale(routing.locales, locale)` check. The only allowlist validation in
the whole phase is in `i18n/request.ts` (`hasLocale` + `notFound()`), which is a
*separate* code path from the layout/page render. `generateStaticParams` returns
only `de`/`en`, but `dynamicParams` is not set to `false`, so it defaults to
`true`: Next.js renders on-demand for a segment not in the static list. A path
that survives the proxy matcher regex therefore reaches the layout with an
unvalidated `locale`, emitting `<html lang="{arbitrary}">` and canonical
`${BASE_URL}/{arbitrary}`. This is defense-in-depth the prior review missed:
the phase's own threat model (T-2-01) treats attacker-controlled locale as the
key risk, yet the rendering path relies on request.ts firing first rather than
validating structurally.
**Fix:** Pin `export const dynamicParams = false` in `app/[locale]/layout.tsx`
so unknown locales 404, and/or validate explicitly at the top of the layout:
```ts
import { hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
// ...
const { locale } = await params
if (!hasLocale(routing.locales, locale)) notFound()
```

### WR-02: SEO title/description hardcoded inline, bypassing the message-file single source of truth

**File:** `app/[locale]/page.tsx:27-38`
**Issue:** The visible tagline is read from `messages/*.json` via
`getTranslations('Shell')` — the stated D-02 rule ("no hardcoded strings") — but
`generateMetadata` hardcodes DE/EN `titles` and `descriptions` as inline
`Record<string, string>` objects keyed by locale. The two most SEO-critical
localized strings on the page thus live outside the translation system that the
rest of the code is disciplined about. It also forces the `titles[locale] ??
titles.de` fallback that a validated locale (WR-01) would make unnecessary, and
it is the pattern Phase 6's ~30 programmatic pages will copy.
**Fix:** Move title/description into `messages/*.json` (e.g. a `Meta` namespace)
and read them via `getTranslations('Meta')` in `generateMetadata`, mirroring the
`Shell.tagline` pattern already used in the component body.

### WR-03: Sitemap duplicates hreflang/BASE_URL logic and contradicts its own recorded decision

**File:** `app/sitemap.ts:21-22,40-59` (vs. `02-02-SUMMARY.md:105`)
**Issue:** Two coupled maintainability defects. (1) The sitemap hand-builds the
`de`/`en`/`x-default` URL map inline, duplicating logic already centralized in
`buildHreflangAlternates()` in `lib/i18n/metadata.ts`, and re-declares its own
`BASE_URL` constant instead of importing the shared one. The file header claims
consistency with the page `<head>` (I18N-02), but that consistency is enforced
by copy-paste, not shared code — the two default-URL constants and URL maps will
silently drift when Phase 6 appends routes. (2) The emitted `'x-default': deUrl`
directly contradicts the Plan 02-02 SUMMARY decision (line 105: "Sitemap
alternates omit x-default ... omitting keeps sitemap spec-compliant"). Code and
its own design record disagree, so a maintainer cannot tell which is intended.
(Note: WR-03 in the prior round *added* x-default to satisfy UAT — so the code
is likely correct and the SUMMARY is now stale; that still needs reconciling.)
**Fix:** Import `BASE_URL` from `lib/i18n/metadata.ts` (delete the local copy)
and derive the sitemap `languages` map from `buildHreflangAlternates(route)` so
head and sitemap share one source. Then update `02-02-SUMMARY.md` line 105 to
match the shipped x-default behavior.

## Info

### IN-01: `locale` typed as bare `string` instead of the routing `Locale` union

**File:** `app/[locale]/layout.tsx:66`, `app/[locale]/page.tsx:21`
**Issue:** `params: Promise<{ locale: string }>` uses `string`. next-intl derives
a narrowed `Locale` type from the routing config; using `string` is what forces
the untyped `Record<string, string>` lookups and `?? titles.de` fallbacks in
WR-02 and removes the compiler's ability to catch a mistyped locale key.
**Fix:** After validation, type params as the routing `Locale` union
(`params: Promise<{ locale: Locale }>`).

### IN-02: `metadataBase` and absolute per-page URLs are redundant mechanisms

**File:** `app/[locale]/layout.tsx:49-51`, `app/[locale]/page.tsx:41`, `lib/i18n/metadata.ts:29-30`
**Issue:** The layout sets `metadataBase` so relative alternates resolve to
absolute URLs, but the helper and page already build fully-absolute URLs from
`BASE_URL`, so `metadataBase` has no effect on them. Two URL-construction mental
models coexist. Not a bug, but a source of confusion for Phase 6.
**Fix:** Pick one — either drop `metadataBase` (URLs are already absolute) or
switch the helper to emit relative paths and rely on `metadataBase`.

### IN-03: `new Date()` as sitemap `lastModified` marks every route changed on every build

**File:** `app/sitemap.ts:37,49`
**Issue:** `lastModified: new Date()` stamps build time on every URL each deploy,
so crawlers always see static locale roots as freshly modified. Low impact for
two roots, but misleading and scales poorly to Phase 6 where real per-document
timestamps (Sanity `_updatedAt`) exist.
**Fix:** Use a stable/content-derived date rather than `new Date()` per render.

### IN-04: One scope file does not exist — recorded for scope accuracy

**File:** `app/layout.tsx` (listed in review scope; not present on disk)
**Issue:** `app/layout.tsx` was in the requested file list but was intentionally
deleted in Plan 02-01 (Pitfall 2: `app/[locale]/layout.tsx` is the sole root
layout). Recorded so the discrepancy is not mistaken for a missing-file defect.
**Fix:** None — informational.

---

_Reviewed: 2026-08-11_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
