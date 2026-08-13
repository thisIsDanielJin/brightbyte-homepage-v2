# Roadmap: BrightByte Berlin Homepage v2

## Overview

Seven phases that build the site the way it must be built — identity locked first, then foundation, then content architecture, then sections, then the 3D hero, then SEO, then differentiators. Each phase is a hard gate for the next. The site is launchable after Phase 6; Phase 7 adds conversion-improving polish. v1's root problem — per-section improvisation — is prevented structurally by completing Phase 1 before any component work begins.

## Phases

- [x] **Phase 1: Identity & Design Tokens** - Define the full visual identity and token system before any component is built (completed 2026-08-11)
- [x] **Phase 2: i18n Shell & Routing** - Lay the path-based locale routing foundation that every page and link depends on (completed 2026-08-11)
- [x] **Phase 3: Sanity Content Architecture** - Lock the CMS schema and i18n strategy before any frontend is wired to content (completed 2026-08-12)
- [ ] **Phase 4: 2D Marketing Sections** - Build all P1 sections to a high-end UX bar with Playwright critique and ui-skills
- [ ] **Phase 5: R3F Hero** - Add the isolated 3D hero with performance budgets met and reduced-motion fallback
- [ ] **Phase 6: SEO Layer & Programmatic Pages** - Preserve and extend v1's German SEO asset with full bilingual hreflang
- [ ] **Phase 7: P2 Differentiators & Polish** - Case studies, FAQ, process section, motion tuning, final a11y audit

## Phase Details

### Phase 1: Identity & Design Tokens

**Goal**: A single, fully resolved visual identity — palette, typography, logo, brand voice — expressed as a complete CSS `@theme` token system that every subsequent component consumes without exception.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: IDENT-01, IDENT-02, IDENT-03, IDENT-04
**Success Criteria** (what must be TRUE):

  1. `styles/tokens.css` contains a single `@theme` block defining every palette, type scale, spacing, and motion easing value used anywhere in the site — zero raw hex values or `text-gray-*` in any component file
  2. A resolved logo mark exists (SVG, not an abandoned experiment) that renders correctly on both light and dark backgrounds
  3. Typography is locked to a maximum of 2 typefaces; the combination reads as calm, editorial, and professional when rendered at heading and body sizes
  4. A brand voice guide (1 page) defines tone, sentence style, and forbidden patterns; all v2 copy is written against it
  5. WCAG AA contrast ratios are verified for every foreground/background token pair before any component is built

**Plans**: 2/2 plans executed

- [x] 01-01-PLAN.md — Walking skeleton: Next.js scaffold + single @theme tokens.css + font bridge + /token-audit page + Wave 0 contrast/invariant gates (IDENT-01, IDENT-02)
- [x] 01-02-PLAN.md — Wordmark logo (light + dark, text-as-paths SVG) + 1-page brand voice guide (IDENT-03, IDENT-04)

**UI hint**: yes

### Phase 2: i18n Shell & Routing

**Goal**: Path-based `/de`/`/en` locale routing fully operational — middleware, layout shell, dictionary loader, hreflang utility, and sitemap skeleton — so every page and link built afterwards is locale-correct from the start.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: I18N-01, I18N-02, I18N-03
**Success Criteria** (what must be TRUE):

  1. Navigating to `/` redirects to `/de`; navigating to `/en` serves the English locale; both routes return the correct `<html lang="...">` attribute
  2. Both `/de` and `/en` emit bidirectional hreflang tags (each locale lists the other plus itself) and `x-default` pointing to `/de` — verified with `curl` on both
  3. The language switcher navigates from `/de/...` to `/en/...` (and back) preserving the current path segment, implemented as `<Link>` with no client-side state mutation
  4. A smoke test in CI catches any client-side locale leak (locale derived from URL only, never from localStorage or component state)

**Plans**: 3/3 plans executed
**Wave 1**

- [x] 02-01-PLAN.md — Tracer: install next-intl + Wave 0 tests + three-file config + proxy.ts + [locale] layout shell + root redirect (I18N-01)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 02-02-PLAN.md — hreflang expansion: shared generateMetadata helper + localized sitemap, bidirectional + x-default→/de (I18N-02)
- [x] 02-03-PLAN.md — Language switcher: pure <Link> path-preserving switcher in minimal [locale] header (I18N-03)

### Phase 3: Sanity Content Architecture

**Goal**: Sanity schema fully defined and i18n strategy locked (document-level for editorial types); all v1 content consolidated from its 3 conflicting sources and migrated into Sanity as the single source of truth; typed GROQ queries ready for Phase 4 components to consume.
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: CMS-01, CMS-02, CMS-03
**Success Criteria** (what must be TRUE):

  1. Sanity Studio shows schema types for `project`, `testimonial`, `service`, `seoPage`, and `siteSettings`; `@sanity/document-internationalization` is configured with DE and EN document pairs for all editorial types
  2. All v1 content (bilingual service/pricing/FAQ copy, the 3 outcome-anchored testimonials, and positioning copy) exists in Sanity as the single source of truth — the 3 conflicting v1 sources (inline `.tsx`, `dictionaries/`, `data/content.ts`) are retired
  3. Every GROQ query in `lib/sanity/queries.ts` is typed; `stega: false` is present in all `generateStaticParams` and `generateMetadata` call paths — verified by running a build with no stega corruption in page titles or slugs

**Plans**: 3/3 plans executed

- [x] 03-01-PLAN.md
- [x] 03-02-PLAN.md
- [x] 03-03-PLAN.md

### Phase 4: 2D Marketing Sections

**Goal**: Every P1 marketing section built to a high-end UX bar — readable, mobile-responsive, accessible, animated with restraint — with every section passing a Playwright screenshot-critique loop and ui-skills review before it is considered done.
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: SEC-01, SEC-02, SEC-03, SEC-04, SEC-05, SEC-06, SEC-07, SEC-08, SEC-09, SEC-10, SEC-11, QA-01, QA-02, QA-03
**Success Criteria** (what must be TRUE):

  1. All 9 core sections (hero shell, services, pricing, work grid, testimonials, about, contact form, header/footer/nav, Impressum/Datenschutz) render correctly in both DE and EN locales at 375px and 1440px viewport widths
  2. The contact form submits successfully via the Resend server action with Zod validation; the user sees a confirmation message on success and an inline error on failure — no full-page reload
  3. Every section has passed a Playwright screenshot-critique loop (desktop + mobile screenshots reviewed and iterated); ui-skills CLI principles applied per section
  4. `axe-playwright` reports zero violations across all sections; all interactive elements have `:focus-visible` styles; text contrast meets WCAG AA against actual rendered backgrounds
  5. Section entrance animations use `motion/react` viewport triggers; no animation plays if `prefers-reduced-motion: reduce` is set

**Plans**: 2/4 plans executed

- [x] 04-01-PLAN.md — Tracer: Wave 0 (resend install, Playwright projects, spec scaffolds, siteSettings heroHeadline/heroSubline + re-seed) -> real Header + Footer + Hero fully built & QA'd end-to-end (SEC-01, SEC-08, SEC-11, QA-01/02/03)
- [x] 04-02-PLAN.md — Content sections: Services, Pricing, Work grid, Testimonials, About + aboutPhoto field, each through the per-section QA loop (SEC-02, SEC-03, SEC-04, SEC-05, SEC-06, SEC-10)
- [ ] 04-03-PLAN.md — Contact form: Route Handler (Zod + Resend + honeypot/timing/rate-limit) + client submit UX with inline success/error (SEC-07)
- [ ] 04-04-PLAN.md — Legal routes (Impressum + Datenschutz from Sanity, datenschutzBody field) + footer dark-surface verification + final phase a11y/mobile/motion gate (SEC-09, SEC-10, SEC-11, QA-01/02/03)

**UI hint**: yes

### Phase 5: R3F Hero

**Goal**: One elegant, performance-budgeted 3D hero centerpiece — fully isolated via `next/dynamic({ ssr: false })`, meeting LCP < 2.5s on mobile Lighthouse, CLS = 0, with a static fallback for reduced-motion users.
**Mode:** mvp
**Depends on**: Phase 4
**Requirements**: HERO-01, HERO-02
**Success Criteria** (what must be TRUE):

  1. The R3F hero renders without hydration errors in production; it is loaded exclusively via `next/dynamic({ ssr: false })` — importing it in any Server Component causes a build error that is confirmed absent
  2. Lighthouse mobile audit (Moto G4 profile) shows LCP < 2.5s and CLS = 0 with the hero mounted — measured after hero integration, not just on the shell
  3. When `prefers-reduced-motion: reduce` is set, no Canvas element is rendered — the static `HeroFallback` component displays instead with the same container dimensions (no layout shift)
  4. Draw call count stays under 200 in a production build; `PerformanceMonitor` adaptive DPR scaling is active and verified on a throttled connection

**Plans**: TBD
**UI hint**: yes

### Phase 6: SEO Layer & Programmatic Pages

**Goal**: v1's ~30 German programmatic SEO pages preserved and extended to bilingual, with JSON-LD structured data per page, a complete bilingual sitemap, and hreflang verified end-to-end in a deployed environment.
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: SEO-01, SEO-02, SEO-03
**Success Criteria** (what must be TRUE):

  1. All ~30 `/s/[slug]` pages render for both `/de/s/[slug]` and `/en/s/[slug]` locales via `generateStaticParams`; no slug returns a 404 in either locale
  2. Every page (home, section anchors, programmatic pages) has valid JSON-LD structured data — verified with Google's Rich Results Test on a Vercel preview URL
  3. `sitemap.xml` includes all locale variants with `alternates.languages` entries for every URL; `robots.txt` allows crawling of all public routes; verified with a sitemap validator
  4. Bidirectional hreflang on all pages verified with `curl` post-deploy: each locale variant lists all others and itself, with `x-default` pointing to `/de`

**Plans**: TBD

### Phase 7: P2 Differentiators & Polish

**Goal**: Conversion-improving additions (case studies, FAQ, process section, guarantee framing) layered onto a complete, live site — plus final motion tuning and a full accessibility audit pass.
**Mode:** mvp
**Depends on**: Phase 6
**Requirements**: (P2 scope — no v1 requirement IDs; see v2 deferred requirements in REQUIREMENTS.md)
**Success Criteria** (what must be TRUE):

  1. Deep case study pages exist for Blumenspiess, Learnstep, and Lumo — each with problem → solution → measured outcome structure, accessible from the work grid
  2. FAQ (5–7 questions), Process/How-it-works (3-step), and "You own the code" guarantee sections are live in both DE and EN locales
  3. Final `axe-playwright` audit across all pages shows zero violations; Vercel Speed Insights shows green Core Web Vitals on production
  4. All section motion passes a final refinement review — timing, easing, and intensity are consistent with the identity tokens defined in Phase 1

**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Identity & Design Tokens | 2/2 | Complete    | 2026-08-11 |
| 2. i18n Shell & Routing | 3/3 | Complete    | 2026-08-11 |
| 3. Sanity Content Architecture | 3/3 | Complete    | 2026-08-12 |
| 4. 2D Marketing Sections | 2/4 | In Progress|  |
| 5. R3F Hero | 0/TBD | Not started | - |
| 6. SEO Layer & Programmatic Pages | 0/TBD | Not started | - |
| 7. P2 Differentiators & Polish | 0/TBD | Not started | - |
