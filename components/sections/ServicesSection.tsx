/**
 * components/sections/ServicesSection.tsx — Services section (SEC-02)
 *
 * RSC: receives services data fetched at page level (Pattern 2 — no per-section fetch).
 * Renders 2 seeded service tiers as cards in a 1-col (375px) / 2-col (1440px) grid.
 * Section hidden entirely when 0 services (UI Considerations row 9).
 *
 * Price display logic per UI-SPEC:
 *   - priceFrom: true → prepend "ab " (DE) / "from " (EN) prefix to price.label
 *   - priceOnRequest: true → "Auf Anfrage" / "On request" (no numeric)
 *   - Otherwise → price.label verbatim
 *
 * IDENT-01: zero raw hex, zero text-gray-* — all via @theme token utilities.
 * No icon library — checkmark via Unicode ✓ in text-accent.
 *
 * Source: 04-UI-SPEC.md Services Section; 04-RESEARCH.md Pattern 2.
 */
import { useTranslations } from 'next-intl'
import { MotionSection } from '@/components/ui/MotionSection'
import type { SERVICES_QUERY_RESULT } from '@/sanity.types'

interface ServicesSectionProps {
  services: SERVICES_QUERY_RESULT
  locale: string
}

function PriceDisplay({
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
      <p
        className="text-2xl font-semibold text-primary"
        data-testid="service-price"
      >
        {priceOnRequestLabel}
      </p>
    )
  }

  if (service.price) {
    const { amount, currency, label, priceFrom } = service.price
    const currencySymbol = currency === 'EUR' ? '€' : (currency ?? '€')

    if (priceFrom && amount) {
      return (
        <p
          className="text-2xl font-semibold text-primary"
          data-testid="service-price"
        >
          {priceFromLabel} {currencySymbol}{amount}
        </p>
      )
    }

    if (label) {
      return (
        <p
          className="text-2xl font-semibold text-primary"
          data-testid="service-price"
        >
          {label}
        </p>
      )
    }

    if (amount) {
      return (
        <p
          className="text-2xl font-semibold text-primary"
          data-testid="service-price"
        >
          {currencySymbol}{amount}
        </p>
      )
    }
  }

  return (
    <p
      className="text-2xl font-semibold text-primary"
      data-testid="service-price"
    >
      {priceOnRequestLabel}
    </p>
  )
}

// Inner RSC component that uses translations
function ServicesSectionInner({ services, locale }: ServicesSectionProps) {
  const t = useTranslations('Services')

  if (!services || services.length === 0) {
    return null
  }

  return (
    <MotionSection
      id="services"
      className="py-24 px-4 md:px-8 lg:px-16"
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

        {/* Service cards grid: 1-col mobile, 2-col desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => (
            <div
              key={service._id}
              className="bg-surface border border-border p-6 rounded-sm"
              data-testid="service-card"
            >
              {/* Title */}
              <h3
                className="text-2xl font-semibold text-primary mb-3"
                data-testid="service-title"
              >
                {service.title}
              </h3>

              {/* Blurb */}
              {service.blurb && (
                <p className="text-base text-secondary leading-relaxed mb-4">
                  {service.blurb}
                </p>
              )}

              {/* Includes list */}
              {service.includes && service.includes.length > 0 && (
                <ul className="space-y-2 mb-6" aria-label={t('includes')}>
                  {service.includes.map((item, idx) => (
                    <li key={idx} className="text-sm text-secondary flex items-start gap-2">
                      <span className="text-accent font-medium mt-0.5" aria-hidden="true">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Price */}
              <PriceDisplay
                service={service}
                priceFromLabel={t('priceFrom')}
                priceOnRequestLabel={t('priceOnRequest')}
              />
            </div>
          ))}
        </div>
      </div>
    </MotionSection>
  )
}

export function ServicesSection({ services, locale }: ServicesSectionProps) {
  return <ServicesSectionInner services={services} locale={locale} />
}
