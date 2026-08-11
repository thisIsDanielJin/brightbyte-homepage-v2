---
phase: 02-i18n-shell-routing
fixed_at: 2026-08-11T00:00:00Z
review_path: .planning/phases/02-i18n-shell-routing/02-REVIEW.md
iteration: 1
findings_in_scope: 6
fixed: 6
skipped: 0
status: all_fixed
---

# Phase 02: Code Review Fix Report

**Fixed at:** 2026-08-11T00:00:00Z
**Source review:** .planning/phases/02-i18n-shell-routing/02-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 6 (CR-01, CR-02, CR-03, WR-01, WR-02, WR-03)
- Fixed: 6
- Skipped: 0

**Verification note:** Fixes were applied and verified (Tier 1 re-read + Tier 2 JSON parse for package.json) in the isolated worktree `.claude/worktrees/rf-02-63033-1786460897`. Syntax checks for `.tsx`/`.ts` files require `tsc`, which is not available without `node_modules` in the worktree — Tier 1 re-read verification was used for those files. Full TypeScript compilation will run in the main checkout as part of the verification gates.

---

## Fixed Issues

### CR-01: `proxy.ts` — export function proxy instead of deprecated export default

**Files modified:** `proxy.ts`
**Commit:** `bd19d3f`
**Applied fix:** Replaced `export default createMiddleware(routing)` with a named `export function proxy(request: NextRequest)` wrapper that calls the middleware function. Added `import type { NextRequest } from 'next/server'` and stored the middleware as `const middlewareFn`. This matches the canonical form shown in `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`, which deprecates default export as of v16.0.0.

### CR-02: `i18n/request.ts` — named import for next/root-params instead of namespace import

**Files modified:** `i18n/request.ts`
**Commit:** `b68713b`
**Applied fix:** Replaced `import * as rootParams from 'next/root-params'` with `import { locale as getLocale } from 'next/root-params'`. Updated the call site from `await rootParams.locale()` to `await getLocale()`. The alias `getLocale` preserves Pitfall 3 avoidance (no shadowing of the `locale` variable). Confirmed against `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/next-root-params.md`: the module exports named getters matching dynamic segment folder names; namespace imports do not expose these getters as callables.

### CR-03: `package.json` — add no-locale-from-state.sh to test:invariants

**Files modified:** `package.json`
**Commit:** `426f030`
**Applied fix:** Changed `"test:invariants": "bash tests/invariants/no-raw-hex.sh"` to `"test:invariants": "bash tests/invariants/no-raw-hex.sh && bash tests/invariants/no-locale-from-state.sh"`. The `no-locale-from-state.sh` invariant gate (D-09: locale from URL only) is now executed by `npm run test:invariants` and therefore by `npm test`.

### WR-01: `app/[locale]/page.tsx` — per-locale canonical URL in generateMetadata

**Files modified:** `app/[locale]/page.tsx`
**Commit:** `36f8734`
**Applied fix:** Added `BASE_URL` to the import from `@/lib/i18n/metadata`. Changed the `alternates` return value from `buildHreflangAlternates('/')` to a spread with an overriding `canonical: \`${BASE_URL}/${locale}\``. The spread preserves all `languages` entries (de, en, x-default) from the helper while replacing the hardcoded `/de` canonical with the correct per-locale URL.

### WR-02: `components/LocaleSwitcher.tsx` — aria-current="page" instead of "true"

**Files modified:** `components/LocaleSwitcher.tsx`
**Commit:** `0486612`
**Applied fix:** Changed `aria-current={locale === currentLocale ? 'true' : undefined}` to `aria-current={locale === currentLocale ? 'page' : undefined}`. The string `'true'` is not a valid ARIA token for links; `"page"` is the correct value for indicating the active locale link to screen readers.

### WR-03: `app/sitemap.ts` — x-default hreflang entry in sitemap alternates

**Files modified:** `app/sitemap.ts`
**Commit:** `b480c71`
**Applied fix:** Added `'x-default': deUrl` to the `alternates.languages` object in both the `/de` and `/en` sitemap entries. This aligns the sitemap hreflang signal with the in-page hreflang emitted by `buildHreflangAlternates`, satisfying D-05 (x-default → /de) consistently across both signals read by Googlebot.

---

_Fixed: 2026-08-11T00:00:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
