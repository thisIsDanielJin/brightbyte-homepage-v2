/**
 * app/page.tsx — Root redirect to /de (static-export fallback).
 *
 * The proxy.ts (createMiddleware) handles the / → /de redirect at runtime
 * for all standard deployments. This page covers the no-proxy path: static
 * export or direct Next.js rendering without proxy middleware.
 *
 * D-05: always redirect to /de — never /en, never Accept-Language negotiation.
 * D-03: localePrefix 'always' means / must redirect to /de, not render locale-less.
 *
 * Source: RESEARCH §Pattern 9
 */
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/de')
}
