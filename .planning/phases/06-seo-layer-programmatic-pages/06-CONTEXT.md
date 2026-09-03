# Phase 6: SEO Layer & Programmatic Pages - Context

**Gathered:** 2026-09-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Preserve v1's German programmatic SEO asset — **25 real `/s/[slug]` keyword pages** (found in v1's `data/seo-pages.ts`, not "~30") — and extend them to fully bilingual DE/EN under `app/[locale]/s/[slug]/page.tsx`, sourced from Sanity (not static data). Deliver JSON-LD structured data per page, a complete bilingual sitemap + robots, and hreflang verified end-to-end in a deployed environment.

Delivers requirements **SEO-01** (preserve v1's `/s/[slug]` programmatic pages with `generateStaticParams` for all locale+slug combinations), **SEO-02** (JSON-LD structured data per page), **SEO-03** (complete bilingual sitemap + robots).

**In scope:** enrich the `seoPage` Sanity schema to carry v1's structured fields; migrate all 25 slugs × 2 locales (50 docs) into Sanity via an NDJSON script with DE↔EN `translation.metadata` links; build the `/[locale]/s/[slug]` route with `generateStaticParams` + `generateMetadata` (`stega: false`); rebuild the page to Phase 4's design bar; emit JSON-LD (WebPage + FAQPage + BreadcrumbList per SEO page, ProfessionalService/LocalBusiness on home, WebPage on sections); extend `app/sitemap.ts` with all 50 SEO-page URLs + correct paired hreflang; add `robots`; verify bidirectional hreflang post-deploy via `curl` and JSON-LD via Google Rich Results Test on a Vercel preview.

**Out of scope:** any NEW SEO pages beyond the 25 v1 slugs (new keyword pages are a future content task, not this phase); a blog/insights system (P3 deferred); case studies / FAQ section / process section (Phase 7); live/visual editing (deferred since Phase 3 D-03); re-authoring the marketing content already seeded in Phase 3.

**Reality note:** v2 currently has ZERO `seoPage` documents in Sanity. The `seoPage` schema exists but is thin (title, slug, heading, body PT, metaDescription). The route `app/[locale]/s/[slug]/` does NOT exist yet. `app/sitemap.ts` and `lib/i18n/metadata.ts` were pre-shaped in Phase 2 for this extension but only emit locale roots today. There is no `robots.ts`. JSON-LD is greenfield (no `application/ld+json` anywhere in v2). The authoritative content source is v1's `~/Documents/daniel-jin-studio-homepage/data/seo-pages.ts`, which already contains complete DE **and** EN copy for all 25 slugs.

</domain>

<decisions>
## Implementation Decisions

### Content Source & Schema (SEO-01)
- **D-01:** **Enrich the `seoPage` Sanity schema** to carry v1's full structured field set, then author all content INTO Sanity — Sanity remains the single source of truth (upholds Phase 3). The thin current schema (title/slug/heading/body/metaDescription) is extended with: `category` (`service` | `industry` | `need` | `location`), `heroHeadline`, `heroSubtext`, `faqs[]{ question, answer }`, `benefits[]`, `trustMetrics[]{ value, label }` (optional). Short fields stay plain string/text; only genuinely long-form prose uses Portable Text (Phase 3 D-04). Rejected: keeping the thin schema and dumping all prose into one `body` Portable Text field (would make discrete JSON-LD FAQPage emission impossible — see D-04); keeping pages as static TS data (contradicts Phase 3's "Sanity = single content home"). — **Reversibility:** costly — the enriched field set becomes the contract for the query layer, JSON-LD emitter, page template, AND the 50 authored docs; adding/renaming a field later means a schema change + a content re-migration.
- **D-02:** **Source content from v1's `data/seo-pages.ts`, including its existing English translations.** v1 already carries `titleEn`, `metaDescriptionEn`, `heroHeadlineEn`, `heroSubtextEn`, `faqs[].qEn/aEn`, `benefits[].textEn` for all 25 slugs — real human-written EN copy. Port these directly as the EN documents rather than authoring fresh (keeps the phase focused on the SEO layer, not content writing). EN slugs are derived from `titleEn` and **must be user-approved** before migration (see D-03).
- **D-03:** **Localized (per-locale, non-shared) EN slugs** — full Phase 3 D-11. DE keeps its exact v1 German slug (e.g. `/de/s/website-fuer-aerzte`, preserving the existing ranking URL); EN gets an English slug (e.g. `/en/s/websites-for-doctors`). This deviates from v1's behaviour (v1 served both languages on the SAME German slug via `?lang=en`) — an intentional SEO improvement for the EN variant, consistent with the site's path-based i18n. **The generated EN slug list is a user-approval gate before the migration script runs.** — **Reversibility:** one-way — once EN slugs are published and indexed, changing them requires 301 redirects to avoid losing any EN ranking; treat the approved slug list as a published contract.

### hreflang Pairing Across Differing Slugs (SEO-01 / I18N-02)
- **D-04:** **Resolve the counterpart-locale slug via the `translation.metadata` link** that `@sanity/document-internationalization` already creates between paired DE/EN docs (verified: `seoPage` is registered in `sanity.config.ts` `documentInternationalization.schemaTypes`; the `translation.metadata` reference shape already exists in `content/brightbyte.ndjson`). Because DE and EN slugs differ (D-03), hreflang can NO LONGER be derived by reusing the same path — so `buildHreflangAlternates(path)` (built in Phase 2 for identical `/de`+`/en` paths) needs a **per-page variant** that takes both the DE and EN slug. At build, resolving a page fetches its linked counterpart doc's slug and emits:
  - `de: /de/s/<de-slug>`, `en: /en/s/<en-slug>`, `x-default: /de/s/<de-slug>` (x-default → /de, Phase 2 D-05)
  Rejected: an explicit `altLocaleSlug`/`pairKey` field on each doc (redundant with the translation link the plugin already maintains). — **Reversibility:** costly — the pairing query + hreflang-helper variant become the contract every SEO page's `generateMetadata` and the sitemap depend on; changing the resolution model rewrites both call paths.

### JSON-LD Structured Data (SEO-02)
- **D-05:** **Match v1's per-page types AND add site-wide organization markup.** Per `/s/[slug]` page: **WebPage + FAQPage + BreadcrumbList** (as v1's `SeoPageJsonLd` did — FAQPage reads the discrete `faqs[]` array, which is why D-01 keeps FAQs structured). Homepage: **ProfessionalService / LocalBusiness** (Berlin `areaServed`, contact/address pulled from the `siteSettings` singleton — `hello@brightbyte-berlin.com`, Karl-Marx-Allee 118, 10243 Berlin). Section pages: **WebPage**. All JSON-LD localized per locale (`inLanguage`), sourced from Sanity fields (no hardcoded copy), and on paths where Sanity data is read at build with `stega: false` (Phase 3 CMS-03). Every public route must have valid JSON-LD verified via Google Rich Results Test on a Vercel preview (SC #2).

### Page Rendering (SEO-01)
- **D-06:** **Rebuild the SEO landing pages to Phase 4's design bar** — full landing layout (hero, benefits grid, FAQ accordion, trust metrics, CTA) using Phase 1 tokens and Phase 4 components, NOT v1's brutalist styling. Reuse existing Phase 4 patterns/components wherever they fit (FAQ accordion, testimonial, CTA). The page must not read as AI-generated — "the site itself is the proof" applies to these pages too, since they are organic-traffic landing surfaces. Rejected: a stripped simple editorial template (under-uses the rich structured content and the existing design system).

### Content Migration Mechanism (SEO-01)
- **D-07:** **One-off NDJSON migration script** (`scripts/migrate-seo-pages.ts` or similar) reads v1's `data/seo-pages.ts`, maps each entry to the enriched `seoPage` schema producing a DE doc + an EN doc + a `translation.metadata` link per slug (50 docs + 25 links total), emits `content/seo-pages.ndjson`, and imports via `sanity dataset import`. Repeatable, version-controlled, and matches the Phase 3 seed pattern (`content/brightbyte.ndjson` already exists). Rejected: hand-authoring 50 bilingual docs with FAQ arrays in Studio (slow, error-prone). — **Reversibility:** reversible — the script and NDJSON are re-runnable; a bad import can be corrected and re-imported.

### Claude's Discretion (locked to direction, tuned in research/planning)
- Exact enriched `seoPage` field names, validation rules, and `preview` config — derive per Sanity v6 docs, matching Phase 3's schema conventions.
- Exact GROQ query additions for counterpart-slug resolution (extend `lib/sanity/queries.ts`) and the shape of the per-page hreflang helper variant — planner's call, but must keep `stega: false` on all `generateMetadata`/`generateStaticParams` paths (CMS-03) and reuse the existing `buildHreflangAlternates` conventions where possible.
- `robots.ts` specifics (allow all public routes, reference the sitemap) — standard Next.js 16 `MetadataRoute.Robots`; verify against `node_modules/next/dist/docs/`.
- OG-image strategy for the 25 pages (v1 used slug-keyed static images under `/images/seo/`) — reuse, regenerate, or fall back to a default OG image; planner's call, not a vision question.
- Whether `sitemap.ts` reads the SEO slugs from Sanity at build vs a static list — either is fine as long as all 50 URLs appear with correct paired `alternates.languages` (SEO-03); prefer reading from Sanity to stay single-source.
- Exact validators used for SC #3 (a sitemap validator) and SC #4 (`curl` assertions) — planner picks tooling.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### THE breaking-changes rule (read FIRST — non-negotiable)
- `AGENTS.md` (project root) — "This is NOT the Next.js you know." Next.js 16 has breaking changes vs training data. **Read the relevant guide in `node_modules/next/dist/docs/` before writing any code** — especially `generateStaticParams`, `generateMetadata`, `MetadataRoute.Sitemap`, and `MetadataRoute.Robots` for App Router. Heed deprecation notices.
- `node_modules/next/dist/docs/01-app/` — authoritative version-matched Next.js 16.3.0 App Router docs (sitemap.md, robots.md, generateMetadata, generateStaticParams). Prefer over remembered API.

### v1 content source (authoritative for the 25 slugs — DE + EN)
- `~/Documents/daniel-jin-studio-homepage/data/seo-pages.ts` — the 25 slugs, `category`, and complete DE+EN fields (`title`/`titleEn`, `metaDescription`/`metaDescriptionEn`, `heroHeadline`/`heroHeadlineEn`, `heroSubtext`/`heroSubtextEn`, `faqs[].{q,a,qEn,aEn}`, `benefits[].{text,textEn}`, `trustMetrics[]?`). The migration script (D-07) reads THIS file.
- `~/Documents/daniel-jin-studio-homepage/app/s/[slug]/page.tsx` — v1's `generateStaticParams`/`generateMetadata` shape (for reference; v2 diverges on locale routing + Sanity source).
- `~/Documents/daniel-jin-studio-homepage/components/seo/SeoPageJsonLd.tsx` — v1's WebPage + FAQPage + BreadcrumbList emitter; the structural reference for D-05.
- `~/Documents/daniel-jin-studio-homepage/app/s/[slug]/SeoPageContent.tsx` — v1's rich landing layout (hero/benefits/FAQ/testimonials/CTA); the content-structure reference for D-06 (rebuild to Phase 4 bar, not v1's brutalist look).
- **The 25 DE slugs (approved as the v1 preservation set):** `webentwickler-berlin`, `website-fuer-aerzte`, `seo-optimierung-berlin`, `webdesign-mitte`, `website-fuer-restaurants`, `website-fuer-startups`, `website-fuer-anwaelte`, `website-fuer-immobilien`, `webdesign-kreuzberg`, `webdesign-charlottenburg`, `webdesign-prenzlauer-berg`, `website-relaunch-berlin`, `landing-page-erstellen`, `schnelle-website`, `wordpress-alternative`, `react-entwicklung-berlin`, `webdesign-fuer-kmu`, `website-fuer-handwerker`, `website-fuer-coaches`, `lead-generation-berlin`, `online-booking-integration`, `mehrsprachige-website`, `dsgvo-konforme-website`, `webdesign-friedrichshain`, `webdesign-neukoelln`. EN slugs are DERIVED (D-03) and require user approval before migration.

### v2 seams already built (extend, don't rewrite)
- `app/sitemap.ts` — designed to append `/s/[slug]` entries to its `ROUTES` array with NO emitter rewrite (Phase 2 D-08). NOTE: current emitter assumes identical DE/EN paths — the paired-slug requirement (D-04) means SEO-page sitemap entries need per-URL `alternates.languages` using resolved DE+EN slugs, so the emitter (or SEO-page branch) must handle differing slugs.
- `lib/i18n/metadata.ts` — `buildHreflangAlternates(path)` shared helper; needs a per-page variant taking both slugs (D-04). x-default → /de, canonical → /de.
- `sanity/schemaTypes/seoPage.ts` — the thin schema to ENRICH (D-01).
- `lib/sanity/queries.ts` — `getSeoPages` / `getSeoPageBySlug` (+ their `defineQuery` shapes) already exist; extend for enriched fields + counterpart-slug resolution.
- `lib/sanity/client.ts` — the read client; `stega: false` discipline applies.
- `sanity.config.ts` — `seoPage` already registered for `documentInternationalization` (verified) — the `translation.metadata` link D-04 relies on is emitted automatically.
- `content/brightbyte.ndjson` — the Phase 3 seed; reference for the `translation.metadata` NDJSON shape the migration script (D-07) must produce.

### Requirements, roadmap & prior phases
- `.planning/REQUIREMENTS.md` — SEO-01 / SEO-02 / SEO-03 exact wording; I18N-02 (bidirectional hreflang incl. x-default → /de, in both `<head>` and sitemap).
- `.planning/ROADMAP.md` §"Phase 6: SEO Layer & Programmatic Pages" — goal + 4 success criteria (all `/s/[slug]` render both locales, no 404; valid JSON-LD every page via Rich Results Test; sitemap + robots validated; bidirectional hreflang verified via `curl` post-deploy).
- `.planning/phases/03-sanity-content-architecture/03-CONTEXT.md` — D-04 (PT only where warranted), D-05 (structured `service` pricing → JSON-LD ready), D-08/D-09 (document-level DE-base i18n), D-10 (`$locale`-filtered queries), D-11 (per-locale non-shared slugs — the basis for D-03), CMS-03 (`stega: false` invariant).
- `.planning/phases/02-i18n-shell-routing/02-CONTEXT.md` — D-05 (always-DE root, x-default → /de), D-07 (ONE shared hreflang helper), D-08 (sitemap ROUTES→alternates mapper, pre-shaped for `/s/[slug]`).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/sitemap.ts` / `lib/i18n/metadata.ts` — pre-shaped in Phase 2 specifically for this phase's `/s/[slug]` extension. Reuse; extend for paired slugs (D-04).
- `lib/sanity/queries.ts` — `getSeoPages` + `getSeoPageBySlug` typed GROQ queries already exist; extend field selection + add counterpart-slug resolution.
- Phase 4 components (FAQ accordion, testimonial, CTA, hero patterns) + Phase 1 tokens — reuse for the rebuilt landing layout (D-06).
- `content/brightbyte.ndjson` — the migration script (D-07) mirrors its `translation.metadata` link shape.
- `siteSettings` singleton — source for homepage LocalBusiness/ProfessionalService JSON-LD contact/address (D-05).

### Established Patterns
- **`stega: false` on every `generateMetadata`/`generateStaticParams` path** (Phase 3 CMS-03) — a hard invariant for all new SEO-page metadata + static-params code.
- **Document-level DE-base i18n via `$locale`-filtered queries** (Phase 3 D-08/D-09/D-10) — the enriched `seoPage` queries filter `language == $locale`; slug lookups add `$slug` (D-11).
- **Single content source = Sanity** (Phase 3) — no static-data content store reintroduced; the migration lands content IN Sanity (D-01/D-07).
- **NDJSON seed + `sanity dataset import`** (Phase 3) — the established content-migration mechanism, reused (D-07).
- **Build-time verification discipline** — SC #2/#3/#4 verified on a real Vercel preview / `next start`, NOT the dev server (per prior-phase gate practice).

### Integration Points
- New route `app/[locale]/s/[slug]/page.tsx` — the phase's primary new surface; consumes the enriched typed queries + emits JSON-LD + paired hreflang.
- New `app/robots.ts` — greenfield (SEO-03).
- Enriched `sanity/schemaTypes/seoPage.ts` + `lib/sanity/queries.ts` — the schema/query seam.
- `scripts/migrate-seo-pages.ts` (new) + `content/seo-pages.ndjson` (new) — the content-migration path.

</code_context>

<specifics>
## Specific Ideas

- The DE slugs are the traffic moat — the 25 German slugs are preserved EXACTLY (D-03); do not rename or "improve" them.
- FAQs stay structured (`faqs[]`) precisely so JSON-LD FAQPage can be emitted per page (D-01 ↔ D-05 dependency) — porting them into flat prose would break the structured-data goal.
- v1's EN copy already exists and is human-written — use it (D-02); this phase is an SEO/plumbing phase, not a content-authoring phase.
- x-default → /de and DE-canonical everywhere (Phase 2 D-05) — carries into the paired-slug hreflang (D-04).
- "The site is launchable after Phase 6" (ROADMAP) — this phase closes the SEO story; verification happens on a deployed Vercel preview, not the dev server.

</specifics>

<deferred>
## Deferred Ideas

- **New keyword pages beyond the 25 v1 slugs** — a content-growth task, not this phase; this phase preserves + bilingualizes the existing set only.
- **Blog / Insights system** for German local-SEO topical authority (`research/FEATURES.md`) — P3 deferred; only build if committed to ≥1 post/month.
- **Case studies / FAQ section / Process section** — Phase 7 (P2 differentiators).
- **Live / Visual Editing** (`defineLive`, `VisualEditing`, Draft Mode) — deferred since Phase 3 D-03; the `stega: false` + typed-query foundation supports adding it later.
- **Industry-matched testimonial surfacing on SEO pages** (`research/FEATURES.md`) — v1.x, deferred unless trivial.

### Pre-deploy TODOs (carried from prior phases — NOT code-gating this phase, required before production deploy)
- Add `SANITY_API_READ_TOKEN` to Vercel env (all environments).
- Rotate the exposed Resend API key.
- Author real DSGVO Datenschutz copy (DE+EN) in Sanity Studio.

### Reviewed Todos (not folded)
None — no matching todos for this phase.

</deferred>

---

*Phase: 6-seo-layer-programmatic-pages*
*Context gathered: 2026-09-03*
