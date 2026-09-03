# Phase 6: SEO Layer & Programmatic Pages - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-03
**Phase:** 6-seo-layer-programmatic-pages
**Areas discussed:** Content source & schema, Slug policy, JSON-LD coverage, Page design, hreflang pairing, EN content source, Authoring mechanism

---

## Content Source & Schema

| Option | Description | Selected |
|--------|-------------|----------|
| Enrich Sanity schema + author | Extend seoPage schema with v1's structured fields; author 50 docs (25×2) via NDJSON | ✓ |
| Thin schema + body PortableText | Keep current schema; dump v1 prose into body PT (breaks discrete JSON-LD FAQPage) | |
| Keep as static TS data | Port data/seo-pages.ts as a static module, skip Sanity (contradicts Phase 3) | |

**User's choice:** Enrich Sanity schema + author
**Notes:** Upholds Phase 3 "Sanity = single source of truth." FAQs must stay structured so JSON-LD FAQPage can be emitted (links to JSON-LD decision).

---

## Slug Policy

| Option | Description | Selected |
|--------|-------------|----------|
| Shared German slug both locales | Same slug string for /de and /en (v1 behaviour); simplest | |
| Localized EN slugs | Per-locale non-shared slugs (full Phase 3 D-11); EN gets English slugs | ✓ |

**User's choice:** Localized EN slugs
**Notes:** Chose theoretical EN-SEO strength over v1's shared-slug simplicity. Creates the hreflang-pairing complexity resolved in the follow-up round. DE slugs preserved exactly.

---

## JSON-LD Coverage

| Option | Description | Selected |
|--------|-------------|----------|
| Match v1 + site-wide org | v1's WebPage+FAQPage+BreadcrumbList per SEO page PLUS ProfessionalService/LocalBusiness on home | ✓ |
| Match v1 only | v1's 3 types on /s/ pages only; minimal elsewhere | |
| You decide (research picks) | Lock direction, let planner pick exact @types | |

**User's choice:** Match v1 + site-wide org
**Notes:** Fullest Rich-Results coverage; satisfies SC #2 "every page has valid JSON-LD." Home LocalBusiness pulls contact/address from siteSettings singleton.

---

## Page Design

| Option | Description | Selected |
|--------|-------------|----------|
| Rebuild to Phase 4 bar | Full landing (hero/benefits/FAQ/trust/CTA) with Phase 4 components + Phase 1 tokens | ✓ |
| Simple editorial template | Clean single template: heading + body + FAQ + CTA | |
| You decide (planner) | Lock intent, let UI/planner pick richness | |

**User's choice:** Rebuild to Phase 4 bar
**Notes:** These are organic-traffic landing surfaces — "the site itself is the proof" applies. Reuse existing Phase 4 components, not v1's brutalist styling.

---

## hreflang Pairing (follow-up — triggered by localized-slug choice)

| Option | Description | Selected |
|--------|-------------|----------|
| Resolve counterpart via translation link | Use document-internationalization's translation.metadata to fetch counterpart slug at build | ✓ |
| Explicit counterpart-slug field | Store altLocaleSlug/pairKey on each doc | |
| You decide (planner) | Lock requirement, let planner pick mechanism | |

**User's choice:** Resolve counterpart via translation link
**Notes:** No redundant field — the plugin already maintains the DE↔EN link (verified: seoPage registered in documentInternationalization). buildHreflangAlternates needs a per-page variant taking both slugs.

---

## EN Content Source (follow-up)

| Option | Description | Selected |
|--------|-------------|----------|
| Port v1 English copy (exists) | v1's data file has complete human EN translations for all 25; port directly | ✓ |
| Author fresh EN copy | Rewrite EN copy + slugs this phase | |

**User's choice:** Port v1 English copy (exists)
**Notes:** This is an SEO/plumbing phase, not content authoring. EN slugs derived from titleEn require user approval before migration.

---

## Authoring Mechanism (follow-up)

| Option | Description | Selected |
|--------|-------------|----------|
| NDJSON migration script | Script reads v1 data → 50 docs + translation.metadata links → sanity dataset import | ✓ |
| Manual in Studio | Hand-author 50 bilingual docs | |
| You decide (planner) | Lock outcome, let planner pick | |

**User's choice:** NDJSON migration script
**Notes:** Matches Phase 3's seed pattern (content/brightbyte.ndjson exists as the reference shape). Repeatable and version-controlled.

---

## Claude's Discretion

- Exact enriched seoPage field names, validation, preview config (per Sanity v6 docs).
- Exact GROQ additions for counterpart-slug resolution + per-page hreflang helper variant shape (keep stega: false).
- robots.ts specifics (allow public routes, reference sitemap).
- OG-image strategy for the 25 pages (reuse v1's slug-keyed images / regenerate / default).
- Whether sitemap.ts reads SEO slugs from Sanity vs static list (prefer Sanity).
- Validators for SC #3 (sitemap validator) and SC #4 (curl assertions).

## Deferred Ideas

- New keyword pages beyond the 25 v1 slugs — future content task.
- Blog / Insights system — P3.
- Case studies / FAQ section / Process section — Phase 7.
- Live / Visual Editing — deferred since Phase 3 D-03.
- Industry-matched testimonial surfacing on SEO pages — v1.x.
- Pre-deploy TODOs (not code-gating): Vercel SANITY_API_READ_TOKEN, rotate Resend key, real DSGVO copy.
