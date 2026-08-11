/**
 * lib/i18n/metadata.ts — Shared hreflang alternates helper.
 *
 * buildHreflangAlternates(path) returns Metadata['alternates'] with:
 *   - canonical: /de{path}   (DE is the canonical/x-default locale, D-05)
 *   - languages.de: /de{path}
 *   - languages.en: /en{path}
 *   - languages['x-default']: /de{path}  (x-default → /de per D-05)
 *
 * 'x-default' is a first-class UnmatchedLang type in Next.js 16 — no cast needed.
 * (RESEARCH Pitfall 6, VERIFIED: node_modules/next/dist/lib/metadata/types/alternative-urls-types.d.ts:2)
 *
 * Base URL sourced from NEXT_PUBLIC_BASE_URL env var with production default.
 * Path is normalized to always start with '/'.
 *
 * D-07: ONE shared helper reused by every page. Phase 6's ~30 programmatic pages
 * call buildHreflangAlternates('/s/' + slug) — no per-page hreflang logic.
 *
 * T-2-04: Path arg is normalized to a leading slash only; only in-app literal
 * routes are passed in Phase 2 ('/'). Base URL from trusted env var.
 */
import type { Metadata } from 'next'

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? 'https://brightbyte.berlin'

export function buildHreflangAlternates(path: string): Metadata['alternates'] {
  const canonicalPath = path.startsWith('/') ? path : `/${path}`
  const deUrl = `${BASE_URL}/de${canonicalPath === '/' ? '' : canonicalPath}`
  const enUrl = `${BASE_URL}/en${canonicalPath === '/' ? '' : canonicalPath}`

  return {
    canonical: deUrl,
    languages: {
      de: deUrl,
      en: enUrl,
      'x-default': deUrl, // D-05: x-default → /de (German-first)
    },
  }
}
