/**
 * app/sitemap.ts — Localized sitemap with bidirectional hreflang alternates.
 *
 * Structured as a ROUTES → alternates MAPPER per D-08:
 *   - Phase 2: ROUTES = ['/'] (locale roots only)
 *   - Phase 6: a SEPARATE SEO block appends /s/[slug] entries whose DE/EN slugs
 *     DIFFER (D-04). The identical-path ROUTES emitter is NOT reused for SEO
 *     pages (Pitfall 4) — it assumes the same suffix in both locales.
 *
 * Each entry carries alternates.languages with de/en/x-default URLs matching the
 * page <head> hreflang (I18N-02 consistency). Next.js serializes these as
 * <xhtml:link rel="alternate" .../> inside each <url>.
 *
 * SEO slug pairs are fetched via SEO_SLUG_PAIRS_QUERY through the single
 * stega:false client (imported transitively from @/lib/sanity/queries) — this
 * file imports ONLY from @/lib/sanity/queries, never next/headers (Pitfall 8),
 * so the sitemap stays statically generable.
 *
 * Base URL uses the same env var as lib/i18n/metadata.ts — both sides stay in sync.
 * The proxy.ts matcher already excludes sitemap.xml so it is served un-prefixed.
 *
 * Source: RESEARCH §Pattern 8 (localized sitemap)
 *         node_modules/next/dist/docs/.../sitemap.md (alternates.languages)
 */
import type { MetadataRoute } from 'next'
import { getSeoSlugPairs } from '@/lib/sanity/queries'

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? 'https://brightbyte.berlin'

// Phase 2: locale roots only. SEO /s/[slug] entries are emitted by a SEPARATE
// block below (differing DE/EN slugs) — do NOT add them here (Pitfall 4).
const ROUTES = ['/']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── Identical-path routes (locale roots, sections, legal) ────────────────
  const routeEntries: MetadataRoute.Sitemap = ROUTES.flatMap((route) => {
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

  // ── SEO pages (differing per-locale slugs, D-04) ─────────────────────────
  const pairs = await getSeoSlugPairs()
  const seoEntries: MetadataRoute.Sitemap = pairs.flatMap((pair) => {
    const deSlug = pair.deSlug
    if (!deSlug) return []
    // Fall back to the DE slug when no EN counterpart exists.
    const enSlug = pair.enSlug ?? deSlug
    const deUrl = `${BASE_URL}/de/s/${deSlug}`
    const enUrl = `${BASE_URL}/en/s/${enSlug}`
    const languages = {
      de: deUrl,
      en: enUrl,
      'x-default': deUrl, // D-05: x-default → /de
    }

    return [
      {
        url: deUrl,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
        alternates: { languages },
      },
      {
        url: enUrl,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
        alternates: { languages },
      },
    ]
  })

  return [...routeEntries, ...seoEntries]
}
