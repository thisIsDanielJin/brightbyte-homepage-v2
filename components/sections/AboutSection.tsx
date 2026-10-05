/**
 * components/sections/AboutSection.tsx — About section, dark surface.
 *
 * Dark background between Projects and Pricing.
 * Photo left (stock fallback until real photo in Sanity), text right.
 * No decorative glow, no eyebrow. Heading carries its own weight.
 */
'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { MotionSection } from '@/components/ui/MotionSection'
import type { SITE_SETTINGS_QUERY_RESULT } from '@/sanity.types'

const SKILLS = ['React', 'Next.js', 'TypeScript', 'Node.js', 'Tailwind', 'Figma', 'Sanity', 'Vercel']

/** Stock headshot placeholder until a real photo lands in Sanity. */
const STOCK_PHOTO =
  'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=640&h=840&fit=crop'

interface AboutSectionProps {
  settings: SITE_SETTINGS_QUERY_RESULT | null
  locale: string
  aboutPhotoUrl?: string | null
}

export function AboutSection({ settings, aboutPhotoUrl }: AboutSectionProps) {
  const t = useTranslations('About')
  const photoUrl = aboutPhotoUrl ?? STOCK_PHOTO

  return (
    <MotionSection id="about" className="py-24 md:py-32 bg-surface-dark">
      <div className="px-6 md:px-8 lg:px-12 xl:px-[max(calc((100vw-90rem)/2+3rem),3rem)]">
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-12 md:gap-20 items-start">
          {/* Photo */}
          <div className="flex-shrink-0">
            {aboutPhotoUrl ? (
              <div
                className="relative w-[280px] h-[370px] md:w-[300px] md:h-[400px] overflow-hidden"
                data-testid="about-photo"
              >
                <Image
                  src={aboutPhotoUrl}
                  alt="Daniel Jin Wodke"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 280px, 300px"
                  style={{
                    outline: '1px solid rgba(255,255,255,0.1)',
                    outlineOffset: '-1px',
                  }}
                />
              </div>
            ) : (
              <div
                className="relative w-[280px] h-[370px] md:w-[300px] md:h-[400px] overflow-hidden"
                data-testid="about-photo-stock"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={STOCK_PHOTO}
                  alt="Daniel Jin Wodke"
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                  style={{
                    outline: '1px solid rgba(255,255,255,0.1)',
                    outlineOffset: '-1px',
                  }}
                />
              </div>
            )}
          </div>

          {/* Text */}
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl font-bold text-on-dark leading-[1.1] tracking-[-0.02em] mb-2">
              {t('name')}
            </h2>
            <p className="text-base text-muted-on-dark mb-8">{t('subline')}</p>
            <p
              className="text-base text-muted-on-dark leading-[1.7] max-w-[520px] text-pretty mb-8"
              data-testid="about-body"
            >
              {t('body')}
            </p>

            {/* Stat line */}
            <p className="text-sm font-medium text-on-dark mb-8">{t('stat')}</p>

            {/* Skills */}
            <p className="text-sm text-muted-on-dark">
              {SKILLS.join(' \u00B7 ')}
            </p>
          </div>
        </div>
      </div>
    </MotionSection>
  )
}
