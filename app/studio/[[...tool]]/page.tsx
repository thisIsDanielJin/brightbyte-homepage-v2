/**
 * app/studio/[[...tool]]/page.tsx — Embedded Sanity Studio (D-01, D-02).
 *
 * Optional catch-all [[...tool]] matches /studio AND all Studio sub-paths
 * (/studio/structure/..., /studio/vision) — Next 16 VERIFIED
 * (node_modules/.../dynamic-routes.md). params is a Promise in Next 16 but the
 * Studio page ignores it, so the async-params pitfall does not apply here.
 *
 * Client component rendering <NextStudio config={config} />. metadata/viewport
 * re-exported from next-sanity/studio (A1 verified: those exports exist) — sets
 * robots noindex on the Studio route. Studio is auth-gated by Sanity itself (D-02);
 * no custom auth, no server mutation endpoint added here.
 *
 * D-01: embedded /studio. D-02: Sanity-managed auth. Source: 03-PATTERNS.md.
 */
'use client'

import { NextStudio } from 'next-sanity/studio'
import config from '../../../sanity.config'

export const dynamic = 'force-static'

export { metadata, viewport } from 'next-sanity/studio'

export default function StudioPage() {
  return <NextStudio config={config} />
}
