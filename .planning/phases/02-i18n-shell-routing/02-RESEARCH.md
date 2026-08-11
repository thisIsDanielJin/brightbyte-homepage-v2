# Phase 2: i18n Shell & Routing — Research

**Researched:** 2026-08-11
**Domain:** Next.js 16 App Router + next-intl 4.13.6 path-based i18n routing
**Confidence:** MEDIUM (all next-intl claims are from official docs/GitHub; Next.js 16 claims are from installed node_modules docs)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Use next-intl's built-in message files (`messages/de.json`, `messages/en.json`) with `NextIntlClientProvider` and `useTranslations`/`getTranslations`. No hand-rolled custom loader.
- **D-02:** Message files are minimal, shell-only in Phase 2 — only strings the shell actually renders. No speculative namespace pre-seeding.
- **D-03:** `localePrefix` is `always` — every locale is visible in the URL (`/de/...`, `/en/...`). `/` redirects to `/de`.
- **D-04:** A path with no locale prefix → middleware prepends the default locale (`/de/kontakt`). Standard next-intl behavior.
- **D-05:** The `/` redirect target is always DE, regardless of `Accept-Language`.
- **D-06:** The `[locale]` layout is provider + minimal switcher only: `<html lang={locale}>` + `NextIntlClientProvider` + `children`, plus a minimal unstyled header holding ONLY the language switcher.
- **D-07:** hreflang via a shared `generateMetadata` helper (`lib/i18n/metadata.ts`) producing `alternates.languages = { de, en, 'x-default': /de }`. Not relying on next-intl auto-alternates.
- **D-08:** `sitemap.ts` emits just the locale roots (`/de`, `/en`) in Phase 2, structured as a reusable route → alternates mapper.
- **D-09:** A full CI smoke test: assert `<html lang>` per route, bidirectional hreflang, `/` → `/de` redirect, and a grep/static guard that no `localStorage` or component state derives the locale.

### Claude's Discretion

- Exact next-intl config surface: `i18n/routing.ts` vs `i18n/request.ts` split, middleware matcher regex, `NextIntlClientProvider` mount location.
- Exact message-file namespace shape for minimal shell strings (D-02) — keep flat and small.
- Exact switcher markup (must be `<Link>`-based, no client-side state mutation per I18N-03).
- Whether `[locale]` segment uses `generateStaticParams` for `de`/`en`.
- The `setRequestLocale`/`unstable_setRequestLocale` pattern vs. `next/root-params` approach.

### Deferred Ideas (OUT OF SCOPE)

- Full header/footer/nav chrome → Phase 4.
- Editorial/marketing copy → Phase 3 (Sanity).
- The ~30 programmatic `/s/[slug]` SEO pages + JSON-LD → Phase 6.
- Accept-Language browser detection for the root redirect → explicitly rejected.

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| I18N-01 | Path-based bilingual routing (`/de`, `/en`) with DE as default, locale derived from URL segment only (no client-side state) | next-intl `defineRouting` + `createMiddleware` + `localePrefix: 'always'` in proxy.ts + `next/root-params` for server locale access |
| I18N-02 | Correct per-URL bidirectional hreflang (incl. `x-default` → `/de`) on every page, emitted in both page `<head>` and sitemap | Next.js `alternates.languages` in `generateMetadata`; `x-default` is a first-class `HrefLang` type; sitemap `.alternates.languages` property |
| I18N-03 | Path-aware language switcher (`<Link>`-based, preserves current page) | next-intl `createNavigation` exports `Link` with `locale` prop + `usePathname` — pure `<Link>` pattern, no router state |

</phase_requirements>

---

## Summary

Phase 2 lays the i18n routing foundation that every later phase builds on. The three-file config split (`i18n/routing.ts`, `i18n/request.ts`, `i18n/navigation.ts`) is the definitive next-intl v4 pattern, confirmed against the official GitHub example repo. The middleware layer has a **critical breaking change in Next.js 16**: `middleware.ts` is deprecated and renamed to `proxy.ts`, with the function renamed from `middleware` to `proxy`. next-intl's `createMiddleware` output slots directly into this file with no code changes to the library side — only the filename and export name change.

The second major finding is that **`setRequestLocale` is superseded by `next/root-params`** in Next.js 16.3. The modern pattern (`import { locale } from 'next/root-params'`) replaces the legacy `setRequestLocale(locale)` call in every layout and page, eliminating the need to prop-drill or call a side-effectful function before using next-intl server APIs. `generateStaticParams` in `[locale]/layout.tsx` is still required, but it pairs with the root-params import rather than with `setRequestLocale`.

The third finding is that `NextIntlClientProvider` in next-intl v4 **requires no explicit `messages` prop** — it picks up messages automatically from `getRequestConfig` via React Server Component context. The `messages` prop is available for selective client-side message subsetting, but is not required for the standard case.

**Primary recommendation:** Use the `next/root-params` approach (not `setRequestLocale`) for the `[locale]` layout — it is the path next-intl's own example repo has adopted for Next.js 16.3+. File is `proxy.ts` at project root, not `middleware.ts`.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Locale detection + redirect | Frontend Server (proxy.ts) | — | next-intl middleware runs at the edge/server before route resolution; client never sees the un-prefixed URL |
| `[locale]` routing shell | Frontend Server (App Router layout) | — | `[locale]/layout.tsx` wraps every page; `html lang` and `NextIntlClientProvider` live here |
| hreflang `<head>` tags | Frontend Server (generateMetadata) | — | `generateMetadata` runs server-side; Next.js 16 emits `<link rel="alternate">` tags from `alternates.languages` |
| Sitemap hreflang | Frontend Server (sitemap.ts) | — | `app/sitemap.ts` runs at build/request time; produces `<xhtml:link>` alternates |
| Language switcher navigation | Browser / Client | Frontend Server (Link prefetch) | `usePathname` is a client hook; `<Link locale="de">` navigates on click — minimal client JS, no state |
| Message files | Frontend Server (RSC) | Browser (via NextIntlClientProvider) | Server components use `getTranslations`; client components get messages injected by provider |
| Locale source of truth | URL segment only | — | Locale is read from `params.locale` (or `next/root-params`) — never localStorage, never component state |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next-intl | 4.13.6 | i18n routing, middleware, message loading, navigation helpers | De-facto standard for App Router i18n; v4 is ESM-only, TS5+, native Next.js 16 root-params integration |

### Supporting (already installed)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next | 16.3.0 | Framework — `proxy.ts`, `generateMetadata`, `sitemap.ts`, `next/root-params` | All routing primitives |
| @playwright/test | 1.62.1 | CI smoke tests — hreflang, redirect, no-localStorage | D-09 validation |
| @axe-core/playwright | 4.12.1 | Accessibility checks on locale routes | Part of existing test suite |

**Installation:**
```bash
npm install next-intl@4.13.6
```

**Version verification:**
```
npm view next-intl version  →  4.13.6  (confirmed 2026-08-11)
```
First published: 2020-11-19. 4.9M weekly downloads.

---

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| next-intl | npm | ~5.7 yrs (2020-11) | 4.95M/wk | github.com/amannn/next-intl | SUS (too-new: v4.13.6 published 2026-08-10) | Approved with note |

**Packages removed due to SLOP verdict:** none

**Packages flagged as suspicious [SUS]:** `next-intl` [WARNING: flagged as suspicious by legitimacy gate — reason: specific version 4.13.6 published 2026-08-10 (yesterday). Package itself is a 5+ year established library with 5M weekly downloads. The `too-new` signal is a false positive caused by a recent version cut. Planner should add a `checkpoint:human-verify` task before install if desired, but the package is well-known and authoritative.] [CITED: next-intl.dev official docs + github.com/amannn/next-intl]

---

## Architecture Patterns

### System Architecture Diagram

```
HTTP request: /kontakt
      │
      ▼
┌─────────────────────────────────┐
│  proxy.ts (Next.js 16)          │  ← next-intl createMiddleware(routing)
│  localePrefix: 'always'         │
│  No locale prefix → prepend /de │
│  / → redirect /de               │
└──────────────┬──────────────────┘
               │  redirect 307 → /de/kontakt
               ▼
┌─────────────────────────────────┐
│  app/[locale]/layout.tsx        │  ← root layout for locale tree
│  generateStaticParams: [de, en] │
│  import { locale } from         │
│    'next/root-params'           │
│  <html lang={locale}>           │
│  <NextIntlClientProvider>       │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  app/[locale]/page.tsx          │  ← page (currently placeholder)
│  generateMetadata →             │
│    alternates.languages:        │
│      de: /de/kontakt            │
│      en: /en/kontakt            │
│      x-default: /de/kontakt     │
└─────────────────────────────────┘

Browser HEAD output:
  <html lang="de">
  <link rel="alternate" hreflang="de" href="…/de" />
  <link rel="alternate" hreflang="en" href="…/en" />
  <link rel="alternate" hreflang="x-default" href="…/de" />

app/sitemap.ts → /sitemap.xml
  <url><loc>/de</loc>
    <xhtml:link rel="alternate" hreflang="de" href="/de" />
    <xhtml:link rel="alternate" hreflang="en" href="/en" />
  </url>

Language switcher (in [locale] header):
  'use client'
  usePathname() → /  (locale-stripped)
  <Link href="/" locale="de">DE</Link>
  <Link href="/" locale="en">EN</Link>
  → navigates /de → /en preserving path, no state
```

### Recommended Project Structure

```
app/
├── [locale]/               # locale root — every page lives here
│   ├── layout.tsx          # root locale layout: html lang + NextIntlClientProvider + switcher
│   └── page.tsx            # home placeholder (moves here from app/page.tsx)
├── sitemap.ts              # localized sitemap with alternates.languages
├── layout.tsx              # REMOVED — superseded by [locale]/layout.tsx
└── page.tsx                # REMOVED — moves to [locale]/page.tsx
proxy.ts                    # next-intl middleware (NOT middleware.ts — Next.js 16)
i18n/
├── routing.ts              # defineRouting — locales, defaultLocale, localePrefix
├── request.ts              # getRequestConfig — locale from next/root-params + messages load
└── navigation.ts           # createNavigation — exports Link, usePathname, redirect
messages/
├── de.json                 # minimal shell strings
└── en.json                 # minimal shell strings
lib/
└── i18n/
    └── metadata.ts         # shared generateMetadata helper producing alternates.languages
```

### Pattern 1: Proxy (Middleware) Configuration

**What:** next-intl `createMiddleware` handles locale detection, `/` → `/de` redirect, and prefix enforcement.
**When to use:** All requests — the proxy runs before route resolution.

```typescript
// proxy.ts  ← CRITICAL: Next.js 16 uses proxy.ts, NOT middleware.ts
// Source: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  matcher: [
    // Match all paths except Next.js internals and static files
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
```

[CITED: next-intl.dev/docs/routing/middleware + node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md]

### Pattern 2: Routing Config (`i18n/routing.ts`)

**What:** Single source of truth for locales and prefix strategy, shared by middleware and navigation.

```typescript
// i18n/routing.ts
// Source: next-intl.dev/docs/getting-started/app-router/with-i18n-routing
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['de', 'en'],
  defaultLocale: 'de',        // D-05: always redirect to /de
  localePrefix: 'always',     // D-03: /de/... and /en/... — no prefix-less URLs
})
```

[CITED: next-intl.dev/docs/getting-started/app-router/with-i18n-routing]

### Pattern 3: Request Config (`i18n/request.ts`) with `next/root-params`

**What:** Loads locale from URL segment (via `next/root-params`) and loads message JSON. Replaces the legacy `setRequestLocale` pattern.
**When to use:** Next.js 16.3+ — this is the modern path confirmed in next-intl's own example repo.

```typescript
// i18n/request.ts
// Source: github.com/amannn/next-intl/blob/main/examples/example-app-router/src/i18n/request.ts
import * as rootParams from 'next/root-params'
import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { routing } from './routing'

export default getRequestConfig(async ({ locale }) => {
  if (!locale) {
    const paramValue = await rootParams.locale()
    if (hasLocale(routing.locales, paramValue)) {
      locale = paramValue
    } else {
      notFound()
    }
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
```

[CITED: github.com/amannn/next-intl example-app-router]

### Pattern 4: `[locale]` Layout

**What:** Root locale layout — sets `html lang`, mounts `NextIntlClientProvider`, includes minimal header with switcher.
**Key:** `generateStaticParams` enables static generation for both locales. `next/root-params` provides locale without prop drilling.

```typescript
// app/[locale]/layout.tsx
// Source: github.com/amannn/next-intl/blob/main/examples/example-app-router
import { NextIntlClientProvider } from 'next-intl'
import { getLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { Plus_Jakarta_Sans } from 'next/font/google'
import '../globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta-sans',
})

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  return (
    <html lang={locale} className={plusJakartaSans.variable}>
      <body className="bg-surface text-primary font-sans antialiased">
        <NextIntlClientProvider>
          <header>
            {/* Minimal unstyled header — switcher only (D-06) */}
            {/* Styled header is Phase 4 */}
          </header>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
```

[CITED: github.com/amannn/next-intl example-app-router + CONTEXT.md D-06]

**Note on font bridge:** The existing `app/layout.tsx` Plus Jakarta Sans setup and `@theme inline` font bridge in `globals.css` must be preserved exactly — move to `[locale]/layout.tsx`, do not recreate. [VERIFIED: app/layout.tsx:1-40 + app/globals.css:1-37]

### Pattern 5: Language Switcher (`<Link>`-based, no client state)

**What:** Pure `<Link>` switcher using `usePathname` to preserve current path. This is the pattern that satisfies I18N-03 and D-06.
**Key:** `usePathname` returns the path without locale prefix. Passing it as `href` with `locale` prop to next-intl's `Link` handles the locale swap.

```tsx
// components/LocaleSwitcher.tsx
'use client'
// Source: next-intl.dev/docs/routing/navigation#link
import { usePathname, Link } from '@/i18n/navigation'
import { useLocale } from 'next-intl'
import { routing } from '@/i18n/routing'

export default function LocaleSwitcher() {
  const pathname = usePathname()
  const currentLocale = useLocale()

  return (
    <nav aria-label="Language switcher">
      {routing.locales.map((locale) => (
        <Link
          key={locale}
          href={pathname}
          locale={locale}
          aria-current={locale === currentLocale ? 'true' : undefined}
        >
          {locale.toUpperCase()}
        </Link>
      ))}
    </nav>
  )
}
```

[CITED: next-intl.dev/docs/routing/navigation#link]

**Critical constraint:** `usePathname` is a client hook → the switcher is `'use client'`. This is unavoidable for path-preserving locale switches. The component itself is minimal; no state mutation occurs — `usePathname` reads from the router context, not from any stored state.

### Pattern 6: Navigation Helpers (`i18n/navigation.ts`)

```typescript
// i18n/navigation.ts
// Source: next-intl.dev/docs/routing/navigation
import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
```

Import `Link`, `usePathname`, `redirect` etc. from `@/i18n/navigation` throughout the app — never from `next/navigation` directly for locale-aware routing.

[CITED: next-intl.dev/docs/routing/navigation]

### Pattern 7: `generateMetadata` hreflang Helper

**What:** Shared helper producing `alternates.languages` with `x-default`. `x-default` is a first-class `HrefLang` type in Next.js 16.

```typescript
// lib/i18n/metadata.ts
// Source: node_modules/next/dist/lib/metadata/types/alternative-urls-types.d.ts:2
//         type UnmatchedLang = 'x-default'  — first-class type in Next.js 16
import type { Metadata } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://brightbyte.berlin'

export function buildHreflangAlternates(path: string): Metadata['alternates'] {
  const canonicalPath = path.startsWith('/') ? path : `/${path}`
  return {
    canonical: `${BASE_URL}/de${canonicalPath}`,
    languages: {
      'de': `${BASE_URL}/de${canonicalPath}`,
      'en': `${BASE_URL}/en${canonicalPath}`,
      'x-default': `${BASE_URL}/de${canonicalPath}`,   // D-05: x-default → /de
    },
  }
}
```

In each page's `generateMetadata`:
```typescript
export async function generateMetadata({ params }: PageProps<'/[locale]'>): Promise<Metadata> {
  return {
    ...buildHreflangAlternates('/'),
    title: '...',
  }
}
```

[VERIFIED: node_modules/next/dist/lib/metadata/types/alternative-urls-types.d.ts:2 — `type UnmatchedLang = 'x-default'`]

### Pattern 8: Localized Sitemap

**What:** `app/sitemap.ts` using the `alternates.languages` property on each entry. The `Sitemap` type supports this natively in Next.js 16.

```typescript
// app/sitemap.ts
// Source: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/sitemap.md
import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://brightbyte.berlin'

// Phase 2: only locale roots. Phase 6 extends this with /s/[slug] entries.
const ROUTES = ['/']

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.flatMap((route) => [
    {
      url: `${BASE_URL}/de${route}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 1,
      alternates: {
        languages: {
          de: `${BASE_URL}/de${route}`,
          en: `${BASE_URL}/en${route}`,
        },
      },
    },
    {
      url: `${BASE_URL}/en${route}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
      alternates: {
        languages: {
          de: `${BASE_URL}/de${route}`,
          en: `${BASE_URL}/en${route}`,
        },
      },
    },
  ])
}
```

[VERIFIED: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/sitemap.md — `alternates.languages` is a documented sitemap property with XML output confirmed]

### Pattern 9: Root-Level Redirect

**What:** `app/page.tsx` at root redirects to `/de`. This is a thin page for the case where the proxy doesn't run (static export fallback) or during local dev with no proxy.

```typescript
// app/page.tsx (root — outside [locale])
// Source: next-intl.dev/docs/routing/middleware (static export pattern)
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/de')
}
```

[CITED: next-intl.dev/docs/routing/middleware]

### Anti-Patterns to Avoid

- **`middleware.ts` filename:** Next.js 16 renamed to `proxy.ts`. Using `middleware.ts` still works (backward-compat warning) but emits a deprecation; use `proxy.ts` from the start. [VERIFIED: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md — "The `middleware` file convention is deprecated and has been renamed to `proxy`."]
- **`setRequestLocale(locale)` in layouts/pages:** Deprecated approach for Next.js 16.3+. Use `next/root-params` instead. `setRequestLocale` still exists for backward compat but is legacy.
- **`import { Link } from 'next/link'`** inside locale-aware components: Use `@/i18n/navigation` Link, which prefixes locale automatically. Using `next/link` directly produces locale-less hrefs.
- **Deriving locale from `localStorage` or component state:** The v1 anti-pattern. Locale comes exclusively from the URL segment via `next/root-params` on the server and `useParams` / route segment on the client.
- **`usePathname` from `next/navigation` in the switcher:** Use `usePathname` from `@/i18n/navigation` — it strips the locale prefix; `next/navigation`'s version returns the full path including locale.
- **Calling `getRequestConfig` without returning `locale`:** next-intl v4 requires `locale` to be explicitly returned in `getRequestConfig`. Omitting it is a breaking change from v3. [CITED: next-intl.dev/blog/next-intl-4-0]

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Locale detection + redirect | Custom redirect logic in proxy.ts | `createMiddleware(routing)` | next-intl handles `localePrefix: 'always'`, Accept-Language negotiation (even though we reject it for root), and all edge cases |
| path-preserving locale links | Manual URL string manipulation | `<Link href={pathname} locale="de">` | `createNavigation` Link handles prefix insertion/removal; hand-rolling breaks on pathnames with special chars |
| Locale validation | `if (locale === 'de' || locale === 'en')` | `hasLocale(routing.locales, locale)` | Type-safe, uses single source of truth (routing config); avoids drift if locales change |
| hreflang tag output | Manual `<link>` tags in `<head>` | `alternates.languages` in `generateMetadata` | Next.js 16 emits the correct `<link rel="alternate" hreflang="...">` tags automatically |
| sitemap hreflang | Raw XML template | `alternates.languages` in `sitemap.ts` | Next.js emits proper `xmlns:xhtml` and `<xhtml:link>` elements automatically |
| Message type safety | Untyped string keys | next-intl TypeScript types via `AppConfig` interface (auto-generated by dev server) | Compile-time key validation; prevents missing-translation runtime errors |

**Key insight:** next-intl v4 is specifically designed to be the only i18n primitive needed — routing, messages, navigation, and type safety all flow from `defineRouting`. Hand-rolling any of these bypasses the integrated type checking and cache invalidation.

---

## Common Pitfalls

### Pitfall 1: `middleware.ts` vs `proxy.ts` (Next.js 16 breaking change)
**What goes wrong:** A plan or executor creates `middleware.ts` with `export function middleware()` — this works but emits a deprecation warning and may break in future Next.js patches.
**Why it happens:** Training data and most docs reference `middleware.ts`; Next.js 16 is the first version to rename it.
**How to avoid:** Create `proxy.ts` with `export default createMiddleware(routing)` and no `middleware` named export. Run `npx @next/codemod@canary middleware-to-proxy .` if migrating.
**Warning signs:** A lint/build warning mentioning "middleware is deprecated"; check `proxy.md` in installed docs.
[VERIFIED: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md:8-11 — "The `middleware` file convention is deprecated and has been renamed to `proxy`. See Migration to Proxy for more details."]

### Pitfall 2: Forgetting to remove `app/layout.tsx` and `app/page.tsx`
**What goes wrong:** Both `app/layout.tsx` (current root layout) and `app/page.tsx` (current placeholder) exist alongside `app/[locale]/layout.tsx`. The root layout still renders — `<html lang="de">` is hardcoded, breaking the dynamic locale.
**Why it happens:** Incrementally adding the `[locale]` segment without removing the flat root layout.
**How to avoid:** Move `app/page.tsx` → `app/[locale]/page.tsx`. Replace `app/layout.tsx` with a minimal root layout that contains only `<html><body>` — or delete it entirely if `[locale]/layout.tsx` becomes the root layout.
**Warning signs:** The `<html lang>` attribute is always `"de"` regardless of locale; dev console shows two `<html>` elements.

### Pitfall 3: `next/root-params` name collision with segment name
**What goes wrong:** `import { locale } from 'next/root-params'` shadows the word `locale` in scope, causing TS errors.
**Why it happens:** The import name matches the segment name `[locale]`.
**How to avoid:** In files that also use a `locale` variable, use an alias: `import { locale as getLocale } from 'next/root-params'`.
[VERIFIED: node_modules/next/dist/docs/01-app/03-api-reference/04-functions/next-root-params.md — "The export names are generated from your dynamic segment folder names."]

### Pitfall 4: `usePathname` returning locale-prefixed path in switcher
**What goes wrong:** The switcher builds an href like `/de/about` and then adds locale prefix again → `/de/de/about`.
**Why it happens:** Using `usePathname` from `next/navigation` instead of `@/i18n/navigation`.
**How to avoid:** Import `usePathname` exclusively from `@/i18n/navigation` — it returns the locale-stripped path (`/about`, not `/de/about`).
**Warning signs:** A `/de/de/` or `/en/en/` URL appearing after a locale switch.

### Pitfall 5: `NextIntlClientProvider` missing → hooks fail silently
**What goes wrong:** Client components using `useTranslations`, `useLocale`, etc. throw an error: "No intl messages found" or similar.
**Why it happens:** `NextIntlClientProvider` not wrapping children in `[locale]/layout.tsx`.
**How to avoid:** `<NextIntlClientProvider>` wraps `children` in the locale layout, no `messages` prop needed. Verify with the React DevTools component tree.

### Pitfall 6: `x-default` type error in TypeScript
**What goes wrong:** `alternates.languages['x-default']` produces a TS error if using an outdated `@types/next` or custom type narrowing.
**Why it happens:** In Next.js <16 the type was often `Record<string, string>`. In Next.js 16, `x-default` is the typed `UnmatchedLang`.
**How to avoid:** Use `'x-default'` as a string key directly — Next.js 16's `Languages<T>` type includes it. No cast needed.
[VERIFIED: node_modules/next/dist/lib/metadata/types/alternative-urls-types.d.ts:2 — `type UnmatchedLang = 'x-default'`]

### Pitfall 7: Matcher too narrow — proxy misses non-ASCII paths
**What goes wrong:** `/kontakt` works, but paths with special characters or trailing slashes do not redirect to `/de/...`.
**Why it happens:** Overly specific `matcher` regex.
**How to avoid:** Use the next-intl recommended matcher: `'/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'`.
[CITED: next-intl.dev/docs/routing/middleware]

---

## Code Examples

### Complete `i18n/routing.ts`
```typescript
// Source: next-intl.dev/docs/getting-started/app-router/with-i18n-routing
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['de', 'en'],
  defaultLocale: 'de',
  localePrefix: 'always',
})
```

### Complete `i18n/request.ts`
```typescript
// Source: github.com/amannn/next-intl examples/example-app-router
import * as rootParams from 'next/root-params'
import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { routing } from './routing'

export default getRequestConfig(async ({ locale }) => {
  if (!locale) {
    const paramValue = await rootParams.locale()
    if (hasLocale(routing.locales, paramValue)) {
      locale = paramValue
    } else {
      notFound()
    }
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
```

### Minimal message files (Phase 2 — D-02)
```json
// messages/de.json
{
  "LocaleSwitcher": {
    "label": "Sprache",
    "de": "Deutsch",
    "en": "English"
  }
}
```
```json
// messages/en.json
{
  "LocaleSwitcher": {
    "label": "Language",
    "de": "German",
    "en": "English"
  }
}
```

### CI smoke test approach (D-09)
```typescript
// tests/i18n/smoke.spec.ts  — new file for Phase 2
import { test, expect } from '@playwright/test'

test('/ redirects to /de', async ({ page }) => {
  const response = await page.goto('/')
  expect(page.url()).toContain('/de')
})

test('/de has html lang="de"', async ({ page }) => {
  await page.goto('/de')
  const lang = await page.locator('html').getAttribute('lang')
  expect(lang).toBe('de')
})

test('/en has html lang="en"', async ({ page }) => {
  await page.goto('/en')
  const lang = await page.locator('html').getAttribute('lang')
  expect(lang).toBe('en')
})

test('/de has bidirectional hreflang including x-default', async ({ page }) => {
  await page.goto('/de')
  const deHref = await page.locator('link[hreflang="de"]').getAttribute('href')
  const enHref = await page.locator('link[hreflang="en"]').getAttribute('href')
  const xDefault = await page.locator('link[hreflang="x-default"]').getAttribute('href')
  expect(deHref).toContain('/de')
  expect(enHref).toContain('/en')
  expect(xDefault).toContain('/de')  // x-default → /de per D-05
})

test('/en hreflang points to correct alternates', async ({ page }) => {
  await page.goto('/en')
  const deHref = await page.locator('link[hreflang="de"]').getAttribute('href')
  const enHref = await page.locator('link[hreflang="en"]').getAttribute('href')
  expect(deHref).toContain('/de')
  expect(enHref).toContain('/en')
})
```

Static locale-leak guard (grep-based, in `tests/invariants/`):
```bash
#!/usr/bin/env bash
# tests/invariants/no-locale-from-state.sh
# Fails if any source file accesses localStorage for locale or derives
# locale from React state/cookie.
set -euo pipefail
FAIL=0

# No localStorage locale reads
if grep -rn "localStorage.*locale\|localStorage.*lang\|localStorage.getItem.*locale" \
     app/ components/ lib/ --include="*.ts" --include="*.tsx" 2>/dev/null; then
  echo "ERROR: localStorage locale access found" >&2
  FAIL=1
fi

# No useState/useReducer holding locale (locale must come from URL only)
if grep -rn "useState.*locale\|useReducer.*locale" \
     app/ components/ lib/ --include="*.ts" --include="*.tsx" 2>/dev/null; then
  echo "ERROR: component state storing locale found" >&2
  FAIL=1
fi

exit $FAIL
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `middleware.ts` + `export function middleware()` | `proxy.ts` + `export default createMiddleware(routing)` | Next.js 16.0.0 | All i18n middleware must be renamed; codemod available |
| `setRequestLocale(locale)` in layouts/pages | `import { locale } from 'next/root-params'` | Next.js 16.3.0 + next-intl 4.x | Eliminates side-effectful locale setup; static rendering "just works" |
| `messages` prop on `NextIntlClientProvider` | No prop needed — picked up from `getRequestConfig` | next-intl v4 | Simpler layout; no explicit message passing in the provider |
| `import 'next-intl/server'` for `setRequestLocale` | `import * as rootParams from 'next/root-params'` | next-intl v4 / Next.js 16.3 | Server-first locale resolution without side effects |
| `?lang=` query param or localStorage locale (v1) | Path-based `/de`/`/en` with `localePrefix: 'always'` | This project's v2 | SEO-correct, deterministic, no client state |

**Deprecated/outdated:**
- `setRequestLocale`: Still works, but legacy in Next.js 16.3+. next-intl docs recommend `next/root-params` for new projects.
- `middleware.ts`: Works (backward-compat) but generates a deprecation notice in Next.js 16. Use `proxy.ts`.
- `export function middleware()`: Deprecated. Named export is `proxy` in Next.js 16.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `NextIntlClientProvider` in next-intl 4.13.6 requires no explicit `messages` prop when `getRequestConfig` returns `messages` | Pattern 4, Pattern 5 | If wrong, planner must add `messages={messages}` prop to provider; requires fetching messages in layout |
| A2 | `getLocale()` from `next-intl/server` is available and equivalent to `await rootParams.locale()` for the layout's `html lang` attribute | Pattern 4 | If wrong, use `const { locale } = await params` from layout props directly |
| A3 | next-intl's `createMiddleware` is compatible with Next.js 16 proxy.ts (same underlying Next.js request/response API) | Pattern 1 | If incompatible, a newer version of next-intl may be needed; check next-intl changelog |
| A4 | `localePrefix: 'always'` with `defaultLocale: 'de'` causes middleware to redirect bare `/` to `/de` without any additional config | Pattern 1, D-03 | If wrong, a manual redirect in proxy.ts root case is needed |
| A5 | The `alternates.languages` sitemap property emits `<xhtml:link>` in Next.js 16 as shown in the docs example | Pattern 8 | If format changed, manual sitemap XML may be required |

---

## Open Questions

1. **`next/root-params` segment name: `locale` vs `[locale]`**
   - What we know: `next/root-params` exports a function named after the segment folder. `app/[locale]/` → `import { locale } from 'next/root-params'`.
   - What's unclear: The project has no `[locale]` folder yet — the import type will only be generated after the folder exists and `next dev` or `next build` runs.
   - Recommendation: Plan `next dev` as the first step in Wave 0 to trigger type generation, or accept that the import will be `any` until then.

2. **`getLocale()` vs. `await rootParams.locale()` in layout**
   - What we know: Both should return the same locale value. The official example uses `getLocale()` in the layout.
   - What's unclear: Whether `getLocale()` is internally backed by `next/root-params` in the 4.13.6 + Next.js 16.3 combination, or if there are subtle differences in the caching/static rendering path.
   - Recommendation: Use `getLocale()` from `next-intl/server` in the layout for simplicity (as the official example does); use `rootParams.locale()` in `i18n/request.ts`.

3. **`AppConfig` interface for locale type safety**
   - What we know: next-intl v4 uses a module-scoped `AppConfig` interface for typed locale/messages. This is configured in a `global.d.ts` or `next-intl.d.ts` file.
   - What's unclear: The exact setup for this with the `defineRouting` approach.
   - Recommendation: Add in Wave 1 or Wave 2 once the basic routing works; not required for the tracer slice.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | next-intl install | ✓ | v20.17.0 | — |
| npm | next-intl install | ✓ | (bundled) | — |
| @playwright/test | CI smoke tests (D-09) | ✓ | 1.62.1 | — |
| @axe-core/playwright | Existing a11y tests | ✓ | 4.12.1 | — |
| next-intl | i18n routing | ✗ (not yet installed) | — | Install in Wave 0 |

**Missing dependencies with no fallback:**
- `next-intl` — must be installed as Wave 0 step; all Phase 2 code depends on it.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Playwright 1.62.1 |
| Config file | `playwright.config.ts` (exists) |
| Quick run command | `npx playwright test tests/i18n/` |
| Full suite command | `npm test` (runs invariants + a11y) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| I18N-01 | `/` redirects to `/de` | smoke | `npx playwright test tests/i18n/smoke.spec.ts` | ❌ Wave 0 |
| I18N-01 | `/de` has `<html lang="de">` | smoke | `npx playwright test tests/i18n/smoke.spec.ts` | ❌ Wave 0 |
| I18N-01 | `/en` has `<html lang="en">` | smoke | `npx playwright test tests/i18n/smoke.spec.ts` | ❌ Wave 0 |
| I18N-01 | No localStorage locale reads | static-grep | `bash tests/invariants/no-locale-from-state.sh` | ❌ Wave 0 |
| I18N-02 | `/de` emits bidirectional hreflang + x-default | smoke | `npx playwright test tests/i18n/smoke.spec.ts` | ❌ Wave 0 |
| I18N-02 | `/en` emits bidirectional hreflang | smoke | `npx playwright test tests/i18n/smoke.spec.ts` | ❌ Wave 0 |
| I18N-03 | Switcher navigates `/de` → `/en` preserving path | smoke/e2e | `npx playwright test tests/i18n/smoke.spec.ts` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `bash tests/invariants/no-locale-from-state.sh` (fast, no server needed)
- **Per wave merge:** `npx playwright test tests/i18n/`
- **Phase gate:** Full suite green (`npm test`) before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `tests/i18n/smoke.spec.ts` — covers I18N-01, I18N-02, I18N-03
- [ ] `tests/invariants/no-locale-from-state.sh` — covers I18N-01 locale-from-URL-only guard

*(Playwright and framework already installed — no framework install needed.)*

---

## Security Domain

> `security_enforcement: true` confirmed in `.planning/config.json`; `security_asvs_level: 1`.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Not applicable — public marketing site, no auth in Phase 2 |
| V3 Session Management | No | No session; locale is in URL only (no cookie state) |
| V4 Access Control | No | No authenticated routes in Phase 2 |
| V5 Input Validation | Yes | `hasLocale(routing.locales, paramValue)` validates locale param before use; `notFound()` on invalid values |
| V6 Cryptography | No | No secrets or crypto in Phase 2 |

### Known Threat Patterns for this Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Open redirect via locale parameter | Spoofing | `hasLocale()` validates locale against allowlist — rejects arbitrary values; `notFound()` on invalid locale instead of redirecting to attacker-controlled URL |
| Header injection via `Accept-Language` | Tampering | Rejected by D-05 — `Accept-Language` is never used; locale comes from URL only |
| Path traversal in locale-prefixed redirect | Tampering | next-intl middleware validates locale against `routing.locales` allowlist before constructing redirect target |
| Locale leak via rendered HTML | Info Disclosure | Locale comes from URL segment; `html lang` reflects URL — no hidden locale state to leak |

---

## Project Constraints (from CLAUDE.md)

Directives extracted from `.claude/CLAUDE.md` that constrain Phase 2 implementation:

1. **Single styling approach:** Tailwind v4 utility classes consuming `@theme` tokens only. No SCSS, inline styles, or styled-components. The minimal switcher header uses token utilities.
2. **Zero raw hex / `text-gray-*` invariant:** Any markup added in Phase 2 must use token classes (`text-primary`, `bg-surface`, etc.).
3. **`'use client'`** is precise and explicit — only the `LocaleSwitcher` component needs it (uses `usePathname` hook); the layout itself is a Server Component.
4. **No `tailwind.config.js`:** Tailwind v4 config lives in `@theme {}` block in `styles/tokens.css`. Do not add one.
5. **`@tailwindcss/postcss`** not `tailwindcss` PostCSS plugin. Already configured — do not change.
6. **App Router only:** No Pages Router patterns. `middleware.ts` → `proxy.ts`.
7. **AGENTS.md mandate:** Read `node_modules/next/dist/docs/` before writing any Next.js code. Done for this phase — see Pitfall 1 on `proxy.ts`.
8. **next-intl `localePrefix: 'always'`** — no `as-needed` which hides the DE prefix.
9. **No `?lang=` / localStorage i18n** — the v1 anti-pattern this phase replaces.
10. **`<Canvas>` / SSR concern:** Not applicable in Phase 2 (no R3F); noted for Phase 5 continuity.

---

## Sources

### Primary (MEDIUM confidence — version-matched installed docs)
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` — proxy.ts naming, migration, matcher patterns
- `node_modules/next/dist/docs/01-app/02-guides/internationalization.md` — App Router `[locale]` pattern, `generateStaticParams`, `next/root-params` for i18n
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/sitemap.md` — `alternates.languages` sitemap property
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md` — `alternates.languages`, hreflang output format
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/next-root-params.md` — `next/root-params` API, locale getter, `generateStaticParams` interaction
- `node_modules/next/dist/lib/metadata/types/alternative-urls-types.d.ts` — `type UnmatchedLang = 'x-default'`

### Secondary (MEDIUM confidence — official docs via WebFetch)
- `next-intl.dev/docs/routing/middleware` — `createMiddleware`, matcher config, root redirect pattern
- `next-intl.dev/docs/routing/navigation` — `createNavigation`, `Link` with `locale` prop, `usePathname`
- `next-intl.dev/docs/getting-started/app-router/with-i18n-routing` — `defineRouting`, config split, `generateStaticParams`
- `github.com/amannn/next-intl/examples/example-app-router` — authoritative `request.ts`, `layout.tsx`, `LocaleSwitcher` reference implementation
- `next-intl.dev/blog/next-intl-4-0` — v4 breaking changes: ESM-only, TS5+, `hasLocale`, `AppConfig`

### Tertiary (LOW confidence — training knowledge)
- None used for factual claims in this document.

---

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM — next-intl version confirmed via npm; API patterns from official docs and reference implementation
- Architecture: MEDIUM — patterns from installed Next.js 16 docs (authoritative) and next-intl official example repo
- Pitfalls: MEDIUM — proxy.ts rename is VERIFIED from installed docs; setRequestLocale deprecation confirmed from official example repo usage

**Research date:** 2026-08-11
**Valid until:** 2026-09-11 (30 days — next-intl 4.x is actively maintained; Next.js 16.x is stable)
