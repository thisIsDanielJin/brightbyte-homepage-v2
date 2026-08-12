/**
 * sanity/structure.ts — Studio desk structure with the siteSettings singleton (D-07).
 *
 * siteSettings is pinned to the fixed DE base document id `siteSettings` as a single
 * list item (no "create new" via the generic list), and filtered OUT of the generic
 * documentTypeListItems so it appears exactly once. The i18n plugin manages the EN
 * translation off that base doc (D-08); queries still resolve via language == $locale
 * (D-10), never the fixed id. Create/delete lockdown lives in sanity.config.ts
 * (document.actions resolver) — this file handles the list placement.
 *
 * D-07 singleton (structure-builder-enforced). A5 verified: structureTool from
 * sanity/structure; StructureBuilder typed via the callback param.
 * Source: 03-PATTERNS.md structure.ts section.
 */
import type { StructureResolver } from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // D-07: the singleton, pinned to the fixed DE base id.
      S.listItem()
        .title('Site Settings')
        .id('siteSettings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
      S.divider(),
      // Everything else, minus siteSettings (it lives above as the singleton).
      ...S.documentTypeListItems().filter(
        (listItem) => listItem.getId() !== 'siteSettings',
      ),
    ])
