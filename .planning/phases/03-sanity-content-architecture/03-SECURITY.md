---
phase: 3
slug: sanity-content-architecture
status: verified
# threats_open = count of OPEN threats at or above workflow.security_block_on severity (the blocking gate)
threats_open: 0
asvs_level: 1
created: 2026-08-12
---

# Phase 3 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Browser ↔ Sanity Content Lake | Client/build-time GROQ reads of published documents via the single read client | Public marketing content (published only); NO credentials |
| Build/server env ↔ repo | Env surface for Sanity coordinates | `NEXT_PUBLIC_*` projectId/dataset/apiVersion only (public); any write/import token stays in gitignored local env, never committed |
| Authenticated editor ↔ `/studio` | Sanity-managed auth gates the embedded Studio editor | Content mutations — authorization is Sanity's own, not custom code |
| Sanity as single source of truth | All editorial content lives in one store | Content integrity — no parallel content store permitted |

---

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-03-01 | Information Disclosure | Content Lake read path | medium | mitigate | Single client sets `perspective:'published'` — no draft leak (`lib/sanity/client.ts:25`) | closed |
| T-03-02 | Tampering | `generateMetadata`/`generateStaticParams` output | high | mitigate | `stega:false` on the single client (`lib/sanity/client.ts:26`) + build-output guard | closed |
| T-03-03 | Information Disclosure / Elevation | Sanity credentials | high | mitigate | Read client tokenless; `NEXT_PUBLIC_*` public coords only (`sanity/env.ts`); `.env.local` gitignored; no token-shaped secret in shippable src | closed |
| T-03-04 | Elevation of Privilege | `/studio` content-mutation surface | medium | mitigate | Studio gated by Sanity's own auth (D-02); no server mutation route handler under `app/studio/`; layout sets robots noindex | closed |
| T-03-05 | Tampering | siteSettings global config | medium | mitigate | Structure-builder fixed-id + `document.actions` strips duplicate/delete/unpublish (`sanity.config.ts:33`) | closed |
| T-03-06 | Tampering / DoS | Rendered content (Phase 4) | low | mitigate | `validation` rules on required fields/slug/positive price across all 6 schema files (ASVS V5) | closed |
| T-03-07 | Information Disclosure | siteSettings/seoPage read path | medium | mitigate | All queries flow through the single `perspective:'published'` client; no second `createClient` | closed |
| T-03-08 | Tampering | SEO titles/slugs | high | mitigate | `no-stega-in-build.sh` build-output guard + `sanity-single-client.sh` config guard, both wired into `test:invariants` and green | closed |
| T-03-09 | Information Disclosure | Sanity write credentials | high | mitigate | Seed via `sanity dataset import` with local CLI auth; NDJSON content-only; no token in any committed file | closed |
| T-03-10 | Tampering / Repudiation | Content single-source integrity | medium | mitigate | Phase-gate confirms no `data/content.ts`, no `dictionaries/`, no inline editorial `.tsx` | closed |

*Status: open · closed · open — below high threshold (non-blocking)*
*Severity: critical > high > medium > low — only open threats at or above workflow.security_block_on (high) count toward threats_open*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|

No accepted risks.

> **Non-threat operational note (not a security risk):** anonymous/tokenless API reads of `ddrca30s/production` currently return `[]` pending a Sanity dashboard public-read toggle (tracker item D4). This is an availability/config item for Phase 4, not an open threat — the *secure* posture (no token in the client bundle) is intact either way; the resolution must NOT introduce a client-imported read token.

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-08-12 | 10 | 10 | 0 | /gsd-secure-phase (L1, short-circuit — register authored at plan time, asvs_level 1) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-08-12
