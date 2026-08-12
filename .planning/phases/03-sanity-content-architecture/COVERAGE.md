# Phase 3 — Sanity API Coverage Matrix

> Full API Coverage by Default — Opt Out, Never Opt In.
> External integration detected: **Sanity v6 + next-sanity 13 + @sanity/* SDK/CLI**. This matrix enumerates the Sanity capability surface this phase touches. `INTEGRATE` is the default; every `OPT-OUT` carries a one-line reason. Generated before plan seal.

**Detector verdict:** `detected = true` (Sanity/next-sanity/GROQ SDK + CLI in scope).

| Capability | Package / API | Disposition | Reason |
|-----------|---------------|-------------|--------|
| Read client (GROQ reads) | `createClient` (next-sanity) | **INTEGRATE** | Core read layer — `lib/sanity/client.ts`, single instance, `stega:false`, `perspective:'published'`, `useCdn:false` (Pattern 2, CMS-03). |
| Typed query authoring | `defineQuery` (next-sanity) | **INTEGRATE** | Every query in `lib/sanity/queries.ts` wrapped so typegen infers result types (CMS-03). |
| Schema extraction | `sanity schema extract` (CLI) | **INTEGRATE** | Produces `schema.json` for typegen; also the CMS-01 verify (assert 5 types + `language` field). |
| Type generation | `sanity typegen generate` (CLI) | **INTEGRATE** | Generates `sanity.types.ts` from schema+queries — the typed contract (CMS-03). Wired via `types:sanity` + `prebuild`. |
| Embedded Studio | `<NextStudio>` (`next-sanity/studio`) | **INTEGRATE** | Mounts `/studio` catch-all route (D-01, D-02). |
| Studio config | `defineConfig` (sanity) | **INTEGRATE** | `sanity.config.ts` — schema, plugins, structure. |
| CLI config | `defineCliConfig` (`sanity/cli`) | **INTEGRATE** | `sanity.cli.ts` — projectId/dataset for CLI (typegen, import). |
| Document-level i18n | `@sanity/document-internationalization` | **INTEGRATE** | The locked DE/EN pairing mechanism for all 5 types (D-08, CMS-01). |
| Structure builder | `structureTool` + `S.list()/S.document()` (sanity) | **INTEGRATE** | `siteSettings` singleton enforcement (D-07). |
| Image URL builder | `@sanity/image-url` | **INTEGRATE** | `lib/sanity/image.ts` `urlFor()` — image fields shaped now for `project`/About (consumed Phase 4). |
| Dataset import (seed) | `sanity dataset import` (CLI) | **INTEGRATE** | Canonical content authoring as NDJSON (CMS-02, Pattern 6). |
| GROQ dev playground | `@sanity/vision` (`visionTool`) | **INTEGRATE** | Dev-time query testing plugin in Studio (supporting stack). |
| Schema field validation | `defineField({ validation })` (sanity) | **INTEGRATE** | Input-validation layer for authored content (ASVS V5). |
| Perspective (published-only) | `perspective:'published'` (@sanity/client) | **INTEGRATE** | Guarantees no draft leakage in the static build (D-03). |
| **Live content** | `defineLive` (next-sanity) | **OPT-OUT** | D-03 defers live/real-time content this phase; the typed+`stega:false` foundation supports adding it later without rework. |
| **Visual editing overlays** | `VisualEditing` (next-sanity) | **OPT-OUT** | D-03 defers click-to-edit; would require stega ON, which directly conflicts with CMS-03's `stega:false` invariant this phase. |
| **Draft Mode / preview** | `draftMode()` + `perspective:'drafts'` | **OPT-OUT** | D-03 — static published reads only; no draft route surface this phase (minimizes the stega/draft surface CMS-03 guards). |
| **Stega encoding** | `stega:true` client option | **OPT-OUT** | Directly prohibited by CMS-03 — stega tokens corrupt titles/slugs in metadata/static-params paths. Enforced OFF + guarded by invariant. |
| **Write/mutation client** | `client.create/patch/commit` in app code | **OPT-OUT** | App is read-only at build; content mutation happens only via the auth-gated Studio and the one-time local seed import. No write token in the client bundle (ASVS V4/V14). |
| **Webhooks / revalidation tags** | `revalidateTag` + Sanity webhook | **OPT-OUT** | Static published build this phase; on-demand revalidation belongs with live editing (deferred, D-03). No content-mutation-triggered rebuild wired now. |
| **Presentation tool** | `presentationTool` (sanity) | **OPT-OUT** | Presentation/preview is part of the deferred visual-editing surface (D-03). Not added to Studio plugins this phase. |
| **Asset upload API** | `client.assets.upload` | **OPT-OUT** | Image assets for seeded content are referenced via NDJSON asset refs / authored in Studio; no programmatic upload pipeline needed this phase. |

**Subtraction record complete.** Every OPT-OUT traces to D-03 (deferred live/visual editing), CMS-03 (`stega:false` invariant), or the read-only-at-build security posture (ASVS V4/V14). No fabricated rows.
