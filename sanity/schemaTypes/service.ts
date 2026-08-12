/**
 * sanity/schemaTypes/service.ts — Service document type (document-internationalized).
 *
 * A translatable (DE/EN) editorial type. The `language` field is INJECTED by the
 * @sanity/document-internationalization plugin (A3 verified: languageField defaults
 * to 'language') — do NOT hand-author it here. Queries filter language == $locale (D-10).
 *
 * Pricing is structured (D-05): a `price` object (see objects/price.ts) plus a
 * `priceOnRequest` boolean ON THIS DOCUMENT. Short copy stays plain string/text (D-04);
 * no Portable Text.
 *
 * D-04: plain strings for short copy. D-05: structured price + priceOnRequest on doc.
 * D-08/D-09: DE-base document-level i18n. CMS-01.
 * Source: 03-PATTERNS.md service.ts section; A7 verified in node_modules/sanity.
 */
import { defineType, defineField } from 'sanity'

export const service = defineType({
  name: 'service',
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
      options: { source: 'title' },
    }),
    defineField({
      name: 'blurb',
      title: 'Blurb',
      type: 'text',
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'price', // structured price object (D-05)
    }),
    defineField({
      name: 'priceOnRequest',
      title: 'Price on request',
      type: 'boolean',
      description: 'True for the consultative full-site tier (no published number).',
      initialValue: false,
    }),
    defineField({
      name: 'includes',
      title: 'Includes',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Sort order for | order(order asc).',
    }),
  ],
})
