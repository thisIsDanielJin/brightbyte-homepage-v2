# Project Research Summary

**Project:** BrightByte Berlin — Homepage v2
**Domain:** Bilingual (DE/EN) freelance web-design studio marketing site, Berlin SMB audience
**Researched:** 2026-08-10
**Confidence:** MEDIUM

## Executive Summary

BrightByte Berlin v2 is a rebuild of a half-migrated freelance studio marketing site. The core problem is clear: v1 accumulated three competing styling systems, two conflicting visual directions, and client-side i18n with no per-URL SEO value. The recommended approach is a strict identity-first build — define palette, type scale, and spacing tokens before writing a single component, then express that identity consistently across a clean set of 2D sections, with a single performance-budgeted R3F 3D hero moment as the standout craft signal. The entire stack (Next.js 16 App Router, React 19, Tailwind v4, next-intl, Sanity v6, Resend, R3F 9) is already validated against npm and official docs; no major technology choices remain open.

The site must convert Berlin SMB visitors into project inquiries. Research is unambiguous about what drives that conversion: clear fixed pricing upfront, outcome-anchored testimonials (three verified gold-standard results already exist: +200% inquiries, 92% bookings, +47% leads), plain-language service descriptions, and a solo-studio "you work directly with me" framing. All differentiating features (case studies, FAQ, process section) are straightforward to implement once the identity and section structure are locked. The programmatic German SEO system (~30 keyword pages in v1) is a significant existing traffic asset and must be preserved with bilingual hreflang from day one.

The two highest-risk areas are both architectural gates that must be resolved before any UI work begins: (1) the visual identity must be fully defined as a token system before any component is built — v1 proved that per-section improvisation produces an "AI-generated" look that directly contradicts the craft brand promise; and (2) the Sanity i18n strategy (document-level vs field-level) must be decided and schema written before frontend components are wired to content — migrating between strategies mid-project costs 2–3 days. Everything else is well-documented with established patterns.

---

## Key Findings

### Recommended Stack

The stack is a modern, cohesive set of tools that work well together with no major compatibility risks. Next.js 16 App Router with React 19 is the correct foundation — server components reduce client bundle weight, App Router handles path-based i18n cleanly, and `generateStaticParams` pre-renders all ~30 programmatic SEO pages at build time. Tailwind v4 (CSS `@theme` block, no `tailwind.config.js`) is the single styling system — this is the direct architectural fix for v1's sprawl. next-intl v4 handles all locale routing, middleware detection, and hreflang generation without manual plumbing.

The two integrations that require the most care are R3F and Sanity. R3F must always be loaded via `next/dynamic({ ssr: false })` — importing it in a Server Component is a build error. Sanity v6 + next-sanity 13 provides `defineLive()` for real-time preview, but `stega: false` must be passed in all `generateStaticParams` and `generateMetadata` calls — stega encoding corrupts URL slugs and `<title>` tags silently.

**Core technologies:**
- **Next.js 16.3 + React 19**: App Router, RSC-first, path-based i18n, static generation
- **Tailwind v4**: Single styling system via CSS `@theme` tokens — the architectural fix for v1's mixed-system sprawl
- **next-intl 4.13**: Path-based `/de`/`/en` routing, middleware locale detection, hreflang generation
- **@react-three/fiber 9.7 + @react-three/drei 10.7**: Full React 19 compatibility; isolate entirely in `components/hero/` with `ssr: false`
- **Sanity v6 + next-sanity 13.3**: Retained from v1; `defineLive()` for live preview; `@sanity/document-internationalization` for document-level DE/EN content
- **Resend 6.18 + Zod 4.4**: Contact form via Route Handler; destructure `{ data, error }` response; Zod validates before SDK call
- **motion 13.1**: Subtle viewport-triggered section animations only; import from `motion/react`; never in the 3D hero layer
- **Vercel + sharp + @vercel/speed-insights**: LCP/CLS regression monitoring essential given 3D hero

**Critical version notes:**
- Sanity v6 requires Node 22.12+ — verify Vercel project runtime setting
- next-intl v4 is ESM-only; ESM-only requirement confirmed
- Zod v4 has breaking changes from v3 — any v1 schemas need migration review
- `motion` package replaces `framer-motion` branding; import path is `motion/react`

### Expected Features

**Must have at launch (P1 — table stakes):**
- Hero with clear positioning statement targeting Berlin SMB owners
- Services section in plain language (not technical jargon)
- Fixed pricing packages prominently displayed (€690 landing page, ~€2,500 multi-page) — hiding price is the #1 lead-killer for SMBs
- Portfolio grid (4–6 projects minimum with outcome notes)
- Outcome-anchored testimonials — the 3 verified quotes from v1 with measurable results in large type
- About section — real photo, solo-studio framing, no fake team
- Contact form — 5 fields max, confirmation feedback, Resend delivery
- Bilingual DE/EN with path-based routing and correct hreflang per URL
- Impressum + Datenschutz — required by German law
- Mobile-responsive layout — full pass on all sections

**Should have post-launch (P2 — differentiators):**
- Deep case study pages for Blumenspiess, Learnstep, Lumo (problem → solution → measured outcome)
- FAQ section — pre-handles 5–7 recurring prospect questions
- Process / How it works section — 3-step framing reduces SMB anxiety
- "You own the code" guarantee section
- German programmatic SEO pages — preserve v1's ~30 `/s/[slug]` pages
- Language switcher with path-aware navigation

**Defer to future (P3):**
- Blog / Insights — only if 1 post/month commitment is realistic; empty blog signals neglect more than no blog
- Industry-matched testimonial surfacing — worthwhile only when testimonial count reaches 6+

**Anti-features (deliberately excluded):**
- 3D/WebGL in multiple sections — one contained hero moment only
- Cursor particle effects, generative scroll animation — contradicts "calm, editorial" brand promise
- Auto-playing video, chat widget, social feed embeds, Calendly, testimonial carousel, awards badge wall

### Architecture Approach

The architecture is a standard Next.js App Router static site with three clearly separated layers: Server Components (RSC) for all data-fetching pages and 2D sections, a small number of Client Component islands (`ContactForm`, `LocaleSwitcher`, mobile nav), and a fully isolated 3D layer loaded via `next/dynamic({ ssr: false })`. All user-facing routes live under `app/[locale]/`. The single most important architectural decision is the design token system: all palette, type scale, spacing, and motion easing in one `styles/tokens.css` `@theme` block, consumed everywhere via Tailwind utility classes. Components never hardcode values.

**Major components:**
1. `middleware.ts` — Accept-Language detection, redirect `/` to `/de`, alternate link headers
2. `app/[locale]/layout.tsx` — Root HTML shell with `<html lang={locale}>`, SanityLive, font loading
3. `styles/tokens.css` — Single `@theme` block: entire visual identity as CSS custom properties
4. `components/hero/HeroCanvas.tsx` — Fully isolated `'use client'` R3F canvas, `next/dynamic({ ssr: false })` only
5. `components/sections/*` — Server Components receiving dict strings + Sanity data as props; never import R3F
6. `lib/sanity/queries.ts` — All GROQ queries centralized; no inline GROQ in pages
7. `app/actions.ts` — `sendContactEmail` server action; Zod validation before Resend call
8. `app/sitemap.ts` — Programmatic bilingual sitemap with `alternates.languages` for all pages

### Critical Pitfalls

1. **R3F without `ssr: false` → hydration mismatch + LCP regression** — Always use `dynamic(() => import('./HeroCanvas'), { ssr: false })`. `'use client'` alone is not sufficient. Add `HeroFallback` with explicit `aspect-ratio` container to prevent CLS. Set `frameloop="demand"` for static/ambient scenes.

2. **Design incoherence ("AI-generated look")** — Define the complete brand identity in `tokens.css` before building any component. Playwright screenshot comparison gate per section. Lint rule: zero raw hex values or `text-gray-*` in component files.

3. **hreflang bidirectionality broken → silent SEO failure** — Every locale variant must list all other variants and itself. Use a shared `buildAlternates()` utility. Set `metadataBase` in root layout. Add `x-default` pointing to `/de`. Verify with `curl` on both locales post-deploy.

4. **Wrong Sanity i18n strategy chosen then migrated mid-project** — Decide before schema work: document-level (`@sanity/document-internationalization`) for editorial types (`project`, `testimonial`); field-level for simple site settings only. Migrating between strategies costs 2–3 days.

5. **R3F hero killing mobile Core Web Vitals** — LCP < 2.5s on Moto G4 in Lighthouse is the hard budget. `PerformanceMonitor` for adaptive quality. `prefers-reduced-motion` fallback (no Canvas rendered at all). Under 200 draw calls.

6. **Client-side locale leak re-introduced** — Language switcher must be `<Link href="/en/...">`, not state mutation. Locale from URL segment only. Add smoke test to CI.

7. **Accessibility failure contradicting the craft brand promise** — Measure text contrast against the actual 3D scene background (WCAG AA). `:focus-visible` on all interactive elements. `axe-playwright` per section.

---

## Implications for Roadmap

### Phase 1: Identity & Design Tokens
**Rationale:** Hard architectural gate — v1's root cause was per-section improvisation. Token system must exist before any component is styled. Also resolves the logo (14 abandoned experiments in v1).
**Delivers:** `styles/tokens.css` full `@theme` block, typography choices (max 2 typefaces), brand voice guidelines, resolved logo, Playwright screenshot reference for all subsequent section reviews.
**Avoids:** Design incoherence pitfall (Pitfall 2); accessibility contrast ratios baked in from start (Pitfall 7)
**Research flag:** NEEDS RESEARCH — deep design research to land specific visual direction; ui-skills CLI context load recommended

### Phase 2: i18n Shell & Routing Foundation
**Rationale:** Path-based locale routing is the foundational structure everything else depends on. Getting this right now means hreflang and sitemap alternates are correct from the first deployment.
**Delivers:** `middleware.ts`, `app/[locale]/layout.tsx`, `i18n/routing.ts`, `getDictionary()`, placeholder messages, `buildAlternates()` utility, `app/sitemap.ts` shell, smoke tests.
**Avoids:** hreflang bidirectionality pitfall (Pitfall 3); client-side locale leak (Pitfall 6)
**Research flag:** Standard patterns — skip research phase

### Phase 3: Sanity Content Architecture
**Rationale:** Schema must be decided before frontend components are wired to CMS data. Document-level vs field-level is irreversible without costly migration. v1 content migration should happen here so UI phases use real content.
**Delivers:** Sanity schema types (`project`, `testimonial`, `service`, `seoPage`, `siteSettings`); `lib/sanity/client.ts` with `defineLive()`; typed GROQ queries; v1 content migrated; `@sanity/document-internationalization` configured.
**Avoids:** Wrong Sanity i18n strategy pitfall (Pitfall 4); stega corruption in metadata
**Research flag:** Standard patterns — skip research phase

### Phase 4: 2D Section Build (Core Marketing Sections)
**Rationale:** With identity tokens and i18n shell in place, all P1 table-stakes sections can be built as Server Components. The site should be launchable after this phase minus the 3D hero.
**Delivers:** All P1 sections — SectionHero (shell only), SectionServices, SectionWork, SectionTestimonials, SectionPricing, SectionAbout, ContactForm + server action, SiteHeader, SiteFooter, LocaleSwitcher, Impressum, Datenschutz. Full mobile-responsive pass.
**Avoids:** Design incoherence (Playwright screenshot gate per section); contact form accessibility
**Research flag:** Standard patterns — ui-skills CLI context per section; Playwright critique loop

### Phase 5: R3F Hero
**Rationale:** Isolated to its own phase because it has a separate technical risk profile. Building after the 2D shell means performance regressions are clearly attributable to the hero.
**Delivers:** `HeroCanvas.tsx`, `HeroScene.tsx`, `HeroFallback.tsx`; wired via `next/dynamic({ ssr: false })`; `PerformanceMonitor` adaptive DPR; `frameloop="demand"`; `prefers-reduced-motion` static fallback; Lighthouse mobile LCP < 2.5s confirmed; CLS = 0 confirmed.
**Avoids:** R3F hydration mismatch (Pitfall 1); mobile performance regression (Pitfall 5); accessibility failure (Pitfall 7)
**Research flag:** NEEDS RESEARCH — specific 3D hero concept/composition; draw call budget for chosen scene

### Phase 6: SEO Layer & Programmatic Pages
**Rationale:** Programmatic SEO pages depend on Sanity schema (Phase 3) and locale routing (Phase 2) — only buildable after both are stable. Full hreflang implementation verified end-to-end.
**Delivers:** `app/[locale]/s/[slug]/page.tsx` with `generateStaticParams` for all locale+slug combinations; JSON-LD per page; complete sitemap; `robots.ts`; hreflang verified bidirectionally post-deploy.
**Avoids:** hreflang bidirectionality (Pitfall 3); missing EN locale variant for programmatic pages
**Research flag:** Standard patterns — skip research phase

### Phase 7: P2 Differentiators & Polish
**Rationale:** Post-launch additions that improve conversion and SEO but are not required for go-live. Final accessibility audit and motion polish here.
**Delivers:** Case study pages for 3 anchor clients; FAQ section; Process / How it works; "You own the code" guarantee; motion tuning; `axe-playwright` zero violations audit; speed insights confirmed green.
**Research flag:** Standard patterns — skip research phase

### Phase Ordering Rationale

- Identity must precede all components: every component decision is constrained by the token system — building before tokens produces v1's problem
- i18n routing before content: URL structure affects every link, meta tag, and GROQ query; no URL migrations later
- Sanity schema before frontend wiring: GROQ shapes, locale strategy, and type definitions inform component props
- 2D sections before 3D hero: hero is a flourish on top of a working site; decoupling it makes performance regressions traceable
- SEO layer after schema + routing: programmatic pages require stable Sanity slugs and stable locale URL patterns
- P2 last: differentiators are additive and non-blocking

### Research Flags

Phases needing deeper research during planning:
- **Phase 1 (Identity & Design Tokens):** Visual direction for a refined Berlin SMB studio requires deep design research — reference sites, typography combinations, palette mood. Cannot be solved by technical research alone.
- **Phase 5 (R3F Hero):** Scene geometry, lighting, draw call budget, and tasteful/non-tech-demo balance are all open. Worth researching Draco compression if loading GLTF models.

Phases with standard patterns (skip research phase):
- **Phase 2, 3, 4, 6, 7:** All patterns fully documented in STACK.md and ARCHITECTURE.md; official docs are comprehensive.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | Versions npm-verified; integration patterns from official docs; R3F + Next.js 16 App Router has no single authoritative guide |
| Features | MEDIUM | Table stakes and anti-features from first-party v1 data (HIGH for those); SMB psychology from domain expertise, not empirical data |
| Architecture | MEDIUM | Official Next.js + Sanity + next-intl docs verified; R3F isolation patterns well-established |
| Pitfalls | MEDIUM | Critical pitfalls verified against official docs + v1 post-mortem; design incoherence and Sanity strategy pitfalls from direct v1 experience (HIGH for those two) |

**Overall confidence:** MEDIUM

### Gaps to Address

- **Visual identity direction:** Research constrains but cannot determine specific palette, type choices, or 3D hero composition — design creative work required in Phase 1
- **3D hero concept:** Scene geometry, lighting, and animation approach is undefined; Phase 5 needs reference gathering and concept sketches before implementation
- **Logo resolution:** v1 has ~14 abandoned experiments, no resolved mark; Phase 1 deliverable but direction is open
- **Copy consolidation:** v1 has conflicting copy across three sources — audit and consolidation needed before Phase 4
- **Node 22.12+ on Vercel:** Sanity v6 requirement; verify Vercel project's Node runtime setting before Phase 3 deployment

---

## Sources

### Primary (HIGH confidence — first-party)
- `PROJECT.md` — BrightByte Berlin v2 requirements, constraints, v1 post-mortem diagnosis
- v1 codebase (`~/Documents/daniel-jin-studio-homepage`) — testimonial metrics, pricing, positioning, existing SEO system

### Primary (HIGH confidence — official docs)
- npm registry — all package versions verified
- https://nextjs.org/docs — App Router i18n, Server Actions, generateMetadata, sitemap API
- https://next-intl.dev/docs — middleware, createNavigation, v4 breaking changes
- https://sanity.io/docs/localization — document-level vs field-level strategy
- https://tailwindcss.com/docs/upgrade-guide — v4 @theme config
- https://resend.com/docs/send-with-nextjs — Route Handler pattern
- https://r3f.docs.pmnd.rs/advanced/pitfalls — SSR pitfalls, frameloop, PerformanceMonitor
- https://developers.google.com — hreflang bidirectionality, x-default requirements

### Secondary (MEDIUM confidence)
- Cuberto.com live site analysis — competitive reference for studio site patterns
- Domain expertise on SMB psychology and German web market — feature prioritization rationale

### Tertiary (LOW confidence — unavailable at research time)
- Smashing Magazine, CreativeBloq, Webflow blog — HTTP 404/403 at time of research; findings cross-referenced against first-party evidence

---
*Research completed: 2026-08-10*
*Ready for roadmap: yes*
