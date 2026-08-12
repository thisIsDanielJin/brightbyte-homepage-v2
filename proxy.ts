/**
 * proxy.ts — i18n routing proxy (Next.js 16 name for middleware).
 *
 * CRITICAL: Next.js 16 renamed middleware.ts → proxy.ts (Pitfall 1).
 * Uses named `export function proxy` — the canonical form for Next.js 16.
 * (`export default` is deprecated as of v16.0.0.)
 *
 * Handles:
 *   - Locale detection and /de /en prefix enforcement (localePrefix: 'always')
 *   - / → /de redirect (D-03, D-05 — always DE, ignores Accept-Language)
 *   - Bare paths (/kontakt) → /de/kontakt prepend (D-04)
 *
 * Matcher excludes:
 *   - api routes
 *   - _next/static, _next/image (Next.js internals)
 *   - favicon.ico, sitemap.xml, robots.txt (Pitfall 7 — must NOT be locale-prefixed)
 *   - token-audit (phase-01 dev-only design-token diagnostic page; non-localized
 *     by design — it renders raw token pairs, not user-facing locale content, so
 *     it must stay reachable at /token-audit and NOT be redirected to /de/token-audit)
 *   - studio (embedded Sanity Studio at /studio, D-01 — a client Studio app gated by
 *     Sanity's own auth; must NOT be locale-prefixed to /de/studio)
 *
 * Source: next-intl.dev/docs/routing/middleware
 *         node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
 */
import createMiddleware from 'next-intl/middleware'
import type { NextRequest } from 'next/server'
import { routing } from './i18n/routing'

const middlewareFn = createMiddleware(routing)

export function proxy(request: NextRequest) {
  return middlewareFn(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files — must NOT be locale-prefixed)
     * - token-audit (phase-01 dev-only diagnostic — non-localized by design)
     * - studio (embedded Sanity Studio — auth-gated, non-localized by design)
     */
    '/((?!api|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|token-audit|studio).*)',
  ],
}
