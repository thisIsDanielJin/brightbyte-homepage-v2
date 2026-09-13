/**
 * components/sections/ProcessSection.tsx — 3-step process section (homepage).
 *
 * Static RSC — copy lives in messages/de.json and messages/en.json under the
 * "Process" namespace. No Sanity fetch. Always renders (no empty state).
 *
 * UI-SPEC: bg-surface-subtle py-24; steps in grid-cols-1 md:grid-cols-3 gap-8;
 * each step card bg-surface rounded-sm p-6 with number chip, title, description.
 *
 * IDENT-01: zero raw hex, zero text-gray-* in this file.
 * A11y: step number chips carry aria-hidden="true" (decorative, UI-SPEC).
 *
 * Source: 07-UI-SPEC.md § Process Section; 07-03-PLAN.md Task 1 Step C.
 */
import { useTranslations } from 'next-intl'
import { MotionSection } from '@/components/ui/MotionSection'

export function ProcessSection() {
  const t = useTranslations('Process')

  const steps = [
    { number: t('step1Number'), title: t('step1Title'), desc: t('step1Desc') },
    { number: t('step2Number'), title: t('step2Title'), desc: t('step2Desc') },
    { number: t('step3Number'), title: t('step3Title'), desc: t('step3Desc') },
  ]

  return (
    <MotionSection id="process" className="bg-surface-subtle py-24 px-4 md:px-8 lg:px-16">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-sm text-secondary uppercase tracking-widest mb-2">
            {t('eyebrow')}
          </p>
          <h2 className="text-4xl font-bold text-primary">{t('heading')}</h2>
        </div>

        {/* Step cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div
              key={step.number}
              data-testid="process-step"
              className="bg-surface rounded-sm p-6"
            >
              {/* Step number chip — decorative, hidden from AT */}
              <div
                className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center text-sm text-secondary mb-4"
                aria-hidden="true"
              >
                {step.number}
              </div>
              <h3 className="text-2xl font-bold text-primary mb-2">{step.title}</h3>
              <p className="text-base text-secondary leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </MotionSection>
  )
}
