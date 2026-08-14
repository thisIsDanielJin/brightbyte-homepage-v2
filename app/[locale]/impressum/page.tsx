/**
 * app/[locale]/impressum/page.tsx — Impressum (Legal Notice) route (RSC, SEC-09).
 *
 * Renders address + Steuernummer + §19 UStG note from Sanity siteSettings, plus the
 * optional impressumBody prose. Editorial single-column layout (max-w-720px), rendered
 * inside the existing [locale] layout shell (Header + Footer from Wave 1).
 *
 * D-09 locale invariant: locale from awaited params (URL only, never client state).
 * T-04-13 mitigation: the page <title> comes from next-intl messages (Impressum.title),
 *   NOT from a raw Sanity string — so no stega token can reach metadata. Body values are
 *   rendered as escaped text nodes.
 * IDENT-01: zero raw hex, zero text-gray-* — token utilities only.
 * hreflang: buildHreflangAlternates('/impressum').
 *
 * Sources: 04-RESEARCH.md Pattern 6; 04-UI-SPEC.md "Impressum + Datenschutz Pages";
 *   node_modules/next/dist/docs .../file-conventions/page.md (async params).
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
  const t = await getTranslations({ locale, namespace: 'Impressum' })
  return {
    title: t('title'),
    alternates: buildHreflangAlternates('/impressum'),
  }
}

export default async function ImpressumPage({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Impressum' })
  const settings = await getSiteSettings(locale)

  const address = settings?.address ?? 'Karl-Marx-Allee 118, 10243 Berlin'
  const steuernummer = settings?.steuernummer ?? '14/596/01847'
  const vatNote = settings?.vatNote ?? ''
  const impressumBody = settings?.impressumBody ?? ''

  return (
    <main className="mx-auto max-w-[720px] px-4 py-16 md:px-8 md:py-24">
      <h1 className="text-4xl font-bold text-primary">{t('title')}</h1>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-primary">{t('addressHeading')}</h2>
        <address className="mt-3 whitespace-pre-wrap font-mono text-sm not-italic text-secondary">
          {address}
        </address>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-primary">{t('taxHeading')}</h2>
        <p className="mt-3 font-mono text-sm text-secondary">
          {t('steuernummerLabel')}: {steuernummer}
        </p>
        {vatNote ? (
          <p className="mt-2 text-base leading-relaxed text-secondary">{vatNote}</p>
        ) : null}
      </section>

      {impressumBody ? (
        <section className="mt-10">
          <p
            data-testid="legal-body"
            className="whitespace-pre-wrap text-base leading-relaxed text-secondary"
          >
            {impressumBody}
          </p>
        </section>
      ) : null}
    </main>
  )
}
