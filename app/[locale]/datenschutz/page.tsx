/**
 * app/[locale]/datenschutz/page.tsx — Datenschutzerklärung (Privacy Policy) route (RSC, SEC-09).
 *
 * Renders the datenschutzBody DSGVO prose from Sanity siteSettings (whitespace-pre-wrap),
 * in a max-w-720px editorial column inside the existing [locale] layout shell.
 *
 * D-09 locale invariant: locale from awaited params (URL only, never client state).
 * T-04-13 mitigation: page <title> from next-intl messages (Datenschutz.title), not a
 *   raw Sanity string — no stega token reaches metadata. Body rendered as escaped text.
 * IDENT-01: zero raw hex, zero text-gray-* — token utilities only.
 * hreflang: buildHreflangAlternates('/datenschutz').
 *
 * NOTE: datenschutzBody is required in the schema and seeded in Studio. The current
 *   seed is a clearly-marked PLACEHOLDER pending Daniel's final DSGVO legal text.
 *
 * Sources: 04-RESEARCH.md Pattern 6; 04-UI-SPEC.md "Impressum + Datenschutz Pages".
 */
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { buildHreflangAlternates } from '@/lib/i18n/metadata'
import { getSiteSettings } from '@/lib/sanity/queries'

type PageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Datenschutz' })
  return {
    title: t('title'),
    alternates: buildHreflangAlternates('/datenschutz'),
  }
}

export default async function DatenschutzPage({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Datenschutz' })
  const settings = await getSiteSettings(locale)

  const body = settings?.datenschutzBody ?? ''

  return (
    <main className="mx-auto max-w-[720px] px-4 py-16 md:px-8 md:py-24">
      <h1 className="text-4xl font-bold text-primary">{t('title')}</h1>
      <div
        data-testid="legal-body"
        className="mt-8 whitespace-pre-wrap text-base leading-relaxed text-secondary"
      >
        {body}
      </div>
    </main>
  )
}
