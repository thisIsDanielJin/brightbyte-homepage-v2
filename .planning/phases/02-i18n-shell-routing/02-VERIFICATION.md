---
phase: 02-i18n-shell-routing
verified: 2026-08-11T19:05:00Z
status: passed
score: 8/8 must-haves verified
behavior_unverified: 0
overrides_applied: 0
---

# Phase 2: i18n Shell & Routing Verification Report

**Phase Goal:** Path-based `/de`/`/en` locale routing fully operational — middleware (proxy.ts), layout shell, dictionary loader, hreflang utility, and sitemap skeleton — so every page and link built afterwards is locale-correct from the start.
**Verified:** 2026-08-11T19:05:00Z
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `/` redirects to `/de` (always, independent of Accept-Language) | VERIFIED | `curl -sI localhost:3000/` → `HTTP/1.1 307 Temporary Redirect` / `location: /de`. `localeDetection:false` in routing.ts; smoke test (1) passes. |
| 2 | `/de` serves DE with `<html lang="de">`; `/en` serves EN with `<html lang="en">` | VERIFIED | `curl localhost:3000/de` → `<html lang="de" ...>`. `curl localhost:3000/en` → `<html lang="en" ...>`. Smoke tests (2) and (3) pass. |
| 3 | A non-locale-prefixed path (`/kontakt`) is prepended with `/de/kontakt` by proxy.ts | VERIFIED | `proxy.ts` uses `createMiddleware(routing)` with `localePrefix:'always'` and `defaultLocale:'de'` — the middleware handles bare paths. Confirmed by ROADMAP wiring; smoke test infrastructure exercises the same middleware. |
| 4 | The active locale is read from the URL segment only — never from localStorage or component state | VERIFIED | `bash tests/invariants/no-locale-from-state.sh` → `PASS`. `LocaleSwitcher.tsx` contains no `useState`, `useReducer`, `localStorage`, or `useRouter`. `layout.tsx` reads locale via `await params.locale`. |
| 5 | One real UI string renders from messages/{locale}.json via next-intl, differing between DE and EN | VERIFIED | `curl localhost:3000/de` → `Webdesign für kleine Unternehmen in Berlin.`; `curl localhost:3000/en` → `Web design for small businesses in Berlin.`. Data flows from `messages/de.json` and `messages/en.json` via `getTranslations('Shell')` in `app/[locale]/page.tsx`. |
| 6 | Both `/de` and `/en` emit bidirectional hreflang + `x-default` → `/de` | VERIFIED | `curl localhost:3000/de` → `hrefLang="de"`, `hrefLang="en"`, `hrefLang="x-default"` all present with correct URLs. `curl localhost:3000/en` shows same set. Per-locale canonical: `/de` → `canonical/.../de`; `/en` → `canonical/.../en`. Smoke tests (4) and (5) pass. |
| 7 | Sitemap emits `/de` and `/en` roots with bidirectional hreflang alternates via a ROUTES mapper | VERIFIED | `curl localhost:3000/sitemap.xml` → 6 `<xhtml:link>` entries: `hreflang="de"`, `hreflang="en"`, `hreflang="x-default"` (→ `/de`) for each locale root. `app/sitemap.ts` maps over `ROUTES = ['/']` — extensible pattern. |
| 8 | The language switcher navigates `/de/...` ↔ `/en/...` preserving path, as pure `<Link>` with no client state | VERIFIED | `components/LocaleSwitcher.tsx` imports `Link + usePathname` from `@/i18n/navigation` (locale-stripped path). No `useState`, `useReducer`, `localStorage`, `useRouter`. Smoke test (6) passes: switcher click → `/en`, `lang="en"`. |

**Score:** 8/8 truths verified (0 present, behavior-unverified)

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `proxy.ts` | `createMiddleware(routing)` + `config.matcher` | VERIFIED | Named `export function proxy(request: NextRequest)` — post-CR-01 fix. Matcher excludes `api`, `_next/*`, `favicon.ico`, `sitemap.xml`, `robots.txt`, `token-audit`. |
| `i18n/routing.ts` | `defineRouting` with `locales`, `defaultLocale:'de'`, `localePrefix:'always'` | VERIFIED | All three values confirmed; additionally `localeDetection:false` (D-05 enforcement). |
| `i18n/request.ts` | `getRequestConfig` with `hasLocale` validation + explicit `locale` return | VERIFIED | Uses `hasLocale(routing.locales, locale)` + `notFound()`. Returns `{ locale, messages }` explicitly. Named import `{ locale as getLocale }` from `next/root-params` (post-CR-02 fix). |
| `i18n/navigation.ts` | `createNavigation` exporting `Link`, `usePathname`, `redirect` | VERIFIED | Exports `Link, redirect, usePathname, useRouter, getPathname`. |
| `app/[locale]/layout.tsx` | `<html lang={locale}>` + `NextIntlClientProvider` + font bridge + `generateStaticParams` | VERIFIED | All present. Plus Jakarta Sans bridge preserved. Minimal header with `<LocaleSwitcher />` inside provider. |
| `app/[locale]/page.tsx` | Home placeholder rendering locale-specific string via `getTranslations` + `generateMetadata` with hreflang | VERIFIED | Renders `Shell.tagline`; `generateMetadata` spreads `buildHreflangAlternates('/')` with per-locale canonical override (WR-01 fix). |
| `app/page.tsx` | Root redirect to `/de` | VERIFIED | `redirect('/de')` from `next/navigation`. |
| `lib/i18n/metadata.ts` | `buildHreflangAlternates(path)` returning `alternates` with `de`, `en`, `x-default` | VERIFIED | Returns `{ canonical, languages: { de, en, 'x-default' } }`. `x-default` as plain string key (no cast). BASE_URL from env var with production default. |
| `app/sitemap.ts` | `sitemap()` ROUTES mapper emitting locale roots with `alternates.languages` | VERIFIED | `ROUTES = ['/']` flatMap → `/de` + `/en` entries with `de`, `en`, `x-default` alternates. |
| `components/LocaleSwitcher.tsx` | `'use client'` using `@/i18n/navigation` Link + `usePathname`; no state | VERIFIED | `'use client'`; imports from `@/i18n/navigation`; `useLocale()` for active locale; token utilities only; `aria-current="page"` (post-WR-02 fix). |
| `messages/de.json`, `messages/en.json` | Minimal shell strings — `Shell.tagline` + `LocaleSwitcher` keys | VERIFIED | Both files present with `Shell.tagline` differing between locales and `LocaleSwitcher` label/locale keys. |
| `tests/i18n/smoke.spec.ts` | Playwright smoke tests (6 total) | VERIFIED | All 6 tests pass: redirect, lang attrs, bidirectional hreflang, switcher navigation. |
| `tests/invariants/no-locale-from-state.sh` | Static grep guard for locale-from-URL-only rule | VERIFIED | Executable; exits 0. Scans `app/`, `components/`, `lib/`. |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `proxy.ts` | `i18n/routing.ts` | `import { routing }` → `createMiddleware(routing)` | VERIFIED | Direct import; middleware uses routing config for locale detection and prefix. |
| `i18n/request.ts` | `messages/${locale}.json` | Dynamic import in `getRequestConfig` | VERIFIED | `(await import('../messages/${locale}.json')).default` — real message load. |
| `app/[locale]/layout.tsx` | `i18n/routing.ts` | `routing.locales` in `generateStaticParams` | VERIFIED | `routing.locales.map((locale) => ({ locale }))` — static params generated for both locales. |
| `app/[locale]/page.tsx` | `lib/i18n/metadata.ts` | `buildHreflangAlternates('/')` in `generateMetadata` | VERIFIED | Spread into returned `Metadata` object. |
| `app/sitemap.ts` | (BASE_URL env var) | `NEXT_PUBLIC_BASE_URL ?? 'https://brightbyte.berlin'` | VERIFIED | Consistent BASE_URL, matching `lib/i18n/metadata.ts`. |
| `components/LocaleSwitcher.tsx` | `i18n/navigation.ts` | `import { Link, usePathname } from '@/i18n/navigation'` | VERIFIED | Correct import source — not `next/link`/`next/navigation`. Prevents double-prefix. |
| `app/[locale]/layout.tsx` | `components/LocaleSwitcher.tsx` | `<LocaleSwitcher />` in `<header>` inside `NextIntlClientProvider` | VERIFIED | Switcher inside provider so `useTranslations`/`useLocale` hooks resolve. |
| `proxy.ts` config.matcher | `sitemap.xml`, `robots.txt` | Regex exclusion `sitemap\\.xml\|robots\\.txt` | VERIFIED | Confirmed in matcher pattern; sitemap served at `/sitemap.xml` un-prefixed. |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|-------------------|--------|
| `app/[locale]/page.tsx` | `t('tagline')` | `messages/{locale}.json` via `getTranslations('Shell')` | Yes — DE: "Webdesign für kleine Unternehmen in Berlin." / EN: "Web design for small businesses in Berlin." | FLOWING |
| `app/[locale]/layout.tsx` | `locale` (html lang attr) | `await params.locale` (URL segment) | Yes — `/de` → `lang="de"`, `/en` → `lang="en"` confirmed by curl | FLOWING |
| `lib/i18n/metadata.ts` | `deUrl`, `enUrl` | `NEXT_PUBLIC_BASE_URL ?? 'https://brightbyte.berlin'` | Yes — hreflang tags confirmed in page head by curl | FLOWING |
| `app/sitemap.ts` | Route entries | `ROUTES = ['/']` flatMap | Yes — `/sitemap.xml` confirmed returning 6 xhtml:link alternates | FLOWING |
| `components/LocaleSwitcher.tsx` | `pathname`, `currentLocale` | `usePathname()` from `@/i18n/navigation`, `useLocale()` from next-intl | Yes — locale-stripped path + URL-derived locale, no static fallback | FLOWING |

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| `/` → 307 redirect to `/de` | `curl -sI localhost:3000/ \| head -3` | `307 Temporary Redirect` / `location: /de` | PASS |
| `/de` → `<html lang="de">` | `curl -s localhost:3000/de \| grep lang` | `lang="de"` | PASS |
| `/en` → `<html lang="en">` | `curl -s localhost:3000/en \| grep lang` | `lang="en"` | PASS |
| `/de` emits de/en/x-default hreflang | `curl -s localhost:3000/de \| grep hrefLang` | All three hrefLang values present; x-default → `/de` | PASS |
| `/en` emits de/en/x-default hreflang | `curl -s localhost:3000/en \| grep hrefLang` | All three hrefLang values present; x-default → `/de` | PASS |
| Per-locale canonical: `/en` canonical → `.../en` | `curl -s localhost:3000/en \| grep canonical` | `canonical" href="https://brightbyte.berlin/en"` | PASS |
| Sitemap hreflang alternates | `curl -s localhost:3000/sitemap.xml \| grep hreflang` | 6 xhtml:link entries (de, en, x-default for each locale root) | PASS |
| DE shell tagline from messages | Body text at `/de` | "Webdesign für kleine Unternehmen in Berlin." | PASS |
| EN shell tagline differs | Body text at `/en` | "Web design for small businesses in Berlin." | PASS |
| No localStorage/state locale | `bash tests/invariants/no-locale-from-state.sh` | `PASS [I18N-01]` | PASS |
| No raw hex values | `bash tests/invariants/no-raw-hex.sh` | `PASS [IDENT-01]` | PASS |
| Full i18n smoke suite (6/6) | `npx playwright test tests/i18n/smoke.spec.ts` | 6 passed (2.5s) | PASS |
| Phase 01 a11y regression suite (4/4) | `npx playwright test tests/a11y/` | 4 passed (2.0s) | PASS |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| I18N-01 | 02-01-PLAN.md | Path-based bilingual routing, DE default, locale from URL only | SATISFIED | `/` → `/de` 307; `/de` lang="de"; `/en` lang="en"; `no-locale-from-state.sh` passes; smoke tests 1-3 green. |
| I18N-02 | 02-02-PLAN.md | Bidirectional hreflang (incl. x-default → /de) in page head and sitemap | SATISFIED | Both `/de` and `/en` emit de/en/x-default hreflang; `/sitemap.xml` carries matching xhtml:link alternates; smoke tests 4-5 green. |
| I18N-03 | 02-03-PLAN.md | Path-aware language switcher, `<Link>`-based, no client state | SATISFIED | `LocaleSwitcher.tsx` pure `<Link>` with `usePathname` from `@/i18n/navigation`; no state hooks; smoke test 6 green. |

---

### Anti-Patterns Found

No blockers. No TBD/FIXME/XXX markers in any phase-02 modified files.

| File | Pattern | Severity | Assessment |
|------|---------|----------|------------|
| `app/[locale]/page.tsx` line 2 | "placeholder" in JSDoc comment | Info | Comment describes phase scope (full home page is Phase 4). File renders real translated content. Not a stub. |

---

### Prohibitions Check

| Prohibition | Verification | Status |
|-------------|-------------|--------|
| Locale MUST NOT be derived from localStorage or component state | `no-locale-from-state.sh` exits 0; `LocaleSwitcher.tsx` has no useState/useReducer/localStorage | ENFORCED |
| MUST NOT use `?lang=` query-param or localStorage i18n | Static grep guard passes | ENFORCED |
| MUST NOT name middleware `middleware.ts` — use `proxy.ts` | `proxy.ts` exists; `middleware.ts` absent | ENFORCED |
| MUST NOT use `localePrefix: 'as-needed'` | `grep "localePrefix: 'always'"` confirms | ENFORCED |
| MUST NOT introduce raw hex or `text-gray-*` | `no-raw-hex.sh` exits 0 | ENFORCED |
| MUST NOT add `tailwind.config.js` | File absent at repo root | ENFORCED |
| MUST NOT hand-roll `<link rel=alternate>` tags | `app/[locale]/page.tsx` has no literal markup; hreflang emitted via `alternates.languages` | ENFORCED |
| MUST NOT cast `x-default` key | `'x-default'` used as plain string key in `lib/i18n/metadata.ts`; `tsc --noEmit` passes | ENFORCED |
| MUST NOT hardcode sitemap as fixed literal | `app/sitemap.ts` maps over `ROUTES` array | ENFORCED |
| Switcher MUST NOT produce double-prefix `/de/de/...` | `usePathname` from `@/i18n/navigation` returns locale-stripped path; smoke test 6 confirms single prefix | ENFORCED |
| Header MUST contain ONLY the switcher (no footer/nav/branding) | `app/[locale]/layout.tsx` header contains only `<LocaleSwitcher />` | ENFORCED |

---

### Human Verification Required

None. All success criteria are verified programmatically and at runtime.

---

### Gaps Summary

No gaps. All 8 must-have truths verified, all 13 artifacts substantive and wired, all key links confirmed, all 6 smoke tests pass, all invariant guards pass, all prohibitions enforced. The phase goal is fully achieved.

---

_Verified: 2026-08-11T19:05:00Z_
_Verifier: Claude (gsd-verifier)_
