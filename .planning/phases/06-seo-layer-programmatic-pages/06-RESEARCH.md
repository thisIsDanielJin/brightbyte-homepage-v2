# Phase 6: SEO Layer & Programmatic Pages — Research

**Researched:** 2026-09-03
**Domain:** Next.js 16 App Router SEO APIs, Sanity GROQ + document-i18n, JSON-LD structured data
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Enrich the `seoPage` Sanity schema with `category`, `heroHeadline`, `heroSubtext`, `faqs[]{ question, answer }`, `benefits[]`, `trustMetrics[]{ value, label }` (optional). Short fields = plain string/text; only `body` uses Portable Text.
- **D-02:** Source all 25 slugs and their EN translations from v1's `data/seo-pages.ts` — human-written copy already exists for all fields.
- **D-03:** Localized (per-locale, non-shared) EN slugs. DE slugs preserved exactly from v1. EN slugs derived from `titleEn` and require user approval before the migration script runs.
- **D-04:** Resolve counterpart-locale slug via `translation.metadata` link (the plugin creates these automatically when `seoPage` is registered). Per-page hreflang variant that takes both DE slug and EN slug, emitting `de: /de/s/<de-slug>`, `en: /en/s/<en-slug>`, `x-default: /de/s/<de-slug>`.
- **D-05:** Per `/s/[slug]` page: WebPage + FAQPage + BreadcrumbList. Homepage: ProfessionalService/LocalBusiness. Section pages: WebPage. All JSON-LD localized (`inLanguage`), sourced from Sanity with `stega: false`.
- **D-06:** Rebuild SEO landing pages to Phase 4's design bar (hero + benefits grid + FAQ accordion + trust metrics + CTA). Reuse existing Phase 4 components/patterns.
- **D-07:** One-off NDJSON migration script (`scripts/migrate-seo-pages.ts`) producing `content/seo-pages.ndjson`, imported via `sanity dataset import`. 50 docs + 25 `translation.metadata` links.

### Claude's Discretion

- Exact enriched `seoPage` field names, validation rules, `preview` config.
- Exact GROQ query additions for counterpart-slug resolution.
- `robots.ts` specifics.
- OG-image strategy for the 25 pages.
- Whether `sitemap.ts` reads from Sanity or a static list.
- Exact validators for SC #3 and SC #4.

### Deferred Ideas (OUT OF SCOPE)

- New keyword pages beyond the 25 v1 slugs.
- Blog / Insights system.
- Case studies / FAQ section / Process section.
- Live / Visual Editing.
- Industry-matched testimonial surfacing on SEO pages.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SEO-01 | Preserve v1's German programmatic SEO pages (`/s/[slug]`, 25 keyword pages) with `generateStaticParams` for all locale+slug combinations | Next.js 16 `generateStaticParams` for nested `[locale]/[slug]`, GROQ queries, NDJSON migration |
| SEO-02 | JSON-LD structured data per page | schema.org WebPage + FAQPage + BreadcrumbList shapes, `<script type="application/ld+json">` pattern in RSC, v1 emitter reference |
| SEO-03 | Complete bilingual sitemap + robots | `MetadataRoute.Sitemap` with `alternates.languages` for differing slugs, `MetadataRoute.Robots` object shape |
</phase_requirements>

---

## Summary

Phase 6 delivers three capabilities: (1) 25 bilingual `app/[locale]/s/[slug]` programmatic SEO pages sourced from Sanity via an NDJSON migration, (2) JSON-LD structured data (WebPage + FAQPage + BreadcrumbList per page, ProfessionalService on home), and (3) a complete bilingual sitemap extended to all 50 SEO-page URLs and a new `robots.ts`. The phase is primarily a data-plumbing + route-construction phase — the design bar (D-06) reuses existing Phase 4 components rather than building new ones.

The most technically intricate part is the paired-slug hreflang problem (D-04): DE and EN slugs differ, so `buildHreflangAlternates(path)` cannot be reused as-is. The per-page variant must resolve the counterpart locale's slug at build time from the `translation.metadata` GROQ join before emitting `alternates.languages`. This requires a GROQ query that joins through the translation link — documented in detail below.

The Next.js 16 breaking change that bites hardest here: `params` is now a `Promise<{ locale: string; slug: string }>` — it must be `await`ed in `generateStaticParams`, `generateMetadata`, and the page component. The existing v2 codebase already follows this pattern (confirmed in Phase 2/3 code).

**Primary recommendation:** Lead with the tracer slice — one DE + EN page pair migrated, rendered, with JSON-LD emitted and hreflang bidirectionally verified via `next start`. Unlock the remaining 24 slugs only after the tracer pair is confirmed green.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| `generateStaticParams` (50 locale×slug combos) | API/Backend (build-time RSC) | — | `generateStaticParams` runs on the server at build; fetches from Sanity; no client involvement |
| `generateMetadata` + paired hreflang | API/Backend (build-time RSC) | — | Server-only; fetches counterpart slug from Sanity; must not reach the client bundle |
| JSON-LD `<script>` tags | Frontend Server (RSC render) | — | Emitted in the server component render tree; no client-side JS needed |
| Sitemap (`app/sitemap.ts`) | API/Backend (build-time Route Handler) | — | Cached Route Handler; reads from Sanity at build |
| `robots.ts` | API/Backend (build-time Route Handler) | — | Pure server concern; no content required |
| SEO page content/layout (D-06) | Frontend Server (RSC) | Browser (FAQ accordion) | Page server component renders static layout; FAQ accordion already a `'use client'` component in Phase 4 |
| NDJSON migration script | Build tooling | — | One-time Node.js script; runs outside the Next.js runtime |
| Sanity schema enrichment | CMS | — | Schema change + `sanity typegen` regeneration |

---

## Standard Stack

### Core (all already installed — this phase adds no new npm packages)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.3.0 | `generateStaticParams`, `generateMetadata`, `MetadataRoute.Sitemap`, `MetadataRoute.Robots` | Already in project; version-matched docs read this session |
| next-sanity | 13.3.1 | `defineQuery`, `client.fetch` for all GROQ reads | Already in project; single Sanity client pattern established in Phase 3 |
| sanity | 6.9.1 | Schema `defineType`/`defineField`, Studio | Already in project |
| @sanity/document-internationalization | 6.2.29 | `translation.metadata` links between DE/EN doc pairs | Already registered for `seoPage` in `sanity.config.ts` |
| typescript | 7.0.2 | Type safety for all new query types | Already in project |

**No new npm packages required.** The phase is entirely schema extension + route construction + migration scripting using the existing stack.

### Installation

```bash
# No new packages. Verify sanity typegen runs cleanly after schema enrichment:
npx sanity typegen generate
```

---

## Package Legitimacy Audit

No new external packages are introduced in this phase. All dependencies are already installed and were audited in prior phases.

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

---

## Architecture Patterns

### System Architecture Diagram

```
v1 data/seo-pages.ts (25 entries, DE+EN fields)
        │
        ▼
scripts/migrate-seo-pages.ts
        │  produces 50 seoPage docs + 25 translation.metadata links
        ▼
content/seo-pages.ndjson
        │
        ▼ sanity dataset import
Sanity dataset (25 DE docs + 25 EN docs + 25 translation.metadata links)
        │
        ├──────────────────────────────────────────────────┐
        ▼                                                  ▼
getSeoPages(locale)                    getSeoPageBySlugWithCounterpart(locale, slug)
[generateStaticParams]                 [generateMetadata + page render]
        │                                                  │
        ▼                                                  ▼
50 { locale, slug } combos         { page fields } + { counterpartSlug }
        │                                                  │
        ▼                                                  ▼
app/[locale]/s/[slug]/page.tsx     buildHreflangAlternatesPaired(deSlug, enSlug)
        │                          alternates.languages { de, en, x-default }
        │
        ├── SeoPageLayout (Phase 4 components)
        ├── <script type="application/ld+json"> WebPage
        ├── <script type="application/ld+json"> FAQPage
        └── <script type="application/ld+json"> BreadcrumbList

app/sitemap.ts
  ├── ROUTES ['/']           → /de, /en (existing)
  └── seoPagePairs (Sanity) → /de/s/<de-slug>, /en/s/<en-slug> (new, per pair)
        each pair: alternates.languages { de: /de/s/<de-slug>, en: /en/s/<en-slug> }

app/robots.ts  →  User-Agent: * / Allow: / / Sitemap: <BASE_URL>/sitemap.xml
```

### Recommended Project Structure

```
app/
├── [locale]/
│   └── s/
│       └── [slug]/
│           └── page.tsx         # NEW — SEO page route
├── sitemap.ts                   # EXTEND — add SEO page pairs
└── robots.ts                    # NEW — greenfield
sanity/
└── schemaTypes/
    └── seoPage.ts               # ENRICH — add category, heroHeadline, etc.
lib/
├── i18n/
│   └── metadata.ts              # EXTEND — add buildHreflangAlternatesPaired()
├── sanity/
│   └── queries.ts               # EXTEND — enrich SEO queries, add counterpart resolution
└── jsonld/
    └── seoPage.ts               # NEW — JSON-LD emitter functions (pure TS, no JSX)
scripts/
└── migrate-seo-pages.ts         # NEW — NDJSON migration script
content/
└── seo-pages.ndjson             # NEW — generated by migration script
```

---

## Pattern 1: `generateStaticParams` for nested `[locale]/s/[slug]`

**What:** Return all 50 locale×slug combinations from a single Sanity fetch at build.

**Exact signature in Next.js 16.3.0** [VERIFIED: node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-static-params.md:124-146]:
- For route `app/products/[category]/[product]/page.tsx`, `generateStaticParams` returns `{ category: string; product: string }[]`
- `params` in the page component is `Promise<{ category: string; product: string }>` — must be `await`ed

For `app/[locale]/s/[slug]/page.tsx`:

```typescript
// Source: node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-static-params.md
// stega: false invariant — client is already configured with stega: false (CMS-03)
export async function generateStaticParams() {
  const locales = ['de', 'en'] as const
  const allPairs: { locale: string; slug: string }[] = []

  for (const locale of locales) {
    const pages = await getSeoPages(locale) // language == $locale filter (D-10)
    for (const page of pages) {
      if (page.slug?.current) {
        allPairs.push({ locale, slug: page.slug.current })
      }
    }
  }
  return allPairs
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params  // MUST await — Next.js 16 breaking change
  // ...
}

export default async function SeoPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params  // MUST await
  // ...
}
```

**Critical note:** The `[locale]` segment is already a dynamic segment handled by `next-intl` middleware. The `generateStaticParams` in `app/[locale]/s/[slug]/page.tsx` returns BOTH dimensions. Next.js 16 docs [VERIFIED: line 392-425] confirm: for multi-segment routes, the child page's `generateStaticParams` can provide params for all ancestor segments, OR a parent layout can provide them top-down. The simplest approach here is bottom-up from the page: return all `{ locale, slug }` pairs directly.

**`dynamicParams = false`:** Add `export const dynamicParams = false` to the route so any non-seeded slug → 404 rather than dynamic render. [ASSUMED: this is best practice for preserving-only phases; no runtime slug generation needed]

---

## Pattern 2: Paired-slug hreflang helper

**What:** A variant of `buildHreflangAlternates` that takes explicit DE and EN slug strings rather than a single shared path.

**The problem:** The existing `buildHreflangAlternates(path)` [VERIFIED: lib/i18n/metadata.ts:27-40] assumes identical paths for both locales. DE slug `website-fuer-aerzte` and EN slug `websites-for-doctors` are different — so the helper must be extended.

```typescript
// Add to lib/i18n/metadata.ts
// Source: lib/i18n/metadata.ts current shape (VERIFIED this session)
export function buildHreflangAlternatesPaired(
  deSlug: string,
  enSlug: string,
): Metadata['alternates'] {
  const deUrl = `${BASE_URL}/de/s/${deSlug}`
  const enUrl = `${BASE_URL}/en/s/${enSlug}`
  return {
    canonical: deUrl,       // D-04: canonical → /de (German-first, Phase 2 D-05)
    languages: {
      de: deUrl,
      en: enUrl,
      'x-default': deUrl,   // D-04: x-default → /de
    },
  }
}
```

**TypeScript type confirmation:** `'x-default'` is a first-class `UnmatchedLang` type in the installed Next.js version [VERIFIED: node_modules/next/dist/lib/metadata/types/alternative-urls-types.d.ts:2]: `type UnmatchedLang = 'x-default'`. No cast needed.

---

## Pattern 3: GROQ counterpart-slug resolution

**What:** Fetch a seoPage doc AND its paired counterpart locale's slug in a single GROQ query, using the `translation.metadata` reference.

**The `translation.metadata` NDJSON shape** [VERIFIED: content/brightbyte.ndjson:5]:
```json
{
  "_id": "translation.metadata.service.landing",
  "_type": "translation.metadata",
  "schemaTypes": ["service"],
  "translations": [
    { "_key": "de", "value": { "_type": "reference", "_ref": "service.landing.de" } },
    { "_key": "en", "value": { "_type": "reference", "_ref": "service.landing.en" } }
  ]
}
```

The counterpart-slug query for a DE page (to find its EN counterpart slug, and vice versa):

```groq
// For a given locale + slug, fetch the doc AND resolve the counterpart slug via
// the translation.metadata link.
*[_type == "seoPage" && language == $locale && slug.current == $slug][0]{
  _id,
  title,
  slug,
  heading,
  heroHeadline,
  heroSubtext,
  metaDescription,
  category,
  faqs[]{ question, answer },
  benefits[]{ text },
  trustMetrics[]{ value, label },
  "counterpartSlug": *[
    _type == "translation.metadata" &&
    schemaTypes[] match "seoPage" &&
    references(^._id)
  ][0].translations[_key == $counterpartLocale][0].value->slug.current
}
```

Where `$counterpartLocale` is `'en'` when `$locale == 'de'` and vice versa. In code:

```typescript
export const SEO_PAGE_BY_SLUG_WITH_COUNTERPART_QUERY = defineQuery(
  `*[_type == "seoPage" && language == $locale && slug.current == $slug][0]{
     _id, title, slug, heading, heroHeadline, heroSubtext,
     metaDescription, category,
     faqs[]{ question, answer },
     benefits[]{ text },
     trustMetrics[]{ value, label },
     "counterpartSlug": *[
       _type == "translation.metadata" &&
       count(schemaTypes[@ match "seoPage"]) > 0 &&
       references(^._id)
     ][0].translations[_key == $counterpartLocale][0].value->slug.current
   }`,
)

export function getSeoPageBySlugWithCounterpart(
  locale: string,
  slug: string,
) {
  const counterpartLocale = locale === 'de' ? 'en' : 'de'
  return client.fetch(SEO_PAGE_BY_SLUG_WITH_COUNTERPART_QUERY, {
    locale,
    slug,
    counterpartLocale,
  })
}
```

**Fallback:** If `counterpartSlug` resolves to `null` (counterpart doc not yet imported), fall back to the same slug string for hreflang rather than crashing the build. The planner should note this as a defensive guard.

---

## Pattern 4: JSON-LD emitter in a Next.js 16 RSC

**What:** Three `<script type="application/ld+json">` tags in the server component render.

**Pattern** [VERIFIED: daniel-jin-studio-homepage/components/seo/SeoPageJsonLd.tsx — read this session]:

```typescript
// lib/jsonld/seoPage.ts — pure TS, no JSX; return JSON objects
export function buildWebPageLd(
  title: string,
  description: string,
  url: string,
  locale: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url,
    inLanguage: locale === 'de' ? 'de-DE' : 'en-US',
    isPartOf: {
      '@type': 'WebSite',
      name: 'BrightByte Berlin',
      url: BASE_URL,
    },
    provider: {
      '@type': 'ProfessionalService',
      name: 'BrightByte Berlin',
      url: BASE_URL,
      areaServed: { '@type': 'City', name: 'Berlin' },
    },
  }
}

export function buildFaqPageLd(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }
}

export function buildBreadcrumbLd(
  pageTitle: string,
  pageUrl: string,
  locale: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: pageTitle, item: pageUrl },
    ],
  }
}
```

In the server component:

```typescript
// app/[locale]/s/[slug]/page.tsx (server component — no 'use client')
<>
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }}
  />
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageLd) }}
  />
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
  />
  <SeoPageLayout page={page} locale={locale} />
</>
```

**Why `dangerouslySetInnerHTML`:** This is the correct RSC pattern for JSON-LD. There is no XSS risk because the data comes from Sanity (a controlled server-side source) and is JSON-serialized (no HTML injection). The v1 emitter uses this exact pattern [VERIFIED: SeoPageJsonLd.tsx:73-87].

**`FAQPage` requires structured faqs array:** Google's Rich Results Test validates that `mainEntity[]` has `Question` items each with `acceptedAnswer.text`. If FAQs are stored in flat prose (not `faqs[]`), `FAQPage` rich results fail. This is why D-01 keeps FAQs as a discrete array — the constraint is not arbitrary.

---

## Pattern 5: `MetadataRoute.Sitemap` with differing-slug alternates

**Current `app/sitemap.ts` shape** [VERIFIED: app/sitemap.ts:1-63 — read this session]: Uses a `ROUTES` array + `flatMap` emitter. The comment explicitly says "Phase 6 extends this array with '/s/[slug]' entries — no changes to the emitter below." However, the current emitter hard-codes `deUrl = BASE_URL + '/de' + suffix` and `enUrl = BASE_URL + '/en' + suffix` — assuming identical suffix for both locales. SEO pages have different slugs, so the emitter cannot be extended via the ROUTES array without modification.

**Resolution:** The SEO-page branch in `sitemap.ts` must be handled separately from the `ROUTES.flatMap` emitter, since the slug differs per locale. The cleanest approach is to fetch slug pairs from Sanity and flatMap over them:

```typescript
// app/sitemap.ts — extended for Phase 6
import type { MetadataRoute } from 'next'
import { client } from '@/lib/sanity/client'
import { defineQuery } from 'next-sanity'
import { BASE_URL } from '@/lib/i18n/metadata'

// Fetch all DE docs + their EN counterpart slug in one query
const SEO_SLUG_PAIRS_QUERY = defineQuery(
  `*[_type == "seoPage" && language == "de"]{
     "deSlug": slug.current,
     "enSlug": *[
       _type == "translation.metadata" &&
       count(schemaTypes[@ match "seoPage"]) > 0 &&
       references(^._id)
     ][0].translations[_key == "en"][0].value->slug.current
   }`,
)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = ROUTES.flatMap(/* existing emitter */)

  const pairs = await client.fetch(SEO_SLUG_PAIRS_QUERY)
  const seoEntries = pairs.flatMap((pair) => {
    const deUrl = `${BASE_URL}/de/s/${pair.deSlug}`
    const enUrl = `${BASE_URL}/en/s/${pair.enSlug ?? pair.deSlug}` // fallback
    return [
      {
        url: deUrl,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
        alternates: { languages: { de: deUrl, en: enUrl, 'x-default': deUrl } },
      },
      {
        url: enUrl,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
        alternates: { languages: { de: deUrl, en: enUrl, 'x-default': deUrl } },
      },
    ]
  })

  return [...staticEntries, ...seoEntries]
}
```

**`MetadataRoute.Sitemap` type** [VERIFIED: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/sitemap.md:400-416]:
```typescript
type Sitemap = Array<{
  url: string
  lastModified?: string | Date
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
  alternates?: { languages?: Languages<string> }
}>
```

`'x-default'` is a valid key in `Languages<string>` [VERIFIED: alternative-urls-types.d.ts:2-6]. No cast needed.

**Async sitemap:** The current `sitemap.ts` is synchronous. Adding the Sanity fetch makes it async — change the signature to `async function sitemap(): Promise<MetadataRoute.Sitemap>`. The docs [VERIFIED: sitemap.md:44] confirm `sitemap.js` is cached by default, so an async Sanity read at build is fine.

**v16.0.0 change** [VERIFIED: sitemap.md version history line "v16.0.0 — `id` is now a promise that resolves to a string"]: This applies only to `generateSitemaps`, not the standard `sitemap()` function. Not relevant here.

---

## Pattern 6: `MetadataRoute.Robots`

**Object shape** [VERIFIED: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/robots.md:176-197]:
```typescript
type Robots = {
  rules: { userAgent?: string | string[]; allow?: string | string[]; disallow?: string | string[] }
    | Array<{ userAgent: string | string[]; allow?: ...; disallow?: ... }>
  sitemap?: string | string[]
  host?: string
}
```

```typescript
// app/robots.ts — greenfield
import type { MetadataRoute } from 'next'
import { BASE_URL } from '@/lib/i18n/metadata'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
```

No disallow needed — all public routes are indexable. The Studio is at `/studio` but is gated by Sanity auth (not a content page); optionally disallow `/studio/` if preferred, but not required.

**v16.3.0 addition** [VERIFIED: robots.md:199-204]: `other` field for non-standard directives. Not needed here.

---

## Pattern 7: NDJSON migration script shape

**Authoritative NDJSON reference** [VERIFIED: content/brightbyte.ndjson:1-27 — read this session]:

DE doc:
```json
{"_id":"seoPage.webentwickler-berlin.de","_type":"seoPage","language":"de","title":"...",
 "slug":{"_type":"slug","current":"webentwickler-berlin"},"heading":"...","heroHeadline":"...",
 "heroSubtext":"...","metaDescription":"...","category":"service",
 "faqs":[{"_key":"0","question":"...","answer":"..."}],
 "benefits":[{"_key":"0","text":"..."}],
 "trustMetrics":[{"_key":"0","value":"...","label":"..."}]}
```

EN doc:
```json
{"_id":"seoPage.webentwickler-berlin.en","_type":"seoPage","language":"en","title":"...",
 "slug":{"_type":"slug","current":"web-developer-berlin"},"heading":"...","heroHeadline":"...",
 "heroSubtext":"...","metaDescription":"...","category":"service",
 "faqs":[{"_key":"0","question":"...","answer":"..."}],
 "benefits":[{"_key":"0","text":"..."}]}
```

translation.metadata link (mirrors exact NDJSON shape [VERIFIED: content/brightbyte.ndjson:5]):
```json
{"_id":"translation.metadata.seoPage.webentwickler-berlin",
 "_type":"translation.metadata","schemaTypes":["seoPage"],
 "translations":[
   {"_key":"de","value":{"_type":"reference","_ref":"seoPage.webentwickler-berlin.de"}},
   {"_key":"en","value":{"_type":"reference","_ref":"seoPage.webentwickler-berlin.en"}}
 ]}
```

**Notes:**
- Array items require a `_key` field in Sanity NDJSON — use the array index as string.
- `trustMetrics` is optional in v1 [VERIFIED: seo-pages.ts:16 — `trustMetrics?: { value: string; label: string; labelEn: string }[]`]. Omit the field entirely on docs where v1 has no `trustMetrics`.
- `heading` in the current thin schema maps to `heroHeadline` in the enriched schema — the migration script uses the v1 `heroHeadline`/`heroHeadlineEn` field as the new `heroHeadline`.
- EN slugs are PENDING user approval (D-03 gate). The migration script must not run until the EN slug list is approved.

---

## Pattern 8: seoPage schema enrichment

**Current thin schema** [VERIFIED: sanity/schemaTypes/seoPage.ts:1-62 — read this session]:
Fields: `title`, `slug`, `heading`, `body` (PT array), `metaDescription`, `language` (hidden).

**Enriched schema additions** (Claude's Discretion — following Sanity v6 `defineField` conventions matching Phase 3):

```typescript
// Additional fields to add to the existing seoPage schema:
defineField({ name: 'category', type: 'string',
  options: { list: ['service', 'industry', 'need', 'location'] },
  validation: (R) => R.required() }),
defineField({ name: 'heroHeadline', type: 'string' }),
defineField({ name: 'heroSubtext', type: 'text', rows: 6 }),
defineField({ name: 'ctaText', type: 'string' }),
defineField({
  name: 'faqs', type: 'array',
  of: [{ type: 'object', fields: [
    defineField({ name: 'question', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'answer', type: 'text', rows: 3, validation: (R) => R.required() }),
  ]}]
}),
defineField({
  name: 'benefits', type: 'array',
  of: [{ type: 'object', fields: [
    defineField({ name: 'text', type: 'string', validation: (R) => R.required() }),
  ]}]
}),
defineField({
  name: 'trustMetrics', type: 'array',
  of: [{ type: 'object', fields: [
    defineField({ name: 'value', type: 'string' }),
    defineField({ name: 'label', type: 'string' }),
  ]}]
}),
```

**`heading` field decision:** The existing thin schema has `heading` and the Phase 3 code used it. After enrichment, `heroHeadline` replaces the role of `heading`. Two options: (a) keep `heading` for backward compat and deprecate it, or (b) rename to `heroHeadline`. Given no existing documents in Sanity (confirmed in CONTEXT.md), removing `heading` and using `heroHeadline` is the cleanest approach. [ASSUMED: no migration needed for existing docs since dataset has 0 seoPage docs currently]

**`body` field:** Keep it — the thin schema already has it and it may be used for supplementary prose later. It satisfies D-01's "genuinely long-form prose uses Portable Text."

---

## Pattern 9: GROQ query extension

**Current queries** [VERIFIED: lib/sanity/queries.ts:64-82 — read this session]:
- `SEO_PAGES_QUERY` — selects `_id, title, slug, heading, body, metaDescription`
- `SEO_PAGE_BY_SLUG_QUERY` — same fields

**Required additions/replacements:**

1. `SEO_PAGES_QUERY` — extend field selection to include all enriched fields for `generateStaticParams` (only slug needed there, but the same query can serve the listing page too).

2. Replace `SEO_PAGE_BY_SLUG_QUERY` with `SEO_PAGE_BY_SLUG_WITH_COUNTERPART_QUERY` (see Pattern 3) for use in `generateMetadata` and the page render.

3. Add `SEO_SLUG_PAIRS_QUERY` for `sitemap.ts` (see Pattern 5).

---

## v1 Content Source — Complete Field Inventory

**Source:** [VERIFIED: ~/Documents/daniel-jin-studio-homepage/data/seo-pages.ts:1-17 — read this session]

```typescript
export type SeoPage = {
  slug: string;
  category: "service" | "industry" | "need" | "location";
  title: string;
  titleEn: string;
  metaDescription: string;
  metaDescriptionEn: string;
  heroHeadline: string;
  heroHeadlineEn: string;
  heroSubtext: string;
  heroSubtextEn: string;
  faqs: { q: string; a: string; qEn: string; aEn: string }[];
  ctaText: string;
  ctaTextEn: string;
  benefits: { text: string; textEn: string }[];
  trustMetrics?: { value: string; label: string; labelEn: string }[];
};
```

**Fields present on ALL 25 pages (non-optional in the TS type):**
- `slug`, `category`, `title`, `titleEn`, `metaDescription`, `metaDescriptionEn`
- `heroHeadline`, `heroHeadlineEn`, `heroSubtext`, `heroSubtextEn`
- `faqs[]` (at least 4 items per page, each with `q`, `a`, `qEn`, `aEn`)
- `ctaText`, `ctaTextEn`
- `benefits[]` (4 items per page)

**Optional / sparse field:**
- `trustMetrics[]` — typed as `?` in TS type; present on some pages, absent on others. Migration script must check for existence before including.

**Category distribution** (from reading the file):
- `service`: `webentwickler-berlin`, `seo-optimierung-berlin`, and others
- `industry`: `website-fuer-aerzte`, `website-fuer-restaurants`, `website-fuer-startups`, `website-fuer-anwaelte`, `website-fuer-immobilien`, and others
- `location`: `webdesign-mitte`, `webdesign-kreuzberg`, `webdesign-charlottenburg`, `webdesign-prenzlauer-berg`, `webdesign-friedrichshain`, `webdesign-neukoelln`, and others
- `need`: `website-relaunch-berlin`, `landing-page-erstellen`, `schnelle-website`, and others

**ctaText field note:** `ctaText`/`ctaTextEn` is present in v1 `SeoPage` type [VERIFIED: seo-pages.ts:13-14] but not in the current thin v2 schema. It should be added as a `string` field.

**v1 OG image strategy** [VERIFIED: ~/Documents/daniel-jin-studio-homepage/app/s/[slug]/page.tsx:8-32 — read this session]: v1 uses a `seoImageMap` keyed on slug for 16 specific slugs, falling back to a `categoryImageMap` for the remaining 9 slugs. The images live at `/images/seo/*.jpg`. For v2, the planner should decide: (a) copy these static images into the v2 `public/images/seo/` directory and reuse the same slug-keyed fallback strategy, or (b) use a single default OG image for all SEO pages. [ASSUMED: option (a) reuse is lower effort and preserves social sharing; option (b) is simpler to implement]

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| hreflang emission in `<head>` | Custom `<link rel="alternate">` injection | `generateMetadata` `alternates.languages` object | Next.js 16 emits the `<link>` tags from the metadata object — no manual head manipulation |
| Sitemap XML serialization | String-building XML | `MetadataRoute.Sitemap` + `app/sitemap.ts` | Next.js handles serialization, namespace injection (`xmlns:xhtml`), and `x-default` in sitemap output automatically |
| `robots.txt` string | Hardcoded string file | `app/robots.ts` with `MetadataRoute.Robots` | Type-safe, validated, cached Route Handler |
| translation link queries | Custom `_ref` traversal logic | GROQ `->` dereference operator | GROQ's `->` resolves references natively; no application-layer join needed |
| JSON-LD XSS sanitization | Custom escaping | `JSON.stringify()` | JSON.stringify output cannot contain `<script>` injection — valid for server-rendered content from a trusted CMS |

**Key insight:** Next.js 16's metadata API handles all `<head>` SEO tags declaratively. The only manual HTML is the JSON-LD `<script>` blocks, which use `dangerouslySetInnerHTML` with `JSON.stringify` output — the same pattern used in every well-maintained Next.js JSON-LD implementation.

---

## Common Pitfalls

### Pitfall 1: Not awaiting `params` — the #1 Next.js 16 landmine

**What goes wrong:** `const { locale, slug } = params` (without `await`) silently passes a Promise object as a string, producing `[object Promise]` slugs. Build succeeds but pages 404 at runtime.

**Why it happens:** Next.js 15+ changed `params` from a synchronous object to `Promise<{ ... }>` [VERIFIED: generate-static-params.md:28-33 and generate-metadata.md:58-63]. Every page and layout must `await params`.

**How to avoid:** `const { locale, slug } = await params` in every consumer: `generateStaticParams` (when using parent params), `generateMetadata`, and the page default export.

**Warning signs:** Slug values that look like `[object Promise]` in logs, or all SEO pages returning 404.

---

### Pitfall 2: stega tokens corrupting slugs in generateStaticParams / generateMetadata

**What goes wrong:** If `stega: true` were set on the client, Sanity's Content Lake stega-encodes string values with invisible zero-width characters. Slugs like `website-fuer-aerzte` become `website‌-fuer‌-aerzte` (with zero-width joiners embedded) — URL lookup fails, `generateStaticParams` returns bad slugs.

**Why it happens:** stega is enabled by default in `createClient` when not explicitly disabled.

**How to avoid:** The project's `lib/sanity/client.ts` has `stega: false` as a hard invariant [VERIFIED: lib/sanity/client.ts:32]. Never create a second client without `stega: false`. CMS-03 enforced.

**Warning signs:** 404s on all SEO pages despite correct data in Studio; slug values in console logs contain invisible characters.

---

### Pitfall 3: FAQPage JSON-LD rejected by Rich Results Test — flat prose in `answer.text`

**What goes wrong:** Google's Rich Results Test fails validation if `acceptedAnswer.text` contains HTML markup, Portable Text block objects, or truncated prose. It expects a plain-text string.

**Why it happens:** If `answer` were stored as Portable Text, the query result would be a block array, not a string. `JSON.stringify(blockArray)` produces `[{"_type":"block",...}]` which is not valid `answer.text`.

**How to avoid:** D-01 stores `faqs[].answer` as `type: 'text'` (plain multiline text), not `type: 'array'` of blocks. The migration script maps v1's `faq.a` string directly. The GROQ query selects `faqs[]{ question, answer }` as plain strings. No PT-to-text serialization needed.

**Warning signs:** Rich Results Test returns "FAQPage missing required properties" or "answer.text is not a string."

---

### Pitfall 4: Sitemap emitter assumes identical DE/EN paths

**What goes wrong:** The current `ROUTES.flatMap` emitter in `sitemap.ts` constructs `enUrl = BASE_URL + '/en' + suffix`, where `suffix` is the same for both locales. For SEO pages with different DE and EN slugs, this produces invalid hreflang entries in the sitemap (e.g., `/en/s/website-fuer-aerzte` which doesn't exist).

**Why it happens:** The Phase 2 sitemap was designed for identical paths (`/de/` and `/en/` have the same suffix). SEO pages break this assumption.

**How to avoid:** Fetch slug pairs from Sanity in `sitemap.ts` and emit SEO-page entries outside the `ROUTES.flatMap` loop (see Pattern 5). The sitemap must be made `async` to support the Sanity fetch.

**Warning signs:** `curl https://brightbyte.berlin/sitemap.xml` shows `/en/s/<de-slug>` URLs that return 404.

---

### Pitfall 5: NDJSON array items missing `_key`

**What goes wrong:** `sanity dataset import` silently accepts NDJSON without `_key` on array items, but Studio renders them with warnings and GROQ array filtering (`[_key == "..."]`) may behave unexpectedly.

**Why it happens:** Sanity requires `_key` on all array items for stable React reconciliation and GROQ filtering.

**How to avoid:** The migration script assigns `_key: String(index)` (or a slug-derived key) to each `faqs[]`, `benefits[]`, and `trustMetrics[]` item. Mirror the Phase 3 NDJSON pattern [VERIFIED: content/brightbyte.ndjson — all doc types use explicit `_key` on array items].

**Warning signs:** Studio shows "Missing key" warnings; GROQ `[_key == ...]` filters return no results.

---

### Pitfall 6: `translation.metadata` link not using `schemaTypes: ["seoPage"]` — GROQ join misses

**What goes wrong:** The counterpart-slug GROQ query joins through `*[_type == "translation.metadata" && count(schemaTypes[@ match "seoPage"]) > 0 && references(^._id)]`. If the migration script uses `schemaTypes: ["service"]` instead of `schemaTypes: ["seoPage"]`, the join query finds nothing.

**Why it happens:** Copy-paste from the `service` migration seed.

**How to avoid:** The NDJSON migration script must emit `"schemaTypes": ["seoPage"]` on all `translation.metadata` links. Mirror the existing NDJSON pattern exactly [VERIFIED: content/brightbyte.ndjson:5 — `"schemaTypes":["service"]` for service docs].

---

### Pitfall 7: DE slugs renamed or "improved"

**What goes wrong:** Renaming a DE slug breaks existing Google rankings — the 25 German slugs are a ranking moat built over time in v1.

**Why it happens:** Developers instinctively clean up slug inconsistencies (e.g., `webdesign-neukoelln` → `webdesign-neukölln`).

**How to avoid:** The migration script reads slugs verbatim from v1's `seoPages` array. Never modify DE slugs. The 25 DE slugs are locked constants [VERIFIED: 06-CONTEXT.md:67 — full list enumerated].

---

### Pitfall 8: sitemap.ts becoming dynamic at request time

**What goes wrong:** If `sitemap.ts` imports a function that reads `headers()` or `cookies()`, Next.js opts the Route Handler out of static caching and the sitemap is generated per-request — slow and unnecessary.

**Why it happens:** The `lib/sanity/client.ts` already uses `useCdn: false` and `perspective: 'published'` [VERIFIED: client.ts:26-29]. These are safe for build-time reads. The risk would come from importing `headers()` from `next/headers` in the sitemap path.

**How to avoid:** `sitemap.ts` imports only from `@/lib/sanity/client` and `@/lib/sanity/queries`. Do not import from `next/headers` or `next/cookies` in the sitemap path.

---

## Code Examples

### generateStaticParams + generateMetadata (complete tracer shape)

```typescript
// app/[locale]/s/[slug]/page.tsx
// Source: node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-static-params.md
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSeoPages } from '@/lib/sanity/queries'
import { getSeoPageBySlugWithCounterpart } from '@/lib/sanity/queries'
import { buildHreflangAlternatesPaired } from '@/lib/i18n/metadata'
import { BASE_URL } from '@/lib/i18n/metadata'

export const dynamicParams = false // 404 for any slug not in generateStaticParams

export async function generateStaticParams() {
  const locales = ['de', 'en'] as const
  const all: { locale: string; slug: string }[] = []
  for (const locale of locales) {
    const pages = await getSeoPages(locale)
    for (const page of pages) {
      if (page.slug?.current) all.push({ locale, slug: page.slug.current })
    }
  }
  return all
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const page = await getSeoPageBySlugWithCounterpart(locale, slug)
  if (!page) return {}

  const deSlug = locale === 'de' ? slug : (page.counterpartSlug ?? slug)
  const enSlug = locale === 'en' ? slug : (page.counterpartSlug ?? slug)

  return {
    title: page.title,
    description: page.metaDescription,
    alternates: buildHreflangAlternatesPaired(deSlug, enSlug),
    openGraph: {
      title: page.title,
      description: page.metaDescription ?? '',
      url: `${BASE_URL}/${locale}/s/${slug}`,
      locale: locale === 'de' ? 'de_DE' : 'en_US',
      type: 'website',
    },
  }
}
```

### NDJSON migration script structure

```typescript
// scripts/migrate-seo-pages.ts
import { seoPages } from '../src/data-mirror/seo-pages' // or import from v1 path
import fs from 'fs'

// EN slug derivation (user-approved list gates this script)
const EN_SLUGS: Record<string, string> = {
  'webentwickler-berlin': 'web-developer-berlin',
  // ... (25 entries — requires user approval before script runs)
}

const lines: string[] = []

for (const page of seoPages) {
  const deId = `seoPage.${page.slug}.de`
  const enId = `seoPage.${page.slug}.en`
  const enSlug = EN_SLUGS[page.slug]
  if (!enSlug) throw new Error(`No EN slug approved for ${page.slug}`)

  const deDoc = {
    _id: deId, _type: 'seoPage', language: 'de',
    title: page.title,
    slug: { _type: 'slug', current: page.slug },
    heroHeadline: page.heroHeadline,
    heroSubtext: page.heroSubtext,
    metaDescription: page.metaDescription,
    ctaText: page.ctaText,
    category: page.category,
    faqs: page.faqs.map((f, i) => ({ _key: String(i), question: f.q, answer: f.a })),
    benefits: page.benefits.map((b, i) => ({ _key: String(i), text: b.text })),
    ...(page.trustMetrics
      ? { trustMetrics: page.trustMetrics.map((t, i) => ({ _key: String(i), value: t.value, label: t.label })) }
      : {}),
  }

  const enDoc = {
    _id: enId, _type: 'seoPage', language: 'en',
    title: page.titleEn,
    slug: { _type: 'slug', current: enSlug },
    heroHeadline: page.heroHeadlineEn,
    heroSubtext: page.heroSubtextEn,
    metaDescription: page.metaDescriptionEn,
    ctaText: page.ctaTextEn,
    category: page.category,
    faqs: page.faqs.map((f, i) => ({ _key: String(i), question: f.qEn, answer: f.aEn })),
    benefits: page.benefits.map((b, i) => ({ _key: String(i), text: b.textEn })),
  }

  const metaLink = {
    _id: `translation.metadata.seoPage.${page.slug}`,
    _type: 'translation.metadata',
    schemaTypes: ['seoPage'],
    translations: [
      { _key: 'de', value: { _type: 'reference', _ref: deId } },
      { _key: 'en', value: { _type: 'reference', _ref: enId } },
    ],
  }

  lines.push(JSON.stringify(deDoc), JSON.stringify(enDoc), JSON.stringify(metaLink))
}

fs.writeFileSync('content/seo-pages.ndjson', lines.join('\n') + '\n')
console.log(`Wrote ${seoPages.length * 2} docs + ${seoPages.length} translation links`)
```

Import command:
```bash
npx sanity dataset import content/seo-pages.ndjson production --replace
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `getStaticPaths` + sync params | `generateStaticParams` + `await params` | Next.js 13 (App Router); params became Promise in Next.js 15+ | All page/metadata functions must `await params` |
| `sitemap.xml` static file | `app/sitemap.ts` Route Handler with `MetadataRoute.Sitemap` | Next.js 13.3 | Type-safe sitemap; localization support via `alternates.languages` added in v14.2 |
| `robots.txt` static file | `app/robots.ts` Route Handler with `MetadataRoute.Robots` | Next.js 13.3 | `other` non-standard directives added in v16.3.0 |
| v1's `?lang=en` query param i18n | Path-based `/de/s/<slug>` and `/en/s/<en-slug>` | v2 architecture decision | SEO improvement: each locale has its own crawlable URL |

**Deprecated/outdated in this phase:**
- The thin `seoPage` schema (`heading`, `body` only) — superseded by the enriched schema. `heading` field removed since no existing docs exist in the dataset.
- v1's `buildHreflangAlternates('/s/' + slug)` pattern — works only for identical paths; SEO pages with differing slugs require the new `buildHreflangAlternatesPaired(deSlug, enSlug)`.

---

## Verification Architecture (SC #2/#3/#4)

All SC verification happens on a real Vercel preview or `next start`, NOT `next dev`.

### SC #2: JSON-LD via Google Rich Results Test

- URL: https://search.google.com/test/rich-results
- Test each locale of the tracer page: `https://preview.vercel.app/de/s/webentwickler-berlin` and `/en/s/web-developer-berlin`
- Expected pass: FAQPage rich result with all 4 Q&A pairs; WebPage detected; BreadcrumbList detected
- Common failure: `answer.text` is not a string → check that `faqs[].answer` is stored as `type: 'text'`, not PT

### SC #3: Sitemap validation

- Fetch: `curl https://<preview-url>/sitemap.xml`
- Validate via https://www.xml-sitemaps.com/validate-xml-sitemap.html (free, no account needed) [ASSUMED: specific validator choice; planner should confirm]
- Check that SEO-page entries have `<xhtml:link rel="alternate" hreflang="de">` and `<xhtml:link rel="alternate" hreflang="en">` with different href values for SEO pages
- Alternative: `npx sitemap-validator https://<preview-url>/sitemap.xml` [ASSUMED: package existence; verify before including in plan]

### SC #4: Bidirectional hreflang via curl

After deploy to a Vercel preview:

```bash
# Test DE page — should list de, en, x-default hreflang
curl -s https://<preview-url>/de/s/webentwickler-berlin | \
  grep -o 'hreflang="[^"]*"' | sort

# Expected output:
# hreflang="de"
# hreflang="en"
# hreflang="x-default"

# Test EN page — same three tags with swapped URLs
curl -s https://<preview-url>/en/s/web-developer-berlin | \
  grep -o 'hreflang="[^"]*"' | sort

# Expected: same three keys; hreflang="de" href must point to /de/s/webentwickler-berlin
# hreflang="en" href must point to /en/s/web-developer-berlin
# hreflang="x-default" href must point to /de/s/webentwickler-berlin

# Test cross-reference completeness:
# The DE page must reference the EN page; the EN page must reference the DE page.
# Each page lists ALL locales (including itself) — bidirectionality is correct.
curl -s https://<preview-url>/de/s/webentwickler-berlin | \
  grep -E 'hreflang|href.*s/'
```

**Bidirectionality rule:** Google requires that if page A has `hreflang="en"` pointing to page B, then page B must have `hreflang="de"` pointing back to page A. The `buildHreflangAlternatesPaired` helper satisfies this by including both locales in every page's `alternates.languages`.

**x-default rule** (Phase 2 D-05): `x-default` always points to the `/de/s/<de-slug>` URL. Confirmed in both `buildHreflangAlternates` and the new `buildHreflangAlternatesPaired`.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | migration script, `sanity dataset import` | Yes (project running) | — | — |
| Sanity CLI | `sanity dataset import content/seo-pages.ndjson` | [ASSUMED] needs check | — | Can install: `npm install -g sanity` |
| `next start` | SC #3/#4 verification | Yes (local) | — | Vercel preview deploy |
| Vercel preview | SC #2 (Rich Results Test needs public URL) | [ASSUMED] project is on Vercel | — | Use ngrok or `npx localtunnel` to tunnel `next start` |

**Missing dependencies with no fallback:** None.

**Missing dependencies with fallback:**
- Sanity CLI: if not globally installed, use `npx sanity dataset import ...` (works without global install).
- Public URL for Rich Results Test: `next start` on localhost is not testable via Rich Results Test; Vercel preview deploy is required for SC #2.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Playwright (already in project from Phase 4) |
| Config file | `playwright.config.ts` (exists) |
| Quick run command | `npx playwright test tests/seo/ --project=chromium` |
| Full suite command | `npx playwright test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SEO-01 | `/de/s/webentwickler-berlin` renders 200, not 404 | smoke | `npx playwright test tests/seo/seo-pages.spec.ts -g "renders DE tracer"` | ❌ Wave 0 |
| SEO-01 | `/en/s/web-developer-berlin` renders 200, not 404 | smoke | `npx playwright test tests/seo/seo-pages.spec.ts -g "renders EN tracer"` | ❌ Wave 0 |
| SEO-01 | `generateStaticParams` returns 50 entries | unit | `npx vitest tests/unit/seo-static-params.test.ts` (if vitest present) | ❌ Wave 0 |
| SEO-02 | `<script type="application/ld+json">` with FAQPage present on DE page | DOM | `npx playwright test tests/seo/seo-pages.spec.ts -g "FAQPage JSON-LD"` | ❌ Wave 0 |
| SEO-02 | FAQPage has at least 1 Question item | DOM | same spec | ❌ Wave 0 |
| SEO-03 | `/sitemap.xml` returns 200 and contains `/de/s/webentwickler-berlin` | smoke | `npx playwright test tests/seo/sitemap.spec.ts` | ❌ Wave 0 |
| SEO-03 | sitemap entry has `xhtml:link` with differing de/en slugs | DOM/parse | same spec | ❌ Wave 0 |
| SEO-03 | `/robots.txt` returns 200 and contains sitemap reference | smoke | `npx playwright test tests/seo/robots.spec.ts` | ❌ Wave 0 |
| I18N-02 | DE page `<head>` contains `hreflang="x-default"` → `/de/s/` | DOM | `npx playwright test tests/seo/seo-pages.spec.ts -g "hreflang x-default"` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npx playwright test tests/seo/ --project=chromium`
- **Per wave merge:** `npx playwright test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `tests/seo/seo-pages.spec.ts` — covers SEO-01, SEO-02, I18N-02 (render, JSON-LD, hreflang)
- [ ] `tests/seo/sitemap.spec.ts` — covers SEO-03 sitemap
- [ ] `tests/seo/robots.spec.ts` — covers SEO-03 robots.txt
- [ ] Playwright must be run against `next start` (not `next dev`) for sitemap/robots tests

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — |
| V3 Session Management | no | — |
| V4 Access Control | no | — |
| V5 Input Validation | yes | `stega: false` + `JSON.stringify` for JSON-LD; no user input reaches JSON-LD |
| V6 Cryptography | no | — |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| JSON-LD injection via CMS content | Tampering | Data flows from Sanity server-side; `JSON.stringify()` output cannot break out of `<script>` tag as HTML injection |
| stega token leakage into public HTML | Information Disclosure | `stega: false` hard invariant on `lib/sanity/client.ts` (CMS-03) [VERIFIED: client.ts:32] |
| NDJSON import of malformed data | Tampering | Migration script validates EN slug approval gate before writing; `sanity dataset import --replace` is idempotent |
| OG image path traversal | Tampering | OG image path is constructed server-side from a slug-keyed static map — no user input |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `sanity dataset import` CLI available or installable via npx | Environment Availability | Migration import fails; workaround: install `sanity` globally first |
| A2 | Rich Results Test requires a publicly accessible URL (cannot use localhost) | Verification Architecture | SC #2 cannot be run until Vercel preview deploy; must sequence after deploy task |
| A3 | Sitemap XML validator at xml-sitemaps.com is available and free | Verification Architecture | Alternative validator needed; `xmllint --noout` with the sitemap XSD is a local fallback |
| A4 | `npx sitemap-validator` is a real package | Verification Architecture | Low risk — planner should verify before including in plan; fallback is curl + xmllint |
| A5 | `heading` field removal is safe because the Sanity dataset has 0 seoPage documents | Pattern 8 | If there are hidden seoPage docs (e.g., from a manual Studio test), removing `heading` would lose that data. Verify with `sanity documents query '*[_type == "seoPage"]'` before schema change |
| A6 | OG image strategy: reuse v1 slug-keyed static images from `/images/seo/` | Pattern 9 / v1 content source | If v2 has no `/public/images/seo/` directory, all OG images fall back to a default; acceptable but reduces social share quality |
| A7 | `GROQ references(^._id)` filter on translation.metadata correctly matches seoPage docs | Pattern 3 | If GROQ `references()` has performance limits, the counterpart-slug join may be slow. Tested approach is standard per Sanity docs [ASSUMED: GROQ version shipped with sanity 6.9.1 supports `references()` in this context] |

---

## Open Questions

1. **EN slug approval gate (D-03)**
   - What we know: EN slugs derived from `titleEn` (e.g., `"Web Developer Berlin | BrightByte"` → `web-developer-berlin`)
   - What's unclear: User must review and approve all 25 EN slugs before the migration script runs. This is a human gate.
   - Recommendation: The planner should create a Wave 0 task that outputs a proposed EN slug list for user approval. The migration can only proceed after sign-off. The plan should treat this as a `checkpoint:human-verify` task.

2. **OG image strategy**
   - What we know: v1 has slug-keyed images for 16 of 25 pages, category fallbacks for 9.
   - What's unclear: Whether the v1 images live in the v2 `public/` directory or need to be copied.
   - Recommendation: Check `ls /Users/I750579/Documents/brightbyte-homepage-v2/public/images/seo/` at planning time. If missing, use a single default OG image (`/og-image.png`) rather than blocking the phase on image copying. Images can be added later without a code change.

3. **`next start` vs `next dev` for sitemap**
   - What we know: `sitemap.ts` as a Route Handler is cached by default unless it uses request-time APIs. In `next dev`, caching behavior differs from production.
   - What's unclear: Whether the Sanity fetch in `sitemap.ts` will be cached correctly in `next dev` (it may re-fetch on every request in dev, which is harmless but not representative).
   - Recommendation: Always run sitemap verification against `next start` or a Vercel preview, not `next dev`. Document this explicitly in the verification task.

---

## Sources

### Primary (HIGH confidence — version-matched docs read this session)

- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-static-params.md` — `generateStaticParams` signature, multi-segment routing, `params` as Promise
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md` — `generateMetadata` signature, `alternates.languages` shape
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/sitemap.md` — `MetadataRoute.Sitemap` type, `alternates.languages`, version history
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/robots.md` — `MetadataRoute.Robots` type, v16.3.0 `other` field
- `node_modules/next/dist/lib/metadata/types/alternative-urls-types.d.ts` — `UnmatchedLang = 'x-default'`, `Languages<T>` type, `AlternateURLs` shape

### In-repo verified sources (HIGH confidence — files read this session)

- `app/sitemap.ts` — current emitter shape (Phase 2 pre-shaped, `ROUTES` pattern)
- `lib/i18n/metadata.ts` — `buildHreflangAlternates` current signature and return shape
- `sanity/schemaTypes/seoPage.ts` — current thin schema (6 fields)
- `lib/sanity/queries.ts` — `SEO_PAGES_QUERY` and `SEO_PAGE_BY_SLUG_QUERY` current shapes
- `lib/sanity/client.ts` — `stega: false` invariant location
- `sanity.config.ts` — `seoPage` confirmed registered in `documentInternationalization.schemaTypes`
- `content/brightbyte.ndjson` — `translation.metadata` exact NDJSON shape
- `~/Documents/daniel-jin-studio-homepage/data/seo-pages.ts` — complete v1 field inventory (SeoPage type + 25 entries)
- `~/Documents/daniel-jin-studio-homepage/app/s/[slug]/page.tsx` — v1 `generateStaticParams`/`generateMetadata` shape (reference, v2 diverges)
- `~/Documents/daniel-jin-studio-homepage/components/seo/SeoPageJsonLd.tsx` — v1 JSON-LD emitter (WebPage + FAQPage + BreadcrumbList shapes)
- `~/Documents/daniel-jin-studio-homepage/app/s/[slug]/SeoPageContent.tsx` — v1 landing layout structure (reference for D-06)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages already installed; versions verified in prior phase research
- Architecture / Next.js APIs: HIGH — version-matched docs read this session; no training-data assumptions
- GROQ counterpart-slug join: MEDIUM — pattern is standard GROQ `references()` traversal [ASSUMED A7]; should be smoke-tested in a GROQ playground before plan commits to it
- NDJSON migration shape: HIGH — mirrored exactly from existing `content/brightbyte.ndjson` (read this session)
- JSON-LD shapes: HIGH — v1 emitter read this session; schema.org shapes are stable
- Verification approach: MEDIUM — curl + grep approach is reliable; specific validator tools tagged [ASSUMED]

**Research date:** 2026-09-03
**Valid until:** 2026-10-15 (stable APIs; Next.js 16.x unlikely to have breaking changes in this window)
