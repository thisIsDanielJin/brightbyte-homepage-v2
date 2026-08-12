/**
 * sanity/env.ts — Single source for Sanity project config.
 *
 * Reads the public Sanity project coordinates from NEXT_PUBLIC_* env vars.
 * projectId/dataset are PUBLIC, non-secret values (safe to expose in the client
 * bundle) — the NEXT_PUBLIC_ prefix is intentional (D-14 env surface, ASVS V14).
 * NO write/deploy/API token lives here or in any client-imported module.
 *
 * apiVersion is a pinned ISO date (never 'v1'/'latest') so Content Lake API
 * changes never break silently (Sanity api-versioning guidance).
 *
 * D-01/D-03/CMS-03: consumed by the single lib/sanity/client.ts read client.
 * Source: env-reader pattern from lib/i18n/metadata.ts (process.env ?? fallback),
 * 03-PATTERNS.md sanity/env.ts section.
 */

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  'Missing env: NEXT_PUBLIC_SANITY_PROJECT_ID',
)

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  'Missing env: NEXT_PUBLIC_SANITY_DATASET',
)

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2025-08-01'

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage)
  }
  return v
}
