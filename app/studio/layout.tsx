/**
 * app/studio/layout.tsx — Server layout for the embedded Sanity Studio (D-01, D-02).
 *
 * Next 16 disallows exporting `metadata`/`viewport` from a "use client" module, so
 * the Studio's SEO/robots metadata + viewport live here (a Server Component) while
 * the client <NextStudio> host stays in page.tsx. metadata/viewport are re-exported
 * from next-sanity/studio (A1 verified) — they set robots noindex on the Studio route.
 *
 * `dynamic = 'force-static'` also lives here so it is resolved on the server.
 *
 * D-01: embedded /studio. D-02: Sanity-managed auth (no custom auth, no server
 * mutation endpoint added). Source: 03-PATTERNS.md; Next 16 client/server split rule.
 */
export const dynamic = 'force-static'

export { metadata, viewport } from 'next-sanity/studio'

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
