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
     */
    '/((?!api|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt).*)',
  ],
}
