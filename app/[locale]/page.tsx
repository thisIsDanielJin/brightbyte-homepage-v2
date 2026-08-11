/**
 * app/[locale]/page.tsx — Home placeholder with locale-aware string + hreflang metadata.
 *
 * generateMetadata: calls buildHreflangAlternates('/') to emit bidirectional
 * hreflang in the page <head> via Next.js alternates.languages API (D-07).
 * No hand-rolled <link rel="alternate"> tags — Next.js emits them automatically.
 * Locale-appropriate title/description included per locale param.
 *
 * HomePage: renders ONE real translated shell string (Shell.tagline) from messages/
 * via getTranslations (server component) — proving messages load per-locale.
 * DE and EN values differ; smoke tests (4)/(5) verify hreflang tags.
 *
 * D-02: no speculative namespace pre-seeding; only Shell.tagline rendered here.
 * The full home page section is built in Phase 3+.
 */
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { buildHreflangAlternates } from '@/lib/i18n/metadata'

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
    alternates: buildHreflangAlternates('/'),
  }
}

export default async function HomePage() {
  const t = await getTranslations('Shell')

  return (
    <main className="font-sans min-h-screen flex items-center justify-center bg-surface">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-primary mb-4">BrightByte Berlin</h1>
        <p className="text-base text-secondary">{t('tagline')}</p>
      </div>
    </main>
  )
}
