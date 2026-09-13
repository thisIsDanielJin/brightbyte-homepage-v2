/**
 * components/sections/FaqSection.tsx — FAQ section wrapper (homepage).
 *
 * RSC that receives `faqs` as props from page.tsx (sourced from
 * siteSettings.faqs[] in Sanity). Passes to the existing FaqAccordion
 * component with zero modification (import path: @/components/seo/FaqAccordion).
 *
 * Section hidden entirely when faqs is empty or undefined (mirrors
 * Services/Testimonials hide pattern per UI-SPEC).
 *
 * IDENT-01: zero raw hex, zero text-gray-* in this file.
 * T-07-07: FAQ strings rendered as escaped JSX text nodes via FaqAccordion
 *          (never dangerouslySetInnerHTML).
 *
 * Source: 07-UI-SPEC.md § FAQ Section; 07-03-PLAN.md Task 1 Step E.
 */
import { useTranslations } from 'next-intl'
import { MotionSection } from '@/components/ui/MotionSection'
import { FaqAccordion } from '@/components/seo/FaqAccordion'

type Faq = { question: string; answer: string }

interface FaqSectionProps {
  faqs: Faq[]
}

export function FaqSection({ faqs }: FaqSectionProps) {
  const t = useTranslations('FAQ')

  // Hidden entirely when no FAQ items (T-07-07 — graceful empty state)
  if (!faqs || faqs.length === 0) return null

  return (
    <MotionSection id="faq" className="bg-surface py-24 px-4 md:px-8 lg:px-16">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-sm text-secondary uppercase tracking-widest mb-2">
            {t('eyebrow')}
          </p>
          <h2 className="text-4xl font-bold text-primary">{t('heading')}</h2>
        </div>

        {/* FaqAccordion — zero modification to the existing component */}
        <FaqAccordion faqs={faqs} />
      </div>
    </MotionSection>
  )
}
