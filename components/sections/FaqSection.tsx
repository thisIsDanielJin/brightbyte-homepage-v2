/**
 * components/sections/FaqSection.tsx — FAQ section, clean modern style.
 *
 * White background, 2-col (heading left, accordion right).
 * Same padding alignment as all other sections.
 */
import { useTranslations } from 'next-intl'
import { MotionSection } from '@/components/ui/MotionSection'
import { FaqAccordion } from '@/components/seo/FaqAccordion'

type Faq = { question: string; answer: string }

interface FaqSectionProps { faqs: Faq[] }

export function FaqSection({ faqs }: FaqSectionProps) {
  const t = useTranslations('FAQ')
  if (!faqs || faqs.length === 0) return null

  return (
    <MotionSection id="faq" className="py-24 md:py-32 bg-surface">
      <div className="px-6 md:px-8 lg:px-12 xl:px-[max(calc((100vw-90rem)/2+3rem),3rem)]">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-12 md:gap-16">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-primary leading-[1.1] tracking-[-0.02em]">
              {t('heading')}
            </h2>
          </div>
          <div>
            <FaqAccordion faqs={faqs} />
          </div>
        </div>
      </div>
    </MotionSection>
  )
}
