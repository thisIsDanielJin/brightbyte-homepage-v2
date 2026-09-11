/**
 * app/[locale]/work/[slug]/page.tsx — Case study page route (Phase 7).
 *
 * Fully static (SSG): generateStaticParams enumerates every project where
 * hasCaseStudy is truthy across both locales. `dynamicParams = false` makes
 * any non-seeded slug a build-time 404 (T-07-04 — no runtime slug generation).
 *
 * Next.js 16: `params` is a Promise and MUST be awaited (Pitfall 1).
 *
 * T-07-03: locale narrowed to 'de' | 'en' before any use — same pattern as
 *   app/[locale]/s/[slug]/page.tsx line 95.
 *
 * Sources: 07-01-PLAN.md Task 2 Step C; mirrors app/[locale]/s/[slug]/page.tsx.
 */
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProjects, getCaseStudyBySlug } from '@/lib/sanity/queries'
import { buildHreflangAlternates, BASE_URL } from '@/lib/i18n/metadata'
import { buildWebPageLd } from '@/lib/jsonld/seoPage'
import { CaseStudyLayout } from '@/components/work/CaseStudyLayout'

// Only build-time-seeded slugs resolve; everything else 404s (T-07-04).
export const dynamicParams = false

type Locale = 'de' | 'en'
const LOCALES: Locale[] = ['de', 'en']

type RouteParams = { locale: string; slug: string }
type PageProps = { params: Promise<RouteParams> }

export async function generateStaticParams(): Promise<RouteParams[]> {
  // For each locale, fetch all projects where hasCaseStudy is truthy.
  // PROJECTS_QUERY now includes hasCaseStudy in its projection (Task 1).
  const perLocale = await Promise.all(
    LOCALES.map(async (locale) => {
      const projects = await getProjects(locale)
      return (projects ?? [])
        .filter((p) => p.hasCaseStudy)
        .map((p) => p.slug?.current)
        .filter((slug): slug is string => typeof slug === 'string')
        .map((slug) => ({ locale, slug }))
    }),
  )
  return perLocale.flat()
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const project = await getCaseStudyBySlug(locale, slug)

  if (!project) {
    return {}
  }

  const title = project.title ?? undefined
  const description = project.summary ?? undefined

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: locale === 'de' ? 'de_DE' : 'en_US',
    },
    alternates: buildHreflangAlternates('/work/' + slug),
  }
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { locale: rawLocale, slug } = await params
  // T-07-03: narrow locale to 'de' | 'en' ternary before any use.
  const locale: Locale = rawLocale === 'en' ? 'en' : 'de'

  const project = await getCaseStudyBySlug(locale, slug)
  if (!project) {
    notFound()
  }

  const pageUrl = `${BASE_URL}/${locale}/work/${slug}`

  const webPageLd = buildWebPageLd(
    project.title ?? '',
    project.summary ?? '',
    pageUrl,
    locale,
    BASE_URL,
  )

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }}
      />
      <CaseStudyLayout project={project} locale={locale} />
    </>
  )
}
