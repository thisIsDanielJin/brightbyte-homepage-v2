/**
 * sanity.config.ts — Embedded Studio configuration (D-01).
 *
 * Single defineConfig default export (mirrors next.config.ts's plugin-wrapping shape).
 * Studio is embedded at /studio inside this Next app, ships to production, gated by
 * Sanity's own auth (D-01/D-02). DE is base/reference language, listed first (D-09).
 * Wave 2 registers all five types for document internationalization (D-08) and locks
 * the siteSettings singleton via a document.actions resolver (D-07 / T-03-05).
 *
 * D-01: embedded Studio. D-08: document-level i18n (all five types). D-09: DE base first.
 * D-07: disable create/delete document actions for siteSettings (singleton lockdown).
 * Source: 03-PATTERNS.md sanity.config.ts; A3 (languageField 'language') verified.
 */
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { documentInternationalization } from '@sanity/document-internationalization'
import { projectId, dataset } from '@/sanity/env'
import { schemaTypes } from '@/sanity/schemaTypes'
import { structure } from '@/sanity/structure'

export default defineConfig({
  name: 'default',
  title: 'BrightByte Berlin',
  projectId,
  dataset,
  schema: {
    types: schemaTypes,
  },
  // D-07 / T-03-05: prevent the siteSettings singleton from being duplicated or
  // deleted — strip create/delete/duplicate from its document action list.
  document: {
    actions: (prev, { schemaType }) =>
      schemaType === 'siteSettings'
        ? prev.filter(
            (action) =>
              !['duplicate', 'delete', 'unpublish'].includes(action.action ?? ''),
          )
        : prev,
  },
  plugins: [
    // D-01: desk/structure tool hosts the embedded Studio content list + singleton.
    structureTool({ structure }),
    // D-08/D-09: document-level DE/EN pairs; DE base listed first. All five types.
    documentInternationalization({
      supportedLanguages: [
        { id: 'de', title: 'Deutsch' },
        { id: 'en', title: 'English' },
      ],
      schemaTypes: ['service', 'project', 'testimonial', 'seoPage', 'siteSettings'],
    }),
    // Dev-time GROQ playground.
    visionTool(),
  ],
})
