/**
 * components/sections/PricingSection.tsx — Pricing on dark background with blue accents.
 *
 * Dark surface matching the projects section. Creates a strong dark band
 * in the middle of the page. Blue accent on prices and CTAs.
 * Stripe texture for consistency with the hero.
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
    <MotionSection id="pricing" className="relative py-24 md:py-32 bg-surface-dark overflow-hidden">
      <div className="absolute inset-0 opacity-20" style={{
        background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.03) 100%)',
        maskImage: 'repeating-linear-gradient(90deg, black, black 5px, transparent 5px, transparent 11px)',
        WebkitMaskImage: 'repeating-linear-gradient(90deg, black, black 5px, transparent 5px, transparent 11px)',
      }} />

      <div className="relative px-6 md:px-8 lg:px-12 xl:px-[max(calc((100vw-90rem)/2+3rem),3rem)]">
        <p className="text-xs font-medium uppercase tracking-widest text-accent/70 mb-4">
          {t('eyebrow')}
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-on-dark leading-[1.1] tracking-[-0.02em] max-w-lg mb-16 md:mb-20">
          {t('heading')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 max-w-4xl">
          {services.map((service) => (
            <div key={service._id} className="flex flex-col" data-testid="pricing-card">
              <p className="text-sm text-muted-on-dark uppercase tracking-wide mb-4">{service.title}</p>
              <p className="text-5xl md:text-6xl font-bold text-on-dark leading-none tracking-[-0.03em] mb-2 tabular-nums" data-testid="pricing-price">
                {service.priceOnRequest
                  ? t('priceOnRequest')
                  : service.price?.priceFrom && service.price?.amount
                    ? `${t('priceFrom')} \u20AC${service.price.amount}`
                    : service.price?.label ?? (service.price?.amount ? `\u20AC${service.price.amount}` : t('priceOnRequest'))}
              </p>
              <p className="text-sm text-muted-on-dark mb-8">
                {service.priceOnRequest ? t('priceOnRequestSuffix') : t('priceSuffix')}
              </p>

              {service.includes && service.includes.length > 0 && (
                <ul className="space-y-3 mb-10 flex-1">
                  {service.includes.map((item, idx) => (
                    <li key={idx} className="text-base text-muted-on-dark flex items-start gap-2.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0" style={{ color: '#4A6CF7' }} aria-hidden="true">
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

        <p className="mt-10 text-base text-muted-on-dark max-w-lg">{t('trustNote')}</p>
      </div>
    </MotionSection>
  )
}

export function PricingSection({ services, locale }: PricingSectionProps) {
  return <PricingSectionInner services={services} locale={locale} />
}
