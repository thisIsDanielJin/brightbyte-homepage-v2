/**
 * components/sections/AboutSection.tsx — About section, dark surface.
 *
 * Full-width centered layout. No photo column, no illustration.
 * The text IS the section. Name as heading, subline, body copy, skills.
 * Craft-floor: heading carries its own weight, no decoration, no metric template.
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

  return (
    <MotionSection id="about" className="py-24 md:py-32 bg-surface-dark">
      <div className="px-6 md:px-8 lg:px-12 xl:px-[max(calc((100vw-90rem)/2+3rem),3rem)]">
        <div className="max-w-3xl">
          {/* Optional photo: inline, not a layout column */}
          {aboutPhotoUrl && (
            <div className="relative w-20 h-20 mb-8 overflow-hidden">
              <Image
                src={aboutPhotoUrl}
                alt="Daniel Jin Wodke"
                fill
                className="object-cover"
                sizes="80px"
                style={{
                  outline: '1px solid rgba(255,255,255,0.1)',
                  outlineOffset: '-1px',
                }}
              />
            </div>
          )}

          <h2 className="text-3xl md:text-4xl font-bold text-on-dark leading-[1.1] tracking-[-0.02em] mb-2">
            {t('name')}
          </h2>
          <p className="text-base text-muted-on-dark mb-10">{t('subline')}</p>

          <p
            className="text-lg text-muted-on-dark leading-[1.8] max-w-[600px] text-pretty mb-12"
            data-testid="about-body"
          >
            {t('body')}
          </p>

          {/* Skills as a quiet line */}
          <p className="text-sm text-muted-on-dark/70">
            {SKILLS.join(' \u00B7 ')}
          </p>
        </div>
      </div>
    </MotionSection>
  )
}
