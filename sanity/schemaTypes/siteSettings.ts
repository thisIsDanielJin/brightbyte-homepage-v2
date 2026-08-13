/**
 * sanity/schemaTypes/siteSettings.ts — Global site config SINGLETON (D-07, document-internationalized).
 *
 * A translatable (DE/EN) singleton: nav/footer/legal copy is locale-specific (D-08), so
 * there are TWO docs (DE base id `siteSettings` + plugin-managed EN translation). The
 * `language` field is a REQUIRED string field the type must declare (plugin README
 * "Language field") — authored here as readOnly+hidden; the plugin writes patches to it.
 * QUERY via `language == $locale` (D-10), NOT via the fixed id.
 *
 * D-07 singleton enforcement lives in sanity/structure.ts (fixed documentId) +
 *   sanity.config.ts (disabled create/delete document actions) — not in this schema.
 * Impressum/legal fields shaped now for Phase 4 SEC-09 (RESEARCH Q3). Canonical values
 *   from ~/Documents/claude-contexts/freelancer.md.
 * D-04: plain string/text for short copy — no Portable Text.
 * CMS-01. Source: 03-PATTERNS.md siteSettings.ts section.
 */
import { defineType, defineField } from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'siteTitle',
      title: 'Site title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'navLabels',
      title: 'Nav labels',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Ordered navigation link labels for this locale.',
    }),
    defineField({
      name: 'footerText',
      title: 'Footer text',
      type: 'text',
    }),
    // D-07: Hero headline/subline for Phase 4 HeroSection (added in 04-01).
    // Plain string/text — no Portable Text (Phase 3 D-04 convention).
    defineField({
      name: 'heroHeadline',
      title: 'Hero headline',
      type: 'string',
      validation: (Rule) => Rule.required().max(80),
      description: 'Main positioning headline in the hero section. Max 80 chars.',
    }),
    defineField({
      name: 'heroSubline',
      title: 'Hero subline',
      type: 'text',
      rows: 2,
      validation: (Rule) => Rule.max(200),
      description: 'Supporting subline below the hero headline. Max 200 chars.',
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact email',
      type: 'string',
      initialValue: 'hello@brightbyte-berlin.com',
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'text',
      initialValue: 'Karl-Marx-Allee 118, 10243 Berlin',
    }),
    defineField({
      name: 'steuernummer',
      title: 'Steuernummer',
      type: 'string',
      initialValue: '14/596/01847',
    }),
    defineField({
      name: 'vatNote',
      title: 'VAT note',
      type: 'string',
      description: 'Kleinunternehmerregelung note.',
      initialValue: 'Gemäß §19 UStG wird keine Umsatzsteuer berechnet',
    }),
    defineField({
      name: 'defaultSeo',
      title: 'Default SEO',
      type: 'object',
      fields: [
        defineField({ name: 'metaTitle', title: 'Meta title', type: 'string' }),
        defineField({ name: 'metaDescription', title: 'Meta description', type: 'text' }),
      ],
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
