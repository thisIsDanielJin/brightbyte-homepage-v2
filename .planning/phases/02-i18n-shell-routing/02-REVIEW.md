---
phase: 02-i18n-shell-routing
reviewed: 2026-08-11T00:00:00Z
depth: standard
files_reviewed: 15
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
  - messages/de.json
  - messages/en.json
  - next.config.ts
  - package.json
  - proxy.ts
  - tests/i18n/smoke.spec.ts
  - tests/invariants/no-locale-from-state.sh
findings:
  critical: 3
  warning: 3
  info: 2
  total: 8
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-08-11T00:00:00Z
**Depth:** standard
**Files Reviewed:** 15
**Status:** issues_found

## Summary

The i18n shell routing implementation covers the right surface area: path-based `/de`/`/en` routing via `proxy.ts`, hreflang metadata via `buildHreflangAlternates`, locale validation in `i18n/request.ts`, and a pure-Link `LocaleSwitcher`. The core invariants (locale from URL only, no localStorage, no client state) are correctly enforced in the production code.

Three blockers were found. The most impactful is that `proxy.ts` uses `export default` while Next.js 16 introduced `proxy.ts` with a required named export — `export default` is explicitly deprecated and the recommendation is `export function proxy(...)`. The second blocker is that `i18n/request.ts` calls `rootParams.locale()` via a namespace import (`import * as rootParams`), but `next/root-params` exports named getters matching segment names (e.g. `locale`) — the namespace import pattern is not how this API is documented and is likely to fail at runtime in Server Components. The third blocker is that the `test:invariants` script in `package.json` only runs `no-raw-hex.sh` — the `no-locale-from-state.sh` invariant gate written specifically for this phase is never executed, making the CI guard a no-op.

---

## Critical Issues

### CR-01: `proxy.ts` uses deprecated `export default` — Next.js 16 requires named `export function proxy`

**File:** `proxy.ts:24`
**Issue:** Next.js 16 renamed `middleware.ts` to `proxy.ts` and simultaneously deprecated the `export default` pattern in favour of a named export `proxy`. The upgrade guide states: *"The named export `middleware` is also deprecated. Rename your function to `proxy`."* and shows `export function proxy(request) {}` as the canonical form. The docs also state: *"We recommend changing the function name to `proxy`, even if you are using a default export"* — meaning default export still works today but is on a deprecation path. More critically, `createMiddleware` from `next-intl` returns a plain function; wrapping it in `export default` makes the export shape non-conformant with the named-export convention Next.js 16 enforces. In environments where the named export is required (not merely recommended), this will silently skip locale prefix enforcement.

**Fix:**
```ts
// proxy.ts
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const middlewareFn = createMiddleware(routing)

export function proxy(request: Parameters<typeof middlewareFn>[0]) {
  return middlewareFn(request)
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt).*)',
  ],
}
```

---

### CR-02: `i18n/request.ts` calls `rootParams.locale()` via namespace import — `next/root-params` does not support this pattern

**File:** `i18n/request.ts:14,27`
**Issue:** The code does `import * as rootParams from 'next/root-params'` and then calls `rootParams.locale()`. The Next.js 16 docs consistently show named imports: `import { lang } from 'next/root-params'` — where the exported name matches the dynamic segment folder name (`[lang]` → `lang`, `[locale]` → `locale`). The `next/root-params.d.ts` file in `node_modules` contains only `declare module 'next/root-params'` with a note that the real types are generated into `.next/types/root-params.d.ts` at build time. A namespace import (`* as rootParams`) of a module whose sole declared export is the module itself will not expose `rootParams.locale` as a callable function — it will be `undefined` at runtime, causing `paramValue` to be `undefined` and `notFound()` to be called on every valid request. The correct form is a named import resolved at build time.

**Fix:**
```ts
// i18n/request.ts
import { locale as getLocale } from 'next/root-params'  // named import matching [locale] segment
import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  if (!locale) {
    const paramValue = await getLocale()
    locale = paramValue ?? undefined
  }

  if (!locale || !hasLocale(routing.locales, locale)) {
    notFound()
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
```

---

### CR-03: `test:invariants` in `package.json` never runs `no-locale-from-state.sh` — the I18N-01 invariant gate is a dead letter

**File:** `package.json:10`
**Issue:** The `test:invariants` script is `bash tests/invariants/no-raw-hex.sh`. The `no-locale-from-state.sh` script — the file that enforces the central i18n invariant of this entire phase (D-09: locale from URL only) — is never referenced anywhere in `package.json`. The script is present on disk but is never executed by `npm test`, `npm run test:invariants`, or any other script. This means CI never validates the localStorage/useState locale anti-pattern guard, defeating the purpose of writing it.

**Fix:**
```json
"test:invariants": "bash tests/invariants/no-raw-hex.sh && bash tests/invariants/no-locale-from-state.sh"
```

---

## Warnings

### WR-01: `app/[locale]/page.tsx` — `generateMetadata` does not read locale from params, silently returns wrong language metadata for `/en`

**File:** `app/[locale]/page.tsx:24-41`
**Issue:** `generateMetadata` awaits `params` to get `locale` and uses it to look up `titles[locale]` and `descriptions[locale]`. However, `buildHreflangAlternates('/')` is called with no locale argument — it always returns the same absolute URLs (`/de` and `/en`) regardless of which locale page is being rendered. This is correct for `alternates.languages`, but the `canonical` URL emitted by `buildHreflangAlternates` is always `/de` (hardcoded in the helper). The `/en` page therefore emits `<link rel="canonical" href=".../de">`, which tells search engines to treat `/de` as the canonical for `/en` — this is incorrect. The canonical for `/en` should be `/en`.

**Fix:** Either accept a `locale` arg in `buildHreflangAlternates` and use it for `canonical`, or override `canonical` per-page:
```ts
return {
  title: titles[locale] ?? titles.de,
  description: descriptions[locale] ?? descriptions.de,
  alternates: {
    ...buildHreflangAlternates('/'),
    canonical: `${BASE_URL}/${locale}`,  // correct per-locale canonical
  },
}
```

---

### WR-02: `LocaleSwitcher.tsx` — `aria-current` value `'true'` is not a valid ARIA token for links

**File:** `components/LocaleSwitcher.tsx:48`
**Issue:** `aria-current={locale === currentLocale ? 'true' : undefined}` sets the attribute to the string `'true'`. The valid values for `aria-current` on a navigation link are `"page"`, `"step"`, `"location"`, `"date"`, `"time"`, or `true` (boolean). The string `'true'` is not one of the defined token values — it is not equivalent to the boolean `true` in ARIA semantics. Screen readers that follow the ARIA spec strictly will not announce this as the current page. The correct value for a link representing the active page/locale is `"page"`.

**Fix:**
```tsx
aria-current={locale === currentLocale ? 'page' : undefined}
```

---

### WR-03: `sitemap.ts` — `x-default` hreflang entry missing from sitemap alternates

**File:** `app/sitemap.ts:40-44`
**Issue:** The sitemap alternates only include `de` and `en` language codes. The hreflang spec and the project invariant D-05 require an `x-default` entry pointing to `/de`. The in-page `<head>` hreflang (from `buildHreflangAlternates`) correctly emits `x-default`, but the sitemap does not — creating an inconsistency between the two signals given to search engines. Googlebot reads both the sitemap and in-page hreflang; inconsistency between them can cause the `x-default` directive to be ignored.

**Fix:**
```ts
alternates: {
  languages: {
    de: deUrl,
    en: enUrl,
    'x-default': deUrl,  // D-05: x-default → /de
  },
},
```
Apply to both the `/de` and `/en` sitemap entries.

---

## Info

### IN-01: `smoke.spec.ts` test (1) — `page.goto('/')` redirect assertion may be a false positive

**File:** `tests/i18n/smoke.spec.ts:23-25`
**Issue:** Test (1) does `await page.goto('/')` then immediately asserts `expect(page.url()).toContain('/de')`. Playwright's `page.goto` follows redirects by default, so this will pass whenever the redirect lands anywhere containing `/de` in the URL, including a 404 page at `/de/not-found`. There is no assertion that the page responded with 2xx or that meaningful content loaded. This is acceptable for a smoke test but could mask a broken redirect chain that happens to end somewhere with `/de` in the path.

**Fix:** Add a status or content assertion to increase confidence:
```ts
await page.goto('/')
await page.waitForURL('**/de**')
expect(page.url()).toMatch(/\/de(\/|$)/)
await expect(page.locator('html')).toHaveAttribute('lang', 'de')
```

---

### IN-02: `no-locale-from-state.sh` comment-filter pattern is incomplete — inline comments not filtered

**File:** `tests/invariants/no-locale-from-state.sh:52,77`
**Issue:** The grep pipeline filters lines beginning with `//`, `/*`, `*`, or `<!--` to suppress comment false-positives. However, inline comments — where a real code statement is followed by `// locale comment` on the same line — are not filtered. A line like `const x = useLocale() // locale from URL` would pass the filter and not produce a false positive, which is correct. But a line like `// const foo = useState('locale')` with leading spaces before `//` would be caught by the `-vE '^\s*(//|/\*|\*|<!--)'` filter (the `\s*` prefix handles indented comments). This is actually correct behaviour. No false positive exists. This is an observation only: the pattern `^\s*(//|/\*|\*|<!--)` does correctly handle indented single-line comments.

No fix required — noted for completeness. The script is sound for its stated purpose.

---

_Reviewed: 2026-08-11T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
