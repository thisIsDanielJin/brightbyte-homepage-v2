/**
 * sanity/schemaTypes/testimonial.ts — Testimonial document type (document-internationalized).
 *
 * A translatable (DE/EN) editorial type. The `language` field is a REQUIRED string
 * field the type must declare (plugin README "Language field") — authored here as
 * readOnly+hidden; the @sanity/document-internationalization plugin writes patches to
 * it but does NOT inject it. Queries filter language == $locale (D-10).
 *
 * D-06: the outcome metric is a SEPARATE, queryable pair — `outcomeValue` (e.g. "+200%")
 *   and `outcomeLabel` (e.g. "Umsatz") — INLINE on the document (PATTERNS: prefer inline
 *   over a shared object unless reused). Phase 4 styles the number as a first-class element.
 *   Covers the 3 anchors: Blumenspiess +200%, Learnstep 92%, Lumo +47% (SEC-05).
 * D-04: plain string/text for short copy — no Portable Text.
 * D-08/D-09: DE-base document-level i18n. CMS-01.
 * Source: 03-PATTERNS.md testimonial.ts section; replicates service.ts conventions.
 */
import { defineType, defineField } from 'sanity'

export const testimonial = defineType({
  name: 'testimonial',
  type: 'document',
  fields: [
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'company',
      title: 'Company',
      type: 'string',
    }),
    // D-06: separate outcome metric, inline — queryable on its own.
    defineField({
      name: 'outcomeValue',
      title: 'Outcome value',
      type: 'string',
      description: 'The headline metric, e.g. "+200%", "92%", "+47%".',
    }),
    defineField({
      name: 'outcomeLabel',
      title: 'Outcome label',
      type: 'string',
      description: 'What the metric measures, e.g. "Umsatz".',
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
