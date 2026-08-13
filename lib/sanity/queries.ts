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
 * Tracer scope: SERVICES_QUERY / getServices only. Wave 2 completes the set:
 * project(+bySlug), testimonial, seoPage(+bySlug), siteSettings — every query filters
 * language == $locale (D-10). Slug lookups add a `$slug` param (D-11 per-locale slugs).
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

export const PROJECTS_QUERY = defineQuery(
  `*[_type == "project" && language == $locale] | order(order asc){
     _id, title, slug, summary, outcomeNote, image, order
   }`,
)

export function getProjects(locale: string) {
  return client.fetch(PROJECTS_QUERY, { locale })
}

export const PROJECT_BY_SLUG_QUERY = defineQuery(
  `*[_type == "project" && language == $locale && slug.current == $slug][0]{
     _id, title, slug, summary, outcomeNote, image, order
   }`,
)

export function getProjectBySlug(locale: string, slug: string) {
  return client.fetch(PROJECT_BY_SLUG_QUERY, { locale, slug })
}

export const TESTIMONIALS_QUERY = defineQuery(
  `*[_type == "testimonial" && language == $locale] | order(order asc){
     _id, quote, author, company, outcomeValue, outcomeLabel
   }`,
)

export function getTestimonials(locale: string) {
  return client.fetch(TESTIMONIALS_QUERY, { locale })
}

export const SEO_PAGES_QUERY = defineQuery(
  `*[_type == "seoPage" && language == $locale]{
     _id, title, slug, heading, body, metaDescription
   }`,
)

export function getSeoPages(locale: string) {
  return client.fetch(SEO_PAGES_QUERY, { locale })
}

export const SEO_PAGE_BY_SLUG_QUERY = defineQuery(
  `*[_type == "seoPage" && language == $locale && slug.current == $slug][0]{
     _id, title, slug, heading, body, metaDescription
   }`,
)

export function getSeoPageBySlug(locale: string, slug: string) {
  return client.fetch(SEO_PAGE_BY_SLUG_QUERY, { locale, slug })
}

export const SITE_SETTINGS_QUERY = defineQuery(
  `*[_type == "siteSettings" && language == $locale][0]{
     _id, siteTitle, navLabels, footerText, heroHeadline, heroSubline,
     contactEmail, address, steuernummer, vatNote, defaultSeo,
     aboutPhoto
   }`,
)

export function getSiteSettings(locale: string) {
  return client.fetch(SITE_SETTINGS_QUERY, { locale })
}
