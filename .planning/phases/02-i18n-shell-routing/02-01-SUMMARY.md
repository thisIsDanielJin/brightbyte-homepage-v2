---
phase: 02-i18n-shell-routing
plan: 01
subsystem: i18n
tags: [next-intl, i18n, routing, proxy, locale, playwright]

requires:
  - phase: 01-identity-design-tokens
    provides: styles/tokens.css @theme token system, Plus Jakarta Sans font bridge, app/layout.tsx baseline, no-raw-hex.sh invariant

provides:
  - next-intl 4.13.6 installed and wired with createNextIntlPlugin
  - proxy.ts at project root (Next.js 16 middleware layer for locale routing)
  - i18n/routing.ts — defineRouting config (locales, defaultLocale:de, localePrefix:always, localeDetection:false)
  - i18n/request.ts — getRequestConfig with hasLocale validation (T-2-01 threat mitigation)
  - i18n/navigation.ts — createNavigation locale-aware nav primitives
  - app/[locale]/layout.tsx — root locale layout with html lang, font bridge, NextIntlClientProvider
  - app/[locale]/page.tsx — home placeholder with locale-resolved Shell.tagline
  - messages/de.json + messages/en.json — minimal shell-only strings
  - tests/i18n/smoke.spec.ts — Playwright smoke tests (1)-(3) GREEN, (4)-(6) RED until Plans 02-02/03
  - tests/invariants/no-locale-from-state.sh — static grep guard for D-09 locale-from-URL-only rule

affects: [02-02, 02-03, phase-03, phase-04, phase-05, phase-06]

actuals:
  tokens: 12500
  tasks: 3
  commits: 3

tech-stack:
  added:
    - next-intl 4.13.6 (i18n routing, messages, navigation)
  patterns:
    - proxy.ts (Next.js 16 name for middleware.ts) with createMiddleware(routing)
    - three-file config split: i18n/routing.ts + i18n/request.ts + i18n/navigation.ts
    - locale from URL params (app/[locale]/layout.tsx reads await params.locale)
    - localeDetection:false to enforce always-DE root redirect (D-05)

key-files:
  created:
    - proxy.ts
    - i18n/routing.ts
    - i18n/request.ts
    - i18n/navigation.ts
    - app/[locale]/layout.tsx
    - app/[locale]/page.tsx
    - messages/de.json
    - messages/en.json
    - tests/i18n/smoke.spec.ts
    - tests/invariants/no-locale-from-state.sh
  modified:
    - app/page.tsx (root redirect to /de)
    - next.config.ts (wired createNextIntlPlugin)
    - package.json (next-intl dependency + test:i18n script)
  deleted:
    - app/layout.tsx (flat root layout — superseded by app/[locale]/layout.tsx)

key-decisions:
  - "localeDetection:false added to routing config — prevents browser Accept-Language from overriding always-DE root redirect (D-05 enforcement)"
  - "createNextIntlPlugin wired into next.config.ts — required for getRequestConfig to be discoverable at build time (auto-fix Rule 3)"
  - "locale read from await params.locale in layout — more reliable than getLocale() in production builds where middleware context needs a full request cycle"
  - "app/layout.tsx deleted entirely — app/[locale]/layout.tsx is sole root layout (Pitfall 2)"

patterns-established:
  - "Pattern: proxy.ts at project root with createMiddleware(routing) default export (Next.js 16 Pitfall 1)"
  - "Pattern: locale-aware nav primitives always imported from @/i18n/navigation — never next/link or next/navigation directly (Pitfall 4)"
  - "Pattern: hasLocale() + notFound() in getRequestConfig validates locale against allowlist (T-2-01 threat mitigation)"

requirements-completed: [I18N-01]

coverage:
  - id: D1
    description: "/ redirects to /de (always, independent of Accept-Language)"
    requirement: I18N-01
    verification:
      - kind: e2e
        ref: "tests/i18n/smoke.spec.ts#(1) / redirects to /de"
        status: pass
    human_judgment: false
  - id: D2
    description: "/de serves DE with <html lang='de'>"
    requirement: I18N-01
    verification:
      - kind: e2e
        ref: "tests/i18n/smoke.spec.ts#(2) /de has <html lang='de'>"
        status: pass
    human_judgment: false
  - id: D3
    description: "/en serves EN with <html lang='en'>"
    requirement: I18N-01
    verification:
      - kind: e2e
        ref: "tests/i18n/smoke.spec.ts#(3) /en has <html lang='en'>"
        status: pass
    human_judgment: false
  - id: D4
    description: "Locale derived from URL segment only — no localStorage or component state"
    requirement: I18N-01
    verification:
      - kind: other
        ref: "bash tests/invariants/no-locale-from-state.sh"
        status: pass
    human_judgment: false
  - id: D5
    description: "One shell string renders per-locale from message files (DE and EN values differ)"
    requirement: I18N-01
    verification: []
    human_judgment: true
    rationale: "Visual verification needed — confirms Shell.tagline renders in correct language at /de and /en"

duration: 12min
completed: 2026-08-11
status: complete
---

# Phase 02 Plan 01: i18n Tracer Slice Summary

**next-intl 4.13.6 path-based routing fully wired: proxy.ts + three-file config, [locale] shell layout, / to /de redirect enforced, smoke tests (1)-(3) GREEN.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-08-11T13:59:18Z
- **Completed:** 2026-08-11T14:11:32Z
- **Tasks:** 3 of 3
- **Files modified:** 12 (10 created, 1 deleted, 3 modified)

## Accomplishments

- next-intl 4.13.6 installed (human-approved) and wired via createNextIntlPlugin in next.config.ts
- Three-file i18n config split (i18n/routing.ts + i18n/request.ts + i18n/navigation.ts) + proxy.ts at project root
- app/[locale]/layout.tsx replaces flat app/layout.tsx; locale from URL params; Plus Jakarta Sans font bridge and IDENT-01 body token classes preserved
- Smoke tests (1)-(3) GREEN: / redirects to /de; /de lang="de"; /en lang="en"
- Static grep guard (no-locale-from-state.sh) and test:i18n script in place for Plans 02-02/03

## Task Commits

1. **Task 1: Install next-intl + Wave 0 test scaffolds** - `06bab0a` (feat)
2. **Task 2: Three-file next-intl config + proxy.ts** - `44dff2f` (feat)
3. **Task 3: [locale] shell + root redirect (GREEN)** - `e49db90` (feat)

## Files Created/Modified

- `proxy.ts` — createMiddleware(routing) default export, matcher excludes sitemap.xml/robots.txt
- `i18n/routing.ts` — defineRouting with locales, defaultLocale:de, localePrefix:always, localeDetection:false
- `i18n/request.ts` — getRequestConfig with requestLocale + next/root-params fallback, hasLocale validation
- `i18n/navigation.ts` — createNavigation exports (Link, redirect, usePathname, useRouter, getPathname)
- `app/[locale]/layout.tsx` — root locale layout: html lang from params, font bridge, NextIntlClientProvider, generateStaticParams
- `app/[locale]/page.tsx` — home placeholder with getTranslations('Shell') rendering locale-specific tagline
- `app/layout.tsx` — DELETED (Pitfall 2: [locale]/layout.tsx is sole root layout)
- `app/page.tsx` — root redirect to /de via next/navigation redirect (D-05)
- `messages/de.json` — Shell.tagline "Webdesign fur kleine Unternehmen in Berlin." + LocaleSwitcher keys
- `messages/en.json` — Shell.tagline "Web design for small businesses in Berlin." + LocaleSwitcher keys
- `next.config.ts` — wired createNextIntlPlugin with requestConfig path
- `tests/i18n/smoke.spec.ts` — 6 Playwright tests; (1)-(3) GREEN, (4)-(6) RED until Plans 02-02/03
- `tests/invariants/no-locale-from-state.sh` — static grep guard for locale-from-URL-only rule

## Decisions Made

- `localeDetection: false` added to routing config: the plan's D-05 (always redirect to /de, ignore Accept-Language) requires this. Without it, createMiddleware uses the browser's Accept-Language header to pick the locale, and an English-language browser redirects `/` to `/en` instead of `/de`.
- `createNextIntlPlugin` wired into next.config.ts: not in the plan but required for getRequestConfig to be found at build time. Auto-fix (Rule 3).
- `locale` read from `await params.locale` in the layout instead of `getLocale()`: `getLocale()` returned the default locale in production builds. Reading from route params is reliable.
- `app/layout.tsx` deleted: the plan's Pitfall 2 guidance recommends this. `app/[locale]/layout.tsx` becomes the sole root layout.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added createNextIntlPlugin to next.config.ts**
- **Found during:** Task 3 (first build attempt)
- **Issue:** Build failed: "Couldn't find next-intl config file" — the next-intl plugin must be wired into next.config.ts for getRequestConfig to be discoverable
- **Fix:** Added `createNextIntlPlugin({ requestConfig: './i18n/request.ts' })` to next.config.ts
- **Files modified:** next.config.ts
- **Verification:** `npm run build` succeeds
- **Committed in:** e49db90 (Task 3 commit)

**2. [Rule 1 - Bug] Added localeDetection:false to routing config**
- **Found during:** Task 3 (smoke test (1) failure)
- **Issue:** Test (1) `/ redirects to /de` failed — browser Accept-Language `en` caused createMiddleware to redirect to `/en`, violating D-05
- **Fix:** Added `localeDetection: false` to `defineRouting` in i18n/routing.ts
- **Files modified:** i18n/routing.ts
- **Verification:** Smoke test (1) passes; `/` always redirects to `/de`
- **Committed in:** e49db90 (Task 3 commit)

**3. [Rule 1 - Bug] Switched locale resolution from getLocale() to params in layout**
- **Found during:** Task 3 (smoke test (3) failure — /en showing lang="de")
- **Issue:** `getLocale()` returned the defaultLocale (`de`) regardless of the requested route in production
- **Fix:** Read locale from `await params.locale` in the layout component
- **Files modified:** app/[locale]/layout.tsx
- **Verification:** Smoke test (3) passes; `/en` renders `lang="en"`
- **Committed in:** e49db90 (Task 3 commit)

---

**Total deviations:** 3 auto-fixed (1 Rule 3 blocking, 2 Rule 1 bugs)
**Impact on plan:** All auto-fixes necessary for correct routing behavior. No scope creep. localeDetection:false enforces D-05 exactly as specified.

## Issues Encountered

- Stale `next-server` processes from prior test runs were reused by Playwright (`reuseExistingServer: true`). Killed stale processes before final test runs to ensure fresh server with new build.

## Threat Flags

None — all threat register items handled:
- T-2-01: `hasLocale(routing.locales, locale)` + `notFound()` in i18n/request.ts mitigates open redirect/path traversal
- T-2-02: `localeDetection: false` — Accept-Language header never consulted
- T-2-03: locale from URL only; static guard passes

## Next Phase Readiness

- Plan 02-02: add generateMetadata hreflang helper + sitemap.ts — smoke tests (4)/(5) will flip GREEN
- Plan 02-03: add LocaleSwitcher component — smoke test (6) will flip GREEN
- All invariants passing; TypeScript compiles clean; build succeeds

---
*Phase: 02-i18n-shell-routing*
*Completed: 2026-08-11*
