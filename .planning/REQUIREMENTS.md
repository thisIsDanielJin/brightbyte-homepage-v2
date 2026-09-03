# Requirements — BrightByte Berlin Homepage v2

**Core value:** The site must *feel* refined, modern, and quietly stunning on first impression — a calm, confident visual identity expressed consistently across every section — so a local SMB owner immediately trusts the craft.

**Success metric:** Inbound project inquiries via the contact form.

---

## v1 Requirements

### Identity & Design System

- [x] **IDENT-01**: A single design-token system (`@theme` in one CSS file) defines the full palette, type scale, spacing, and motion easing — every component consumes tokens, never raw values
- [x] **IDENT-02**: A resolved, refined visual identity (palette + max 2 typefaces + visual language) grounded in deep design research, reading as professional and calm to SMB clients
- [x] **IDENT-03**: A resolved logo mark (replacing v1's inline SVG + ~14 abandoned experiments)
- [x] **IDENT-04**: A defined brand voice / tone applied consistently across all copy

### Internationalization & Routing

- [x] **I18N-01**: Path-based bilingual routing (`/de`, `/en`) with DE as default, locale derived from URL segment only (no client-side state)
- [x] **I18N-02**: Correct per-URL bidirectional hreflang (incl. `x-default` → `/de`) on every page, emitted in both page `<head>` and sitemap
- [x] **I18N-03**: Path-aware language switcher (`<Link>`-based, preserves current page)

### Content Architecture (Sanity CMS)

- [x] **CMS-01**: Sanity schema for editable content types (projects, testimonials, services, SEO pages, site settings) with a single chosen i18n strategy (document-level for editorial types)
- [x] **CMS-02**: v1 content (bilingual service/pricing/FAQ copy, testimonials, positioning) consolidated from its 3 conflicting sources and migrated into Sanity as the single source of truth
- [x] **CMS-03**: Centralized typed GROQ queries with `stega: false` in all metadata/static-params paths

### Core Marketing Sections (2D)

- [x] **SEC-01**: Hero section with a clear positioning statement targeting Berlin SMB owners
- [x] **SEC-02**: Services section in plain language (no technical jargon)
- [x] **SEC-03**: Fixed pricing prominently displayed (~€690 landing, ~€2,500 multi-page)
- [x] **SEC-04**: Portfolio/work grid (4–6 projects with outcome notes)
- [x] **SEC-05**: Testimonials section featuring the 3 verified outcome-anchored quotes (Blumenspiess +200%, Learnstep 92%, Lumo +47%)
- [x] **SEC-06**: About section — real photo, solo-studio "you work directly with me" framing
- [x] **SEC-07**: Contact form (≤5 fields, confirmation feedback) delivering via Resend with Zod validation
- [x] **SEC-08**: Site header + footer + navigation
- [x] **SEC-09**: Impressum + Datenschutz pages (German legal requirement)
- [x] **SEC-10**: Full mobile-responsive pass across all sections
- [x] **SEC-11**: Subtle, restrained viewport-triggered motion on 2D sections — readability first

### 3D Hero

- [x] **HERO-01**: One elegant, performance-budgeted R3F 3D hero centerpiece (tasteful, not a tech demo), fully isolated via `next/dynamic({ ssr: false })`
- [x] **HERO-02**: `prefers-reduced-motion` static fallback (no Canvas rendered) and mobile Core Web Vitals budget met (LCP < 2.5s, CLS = 0)

### SEO

- [ ] **SEO-01**: Preserve v1's German programmatic SEO pages (`/s/[slug]`, ~30 keyword pages) with `generateStaticParams` for all locale+slug combinations
- [ ] **SEO-02**: JSON-LD structured data per page
- [ ] **SEO-03**: Complete bilingual sitemap + robots

### Quality Bar

- [x] **QA-01**: Each section iterated to high-end UX via a Playwright screenshot-critique loop (desktop + mobile)
- [x] **QA-02**: ui-skills.com principles applied per UI phase via the `npx ui-skills` CLI (load smallest relevant skill)
- [x] **QA-03**: Accessibility pass (WCAG AA contrast against actual backgrounds, `:focus-visible`, `axe-playwright` zero violations)

---

## v2 Requirements (deferred)

- Deep case study pages for the 3 anchor clients (problem → solution → measured outcome)
- FAQ section (5–7 recurring prospect questions)
- Process / "How it works" section (3-step framing)
- "You own the code" guarantee section
- Blog / Insights — conditional on a real 1-post/month editorial commitment
- Industry-matched testimonial surfacing (worthwhile at 6+ testimonials)

---

## Out of Scope

- Reusing v1's mid-migration "bone + plum" section styling — root cause of the unclear visual language; starting fresh
- v1's client-side `?lang=` + localStorage i18n — replaced by path-based routing for SEO correctness
- Heavy/flashy 3D beyond the single hero moment — would intimidate the SMB audience and hurt UX
- New backend/app functionality beyond the marketing site + contact form — this is a site rebuild, not a product
- Anti-features: cursor particle effects, auto-playing video, chat widgets, social feed embeds, testimonial carousels, awards badge walls

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| IDENT-01 | Phase 1: Identity & Design Tokens | Complete |
| IDENT-02 | Phase 1: Identity & Design Tokens | Complete |
| IDENT-03 | Phase 1: Identity & Design Tokens | Complete |
| IDENT-04 | Phase 1: Identity & Design Tokens | Complete |
| I18N-01 | Phase 2: i18n Shell & Routing | Complete |
| I18N-02 | Phase 2: i18n Shell & Routing | Complete |
| I18N-03 | Phase 2: i18n Shell & Routing | Complete |
| CMS-01 | Phase 3: Sanity Content Architecture | Complete |
| CMS-02 | Phase 3: Sanity Content Architecture | Complete |
| CMS-03 | Phase 3: Sanity Content Architecture | Complete |
| SEC-01 | Phase 4: 2D Marketing Sections | Complete |
| SEC-02 | Phase 4: 2D Marketing Sections | Complete |
| SEC-03 | Phase 4: 2D Marketing Sections | Complete |
| SEC-04 | Phase 4: 2D Marketing Sections | Complete |
| SEC-05 | Phase 4: 2D Marketing Sections | Complete |
| SEC-06 | Phase 4: 2D Marketing Sections | Complete |
| SEC-07 | Phase 4: 2D Marketing Sections | Complete |
| SEC-08 | Phase 4: 2D Marketing Sections | Complete |
| SEC-09 | Phase 4: 2D Marketing Sections | Complete |
| SEC-10 | Phase 4: 2D Marketing Sections | Complete |
| SEC-11 | Phase 4: 2D Marketing Sections | Complete |
| QA-01 | Phase 4: 2D Marketing Sections (primary; recurs Phase 5, 7) | Complete |
| QA-02 | Phase 4: 2D Marketing Sections (primary; recurs Phase 5, 7) | Complete |
| QA-03 | Phase 4: 2D Marketing Sections (primary; recurs Phase 5, 7) | Complete |
| HERO-01 | Phase 5: R3F Hero | Complete |
| HERO-02 | Phase 5: R3F Hero | Complete |
| SEO-01 | Phase 6: SEO Layer & Programmatic Pages | Pending |
| SEO-02 | Phase 6: SEO Layer & Programmatic Pages | Pending |
| SEO-03 | Phase 6: SEO Layer & Programmatic Pages | Pending |
