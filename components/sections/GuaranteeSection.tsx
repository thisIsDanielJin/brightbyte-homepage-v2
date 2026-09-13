/**
 * components/sections/GuaranteeSection.tsx — Guarantee trust strip (homepage).
 *
 * Static RSC — copy lives in messages/de.json and messages/en.json under the
 * "Guarantee" namespace. No Sanity fetch. Always renders (no empty state).
 *
 * UI-SPEC: bg-surface-muted py-16; max-w-2xl mx-auto text-center;
 * headline text-4xl font-bold; body text-base text-secondary;
 * three trust ticks in flex flex-wrap justify-center gap-6 with text-accent checkmark.
 *
 * IDENT-01: zero raw hex, zero text-gray-* in this file.
 * A11y: checkmark ✓ characters carry aria-hidden="true" (decorative, UI-SPEC).
 *
 * Source: 07-UI-SPEC.md § Guarantee Section; 07-03-PLAN.md Task 1 Step D.
 */
import { useTranslations } from 'next-intl'
import { MotionSection } from '@/components/ui/MotionSection'

export function GuaranteeSection() {
  const t = useTranslations('Guarantee')

  const ticks = [t('tick1'), t('tick2'), t('tick3')]

  return (
    <MotionSection id="guarantee" className="bg-surface-muted py-16 px-4 md:px-8 lg:px-16">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-primary mb-4">{t('heading')}</h2>
        <p className="text-base text-secondary leading-relaxed mb-8">{t('body')}</p>

        {/* Trust ticks */}
        <div className="flex flex-wrap justify-center gap-6">
          {ticks.map((tick) => (
            <span key={tick} className="text-sm text-secondary">
              {/* Checkmark is decorative — the tick text carries the meaning */}
              <span className="text-accent mr-1" aria-hidden="true">
                ✓
              </span>
              {tick}
            </span>
          ))}
        </div>
      </div>
    </MotionSection>
  )
}
