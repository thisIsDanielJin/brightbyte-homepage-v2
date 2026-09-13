import { useTranslations } from 'next-intl'
import { MotionSection } from '@/components/ui/MotionSection'
import type { SERVICES_QUERY_RESULT } from '@/sanity.types'

interface ServicesSectionProps {
  services: SERVICES_QUERY_RESULT
  locale: string
}

function ServicesSectionInner({ services }: ServicesSectionProps) {
  const t = useTranslations('Services')

  if (!services || services.length === 0) return null

  return (
    <MotionSection
      id="services"
      className="py-24 md:py-32 px-6 md:px-12 lg:px-16 bg-surface-subtle"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section header — left-aligned, editorial */}
        <div className="mb-12 md:mb-16">
          <p className="text-xs font-medium text-accent uppercase tracking-[0.2em] mb-4">
            {t('eyebrow')}
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-primary leading-[1.05] tracking-[-0.02em] max-w-[480px] text-balance">
            {t('heading')}
          </h2>
        </div>

        {/* Service rows */}
        <div className="flex flex-col divide-y divide-border">
          {services.map((service, idx) => (
            <div
              key={service._id}
              className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-16 py-10 md:py-12"
              data-testid="service-card"
            >
              {/* Left: index + title + price */}
              <div>
                <p className="text-xs text-muted font-medium tabular-nums mb-3" aria-hidden="true" data-decorative="true">
                  {String(idx + 1).padStart(2, '0')}
                </p>
                <h3
                  className="text-xl md:text-2xl font-semibold text-primary leading-snug text-balance"
                  data-testid="service-title"
                >
                  {service.title}
                </h3>
                <p
                  className="text-2xl font-bold text-accent mt-4"
                  data-testid="service-price"
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
              </div>

              {/* Right: blurb + includes */}
              <div className="flex flex-col justify-center">
                {service.blurb && (
                  <p className="text-base md:text-lg text-secondary leading-relaxed mb-6 text-pretty">
                    {service.blurb}
                  </p>
                )}
                {service.includes && service.includes.length > 0 && (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                    {service.includes.map((item, i) => (
                      <li key={i} className="text-sm text-secondary flex items-start gap-2">
                        <span className="text-accent font-semibold mt-0.5 flex-shrink-0" aria-hidden="true">→</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA row */}
        <div className="mt-12 pt-10 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <p className="text-base text-secondary max-w-sm text-pretty">
            {t('ctaBlurb')}
          </p>
          <a
            href="#contact"
            className="flex-shrink-0 inline-block border border-accent text-accent text-sm font-semibold px-7 py-3.5 rounded-sm hover:bg-accent hover:text-surface [transition-duration:150ms] [transition-timing-function:var(--ease-standard)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            {t('cta')}
          </a>
        </div>
      </div>
    </MotionSection>
  )
}

export function ServicesSection({ services, locale }: ServicesSectionProps) {
  return <ServicesSectionInner services={services} locale={locale} />
}
