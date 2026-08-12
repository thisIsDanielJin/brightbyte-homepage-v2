/**
 * lib/sanity/image.ts — Responsive image URL builder (@sanity/image-url).
 *
 * Builds crop/hotspot-aware srcset URLs from Sanity image assets (e.g. project.image,
 * the About photo). Consumed in Phase 4 via next/image. Single named export `urlFor`.
 *
 * Reuses the ONE read client (lib/sanity/client.ts) — NO second createClient (that is
 * the CMS-03 single-client invariant Plan 01 established and this file must not break).
 *
 * Source: 03-PATTERNS.md lib/sanity/image.ts section; RESEARCH "Don't Hand-Roll: image URLs".
 * Verified: `SanityImageSource` and default `imageUrlBuilder` export in @sanity/image-url.
 */
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url'
import { client } from './client'

const builder = imageUrlBuilder(client)

export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}
