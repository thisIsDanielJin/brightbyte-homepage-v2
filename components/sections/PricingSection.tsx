/**
 * components/sections/PricingSection.tsx — Pricing on dark surface.
 *
 * Centered heading, gap-px card grid matching the services pattern.
 * Each card: service label, price, suffix, includes list, CTA.
 * Trust note below the grid.
 */
import { useTranslations } from 'next-intl'
import { MotionSection } from '@/components/ui/MotionSection'
import type { SERVICES_QUERY_RESULT } from '@/sanity.types'

interface PricingSectionProps {
  services: SERVICES_QUERY_RESULT
  locale: string
}

function PricingSectionInner({ services }: PricingSectionProps) {
  const t = useTranslations('Pricing')
  if (!services || services.length === 0) return null

  return (
    <MotionSection id="pricing" className="py-24 md:py-32 bg-surface-dark">
      <div className="px-6 md:px-8 lg:px-12 xl:px-[max(calc((100vw-90rem)/2+3rem),3rem)]">
        {/* Centered heading */}
        <div className="max-w-2xl mx-auto text-center mb-16 md:mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-on-dark leading-[1.1] tracking-[-0.02em]">
            {t('heading')}
          </h2>
        </div>

        {/* gap-px card grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-muted-on-dark/15 max-w-4xl mx-auto">
          {services.map((service) => (
            <div key={service._id} className="bg-surface-dark p-10 lg:p-12 flex flex-col" data-testid="pricing-card">
              <p className="text-sm text-muted-on-dark uppercase tracking-wide mb-6">{service.title}</p>
              <p className="text-4xl md:text-5xl font-bold text-on-dark leading-none tracking-[-0.03em] mb-2 tabular-nums" data-testid="pricing-price">
                {service.priceOnRequest
                  ? t('priceOnRequest')
                  : service.price?.priceFrom && service.price?.amount
                    ? `${t('priceFrom')} \u20AC${service.price.amount}`
                    : service.price?.label ?? (service.price?.amount ? `\u20AC${service.price.amount}` : t('priceOnRequest'))}
              </p>
              <p className="text-sm text-muted-on-dark mb-10">
                {service.priceOnRequest ? t('priceOnRequestSuffix') : t('priceSuffix')}
              </p>

              {service.includes && service.includes.length > 0 && (
                <ul className="space-y-3 mb-10 flex-1">
                  {service.includes.map((item, idx) => (
                    <li key={idx} className="text-base text-muted-on-dark flex items-start gap-2.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-1 flex-shrink-0 text-accent" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              <a href="#contact" className="inline-flex items-center justify-center text-sm font-medium h-10 px-6 w-full [transition-duration:150ms] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 bg-on-dark text-surface-dark hover:bg-on-dark/90">
                {t('cta')}
              </a>
            </div>
          ))}
        </div>

        {/* Trust note */}
        <p className="mt-12 text-sm text-muted-on-dark text-center max-w-lg mx-auto">{t('trustNote')}</p>
      </div>
    </MotionSection>
  )
}

export function PricingSection({ services, locale }: PricingSectionProps) {
  return <PricingSectionInner services={services} locale={locale} />
}
