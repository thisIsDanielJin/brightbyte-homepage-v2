/**
 * components/sections/WorkSection.tsx — Work grid section (SEC-04, D-11, Phase 7)
 *
 * RSC: receives projects data from page-level Promise.all fetch (Pattern 2).
 * Renders 4-6 project cards in a responsive grid with hover lift.
 *
 * Grid: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 (auto-wrap, no max cap — row 30).
 * Card: image (next/image + urlFor, 4:3 aspect) + name + outcome note.
 * Hover lift: translate-y-[-4px] shadow-md via CSS transition (not motion/react).
 *
 * Phase 7: Conditional link wrapping per hasCaseStudy flag (D-11 superseded):
 *   - project.hasCaseStudy === true → <Link> with cursor-pointer (case study route)
 *   - project.hasCaseStudy falsy   → <div> with cursor-default (display only)
 * Both use data-testid="work-card" for Playwright assertions.
 *
 * Empty state: "Projekte folgen in Kürze" / "Projects coming soon" (row 25).
 * Missing image: surface-muted block at same 4:3 aspect (row 29).
 *
 * IDENT-01: zero raw hex, zero text-gray-* — all via @theme token utilities.
 * No icon libraries.
 *
 * Source: 04-UI-SPEC.md Work Grid; 07-01-PLAN.md Task 2 Step D.
 */
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'
import { MotionSection } from '@/components/ui/MotionSection'
import { urlFor } from '@/lib/sanity/image'
import type { PROJECTS_QUERY_RESULT } from '@/sanity.types'

interface WorkSectionProps {
  projects: PROJECTS_QUERY_RESULT
  locale: string
}

function WorkSectionInner({ projects, locale }: WorkSectionProps) {
  const t = useTranslations('Work')

  // Shared card content (image + text) — same for both Link and div wrappers.
  function CardContent({ project }: { project: PROJECTS_QUERY_RESULT[number] }) {
    return (
      <>
        {/* Image: 4:3 aspect ratio box (CLS-safe), object-cover */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {project.image ? (
            <Image
              src={urlFor(project.image)
                .width(800)
                .height(600)
                .fit('crop')
                .auto('format')
                .url()}
              alt={project.title ?? ''}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            /* Missing image fallback: surface-muted block same aspect (row 29) */
            <div className="w-full h-full bg-surface-muted" aria-hidden="true" />
          )}
        </div>

        {/* Card text: name + outcome note */}
        <div className="p-5">
          <p
            className="text-sm font-semibold text-primary mb-1"
            data-testid="work-title"
          >
            {project.title}
          </p>
          {project.outcomeNote && (
            <p
              className="text-xs text-secondary"
              data-testid="work-outcome"
            >
              {project.outcomeNote}
            </p>
          )}
        </div>
      </>
    )
  }

  return (
    <MotionSection
      id="work"
      className="py-24 md:py-32 px-6 md:px-12 lg:px-16 bg-surface"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section header — left-aligned */}
        <div className="mb-16 md:mb-20 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <p className="text-xs font-medium text-accent uppercase tracking-[0.2em] mb-4">
              {t('eyebrow')}
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-primary leading-[1.05] tracking-[-0.02em] text-balance">
              {t('heading')}
            </h2>
          </div>
        </div>

        {projects && projects.length > 0 ? (
          /* Project cards grid: 1-col mobile, 2-col md, 3-col lg */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) =>
              project.hasCaseStudy ? (
                <Link
                  key={project._id}
                  href={'/' + locale + '/work/' + (project.slug?.current ?? '')}
                  aria-label={
                    locale === 'de'
                      ? 'Fallstudie ' + project.title + ' anzeigen'
                      : 'View case study for ' + project.title
                  }
                  className="group bg-surface-muted overflow-hidden cursor-pointer transition-all [transition-duration:var(--duration-standard)] [transition-timing-function:var(--ease-standard)] hover:-translate-y-1 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 outline-none"
                  data-testid="work-card"
                >
                  <CardContent project={project} />
                </Link>
              ) : (
                <div
                  key={project._id}
                  className="group bg-surface-muted overflow-hidden"
                  data-testid="work-card"
                >
                  <CardContent project={project} />
                </div>
              )
            )}
          </div>
        ) : (
          <div className="py-20 border border-border text-center" data-testid="work-empty-state">
            <p className="text-xs font-medium text-muted uppercase tracking-[0.15em] mb-3">
              {t('emptyHeading')}
            </p>
            <p className="text-base text-secondary text-pretty">
              {t('emptyBody')}
            </p>
            <a
              href="#contact"
              className="mt-6 inline-block border border-accent text-accent text-sm font-semibold px-6 py-3 rounded-sm hover:bg-accent hover:text-surface [transition-duration:150ms] [transition-timing-function:var(--ease-standard)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              Projekt anfragen
            </a>
          </div>
        )}
      </div>
    </MotionSection>
  )
}

export function WorkSection({ projects, locale }: WorkSectionProps) {
  return <WorkSectionInner projects={projects} locale={locale} />
}
