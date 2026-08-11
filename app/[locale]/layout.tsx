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
 *   - Renders a minimal <header> inside NextIntlClientProvider holding ONLY
 *     <LocaleSwitcher /> — no footer, no nav, no branding (D-06)
 *     Full identity chrome is Phase 4.
 *   - Exports generateStaticParams to generate static routes for both locales
 *
 * Sources:
 *   github.com/amannn/next-intl examples/example-app-router
 *   RESEARCH §Pattern 4
 *   CONTEXT.md D-06 (minimal unstyled header, switcher only)
 *   node_modules/next/dist/docs/01-app/02-guides/internationalization.md
 */
import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { routing } from '@/i18n/routing'
import LocaleSwitcher from '@/components/LocaleSwitcher'
import { BASE_URL } from '@/lib/i18n/metadata'
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
 * metadataBase set once here so all child pages' alternates.languages absolute URLs
 * resolve correctly (Next.js 16 requires metadataBase to emit hreflang link tags).
 * Shared BASE_URL from lib/i18n/metadata.ts — single source of truth (D-07).
 */
export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
}

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
          {/*
            Minimal header — ONLY the language switcher (D-06).
            No nav links, no footer, no branding chrome yet — that is Phase 4.
            Header is inside NextIntlClientProvider so LocaleSwitcher's
            useTranslations / useLocale hooks can resolve (Pitfall 5).
          */}
          <header className="flex justify-end p-4">
            <LocaleSwitcher />
          </header>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
