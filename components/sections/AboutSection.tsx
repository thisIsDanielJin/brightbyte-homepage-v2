/**
 * components/sections/AboutSection.tsx — About section, dark surface, prominent.
 *
 * Dark background creates a strong visual break between Projects and Pricing.
 * Larger photo, skills as a quiet inline list, stat line for credibility.
 * Subtle blue radial glow ties into the hero and guarantee accent color.
 */
'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { MotionSection } from '@/components/ui/MotionSection'
import type { SITE_SETTINGS_QUERY_RESULT } from '@/sanity.types'

const SKILLS = ['React', 'Next.js', 'TypeScript', 'Node.js', 'Tailwind', 'Figma', 'Sanity', 'Vercel']

interface AboutSectionProps {
  settings: SITE_SETTINGS_QUERY_RESULT | null
  locale: string
  aboutPhotoUrl?: string | null
}

export function AboutSection({ settings, aboutPhotoUrl }: AboutSectionProps) {
  const t = useTranslations('About')
  const hasPhoto = !!aboutPhotoUrl

  return (
    <MotionSection id="about" className="relative py-24 md:py-32 bg-surface-dark overflow-hidden">
      {/* Atmospheric blue glow behind the photo area */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 50% 70% at 15% 50%, rgba(28,57,187,0.12), transparent 70%)',
        }}
      />

      <div className="relative px-6 md:px-8 lg:px-12 xl:px-[max(calc((100vw-90rem)/2+3rem),3rem)]">
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-12 md:gap-20 items-start">
          {/* Photo - larger for visual weight */}
          <div className="flex-shrink-0">
            {hasPhoto ? (
              <div
                className="relative w-[280px] h-[370px] md:w-[320px] md:h-[420px] overflow-hidden"
                data-testid="about-photo"
              >
                <Image
                  src={aboutPhotoUrl!}
                  alt="Daniel Jin Wodke"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 280px, 320px"
                />
              </div>
            ) : (
              <div
                className="w-[280px] h-[370px] md:w-[320px] md:h-[420px] bg-surface-muted/10 flex items-center justify-center"
                data-testid="about-initials"
                role="img"
                aria-label="Daniel Jin Wodke"
              >
                <span className="text-5xl font-bold text-on-dark/20" aria-hidden="true">
                  DJ
                </span>
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

            {/* Skills strip */}
            <div className="flex flex-wrap gap-x-2 gap-y-2">
              {SKILLS.map((skill, i) => (
                <span key={skill} className="text-sm text-muted-on-dark">
                  {skill}
                  {i < SKILLS.length - 1 && (
                    <span className="ml-2 text-muted-on-dark/30" aria-hidden="true">
                      /
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MotionSection>
  )
}
