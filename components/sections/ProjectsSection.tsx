/**
 * components/sections/ProjectsSection.tsx — 3-col card grid (Stripe/Vercel).
 *
 * Design language alignment:
 *   - gap-px bg-border grid (same technique as ServicesSection)
 *   - Eyebrow label (uppercase, tracking-widest, text-accent)
 *   - Image outlines at rgba(0,0,0,0.08) per better-ui
 *   - No rounded corners (site-wide convention)
 *   - Accent color for metrics only (#1C39BB)
 *   - bg-surface-subtle section, bg-surface card fills
 *
 * Card anatomy (top to bottom):
 *   1. Image (3:2, stock or Sanity, with outline)
 *   2. Title (h3, bold, primary)
 *   3. Metric (accent, tabular-nums, prominent)
 *   4. Outcome note (secondary, relaxed)
 *   5. Testimonial quote (italic, border-l accent/30)
 *   6. Author line
 *
 * Mobile: single column. Tablet: 2-col. Desktop: 3-col.
 * Stock photos as fallback until Sanity images land.
 */
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { MotionSection } from '@/components/ui/MotionSection'
import { urlFor } from '@/lib/sanity/image'
import type { PROJECTS_QUERY_RESULT, TESTIMONIALS_QUERY_RESULT } from '@/sanity.types'

/** Stock photos keyed by project title (lowercase). Pexels, royalty-free. */
const STOCK_PHOTOS: Record<string, string> = {
  blumenspiess:
    'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=800&h=534&fit=crop',
  learnstep:
    'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800&h=534&fit=crop',
  lumo:
    'https://images.pexels.com/photos/326503/pexels-photo-326503.jpeg?auto=compress&cs=tinysrgb&w=800&h=534&fit=crop',
}

/** Display titles: clearer project naming for the portfolio context. */
const DISPLAY_TITLES: Record<string, string> = {
  blumenspiess: 'Studio Blumenspiess Homepage',
  learnstep: 'Projekt Learnstep',
  lumo: 'Baumpflege Lumo Website',
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

        {/* 3-col card grid: gap-px for 1px borders */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {projects.map((project) => {
            const matched = project.title
              ? testimonialByCompany.get(project.title.toLowerCase())
              : undefined
            const metricMatch =
              project.outcomeNote?.match(/[+\-]?\d[\d.,]*\s?%?/)
            const metric = metricMatch ? metricMatch[0].trim() : null
            const titleLower = (project.title ?? '').toLowerCase()

            // Strip the metric from the outcome note to avoid duplication
            const outcomeText = metric && project.outcomeNote
              ? project.outcomeNote.replace(metricMatch![0], '').replace(/^\s*/, '').replace(/^[,.]\s*/, '')
              : project.outcomeNote

            const displayTitle = DISPLAY_TITLES[titleLower] ?? project.title

            // Sanity image takes priority, stock photo as fallback
            const sanityUrl = project.image?.asset
              ? urlFor(project.image)
                  .width(800)
                  .height(534)
                  .fit('crop')
                  .auto('format')
                  .url()
              : null
            const stockUrl = STOCK_PHOTOS[titleLower]
            const imageUrl = sanityUrl ?? stockUrl

            return (
              <article
                key={project._id}
                className="bg-surface flex flex-col"
                data-testid="project-card"
              >
                {/* Image: 3:2 aspect */}
                <div className="relative aspect-[3/2] overflow-hidden bg-surface-muted">
                  {imageUrl ? (
                    sanityUrl ? (
                      <Image
                        src={sanityUrl}
                        alt={project.title ?? ''}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
                      <span className="text-5xl font-bold text-border select-none">
                        {titleLower.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-8 lg:p-10">
                  <h3 className="text-xl font-bold text-primary leading-snug tracking-[-0.01em] mb-2">
                    {displayTitle}
                  </h3>

                  {metric && (
                    <p className="text-3xl font-bold text-accent tabular-nums tracking-[-0.02em] mb-3">
                      {metric}
                    </p>
                  )}

                  {outcomeText && (
                    <p className="text-sm text-secondary leading-relaxed text-pretty mb-6">
                      {outcomeText}
                    </p>
                  )}

                  {/* Testimonial: quote mark + clean layout, no border-l */}
                  {matched?.quote && (
                    <div className="mt-auto pt-6 border-t border-border">
                      <p className="text-sm text-secondary leading-relaxed text-pretty">
                        &ldquo;{matched.quote}&rdquo;
                      </p>
                      {matched.author && (
                        <p className="text-xs text-muted mt-3">
                          {matched.author}
                          {matched.company && (
                            <span>, {matched.company}</span>
                          )}
                        </p>
                      )}
                    </div>
                  )}
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
