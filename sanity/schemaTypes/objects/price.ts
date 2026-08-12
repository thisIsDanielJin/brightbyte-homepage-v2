/**
 * sanity/schemaTypes/objects/price.ts — Structured price object (D-05).
 *
 * Machine-readable, JSON-LD-ready pricing (Phase 6 consumes this shape).
 * NOT a free-text price string. Confirmed shape (D-05 RESOLVED PRICING, user
 * decision 2026-08-12):
 *   - amount:    nullable number, positive when present (null = price on request)
 *   - currency:  string, initialValue 'EUR'
 *   - label:     display string, e.g. "ab €1.500"
 *   - priceFrom: boolean, initialValue false — the "ab"/from semantics
 *
 * The `priceOnRequest` flag lives on the `service` DOCUMENT, not here (D-05).
 * Two-tier mapping: Landing → amount 1500 / priceFrom true / priceOnRequest false;
 * Full-site → amount null / priceOnRequest true.
 *
 * D-05: structured price fields on service.
 * Source: 03-PATTERNS.md objects/price.ts section; A7 verified in node_modules/sanity.
 */
import { defineType, defineField } from 'sanity'

export const price = defineType({
  name: 'price',
  type: 'object',
  fields: [
    defineField({
      name: 'amount',
      title: 'Amount',
      type: 'number',
      description: 'Optional — leave empty for "price on request". Positive when present.',
      // amount is intentionally optional (nullable): null = full-site "price on request" tier.
      validation: (Rule) => Rule.positive(),
    }),
    defineField({
      name: 'currency',
      title: 'Currency',
      type: 'string',
      initialValue: 'EUR',
    }),
    defineField({
      name: 'label',
      title: 'Display label',
      type: 'string',
      description: 'Rendered price text, e.g. "ab €1.500" or "Preis nach Erstgespräch".',
    }),
    defineField({
      name: 'priceFrom',
      title: 'From price ("ab")',
      type: 'boolean',
      description: 'True renders the "ab"/from prefix on the anchor price.',
      initialValue: false,
    }),
  ],
})
