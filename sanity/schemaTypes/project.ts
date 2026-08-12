/**
 * sanity/schemaTypes/project.ts — Project document type (document-internationalized).
 *
 * A translatable (DE/EN) editorial type. The `language` field is a REQUIRED string
 * field the type must declare (plugin README "Language field") — authored here as
 * readOnly+hidden; the @sanity/document-internationalization plugin writes patches to
 * it but does NOT inject it. Queries filter language == $locale (D-10).
 *
 * D-11: per-locale, NON-shared slug — each locale doc owns its own slug
 *   (/de/projekt/... vs /en/work/...); source is the doc's own title. Phase 6's
 *   /s/[slug] consumes these.
 * SEC-04: `outcomeNote` is the concrete outcome sentence surfaced in Phase 4.
 * `image` has hotspot:true so @sanity/image-url (lib/sanity/image.ts) can crop it.
 * D-04: plain string/text for short copy — no Portable Text here.
 * D-08/D-09: DE-base document-level i18n. CMS-01.
 * Source: 03-PATTERNS.md project.ts section; replicates service.ts conventions.
 */
import { defineType, defineField } from 'sanity'

export const project = defineType({
  name: 'project',
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
      name: 'summary',
      title: 'Summary',
      type: 'text',
    }),
    defineField({
      name: 'outcomeNote',
      title: 'Outcome note',
      type: 'string',
      description: 'The SEC-04 concrete outcome sentence for this project.',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      // hotspot enables crop-aware srcset via @sanity/image-url (lib/sanity/image.ts).
      options: { hotspot: true },
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Sort order for | order(order asc).',
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
