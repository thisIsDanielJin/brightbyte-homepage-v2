/**
 * app/[locale]/layout.tsx — Locale-aware root layout.
 *
 * This is the root layout for all locale routes. It:
 *   - Sets <html lang={locale}> dynamically from the [locale] URL segment
 *   - Preserves the Plus Jakarta Sans next/font/google bridge from Phase 1
 *     (--font-plus-jakarta-sans CSS variable → --font-sans via globals.css)
 *   - Preserves the Phase 1 body token classes (bg-surface text-primary
 *     font-sans antialiased) — IDENT-01 invariant
 *   - Mounts NextIntlClientProvider (no messages prop needed — v4 picks up
 *     from getRequestConfig automatically, Pitfall 5)
 *   - Exports generateStaticParams to generate static routes for both locales
 *
 * D-06: layout is provider + children only this task — switcher is Plan 03.
 *
 * Sources:
 *   github.com/amannn/next-intl examples/example-app-router
 *   RESEARCH §Pattern 4
 *   node_modules/next/dist/docs/01-app/02-guides/internationalization.md
 */
import { Plus_Jakarta_Sans } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { routing } from '@/i18n/routing'
import '../globals.css'

/**
 * Plus Jakarta Sans — single variable font covering weights 200–800.
 * Preserved verbatim from the Phase 1 flat app/layout.tsx.
 * The `variable` option emits --font-plus-jakarta-sans on the <html> element,
 * wired into Tailwind via `@theme inline { --font-sans: var(--font-plus-jakarta-sans) }`
 * in globals.css.
 */
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta-sans',
})

/**
 * Generate static params for all supported locales.
 * Required for static generation with [locale] dynamic segment.
 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  // Read locale from the [locale] URL segment (D-09: locale from URL only).
  // Awaiting params is required in Next.js 16 (async params API).
  const { locale } = await params

  return (
    <html lang={locale} className={plusJakartaSans.variable}>
      <body className="bg-surface text-primary font-sans antialiased">
        {/*
          NextIntlClientProvider makes translations available to Client Components.
          No `messages` prop needed — v4 picks up messages from getRequestConfig
          automatically via React Server Component context (Pitfall 5).
          D-06: minimal unstyled header (switcher) is added in Plan 03.
        */}
        <NextIntlClientProvider>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
