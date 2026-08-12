/**
 * sanity/schemaTypes/seoPage.ts — SEO page document type (document-internationalized).
 *
 * A translatable (DE/EN) editorial type. The `language` field is a REQUIRED string
 * field the type must declare (plugin README "Language field") — authored here as
 * readOnly+hidden; the @sanity/document-internationalization plugin writes patches to
 * it but does NOT inject it. Queries filter language == $locale (D-10).
 *
 * Shaped now so Phase 6's ~30 programmatic /s/[slug] pages + JSON-LD plug in without
 * a schema rewrite.
 * D-11: per-locale, NON-shared slug — each locale doc owns its own slug. Phase 6 consumes.
 * D-04: `body` is Portable Text — a GENUINE long-form need (the one place PT is warranted
 *   here). Short fields (title/heading/metaDescription) stay plain string/text.
 * D-08/D-09: DE-base document-level i18n. CMS-01.
 * Source: 03-PATTERNS.md seoPage.ts section; RESEARCH D-04 Portable Text guidance.
 */
import { defineType, defineField } from 'sanity'

export const seoPage = defineType({
  name: 'seoPage',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      // D-11: per-locale, non-shared — sourced from THIS locale doc's title.
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      // D-04: genuine long-form — Portable Text is warranted here.
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta description',
      type: 'text',
    }),
    // Required by @sanity/document-internationalization (plugin writes patches here).
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
    }),
  ],
})
