/**
 * app/[locale]/s/[slug]/page.tsx — programmatic SEO landing page route (SEO-01/02).
 *
 * Fully static (SSG): generateStaticParams enumerates every seoPage doc across
 * both locales; `dynamicParams = false` makes any non-seeded slug a build-time
 * 404 (T-06-03 — no runtime slug generation, no open redirect).
 *
 * Next.js 16: `params` is a Promise and MUST be awaited (Pitfall 1).
 *
 * generateMetadata resolves the counterpart-locale slug (D-04) and emits paired
 * hreflang via buildHreflangAlternatesPaired — DE/EN URLs differ per slug; a
 * missing counterpart falls back to the same slug so the alternate still resolves.
 *
 * The default export emits three JSON-LD scripts (WebPage + FAQPage +
 * BreadcrumbList) built by lib/jsonld/seoPage.ts. dangerouslySetInnerHTML is used
 * ONLY here, fed exclusively by JSON.stringify() output (T-06-01 — a `</script>`
 * inside CMS content is escaped and cannot break out). Page content renders via
 * SeoPageLayout (RSC) as escaped JSX text nodes.
 *
 * Sources: 06-RESEARCH.md § Pattern 1/4/5/6; AGENTS.md (Next.js 16 App Router);
 *   node_modules/next/dist/docs .../generate-static-params.md, .../generate-metadata.md.
 */
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getSeoPages,
  getSeoPageBySlugWithCounterpart,
} from '@/lib/sanity/queries'
import {
  buildHreflangAlternatesPaired,
  BASE_URL,
} from '@/lib/i18n/metadata'
import {
  buildWebPageLd,
  buildFaqPageLd,
  buildBreadcrumbLd,
} from '@/lib/jsonld/seoPage'
import { SeoPageLayout } from '@/components/seo/SeoPageLayout'

// Only build-time-seeded slugs resolve; everything else 404s (T-06-03).
export const dynamicParams = false

type Locale = 'de' | 'en'
const LOCALES: Locale[] = ['de', 'en']

type RouteParams = { locale: string; slug: string }
type PageProps = { params: Promise<RouteParams> }

export async function generateStaticParams(): Promise<RouteParams[]> {
  const perLocale = await Promise.all(
    LOCALES.map(async (locale) => {
      const pages = await getSeoPages(locale)
      return pages
        .map((p) => p.slug?.current)
        .filter((slug): slug is string => typeof slug === 'string')
        .map((slug) => ({ locale, slug }))
    }),
  )
  return perLocale.flat()
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const page = await getSeoPageBySlugWithCounterpart(locale, slug)

  if (!page) {
    return {}
  }

  // Compute the DE/EN slug pair. `slug` is this page's own slug in its locale;
  // counterpartSlug is the other locale's slug (null → same-slug fallback).
  const selfSlug = page.slug?.current ?? slug
  const counterpartSlug = page.counterpartSlug ?? selfSlug
  const deSlug = locale === 'de' ? selfSlug : counterpartSlug
  const enSlug = locale === 'en' ? selfSlug : counterpartSlug

  const title = page.title ?? undefined
  const description = page.metaDescription ?? undefined

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: locale === 'de' ? 'de_DE' : 'en_US',
    },
    alternates: buildHreflangAlternatesPaired(deSlug, enSlug),
  }
}

export default async function SeoPage({ params }: PageProps) {
  const { locale: rawLocale, slug } = await params
  const locale: Locale = rawLocale === 'en' ? 'en' : 'de'

  const page = await getSeoPageBySlugWithCounterpart(rawLocale, slug)
  if (!page) {
    notFound()
  }

  const selfSlug = page.slug?.current ?? slug
  const pageUrl = `${BASE_URL}/${locale}/s/${selfSlug}`
  const localeHome = `${BASE_URL}/${locale}`

  const faqs = (page.faqs ?? [])
    .filter(
      (f): f is { question: string; answer: string } =>
        typeof f.question === 'string' && typeof f.answer === 'string',
    )
    .map((f) => ({ question: f.question, answer: f.answer }))

  // Build JSON-LD objects (pure TS). JSON.stringify is the ONLY sink (T-06-01).
  const webPageLd = buildWebPageLd(
    page.title ?? '',
    page.metaDescription ?? '',
    pageUrl,
    locale,
    BASE_URL,
  )
  const faqPageLd = buildFaqPageLd(faqs)
  const breadcrumbLd = buildBreadcrumbLd(
    page.title ?? '',
    pageUrl,
    page.category ?? 'service',
    locale,
    BASE_URL,
    localeHome,
  )

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }}
      />
      {faqs.length > 0 ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageLd) }}
        />
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <SeoPageLayout page={page} locale={locale} />
    </>
  )
}
