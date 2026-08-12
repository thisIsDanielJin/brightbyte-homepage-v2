/**
 * lib/sanity/queries.ts — Centralized typed GROQ query layer. THE Phase 4 import contract.
 *
 * D-10: every query selects a locale via a `$locale` param filtering the plugin's
 *   `language` field (`language == $locale`); each `get*(locale)` passes `{ locale }`.
 *   Phase 4 feeds the URL-derived locale (Phase 2 routing) into these. This shape is
 *   a costly-to-change contract — Phase 4 imports it directly.
 * CMS-03: every query is wrapped in `defineQuery` so `sanity typegen` infers result
 *   types (sanity.types.ts). No bare un-`defineQuery`'d `client.fetch('...')` strings.
 *   `stega: false` lives on the client (lib/sanity/client.ts) — never add it here.
 *
 * Tracer scope: SERVICES_QUERY / getServices only. Remaining types (testimonial,
 * project, siteSettings, seoPage) expand in Waves 2–3 after this slice is verified.
 *
 * Source: 03-PATTERNS.md lib/sanity/queries.ts; RESEARCH.md Pattern 5. A3 verified:
 * the document-internationalization plugin's language field is named 'language'.
 */
import { defineQuery } from 'next-sanity'
import { client } from './client'

export const SERVICES_QUERY = defineQuery(
  `*[_type == "service" && language == $locale] | order(order asc){
     _id, title, slug, blurb,
     price{ amount, currency, label, priceFrom },
     priceOnRequest, includes
   }`,
)

export function getServices(locale: string) {
  return client.fetch(SERVICES_QUERY, { locale })
}
