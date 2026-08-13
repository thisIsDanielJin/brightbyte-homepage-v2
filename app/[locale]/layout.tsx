/**
 * app/[locale]/layout.tsx — Locale-aware root layout with real Header + Footer.
 *
 * Phase 4 update: replaces the switcher-only minimal header with:
 *   - <Header /> — sticky, frosted backdrop, anchor nav, mobile hamburger
 *   - <Footer /> — dark surface accent moment (D-13), siteSettings data
 *
 * Preserved from Phase 2/3:
 *   - Plus Jakarta Sans next/font/google bridge (--font-plus-jakarta-sans → --font-sans)
 *   - NextIntlClientProvider (no messages prop — v4 auto-resolves from getRequestConfig)
 *   - body token classes (bg-surface text-primary font-sans antialiased)
 *   - generateStaticParams for both locales
 *   - metadataBase for hreflang absolute URLs
 *
 * D-09 locale invariant: locale from awaited params (URL only, never client state).
 *
 * Sources:
 *   04-RESEARCH.md Pattern 2 (page-level Sanity fetch); 04-UI-SPEC.md layout contract
 *   node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md
 */
import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { routing } from '@/i18n/routing'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { getSiteSettings } from '@/lib/sanity/queries'
import { BASE_URL } from '@/lib/i18n/metadata'
import '../globals.css'

/**
 * Plus Jakarta Sans — single variable font covering weights 200–800.
 * Preserved verbatim from Phase 1.
 */
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta-sans',
})

/**
 * metadataBase — set once so all child pages' alternates.languages resolve correctly.
 */
export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
}

/**
 * Generate static params for all supported locales.
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
  // Locale from URL segment only (D-09 invariant: never client state).
  // Awaiting params is required in Next.js 16 (async params API).
  const { locale } = await params

  // Fetch siteSettings at layout level so Footer receives contactEmail.
  // Header is fully self-contained ('use client' with static nav labels from messages).
  const settings = await getSiteSettings(locale)

  return (
    <html lang={locale} className={plusJakartaSans.variable}>
      <body className="bg-surface text-primary font-sans antialiased">
        {/*
          NextIntlClientProvider makes translations available to Client Components.
          No `messages` prop needed — v4 auto-resolves via React Server Component context.
          Header is inside the provider so it can use useTranslations (client component).
        */}
        <NextIntlClientProvider>
          <Header />
          {children}
          <Footer settings={settings} locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
