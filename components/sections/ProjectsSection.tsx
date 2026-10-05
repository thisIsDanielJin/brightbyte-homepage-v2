/**
 * components/sections/ProjectsSection.tsx — Projects: gap-px grid with stock images.
 *
 * Matches the site's design language: gap-px borders, eyebrow labels,
 * clean typography. Each project is a horizontal row inside a bordered grid.
 * Left: stock image (replaced with real screenshots later).
 * Right: title, metric, outcome, testimonial.
 *
 * Stock photos from Pexels (free, no attribution required for web use).
 * When real project screenshots land in Sanity, the stock images swap out.
 *
 * better-ui: image outlines at low opacity, optical alignment.
 */
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { MotionSection } from '@/components/ui/MotionSection'
import { urlFor } from '@/lib/sanity/image'
import type { PROJECTS_QUERY_RESULT, TESTIMONIALS_QUERY_RESULT } from '@/sanity.types'

/** Stock photos keyed by project title (lowercase). Pexels, royalty-free. */
const STOCK_PHOTOS: Record<string, string> = {
  blumenspiess:
    'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=960&h=640&fit=crop',
  learnstep:
    'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=960&h=640&fit=crop',
  lumo:
    'https://images.pexels.com/photos/326503/pexels-photo-326503.jpeg?auto=compress&cs=tinysrgb&w=960&h=640&fit=crop',
}

interface ProjectsSectionProps {
  projects: PROJECTS_QUERY_RESULT
  testimonials: TESTIMONIALS_QUERY_RESULT
  locale: string
}

function ProjectsSectionInner({
  projects,
  testimonials,
}: ProjectsSectionProps) {
  const t = useTranslations('Projects')
  const tWork = useTranslations('Work')
  if (!projects || projects.length === 0) return null

  const testimonialByCompany = new Map<
    string,
    TESTIMONIALS_QUERY_RESULT[number]
  >()
  if (testimonials) {
    for (const test of testimonials) {
      if (test.company)
        testimonialByCompany.set(test.company.toLowerCase(), test)
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

        {/* Project rows: gap-px grid for 1px borders */}
        <div className="flex flex-col gap-px bg-border">
          {projects.map((project, index) => {
            const matched = project.title
              ? testimonialByCompany.get(project.title.toLowerCase())
              : undefined
            const metricMatch =
              project.outcomeNote?.match(/[+\-]?\d[\d.,]*\s?%?/)
            const metric = metricMatch ? metricMatch[0].trim() : null
            const titleLower = (project.title ?? '').toLowerCase()

            // Use Sanity image if available, otherwise stock photo
            const sanityUrl = project.image?.asset
              ? urlFor(project.image)
                  .width(960)
                  .height(640)
                  .fit('crop')
                  .auto('format')
                  .url()
              : null
            const stockUrl = STOCK_PHOTOS[titleLower]
            const imageUrl = sanityUrl ?? stockUrl
            const isEven = index % 2 === 1

            return (
              <div
                key={project._id}
                className="bg-surface grid grid-cols-1 md:grid-cols-2"
                data-testid="project-row"
              >
                {/* Image */}
                <div
                  className={`relative aspect-[3/2] overflow-hidden bg-surface-muted${isEven ? ' md:order-2' : ''}`}
                >
                  {imageUrl ? (
                    sanityUrl ? (
                      <Image
                        src={sanityUrl}
                        alt={project.title ?? ''}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        style={{
                          outline: '1px solid rgba(0,0,0,0.08)',
                          outlineOffset: '-1px',
                        }}
                      />
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={imageUrl}
                        alt={project.title ?? ''}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                        style={{
                          outline: '1px solid rgba(0,0,0,0.08)',
                          outlineOffset: '-1px',
                        }}
                      />
                    )
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      aria-hidden="true"
                    >
                      <span className="text-6xl font-bold text-border select-none">
                        {titleLower.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div
                  className={`flex flex-col justify-center p-8 md:p-12 lg:p-16${isEven ? ' md:order-1' : ''}`}
                >
                  <h3 className="text-2xl md:text-3xl font-bold text-primary leading-tight tracking-[-0.01em] mb-3">
                    {project.title}
                  </h3>

                  {metric && (
                    <p className="text-4xl md:text-5xl font-bold text-accent tabular-nums tracking-[-0.03em] mb-4">
                      {metric}
                    </p>
                  )}

                  {project.outcomeNote && (
                    <p className="text-base text-secondary leading-relaxed max-w-md text-pretty mb-6">
                      {project.outcomeNote}
                    </p>
                  )}

                  {matched?.quote && (
                    <blockquote className="border-l-2 border-accent/30 pl-5 mt-auto">
                      <p className="text-sm text-secondary leading-relaxed text-pretty italic">
                        &ldquo;{matched.quote}&rdquo;
                      </p>
                      {matched.author && (
                        <footer className="mt-2">
                          <p className="text-sm text-primary font-medium">
                            {matched.author}
                            {matched.company && (
                              <span className="text-muted font-normal">
                                , {matched.company}
                              </span>
                            )}
                          </p>
                        </footer>
                      )}
                    </blockquote>
                  )}
                </div>
              </div>
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
