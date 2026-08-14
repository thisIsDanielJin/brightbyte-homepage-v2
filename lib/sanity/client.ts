/**
 * lib/sanity/client.ts — The ONE Sanity read client. Never create a second.
 *
 * This single `createClient` instance is the CMS-03 structural guarantee: every
 * GROQ read in the app flows through it, so the `stega: false` invariant cannot
 * be bypassed by a stray second client. A duplicate client is the exact failure
 * tests/invariants/sanity-single-client.sh (Plan 03) guards against.
 *
 * D-03 (revised): static published content only — `perspective: 'published'`
 *   (no draft leak), no defineLive/VisualEditing/Draft Mode this phase. The
 *   original tokenless-public-dataset plan is NOT possible on the Sanity free
 *   tier (dataset cannot be made public), so reads use a SERVER-ONLY Viewer
 *   token (`readToken`). The token has no NEXT_PUBLIC_ prefix and is browser-
 *   guarded in sanity/env.ts — it never reaches the client bundle. This keeps
 *   the single-client / stega:false guarantees intact.
 * CMS-03: `stega: false` is a HARD INVARIANT — stega tokens corrupt titles/slugs
 *   on generateMetadata/generateStaticParams paths. Never set it true here.
 *
 * Source: 03-PATTERNS.md lib/sanity/client.ts; RESEARCH.md Pattern 2.
 * A2 verified: `perspective: 'published'` is a valid string in @sanity/client v7.
 */
import { createClient } from 'next-sanity'
import { projectId, dataset, apiVersion, getReadToken } from '@/sanity/env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion, // pinned ISO date from env — NOT 'v1'/'latest'
  useCdn: false, // build-time reads want origin, not the CDN edge cache
  perspective: 'published', // published docs only — no draft leakage (D-03)
  stega: false, // HARD INVARIANT: no stega tokens in titles/slugs (CMS-03)
  token: getReadToken(), // server-only Viewer token — free tier has no public dataset
})
