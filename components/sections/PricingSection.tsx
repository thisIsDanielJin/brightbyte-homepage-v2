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
    <MotionSection
      id="pricing"
      className="py-24 md:py-32 px-6 md:px-12 lg:px-16 bg-surface-dark"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="mb-16 md:mb-20">
          <p className="text-xs font-medium text-muted-on-dark uppercase tracking-[0.2em] mb-4">
            {t('eyebrow')}
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-on-dark leading-[1.05] tracking-[-0.02em] max-w-[520px] text-balance">
            {t('heading')}
          </h2>
        </div>

        {/* Pricing cards — side by side on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border/20">
          {services.map((service) => (
            <div
              key={service._id}
              className="bg-surface-dark p-10 md:p-12 flex flex-col"
              data-testid="pricing-card"
            >
              {/* Tier */}
              <p className="text-xs font-medium text-muted-on-dark uppercase tracking-[0.15em] mb-6">
                {service.title}
              </p>

              {/* Price — the centrepiece */}
              <p
                className="text-5xl md:text-6xl font-bold text-on-dark leading-none tracking-[-0.03em] mb-2 tabular-nums"
                data-testid="pricing-price"
              >
                {service.priceOnRequest
                  ? t('priceOnRequest')
                  : service.price?.priceFrom && service.price?.amount
                    ? `${t('priceFrom')} €${service.price.amount}`
                    : service.price?.label
                      ? service.price.label
                      : service.price?.amount
                        ? `€${service.price.amount}`
                        : t('priceOnRequest')}
              </p>

              {/* Price suffix — always rendered so both columns' dividers and
                  checklists align. On-request tier gets a meaningful subline
                  instead of a blank spacer. */}
              <p className="text-sm text-muted-on-dark mb-8">
                {service.priceOnRequest ? t('priceOnRequestSuffix') : t('priceSuffix')}
              </p>

              {/* Divider */}
              <div className="border-t border-on-dark/10 my-8" />

              {/* Includes */}
              {service.includes && service.includes.length > 0 && (
                <ul className="space-y-3 mb-10 flex-1">
                  {service.includes.map((item, idx) => (
                    <li key={idx} className="text-sm text-muted-on-dark flex items-start gap-2.5">
                      <span className="text-accent font-semibold mt-0.5 flex-shrink-0" aria-hidden="true">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* CTA */}
              <a
                href="#contact"
                className="mt-auto inline-block bg-accent text-surface text-sm font-semibold px-7 py-3.5 text-center hover:bg-accent-hover [transition-duration:150ms] [transition-timing-function:var(--ease-standard)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                {t('cta')}
              </a>
            </div>
          ))}
        </div>

        {/* Trust note */}
        <p className="mt-10 text-sm text-on-dark/70 text-center text-pretty">
          {t('trustNote')}
        </p>
      </div>
    </MotionSection>
  )
}

export function PricingSection({ services, locale }: PricingSectionProps) {
  return <PricingSectionInner services={services} locale={locale} />
}
