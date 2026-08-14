/**
 * sanity/env.ts — Single source for Sanity project config.
 *
 * Reads the public Sanity project coordinates from NEXT_PUBLIC_* env vars.
 * projectId/dataset are PUBLIC, non-secret values (safe to expose in the client
 * bundle) — the NEXT_PUBLIC_ prefix is intentional (D-14 env surface, ASVS V14).
 * The read token (readToken) is SERVER-ONLY (no NEXT_PUBLIC_ prefix) and guarded
 * against browser access. NO write/deploy token lives here or anywhere.
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

/**
 * SERVER-ONLY read token (Viewer role). Required because the Sanity free tier
 * cannot make the `production` dataset publicly readable — anonymous reads
 * return only legacy demo docs, not the editorial content (see phase-04
 * anon-read-gap). This supersedes D-03's original tokenless-public assumption.
 *
 * NO `NEXT_PUBLIC_` prefix ⇒ Next.js never inlines it into the client bundle.
 * LAZY on purpose: importing this module for projectId/dataset (Studio bundle,
 * sanity.cli.ts, client components) must NOT evaluate the token. Only the
 * server read client calls getReadToken() at client-construction time. The
 * `typeof window` guard is defense-in-depth: if a client component ever calls
 * it, it throws in the browser instead of leaking/shipping undefined.
 */
export function getReadToken(): string {
  if (typeof window !== 'undefined') {
    throw new Error(
      'SANITY_API_READ_TOKEN accessed in the browser — the read client is server-only. ' +
        'Do not import lib/sanity/client.ts into a client component.',
    )
  }
  return assertValue(
    process.env.SANITY_API_READ_TOKEN,
    'Missing env: SANITY_API_READ_TOKEN (server-only Viewer token)',
  )
}

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage)
  }
  return v
}
