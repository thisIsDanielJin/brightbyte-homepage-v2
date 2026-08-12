/**
 * sanity/structure.ts — Studio desk structure (D-07 singleton reserved for Wave 2).
 *
 * Tracer scope: a plain document-type list. The siteSettings singleton enforcement
 * (fixed-id + disabled create/delete) is added in Wave 2 when siteSettings lands.
 *
 * D-07 (singleton — Wave 2). Source: 03-PATTERNS.md structure.ts; A5 verified
 * (structureTool from sanity/structure). StructureBuilder typed via the callback param.
 */
import type { StructureResolver } from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([...S.documentTypeListItems()])
