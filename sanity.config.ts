/**
 * sanity.config.ts — Embedded Studio configuration (D-01).
 *
 * Single defineConfig default export (mirrors next.config.ts's plugin-wrapping shape).
 * Studio is embedded at /studio inside this Next app, ships to production, gated by
 * Sanity's own auth (D-01/D-02). DE is base/reference language, listed first (D-09).
 * Tracer registers ONLY `service` for document internationalization; Wave 2 expands.
 *
 * D-01: embedded Studio. D-08: document-level i18n (service). D-09: DE base first.
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
  plugins: [
    // D-01: desk/structure tool hosts the embedded Studio content list.
    structureTool({ structure }),
    // D-08/D-09: document-level DE/EN pairs; DE base listed first. Tracer: service only.
    documentInternationalization({
      supportedLanguages: [
        { id: 'de', title: 'Deutsch' },
        { id: 'en', title: 'English' },
      ],
      schemaTypes: ['service'],
    }),
    // Dev-time GROQ playground.
    visionTool(),
  ],
})
