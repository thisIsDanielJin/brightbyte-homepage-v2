# Phase 4: 2D Marketing Sections — Research

**Researched:** 2026-08-13
**Domain:** Next.js 16 App Router · Tailwind v4 · next-intl 4 · motion/react 13 · Sanity + next-sanity · Resend · Playwright/axe
**Confidence:** HIGH (schema flags resolved from source; API shapes verified from installed packages)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01: Single Phase 4; planner slices into ~4-5 sequential plans.
- D-02: Full QA loop per section — Playwright desktop + mobile screenshot critique, ui-skills CLI, axe-playwright zero violations.
- D-03: Public dataset toggle (sanity.io/manage → production → Public). No token. USER ACTION required.
- D-04: Single-page scroll on `/de` and `/en`; in-page anchor nav (#services, #work, #contact).
- D-05: Section order: Hero → Services → Pricing → Work → Testimonials → About → Contact; Header top, Footer bottom.
- D-06: Hero uses static token-based backdrop in a `min-h-svh` fixed-height container. Phase 5 swaps backdrop for R3F canvas with zero CLS.
- D-07: Hero headline + subline from Sanity `siteSettings`. RESEARCH FLAG (resolved below).
- D-08: Contact form — 3 fields: Name, Email, Message.
- D-09: Route Handler at `app/api/contact/route.ts`, Zod validate, `{ data, error }` branch, never try/catch.
- D-10: Spam defense: honeypot + time-to-submit + per-IP rate limit. No CAPTCHA.
- D-11: Work grid — display only, no links. Subtle hover lift. 4–6 projects from Sanity.
- D-12: Impressum + Datenschutz as own routes. RESEARCH FLAG (resolved below).
- D-13: Footer on `--color-surface-dark` / `--color-on-dark` tokens.
- D-14: Whisper-quiet fades only (opacity 0→1, y 10→0, once, viewport amount 0.15, duration 0.5, ease [0,0,0.2,1]). Fully disabled under prefers-reduced-motion.

### Claude's Discretion
- Exact grid/column counts, spacing rhythm, and typographic scale per section (bounded by ui-skills + Phase 1 tokens).
- Header sticky vs. static behavior, CTA button placement/label, pricing-tier visual presentation.

### Deferred Ideas (OUT OF SCOPE)
- About-section real photo (no confirmed asset; ship with initials fallback).
- Cards linking to live client sites / deep case studies (Phase 7).
- CAPTCHA / Turnstile.
- Staggered reveals / parallax motion.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SEC-01 | Hero section with clear positioning statement | D-07 flag resolved: schema addition + seed path specified |
| SEC-02 | Services section in plain language | `getServices(locale)` query ready; card pattern documented |
| SEC-03 | Fixed pricing prominently displayed | `getServices` returns price object; display pattern documented |
| SEC-04 | Portfolio/work grid (4–6 projects, outcome notes) | `getProjects(locale)` ready; urlFor image pattern documented |
| SEC-05 | Testimonials (3 outcome-anchored) | `getTestimonials(locale)` ready; outcomeValue/outcomeLabel fields verified |
| SEC-06 | About section with photo/fallback | Initials fallback pattern specified; photo optional field documented |
| SEC-07 | Contact form via Resend + Zod | Route Handler pattern documented; resend NOT yet installed |
| SEC-08 | Header + footer + navigation | Sticky header IntersectionObserver pattern; dark footer tokens verified |
| SEC-09 | Impressum + Datenschutz pages | D-12 flag resolved: datenschutzBody schema addition specified |
| SEC-10 | Full mobile-responsive pass | Tailwind v4 breakpoints documented; 375px + 1440px test commands specified |
| SEC-11 | Restrained viewport-triggered motion | motion/react 13.1.0 confirmed; useReducedMotion API verified |
| QA-01 | Playwright screenshot-critique loop | Commands and config documented |
| QA-02 | ui-skills CLI applied per section | `npx ui-skills` invocation pattern documented |
| QA-03 | axe-playwright zero violations | @axe-core/playwright 4.12.1 installed; assertion pattern documented |
</phase_requirements>

---

## Summary

Phase 4 turns the placeholder locale shell into the full bilingual marketing site. The CMS query layer, token system, and routing shell are all complete from prior phases — this phase is primarily composition and QA. Every content section is a React Server Component calling an existing typed query; only the contact form introduces a new `'use client'` island and API route.

Three schema gaps must be patched before implementation: `heroHeadline`/`heroSubline` fields are absent from `siteSettings.ts`, a `datenschutzBody` field is absent, and `resend` is not yet installed. These are the only true blockers. All other dependencies are installed and verified.

The motion/react import is `motion/react` (not `framer-motion`), confirmed from the installed package's exports map. The `useReducedMotion()` hook is the correct mechanism to conditionally zero-out transition duration. The tokenless Sanity read client is correct as-is; the only action needed is the D-03 public dataset toggle at sanity.io/manage.

**Primary recommendation:** Patch the three schema gaps and install resend/zod in Wave 0. Then build sections as RSCs in D-05 order, running the per-section QA loop before advancing.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Content fetching (services/projects/testimonials/siteSettings) | API / Backend (RSC) | — | All Sanity reads happen at request/build time in Server Components; no client fetching |
| Hero static backdrop | Browser / Client | — | CSS gradient; no JS; Phase 5 swaps to R3F canvas |
| Sticky header scroll detection (active-section highlight) | Browser / Client | — | IntersectionObserver must run in browser; `'use client'` component |
| Contact form UI + validation | Browser / Client | — | Controlled inputs, submit state, inline errors require client interactivity |
| Contact form email delivery | API / Backend | — | Route Handler at `app/api/contact/route.ts` — never in client bundle |
| i18n routing + locale derivation | Frontend Server (SSR) | — | `params.locale` from URL segment; next-intl middleware; never client state |
| Section entrance animations | Browser / Client | — | motion/react `whileInView` requires `'use client'` wrapper or `<motion.section>` in a client component |
| Legal page content (Impressum/Datenschutz) | API / Backend (RSC) | — | `getSiteSettings(locale)` at request time |
| Image optimization | CDN / Static | Frontend Server | next/image + sharp at build; srcset served from Vercel edge |

---

## Research Flags — Resolved

### Flag D-07: Hero headline/subline in siteSettings

**Finding:** `siteSettings.ts` (lines 22–83) does NOT contain `heroHeadline` or `heroSubline` fields. [VERIFIED: sanity/schemaTypes/siteSettings.ts:22-83]

The current fields are: `siteTitle`, `navLabels`, `footerText`, `contactEmail`, `address`, `steuernummer`, `vatNote`, `defaultSeo`, `language`. The `footerText` field is a generic `text` — it cannot serve as a hero subline. No existing field is a viable substitute.

**Required schema addition** — add to `siteSettings.ts` after `footerText`:

```typescript
defineField({
  name: 'heroHeadline',
  title: 'Hero headline',
  type: 'string',
  validation: (Rule) => Rule.required().max(80),
  description: 'Main positioning headline in the hero section.',
}),
defineField({
  name: 'heroSubline',
  title: 'Hero subline',
  type: 'text',
  rows: 2,
  validation: (Rule) => Rule.max(200),
  description: 'Supporting subline below the hero headline.',
}),
```

**Required query change** — `SITE_SETTINGS_QUERY` in `lib/sanity/queries.ts` (line 84–93): add `heroHeadline, heroSubline` to the projection. [VERIFIED: lib/sanity/queries.ts:84-93]

Current projection (verbatim): `_id, siteTitle, navLabels, footerText, contactEmail, address, steuernummer, vatNote, defaultSeo`

Updated projection: append `, heroHeadline, heroSubline`

**Seed path:** After schema push (`npx sanity schema extract --force && sanity deploy`), author both DE and EN `siteSettings` documents in Sanity Studio. DE suggestion: headline "Webdesign, das Kunden gewinnt" / subline "Festpreise, keine Agentur-Bürokratie. Du arbeitest direkt mit mir." EN suggestion: headline "Web design that wins clients" / subline "Fixed prices, no agency overhead. You work directly with me." — exact wording is Claude's discretion (D-07), content is Sanity-controlled.

**Re-run `sanity typegen generate`** after schema push to regenerate `sanity.types.ts`.

---

### Flag D-12: Datenschutz body field in siteSettings

**Finding:** `siteSettings.ts` (lines 22–83) has Impressum fields (`address`, `steuernummer`, `vatNote`) but NO `datenschutzBody` or privacy-related body field. [VERIFIED: sanity/schemaTypes/siteSettings.ts:22-83]

**Required schema addition** — add after `vatNote`:

```typescript
defineField({
  name: 'impressumBody',
  title: 'Impressum body (additional)',
  type: 'text',
  description: 'Optional additional Impressum text below the structured fields.',
}),
defineField({
  name: 'datenschutzBody',
  title: 'Datenschutzerklärung body',
  type: 'text',
  description: 'Full Datenschutz/privacy policy text. Plain text — no Portable Text needed for static legal copy.',
  validation: (Rule) => Rule.required(),
}),
```

**Plain text vs Portable Text decision:** D-04 from Phase 3 comments states "plain string/text for short copy — no Portable Text." [VERIFIED: sanity/schemaTypes/siteSettings.ts:14] Legal body is long but structurally simple (sections separated by headings). `type: 'text'` (multi-line plain text) is correct for this phase; a future phase can migrate to Portable Text if rich formatting is needed. The page component renders it with `whitespace-pre-wrap` and applies the typography contract from the UI-SPEC.

**Required query change** — add `impressumBody, datenschutzBody` to `SITE_SETTINGS_QUERY` projection in `lib/sanity/queries.ts`.

**Seed path:** Author DE and EN `siteSettings` Datenschutz content in Sanity Studio post-deploy. Standard DSGVO Datenschutzerklärung for a solo German freelancer website; must include: Verantwortlicher, Kontaktdaten, Datenerhebung beim Besuch, Kontaktformular, Rechte der betroffenen Person, Hosting (Vercel). Daniel authors the legal text or uses a DSGVO generator — this is not a code deliverable.

---

### Flag SEC-06: About-section photo

**Finding:** No photo asset committed to the repo. [ASSUMED — no `public/` photo file found during exploration; confirmed by CONTEXT.md deferred section]

**Graceful design (ship now, swap later):**

```typescript
// components/sections/AboutSection.tsx
// Photo field is optional in the Sanity 'about' or siteSettings schema.
// Component handles both cases:

{settings.photo ? (
  <div className="relative w-30 h-30 md:w-40 md:h-40 rounded-full overflow-hidden flex-shrink-0">
    <Image
      src={urlFor(settings.photo).width(160).height(160).fit('crop').url()}
      alt="Daniel Jin Wodke"
      fill
      className="object-cover"
      sizes="(max-width: 768px) 120px, 160px"
    />
  </div>
) : (
  <div className="w-30 h-30 md:w-40 md:h-40 rounded-full bg-surface-muted flex items-center justify-center flex-shrink-0">
    <span className="text-2xl font-semibold text-secondary">DJ</span>
  </div>
)}
```

The About section ships with the initials fallback. When Daniel supplies a photo, it is uploaded to Sanity and the `photo` field is populated — no code change needed, only a Sanity Studio content update.

If the siteSettings schema needs a `photo` field, add:

```typescript
defineField({
  name: 'aboutPhoto',
  title: 'About photo',
  type: 'image',
  options: { hotspot: true },
  description: 'Photo of Daniel. Optional — initials mark shown if absent.',
}),
```

---

## Standard Stack

All packages below are installed at the versions shown unless noted.

### Core (installed, verified)

| Library | Version | Purpose | Source |
|---------|---------|---------|--------|
| next | 16.3.0 | App Router, RSC, Route Handlers, `next/image`, `next/dynamic` | [VERIFIED: package.json:22] |
| react / react-dom | 19.2.x | UI rendering | [VERIFIED: package.json:23-24] |
| next-intl | 4.13.6 | Path-based `/de` `/en` routing, `useTranslations`, `createNavigation` | [VERIFIED: package.json:25] |
| next-sanity | 13.3.2 | `createClient`, `defineQuery` | [VERIFIED: package.json:26] |
| @sanity/image-url | 2.1.1 | `urlFor()` responsive image URLs with hotspot | [VERIFIED: package.json:19] |
| motion | 13.1.0 | Viewport-triggered entrance animations | [VERIFIED: node_modules/motion/package.json — version 13.1.0, exports `./react` confirmed] |
| tailwindcss | 4.3.3 | Utility classes consuming `@theme` tokens | [VERIFIED: package.json devDependencies] |
| @tailwindcss/postcss | 4.3.3 | v4 PostCSS bridge | [VERIFIED: package.json devDependencies] |
| zod | 4.4.3 | Contact form server + client validation | [VERIFIED: package.json — installed] |
| sharp | 0.35.3 | next/image build-time optimization | [VERIFIED: package.json:29] |

### Must Install Before Implementation

| Library | Version | Purpose | Why Missing |
|---------|---------|---------|-------------|
| resend | ^6.18.1 | Transactional email for contact form | Not in package.json — not installed [VERIFIED: package.json check] |

**Install command:** `npm install resend`

### Dev / QA (installed, verified)

| Library | Version | Purpose |
|---------|---------|---------|
| @playwright/test | ^1.49.0 | Screenshot capture, navigation testing | [VERIFIED: package.json devDependencies] |
| @axe-core/playwright | 4.12.1 | Accessibility audit, zero-violation assertion | [VERIFIED: package.json devDependencies] |

---

## Package Legitimacy Audit

All packages are existing project dependencies installed from prior phases. Only `resend` is a new install.

| Package | Registry | Age | Downloads | Verdict | Disposition |
|---------|----------|-----|-----------|---------|-------------|
| resend | npm | ~3 yrs | Multi-million/wk | OK | Approved — official Resend SDK, widely deployed [ASSUMED — not re-verified this session via legitimacy seam] |

No packages removed. No suspicious packages flagged.

---

## Architecture Patterns

### System Architecture Diagram

```
URL: /de  or  /en
     │
     ▼
next-intl middleware (locale detection from path segment)
     │
     ▼
app/[locale]/layout.tsx  ← NextIntlClientProvider, Plus Jakarta Sans, <Header>, <Footer>
     │
     ├─── app/[locale]/page.tsx  (RSC, async)
     │         │
     │         ├─ getServices(locale) ──────────────► Sanity (public dataset)
     │         ├─ getProjects(locale) ──────────────► Sanity
     │         ├─ getTestimonials(locale) ──────────► Sanity
     │         ├─ getSiteSettings(locale) ──────────► Sanity
     │         │
     │         └─ renders in DOM order (D-05):
     │              <HeroSection />          (static backdrop, Sanity copy)
     │              <ServicesSection />       (RSC)
     │              <PricingSection />        (RSC — reads from services data)
     │              <WorkSection />           (RSC, next/image)
     │              <TestimonialsSection />   (RSC)
     │              <AboutSection />          (RSC, next/image or initials)
     │              <ContactSection />        ('use client' island)
     │
     ├─── app/[locale]/impressum/page.tsx   (RSC, getSiteSettings)
     ├─── app/[locale]/datenschutz/page.tsx (RSC, getSiteSettings)
     │
     └─── app/api/contact/route.ts          (Route Handler: POST)
               │
               ├─ parse Request JSON
               ├─ Zod validate (name, email, message; honeypot check; timing check)
               ├─ per-IP rate limit (in-memory Map or headers['x-forwarded-for'])
               └─ resend.emails.send({...}) → { data, error } branch
```

### Recommended Project Structure

```
app/
├── [locale]/
│   ├── layout.tsx              # Header + Footer wrapping all locale pages
│   ├── page.tsx                # Home: all 7 sections composed here
│   ├── impressum/
│   │   └── page.tsx
│   └── datenschutz/
│       └── page.tsx
├── api/
│   └── contact/
│       └── route.ts
components/
├── layout/
│   ├── Header.tsx              # 'use client' (IntersectionObserver, mobile nav state)
│   └── Footer.tsx              # RSC (siteSettings data passed as props)
├── sections/
│   ├── HeroSection.tsx         # 'use client' (motion/react wrapper)
│   ├── ServicesSection.tsx     # RSC + motion wrapper
│   ├── PricingSection.tsx      # RSC + motion wrapper
│   ├── WorkSection.tsx         # RSC + motion wrapper
│   ├── TestimonialsSection.tsx # RSC + motion wrapper
│   ├── AboutSection.tsx        # RSC + motion wrapper
│   └── ContactSection.tsx      # 'use client' (form state, fetch)
├── ui/
│   ├── MotionSection.tsx       # 'use client' — reusable entrance animation wrapper
│   └── LocaleSwitcher.tsx      # existing
lib/
├── sanity/
│   ├── client.ts               # existing — do not modify
│   ├── queries.ts              # add heroHeadline/heroSubline/datenschutzBody projections
│   └── image.ts                # existing urlFor()
├── i18n/
│   └── metadata.ts             # existing — reuse for legal page metadata
styles/
└── tokens.css                  # existing — do not modify (IDENT-01)
```

---

## Key Implementation Patterns

### Pattern 1: Single-page scroll with next-intl anchor nav (D-04)

In-page anchors work identically in Next.js 16 App Router as in any HTML document. The constraint is that `<Link>` from `next-intl`'s `createNavigation` handles locale-prefixed routes; for same-page anchors use a plain `<a>` tag.

```typescript
// components/layout/Header.tsx
// 'use client' required for scroll detection + mobile nav state

import Link from 'next/link' // or next-intl Link for locale routes
// For in-page anchors:
<a href="#services" className="text-sm font-medium text-secondary hover:text-primary">
  {t('nav.services')}
</a>

// Scroll margin to prevent section heading hiding behind sticky 64px header:
// In globals.css @layer base:
// [id] { scroll-margin-top: 80px; }  /* 64px header + 16px breathing room */
```

Active-section detection via IntersectionObserver (no scroll listeners):

```typescript
// rootMargin offsets: top -30% means section must be 30% down from viewport top
// to be considered "active" — prevents rapid flickering during scroll
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setActiveSection(entry.target.id)
    })
  },
  { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
)
```

Header sticky behavior (CSS-only, no JS):

```typescript
// Tailwind v4 — sticky header with scroll-triggered backdrop:
// Use CSS @starting-style or JavaScript scroll event to toggle a class.
// Simplest: 'use client' Header adds/removes 'scrolled' class via window.scrollY > 0
// Then: className={`fixed top-0 w-full z-50 h-16 transition-colors duration-150
//   ${scrolled ? 'bg-surface-subtle/90 backdrop-blur-sm shadow-sm' : 'bg-transparent'}`}
```

### Pattern 2: Server Component fetching Sanity per section vs page-level fetch

**Recommended:** One page-level fetch in `app/[locale]/page.tsx`, pass data as props to section components. This avoids N parallel Sanity requests and keeps the data waterfall predictable.

```typescript
// app/[locale]/page.tsx
import { getServices, getProjects, getTestimonials, getSiteSettings } from '@/lib/sanity/queries'

export default async function HomePage({ params }: { params: { locale: string } }) {
  const locale = params.locale  // URL-derived, never client state (Phase 2 invariant)

  const [services, projects, testimonials, settings] = await Promise.all([
    getServices(locale),
    getProjects(locale),
    getTestimonials(locale),
    getSiteSettings(locale),
  ])

  return (
    <>
      <HeroSection headline={settings?.heroHeadline} subline={settings?.heroSubline} />
      <ServicesSection services={services} />
      {/* ... */}
    </>
  )
}
```

`stega: false` is set on the client (lib/sanity/client.ts:26) — never pass or override it per-query. [VERIFIED: lib/sanity/client.ts:26]

### Pattern 3: motion/react v13 viewport entrance (D-14)

Import path confirmed from installed package exports: `motion/react` [VERIFIED: node_modules/motion/package.json exports `./react`]

```typescript
// components/ui/MotionSection.tsx
'use client'
import { motion, useReducedMotion } from 'motion/react'

interface MotionSectionProps {
  children: React.ReactNode
  id?: string
  className?: string
}

export function MotionSection({ children, id, className }: MotionSectionProps) {
  const prefersReduced = useReducedMotion()

  return (
    <motion.section
      id={id}
      className={className}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={
        prefersReduced
          ? { duration: 0 }
          : { duration: 0.5, ease: [0.0, 0.0, 0.2, 1] }
      }
    >
      {children}
    </motion.section>
  )
}
```

The `globals.css` `prefers-reduced-motion` CSS rule (`animation-duration: 0.01ms !important`) handles CSS transitions. `useReducedMotion()` from motion/react handles the JS animation layer. Both are needed. [ASSUMED — `useReducedMotion` export confirmed from motion/react exports map; hook behaviour verified against motion docs in training data]

**What does NOT use motion/react** (CSS transitions only per UI-SPEC):
- Header sticky backdrop transition
- Work card hover lift (`translate-y-[-4px] shadow-md`)
- Button hover states

### Pattern 4: Resend Route Handler (D-09, D-10)

```typescript
// app/api/contact/route.ts
import { Resend } from 'resend'
import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
  website: z.string().max(0), // honeypot — must be empty
  _timestamp: z.number(),     // time-to-submit check
})

// Per-IP rate limit (no external dep — in-memory, resets on cold start)
const ipLimiter = new Map<string, { count: number; reset: number }>()
const LIMIT = 3
const WINDOW_MS = 60 * 60 * 1000 // 1 hour

export async function POST(req: NextRequest) {
  // Per-IP rate limit
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  const now = Date.now()
  const record = ipLimiter.get(ip)
  if (record && now < record.reset) {
    if (record.count >= LIMIT) {
      return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
    }
    record.count++
  } else {
    ipLimiter.set(ip, { count: 1, reset: now + WINDOW_MS })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }

  // Honeypot: populated = bot. Return 200 silently (do not signal detection)
  if (parsed.data.website.length > 0) {
    return NextResponse.json({ ok: true })
  }

  // Time-to-submit: < 3 seconds = likely bot
  const timeToSubmit = now - parsed.data._timestamp
  if (timeToSubmit < 3000) {
    return NextResponse.json({ ok: true }) // silent pass
  }

  const { data, error } = await resend.emails.send({
    from: 'BrightByte Berlin <hello@brightbyte-berlin.com>',
    to: 'hello@brightbyte-berlin.com',
    subject: `Neue Anfrage von ${parsed.data.name}`,
    text: `Name: ${parsed.data.name}\nEmail: ${parsed.data.email}\n\n${parsed.data.message}`,
  })

  if (error) {
    return NextResponse.json({ error: 'send_failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, id: data?.id })
}
```

**Zod 4 note:** `z.string().email()` API unchanged from v3. [VERIFIED: zod 4.4.3 installed at package.json]

**Environment variable required:** `RESEND_API_KEY` in `.env.local` (Vercel project env). Never imported into client bundle.

### Pattern 5: next/image + urlFor for work grid / about

```typescript
import Image from 'next/image'
import { urlFor } from '@/lib/sanity/image'

// Work grid card — 4:3 aspect ratio
<div className="relative aspect-[4/3] rounded-sm overflow-hidden bg-surface-muted">
  {project.image ? (
    <Image
      src={urlFor(project.image).width(800).height(600).fit('crop').auto('format').url()}
      alt={project.title}
      fill
      className="object-cover"
      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
    />
  ) : (
    <div className="w-full h-full bg-surface-muted" /> // fallback block
  )}
</div>
```

`sharp` is installed (package.json:29) — next/image build-time optimization active. [VERIFIED: package.json:29]
`fill` prop requires the parent to have `position: relative` + explicit dimensions. Use `aspect-[4/3]` on the wrapper to reserve space and prevent CLS.

### Pattern 6: Legal pages with Sanity content

```typescript
// app/[locale]/impressum/page.tsx
import { getSiteSettings } from '@/lib/sanity/queries'
import { buildHreflangAlternates } from '@/lib/i18n/metadata'

export async function generateMetadata({ params }: { params: { locale: string } }) {
  return {
    title: params.locale === 'de' ? 'Impressum' : 'Legal Notice',
    alternates: buildHreflangAlternates('/impressum'),
  }
}

export default async function ImpressumPage({ params }: { params: { locale: string } }) {
  const settings = await getSiteSettings(params.locale)
  return (
    <main className="max-w-[720px] mx-auto px-4 py-16 md:px-8 md:py-24">
      <h1 className="text-4xl font-bold text-primary mb-8">Impressum</h1>
      <address className="text-sm text-secondary font-mono not-italic whitespace-pre-wrap">
        {settings?.address}
      </address>
      {/* steuernummer, vatNote, impressumBody */}
    </main>
  )
}
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image responsive sizing + optimization | Custom img srcset | `next/image` | Automatic WebP/AVIF, lazy loading, CLS prevention via aspect-ratio reservation |
| Sanity image URLs with crop/hotspot | String concatenation | `urlFor()` from `lib/sanity/image.ts` | Hotspot-aware crop math is non-trivial |
| Path-based locale routing | Custom middleware | next-intl middleware (already wired) | Edge middleware, Accept-Language fallback, hreflang already solved |
| Viewport intersection for active nav | scroll event listener | IntersectionObserver API | Scroll listeners fire on every pixel; IO is async and performant |
| Accessibility audit | Manual a11y check | `@axe-core/playwright` (already installed) | Automated WCAG AA rule engine; ~60% of violations auto-detectable |
| Email delivery | nodemailer / SMTP | `resend` SDK | Deliverability, DKIM, SPF handled; simple `{ data, error }` Result pattern |
| Spam filtering | Complex heuristics | honeypot + timing + per-IP | Sufficient for low-volume solo studio; no GDPR/cookie impact |
| Animation reduced-motion | CSS media query only | `useReducedMotion()` + CSS rule | CSS covers transitions; JS hook covers motion/react animations — both needed |

---

## Common Pitfalls

### Pitfall 1: Importing from `framer-motion` instead of `motion/react`

**What goes wrong:** `import { motion } from 'framer-motion'` — TypeScript error or wrong bundle loaded.
**Why it happens:** Training data / docs often reference `framer-motion`; the package was renamed.
**How to avoid:** Always `import { motion, useReducedMotion } from 'motion/react'`. [VERIFIED: node_modules/motion/package.json exports `./react`]
**Warning signs:** Module not found errors or a second large animation bundle in bundle analysis.

### Pitfall 2: `stega` tokens appearing in hero headline or legal page titles

**What goes wrong:** `generateMetadata` receives a Sanity string with stega encoding characters, corrupting `<title>` tags.
**Why it happens:** A second client without `stega: false`, or passing the raw siteSettings result to metadata without checking.
**How to avoid:** Use only `lib/sanity/client.ts` (stega: false is set globally). [VERIFIED: lib/sanity/client.ts:26] Never create a second client. The invariant test `tests/invariants/sanity-single-client.sh` catches violations.

### Pitfall 3: Anchor nav + sticky header = section headings hidden behind header

**What goes wrong:** Clicking `#services` scrolls the section heading under the 64px header.
**Why it happens:** Default scroll-to-anchor has no offset.
**How to avoid:** Add `scroll-margin-top: 80px` (header height + breathing room) to all `[id]` elements in `globals.css @layer base`.

### Pitfall 4: `'use client'` boundary too high, blocking RSC data fetching

**What goes wrong:** Wrapping an entire page section in a client component means it cannot be an `async` function — Sanity data must be fetched in a parent RSC and passed as props.
**Why it happens:** motion/react's `whileInView` requires a client component.
**How to avoid:** Use a thin `<MotionSection>` wrapper that is `'use client'` but receives content as `children`. The RSC section components pass their rendered output as children to the wrapper.

### Pitfall 5: `resend.emails.send()` wrapped in try/catch

**What goes wrong:** SDK errors are swallowed or re-thrown as unhandled promise rejections.
**Why it happens:** Muscle memory for async error handling.
**How to avoid:** Destructure `const { data, error } = await resend.emails.send({...})` and branch on `error`. [ASSUMED — Resend SDK Result pattern from CLAUDE.md invariants]

### Pitfall 6: Raw hex or `text-gray-*` in component files

**What goes wrong:** IDENT-01 invariant test `tests/invariants/no-raw-hex.sh` fails in CI.
**Why it happens:** Writing colors by eye in the component instead of using token utilities.
**How to avoid:** All colors via named Tailwind utilities that map to `@theme` tokens (`text-primary`, `bg-accent`, `border-border`, `bg-surface-dark`, `text-on-dark`, etc.). Run `npm run test:invariants` locally before committing.

### Pitfall 7: Locale derived from client state instead of URL segment

**What goes wrong:** `tests/invariants/no-locale-from-state.sh` CI guard fails.
**Why it happens:** Using `useLocale()` from next-intl in a place that triggers state reading; or reading from cookies/localStorage.
**How to avoid:** Always derive locale from `params.locale` in RSC page components. Pass as a prop or via next-intl's server-side `getLocale()`. Never `useState` for locale.

### Pitfall 8: Contact form `_timestamp` not set on mount

**What goes wrong:** Every submission is flagged as bot (timeToSubmit = 0).
**Why it happens:** Forgetting to record the form render time on the client.
**How to avoid:** In `ContactSection.tsx`, set a `const [timestamp] = useState(() => Date.now())` on mount; include it as `_timestamp` in the POST body.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `framer-motion` import | `motion/react` import (same code, renamed package) | ~2024 rebrand | Import path only; API identical |
| `tailwindcss.config.js` | `@theme {}` in CSS | Tailwind v4 (2024) | No config file — tokens in CSS |
| `tailwindcss` PostCSS plugin | `@tailwindcss/postcss` | Tailwind v4 | Separate package; old plugin breaks v4 |
| next-i18next | next-intl | — | next-i18next is Pages Router only |
| try/catch around Resend | `{ data, error }` destructure | Resend SDK design | Never throws; always returns error in Result |
| `React.lazy` + `dynamic` with default export | `dynamic(() => import(...), { ssr: false })` in `'use client'` | Next.js 13+ App Router | Must be in a client component to use `ssr: false` [VERIFIED: node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md] |

---

## Validation Architecture (Nyquist)

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Playwright (`@playwright/test` ^1.49.0) + `@axe-core/playwright` 4.12.1 |
| Config file | `playwright.config.ts` (verify/create in Wave 0) |
| Quick run command | `npx playwright test tests/a11y/ --project=chromium` |
| Full suite command | `npm run test` (invariants + a11y) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SEC-01 | Hero renders headline + subline in DE + EN at 375px + 1440px | Visual/screenshot | `playwright test tests/sections/hero.spec.ts` | Wave 0 |
| SEC-02 | Services section renders 2 cards, correct locale text | Visual/screenshot | `playwright test tests/sections/services.spec.ts` | Wave 0 |
| SEC-03 | Pricing section shows tier prices (ab €X / Auf Anfrage) | Visual/screenshot | `playwright test tests/sections/pricing.spec.ts` | Wave 0 |
| SEC-04 | Work grid renders 4+ cards with images + outcome notes | Visual/screenshot | `playwright test tests/sections/work.spec.ts` | Wave 0 |
| SEC-05 | Testimonials section: outcome metric above quote, 3 cards | Visual/screenshot | `playwright test tests/sections/testimonials.spec.ts` | Wave 0 |
| SEC-06 | About section: initials fallback renders; no broken layout | Visual/screenshot | `playwright test tests/sections/about.spec.ts` | Wave 0 |
| SEC-07 | Contact form: submit success path (200 from route handler) | Integration | `playwright test tests/contact/submit-success.spec.ts` | Wave 0 |
| SEC-07 | Contact form: validation errors shown inline | Integration | `playwright test tests/contact/validation.spec.ts` | Wave 0 |
| SEC-08 | Header sticky on scroll; hamburger on mobile | Visual/screenshot | `playwright test tests/layout/header.spec.ts` | Wave 0 |
| SEC-09 | Impressum page renders address + Steuernummer; Datenschutz renders body | Visual/screenshot | `playwright test tests/legal/pages.spec.ts` | Wave 0 |
| SEC-10 | All sections at 375px and 1440px: no overflow, no CLS | Visual/screenshot | All spec files run at both viewport sizes | Wave 0 |
| SEC-11 | Section entrance animation plays once; absent under prefers-reduced-motion | Visual + manual | `playwright test tests/motion/reduced.spec.ts` | Wave 0 |
| QA-01 | Playwright screenshot-critique loop per section | Visual/backstop | All tests above | Wave 0 |
| QA-02 | ui-skills review per section | Manual | `npx ui-skills start` → load relevant skill | Manual |
| QA-03 | axe-playwright zero violations, focus-visible present | a11y | `playwright test tests/a11y/axe.spec.ts` | Exists (a11y dir) |

### axe-playwright Pattern

```typescript
// tests/a11y/axe.spec.ts (extend existing)
import AxeBuilder from '@axe-core/playwright'

test('home page /de — zero axe violations', async ({ page }) => {
  await page.goto('/de')
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze()
  expect(results.violations).toEqual([])
})
```

### Screenshot capture pattern

```typescript
// tests/sections/hero.spec.ts
test.describe('Hero section', () => {
  for (const locale of ['de', 'en']) {
    for (const viewport of [{ width: 375, height: 812 }, { width: 1440, height: 900 }]) {
      test(`${locale} at ${viewport.width}px`, async ({ page }) => {
        await page.setViewportSize(viewport)
        await page.goto(`/${locale}`)
        await page.waitForLoadState('networkidle')
        await expect(page.locator('#hero')).toBeVisible()
        await page.locator('#hero').screenshot({
          path: `tests/screenshots/hero-${locale}-${viewport.width}.png`
        })
      })
    }
  }
})
```

### Reduced-motion test

```typescript
// tests/motion/reduced.spec.ts
test('no animation under prefers-reduced-motion', async ({ browser }) => {
  const context = await browser.newContext({
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  await page.goto('/de')
  // Sections should be immediately visible (no opacity:0 initial state persisting)
  await expect(page.locator('#services')).toBeVisible()
  // No translateY offset remaining
  const transform = await page.locator('#services').evaluate(
    (el) => window.getComputedStyle(el).transform
  )
  expect(transform).toBe('none')
})
```

### Sampling Rate

- **Per section commit:** `npm run test:invariants` (4 guards, ~5s) + `npx playwright test tests/a11y/axe.spec.ts`
- **Per wave merge:** `npm run test` (full suite)
- **Phase gate:** Full suite green + all screenshot critiques manually reviewed before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `tests/sections/hero.spec.ts` — covers SEC-01, SEC-10 at hero
- [ ] `tests/sections/services.spec.ts` — covers SEC-02
- [ ] `tests/sections/pricing.spec.ts` — covers SEC-03
- [ ] `tests/sections/work.spec.ts` — covers SEC-04
- [ ] `tests/sections/testimonials.spec.ts` — covers SEC-05
- [ ] `tests/sections/about.spec.ts` — covers SEC-06
- [ ] `tests/contact/submit-success.spec.ts` — covers SEC-07 happy path
- [ ] `tests/contact/validation.spec.ts` — covers SEC-07 error path
- [ ] `tests/layout/header.spec.ts` — covers SEC-08
- [ ] `tests/legal/pages.spec.ts` — covers SEC-09
- [ ] `tests/motion/reduced.spec.ts` — covers SEC-11
- [ ] `playwright.config.ts` — verify two-locale base URL config
- [ ] `resend` npm install — required before Route Handler implementation

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No auth in this phase |
| V3 Session Management | No | No sessions |
| V4 Access Control | No | Public marketing site |
| V5 Input Validation | Yes | Zod schema on POST body; per-field error messages |
| V6 Cryptography | No | No secrets stored or hashed |
| V13 API | Yes | Route Handler input validation; rate limiting |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Contact form spam flood | Denial of Service | Honeypot + time-to-submit + per-IP rate limit (D-10) |
| XSS via form input | Tampering | React escapes all string values by default; Zod validates shape |
| Bot submission that passes honeypot | Tampering | Time-to-submit check (< 3s = silent pass); rate limit as second layer |
| `RESEND_API_KEY` leaked to client | Information Disclosure | Never import in client component; only use in Route Handler |
| Locale injection via `params.locale` | Tampering | Zod or next-intl routing constrains to `['de','en']`; GROQ `$locale` param is a string filter, not SQL |

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build + dev | ✓ | ^22 (Vercel runtime) | — |
| next dev / next build | All sections | ✓ | 16.3.0 | — |
| Sanity dataset (public read) | All Sanity-fed sections | USER ACTION pending (D-03) | — | Sections render empty state if dataset is private |
| resend npm package | SEC-07 contact form | Not installed | — | Cannot ship contact form until installed |
| RESEND_API_KEY env var | SEC-07 | Not verified | — | Set in `.env.local`; required before Route Handler testing |
| Playwright | QA-01/02/03 | ✓ | ^1.49.0 | — |
| @axe-core/playwright | QA-03 | ✓ | 4.12.1 | — |

**Missing dependencies with no fallback:**
- `resend` package — must install before contact form work
- `RESEND_API_KEY` — must be set before Route Handler integration test
- Sanity public dataset toggle (D-03) — must be enabled before any Sanity-fed section renders real content

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `useReducedMotion()` is exported from `motion/react` in v13.1.0 | Motion pattern | Wrong import path; reduced-motion compliance fails QA-03 |
| A2 | Resend SDK `{ data, error }` Result pattern unchanged in v6.18.1 | Route Handler pattern | Would need try/catch fallback |
| A3 | `resend.emails.send()` accepts `from`, `to`, `subject`, `text` fields | Route Handler pattern | Email send fails at runtime |
| A4 | Daniel's about-section photo is not committed anywhere in the repo | Flag SEC-06 | Photo exists but wasn't found — initials fallback renders unnecessarily |
| A5 | `buildHreflangAlternates` from `lib/i18n/metadata.ts` accepts a path string argument | Legal pages pattern | Metadata helper signature differs; hreflang emitted incorrectly |
| A6 | per-IP in-memory rate limiter is acceptable for Vercel serverless (resets on cold start) | Route Handler | Bots targeting warm instances could bypass; acceptable for low-volume solo studio (D-10) |

---

## Open Questions

1. **RESEND_API_KEY availability**
   - What we know: `resend` is not installed; RESEND_API_KEY not confirmed in `.env.local`
   - What's unclear: Whether Daniel has a Resend account and API key ready
   - Recommendation: Wave 0 setup task — create Resend account, obtain API key, add to `.env.local` and Vercel project env

2. **Sanity public dataset D-03 timing**
   - What we know: All Sanity-fed sections return empty data until the dataset is toggled public
   - What's unclear: Whether the toggle has been applied since the CONTEXT was written (2026-08-13)
   - Recommendation: First task in Wave 1 — verify dataset is public; gate all content sections on this confirmation

3. **`lib/sanity/image.ts` export shape**
   - What we know: `lib/sanity/image.ts` exists and exports `urlFor()` (referenced in CONTEXT.md)
   - What's unclear: Exact function signature (not read this session)
   - Recommendation: Executor reads file before using; standard `@sanity/image-url` pattern expected

---

## Sources

### Primary (HIGH confidence)
- `sanity/schemaTypes/siteSettings.ts` lines 22–83 — schema fields verified verbatim
- `lib/sanity/queries.ts` lines 22–93 — query projections verified verbatim
- `lib/sanity/client.ts` lines 20–27 — client config verified verbatim
- `package.json` lines 1–43 — all dependency versions verified verbatim
- `node_modules/motion/package.json` — version 13.1.0, exports `./react` confirmed
- `node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md` — `ssr: false` in `'use client'` pattern confirmed
- `node_modules/zod/package.json` — version 4.4.3 confirmed

### Secondary (MEDIUM confidence)
- `.planning/phases/04-2d-marketing-sections/04-CONTEXT.md` — locked decisions D-01 through D-14
- `.planning/phases/04-2d-marketing-sections/04-UI-SPEC.md` — full visual contract, 6/6 verified
- `.planning/REQUIREMENTS.md` — SEC-01 through QA-03 definitions

### Tertiary (LOW confidence / ASSUMED)
- motion/react `useReducedMotion()` API — confirmed from exports map; hook behavior from training data
- Resend SDK `{ data, error }` Result pattern — from CLAUDE.md invariant; not installed for runtime verification

---

## Metadata

**Confidence breakdown:**
- Schema gap analysis: HIGH — read source files verbatim this session
- Standard stack versions: HIGH — read package.json verbatim
- motion/react API: MEDIUM — exports map confirmed, hook behavior assumed
- Route Handler pattern: HIGH — Next.js 16 docs confirmed `'use client'` + `ssr:false` pattern; Resend pattern from CLAUDE.md invariants
- QA tooling: HIGH — both Playwright and axe-core installed and verified

**Research date:** 2026-08-13
**Valid until:** 2026-09-13 (stable stack; resend/zod versions pinned)
