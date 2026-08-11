---
phase: 02-i18n-shell-routing
plan: 03
subsystem: i18n
tags: [next-intl, locale-switcher, i18n, routing, playwright]

requires:
  - phase: 02-i18n-shell-routing
    plan: 01
    provides: i18n/navigation.ts (Link + usePathname exports), app/[locale]/layout.tsx, messages/de.json + messages/en.json (LocaleSwitcher keys), tests/invariants/no-locale-from-state.sh

provides:
  - components/LocaleSwitcher.tsx — pure <Link> path-preserving locale switcher (I18N-03)
  - app/[locale]/layout.tsx — minimal header mounting LocaleSwitcher inside NextIntlClientProvider
  - turbopack.root worktree fix in next.config.ts (worktree-only deviation)
  - smoke test (6) GREEN: switcher navigates /de → /en preserving path

affects: [phase-04]

actuals:
  tokens: 8000
  tasks: 2
  commits: 2

tech-stack:
  added: []
  patterns:
    - pure <Link> locale switcher: usePathname from @/i18n/navigation (locale-stripped) + Link with locale prop
    - useLocale() from next-intl for URL-derived active locale (never component state)
    - useTranslations('LocaleSwitcher') for locale names from message files (D-02)
    - turbopack.root path detection for git worktree builds

key-files:
  created:
    - components/LocaleSwitcher.tsx
  modified:
    - app/[locale]/layout.tsx
    - next.config.ts

key-decisions:
  - "usePathname from @/i18n/navigation — not next/navigation — returns locale-stripped path; prevents double-prefix /de/de/... (Pitfall 4)"
  - "turbopack.root set dynamically in next.config.ts: detects 'worktrees' in __dirname and resolves to main project root — fixes Turbopack node_modules resolution in git worktree (Rule 3 auto-fix)"
  - "Header uses flex justify-end p-4 with only token utilities — minimal layout placeholder for Phase 4 full chrome"

duration: 8min
completed: 2026-08-11
status: complete
---

# Phase 02 Plan 03: Language Switcher Summary

**Pure `<Link>` path-preserving locale switcher using next-intl createNavigation; mounted in minimal header inside NextIntlClientProvider; smoke test (6) GREEN.**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-08-11T14:18:46Z
- **Completed:** 2026-08-11T14:30Z
- **Tasks:** 2 of 2
- **Files modified:** 3 (1 created, 2 modified)

## Accomplishments

- Created `components/LocaleSwitcher.tsx` as `'use client'` component: imports Link + usePathname from `@/i18n/navigation`, useLocale from next-intl, iterates routing.locales, renders `<Link href={pathname} locale={locale}>` per locale with aria-current
- Locale names come from message files via `useTranslations('LocaleSwitcher')` (D-02 — no hardcoded strings)
- No useState, useReducer, localStorage, or useRouter anywhere in the component (I18N-03, D-09)
- Token utilities only: text-primary, text-secondary, hover:text-primary (IDENT-01)
- Updated `app/[locale]/layout.tsx`: added minimal `<header className="flex justify-end p-4">` inside NextIntlClientProvider containing only `<LocaleSwitcher />` (D-06)
- All Plan 01 invariants preserved: font bridge, body token classes, NextIntlClientProvider, generateStaticParams
- Smoke test (6) GREEN: switcher navigates /de → /en, lang attribute updates to "en"
- `no-locale-from-state.sh` and `no-raw-hex.sh` both pass

## Task Commits

1. **Task 1: Path-preserving LocaleSwitcher (pure Link, no state)** — `00f63a4` (feat)
2. **Task 2: Mount switcher in minimal [locale] header** — `fd3da22` (feat)

## Files Created/Modified

- `components/LocaleSwitcher.tsx` — 'use client' locale switcher, pure Link navigation, usePathname from @/i18n/navigation
- `app/[locale]/layout.tsx` — added minimal header with LocaleSwitcher inside provider
- `next.config.ts` — added turbopack.root for git worktree node_modules resolution (deviation)

## Decisions Made

- `usePathname` from `@/i18n/navigation` is mandatory: it returns the locale-stripped path. Using `next/navigation`'s version would include the locale prefix, producing `/de/de/...` double-prefix URLs (Pitfall 4).
- `turbopack.root` dynamically set to main project root when running inside a worktree (`__dirname` contains `worktrees`). Resolves to `path.resolve(__dirname, '../../..')` which is `/Users/I750579/Documents/brightbyte-homepage-v2`. Without this, Turbopack fails to find `node_modules` in the worktree.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added turbopack.root to next.config.ts for git worktree builds**
- **Found during:** Task 2 verify (`npm run build`)
- **Issue:** Build error: "Could not find the Next.js package (next/package.json)" — Turbopack's workspace root detection doesn't walk up from the worktree to find `node_modules` in the main project
- **Fix:** Added `turbopack: { root: projectRoot }` to next.config.ts, where `projectRoot` is conditionally set: if running from a worktree (`__dirname` contains `'worktrees'`), resolve three levels up to the main project root; otherwise use `__dirname`
- **Files modified:** next.config.ts
- **Verification:** `npm run build` succeeds
- **Committed in:** fd3da22 (Task 2 commit)

## Test Results

| Test | Status | Notes |
|------|--------|-------|
| (1) / redirects to /de | GREEN | Existing from Plan 01 |
| (2) /de has html lang="de" | GREEN | Existing from Plan 01 |
| (3) /en has html lang="en" | GREEN | Existing from Plan 01 |
| (4) /de bidirectional hreflang | RED | Plan 02-02 (parallel agent) — expected RED here |
| (5) /en hreflang alternates | RED | Plan 02-02 (parallel agent) — expected RED here |
| (6) Switcher /de → /en preserving path | GREEN | This plan — I18N-03 fulfilled |

Tests (4) and (5) remain RED as expected — they are owned by Plan 02-02 (hreflang/metadata), which runs in parallel and is not yet merged into this worktree.

## Invariant Status

- `bash tests/invariants/no-locale-from-state.sh` — PASS
- `bash tests/invariants/no-raw-hex.sh` — PASS
- `npx tsc --noEmit` — PASS (clean)
- `npm run build` — PASS

## Self-Check: PASSED

- `components/LocaleSwitcher.tsx` — EXISTS
- `app/[locale]/layout.tsx` — MODIFIED with header + LocaleSwitcher
- Commit `00f63a4` — EXISTS (feat: LocaleSwitcher)
- Commit `fd3da22` — EXISTS (feat: mount header + turbopack.root)
- No modifications to STATE.md, ROADMAP.md, or any files outside declared files_modified set

## Threat Flags

None — threat register items handled:
- T-2-06: useLocale() is URL-derived (next-intl server context), not component state; no client-side locale value to tamper with
- T-2-07: usePathname from @/i18n/navigation returns locale-stripped path; Link with locale prop re-prefixes exactly once — no double-prefix traversal possible

---
*Phase: 02-i18n-shell-routing*
*Completed: 2026-08-11*
