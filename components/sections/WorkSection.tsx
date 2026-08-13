/**
 * components/sections/WorkSection.tsx — Work grid section (SEC-04, D-11)
 *
 * RSC: receives projects data from page-level Promise.all fetch (Pattern 2).
 * Renders 4-6 project cards in a responsive grid with hover lift.
 *
 * Grid: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 (auto-wrap, no max cap — row 30).
 * Card: image (next/image + urlFor, 4:3 aspect) + name + outcome note.
 * Hover lift: translate-y-[-4px] shadow-md via CSS transition (not motion/react).
 * cursor-default — cards are NOT links (D-11, Phase 7 adds case-study routes).
 * Empty state: "Projekte folgen in Kürze" / "Projects coming soon" (row 25).
 * Missing image: surface-muted block at same 4:3 aspect (row 29).
 *
 * IDENT-01: zero raw hex, zero text-gray-* — all via @theme token utilities.
 * No links on cards (D-11 — display only). No icon libraries.
 *
 * Source: 04-UI-SPEC.md Work Grid; 04-RESEARCH.md Pattern 5 (next/image + urlFor).
 */
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { MotionSection } from '@/components/ui/MotionSection'
import { urlFor } from '@/lib/sanity/image'
import type { PROJECTS_QUERY_RESULT } from '@/sanity.types'

interface WorkSectionProps {
  projects: PROJECTS_QUERY_RESULT
  locale: string
}

function WorkSectionInner({ projects }: WorkSectionProps) {
  const t = useTranslations('Work')

  return (
    <MotionSection
      id="work"
      className="py-24 px-4 md:px-8 lg:px-16"
    >
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-secondary uppercase tracking-widest mb-2">
            {t('eyebrow')}
          </p>
          <h2 className="text-4xl font-semibold text-primary">
            {t('heading')}
          </h2>
        </div>

        {projects && projects.length > 0 ? (
          /* Project cards grid: 1-col mobile, 2-col md, 3-col lg; auto-wrap (row 30) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project._id}
                className="bg-surface-muted rounded-sm overflow-hidden cursor-default transition-all [transition-duration:var(--duration-standard)] [transition-timing-function:var(--ease-standard)] hover:-translate-y-1 hover:shadow-md focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 outline-none"
                data-testid="work-card"
              >
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
                <div className="p-4">
                  <p
                    className="text-base font-semibold text-primary mb-1"
                    data-testid="work-title"
                  >
                    {project.title}
                  </p>
                  {project.outcomeNote && (
                    <p
                      className="text-sm text-secondary"
                      data-testid="work-outcome"
                    >
                      {project.outcomeNote}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty state: "Projekte folgen in Kürze" / "Projects coming soon" (row 25) */
          <div className="text-center py-16" data-testid="work-empty-state">
            <h3
              className="text-2xl font-semibold text-primary mb-3"
              data-testid="work-empty-heading"
            >
              {t('emptyHeading')}
            </h3>
            <p className="text-base text-secondary">
              {t('emptyBody')}
            </p>
          </div>
        )}
      </div>
    </MotionSection>
  )
}

export function WorkSection({ projects, locale }: WorkSectionProps) {
  return <WorkSectionInner projects={projects} locale={locale} />
}
