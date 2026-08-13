/**
 * app/[locale]/page.tsx — Home page: Hero section wired to Sanity siteSettings.
 *
 * Phase 4 Plan 01 (Tracer): wires the full vertical — Sanity read → RSC → token-styled
 * section → motion → QA loop — on exactly ONE fully-built section (Hero).
 *
 * Fetches getSiteSettings(locale) at page level (server-side, at request time).
 * Passes heroHeadline/heroSubline to HeroSection as props; HeroSection falls back
 * to next-intl messages when props are null (never an empty heading — D-07).
 *
 * D-09 invariant: locale from awaited params (URL segment only, never client state).
 * IDENT-01: zero raw hex, zero text-gray-* in this file.
 *
 * Plan 04-02 extends this page with the remaining 6 sections (Services through Contact).
 *
 * Sources:
 *   04-RESEARCH.md Pattern 2 (page-level Sanity fetch); 04-UI-SPEC.md layout contract
 *   node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md
 */
import type { Metadata } from 'next'
import { buildHreflangAlternates, BASE_URL } from '@/lib/i18n/metadata'
import { getSiteSettings } from '@/lib/sanity/queries'
import { HeroSection } from '@/components/sections/HeroSection'

type PageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params

  const titles: Record<string, string> = {
    de: 'BrightByte Berlin — Webdesign für kleine Unternehmen',
    en: 'BrightByte Berlin — Web Design for Small Businesses',
  }
  const descriptions: Record<string, string> = {
    de: 'Professionelles Webdesign für kleine Unternehmen in Berlin. Faire Preise, schnelle Lieferung.',
    en: 'Professional web design for small businesses in Berlin. Fair prices, fast delivery.',
  }

  return {
    title: titles[locale] ?? titles.de,
    description: descriptions[locale] ?? descriptions.de,
    alternates: {
      ...buildHreflangAlternates('/'),
      canonical: `${BASE_URL}/${locale}`, // WR-01: per-locale canonical
    },
  }
}

export default async function HomePage({ params }: PageProps) {
  // Locale from URL segment only (D-09: never client state).
  // Next.js 16 requires awaiting params (async params API).
  const { locale } = await params

  // Fetch siteSettings at request time — tokenless, stega:false client (D-03).
  // heroHeadline/heroSubline: null when absent → HeroSection falls back to next-intl messages.
  const settings = await getSiteSettings(locale)

  return (
    <main>
      <HeroSection
        headline={settings?.heroHeadline}
        subline={settings?.heroSubline}
      />
      {/*
        Sections 2–7 (Services → Contact) are added in Plan 04-02.
        This page intentionally renders only the Hero tracer section.
        An empty main element after HeroSection is acceptable during the tracer phase.
      */}
    </main>
  )
}
