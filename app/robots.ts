/**
 * app/robots.ts — greenfield robots.txt (SEO-03).
 *
 * Allows all crawlers on all paths and points to the absolute sitemap URL. Base
 * URL uses the same env var as lib/i18n/metadata.ts + app/sitemap.ts so all three
 * stay in sync. Next.js serializes MetadataRoute.Robots to /robots.txt with a
 * `Sitemap:` directive.
 *
 * Source: node_modules/next/dist/docs .../file-conventions/metadata/robots.md.
 */
import type { MetadataRoute } from 'next'

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? 'https://brightbyte.berlin'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
