/**
 * app/sitemap.ts — Localized sitemap with bidirectional hreflang alternates.
 *
 * Structured as a ROUTES → alternates MAPPER per D-08:
 *   - Phase 2: ROUTES = ['/'] (locale roots only)
 *   - Phase 6: append '/s/[slug]' entries to ROUTES — no rewrite of emitter needed
 *
 * Each route emits two entries (/de + /en), both carrying alternates.languages
 * with de and en URLs matching the page <head> hreflang (I18N-02 consistency).
 *
 * Base URL uses the same env var as lib/i18n/metadata.ts — both sides stay in sync.
 * The proxy.ts matcher already excludes sitemap.xml so it is served un-prefixed.
 *
 * T-2-05: Sitemap intentionally exposes only public locale roots (accepted).
 *
 * Source: RESEARCH §Pattern 8 (localized sitemap)
 *         node_modules/next/dist/docs/.../sitemap.md (alternates.languages)
 */
import type { MetadataRoute } from 'next'

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? 'https://brightbyte.berlin'

// Phase 2: locale roots only.
// Phase 6 extends this array with '/s/[slug]' entries — no changes to the emitter below.
const ROUTES = ['/']

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.flatMap((route) => {
    const suffix = route === '/' ? '' : route
    const deUrl = `${BASE_URL}/de${suffix}`
    const enUrl = `${BASE_URL}/en${suffix}`

    return [
      {
        url: deUrl,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 1,
        alternates: {
          languages: {
            de: deUrl,
            en: enUrl,
            'x-default': deUrl,  // D-05: x-default → /de
          },
        },
      },
      {
        url: enUrl,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.9,
        alternates: {
          languages: {
            de: deUrl,
            en: enUrl,
            'x-default': deUrl,  // D-05: x-default → /de
          },
        },
      },
    ]
  })
}
