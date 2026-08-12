# Phase 3: Sanity Content Architecture - Pattern Map

**Mapped:** 2026-08-12
**Files analyzed:** 16 new/modified files
**Analogs found:** 13 / 16 (3 greenfield-for-Sanity with structural analogs noted)

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `sanity.config.ts` | config | — | `next.config.ts` | structural-analog (plugin-wrapping config) |
| `sanity.cli.ts` | config | — | `postcss.config.mjs` | structural-analog (simple config object, ESM export) |
| `sanity/schemaTypes/index.ts` | config | — | `i18n/routing.ts` | structural-analog (single-source-of-truth export array) |
| `sanity/schemaTypes/project.ts` | model | CRUD | `i18n/routing.ts` (defineRouting shape) | partial-match |
| `sanity/schemaTypes/testimonial.ts` | model | CRUD | `i18n/routing.ts` | partial-match |
| `sanity/schemaTypes/service.ts` | model | CRUD | `i18n/routing.ts` | partial-match |
| `sanity/schemaTypes/seoPage.ts` | model | CRUD | `i18n/routing.ts` | partial-match |
| `sanity/schemaTypes/siteSettings.ts` | model | CRUD | `i18n/routing.ts` | partial-match |
| `sanity/schemaTypes/objects/price.ts` | model | — | — | no analog |
| `sanity/schemaTypes/objects/outcomeMetric.ts` | model | — | — | no analog |
| `sanity/structure.ts` | config | — | — | no analog |
| `sanity/env.ts` | utility | — | `i18n/routing.ts` (constants module) | structural-analog |
| `lib/sanity/client.ts` | utility | request-response | `lib/i18n/metadata.ts` | role-match (single shared export, pinned config) |
| `lib/sanity/image.ts` | utility | transform | `lib/i18n/metadata.ts` | role-match |
| `lib/sanity/queries.ts` | service | request-response | `lib/i18n/metadata.ts` + `app/[locale]/page.tsx` | role-match (typed, centralized, locale-parameterized) |
| `app/studio/[[...tool]]/page.tsx` | component | request-response | `app/[locale]/page.tsx` | role-match (Next 16 page, async params, dynamic export) |
| `content/brightbyte.ndjson` | — | batch | — | no analog (data file) |
| `sanity.types.ts` | — | — | — | generated file, no analog needed |
| `tests/invariants/sanity-single-client.sh` | test | — | `tests/invariants/no-locale-from-state.sh` | exact (bash invariant guard) |
| `tests/invariants/no-stega-in-build.sh` | test | — | `tests/invariants/no-raw-hex.sh` | exact (bash invariant guard) |

---

## Pattern Assignments

### `sanity.config.ts` (config)

**Analog:** `next.config.ts` (lines 1–33)

**Rationale:** `next.config.ts` is the project's precedent for a top-level config file that wraps a plugin (withNextIntl), exports a single named config object, uses ESM, and carries inline explanatory comments keyed to decision IDs.

**Config/plugin-wrapping pattern** (`next.config.ts` lines 1–33):
```typescript
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import path from 'path'

const withNextIntl = createNextIntlPlugin({
  requestConfig: './i18n/request.ts',
})

// ... projectRoot detection logic ...

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
}

export default withNextIntl(nextConfig)
```

**Apply to `sanity.config.ts`:** Single top-level `defineConfig` call (Sanity's equivalent of `NextConfig`). Register plugins array (`documentInternationalization`, `structureTool({ structure })`, `visionTool`). Reference `projectId`/`dataset`/`apiVersion` from `@/sanity/env`. Use ESM default export. Comment each plugin call with the decision ID it implements (D-01, D-07, D-08).

---

### `sanity.cli.ts` (config)

**Analog:** `postcss.config.mjs` (lines 1–8)

**Rationale:** `postcss.config.mjs` is the project's minimal single-export config file pattern — a plain object with a few known keys, a JSDoc type comment, and a default ESM export. `sanity.cli.ts` is the same shape (`defineCliConfig({ api: { projectId, dataset } })`).

**Minimal config export pattern** (`postcss.config.mjs` lines 1–8):
```javascript
/** @type {import('postcss').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}

export default config
```

**Apply to `sanity.cli.ts`:** Replace with `import { defineCliConfig } from 'sanity/cli'` and export `defineCliConfig({ api: { projectId, dataset } })`. Keep the same concise shape.

---

### `sanity/schemaTypes/index.ts` (config, barrel export)

**Analog:** `i18n/routing.ts` (lines 1–17) and `i18n/navigation.ts` (lines 1–22)

**Rationale:** Both are single-purpose barrel modules that export one named constant that becomes the single source of truth for downstream consumers. `routing.ts` exports `routing`; this file exports `schemaTypes: SchemaTypeDefinition[]`.

**Single-source-of-truth export pattern** (`i18n/routing.ts` lines 10–17):
```typescript
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['de', 'en'],
  defaultLocale: 'de',
  localePrefix: 'always',
  localeDetection: false,
})
```

**Apply to `sanity/schemaTypes/index.ts`:** Import all five schema types + object types, export `export const schemaTypes = [project, testimonial, service, seoPage, siteSettings]`. This is the only import that `sanity.config.ts` needs for the `schema.types` key.

---

### `sanity/schemaTypes/project.ts`, `testimonial.ts`, `service.ts`, `seoPage.ts`, `siteSettings.ts` (model, CRUD)

**No in-repo structural analog** for Sanity `defineType` + `defineField` schemas. These files are greenfield-for-Sanity. Use the RESEARCH.md Code Examples as the template, not any in-repo file.

**Closest structural analog:** `i18n/routing.ts` demonstrates the project convention for typed config objects with named exports and decision-ID comments — carry that commenting discipline into schema files.

**ESM/TypeScript module convention** (from `i18n/routing.ts` and `lib/i18n/metadata.ts`):
```typescript
/**
 * <filename> — <one-line purpose>.
 *
 * Decision IDs: D-XX, D-XX
 */
import { defineType, defineField } from 'sanity'

export const <typeName> = defineType({
  name: '<typeName>',
  type: 'document',
  fields: [
    defineField({ ... }),
  ],
})
```

**Schema-specific patterns from RESEARCH.md Code Examples** (use directly):

```typescript
// testimonial.ts — D-06: structured outcome metric
defineField({ name: 'quote',        type: 'text' }),
defineField({ name: 'author',       type: 'string' }),
defineField({ name: 'company',      type: 'string' }),
defineField({ name: 'outcomeValue', type: 'string' }),  // "+200%", "92%", "+47%"
defineField({ name: 'outcomeLabel', type: 'string' }),  // "Umsatz", "Retention", ...
```

```typescript
// service.ts — D-05: structured price, NOT free-text string
defineField({ name: 'price',    type: 'price' }),       // object type, see objects/price.ts
defineField({ name: 'priceOnRequest', type: 'boolean', initialValue: false }),
defineField({ name: 'includes', type: 'array', of: [{ type: 'string' }] }),
```

```typescript
// project.ts / seoPage.ts — D-11: per-locale slug (slug is NOT shared across languages)
defineField({ name: 'slug', type: 'slug', options: { source: 'title' } }),
```

**Verify after install:** Exact `defineType`/`defineField` API surface is ASSUMED from Sanity v6 docs (Assumption A7 in RESEARCH.md). Confirm in `node_modules/sanity/` types.

---

### `sanity/schemaTypes/objects/price.ts` (model)

**No in-repo analog.** Greenfield Sanity object type. Use RESEARCH.md Code Examples directly:

```typescript
// sanity/schemaTypes/objects/price.ts — D-05
import { defineType, defineField } from 'sanity'

export const price = defineType({
  name: 'price',
  type: 'object',
  fields: [
    defineField({ name: 'amount',   type: 'number',  validation: (r) => r.positive() }),
    defineField({ name: 'currency', type: 'string',  initialValue: 'EUR' }),
    defineField({ name: 'label',    type: 'string' }),  // e.g. "ab €1.500"
    defineField({ name: 'priceFrom', type: 'boolean', initialValue: false }),
  ],
})
```

The `priceFrom` flag (D-05 "ab" semantics) belongs here alongside `priceOnRequest` on `service.ts` — together they carry enough for Phase 4 to render "ab €1.500" and "Preis nach Erstgespräch" without hardcoding.

---

### `sanity/schemaTypes/objects/outcomeMetric.ts` (model)

**No in-repo analog.** Greenfield Sanity object type. Extract from RESEARCH.md Code Examples:

```typescript
// sanity/schemaTypes/objects/outcomeMetric.ts — D-06
import { defineType, defineField } from 'sanity'

export const outcomeMetric = defineType({
  name: 'outcomeMetric',
  type: 'object',
  fields: [
    defineField({ name: 'value', type: 'string' }),  // "+200%", "92%", "+47%"
    defineField({ name: 'label', type: 'string' }),  // "Umsatz", "Retention", ...
  ],
})
```

Alternatively, these fields may live inline on `testimonial.ts` (as in the RESEARCH.md excerpt) rather than a shared object type. Either is valid — the planner should pick the simpler approach: inline on `testimonial.ts` unless the metric is reused elsewhere.

---

### `sanity/structure.ts` (config)

**No in-repo analog.** Greenfield Sanity structure builder. Use RESEARCH.md Pattern 4 directly.

**Structural concept analog:** `proxy.ts` shows the project convention for an exported named function (`export function proxy`) that wraps a library call with local configuration. `structure.ts` similarly exports a `structure` function consumed by `sanity.config.ts`.

**Pattern from RESEARCH.md Pattern 4:**
```typescript
// sanity/structure.ts — D-07: siteSettings singleton enforcement
// VERIFY: structure-builder API surface for Sanity v6 after install (Assumption A5)
export const structure = (S: StructureBuilder) =>
  S.list().title('Content').items([
    S.listItem()
      .title('Site Settings')
      .child(
        S.document().schemaType('siteSettings').documentId('siteSettings')
      ),
    S.divider(),
    ...S.documentTypeListItems().filter(
      (item) => !['siteSettings'].includes(item.getId())
    ),
  ])
```

**Singleton × i18n interaction (RESEARCH.md Pitfall 5, Open Question Q2):** Because D-08 makes `siteSettings` document-internationalized, there are two docs (DE + EN). The fixed `documentId('siteSettings')` pins only the DE base; the plugin manages the EN translation. Queries for `siteSettings` use the same `language == $locale` filter (D-10), not the fixed id. Document create/delete actions must be disabled for the type in `sanity.config.ts` to enforce the singleton. Confirm plugin behavior after install.

---

### `sanity/env.ts` (utility)

**Analog:** `i18n/routing.ts` (constants/config module) + `lib/i18n/metadata.ts` (env-var reader, lines 24–25)

**Rationale:** `lib/i18n/metadata.ts` demonstrates the project pattern for reading an env var with a fallback (`process.env.NEXT_PUBLIC_BASE_URL ?? 'https://brightbyte.berlin'`). `sanity/env.ts` applies the same pattern for three vars, throwing on missing required values.

**Env-var reader pattern** (`lib/i18n/metadata.ts` lines 24–25):
```typescript
export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? 'https://brightbyte.berlin'
```

**Apply to `sanity/env.ts`:**
```typescript
// sanity/env.ts — single source for Sanity project config
// NEXT_PUBLIC_ prefix: these are safe to expose (no secret value)
export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  'Missing env: NEXT_PUBLIC_SANITY_PROJECT_ID'
)
export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  'Missing env: NEXT_PUBLIC_SANITY_DATASET'
)
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2025-08-01'

function assertValue<T>(v: T | undefined, msg: string): T {
  if (v === undefined) throw new Error(msg)
  return v
}
```

---

### `lib/sanity/client.ts` (utility, request-response)

**Analog:** `lib/i18n/metadata.ts` (lines 1–40)

**Rationale:** `lib/i18n/metadata.ts` is the project's only existing `lib/` utility. It exports one named value (`buildHreflangAlternates`, `BASE_URL`) that is consumed everywhere and must never be duplicated. `lib/sanity/client.ts` follows the identical discipline: one named export (`client`) that is imported wherever GROQ is needed — duplicating it would break the `stega: false` invariant (CMS-03).

**Single-export lib/ module pattern** (`lib/i18n/metadata.ts` lines 22–25):
```typescript
import type { Metadata } from 'next'

export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? 'https://brightbyte.berlin'
```

**Apply to `lib/sanity/client.ts`** (from RESEARCH.md Pattern 2):
```typescript
// lib/sanity/client.ts — ONE createClient. Never create a second.
// stega:false is the hard invariant for CMS-03.
import { createClient } from 'next-sanity'
import { projectId, dataset, apiVersion } from '@/sanity/env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,          // pinned ISO date string from env — NOT 'v1' or 'latest'
  useCdn: false,       // build-time reads want origin, not CDN edge cache
  perspective: 'published',  // published docs only — no draft leakage (D-03)
  stega: false,        // HARD INVARIANT: no stega tokens in titles/slugs (CMS-03)
})
```

**File header comment style** (mirror `lib/i18n/metadata.ts` lines 1–21): JSDoc block referencing the decision IDs (`D-03`, `CMS-03`) + one-line purpose + the invariant this file enforces.

---

### `lib/sanity/image.ts` (utility, transform)

**Analog:** `lib/i18n/metadata.ts` (single named export, lib/ module convention)

**Rationale:** Same lib/ pattern — one exported function consumed by any component that renders a Sanity image asset.

**Apply to `lib/sanity/image.ts`:**
```typescript
// lib/sanity/image.ts — @sanity/image-url builder
// urlFor(source) → ImageUrlBuilder; call .url() or chain .width().format()
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { client } from './client'

const builder = imageUrlBuilder(client)

export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}
```

---

### `lib/sanity/queries.ts` (service, request-response)

**Analog:** `lib/i18n/metadata.ts` (centralized utility) + `app/[locale]/page.tsx` (locale param consumption pattern)

**Rationale:** `lib/i18n/metadata.ts` establishes the project convention that shared cross-cutting logic lives in `lib/` and is imported by pages/components. `app/[locale]/page.tsx` shows how a page receives `locale` from params and feeds it into a downstream call. `queries.ts` is the seam between those two patterns: the `$locale` param (from URL-derived locale, Phase 2) flows into each query function.

**Locale param consumption** (`app/[locale]/page.tsx` lines 20–25):
```typescript
type PageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  // locale flows into lib/ calls
```

**Apply to `lib/sanity/queries.ts`** (from RESEARCH.md Pattern 5 + Code Examples):
```typescript
// lib/sanity/queries.ts — Centralized typed GROQ query layer. THE Phase 4 import contract.
// D-10: every query accepts $locale; Phase 4 passes the URL-derived locale (Phase 2 routing).
// CMS-03: all queries wrapped in defineQuery so sanity typegen infers result types.
// stega:false is on the client (lib/sanity/client.ts) — never add it here.
import { defineQuery } from 'next-sanity'
import { client } from './client'

export const SERVICES_QUERY = defineQuery(
  `*[_type == "service" && language == $locale] | order(order asc){
     _id, title, slug, blurb,
     price{ amount, currency, label, priceFrom },
     priceOnRequest, includes
   }`
)
export function getServices(locale: string) {
  return client.fetch(SERVICES_QUERY, { locale })
}

export const TESTIMONIALS_QUERY = defineQuery(
  `*[_type == "testimonial" && language == $locale]{
     _id, quote, author, company, outcomeValue, outcomeLabel
   }`
)
export function getTestimonials(locale: string) {
  return client.fetch(TESTIMONIALS_QUERY, { locale })
}

// ... PROJECTS_QUERY, SITE_SETTINGS_QUERY, SEO_PAGES_QUERY follow the same shape
```

**Key constraint:** `defineQuery` wraps every query string so `sanity typegen` can infer result types — the un-typed equivalent `client.fetch('...')` must not appear in this file (CMS-03).

---

### `app/studio/[[...tool]]/page.tsx` (component, request-response)

**Analog:** `app/[locale]/page.tsx` (lines 1–57) and `app/page.tsx` (lines 1–17)

**Rationale:** The Studio page is a Next 16 page file. The project's existing pages show the exact conventions: JSDoc header, `type PageProps` with `params: Promise<{...}>`, `export const dynamic`, `export function generateStaticParams`, and the component function.

**Page file conventions** (`app/[locale]/page.tsx` lines 16–25):
```typescript
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { buildHreflangAlternates, BASE_URL } from '@/lib/i18n/metadata'

type PageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
```

**`'use client'` directive convention** (`components/LocaleSwitcher.tsx` line 21):
```typescript
'use client'
```
Client components place the directive at the very top, before imports.

**Apply to `app/studio/[[...tool]]/page.tsx`** (from RESEARCH.md Pattern 1):
```typescript
// app/studio/[[...tool]]/page.tsx — Embedded Sanity Studio (D-01, D-02).
// VERIFY: exact re-export path + dynamic value after install (Assumption A1).
'use client'
import { NextStudio } from 'next-sanity/studio'
import config from '../../../sanity.config'

export const dynamic = 'force-static'
export { metadata, viewport } from 'next-sanity/studio'

export default function StudioPage() {
  return <NextStudio config={config} />
}
```

**Notes:**
- `[[...tool]]` is an optional catch-all — matches `/studio` AND `/studio/structure/...` (Next 16 docs verified in RESEARCH.md).
- `params` is not consumed (Studio page has no locale param), so the async-params pitfall (RESEARCH.md Pitfall 3) does not apply here.
- The `/studio` path must be added to `proxy.ts` matcher exclusions so the middleware does not try to locale-prefix it.

---

### `tests/invariants/sanity-single-client.sh` (test)

**Analog:** `tests/invariants/no-locale-from-state.sh` (full file)

**Rationale:** This is an exact-match analog. The existing bash invariant guards establish the canonical project test pattern for structural code guards: `set -euo pipefail`, `REPO_ROOT` detection, `grep -rEn` with comment-line filtering, `EXIT_CODE` accumulation, a `PASS`/`FAIL` message at exit.

**Full bash invariant pattern** (`tests/invariants/no-locale-from-state.sh` lines 1–75):
```bash
#!/usr/bin/env bash
# <Req ID> Invariant Gate — <filename>.sh
#
# <Purpose statement>
#
# Usage:
#   bash tests/invariants/<filename>.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

EXIT_CODE=0

# ── (a) <Check name> ──────────────────────────────────────────────────────────
PATTERN="<grep pattern>"

HITS=$(
  grep -rEn "${PATTERN}" \
    "${REPO_ROOT}/lib" \
    --include="*.ts" \
  | grep -vE '^\s*(//|/\*|\*|<!--)' \
  || true
)

if [ -n "${HITS}" ]; then
  echo "FAIL [<ID>]: <message>"
  echo ""
  echo "Offenders:"
  echo "${HITS}"
  EXIT_CODE=1
fi

if [ "${EXIT_CODE}" -eq 0 ]; then
  echo "PASS [<ID>]: <message>"
fi

exit "${EXIT_CODE}"
```

**Apply to `sanity-single-client.sh`:** Assert exactly ONE `createClient(` call in `lib/` + `sanity/`, and assert it includes `stega: false` and `perspective: 'published'`. Mirror the two-check structure (one grep for createClient count, one for the required config properties).

---

### `tests/invariants/no-stega-in-build.sh` (test)

**Analog:** `tests/invariants/no-raw-hex.sh` (full file)

**Rationale:** `no-raw-hex.sh` guards a specific string pattern that must not appear in source files — `no-stega-in-build.sh` does the same for stega Unicode (U+E0000 range) in the build output. Same structure: grep scan, `EXIT_CODE` accumulation, PASS/FAIL report.

**Grep-based guard pattern** (`tests/invariants/no-raw-hex.sh` lines 38–55):
```bash
RAW_HEX=$(
  grep -rEn '#[0-9a-fA-F]{3,8}' "${APP_DIR}" \
    --include="*.tsx" \
    --include="*.ts" \
    --include="*.css" \
  | grep -vE '^\s*(//|/\*|\*|<!--)' \
  || true
)

if [ -n "${RAW_HEX}" ]; then
  echo "FAIL [IDENT-01]: Raw hex color values found ..."
  EXIT_CODE=1
fi
```

**Apply to `no-stega-in-build.sh`:** Scan `.next/server/` or the Next.js build output for stega Unicode range characters in HTML/JS files. Because `.next/` is not always present in CI before a build, the script should run `npm run build` first (or be gated in the phase test flow after a successful build).

---

### `content/brightbyte.ndjson` (data, batch)

**No code analog** — this is a data file, not a source file. Structure from RESEARCH.md Pattern 6: one JSON object per line, each line is a Sanity document with `_id`, `_type`, `language` field, and content fields. DE docs first, EN docs second. Include the document-internationalization translations metadata documents to link pairs.

---

## Shared Patterns

### Decision-ID commenting convention
**Source:** `lib/i18n/metadata.ts` lines 1–21, `app/[locale]/layout.tsx` lines 1–22, `i18n/routing.ts` lines 1–17
**Apply to:** All new files in this phase

Every file opens with a JSDoc comment block that includes:
- One-line purpose statement
- Decision IDs that govern the file's behavior
- Any invariants enforced
- Source references (docs, RESEARCH.md pattern numbers)

```typescript
/**
 * <filename> — <one-line purpose>.
 *
 * <What it does and why>.
 *
 * D-XX: <decision name>
 * CMS-XX: <requirement name>
 *
 * Source: <where the pattern comes from>
 */
```

---

### `@/*` path alias convention
**Source:** `tsconfig.json` lines 25–29, used in every source file
**Apply to:** All new TS files — use `@/sanity/env`, `@/lib/sanity/client`, etc.

```typescript
// tsconfig.json paths:
"paths": { "@/*": ["./*"] }

// Usage in any file:
import { projectId, dataset } from '@/sanity/env'
import { client } from '@/lib/sanity/client'
import { getServices } from '@/lib/sanity/queries'
```

---

### ESM-only, no default object export for utility modules
**Source:** `lib/i18n/metadata.ts`, `i18n/routing.ts`, `i18n/navigation.ts`
**Apply to:** `lib/sanity/client.ts`, `lib/sanity/image.ts`, `lib/sanity/queries.ts`, `sanity/env.ts`

All `lib/` utilities use named exports, not `export default`. The only default exports in the project are page components (`export default function ...`) and plugin-wrapping configs (`export default withNextIntl(nextConfig)`).

---

### `params` as `Promise<{...}>` — must be awaited (Next 16)
**Source:** `app/[locale]/page.tsx` lines 20–25, `app/[locale]/layout.tsx` lines 61–70
**Apply to:** `app/studio/[[...tool]]/page.tsx` (if params are ever read)

```typescript
// Correct (Next 16): params is a Promise
type PageProps = {
  params: Promise<{ locale: string }>
}
export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params  // must await
}
```

The Studio page does not read params (it ignores the catch-all segments), but any future page added under `app/studio/` that reads params must follow this pattern.

---

### `proxy.ts` matcher exclusion for new non-locale routes
**Source:** `proxy.ts` lines 34–45 (matcher config)
**Apply to:** When the Studio route is added

```typescript
// proxy.ts matcher — exclude /studio from locale prefixing
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|token-audit|studio).*)',
    // ↑ add |studio to prevent middleware from trying to /de/studio prefix the Studio
  ],
}
```

---

### Bash invariant structure
**Source:** `tests/invariants/no-locale-from-state.sh` (full file), `tests/invariants/no-raw-hex.sh` (full file)
**Apply to:** `tests/invariants/sanity-single-client.sh`, `tests/invariants/no-stega-in-build.sh`

Key structural elements to copy verbatim:
- `set -euo pipefail`
- `SCRIPT_DIR` + `REPO_ROOT` detection using `"$(cd ... && pwd)"`
- `EXIT_CODE=0` accumulator (not `exit 1` in-line — allows multiple checks to run)
- `grep ... || true` (prevents `set -e` from killing the script on zero matches)
- `grep -vE '^\s*(//|/\*|\*|<!--)'` comment-line filter on all source scans
- `PASS [ID]:` / `FAIL [ID]:` message format
- `exit "${EXIT_CODE}"` at end

---

### `package.json` scripts integration
**Source:** `package.json` lines 6–13
**Apply to:** Adding `types:sanity` and updated `test:invariants` script

```json
// Existing pattern:
"test:invariants": "bash tests/invariants/no-raw-hex.sh && bash tests/invariants/no-locale-from-state.sh"

// New entries to add:
"types:sanity": "sanity schema extract && sanity typegen generate",
"prebuild": "npm run types:sanity",
"test:invariants": "bash tests/invariants/no-raw-hex.sh && bash tests/invariants/no-locale-from-state.sh && bash tests/invariants/sanity-single-client.sh"
```

---

## No Analog Found

Files with no close match in the codebase (use RESEARCH.md patterns directly):

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `sanity/schemaTypes/objects/price.ts` | model | — | No Sanity schema files exist yet; no object-type analog in repo |
| `sanity/schemaTypes/objects/outcomeMetric.ts` | model | — | Same — first Sanity object type |
| `sanity/structure.ts` | config | — | No structure-builder pattern in repo; Sanity-specific, use RESEARCH.md Pattern 4 |
| `content/brightbyte.ndjson` | data | batch | Data file; no NDJSON precedent in repo |
| `sanity.types.ts` | generated | — | Generated by `sanity typegen`; do not hand-author |

For all five: RESEARCH.md Code Examples and Patterns 1–6 are the authoritative templates. Verify all `[ASSUMED]`-tagged items (A1–A7 in RESEARCH.md Assumptions Log) against `node_modules/` immediately after install, before authoring schemas or queries.

---

## Metadata

**Analog search scope:** `app/`, `components/`, `lib/`, `i18n/`, `tests/`, `styles/`, root config files
**Files scanned:** 16 source files (all TS/TSX/JS in the repo outside node_modules)
**Sanity-specific files:** 0 (greenfield — nothing to analog-match within Sanity's own conventions)
**Pattern extraction date:** 2026-08-12

**Critical verify-after-install gates (RESEARCH.md Assumptions A1–A7):**
- A1: `next-sanity/studio` re-export path for `metadata`/`viewport` + correct `dynamic` value
- A2: `perspective: 'published'` exact string in `@sanity/client` v7 types
- A3: i18n plugin default `language` field name (D-10 query contract depends on this)
- A4: CLI subcommand names (`schema extract`, `typegen generate`)
- A5: Structure-builder v6 API surface (`S.list()`, `S.document()`, etc.)
- A6: NDJSON translations-metadata `_type` shape for paired import
- A7: `defineType`/`defineField` exact field type strings in Sanity v6

Sequence for executor: **install packages → verify A1–A7 in node_modules → author schemas → author queries → seed content → run typegen → run build**.
