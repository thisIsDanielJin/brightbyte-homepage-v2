/**
 * components/work/CaseStudyLayout.tsx — RSC layout for /[locale]/work/[slug] (Phase 7).
 *
 * Five-band structure: Hero → Problem → Solution → Outcome → CTA.
 * Bands with no data are omitted entirely (no placeholders).
 *
 * T-07-01: All Sanity strings rendered as escaped JSX text nodes — never
 *   dangerouslySetInnerHTML (established pattern from SeoPageLayout.tsx).
 * T-07-03: locale param is narrowed to 'de' | 'en' by the parent route before use.
 * IDENT-01: zero raw hex, zero text-gray-* — named token utilities only.
 *
 * Source: 07-01-PLAN.md Task 2 Step B.
 */
import Image from 'next/image'
import Link from 'next/link'
import { MotionSection } from '@/components/ui/MotionSection'
import { urlFor } from '@/lib/sanity/image'
import type { CASE_STUDY_BY_SLUG_QUERY_RESULT } from '@/sanity.types'

type Project = NonNullable<CASE_STUDY_BY_SLUG_QUERY_RESULT>
type Locale = 'de' | 'en'

// Verbatim copy from SeoPageLayout.tsx line 72–73 (CTA_CLASS constant).
const CTA_CLASS =
  'inline-block rounded-sm bg-accent px-6 py-3 text-sm font-medium text-surface transition-colors duration-150 ease-[var(--ease-standard)] hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:scale-[0.98]'

export function CaseStudyLayout({
  project,
  locale,
}: {
  project: Project
  locale: Locale
}) {
  return (
    <>
      {/* Band 1 — Hero band */}
      <MotionSection className="bg-surface py-24 px-4 md:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto">
          <div
            className={
              project.heroImage
                ? 'grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-16 items-center'
                : 'max-w-2xl'
            }
          >
            {/* Left column: category pill + H1 + outcome callout + summary */}
            <div>
              {project.clientCategory ? (
                <span className="inline-block border border-border rounded-full px-3 py-1 text-sm uppercase tracking-widest text-secondary mb-4">
                  {project.clientCategory}
                </span>
              ) : null}
              <h1 className="text-4xl md:text-5xl font-bold text-primary leading-[1.1] mb-6">
                {project.title}
              </h1>
              {project.outcomeValue ? (
                <p className="text-4xl font-bold text-primary leading-none">
                  {project.outcomeValue}
                </p>
              ) : null}
              {project.outcomeLabel ? (
                <p className="text-sm text-secondary">{project.outcomeLabel}</p>
              ) : null}
              {project.summary ? (
                <p className="text-base text-secondary leading-[1.6] mt-4">
                  {project.summary}
                </p>
              ) : null}
            </div>

            {/* Right column: hero image (desktop only) */}
            {project.heroImage ? (
              <div className="lg:block hidden">
                <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
                  <Image
                    src={urlFor(project.heroImage)
                      .width(800)
                      .height(600)
                      .fit('crop')
                      .auto('format')
                      .url()}
                    alt={project.title ?? ''}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </MotionSection>

      {/* Band 2 — Problem band (omit if no problem text) */}
      {project.problem ? (
        <MotionSection className="bg-surface py-24 px-4 md:px-8 lg:px-16">
          <div className="max-w-2xl mx-auto">
            <p className="text-sm font-medium text-secondary uppercase tracking-widest mb-2">
              {locale === 'de' ? 'Die Herausforderung' : 'The Challenge'}
            </p>
            <h2 className="text-3xl font-semibold text-primary mb-8">
              {locale === 'de' ? 'Ausgangssituation' : 'Starting point'}
            </h2>
            <p className="text-base text-secondary leading-[1.6] whitespace-pre-line">
              {project.problem}
            </p>
          </div>
        </MotionSection>
      ) : null}

      {/* Band 3 — Solution band (omit if no solution text) */}
      {project.solution ? (
        <MotionSection className="bg-surface-subtle py-24 px-4 md:px-8 lg:px-16">
          <div className="max-w-2xl mx-auto">
            <p className="text-sm font-medium text-secondary uppercase tracking-widest mb-2">
              {locale === 'de' ? 'Die Lösung' : 'The solution'}
            </p>
            <h2 className="text-3xl font-semibold text-primary mb-8">
              {locale === 'de' ? 'Was wir gebaut haben' : 'What we built'}
            </h2>
            <p className="text-base text-secondary leading-[1.6] whitespace-pre-line">
              {project.solution}
            </p>
          </div>
        </MotionSection>
      ) : null}

      {/* Band 4 — Outcome band (omit if neither outcomeText nor outcomeValue) */}
      {project.outcomeText || project.outcomeValue ? (
        <MotionSection className="bg-surface py-24 px-4 md:px-8 lg:px-16">
          <div className="max-w-2xl mx-auto">
            <p className="text-sm font-medium text-secondary uppercase tracking-widest mb-2">
              {locale === 'de' ? 'Das Ergebnis' : 'The outcome'}
            </p>
            <h2 className="text-3xl font-semibold text-primary mb-8">
              {locale === 'de' ? 'Gemessene Ergebnisse' : 'Measured results'}
            </h2>
            {project.outcomeValue ? (
              <p className="text-4xl font-bold text-primary leading-none my-4">
                {project.outcomeValue}
              </p>
            ) : null}
            {project.outcomeLabel ? (
              <p className="text-sm text-secondary mb-4">{project.outcomeLabel}</p>
            ) : null}
            {project.outcomeText ? (
              <p className="text-base text-secondary leading-[1.6] whitespace-pre-line">
                {project.outcomeText}
              </p>
            ) : null}
          </div>
        </MotionSection>
      ) : null}

      {/* Band 5 — CTA strip */}
      <MotionSection className="bg-surface py-24 px-4 md:px-8 lg:px-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-semibold text-primary mb-4">
            {locale === 'de' ? 'Ähnliches Projekt?' : 'Similar project?'}
          </h2>
          <p className="text-base text-secondary mb-8">
            {locale === 'de'
              ? 'Lass uns über dein Projekt sprechen.'
              : "Let's talk about your project."}
          </p>
          <a href="#contact" className={CTA_CLASS}>
            {locale === 'de' ? 'Projekt besprechen' : 'Discuss your project'}
          </a>
          <p className="mt-6">
            <Link
              href={'/' + locale + '/#work'}
              className="text-sm text-secondary hover:text-primary transition-colors duration-150"
            >
              {locale === 'de' ? '← Alle Projekte' : '← All projects'}
            </Link>
          </p>
        </div>
      </MotionSection>
    </>
  )
}
