/**
 * components/sections/AboutSection.tsx — About section, dark surface.
 *
 * Full-width left-aligned text. TechText animation for the skills list,
 * matching the wireframe design-tool aesthetic from the hero.
 * No photo column (until real Sanity photo). Heading carries its own weight.
 *
 * Source: TechText from reactbits.dev (MIT + Commons Clause).
 */
'use client'

import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { MotionSection } from '@/components/ui/MotionSection'
import type { SITE_SETTINGS_QUERY_RESULT } from '@/sanity.types'

/** TechText is a canvas component, must be client-only, no SSR. */
const TechText = dynamic(() => import('@/components/ui/TechText'), { ssr: false })

const SKILLS_TEXT = 'React  Next.js  TypeScript  Node  Tailwind  Figma'

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
        {/* Text content */}
        <div className="max-w-3xl mb-16">
          {/* Optional small photo */}
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
            className="text-lg text-muted-on-dark leading-[1.8] max-w-[600px] text-pretty"
            data-testid="about-body"
          >
            {t('body')}
          </p>
        </div>

        {/* TechText skills display: design-tool aesthetic, interactive */}
        <div className="h-[120px] md:h-[160px] -mx-2">
          <TechText
            text={SKILLS_TEXT}
            fontSize={80}
            fontWeight={700}
            letterSpacing={-0.03}
            color="#F4F4F5"
            accentColor="#4A6CF7"
            reach={160}
            softness={0.6}
            strokeWidth={1.5}
            lineStyle="dashed"
            reveal="letter"
            selection={true}
            labels={true}
            draggable={true}
            sweep={true}
            specks={10}
            speed={0.8}
          />
        </div>
      </div>
    </MotionSection>
  )
}
