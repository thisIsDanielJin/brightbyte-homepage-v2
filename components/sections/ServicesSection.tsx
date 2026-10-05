/**
 * components/sections/ServicesSection.tsx — Services with icons, gap-px grid.
 *
 * Eyebrow label, gap-px border grid (graphql.org style).
 * Each card gets a clean 24x24 stroke icon matching text weight (1.5px).
 * Icons use currentColor and accent color.
 *
 * better-ui: icon stroke matches text weight (1.5px for regular body).
 * impeccable: every card is authored, not templated.
 */
'use client'

import { useTranslations } from 'next-intl'
import { MotionSection } from '@/components/ui/MotionSection'
import type { SERVICES_QUERY_RESULT } from '@/sanity.types'

/* ── Service icons: 24x24, 1.5px stroke, currentColor ── */
const SERVICE_ICONS: Record<string, React.ReactNode> = {
  frontend: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8" /><path d="M12 17v4" />
    </svg>
  ),
  backend: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="8" rx="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" />
      <circle cx="6" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="6" cy="18" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  ai: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2v4" /><path d="M12 18v4" />
      <path d="m4.93 4.93 2.83 2.83" /><path d="m16.24 16.24 2.83 2.83" />
      <path d="M2 12h4" /><path d="M18 12h4" />
      <path d="m4.93 19.07 2.83-2.83" /><path d="m16.24 7.76 2.83-2.83" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  ),
  design: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
    </svg>
  ),
  landing: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  ),
  fullstack: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M12 12h.01" />
      <path d="M17 12h.01" />
      <path d="M7 12h.01" />
    </svg>
  ),
}

const SERVICE_KEYS = ['frontend', 'backend', 'ai', 'design', 'landing', 'fullstack'] as const

interface ServicesSectionProps {
  services: SERVICES_QUERY_RESULT
  locale: string
}

function ServicesSectionInner({ services, locale }: ServicesSectionProps) {
  const t = useTranslations('Services')

  const serviceCards = SERVICE_KEYS.map((key) => ({
    key,
    title: t(`card_${key}_title`),
    description: t(`card_${key}_desc`),
    icon: SERVICE_ICONS[key],
  }))

  return (
    <MotionSection id="services" className="py-24 md:py-32 bg-surface">
      <div className="px-6 md:px-8 lg:px-12 xl:px-[max(calc((100vw-90rem)/2+3rem),3rem)]">
        {/* Eyebrow + heading */}
        <div className="max-w-2xl mb-16 md:mb-20">
          <p className="text-xs font-medium uppercase tracking-widest text-accent mb-4">
            {t('eyebrow')}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-primary leading-[1.1] tracking-[-0.02em]">
            {t('heading')}
          </h2>
        </div>

        {/* Services grid: gap-px trick for 1px borders between items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {serviceCards.map((card) => (
            <div
              key={card.key}
              className="bg-surface p-8 lg:p-10 flex flex-col"
              data-testid="service-card"
            >
              {/* Icon */}
              <div className="text-accent mb-5">
                {card.icon}
              </div>
              <h3
                className="text-lg font-semibold text-primary leading-snug mb-3"
                data-testid="service-title"
              >
                {card.title}
              </h3>
              <p className="text-base text-secondary leading-relaxed text-pretty max-w-[42ch]">
                {card.description}
              </p>
            </div>
          ))}
        </div>

        {/* Divider + CTA */}
        <div className="mt-16 md:mt-20 pt-10 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <p className="text-sm text-muted">
            {t('ctaBlurb')}
          </p>
          <a
            href="#contact"
            className="inline-flex items-center justify-center bg-primary text-surface text-sm font-medium h-10 px-6 hover:bg-primary/85 [transition-duration:150ms] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
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
