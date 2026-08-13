/**
 * components/sections/PricingSection.tsx — Pricing section (SEC-03)
 *
 * RSC: receives services data from page-level fetch (same data as ServicesSection).
 * Renders the two seeded service tiers as pricing cards.
 * Section hidden entirely when 0 services.
 *
 * Price rendering:
 *   - priceFrom: true  → "ab €X" (DE) / "from €X" (EN) at text-5xl
 *   - priceOnRequest: true → "Auf Anfrage" / "On request" (no numeric) at text-5xl
 *   - NEVER hardcoded — values ONLY from Sanity price object (T-04-04 mitigation)
 *
 * IDENT-01: zero raw hex, zero text-gray-* — all via @theme token utilities.
 *
 * Source: 04-UI-SPEC.md Pricing Section; CONTEXT.md SEC-03, D-11.
 */
import { useTranslations } from 'next-intl'
import { MotionSection } from '@/components/ui/MotionSection'
import type { SERVICES_QUERY_RESULT } from '@/sanity.types'

interface PricingSectionProps {
  services: SERVICES_QUERY_RESULT
  locale: string
}

function PriceAmount({
  service,
  priceFromLabel,
  priceOnRequestLabel,
}: {
  service: SERVICES_QUERY_RESULT[number]
  priceFromLabel: string
  priceOnRequestLabel: string
}) {
  if (service.priceOnRequest) {
    return (
      <div className="mb-6">
        <p
          className="text-4xl md:text-5xl font-bold text-primary"
          data-testid="pricing-price"
        >
          {priceOnRequestLabel}
        </p>
      </div>
    )
  }

  if (service.price) {
    const { amount, currency, label, priceFrom } = service.price
    const currencySymbol = currency === 'EUR' ? '€' : (currency ?? '€')

    if (priceFrom && amount) {
      return (
        <div className="mb-6">
          <p
            className="text-4xl md:text-5xl font-bold text-primary"
            data-testid="pricing-price"
          >
            {priceFromLabel} {currencySymbol}{amount}
          </p>
        </div>
      )
    }

    if (label) {
      return (
        <div className="mb-6">
          <p
            className="text-4xl md:text-5xl font-bold text-primary"
            data-testid="pricing-price"
          >
            {label}
          </p>
        </div>
      )
    }

    if (amount) {
      return (
        <div className="mb-6">
          <p
            className="text-4xl md:text-5xl font-bold text-primary"
            data-testid="pricing-price"
          >
            {currencySymbol}{amount}
          </p>
        </div>
      )
    }
  }

  return (
    <div className="mb-6">
      <p
        className="text-4xl md:text-5xl font-bold text-primary"
        data-testid="pricing-price"
      >
        {priceOnRequestLabel}
      </p>
    </div>
  )
}

function PricingSectionInner({ services }: PricingSectionProps) {
  const t = useTranslations('Pricing')

  if (!services || services.length === 0) {
    return null
  }

  return (
    <MotionSection
      id="pricing"
      className="py-24 px-4 md:px-8 lg:px-16 bg-surface-subtle"
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

        {/* Pricing cards: stacked mobile, 2-col desktop, max-width 900px centered */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[900px] mx-auto">
          {services.map((service) => (
            <div
              key={service._id}
              className="bg-surface border border-border rounded-sm p-8 flex flex-col"
              data-testid="pricing-card"
            >
              {/* Tier label */}
              <p className="text-sm font-medium text-secondary uppercase tracking-widest mb-4">
                {service.title}
              </p>

              {/* Price — from Sanity only, never hardcoded */}
              <PriceAmount
                service={service}
                priceFromLabel={t('priceFrom')}
                priceOnRequestLabel={t('priceOnRequest')}
              />

              {/* Price sublabel */}
              {!service.priceOnRequest && (
                <p className="text-sm text-secondary mb-6">
                  {t('priceSuffix')}
                </p>
              )}

              {/* Includes list */}
              {service.includes && service.includes.length > 0 && (
                <ul className="space-y-2 mb-8 flex-1">
                  {service.includes.map((item, idx) => (
                    <li key={idx} className="text-base text-secondary flex items-start gap-2">
                      <span className="text-accent font-medium mt-0.5" aria-hidden="true">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* CTA — outlined, per UI-SPEC */}
              <a
                href="#contact"
                className="mt-auto border border-accent text-accent px-6 py-3 text-sm font-medium rounded-sm text-center transition-colors [transition-duration:var(--duration-short)] [transition-timing-function:var(--ease-standard)] hover:bg-accent hover:text-surface focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 outline-none"
              >
                {t('cta')}
              </a>
            </div>
          ))}
        </div>
      </div>
    </MotionSection>
  )
}

export function PricingSection({ services, locale }: PricingSectionProps) {
  return <PricingSectionInner services={services} locale={locale} />
}
