# Architecture Research

**Domain:** Bilingual Next.js App Router marketing site (DE/EN) with Sanity CMS, R3F hero, programmatic SEO
**Researched:** 2026-08-10
**Confidence:** MEDIUM (official Next.js docs + Sanity docs; R3F Next.js specifics from community patterns)

---

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Vercel Edge (middleware)                      │
│   Accept-Language detect → redirect / to /de or /en                  │
│   next-intl createMiddleware(routing) → alternate links for crawlers  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                      Next.js App Router                               │
│                                                                       │
│  app/                                                                 │
│  ├── [locale]/              ← all user-facing pages live here         │
│  │   ├── layout.tsx         ← root layout, html lang=, SanityLive    │
│  │   ├── page.tsx           ← homepage (hero + 2D sections)          │
│  │   └── s/[slug]/          ← programmatic SEO pages (~30 keyword)   │
│  │       └── page.tsx                                                 │
│  ├── sitemap.ts             ← bilingual sitemap with alternates       │
│  ├── robots.ts                                                        │
│  └── actions.ts             ← server actions (contact form → Resend) │
│                                                                       │
│  ┌────────────────┐  ┌─────────────────┐  ┌──────────────────────┐  │
│  │  Server Layer  │  │  Client Islands  │  │  3D Isolation Layer  │  │
│  │  (RSC default) │  │  ('use client')  │  │  (dynamic, ssr:false)│  │
│  │                │  │                  │  │                      │  │
│  │  - Page shells │  │  - ContactForm   │  │  - HeroCanvas        │  │
│  │  - SEO pages   │  │  - NavMobile     │  │  - HeroScene         │  │
│  │  - Metadata    │  │  - Testimonials  │  │  - R3F Canvas        │  │
│  │  - Sanity fetch│  │    carousel      │  │                      │  │
│  └────────────────┘  └─────────────────┘  └──────────────────────┘  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌─────────────────┬────────────▼──────────┬───────────────────────────┐
│   Sanity CMS    │   Resend (email API)   │   Tailwind @theme tokens  │
│  (projects,     │   (server action only) │   (single source of       │
│   testimonials, │                        │    truth for all colors,  │
│   SEO pages,    │                        │    type, spacing)         │
│   blog drafts)  │                        │                           │
└─────────────────┴────────────────────────┴───────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Boundary |
|-----------|---------------|----------|
| `middleware.ts` | Locale detect from Accept-Language, redirect root to `/de`, set alternate link headers for SEO | Edge runtime, runs before every page |
| `app/[locale]/layout.tsx` | Root HTML shell (`<html lang={locale}>`), font loading, `<SanityLive/>`, global token styles | Server Component |
| `app/[locale]/page.tsx` | Homepage assembly: hero slot + ordered 2D sections | Server Component, orchestrates RSC data fetches |
| `app/[locale]/s/[slug]/page.tsx` | Programmatic SEO keyword pages; `generateStaticParams` from Sanity slugs; `generateMetadata` with JSON-LD; page content from Sanity | Server Component |
| `components/hero/HeroCanvas.tsx` | Client component wrapper; loaded via `next/dynamic({ssr:false})`; owns Canvas + R3F scene | Client Component, code-split chunk |
| `components/sections/*` | Individual 2D marketing sections (Services, Process, Testimonials, Pricing, Contact); each is a Server Component that receives translated strings + Sanity data as props | Server Components (default) |
| `components/ui/*` | Design system primitives (Button, Typography, Card, Section); consumes Tailwind tokens only, never raw values | Both; context-dependent |
| `components/forms/ContactForm.tsx` | Client component with `useActionState`; calls `sendContactEmail` server action | Client Component |
| `app/actions.ts` | `sendContactEmail` server action: validate FormData, call Resend SDK, return state | Server only (`'use server'`) |
| `app/sitemap.ts` | Generates `MetadataRoute.Sitemap[]` with `alternates.languages` for DE/EN hreflang | Server |
| `lib/sanity/client.ts` | Sanity client config + `defineLive()` export | Server |
| `lib/sanity/queries.ts` | All GROQ queries, typed with `sanity.types` | Server |
| `lib/dictionaries.ts` | `getDictionary()` using `next/root-params` lang getter; loads `messages/de.json` or `messages/en.json` | Server only |
| `styles/tokens.css` | Single `@theme` block: all palette, type scale, spacing, easing tokens | CSS |

---

## Recommended Project Structure

```
brightbyte-homepage-v2/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx            # Root layout: html lang, fonts, SanityLive
│   │   ├── page.tsx              # Homepage
│   │   └── s/
│   │       └── [slug]/
│   │           └── page.tsx      # Programmatic SEO pages
│   ├── sitemap.ts                # Bilingual sitemap with alternates
│   ├── robots.ts
│   └── actions.ts                # Server actions (contact form)
├── components/
│   ├── hero/
│   │   ├── HeroCanvas.tsx        # 'use client', loaded via dynamic(ssr:false)
│   │   ├── HeroScene.tsx         # R3F scene graph
│   │   └── HeroFallback.tsx      # Static placeholder during load
│   ├── sections/
│   │   ├── SectionHero.tsx       # Hero shell (mounts HeroCanvas slot)
│   │   ├── SectionServices.tsx
│   │   ├── SectionProcess.tsx
│   │   ├── SectionWork.tsx       # Project case studies from Sanity
│   │   ├── SectionTestimonials.tsx
│   │   ├── SectionPricing.tsx
│   │   └── SectionContact.tsx    # Mounts ContactForm
│   ├── forms/
│   │   └── ContactForm.tsx       # 'use client', useActionState
│   ├── layout/
│   │   ├── SiteHeader.tsx
│   │   ├── SiteFooter.tsx
│   │   └── LocaleSwitcher.tsx    # Link to /de or /en equivalent path
│   └── ui/
│       ├── Button.tsx
│       ├── Typography.tsx
│       └── Card.tsx
├── lib/
│   ├── sanity/
│   │   ├── client.ts             # createClient + defineLive exports
│   │   ├── queries.ts            # All GROQ queries
│   │   └── types.ts              # Sanity-generated TypeScript types
│   └── dictionaries.ts           # getDictionary() via next/root-params
├── messages/
│   ├── de.json                   # German UI strings (nav, CTAs, form labels)
│   └── en.json                   # English UI strings
├── styles/
│   └── tokens.css                # @theme block: entire design token surface
├── middleware.ts                  # Locale detection + redirect
└── sanity/
    ├── schemaTypes/              # Sanity schema definitions
    └── sanity.config.ts          # Sanity Studio config
```

### Structure Rationale

- **`app/[locale]/`**: All user-facing routes live inside the locale segment. This is the canonical Next.js App Router pattern for path-based i18n — every URL is inherently locale-scoped, which is what makes hreflang and sitemap alternates clean to generate.
- **`app/[locale]/s/[slug]/`**: Programmatic SEO pages are nested under the locale so they get `/de/s/webdesign-berlin` and `/en/s/web-design-berlin` for free — separate keyword targeting per language.
- **`components/hero/` isolated**: Hero components are in their own directory and never imported directly by 2D code. The only import point is `next/dynamic` in `SectionHero.tsx`. This is the code-splitting boundary.
- **`lib/sanity/`**: All Sanity I/O is centralized here. Pages import query functions, not the raw client. This keeps GROQ queries auditable and typed.
- **`messages/`**: Dictionary JSON files at project root (per `next-intl` convention). They are server-only imports — zero client bundle cost.
- **`styles/tokens.css`**: Single file that owns the entire visual identity as CSS custom properties. Every styling decision resolves here. Sections never hardcode colors or sizes. This is the direct architectural fix for v1's per-section styling sprawl.

---

## Architectural Patterns

### Pattern 1: [locale] Segment Routing with next-intl Middleware

**What:** Every route lives under `app/[locale]/`. The `middleware.ts` detects the preferred locale from `Accept-Language`, redirects bare `/` to `/de` (default) or `/en`, and injects `Link: <url>; rel="alternate"; hreflang="de"` headers that next-intl uses for SEO.

**When to use:** Always — this is the foundational routing structure. Nothing outside `[locale]/` is a user page.

**Trade-offs:** Adds one path segment everywhere; all internal links must include locale prefix. `next/link` and next-intl's `Link` wrapper handle this automatically. Sitemap generation is explicit but straightforward.

**Example:**
```typescript
// middleware.ts
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)'
}

// i18n/routing.ts
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['de', 'en'],
  defaultLocale: 'de'
})
```

```typescript
// app/[locale]/layout.tsx
export async function generateStaticParams() {
  return [{ locale: 'de' }, { locale: 'en' }]
}

export default async function RootLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params
  return (
    <html lang={locale}>
      <body>
        {children}
        <SanityLive />
      </body>
    </html>
  )
}
```

### Pattern 2: R3F Hero Isolation via dynamic(ssr:false)

**What:** The 3D hero is fully isolated from the 2D render tree. `SectionHero` imports `HeroCanvas` only through `next/dynamic` with `ssr: false`. This keeps Three.js and the entire R3F dependency tree out of the server bundle and prevents hydration mismatch from WebGL code running server-side.

**When to use:** For any R3F or heavy WebGL component. Non-negotiable — importing `@react-three/fiber` in a Server Component is a build error.

**Trade-offs:** The Canvas has a brief loading window (~200–400ms on fast connections). Mitigate with a `HeroFallback` that occupies identical dimensions so there is no layout shift. Slight increase in page interactivity timing for 3D-capable browsers, but no impact on 2D content which hydrates independently.

**Example:**
```typescript
// components/sections/SectionHero.tsx  (Server Component)
import dynamic from 'next/dynamic'
import { HeroFallback } from '@/components/hero/HeroFallback'

const HeroCanvas = dynamic(
  () => import('@/components/hero/HeroCanvas'),
  { ssr: false, loading: () => <HeroFallback /> }
)

export function SectionHero({ dict }: { dict: HeroDict }) {
  return (
    <section className="relative h-screen">
      <HeroCanvas />                    {/* 3D layer — client-only chunk */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end p-8">
        <h1 className="text-display">{dict.headline}</h1>
        <p className="text-body-lg">{dict.subheadline}</p>
      </div>
    </section>
  )
}
```

```typescript
// components/hero/HeroCanvas.tsx
'use client'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { HeroScene } from './HeroScene'

export default function HeroCanvas() {
  return (
    <Canvas className="absolute inset-0" camera={{ fov: 45 }}>
      <Suspense fallback={null}>
        <HeroScene />
      </Suspense>
    </Canvas>
  )
}
```

### Pattern 3: Single Token Source — @theme in tokens.css

**What:** All design decisions (palette, type scale, spacing, motion easing) are defined once in a `@theme` block in `styles/tokens.css`. Tailwind utilities are generated from these tokens. Components use only Tailwind class names or CSS `var(--token)` references — never raw values.

**When to use:** From day one, before writing the first section component. This is the architectural fix for v1's sprawl.

**Trade-offs:** Requires discipline to never bypass. One additional CSS file in the mental model. Pays back immediately — every section looks consistent without coordination effort.

**Example:**
```css
/* styles/tokens.css */
@theme {
  /* Palette — defined once, used everywhere */
  --color-ink:        #1a1a1a;
  --color-ink-muted:  #6b6b6b;
  --color-paper:      #f9f7f4;
  --color-accent:     #c8a882;    /* warm gold — brand accent */
  --color-surface:    #ffffff;

  /* Type scale */
  --font-display:     'PP Editorial New', Georgia, serif;
  --font-body:        'Inter', system-ui, sans-serif;
  --text-display:     3.5rem;
  --text-headline:    2rem;
  --text-body-lg:     1.125rem;
  --text-body:        1rem;
  --text-sm:          0.875rem;

  /* Motion */
  --ease-out-expo:    cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out:      cubic-bezier(0.45, 0, 0.55, 1);
}
```

### Pattern 4: Sanity Data Flow with defineLive + stega:false Guard

**What:** `lib/sanity/client.ts` exports `sanityFetch` and `SanityLive` from `next-sanity`'s `defineLive()`. Page components call `sanityFetch({ query, params })`. `generateStaticParams` and `generateMetadata` always pass `{ stega: false }` to prevent stega encoding characters from corrupting URL slugs and `<title>` tags.

**When to use:** For all Sanity data reads in Server Components and metadata functions.

**Trade-offs:** `defineLive` is the recommended path but requires a Sanity read token in env. The alternative custom fetch helper gives more control over `revalidate` timing for marketing page sections.

**Example:**
```typescript
// lib/sanity/client.ts
import { defineLive } from 'next-sanity/live'
import { client } from './base-client'

export const { sanityFetch, SanityLive } = defineLive({
  client: client.withConfig({ apiVersion: '2025-01-01' }),
  serverToken: process.env.SANITY_API_READ_TOKEN,
  browserToken: process.env.SANITY_API_READ_TOKEN,
})
```

```typescript
// app/[locale]/s/[slug]/page.tsx
import { cache } from 'react'
import { sanityFetch } from '@/lib/sanity/client'
import { SEO_PAGE_QUERY } from '@/lib/sanity/queries'

// Memoize so generateMetadata + page share one fetch
const getSeoPage = cache(async (slug: string) =>
  sanityFetch({ query: SEO_PAGE_QUERY, params: { slug }, stega: false })
)

export async function generateStaticParams() {
  const { data } = await sanityFetch({
    query: SEO_SLUGS_QUERY,
    perspective: 'published',
    stega: false,
  })
  return data.map(({ slug }: { slug: string }) => ({ slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const { data: page } = await getSeoPage(slug)

  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: {
      canonical: `/de/s/${slug}`,
      languages: { en: `/en/s/${page.slugEn}` },
    },
  }
}
```

### Pattern 5: Server Action for Contact Form

**What:** A single `sendContactEmail` server action in `app/actions.ts` handles form submission. The `ContactForm` client component uses `useActionState` to manage pending/success/error states without a separate API route.

**When to use:** Preferred over a Route Handler for this use case — simpler, co-located with the form's intent, progressive enhancement works without JS.

**Trade-offs:** Server actions are POST-only and reachable via direct POST — input validation with Zod inside the action is mandatory. No rate-limiting at the network layer by default; add a check inside the action.

**Example:**
```typescript
// app/actions.ts
'use server'
import { Resend } from 'resend'
import { z } from 'zod'

const ContactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  message: z.string().min(10).max(2000),
})

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendContactEmail(
  _prevState: unknown,
  formData: FormData
) {
  const parsed = ContactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  })
  if (!parsed.success) return { status: 'error', errors: parsed.error.flatten() }

  await resend.emails.send({
    from: 'noreply@brightbyteberlin.de',
    to: 'daniel@brightbyteberlin.de',
    subject: `New inquiry from ${parsed.data.name}`,
    text: parsed.data.message,
    replyTo: parsed.data.email,
  })

  return { status: 'success' }
}
```

### Pattern 6: Bilingual Sitemap with Alternates (Hreflang in Sitemap)

**What:** `app/sitemap.ts` programmatically generates all URLs for both locales, with each entry including `alternates.languages` mapping — Next.js renders these as `xhtml:link hreflang` tags in the sitemap XML. This satisfies Google's requirement for hreflang signals on international sites.

**When to use:** Sitemap hreflang is the recommended approach alongside `<link rel="alternate">` meta tags in each page's `generateMetadata`. Use both.

**Example:**
```typescript
// app/sitemap.ts
import type { MetadataRoute } from 'next'
import { sanityFetch } from '@/lib/sanity/client'
import { ALL_SEO_SLUGS_QUERY } from '@/lib/sanity/queries'

const BASE = 'https://brightbyteberlin.de'
const LOCALES = ['de', 'en'] as const

const staticPages = ['', '/leistungen', '/projekte', '/kontakt']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: seoPages } = await sanityFetch({
    query: ALL_SEO_SLUGS_QUERY,
    perspective: 'published',
    stega: false,
  })

  const staticEntries = staticPages.map((path) => ({
    url: `${BASE}/de${path}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: path === '' ? 1 : 0.8,
    alternates: {
      languages: {
        de: `${BASE}/de${path}`,
        en: `${BASE}/en${path}`,
      },
    },
  }))

  const seoEntries = seoPages.map(({ slugDe, slugEn }: { slugDe: string; slugEn: string }) => ({
    url: `${BASE}/de/s/${slugDe}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
    alternates: {
      languages: {
        de: `${BASE}/de/s/${slugDe}`,
        en: `${BASE}/en/s/${slugEn}`,
      },
    },
  }))

  return [...staticEntries, ...seoEntries]
}
```

---

## Data Flow

### Page Render Flow (Homepage)

```
Browser request: GET /de
  ↓
middleware.ts
  → locale already present → no redirect
  → next-intl sets alternate link headers
  ↓
app/[locale]/layout.tsx (RSC)
  → await params → locale = 'de'
  → renders <html lang="de">
  → mounts <SanityLive /> (real-time Sanity updates)
  ↓
app/[locale]/page.tsx (RSC)
  → getDictionary()              [loads messages/de.json, server-only]
  → sanityFetch(HOMEPAGE_QUERY)  [Sanity CDN, tagged cache]
  → renders section tree with data props
  ↓
SectionHero (RSC)
  → next/dynamic(HeroCanvas, {ssr:false})   [separate JS chunk]
  → renders HeroFallback immediately on server
  → client hydrates → loads HeroCanvas chunk → mounts R3F Canvas
  ↓
SectionServices, SectionWork, etc. (RSC)
  → receive dict + sanity data as props
  → fully server-rendered HTML
  ↓
SectionContact (RSC)
  → mounts ContactForm (Client Component island)
  ↓
ContactForm ('use client')
  → useActionState(sendContactEmail, null)
  → on submit → server action → Resend API
  → state.status drives UI feedback
```

### Programmatic SEO Page Flow

```
Build time:
  generateStaticParams()
    → sanityFetch(SEO_SLUGS_QUERY, {stega:false})
    → returns [{slug:'webdesign-berlin'}, ...]
    → Next.js pre-renders /de/s/[each-slug] and /en/s/[each-slug]

  generateMetadata({params})
    → getSeoPage(slug)          [React cache — single fetch]
    → returns title, description, JSON-LD, alternates hreflang
    → injects <script type="application/ld+json"> in <head>

  page component
    → getSeoPage(slug)          [cache hit — no second fetch]
    → renders keyword page content
```

### Design Token Flow

```
styles/tokens.css (@theme block)
  → Tailwind processes tokens → generates utility classes
  → bg-accent, text-ink, font-display etc. available everywhere

Component: SectionServices.tsx
  → <h2 className="font-display text-headline text-ink">
  → <div className="bg-paper">
  → NEVER: style={{ color: '#1a1a1a' }} or className="text-[#1a1a1a]"

If brand palette changes:
  → Edit tokens.css only
  → All 100+ component instances update automatically
```

---

## Integration Points

### External Services

| Service | Integration Pattern | Critical Notes |
|---------|---------------------|----------------|
| Sanity CMS | `next-sanity` `defineLive()` → `sanityFetch` in RSC | Always `stega:false` in `generateStaticParams` and `generateMetadata` — stega chars corrupt URL slugs and meta tags |
| Resend | Resend SDK called inside `'use server'` action only | API key server-only; validate with Zod before calling SDK; never expose key to client |
| Vercel | Vercel-managed environment variables; commit author email must be `<id>+<login>@users.noreply.github.com` for deploy success | Deploy fails silently with old-format GitHub noreply email (confirmed v1 issue) |
| Three.js / R3F | `next/dynamic` with `{ssr:false}` — never imported in RSC | Build will error if `@react-three/fiber` is imported in a Server Component |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| RSC → Client Component | Props only (serializable data) | No passing functions as props except server actions |
| 2D sections → 3D Hero | `next/dynamic` import only | `SectionHero` must not have a direct static import of any R3F module |
| Page → Sanity | Via `lib/sanity/queries.ts` functions | Pages never construct GROQ inline; all queries are in the queries file |
| Contact form → Email | Server action in `app/actions.ts` | `ContactForm` imports the action by reference; no direct Resend import in any client file |
| Token system → Components | Tailwind utility classes or `var(--token)` | No raw values in component files; tokens.css is the only place to define visual values |

---

## Anti-Patterns

### Anti-Pattern 1: Mixed Styling Systems (v1 Root Cause)

**What people do:** Use SCSS modules for layout, styled-components for interactive components, and inline `style={{}}` for one-off overrides. Each section gets its own "design direction."

**Why it's wrong:** Results in 3 competing systems with no shared source of truth. Color changes require grep-and-replace across dozens of files. Visual inconsistency grows as sections are added or edited. Precisely what happened in v1.

**Do this instead:** Single `@theme` token block in `tokens.css`. All components use Tailwind utility classes derived from those tokens. If a value doesn't exist as a token, add it to `tokens.css` first — then use it.

### Anti-Pattern 2: Client-Side i18n (v1 Root Cause)

**What people do:** Load all translations in the browser, detect locale via `?lang=` query param or `localStorage`, and switch languages client-side.

**Why it's wrong:** Search engines index a single URL with language-mixed content; hreflang cannot be set correctly; no per-URL canonical; locale state is lost on direct navigation.

**Do this instead:** Path-based `[locale]` segment. Middleware redirects root to default locale. Every URL is inherently locale-scoped. Sitemap carries `alternates.languages` for hreflang signals to Google.

### Anti-Pattern 3: Importing R3F in Server Components

**What people do:** Import `Canvas` from `@react-three/fiber` directly in a page or layout, or forget `'use client'` on the wrapper component.

**Why it's wrong:** Build error at minimum; runtime WebGL errors on server at worst. Three.js depends on browser globals (`window`, `document`, WebGL context) that do not exist in Node.

**Do this instead:** `'use client'` on every R3F component. `next/dynamic(() => import('./HeroCanvas'), { ssr: false })` at the consumption site. Never a static import of R3F anywhere outside the `components/hero/` directory.

### Anti-Pattern 4: Stega in generateStaticParams / generateMetadata

**What people do:** Call `sanityFetch` without `stega: false` inside `generateStaticParams` or `generateMetadata`.

**Why it's wrong:** Stega encoding injects invisible zero-width characters into strings for visual editing overlays. In URL slugs these produce 404s. In `<title>` tags they corrupt SEO indexing.

**Do this instead:** Always pass `stega: false` in `generateStaticParams` and `generateMetadata`. Only page render components use the default stega-enabled fetch.

### Anti-Pattern 5: Duplicate Content via Missing Hreflang

**What people do:** Launch bilingual site without hreflang signals; or set hreflang only in `<head>` meta, not in sitemap.

**Why it's wrong:** Google may treat `/de/s/webdesign-berlin` and `/en/s/web-design-berlin` as duplicate pages and apply a penalty or drop one. German keyword SEO value is diluted.

**Do this instead:** Set hreflang in two places: (1) `generateMetadata` alternates for `<link rel="alternate">` in page `<head>`, and (2) `sitemap.ts` `alternates.languages` for sitemap XML hreflang. Belt-and-suspenders approach matches Google's recommended implementation.

---

## Build Order Implications

The architecture has a strict dependency graph that determines safe build order:

```
1. Token system (tokens.css @theme)
   └── Must exist before any component is styled
       └── 2. Layout shell (app/[locale]/layout.tsx)
               ├── Requires tokens + i18n routing (middleware.ts)
               └── 3. Core 2D sections (Services, Process, Contact)
                       ├── Requires layout shell + dictionary structure
                       └── 4. Sanity data integration
                               ├── Requires query shapes to be defined first
                               └── 5. R3F Hero
                                       ├── Requires layout shell to exist (mounting point)
                                       └── 6. SEO layer (s/[slug], sitemap, robots, JSON-LD)
                                               └── Requires Sanity schema + query for slugs
```

**Recommended phase sequence:**
1. **Identity + tokens** — Define palette, type scale, easing in `tokens.css`. Verify in Storybook or an isolated testbed before touching pages.
2. **i18n shell** — `middleware.ts`, `app/[locale]/layout.tsx`, `getDictionary`, `messages/de.json` + `messages/en.json` with placeholder strings. Verify `/de` and `/en` routes resolve with correct `lang` attribute.
3. **2D sections** — Build sections in order of visual importance: Hero shell → Services → Work → Testimonials → Pricing → Contact. Each gets dictionary strings + mock data before Sanity is wired.
4. **Sanity integration** — Wire `sanityFetch` into sections that need CMS data (Projects, Testimonials). Define Sanity schemas if not already set up.
5. **R3F Hero** — Build `HeroCanvas` + `HeroScene` in isolation, mount via `next/dynamic`. Tune performance (draw calls, geometry complexity, frame budget).
6. **SEO layer** — `app/[locale]/s/[slug]/page.tsx`, `sitemap.ts`, `robots.ts`, JSON-LD per page type. Validate with Google Rich Results Test and Search Console.
7. **Contact form** — `sendContactEmail` server action + `ContactForm` client component. Test Resend integration end-to-end.
8. **Polish** — Playwright screenshot-critique loop per section, ui-skills validation, motion tuning.

---

## Scaling Considerations

This is a static-heavy marketing site. Scaling concerns are minimal, but:

| Scale | Architecture Adjustment |
|-------|------------------------|
| Current (~30 SEO pages, 5–6 main sections) | Full static generation (ISR not needed). `generateStaticParams` covers all pages at build. |
| Adding more content types (blog, more projects) | Introduce ISR via `revalidate` tags on Sanity fetch. `SanityLive` already handles real-time preview in Studio. |
| Traffic spike (press, viral) | Vercel Edge CDN handles it — no server to scale. Static HTML is served from edge. |
| Adding a second CMS author | Sanity Studio handles multi-author; no architectural change needed. |

---

## Sources

- Next.js App Router Internationalization (official docs, v16.3, retrieved 2026-08-10) — MEDIUM confidence
- Next.js Mutating Data / Server Actions (official docs, v16.3, retrieved 2026-08-10) — MEDIUM confidence
- Next.js Metadata + Sitemap API reference (official docs, v16.3, retrieved 2026-08-10) — MEDIUM confidence
- Sanity + Next.js App Router Live Preview guide (sanity.io, retrieved 2026-08-10) — MEDIUM confidence
- next-intl Middleware documentation (next-intl.dev, retrieved 2026-08-10) — MEDIUM confidence
- Tailwind CSS @theme directive (tailwindcss.com, retrieved 2026-08-10) — MEDIUM confidence
- React Three Fiber introduction + pmndrs starter (r3f.docs.pmnd.rs + github.com/pmndrs/react-three-next, retrieved 2026-08-10) — MEDIUM confidence (R3F+Next.js SSR patterns inferred from official guidance + known community patterns; no single authoritative Next.js 15 + R3F guide exists)

---
*Architecture research for: BrightByte Berlin Homepage v2 — bilingual Next.js App Router marketing site*
*Researched: 2026-08-10*
