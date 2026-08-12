# Phase 3: Sanity Content Architecture - Research

**Researched:** 2026-08-12
**Domain:** Headless CMS (Sanity v6) + Next.js 16.3.0 App Router integration, document-level i18n, typed GROQ, build-time static reads
**Confidence:** HIGH (versions, Next.js APIs, codebase state VERIFIED) / MEDIUM (Sanity v6 API shapes — CITED from docs, not run this session)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01** Embedded Studio at `/studio` inside this Next app (next-sanity 13 single-repo setup). One repo, one deploy, shared env. *Reversibility: costly.*
- **D-02** Studio ships to production, gated by Sanity's own auth (`/studio` is not public content). *Reversibility: reversible.*
- **D-03** Static published content only this phase — GROQ reads published docs at build time, `stega: false` everywhere, NO `defineLive`/`VisualEditing`/Draft Mode. *Reversibility: reversible — this is the correct foundation to add live editing later.*
- **D-04** Plain string/text fields for short marketing copy; Portable Text ONLY where genuinely warranted (longer About body, FAQ answers). Not PT everywhere.
- **D-05** Structured price fields on `service` — numeric price + currency + display label + what's-included list. NOT free-text. JSON-LD-ready for Phase 6.
- **D-06** Structured testimonial outcome fields — `quote`, `author`, `company`, plus a **separate** outcome metric (value like `+200%` + label like `Umsatz`). Metric queryable on its own.
- **D-07** `siteSettings` is a true singleton — one editable doc, enforced via Studio structure builder (no "create new"). Fixed document id.
- **D-08** ALL editorial types AND `siteSettings` get DE/EN document pairs via `@sanity/document-internationalization`. No mixed single-language types.
- **D-09** DE is base/reference language; EN is the translation. New docs start in DE. Matches Phase 2 always-DE root + `x-default` → `/de`.
- **D-10** Typed GROQ queries select locale via a `$locale` param filtering the doc `language` field: `*[_type == "service" && language == $locale]`. This is the contract Phase 4 imports.
- **D-11** Per-locale slugs for `project`/`seoPage` — each locale doc owns its own slug; slug is a translated (non-shared) field. Note for Phase 6: `/s/[slug]` consumes these.

### Claude's Discretion
- **Typed GROQ mechanism:** `sanity typegen`/schema-extract (`sanity.types.ts`) vs hand-authored TS. Query layer in `lib/sanity/queries.ts` MUST end typed + centralized (CMS-03). — *Recommendation below: use `sanity typegen` + `defineQuery`.*
- **Content migration mechanism:** manual Studio authoring vs seed/import script (`@sanity/client` + NDJSON / `sanity dataset import`). — *Recommendation below: NDJSON seed via `sanity dataset import`.*
- **Authoritative content source:** `~/Documents/claude-contexts/freelancer.md` + ROADMAP copy. **Reconcile ROADMAP's illustrative €690/€2,500 against freelancer.md's actual model — flag conflict, do not silently pick.** — *Conflict IS present and flagged below (see Open Questions Q1).*
- Exact schema field names, validation, `preview` configs, Studio `structure` layout — derive per Sanity v6 docs.
- `@sanity/image-url` builder setup — planning detail; shape image fields now.
- Env/config surface (`projectId`, `dataset`, apiVersion, `useCdn`) and where the read client lives — per next-sanity 13 guidance.

### Deferred Ideas (OUT OF SCOPE)
- Live / Visual Editing (`defineLive`, `VisualEditing`, Draft Mode, click-to-edit) → deferred, not rejected.
- Rendering content into visible sections → Phase 4.
- Programmatic `/s/[slug]` SEO pages + JSON-LD → Phase 6 (this phase only SHAPES `seoPage` + structured `service` pricing + per-locale slugs).
- The 3D hero → Phase 5.
- FAQ/About-body Portable Text depth beyond what D-04 warrants — planning detail.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CMS-01 | Sanity schema for editable content types (`project`, `testimonial`, `service`, `seoPage`, `siteSettings`) with document-level i18n | Schema shapes in "Architecture Patterns"; `@sanity/document-internationalization` config in Pattern 3; singleton pattern (D-07) in Pattern 4 |
| CMS-02 | All canonical BrightByte content consolidated into Sanity as single source of truth | Content authoring approach (NDJSON seed) in "Don't Hand-Roll" + Pattern 6; canonical content inventory below; **pricing conflict flagged (Q1)** |
| CMS-03 | Centralized typed GROQ queries with `stega: false` in all metadata/static-params paths | Typed query layer (`sanity typegen` + `defineQuery`) in Pattern 5; `stega: false` client config in Pattern 2; build-time verification in Validation Architecture |
</phase_requirements>

## Summary

This phase installs the entire Sanity surface from scratch (nothing is installed — `package.json` has `next`, `next-intl`, `react`, `sharp` only). The work is: (1) install the Sanity ecosystem, (2) mount an embedded Studio at `/studio` via a client-side catch-all route, (3) define five document-internationalized schema types, (4) author the canonical BrightByte content, and (5) expose a centralized, typed, `stega: false` GROQ query layer at `lib/sanity/queries.ts` that Phase 4 imports.

Two hard environmental facts dominate planning. **First: Node is v20.17.0, but `sanity@6.9.2` requires `node >=22.12` [VERIFIED: npm view sanity engines].** Local `sanity` CLI, Studio dev, and `sanity typegen`/`dataset import` will refuse to run (or emit engine warnings/failures) until Node is upgraded. The STATE.md blocker ("Verify Vercel runtime is 22.12+") is real for *local dev too*, not just deploy. **Second: `next-sanity@13.3.2` declares peer deps `@sanity/client ^7.26.2` and `styled-components ^6.1` [VERIFIED: npm view next-sanity peerDependencies].** The CLAUDE.md stack table omits both. `styled-components` is used *internally by Sanity Studio* — it does NOT violate the project's "no styled-components in our components" rule (the rule governs *our* app components; Studio is Sanity's own UI). But it must be installed or the Studio build breaks.

**Primary recommendation:** Upgrade local Node to 22.12+ (or 22 LTS) as the very first task; install the corrected package set (versions below); scaffold `sanity.config.ts` + a `[[...tool]]` catch-all Studio route with `dynamic = 'force-static'`; define five DE-base document-i18n schemas; author content via an NDJSON seed imported with `sanity dataset import`; generate types with `sanity typegen` and wrap every query in `defineQuery`; instantiate ONE read client with `useCdn:false, perspective:'published', stega:false, apiVersion` pinned; centralize all `$locale`-parameterized queries in `lib/sanity/queries.ts`.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Content authoring / editing | CMS (Sanity Studio at `/studio`) | Frontend Server (mounts the Studio route) | Studio is Sanity's own client-rendered app; Next only hosts the catch-all route |
| Content storage / single source of truth | CMS (Sanity dataset) | — | All editorial content lives in Sanity's hosted dataset (D-03) |
| Build-time content reads | Frontend Server (RSC + build) | CMS API (Content Lake) | GROQ runs server-side at build; `stega:false`, published perspective (CMS-03) |
| Typed query contract | Frontend Server (`lib/sanity/queries.ts`) | Build tooling (`sanity typegen`) | Phase 4 imports typed query fns; types are schema-extracted (CMS-03) |
| Locale selection | Frontend Server | Browser (URL only, Phase 2) | `$locale` param comes from Phase 2's URL-derived locale; no client state (D-10) |
| Image URL building | Frontend Server (`@sanity/image-url`) | Browser (`next/image` renders) | srcset built server-side from Sanity asset refs; shaped now, consumed Phase 4 |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `sanity` | 6.9.2 | Studio + schema + CLI (`sanity typegen`, `dataset import`, `schema extract`) | The `sanity` npm package IS Studio v3-runtime published as v6 line; the canonical Sanity install [VERIFIED: npm registry] |
| `next-sanity` | 13.3.2 | Next.js integration: `createClient`, `defineQuery`, `<NextStudio>` component | Official bridge; v13 targets Next 16 (`next: ^16.0.0-0` peer) [VERIFIED: npm view next-sanity peerDependencies] |
| `@sanity/client` | 7.26.2 | Underlying GROQ client (peer of next-sanity 13) | **Major 7** — required peer, NOT bundled; must be installed explicitly [VERIFIED: npm view next-sanity peerDependencies] |
| `styled-components` | ^6.1.15 | **Studio-internal** styling engine (peer of next-sanity + sanity) | Required peer of `next-sanity`/`sanity`; used only by Studio's own UI, not our components [VERIFIED: npm view next-sanity/sanity peerDependencies] |
| `@sanity/document-internationalization` | 6.2.30 | Document-level DE/EN pairs linked by a translations metadata doc | The locked i18n mechanism (D-08). Adds a `language` field + translations metadata [VERIFIED: npm registry] |
| `@sanity/image-url` | 2.1.1 | Build srcset URLs from image asset refs (hotspot/crop aware) | Standard for `next/image` integration; shaped now, consumed Phase 4 [VERIFIED: npm registry] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@sanity/vision` | 6.9.2 | GROQ playground plugin inside Studio | Dev-time query testing during schema modelling. Add to `plugins` in `sanity.config.ts` [VERIFIED: npm registry] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `sanity typegen` (schema-extracted types) | Hand-authored TS interfaces | Hand-authored drifts from schema silently; typegen regenerates from truth. Recommend typegen (see Pattern 5). |
| NDJSON seed via `sanity dataset import` | Manual authoring in Studio | Manual is error-prone for bilingual pairs + is not reproducible/CI-checkable. Seed is idempotent-ish and versioned (see Pattern 6). |
| Document-level i18n plugin | Field-level i18n (`internationalizedArray`) | Field-level fights D-10's `language`-filter query shape and D-11 per-locale slugs. Document-level is locked (D-08). |
| Route Handler mount | `<NextStudio>` client component in a catch-all route | `<NextStudio>` is the official next-sanity 13 embed; a Route Handler cannot render the React Studio app. |

**Installation (corrected versions):**
```bash
# Requires Node >=22.12 FIRST — see Environment Availability
npm install sanity@6.9.2 next-sanity@13.3.2 @sanity/client@7.26.2 \
  @sanity/image-url@2.1.1 @sanity/document-internationalization@6.2.30 \
  styled-components@^6.1.15
npm install -D @sanity/vision@6.9.2
```
> ⚠️ CLAUDE.md lists `sanity 6.9.1`, `next-sanity 13.3.1`, `@sanity/document-internationalization 6.2.29`. Registry latest at research time is `6.9.2` / `13.3.2` / `6.2.30`. `@sanity/client 7.26.2` and `styled-components` are **missing** from the CLAUDE.md table but are **required peers**. Planner: install the corrected set above and let the planner reconcile CLAUDE.md if desired.

## Package Legitimacy Audit

Automated legitimacy seam could not be run (network/tooling unavailable this session). Verdicts below are from direct npm registry inspection + these being the canonical, first-party Sanity/Next packages under the `@sanity` org and `sanity-io` GitHub org.

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| `sanity` | npm | mature (v6 line) | very high | github.com/sanity-io/sanity | OK | Approved [VERIFIED: npm registry] |
| `next-sanity` | npm | mature | high | github.com/sanity-io/next-sanity | OK | Approved [VERIFIED: npm registry] |
| `@sanity/client` | npm | mature (v7) | very high | github.com/sanity-io/client | OK | Approved [VERIFIED: npm registry] |
| `@sanity/image-url` | npm | mature | high | github.com/sanity-io/image-url | OK | Approved [VERIFIED: npm registry] |
| `@sanity/document-internationalization` | npm | mature | moderate | github.com/sanity-io/document-internationalization | OK | Approved [VERIFIED: npm registry] |
| `@sanity/vision` | npm | mature | high | github.com/sanity-io/sanity (monorepo) | OK | Approved [VERIFIED: npm registry] |
| `styled-components` | npm | mature (v6) | very high | github.com/styled-components/styled-components | OK | Approved (Studio-internal peer) [VERIFIED: npm registry] |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

## Architecture Patterns

### System Architecture Diagram

```
BUILD TIME (Next.js build on Vercel, Node 22.12+)
┌──────────────────────────────────────────────────────────────┐
│ generateStaticParams / generateMetadata / RSC page body        │
│        │                                                        │
│        ▼                                                        │
│  lib/sanity/queries.ts   (typed, centralized — D-10)            │
│   getServiceBySlug($locale)  getTestimonials($locale)  ...      │
│        │  runs defineQuery-typed GROQ                           │
│        ▼                                                        │
│  lib/sanity/client.ts  →  createClient({                        │
│     projectId, dataset, apiVersion,                             │
│     useCdn:false, perspective:'published', stega:FALSE })       │
│        │                                                        │
└────────┼───────────────────────────────────────────────────────┘
         │ HTTPS GROQ (published docs only)
         ▼
   Sanity Content Lake (hosted dataset) ── single source of truth
         ▲
         │ authenticated writes
┌────────┴───────────────────────────────────────────────────────┐
│ RUNTIME (browser)                                                │
│  /studio  →  app/studio/[[...tool]]/page.tsx  ('use client')     │
│              renders <NextStudio config={sanityConfig} />        │
│              gated by Sanity's own auth (D-02)                   │
│                                                                  │
│  Content pages (/de, /en) → static HTML from build, no client    │
│  Sanity call, no stega tokens in titles/slugs                    │
└──────────────────────────────────────────────────────────────┘

SEED (one-time, local, Node 22.12+):
  content/brightbyte.ndjson → `sanity dataset import` → Content Lake
```

### Recommended Project Structure
```
sanity.config.ts            # defineConfig: projectId, dataset, plugins[], schema, structure
sanity.cli.ts               # defineCliConfig: projectId/dataset for CLI (typegen, import)
sanity/
├── schemaTypes/
│   ├── index.ts            # exports schemaTypes array
│   ├── project.ts          # doc type (+ per-locale slug, D-11)
│   ├── testimonial.ts      # doc type (structured outcome metric, D-06)
│   ├── service.ts          # doc type (structured price fields, D-05)
│   ├── seoPage.ts          # doc type (+ per-locale slug, D-11) — shaped for Phase 6
│   ├── siteSettings.ts     # SINGLETON doc type (D-07)
│   └── objects/            # reusable object types (priceObject, outcomeMetric, ...)
├── structure.ts            # structure builder: siteSettings singleton + doc lists
└── env.ts                  # projectId/dataset/apiVersion readers (throw if missing)
lib/sanity/
├── client.ts               # ONE createClient (stega:false, published, useCdn:false)
├── image.ts                # @sanity/image-url builder (urlFor)
└── queries.ts              # CENTRAL typed query layer — the Phase 4 contract (D-10, CMS-03)
sanity.types.ts             # GENERATED by `sanity typegen` — do not hand-edit
content/
└── brightbyte.ndjson       # canonical seed content (CMS-02)
app/studio/[[...tool]]/
└── page.tsx                # 'use client' → <NextStudio config={config} />
```

### Pattern 1: Embedded Studio at `/studio` (Next 16 catch-all, D-01)
**What:** Mount the React Studio app under an optional-catch-all route so `/studio` and all Studio sub-paths (`/studio/structure/...`, `/studio/vision`) resolve to one page.
**When:** Once, this phase.
**Next 16 facts [VERIFIED: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/dynamic-routes.md:100-113]:** `[[...folderName]]` is an optional catch-all — it matches `/studio` AND `/studio/a/b/c`; `params` is `{ tool?: string[] }`. `params` is a **Promise** and must be awaited (Next 16) — but the Studio page is a client component that ignores params, so this is moot for the mount itself.
```tsx
// app/studio/[[...tool]]/page.tsx
// Source pattern: next-sanity <NextStudio> embed [CITED: sanity.io/docs, next-sanity README]
'use client'
import { NextStudio } from 'next-sanity/studio'
import config from '../../../sanity.config'

// Studio must render fully client-side (WebGL-free but browser-only APIs).
export const dynamic = 'force-static'       // D-03: no dynamic server work for the route shell
export { metadata, viewport } from 'next-sanity/studio'  // [CITED: next-sanity docs] — sets robots noindex + viewport

export default function StudioPage() {
  return <NextStudio config={config} />
}
```
> `[ASSUMED]` on the exact `export { metadata, viewport } from 'next-sanity/studio'` re-export path and `dynamic` value — confirm against `node_modules/next-sanity/` after install and the next-sanity embedded-Studio guide. The *shape* (client component + `<NextStudio config={} />`) is the documented v13 pattern [CITED: github.com/sanity-io/next-sanity].

### Pattern 2: The single read client — `stega:false` invariant (D-03, CMS-03)
**What:** Exactly ONE `createClient`, configured for static published reads, imported everywhere. This is the structural guarantee behind CMS-03.
```ts
// lib/sanity/client.ts
// Source: next-sanity createClient [CITED: sanity.io/docs/api-versioning, sanity.io/docs/js-client]
import { createClient } from 'next-sanity'
import { projectId, dataset, apiVersion } from '@/sanity/env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,           // pin a date, e.g. '2025-08-01' — NOT 'v1'/'latest' [CITED: sanity.io/docs/api-versioning]
  useCdn: false,        // build-time reads want freshest published data, not CDN-cached
  perspective: 'published', // read ONLY published docs (no drafts) — D-03
  stega: false,         // HARD INVARIANT: no stega-encoded overlay tokens in strings — CMS-03
})
```
**Why each value:**
- `stega: false` — stega embeds invisible Unicode into returned strings for click-to-edit overlays; with it on, a title/slug carries hidden chars that corrupt `generateMetadata`/`generateStaticParams` output. Off is mandatory here (CMS-03). [CITED: sanity.io/docs/stega]
- `perspective: 'published'` — the modern replacement for the older `useCdn`+token draft toggling; guarantees no draft leakage [CITED: sanity.io/docs/perspectives]. `[ASSUMED]` that `'published'` is the exact string in `@sanity/client` v7 (older versions used `'previewDrafts'`/`'raw'`/`'published'`) — verify in `node_modules/@sanity/client` types after install.
- `apiVersion` — must be a pinned ISO date; unpinned versions break silently on API changes [CITED: sanity.io/docs/api-versioning].
- `useCdn: false` — at build time you want the origin, not the CDN edge cache.

### Pattern 3: Document-level i18n plugin config (D-08, D-09)
**What:** Register `documentInternationalization` once; it adds a `language` field to each listed type and manages a hidden translations-metadata document linking the DE and EN versions.
```ts
// sanity.config.ts (excerpt)
// Source: @sanity/document-internationalization README [CITED: github.com/sanity-io/document-internationalization]
import { documentInternationalization } from '@sanity/document-internationalization'

documentInternationalization({
  supportedLanguages: [
    { id: 'de', title: 'Deutsch' },   // DE base/reference (D-09)
    { id: 'en', title: 'English' },
  ],
  schemaTypes: ['project', 'testimonial', 'service', 'seoPage', 'siteSettings'], // ALL editable types (D-08)
  // languageField defaults to 'language' — this is the field D-10 queries filter on
})
```
**Key facts to verify at plan time:**
- The plugin injects a `language` field (default field name `language`) on every listed type — this is exactly the field D-10's `language == $locale` filter targets. `[ASSUMED]` the default field name is `language`; confirm in the plugin README/types after install (it is configurable).
- New documents are created empty of language until assigned; DE-first means editors create the DE doc, then "Create translation" → EN.
- A **translations metadata document** links pairs. D-10 deliberately does NOT query via this metadata (it filters `language` directly) — simpler, and we never need both languages at once.
- `siteSettings` being in this list means there are **two** siteSettings docs (DE + EN) — the singleton enforcement (D-07) must account for one-singleton-*per-language* (see Pattern 4).

### Pattern 4: `siteSettings` singleton via structure builder (D-07)
**What:** Prevent editors creating multiple siteSettings; expose exactly one editable doc (per language, given D-08) pinned to a fixed id.
```ts
// sanity/structure.ts
// Source: Sanity structure-builder singleton pattern [CITED: sanity.io/docs/structure-builder-reference]
export const structure = (S) =>
  S.list().title('Content').items([
    S.listItem()
      .title('Site Settings')
      .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
    S.divider(),
    ...S.documentTypeListItems().filter(
      (item) => !['siteSettings'].includes(item.getId())
    ),
  ])
```
**Interaction with D-08:** Because siteSettings is document-internationalized, the fixed-id approach needs care — the DE and EN siteSettings are separate documents. Two common resolutions: (a) fixed ids `siteSettings` (DE) + a translation, or (b) let the i18n plugin manage the pair and pin only the base. **This is the single trickiest schema decision in the phase** — flagged in Open Questions Q2. Also disable "create/delete" actions for the type via `document.actions` in `sanity.config.ts` so the singleton can't be duplicated. `[ASSUMED]` on exact structure-builder API surface for v6 — verify against the structure-builder reference after install.

### Pattern 5: Typed GROQ layer with `defineQuery` + typegen (Claude's Discretion → RECOMMENDED)
**What:** Author queries as `defineQuery` template strings; run `sanity schema extract` + `sanity typegen generate` to produce `sanity.types.ts`; the query result types are inferred automatically. Centralize in `lib/sanity/queries.ts`.
**Why over hand-authored:** typegen keeps types in lockstep with the schema — a schema change that breaks a query surfaces at typecheck, which is exactly CMS-03's intent. Hand-authored interfaces drift silently.
```ts
// lib/sanity/queries.ts  — the Phase 4 contract (D-10, CMS-03)
// Source: next-sanity defineQuery + sanity typegen [CITED: sanity.io/docs/sanity-typegen]
import { defineQuery } from 'next-sanity'
import { client } from './client'

export const SERVICES_QUERY = defineQuery(
  `*[_type == "service" && language == $locale] | order(order asc){
     _id, title, slug, blurb,
     price{ amount, currency, label }, includes  // structured price (D-05)
   }`
)
export function getServices(locale: string) {
  // stega:false is on the client (Pattern 2); result type is generated
  return client.fetch(SERVICES_QUERY, { locale })
}
```
**Workflow (all require Node 22.12+):**
```bash
npx sanity@latest schema extract      # → schema.json
npx sanity@latest typegen generate    # → sanity.types.ts (typed query results)
```
Add these to a `predev`/`prebuild` or a `types:sanity` npm script so types regenerate when the schema changes. `[ASSUMED]` exact CLI subcommand names for v6 (`schema extract`, `typegen generate`) — verify with `npx sanity --help` after install. The `defineQuery`-drives-typegen mechanism is the documented v13 pattern [CITED: sanity.io/docs/sanity-typegen].

### Pattern 6: Content seed via NDJSON import (Claude's Discretion → RECOMMENDED for CMS-02)
**What:** Author the canonical content as an NDJSON file (one JSON doc per line, DE + EN docs with matching `language` fields and translation links) and import it.
```bash
npx sanity@latest dataset import content/brightbyte.ndjson <dataset> --replace
```
**Why over manual authoring:** reproducible, versioned in git, reviewable, and re-runnable — matches Phase 2's "build-time verification discipline" precedent. Manual authoring of bilingual pairs by hand in Studio is slow and unverifiable.
**Caveats:** NDJSON must include the `language` field on each doc AND the document-internationalization **translations.metadata** documents to link pairs — OR create DE docs then use Studio "Create translation" for the link. `[ASSUMED]` on the exact metadata-document `_type`/shape the plugin expects in an import; simplest robust path is: import DE + EN docs with correct `language` + `_id`s, then verify the pairing in Studio (the plugin can adopt existing docs). Confirm the metadata `_type` in the plugin README before writing the NDJSON.

### Anti-Patterns to Avoid
- **Multiple `createClient` instances** with divergent config → one might omit `stega:false`. Export ONE client (Pattern 2). CMS-03 hinges on this.
- **Unpinned `apiVersion`** (`'v1'`, `'latest'`, or omitted) → silent breakage on Content Lake API changes.
- **`perspective` left at default while reading for a public static site** → risk of draft leakage; set `'published'` explicitly.
- **Portable Text for short strings** (D-04) → forces a PT renderer on every field in Phase 4 for no gain.
- **Free-text price string** (D-05) → not machine-readable, duplicates formatting into content, blocks Phase 6 JSON-LD.
- **Baking the outcome metric into the quote text** (D-06) → loses independent styling of the number.
- **Querying via translation-metadata references** when `language == $locale` suffices (D-10) → needless GROQ complexity.
- **Shared slug across locales** (violates D-11) → weaker localized SEO, forces identical URL segments.
- **Committing Studio auth tokens / write tokens to the repo** → read client needs no token for published reads; keep `SANITY_API_*` write tokens out of client-imported code.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| DE/EN document linking | Custom `language` field + manual reference plumbing | `@sanity/document-internationalization` | Handles the translations metadata doc, "create translation" UX, and language field injection (D-08) |
| Responsive image URLs from asset refs | Manual URL string building | `@sanity/image-url` `urlFor()` | Hotspot/crop/format/quality params + srcset math are non-trivial |
| Typed query results | Hand-written TS interfaces per query | `sanity typegen` + `defineQuery` | Types stay in lockstep with schema; drift becomes a typecheck error (CMS-03 intent) |
| Studio embedding | Custom iframe / standalone app wiring | `<NextStudio config={} />` from `next-sanity/studio` | Official embed; handles routing, auth, hot reload inside Next |
| Singleton enforcement | Hoping editors don't click "create" | Structure builder fixed-id + disabled create/delete actions | The only reliable way to enforce one doc (D-07) |
| Content migration | Clicking through Studio to author 5 types × 2 langs | NDJSON + `sanity dataset import` | Reproducible, reviewable, re-runnable (CMS-02) |

**Key insight:** Every piece of this phase has a first-party Sanity solution. The only genuinely *authored* artifacts are the schema definitions, the `structure.ts` singleton config, the `lib/sanity/queries.ts` query bodies, and the NDJSON content. Everything else is configuration of existing tools.

## Common Pitfalls

### Pitfall 1: Node < 22.12 blocks all Sanity CLI/Studio work
**What goes wrong:** `sanity` CLI (`typegen`, `dataset import`, `schema extract`), Studio dev server, and possibly install postinstall steps fail or emit engine errors. Node here is v20.17.0. [VERIFIED: `node --version` this session; `npm view sanity engines` = `{ node: '>=22.12' }`]
**Why:** `sanity@6.9.2` hard-declares `engines.node >=22.12`.
**How to avoid:** First task of the phase = upgrade local Node to 22.12+ (nvm/volta), and set Vercel project Node runtime to 22.x. This is the STATE.md blocker made concrete.
**Warning signs:** `EBADENGINE` warnings on install; CLI exits with an engine error.

### Pitfall 2: stega tokens corrupting titles/slugs in metadata paths
**What goes wrong:** With stega enabled, returned strings carry invisible Unicode; `generateMetadata` titles render garbled and `generateStaticParams` slugs produce wrong/duplicate routes.
**Why:** stega is for visual-editing overlays; it has no place in a static published build (D-03).
**How to avoid:** `stega: false` on the single client (Pattern 2). Add the build-time check in Validation Architecture.
**Warning signs:** Odd whitespace/invisible chars in `<title>`; slug mismatches at build.

### Pitfall 3: `params` not awaited (Next 16 breaking change)
**What goes wrong:** Accessing `params.locale` synchronously throws/warns in Next 16.
**Why:** `params` is a `Promise` in Next 16 [VERIFIED: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/dynamic-routes.md:148-149]. The existing `app/[locale]/page.tsx` already `await params` correctly [VERIFIED: app/[locale]/page.tsx:25].
**How to avoid:** Any new page/route that reads params must `await` them; use `PageProps<'/route'>` helper for typing [VERIFIED: dynamic-routes.md:117].

### Pitfall 4: forgetting the `styled-components` / `@sanity/client` peers
**What goes wrong:** Studio build fails or `next-sanity` complains about missing peers.
**Why:** `next-sanity@13.3.2` peers require `@sanity/client ^7.26.2` + `styled-components ^6.1` [VERIFIED: npm view next-sanity peerDependencies]; neither is in CLAUDE.md's table.
**How to avoid:** Install the corrected set (Installation section). Note this does NOT breach the "no styled-components in our components" project rule — it is Studio-internal only.

### Pitfall 5: singleton + document-i18n interaction (two siteSettings docs)
**What goes wrong:** Naive fixed-id singleton assumes one doc, but D-08 makes siteSettings translated → two docs (DE, EN).
**Why:** document-internationalization creates one doc per language.
**How to avoid:** Decide the pattern explicitly (Open Questions Q2). Query siteSettings with the same `language == $locale` filter (D-10) rather than a single fixed id.

## Code Examples

### Structured price field (D-05, JSON-LD-ready for Phase 6)
```ts
// sanity/schemaTypes/objects/price.ts  [ASSUMED shape — derive exact field types per Sanity v6 docs]
import { defineType, defineField } from 'sanity'
export const price = defineType({
  name: 'price', type: 'object',
  fields: [
    defineField({ name: 'amount', type: 'number', validation: (r) => r.required().positive() }),
    defineField({ name: 'currency', type: 'string', initialValue: 'EUR' }),
    defineField({ name: 'label', type: 'string' }),           // display label, e.g. "ab €690"
  ],
})
// service.ts references: defineField({ name:'price', type:'price' }),
//                        defineField({ name:'includes', type:'array', of:[{type:'string'}] })
```

### Structured testimonial outcome metric (D-06)
```ts
// testimonial.ts fields [ASSUMED shape — derive exact validation per Sanity v6 docs]
defineField({ name: 'quote', type: 'text' }),
defineField({ name: 'author', type: 'string' }),
defineField({ name: 'company', type: 'string' }),
defineField({ name: 'outcomeValue', type: 'string' }),   // "+200%", "92%", "+47%"
defineField({ name: 'outcomeLabel', type: 'string' }),   // "Umsatz", "Retention", ...
```

### Locale-filtered typed query (D-10 — the Phase 4 contract)
```ts
// lib/sanity/queries.ts
export const TESTIMONIALS_QUERY = defineQuery(
  `*[_type == "testimonial" && language == $locale]{
     _id, quote, author, company, outcomeValue, outcomeLabel
   }`
)
export const getTestimonials = (locale: string) =>
  client.fetch(TESTIMONIALS_QUERY, { locale })
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `sanity` = Studio v3 | `sanity` npm package now on v6 line (same Studio runtime, renumbered) | ~2024→2025 | Don't reference "v3" install guides |
| `@sanity/client` bundled/older major | `@sanity/client` v7, explicit peer of next-sanity 13 | 2025 | Must install v7 explicitly |
| `useCdn` + token toggling for drafts | `perspective: 'published' \| 'drafts' \| 'raw'` | @sanity/client v6→v7 era | Use `perspective` for draft/published control [CITED: sanity.io/docs/perspectives] |
| Hand-authored TS types for GROQ | `defineQuery` + `sanity typegen` (schema-extracted) | next-sanity v9+/v13 | Types inferred from schema; recommended (Pattern 5) |
| `params` synchronous | `params` is a Promise (await) | Next 15→16 | Await everywhere [VERIFIED: dynamic-routes.md:148] |

**Deprecated/outdated:**
- Synchronous `params` access — deprecated/removed by Next 16.
- Referencing `sanity` v3 docs for install — the package is v6 now.
- `framer-motion` references — irrelevant here (no motion this phase).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `<NextStudio>` metadata/viewport re-export path + `dynamic` value | Pattern 1 | Studio route mis-indexed by robots or minor build warning; easy fix after install |
| A2 | `perspective: 'published'` is the exact v7 string | Pattern 2 | Client config error at build; verify in `@sanity/client` types |
| A3 | i18n plugin default language field name is `language` | Pattern 3, D-10 | If different, D-10 query filter must use the real field name — affects the Phase 4 contract; verify FIRST |
| A4 | CLI subcommands `schema extract` / `typegen generate` | Pattern 5 | Wrong command name; verify `npx sanity --help` |
| A5 | Structure-builder singleton API surface for v6 | Pattern 4 | Singleton enforcement code needs adjustment |
| A6 | NDJSON translations-metadata `_type`/shape for import | Pattern 6 | Import may not auto-link pairs; fallback = create DE then "Create translation" in Studio |
| A7 | Exact schema field/object shapes in Code Examples | Code Examples | Derive precise types per Sanity v6 `defineType`/`defineField` docs at plan time |

**These A1–A7 are Sanity-API-shape details from training/CITED docs, not run this session (no Sanity installed, Node too old to run CLI). Every one is verifiable in `node_modules/` immediately after install — the planner should sequence "install + verify API shapes" before "author schemas/queries."**

## Open Questions

1. **Pricing conflict (ROADMAP vs freelancer.md) — MUST resolve with user before authoring content (CMS-02).**
   - What we know: ROADMAP/REQUIREMENTS use illustrative fixed prices "~€690 landing / ~€2,500 multi-page" (SEC-03). `~/Documents/claude-contexts/freelancer.md` states the **actual** model: hourly €35/h starting rate, **project prices calculated per-project — "keine fixen Pakete" (no fixed packages)**; the €450 Lukas landing was an explicit *Freundespreis* (friend price, below market); market rate cited €800–1.500 (freelancer). Maintenance €50/half-year (€100/yr). Payment 50% on order / 50% on launch. Kleinunternehmerregelung §19 UStG — no VAT.
   - What's unclear: SEC-03 wants "fixed pricing prominently displayed," but the real business model is explicitly NOT fixed packages. The €690/€2,500 figures do not appear in freelancer.md and conflict with "keine fixen Pakete."
   - Recommendation: **Do NOT silently author €690/€2,500.** Surface to user in planning: either (a) commit to displayed starting-price packages (e.g. "ab €X") as a marketing decision — then get the real numbers, or (b) show "ab €35/h, projektbezogen kalkuliert" + the maintenance figure. The structured `price` schema (D-05) supports either — but the *content values* need a human decision. This is Claude's-Discretion-flagged-as-conflict per CONTEXT.md.

2. **siteSettings singleton × document-i18n (D-07 × D-08).** How to reconcile fixed-id singleton with per-language docs. Recommendation: query siteSettings with `language == $locale` (D-10), enforce "no create/delete" via document actions, pin the DE base id, let the plugin manage the EN translation. Confirm plugin behavior after install.

3. **Impressum/Datenschutz content home.** SEC-09 (Phase 4) needs Impressum (Karl-Marx-Allee 118, 10243 Berlin; Steuernummer 14/596/01847 from freelancer.md; §19 UStG note) + Datenschutz. Is this `siteSettings` fields, a `seoPage`, or a dedicated legal type? Recommendation: put address/legal identity in `siteSettings` (already D-07's stated home for Impressum/address); shape the fields now so Phase 4 renders them. Confirm scope with planner.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js ≥22.12 | `sanity` CLI, Studio dev, typegen, dataset import | ✗ | v20.17.0 installed | **none — must upgrade** [VERIFIED: `node --version`] |
| Next.js 16.3.0 | Studio route mount, build | ✓ | 16.3.0 | — [VERIFIED: node_modules/next/package.json] |
| TypeScript 5+ | typed query layer, ESM | ✓ | 5.9.3 | — [VERIFIED: node_modules/typescript/package.json] |
| Sanity account/project (projectId, dataset) | all reads/writes, Studio | ? | — | **user must provide/create** a Sanity project + dataset + env vars |
| `.env` for `NEXT_PUBLIC_SANITY_PROJECT_ID`/`_DATASET`/apiVersion | client + Studio | ✗ | no `.env*` present | create env file [VERIFIED: no `.env*` matched this session] |
| Vercel Node runtime 22.x | production build/deploy | ? | — | set in Vercel project settings (STATE.md blocker) |

**Missing dependencies with no fallback:**
- **Node ≥22.12** — hard blocker for ALL local Sanity work. Upgrade before any other task.
- **A Sanity project (projectId + dataset) + env vars** — nothing can read/write without these; user must create the project (`npx sanity init` once Node is upgraded) and supply env values.

**Missing dependencies with fallback:**
- `.env` file — created during scaffold; values come from the Sanity project.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | `@playwright/test` ^1.49.0 + bash invariant scripts (existing project convention) [VERIFIED: package.json:6-13] |
| Config file | `playwright.config.ts` (exists per Phase 2 tests dir) |
| Quick run command | `npm run build` (the primary CMS-03 gate) |
| Full suite command | `npm test` (`test:invariants` + `test:a11y`) — extend with a Sanity invariant |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CMS-01 | 5 schema types + document-i18n exist and load in Studio; each type has a `language` field | integration | `npx sanity schema extract` succeeds + assert `schema.json` contains all 5 types with a `language` field | ❌ Wave 0 |
| CMS-01 | DE/EN document pairs exist for authored content | data | GROQ count: `count(*[_type=="service" && language=="de"]) == count(... && language=="en")` via a node script | ❌ Wave 0 |
| CMS-02 | All canonical content present as published docs | data | GROQ presence checks per type (≥1 service, 3 testimonials with outcome metrics, siteSettings singleton, projects) | ❌ Wave 0 |
| CMS-03 | Every query typed | typecheck | `npx sanity typegen generate && npx tsc --noEmit` — a schema/query mismatch fails typecheck | ❌ Wave 0 |
| CMS-03 | No stega corruption in titles/slugs; build succeeds | build | `npm run build` green + grep built output/metadata for stega Unicode (e.g. U+E0000 range) in `<title>`/route slugs | ❌ Wave 0 |
| CMS-03 | Single client enforces `stega:false` | static guard | grep invariant: exactly one `createClient(`, and it includes `stega: false` + `perspective: 'published'` (mirror Phase 2's `no-locale-from-state.sh` bash-guard precedent) | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npx tsc --noEmit` (fast — catches query/type drift)
- **Per wave merge:** `npm run build` (the CMS-03 stega + static-params gate)
- **Phase gate:** Full `npm test` + build green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `tests/invariants/sanity-single-client.sh` — assert one `createClient` with `stega:false` + `perspective:'published'` (bash guard, mirrors Phase 2 pattern)
- [ ] `tests/invariants/no-stega-in-build.sh` — grep built metadata/params output for stega Unicode
- [ ] A node/GROQ script (`tests/sanity/content-presence.mjs`) — DE/EN pair counts + required-content presence (CMS-02)
- [ ] `sanity typegen` wired into a `types:sanity` npm script + `prebuild`/`pretest`
- [ ] Confirm Node 22.12+ before any of the above can run

*(Test infra exists for Playwright + bash invariants; the Sanity-specific guards above are new.)*

## Security Domain

`security_enforcement` not found as `false` in config — treating as enabled. This phase is content-modelling + read layer, low attack surface, but note:

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Studio auth is Sanity-managed (D-02) — do not roll custom auth for `/studio` |
| V4 Access Control | yes | Read client uses NO token for published reads; any write/import token stays server-side + out of git, in env only |
| V5 Input Validation | yes | Schema `validation` rules (required/positive/regex on slugs) are the input-validation layer for authored content |
| V6 Cryptography | no | No crypto in this phase |
| V14 Config | yes | `projectId`/`dataset` are public (`NEXT_PUBLIC_*`); write/API tokens are secret — never in client-imported modules |

### Known Threat Patterns for Sanity + Next static site
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Draft/unpublished content leaking to public build | Information Disclosure | `perspective: 'published'` on the single client (Pattern 2) |
| stega tokens corrupting SEO metadata/routes | Tampering (data integrity) | `stega: false` invariant + build-time grep guard (CMS-03) |
| Write token committed to repo | Information Disclosure / Elevation | Read client tokenless; import token in local env only, gitignored |
| `/studio` treated as public content route | — | It is auth-gated by Sanity (D-02); ensure it is `noindex` (Studio metadata sets robots) and excluded from sitemap |

## Sources

### Primary (HIGH confidence — VERIFIED this session)
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/dynamic-routes.md` — optional catch-all `[[...]]`, `params` is a Promise (Next 16)
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-static-params.md` — `generateStaticParams` return shapes, `dynamicParams`, `force-static`
- `npm view` for `sanity` (6.9.2, engines >=22.12), `next-sanity` (13.3.2, peers), `@sanity/client` (7.26.2), `@sanity/document-internationalization` (6.2.30), `@sanity/image-url` (2.1.1), `@sanity/vision` (6.9.2)
- `package.json`, `tsconfig.json`, `app/[locale]/page.tsx`, `lib/i18n/metadata.ts` — current codebase state
- `node --version` (v20.17.0), `node_modules/sanity` absent, no `.env*` present

### Secondary (MEDIUM confidence — CITED from official docs, not run this session)
- sanity.io/docs — createClient, perspectives, api-versioning, stega, structure-builder, sanity-typegen, localization
- github.com/sanity-io/next-sanity — `<NextStudio>` embed, `defineQuery`
- github.com/sanity-io/document-internationalization — plugin config
- `.claude/CLAUDE.md` stack table (itself sourced from the above official docs) — version rationale

### Tertiary (LOW confidence — see Assumptions Log A1–A7)
- Exact Sanity v6 API surface (field name defaults, CLI subcommand names, metadata re-export path, NDJSON metadata shape) — verify in `node_modules/` after install

## Project Constraints (from CLAUDE.md / AGENTS.md)
- **Next.js 16 breaking-changes rule (AGENTS.md):** read `node_modules/next/dist/docs/01-app/` before writing route/metadata code — done for this research; planner/executor must continue.
- **ESM-only, TypeScript-first:** all schema/config/query files are TS/ESM. No CJS.
- **Single styling approach / no styled-components in OUR components:** the `styled-components` peer is Studio-internal ONLY — does not breach the rule; our app uses Tailwind v4 `@theme` tokens exclusively.
- **`{ data, error }` destructure pattern:** applies to SDK Result-pattern calls (e.g. Resend, Phase 4) — not directly this phase, but keep the convention.
- **No `tailwind.config.js`:** unchanged; tokens in `@theme`.
- **One content source (Sanity):** never reintroduce v1's inline `.tsx`/`dictionaries/`/`data/content.ts`.
- **next-intl = UI chrome only; Sanity = editorial content:** keep the boundary crisp (Phase 2 D-01).

## Metadata

**Confidence breakdown:**
- Standard stack + versions: HIGH — VERIFIED against npm registry this session; corrected vs CLAUDE.md.
- Next.js 16 route/metadata/params APIs: HIGH — VERIFIED by reading in-repo version-matched docs.
- Codebase state (nothing installed, Node too old, existing patterns): HIGH — VERIFIED by reading files.
- Sanity v6 exact API shapes (field names, CLI subcommands, singleton API, NDJSON metadata): MEDIUM/LOW — CITED from docs but not run (no Sanity, Node too old to execute CLI). Captured in Assumptions Log A1–A7 for verify-after-install.
- Pricing content: conflict identified and flagged (Q1) — needs user decision.

**Research date:** 2026-08-12
**Valid until:** 2026-09-11 (30 days — Sanity/next-sanity move moderately; re-verify versions if planning slips past this)
