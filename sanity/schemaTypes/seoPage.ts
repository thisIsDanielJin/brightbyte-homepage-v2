/**
 * sanity/schemaTypes/seoPage.ts — SEO page document type (document-internationalized).
 *
 * A translatable (DE/EN) editorial type. The `language` field is a REQUIRED string
 * field the type must declare (plugin README "Language field") — authored here as
 * readOnly+hidden; the @sanity/document-internationalization plugin writes patches to
 * it but does NOT inject it. Queries filter language == $locale (D-10).
 *
 * Phase 6 D-01 enrichment: the thin schema (title/slug/heading/body/metaDescription)
 * is extended to carry v1's full structured field set so Phase 6's programmatic
 * /s/[slug] pages + JSON-LD plug in without a schema rewrite:
 *   - category      (service | industry | need | location) — required
 *   - heroHeadline   (string)  — the page H1 (replaces the old `heading` role)
 *   - heroSubtext    (text)    — hero body prose
 *   - ctaText        (string)  — per-page CTA label
 *   - faqs[]         { question: string, answer: text } — STRUCTURED so the JSON-LD
 *       FAQPage emitter (D-05) can map each to a Question/acceptedAnswer.text.
 *       answer is `type: 'text'` (plain string), NOT Portable Text (Pitfall 3) —
 *       a PT block array would serialize to `[{_type:'block'}]`, breaking
 *       acceptedAnswer.text validation in Google's Rich Results Test.
 *   - benefits[]     { text: string }
 *   - trustMetrics[] { value: string, label: string } — OPTIONAL (sparse in v1)
 * The `heading` field is REMOVED — its role is now `heroHeadline`. Safe because the
 * dataset has 0 seoPage documents (verified via `sanity documents query` before edit;
 * RESEARCH A5). `body` (Portable Text) is KEPT — the one genuine long-form need (D-04).
 *
 * D-11: per-locale, NON-shared slug — each locale doc owns its own slug. Phase 6 consumes.
 * D-08/D-09: DE-base document-level i18n. CMS-01.
 * Source: 06-RESEARCH.md § Pattern 8 (schema enrichment defineField shapes), Pitfall 3.
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
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Service', value: 'service' },
          { title: 'Industry', value: 'industry' },
          { title: 'Need', value: 'need' },
          { title: 'Location', value: 'location' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heroHeadline',
      title: 'Hero headline',
      type: 'string',
    }),
    defineField({
      name: 'heroSubtext',
      title: 'Hero subtext',
      type: 'text',
      rows: 6,
    }),
    defineField({
      name: 'ctaText',
      title: 'CTA text',
      type: 'string',
    }),
    defineField({
      name: 'faqs',
      title: 'FAQs',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'question',
              title: 'Question',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            // Pitfall 3: plain text, NOT Portable Text — JSON-LD acceptedAnswer.text
            // must be a string for the FAQPage rich result to validate.
            defineField({
              name: 'answer',
              title: 'Answer',
              type: 'text',
              rows: 3,
              validation: (Rule) => Rule.required(),
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'benefits',
      title: 'Benefits',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'text',
              title: 'Text',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'trustMetrics',
      title: 'Trust metrics',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'value', title: 'Value', type: 'string' }),
            defineField({ name: 'label', title: 'Label', type: 'string' }),
          ],
        },
      ],
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
