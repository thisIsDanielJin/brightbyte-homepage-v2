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
      className="py-24 px-4 md:px-8 lg:px-16 bg-surface"
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

        {/* Testimonial cards: stacked mobile, 3-col desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial._id}
              className="bg-surface border border-border rounded-sm p-6"
              data-testid="testimonial-card"
            >
              {/* Outcome metric — OWN visual field above the quote (SEC-05 constraint) */}
              <p
                className="text-4xl font-bold text-primary leading-none"
                data-testid="testimonial-metric"
                aria-label={`${testimonial.outcomeValue} ${testimonial.outcomeLabel ?? ''}`}
              >
                {testimonial.outcomeValue}
              </p>
              {testimonial.outcomeLabel && (
                <p
                  className="text-sm font-medium text-secondary mt-1"
                  data-testid="testimonial-outcome-label"
                  aria-hidden="true"
                >
                  {testimonial.outcomeLabel}
                </p>
              )}

              {/* Rule separating metric from quote */}
              <div className="border-t border-border mt-4 mb-4" role="separator" aria-hidden="true" />

              {/* Quote */}
              <blockquote>
                <p
                  className="text-base text-secondary italic leading-relaxed"
                  data-testid="testimonial-quote"
                >
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
              </blockquote>

              {/* Attribution */}
              <footer className="mt-4">
                <p
                  className="text-sm font-semibold text-primary"
                  data-testid="testimonial-author"
                >
                  {testimonial.author}
                </p>
                {testimonial.company && (
                  <p
                    className="text-sm text-secondary"
                    data-testid="testimonial-company"
                  >
                    {testimonial.company}
                  </p>
                )}
              </footer>
            </div>
          ))}
        </div>
      </div>
    </MotionSection>
  )
}

export function TestimonialsSection({ testimonials, locale }: TestimonialsSectionProps) {
  return <TestimonialsSectionInner testimonials={testimonials} locale={locale} />
}
