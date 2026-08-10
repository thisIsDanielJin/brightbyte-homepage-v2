# Stack Research

**Domain:** Bilingual (DE/EN) freelance studio marketing site — Next.js + R3F hero + Sanity CMS + Resend contact
**Researched:** 2026-08-10
**Confidence:** MEDIUM (all versions verified against npm registry and official docs; integration patterns from official documentation)

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.3.0 | Framework, routing, SSR/SSG | App Router is mature, stable, industry standard. generateMetadata API handles hreflang natively. Server Actions eliminate the need for a separate API layer for the contact form. Turbopack stable in dev. |
| React | 19.2.8 | UI rendering | Required by Next.js 16. React 19 server components model matches the static-first nature of a marketing site. `use client` is precise and explicit. |
| TypeScript | 7.0.2 | Type safety | Required for sustainable refactoring across a multi-phase rebuild. Next.js 16 ships TypeScript-first. |
| Tailwind CSS | 4.3.3 | Styling | v4 is stable and production-ready (Safari 16.4+/Chrome 111+/Firefox 128+ — fine for 2026 Berlin SMB audience). Config moves entirely to CSS via `@theme {}` block — no `tailwind.config.js`. This is the ONE styling approach: tokens in `@theme`, utility classes in components, no SCSS modules, no inline styles, no styled-components. Eliminates v1's sprawl. |
| @tailwindcss/postcss | 4.3.3 | v4 PostCSS bridge | Required for Tailwind v4 with Next.js (replaces the old `tailwindcss` PostCSS plugin). |

### i18n

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| next-intl | 4.13.6 | Path-based bilingual routing, translations | De-facto standard for App Router i18n. v4 (March 2025) is ESM-only, TypeScript 5+ required, strict locale types. `createMiddleware` handles `/de`/`/en` prefix detection with Accept-Language fallback. `createNavigation` wraps all Next.js nav APIs. Generates hreflang alternate links via the Next.js `alternates.languages` metadata API and `sitemap()`. Preferred over next-i18next (Pages Router legacy) and raw i18next (requires manual route plumbing). |

### 3D Hero

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| three | 0.185.1 | 3D engine | Underlying WebGL library. Must be installed explicitly as a peer dependency. |
| @react-three/fiber | 9.7.0 | React renderer for three.js | Bundles its own reconciler (required for React 19.2 compatibility). v9 delivers full React 19.2 support including Activity. The single correct choice if using React for a three.js scene. |
| @react-three/drei | 10.7.8 | R3F helper library | Provides tree-shakeable helpers: `Environment` (IBL lighting), `useGLTF` (model loading + Draco), `Float` (gentle animation), `Loader` (Suspense fallback UI), `useProgress` (loading state), `Html` (overlays), `PerformanceMonitor` (adaptive quality). Eliminates boilerplate for every common hero pattern. |

### CMS

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| sanity | 6.9.1 | Sanity Studio (embedded) | v6 is current stable (not v3, not v4 — the npm package "sanity" is now at v6). Node 22.12+ required. |
| next-sanity | 13.3.1 | Sanity ↔ Next.js integration | Official bridge package. `createClient` for GROQ queries with caching. `defineLive` API for real-time content updates. `VisualEditing` component enables click-to-edit overlays in Draft Mode. |
| @sanity/image-url | 2.1.1 | Responsive image URL builder | Builds srcset URLs from Sanity image assets with hotspot/crop awareness. Required for `next/image` integration. |
| @sanity/document-internationalization | 6.2.29 | Bilingual CMS content | Document-level i18n plugin: creates separate DE/EN document versions linked by a shared reference. Correct approach for content where DE/EN copy is independently authored. |

### Contact Form

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| resend | 6.18.1 | Transactional email | `const { data, error } = await resend.emails.send({...})`. Use in a Route Handler (`app/api/contact/route.ts`) rather than a Server Action — Route Handlers are more debuggable and easier to rate-limit. Destructured `{ data, error }` response; never use try/catch for SDK errors. |
| zod | 4.4.3 | Form/server validation | Validates incoming contact form payload before calling Resend. Prevents spam garbage from reaching the email API. One schema shared between client-side preview and server validation. |

### Animation

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| motion | 13.1.0 | Subtle scroll + entrance animations | The rebranded framer-motion (same package, same author). Restrained viewport-triggered animations on sections. Do NOT use for 3D hero — that's R3F's domain. Import from `motion/react` in React 19. |

### Vercel / Deploy

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| @vercel/analytics | 2.0.1 | Page view analytics | Zero-config on Vercel, no external script weight, GDPR-light. |
| @vercel/speed-insights | 2.0.0 | Core Web Vitals monitoring | Surfaces LCP/CLS/INP regressions per deploy — essential when a 3D hero is involved. |
| sharp | 0.35.3 | Next.js image optimization | Must be installed explicitly when deploying to Vercel for `next/image` to optimize at build time rather than falling back to squooshed runtime paths. |

---

## Supporting / Dev Tools

| Tool | Version | Purpose | Notes |
|------|---------|---------|-------|
| @sanity/vision | 6.9.1 | GROQ query dev tool | Sanity Studio plugin for testing queries during content modelling. Dev-time only. |
| eslint-config-next | (bundled) | Linting | Shipped with Next.js. No separate install needed; already includes React + JSX rules. |
| prettier | latest | Code formatting | Add `prettier-plugin-tailwindcss` to auto-sort class names in the correct order — critical for Tailwind v4 where variant-stacking order now matters (left-to-right). |
| prettier-plugin-tailwindcss | latest | Tailwind class sorting | Companion to prettier; avoids subtle v4 variant-order bugs. |

---

## Installation

```bash
# Core framework
npm install next@16 react@19 react-dom@19 typescript@7

# Styling (v4 — PostCSS bridge, no tailwind.config.js)
npm install tailwindcss @tailwindcss/postcss postcss

# i18n
npm install next-intl

# 3D hero
npm install three @react-three/fiber @react-three/drei

# CMS
npm install next-sanity sanity @sanity/image-url @sanity/document-internationalization

# Contact form
npm install resend zod

# Animation
npm install motion

# Vercel observability
npm install @vercel/analytics @vercel/speed-insights sharp

# Dev
npm install -D @sanity/vision prettier prettier-plugin-tailwindcss
```

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Styling | Tailwind v4 (CSS @theme config) | Tailwind v3 (tailwind.config.js) | v3 is no longer the latest; v4 has better native CSS token integration for a design-token-first project. The browser floor (Safari 16.4+) is fine for 2026. |
| Styling | Tailwind only | SCSS modules | v1's root problem was mixing SCSS + styled-components + Tailwind + inline. Pick one. SCSS modules add a build step and context-switch overhead for no gain. |
| Styling | Tailwind only | styled-components / emotion | CSS-in-JS runtime is incompatible with RSC in App Router without `'use client'` on every styled component. Not viable. |
| i18n | next-intl | next-i18next | next-i18next is Pages Router only; no App Router support. Dead end. |
| i18n | next-intl | i18next (raw) | Requires manually building all the middleware and routing integration that next-intl provides. No benefit for a simple 2-locale site. |
| i18n | next-intl | next-intl v3 | v4 is current; v3 is deprecated. Major improvement in type safety. |
| CMS | Sanity v6 + next-sanity | Contentful / Prismic | Retained from v1; switching CMS mid-project for a rebuild is waste. Sanity v6 is modern and well-supported. |
| Animation | motion (framer-motion) | GSAP | GSAP's free tier has license restrictions for commercial portfolio sites. motion is MIT, lighter weight for subtle entrance animations. |
| 3D | @react-three/fiber | OGL (v1 approach) | R3F gives full React mental model over the scene graph. OGL is lower-level and lacks the ecosystem (drei, postprocessing). User explicitly chose R3F. |
| Contact | Resend Route Handler | Server Action | Route Handlers are easier to test in isolation, accept standard `Request` objects, and can have rate-limiting middleware applied. Server Actions are fine but harder to curl-test. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `tailwindcss` PostCSS plugin (old v3 plugin) | v4 split the PostCSS plugin into `@tailwindcss/postcss` — using the old plugin with v4 breaks compilation silently | `@tailwindcss/postcss` |
| SCSS modules alongside Tailwind | Creates a second styling system; v1's root cause of visual incoherence | Tailwind `@layer` / `@utility` for the few custom classes needed |
| styled-components / emotion | Runtime CSS-in-JS is incompatible with React Server Components — requires `'use client'` everywhere, defeating RSC benefits | Tailwind utility classes + CSS variables |
| next-i18next | Pages Router only; no App Router support | next-intl |
| `?lang=` query param / localStorage i18n (v1 approach) | No SEO value — search engines see one URL for all locales | next-intl path-based `/de` `/en` |
| `<Canvas>` rendered server-side without `ssr: false` | WebGL requires `window`/`navigator`; SSR will throw | `dynamic(() => import('./HeroScene'), { ssr: false })` in a `'use client'` wrapper |
| `frameloop="always"` on a static hero | Renders at 60fps indefinitely even when nothing moves; wastes CPU/battery | `frameloop="demand"` — R3F only renders when state changes |
| Importing all of `@react-three/drei` | Massive bundle; drei is not tree-shaken if used as a barrel import | Named imports only: `import { Environment, Float } from '@react-three/drei'` |
| try/catch around `resend.emails.send()` | SDK uses a Result pattern `{ data, error }`, not throws | Destructure `{ data, error }` and branch on `error` |
| Hardcoded inline styles in components | Repeats v1's colour drift problem; tokens become meaningless | CSS custom properties defined once in `@theme {}`, consumed via Tailwind utilities |
| `tailwindcss.config.js` | Does not exist in Tailwind v4 — config is now in CSS | `@theme {}` block in `globals.css` |

---

## Integration Patterns

### Next.js App Router + next-intl (path-based /de /en)

```
app/
  [locale]/         ← locale segment wraps all pages
    layout.tsx      ← NextIntlClientProvider here
    page.tsx
    about/
      page.tsx
middleware.ts       ← createMiddleware(routing)
i18n/
  routing.ts        ← locales: ['de', 'en'], defaultLocale: 'de'
  navigation.ts     ← createNavigation(routing)
messages/
  de.json
  en.json
```

`middleware.ts` intercepts every request, detects locale from prefix → cookie → Accept-Language → default, and rewrites/redirects. The `[locale]` segment feeds `getMessages()` in the layout.

Hreflang is emitted via `generateMetadata` in each page:
```ts
alternates: {
  canonical: `/${locale}/about`,
  languages: { de: '/de/about', en: '/en/about' }
}
```

### R3F Hero in App Router

```tsx
// components/hero/HeroScene.tsx — 'use client', no SSR
'use client'
import { Canvas } from '@react-three/fiber'
import { Environment, Float, PerformanceMonitor } from '@react-three/drei'

export function HeroScene() {
  return (
    <Canvas frameloop="demand" dpr={[1, 1.5]}>
      <PerformanceMonitor onDecline={() => setDpr(1)}>
        <Environment preset="city" />
        <Float><YourMesh /></Float>
      </PerformanceMonitor>
    </Canvas>
  )
}

// components/hero/HeroSceneLazy.tsx — loaded from a Server Component
import dynamic from 'next/dynamic'
const HeroScene = dynamic(() => import('./HeroScene').then(m => m.HeroScene), {
  ssr: false,
  loading: () => <div className="hero-placeholder" />,
})
```

`ssr: false` must live in a `'use client'` component or be called from one; Next.js 16 throws if you use `ssr: false` in a Server Component.

### Sanity + Next.js App Router

```ts
// lib/sanity/client.ts
import { createClient } from 'next-sanity'
export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  useCdn: true,
})

// In a Server Component page:
const data = await client.fetch<ProjectData[]>(groq`*[_type == "project" && language == $locale]`, { locale })
```

Live preview: wrap with `defineLive` from `next-sanity` and add `<VisualEditing />` in Draft Mode layout.

### Resend Contact Route Handler

```ts
// app/api/contact/route.ts
import { Resend } from 'resend'
import { z } from 'zod'

const schema = z.object({ name: z.string(), email: z.string().email(), message: z.string() })
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return Response.json({ error: 'Invalid input' }, { status: 400 })

  const { data, error } = await resend.emails.send({
    from: 'hello@brightbyte.berlin',
    to: 'daniel@brightbyte.berlin',
    subject: `New inquiry from ${parsed.data.name}`,
    text: parsed.data.message,
  })

  if (error) return Response.json({ error }, { status: 500 })
  return Response.json({ success: true })
}
```

### Tailwind v4 Token Setup

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  /* Typography */
  --font-sans: 'YourFont', system-ui, sans-serif;
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;

  /* Brand palette */
  --color-primary: oklch(0.35 0.05 255);
  --color-accent: oklch(0.7 0.15 255);
  --color-surface: oklch(0.98 0 0);

  /* Spacing rhythm */
  --spacing-section: 6rem;
}
```

No `tailwind.config.js` needed. All tokens available as CSS variables and Tailwind utility suffixes automatically.

---

## Version Compatibility Matrix

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| Next.js 16.3.0 | React 19.2.x | React 19 required |
| @react-three/fiber 9.7.0 | React 19.2.x, three 0.185.1 | Bundles own reconciler — no separate react-reconciler install |
| @react-three/drei 10.7.8 | @react-three/fiber 9.x, three 0.185.1 | Use named imports only |
| next-intl 4.13.6 | Next.js 15+, TypeScript 5+ | TypeScript 7 is fine; ESM-only (no CJS projects) |
| sanity 6.9.1 | Node 22.12+ | Node 22 LTS required — verify Vercel runtime is ≥22 |
| next-sanity 13.3.1 | sanity 6.x, Next.js 15+ | |
| tailwindcss 4.3.3 | Next.js (any), postcss | Requires @tailwindcss/postcss, not old tailwindcss postcss plugin |
| motion 13.1.0 | React 19 | Import from `motion/react` not `framer-motion` (same codebase, new package name) |
| resend 6.18.1 | Node 18+ | |
| zod 4.4.3 | TypeScript 5+ | v4 has breaking changes from v3 — check if any existing zod schemas from v1 need migration |

---

## Sources

- https://registry.npmjs.org/next/latest — Next.js 16.3.0 confirmed
- https://registry.npmjs.org/next-intl/latest — next-intl 4.13.6 confirmed
- https://next-intl.dev/docs/routing/navigation — createNavigation pattern
- https://next-intl.dev/docs/routing/middleware — middleware locale detection
- https://next-intl.dev/blog/next-intl-4-0 — v4 breaking changes (ESM-only, TypeScript 5+, NextIntlClientProvider requirement)
- https://registry.npmjs.org/@react-three/fiber/latest — R3F 9.7.0 confirmed, React 19.2 support
- https://r3f.docs.pmnd.rs/advanced/scaling-performance — frameloop="demand", PerformanceMonitor, Suspense patterns
- https://registry.npmjs.org/@react-three/drei/latest — drei 10.7.8 confirmed
- https://registry.npmjs.org/next-sanity/latest — next-sanity 13.3.1 confirmed
- https://registry.npmjs.org/sanity/latest — sanity 6.9.1 confirmed
- https://www.sanity.io/changelog — Sanity Studio v6 current, Sanity UI v4.0.0
- https://www.sanity.io/docs/localization — document-level vs field-level i18n strategies
- https://registry.npmjs.org/@sanity/document-internationalization/latest — 6.2.29 confirmed
- https://registry.npmjs.org/resend/latest — resend 6.18.1 confirmed
- https://resend.com/docs/send-with-nextjs — Route Handler pattern and {data, error} usage
- https://tailwindcss.com/docs/upgrade-guide — v4 changes: @theme config, @tailwindcss/postcss, browser floor
- https://tailwindcss.com/docs/installation/framework-guides/nextjs — postcss.config.mjs pattern
- https://ui.shadcn.com/docs/tailwind-v4 — shadcn/ui v4 compatibility confirmed
- https://registry.npmjs.org/motion/latest — motion 13.1.0 confirmed
- https://nextjs.org/docs/app/guides/lazy-loading — ssr:false must be in 'use client', pattern confirmed

---

*Stack research for: BrightByte Berlin Homepage v2 — bilingual Next.js marketing site with R3F hero*
*Researched: 2026-08-10*
