/**
 * components/sections/AboutSection.tsx — About section, dark surface.
 *
 * Abstract geometric illustration left, text right.
 * No decorative glow, no eyebrow, no stat-line template.
 * Skills as a quiet middot-separated line.
 */
'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { MotionSection } from '@/components/ui/MotionSection'
import type { SITE_SETTINGS_QUERY_RESULT } from '@/sanity.types'

const SKILLS = ['React', 'Next.js', 'TypeScript', 'Node.js', 'Tailwind', 'Figma', 'Sanity', 'Vercel']

/**
 * Abstract geometric illustration: overlapping rectangles in the accent palette.
 * Sits in the photo slot until a real portrait lands in Sanity.
 * Pure SVG, no external dependency, matches the wireframe language.
 */
function AbstractPortrait() {
  return (
    <div
      className="w-[280px] h-[370px] md:w-[300px] md:h-[400px] flex items-center justify-center"
      style={{ background: 'linear-gradient(160deg, #0F0F10 0%, #111114 100%)' }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 240 320" fill="none" className="w-[200px] h-[280px]">
        {/* Large accent rectangle */}
        <rect x="20" y="40" width="140" height="180" fill="var(--color-accent)" opacity="0.15" />
        {/* Medium offset rectangle */}
        <rect x="80" y="100" width="140" height="180" stroke="var(--color-accent)" strokeWidth="1" opacity="0.3" />
        {/* Small solid accent block */}
        <rect x="60" y="160" width="60" height="60" fill="var(--color-accent)" opacity="0.25" />
        {/* Thin horizontal lines */}
        <line x1="20" y1="250" x2="220" y2="250" stroke="white" strokeWidth="0.5" opacity="0.1" />
        <line x1="20" y1="265" x2="160" y2="265" stroke="white" strokeWidth="0.5" opacity="0.1" />
        <line x1="20" y1="280" x2="100" y2="280" stroke="white" strokeWidth="0.5" opacity="0.1" />
        {/* Dot accent */}
        <circle cx="200" cy="60" r="4" fill="var(--color-accent)" opacity="0.4" />
      </svg>
    </div>
  )
}

interface AboutSectionProps {
  settings: SITE_SETTINGS_QUERY_RESULT | null
  locale: string
  aboutPhotoUrl?: string | null
}

export function AboutSection({ settings, aboutPhotoUrl }: AboutSectionProps) {
  const t = useTranslations('About')

  return (
    <MotionSection id="about" className="py-24 md:py-32 bg-surface-dark">
      <div className="px-6 md:px-8 lg:px-12 xl:px-[max(calc((100vw-90rem)/2+3rem),3rem)]">
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-12 md:gap-20 items-center">
          {/* Photo or abstract illustration */}
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
              <AbstractPortrait />
            )}
          </div>

          {/* Text */}
          <div className="flex flex-col">
            <h2 className="text-3xl md:text-4xl font-bold text-on-dark leading-[1.1] tracking-[-0.02em] mb-2">
              {t('name')}
            </h2>
            <p className="text-base text-muted-on-dark mb-8">{t('subline')}</p>
            <p
              className="text-base text-muted-on-dark leading-[1.7] max-w-[520px] text-pretty mb-10"
              data-testid="about-body"
            >
              {t('body')}
            </p>

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
