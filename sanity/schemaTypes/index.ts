/**
 * sanity/schemaTypes/index.ts — Schema types single source of truth.
 *
 * Exports the `schemaTypes` array consumed by sanity.config.ts (schema.types).
 * `price` is an object type referenced by name from `service`, NOT listed as a
 * top-level document type. Wave 2 adds project/testimonial/seoPage/siteSettings.
 *
 * CMS-01. Source: 03-PATTERNS.md index.ts (single-source-of-truth export array).
 */
import { service } from './service'
import { price } from './objects/price'

export const schemaTypes = [service, price]
