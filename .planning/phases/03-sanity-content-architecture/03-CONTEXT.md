# Phase 3: Sanity Content Architecture - Context

**Gathered:** 2026-08-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Stand up Sanity as the single source of truth for all editorial/marketing content and expose typed, locale-aware GROQ queries that Phase 4 components consume. Deliverables: an embedded Sanity Studio, a defined schema for `project`, `testimonial`, `service`, `seoPage`, and `siteSettings`, document-level DE/EN internationalization for every editable type, the canonical BrightByte content authored into Sanity, and a centralized typed query layer with `stega: false` on every metadata/static-params path.

Delivers requirements **CMS-01** (schema for editorial types + document-level i18n strategy), **CMS-02** (all canonical content consolidated into Sanity as the single source of truth), **CMS-03** (centralized typed GROQ queries with `stega: false` in all metadata/static-params paths).

**In scope:** Sanity install + embedded Studio scaffold, schema definitions, document-internationalization config, content authoring/seed into Sanity, typed GROQ query layer for Phase 4 to import.
**Out of scope:** rendering any of this content into visible sections (Phase 4 — SEC-01..11), the ~30 programmatic `/s/[slug]` SEO pages + JSON-LD (Phase 6, though `seoPage` schema + structured `service` pricing are shaped now so Phase 6 plugs in), live/visual editing (deferred — see below), the 3D hero (Phase 5).

**Reality note (drives migration approach):** Sanity is **not yet installed** in this v2 repo (`package.json` has no `sanity`/`next-sanity`/`@sanity/*`), and the "3 conflicting v1 sources" (inline `.tsx`, `dictionaries/`, `data/content.ts`) do **not** exist in this repo — they are historical, in the old v1 codebase. So this phase installs Sanity from scratch and authors the *canonical* content into it; "retiring the 3 sources" means the v2 build never reintroduces them — Sanity is the only content home.

</domain>

<decisions>
## Implementation Decisions

### Studio Scaffold & Hosting
- **D-01:** **Embedded Studio at `/studio`** inside this Next app (next-sanity 13's recommended single-repo setup) — one repo, one deploy, shared env, edit content on the live domain. Rejected a standalone Studio app (two deploys/configs, overkill for a solo studio site). — **Reversibility:** costly — the Studio route, `sanity.config.ts`, and Studio's build integration live inside the Next app; extracting to a standalone app later means moving config, env, and deploy wiring.
- **D-02:** **Studio ships to production**, gated by Sanity's own auth (the `/studio` route is not public content — only authenticated Sanity users reach the editor). Rejected dev-only Studio (would force running the app locally to edit content). — **Reversibility:** reversible — toggling whether the route is included in the prod build is a local change.
- **D-03:** **Static published content only this phase** — GROQ reads published documents at build time, `stega: false` everywhere, and we do **NOT** wire `defineLive` / `VisualEditing` / Draft Mode now. Rationale: matches the marketing-site nature and the Core Web Vitals budget (Phase 5 HERO-02), and minimizes the stega/draft-route surface where `stega: false` must be enforced (CMS-03). Live/visual editing is deferred, not rejected. — **Reversibility:** reversible — the typed query layer and `stega: false` discipline established here are the correct foundation to add `defineLive` later without rework.

### Schema Field Shapes
- **D-04:** **Plain string/text fields for short marketing copy** (headlines, positioning, service names/blurbs, testimonial quotes, pricing labels). Use **Portable Text only where genuinely warranted** (e.g. a longer About body or FAQ answers with light formatting) — not for short strings. Keeps Phase 4 components simple (a PT-to-React renderer is only needed for the few PT fields, not every field). Rejected "Portable Text everywhere" (over-engineers short strings, forces a renderer on every field).
- **D-05:** **Structured price fields on `service`** — numeric price + currency + display label + a what's-included list — NOT a single free-text price string. Machine-readable for the ~€690 landing / ~€2,500 multi-page prominence (SEC-03) and JSON-LD-ready for Phase 6. Avoids hardcoding prices in components. Rejected free-text price string (not machine-readable, duplicates formatting into content).
- **D-06:** **Structured testimonial outcome fields** — the `testimonial` type has `quote`, `author`, `company`, plus a **separate outcome metric** (a value like `+200%` and a label like `Umsatz`). Lets Phase 4 visually emphasize the outcome number as a first-class element. Covers the 3 verified anchors (Blumenspiess +200%, Learnstep 92%, Lumo +47% — SEC-05). Rejected baking the metric into the quote text (loses distinct styling of the number).
- **D-07:** **`siteSettings` is a true singleton** — one editable document, enforced via the Studio structure builder (no "create new"). Holds global config: nav labels, footer copy, contact email (`hello@brightbyte-berlin.com`), Impressum/address (Karl-Marx-Allee 118, 10243 Berlin), default SEO. Standard Sanity singleton pattern. Rejected an ordinary document type (editor could create multiples). — **Reversibility:** costly — the singleton is enforced in the structure builder and referenced by a fixed document id; changing the pattern touches the structure config and any query pinned to that id.

### Document-level i18n Mechanics
- **D-08:** **All editorial types AND `siteSettings` get DE/EN document pairs** via `@sanity/document-internationalization` — `project`, `testimonial`, `service`, `seoPage`, and `siteSettings` are all translatable (nav/footer/legal copy is locale-specific). Everything editable is translatable; no mixed single-language types. Rejected pairing editorial types only (mixed model complicates GROQ). — **Reversibility:** costly — the i18n plugin config, the `language` field on each type, and every query's locale filter assume this set; adding/removing a paired type later means schema + query changes.
- **D-09:** **DE is the base/reference language; EN is the translation.** New documents start in DE; matches the DE-default routing locked in Phase 2 (D-05: always-DE root, `x-default` → `/de`) and the German-first Berlin SMB audience. Rejected EN base (fights the site's DE-first direction).
- **D-10:** **Typed GROQ queries select a locale via a `$locale` param** filtering on the document `language` field (e.g. `*[_type == "service" && language == $locale]`). Phase 4 passes the URL locale (from Phase 2 routing) into every typed query. One clean query shape per type. Rejected resolving via translation references/metadata (more GROQ complexity; we never need both languages at once here). — **Reversibility:** costly — the `$locale`-filter shape is the contract Phase 4 imports; changing to a ref-resolution model rewrites the query layer and its call sites.
- **D-11:** **Per-locale slugs** for slugged types (`project`, `seoPage`) — each locale document owns its own slug (e.g. `/de/projekt/...` vs `/en/work/...`); slug is a translated (non-shared) field. Best localized SEO and consistent with path-based i18n. Rejected a shared slug (forces identical URL segments across languages, weaker localized SEO). Note for Phase 6: the ~30 programmatic `/s/[slug]` pages will consume these per-locale slugs.

### Claude's Discretion (locked to direction, tuned in research/planning)
- **Typed GROQ mechanism:** whether types come from `sanity typegen` (schema-extracted, `sanity.types.ts`) or hand-authored TypeScript — research picks the current-best for the locked stack, but the query layer in `lib/sanity/queries.ts` MUST be typed (CMS-03) and centralized. (This was the one selected-area's sibling left open; not a user vision question.)
- **Content migration mechanism:** manual authoring in Studio vs a seed/import script (`@sanity/client` + NDJSON) to populate the canonical content — planner's call. Either way, Sanity ends as the single source of truth.
- **Authoritative content source:** since v1 sources aren't in-repo, use `~/Documents/claude-contexts/freelancer.md` (identity, contact, real pricing/maintenance terms) and the ROADMAP's stated copy (3 outcome-anchored testimonials, positioning) as the canonical content to author. Reconcile the ROADMAP's illustrative "~€690 / ~€2,500" against `freelancer.md`'s actual pricing model during planning — flag any conflict rather than silently picking one.
- Exact schema field names, validation rules, `preview` configs, and Studio `structure` layout — derive per Sanity v6 docs.
- `@sanity/image-url` builder setup for responsive images (needed by `project` and About photo) — a planning detail; shape the image fields now.
- Env/config surface (`projectId`, `dataset`, API version, `useCdn`) and where the read client lives — per next-sanity 13 guidance.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### THE breaking-changes rule (read FIRST — non-negotiable)
- `AGENTS.md` (project root) — "This is NOT the Next.js you know." Next.js 16 has breaking changes vs training data. **Read the relevant guide in `node_modules/next/dist/docs/` before writing any code** — especially route handlers / catch-all routes for the `/studio` mount and `generateMetadata`/`generateStaticParams` for the `stega: false` paths. Heed deprecation notices.
- `node_modules/next/dist/docs/01-app/` — authoritative version-matched Next.js 16.3.0 App Router docs. Prefer over remembered API.

### Tech stack lock (versions + rationale) — read before choosing any API
- `.claude/CLAUDE.md` (project) §"CMS" — **sanity 6.9.1** (Node 22.12+; the npm `sanity` package is now v6, not v3/v4), **next-sanity 13.3.1** (`createClient` for cached GROQ, `defineLive`, `VisualEditing`), **@sanity/image-url 2.1.1** (srcset from image assets, hotspot/crop), **@sanity/document-internationalization 6.2.29** (document-level DE/EN pairs linked by a shared reference — the locked i18n approach).
- `.claude/CLAUDE.md` (project) §"Contact Form" note is out of scope here, but §"What NOT to Use" applies: **destructure `{ data, error }`**, no CJS (ESM-only stack), no `tailwindcss.config.js`.
- `.claude/CLAUDE.md` (project) §"Version Compatibility Matrix" — sanity 6.9.1 ↔ Node 22.12+ (verify Vercel runtime ≥22); next-sanity 13.3.1 ↔ sanity 6.x ↔ Next 15+.
- `.claude/CLAUDE.md` (project) §"What NOT to Use" — `stega: false` MUST be present in `generateStaticParams`/`generateMetadata` call paths (stega corruption in titles/slugs is the exact failure CMS-03 guards).

### Sanity official docs (verify current API — installed during this phase)
- `https://www.sanity.io/docs/localization` — document-level vs field-level i18n; document-level is the locked choice (D-08).
- next-sanity + Next.js App Router integration (embedded Studio at `/studio`, `createClient`, typed GROQ) — verify current v13 patterns during research.
- `sanity typegen` / schema-extract → `sanity.types.ts` — evaluate for the typed query layer (CMS-03).

### Requirements, roadmap & prior phase
- `.planning/REQUIREMENTS.md` §"Content Architecture (Sanity CMS)" — CMS-01/02/03 exact wording.
- `.planning/ROADMAP.md` §"Phase 3: Sanity Content Architecture" — goal + 3 success criteria (schema types visible in Studio + document-internationalization DE/EN pairs; all v1 content in Sanity, 3 conflicting sources retired; every `lib/sanity/queries.ts` query typed + `stega: false` verified by a build with no stega corruption).
- `.planning/phases/02-i18n-shell-routing/02-CONTEXT.md` — Phase 2 i18n decisions this phase MUST stay consistent with: **D-01** next-intl message files are UI-chrome only (editorial copy lives in Sanity — this phase); **D-03** `localePrefix: always` (`/de`,`/en`); **D-05** always-DE root, `x-default` → `/de` (⇒ DE base language, D-09); the URL-only locale value is what feeds the `$locale` GROQ param (D-10).

### Canonical content source (authoritative for authoring into Sanity)
- `~/Documents/claude-contexts/freelancer.md` — BrightByte identity, contact (`hello@brightbyte-berlin.com`, Karl-Marx-Allee 118, 10243 Berlin), **actual** pricing/maintenance/payment terms (Kleinunternehmerregelung §19 UStG). Reconcile against ROADMAP's illustrative pricing during planning.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `messages/de.json` / `messages/en.json` (Phase 2): next-intl message files — **UI chrome only** by Phase 2 D-01/D-02. This phase does NOT move editorial copy here; editorial content goes to Sanity. Keep the boundary crisp: static UI strings = next-intl, editorial/marketing content = Sanity.
- Phase 2 locale plumbing: the URL-derived locale (`/de`/`/en`, from middleware + `[locale]` segment) is the value Phase 4 will pass into the `$locale`-filtered GROQ queries (D-10). No new locale source is introduced.
- `styles/tokens.css` + Tailwind v4 `@theme` (Phase 1): not consumed by schema/query work, but any Studio customization must not introduce raw styling that fights the token system (Studio UI is Sanity's own, so low risk).

### Established Patterns
- **Single styling approach / anti-sprawl** (project CLAUDE.md) — carries into content: ONE content source (Sanity), no parallel content stores. Mirrors Phase 2's "one i18n approach" discipline.
- **ESM-only, TypeScript-first** stack — schema and query files are TS/ESM; no CJS.
- **Build-time verification discipline** (Phase 2 D-09 CI smoke test precedent) — CMS-03's success criterion is verified by running a build and asserting no stega corruption in titles/slugs.

### Integration Points
- `lib/sanity/queries.ts` (new) — the centralized typed query layer is THE seam Phase 4 imports from; its `$locale`-param shape (D-10) is a contract for every Phase 4 section.
- `/studio` route (new) — first Sanity surface; embedded in the Next app (D-01).
- `sanity.config.ts` + schema dir (new) — schema types + document-internationalization plugin config.
- `seoPage` schema + structured `service` pricing (D-05) are shaped now so **Phase 6** (SEO/programmatic pages + JSON-LD) plugs in without a schema rewrite; per-locale slugs (D-11) feed Phase 6's `/s/[slug]`.
- Greenfield for Sanity: no `sanity` deps, no Studio, no client yet — this phase creates all of it.

</code_context>

<specifics>
## Specific Ideas

- "Sanity is the single source of truth" — after this phase there is exactly one content home; the v2 build never reintroduces v1's inline `.tsx` / `dictionaries/` / `data/content.ts` pattern (they don't exist in this repo and must not be recreated).
- The testimonial outcome number is a first-class, separately-styled element (D-06) — the 3 anchors (Blumenspiess +200%, Learnstep 92%, Lumo +47%) are the proof points; the metric must be queryable on its own.
- Prices are data, not copy (D-05) — €690/€2,500 (or the reconciled real figures) live as numbers so Phase 4 renders and Phase 6 JSON-LD emits them without duplication.
- `stega: false` is a hard invariant on every `generateMetadata`/`generateStaticParams` path (CMS-03) — the phase's build-time check exists to catch stega corruption in titles/slugs structurally.
- DE-first everywhere: base language DE (D-09), consistent with Phase 2's always-DE root and `x-default` → `/de`.

</specifics>

<deferred>
## Deferred Ideas

- **Live / Visual Editing** (`defineLive`, `VisualEditing`, Draft Mode, click-to-edit overlays) → deferred, not rejected (D-03). The typed query layer + `stega: false` foundation built here supports adding it later without rework.
- **Rendering content into visible sections** → Phase 4 (SEC-01..11) consumes this phase's queries; no visual section work here.
- **Programmatic `/s/[slug]` SEO pages + JSON-LD** → Phase 6; this phase only shapes `seoPage` + structured `service` pricing + per-locale slugs as the seam.
- **Content migration script vs manual authoring** — mechanism left to the planner (Claude's Discretion); noted so it isn't lost.
- **FAQ / About-body Portable Text depth** — PT is allowed where warranted (D-04); exact rich-text field set is a planning detail, only add PT where a real formatting need exists.

### Reviewed Todos (not folded)
None — no matching todos for this phase.

</deferred>

---

*Phase: 3-sanity-content-architecture*
*Context gathered: 2026-08-12*
