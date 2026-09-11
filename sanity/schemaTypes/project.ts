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
    // Phase 7 case study enrichment fields — all optional, additive, non-breaking.
    defineField({
      name: 'problem',
      title: 'Problem / Challenge',
      type: 'text',
      rows: 6,
      description: 'What the client faced before BrightByte. 1–3 paragraphs.',
    }),
    defineField({
      name: 'solution',
      title: 'Solution / What was built',
      type: 'text',
      rows: 8,
      description: 'What BrightByte built and how. 1–3 paragraphs.',
    }),
    defineField({
      name: 'outcomeText',
      title: 'Outcome text',
      type: 'text',
      rows: 4,
      description: 'Measured result narrative. Ties to the testimonial metric.',
    }),
    defineField({
      name: 'outcomeValue',
      title: 'Outcome metric value',
      type: 'string',
      description: 'E.g. "+200%", "92%", "+47%". Displayed as large callout.',
    }),
    defineField({
      name: 'outcomeLabel',
      title: 'Outcome metric label',
      type: 'string',
      description: 'E.g. "mehr Kundenanfragen", "Kundenzufriedenheit".',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero image',
      type: 'image',
      options: { hotspot: true },
      description: 'Project screenshot for the case study hero band. Optional.',
    }),
    defineField({
      name: 'clientCategory',
      title: 'Client category',
      type: 'string',
      description: 'E.g. "Floristik", "EdTech", "Wellness". Used as hero badge.',
    }),
    defineField({
      name: 'hasCaseStudy',
      title: 'Has case study page',
      type: 'boolean',
      initialValue: false,
      description: 'Enable to make the work grid card a link to the case study page.',
    }),
  ],
})
