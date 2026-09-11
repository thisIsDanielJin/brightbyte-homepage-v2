/**
 * components/sections/TestimonialsSection.tsx — Testimonials section (SEC-05)
 *
 * RSC: receives testimonials data from page-level Promise.all fetch (Pattern 2).
 * Renders 3 testimonial cards with outcome metric as its own visual field.
 * Section hidden entirely when 0 testimonials (row 32 — no "coming soon" for
 * social proof).
 *
 * Card structure (per UI-SPEC):
 *   1. outcomeValue  → text-4xl bold text-primary (own callout field, above quote)
 *   2. outcomeLabel  → text-sm secondary
 *   3. border-t rule (mt-4 mb-4)
 *   4. quote         → text-base secondary italic
 *   5. author        → text-sm semibold primary
 *   6. company       → text-sm secondary
 *
 * Grid: 3-col at 1440px / stacked at 375px.
 * IDENT-01: zero raw hex, zero text-gray-* — all via @theme token utilities.
 *
 * Source: 04-UI-SPEC.md Testimonials Section; CONTEXT.md SEC-05.
 */
import { useTranslations } from 'next-intl'
import { MotionSection } from '@/components/ui/MotionSection'
import { StaggeredGrid } from '@/components/ui/StaggeredGrid'
import type { TESTIMONIALS_QUERY_RESULT } from '@/sanity.types'

interface TestimonialsSectionProps {
  testimonials: TESTIMONIALS_QUERY_RESULT
  locale: string
}

function TestimonialsSectionInner({ testimonials }: TestimonialsSectionProps) {
  const t = useTranslations('Testimonials')

  // Section hidden when 0 testimonials (row 32 — no "coming soon" for social proof)
  if (!testimonials || testimonials.length === 0) {
    return null
  }

  return (
    <MotionSection
      id="testimonials"
      className="py-20 md:py-28 px-6 md:px-12 lg:px-16 bg-surface"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section header — left-aligned */}
        <div className="mb-12 md:mb-16">
          <p className="text-xs font-medium text-accent uppercase tracking-[0.2em] mb-4">
            {t('eyebrow')}
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-primary leading-[1.05] tracking-[-0.02em] text-balance">
            {t('heading')}
          </h2>
        </div>

        {/* Testimonial cards — staggered entrance */}
        <StaggeredGrid className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial._id}
              className="flex flex-col p-8 bg-surface shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]"
              data-testid="testimonial-card"
            >
              {/* Outcome metric */}
              <p
                className="text-5xl font-bold text-primary leading-none tracking-[-0.03em] tabular-nums"
                data-testid="testimonial-metric"
                aria-label={`${testimonial.outcomeValue} ${testimonial.outcomeLabel ?? ''}`}
              >
                {testimonial.outcomeValue}
              </p>
              {testimonial.outcomeLabel && (
                <p
                  className="text-xs font-medium text-secondary uppercase tracking-[0.1em] mt-2 mb-6"
                  data-testid="testimonial-outcome-label"
                  aria-hidden="true"
                >
                  {testimonial.outcomeLabel}
                </p>
              )}

              {/* Quote */}
              <blockquote className="flex-1 mb-6">
                <p
                  className="text-base text-secondary leading-relaxed text-pretty"
                  data-testid="testimonial-quote"
                >
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
              </blockquote>

              {/* Attribution */}
              <footer className="pt-6 border-t border-border">
                <p
                  className="text-sm font-semibold text-primary"
                  data-testid="testimonial-author"
                >
                  {testimonial.author}
                </p>
                {testimonial.company && (
                  <p
                    className="text-xs text-muted mt-0.5"
                    data-testid="testimonial-company"
                  >
                    {testimonial.company}
                  </p>
                )}
              </footer>
            </div>
          ))}
        </StaggeredGrid>
      </div>
    </MotionSection>
  )
}

export function TestimonialsSection({ testimonials, locale }: TestimonialsSectionProps) {
  return <TestimonialsSectionInner testimonials={testimonials} locale={locale} />
}
