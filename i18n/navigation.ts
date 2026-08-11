/**
 * i18n/navigation.ts — Locale-aware navigation primitives.
 *
 * Exports locale-aware versions of Next.js navigation APIs via createNavigation.
 * All components import Link, usePathname, redirect etc. from THIS file —
 * never from next/link or next/navigation directly (Pitfall 4: avoids
 * double-prefixing /de/de/... in the language switcher).
 *
 * Exports:
 *   Link       — locale-aware <Link> with `locale` prop support
 *   redirect   — locale-aware redirect()
 *   usePathname — returns locale-stripped path (e.g. /about not /de/about)
 *   useRouter  — locale-aware useRouter()
 *   getPathname — server-side locale-aware pathname helper
 *
 * Source: next-intl.dev/docs/routing/navigation
 */
import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
