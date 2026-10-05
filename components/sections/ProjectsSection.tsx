/**
 * components/sections/ProjectsSection.tsx — Stacked showcase (Apple/Linear style).
 *
 * Each project is a full-width dark card with a large image area and text below.
 * Projects stack vertically with generous spacing. Premium, not editorial.
 * Accent gradient placeholder when no image exists.
 *
 * better-ui: image outlines at low opacity, optical alignment.
 * impeccable: every card is its own moment, generous whitespace.
 */
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { MotionSection } from '@/components/ui/MotionSection'
import { urlFor } from '@/lib/sanity/image'
import type { PROJECTS_QUERY_RESULT, TESTIMONIALS_QUERY_RESULT } from '@/sanity.types'

interface ProjectsSectionProps {
  projects: PROJECTS_QUERY_RESULT
  testimonials: TESTIMONIALS_QUERY_RESULT
  locale: string
}

function ProjectsSectionInner({ projects, testimonials, locale }: ProjectsSectionProps) {
  const t = useTranslations('Projects')
  const tWork = useTranslations('Work')
  if (!projects || projects.length === 0) return null

  const testimonialByCompany = new Map<string, TESTIMONIALS_QUERY_RESULT[number]>()
  if (testimonials) {
    for (const test of testimonials) {
      if (test.company) testimonialByCompany.set(test.company.toLowerCase(), test)
    }
  }

  return (
    <MotionSection id="work" className="py-24 md:py-32 bg-surface-subtle">
      <div className="px-6 md:px-8 lg:px-12 xl:px-[max(calc((100vw-90rem)/2+3rem),3rem)]">
        {/* Eyebrow + heading */}
        <p className="text-xs font-medium uppercase tracking-widest text-accent mb-4">
          {tWork('eyebrow')}
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-primary leading-[1.1] tracking-[-0.02em] mb-16 md:mb-20">
          {t('heading')}
        </h2>

        {/* Stacked project cards */}
        <div className="flex flex-col gap-6 md:gap-8">
          {projects.map((project, index) => {
            const matched = project.title
              ? testimonialByCompany.get(project.title.toLowerCase())
              : undefined
            const metricMatch = project.outcomeNote?.match(/[+\-]?\d[\d.,]*\s?%?/)
            const metric = metricMatch ? metricMatch[0].trim() : null
            const hasImage = !!project.image?.asset
            const slug = project.slug?.current
            const canLink = project.hasCaseStudy && slug
            // Vary gradient angle per card so placeholders don't look identical
            const gradientAngles = [135, 160, 110]
            const angle = gradientAngles[index % gradientAngles.length]

            return (
              <article
                key={project._id}
                className="bg-surface-dark overflow-hidden"
                data-testid="project-card"
              >
                {/* Image area */}
                <div className="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden">
                  {hasImage ? (
                    <Image
                      src={urlFor(project.image!)
                        .width(1440)
                        .height(600)
                        .fit('crop')
                        .auto('format')
                        .url()}
                      alt={project.title ?? ''}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 90vw"
                      style={{
                        outline: '1px solid rgba(255,255,255,0.1)',
                        outlineOffset: '-1px',
                      }}
                    />
                  ) : (
                    <div
                      className="absolute inset-0"
                      aria-hidden="true"
                      style={{
                        background:
                          `linear-gradient(${angle}deg, var(--color-accent) 0%, #0F1F6B 60%, #0A1445 100%)`,
                      }}
                    >
                      {/* Stripe texture overlay */}
                      <div
                        className="absolute inset-0 opacity-15"
                        style={{
                          maskImage:
                            'repeating-linear-gradient(90deg, black, black 5px, transparent 5px, transparent 11px)',
                          WebkitMaskImage:
                            'repeating-linear-gradient(90deg, black, black 5px, transparent 5px, transparent 11px)',
                          background:
                            'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
                        }}
                      />
                      {/* Large initial letter */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[6rem] md:text-[8rem] font-bold text-white/[0.08] select-none leading-none">
                          {(project.title ?? '').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content below image */}
                <div className="p-8 md:p-10 lg:p-12">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 md:gap-16">
                    {/* Left: title + description */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-2xl md:text-3xl font-bold text-on-dark leading-tight tracking-[-0.01em] mb-4">
                        {project.title}
                      </h3>
                      {project.outcomeNote && (
                        <p className="text-base text-muted-on-dark leading-relaxed max-w-lg text-pretty">
                          {project.outcomeNote}
                        </p>
                      )}
                      {canLink && (
                        <Link
                          href={`/work/${slug}`}
                          locale={locale as 'de' | 'en'}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-on-dark mt-6 hover:text-accent transition-colors [transition-duration:150ms]"
                        >
                          {tWork('eyebrow')}
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="flex-shrink-0"
                            aria-hidden="true"
                          >
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                          </svg>
                        </Link>
                      )}
                    </div>

                    {/* Right: metric + quote */}
                    <div className="md:text-right md:max-w-sm flex-shrink-0">
                      {metric && (
                        <p className="text-5xl md:text-6xl font-bold text-on-dark tabular-nums tracking-[-0.03em] mb-2">
                          {metric}
                        </p>
                      )}
                      {matched?.quote && (
                        <div className="mt-4 md:mt-6">
                          <p className="text-sm text-muted-on-dark leading-relaxed text-pretty italic">
                            &ldquo;{matched.quote}&rdquo;
                          </p>
                          {matched.author && (
                            <p className="text-sm text-muted-on-dark mt-2">
                              {matched.author}
                              {matched.company && (
                                <span className="text-muted-on-dark/60">
                                  , {matched.company}
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </MotionSection>
  )
}

export function ProjectsSection({
  projects,
  testimonials,
  locale,
}: ProjectsSectionProps) {
  return (
    <ProjectsSectionInner
      projects={projects}
      testimonials={testimonials}
      locale={locale}
    />
  )
}
