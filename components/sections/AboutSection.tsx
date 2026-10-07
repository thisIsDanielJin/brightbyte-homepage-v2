/**
 * components/sections/AboutSection.tsx — About section, dark surface.
 *
 * Two-column layout: text left, tech stack logo grid right.
 * Logo grid uses gap-px borders matching the services pattern.
 * Each cell: inline SVG icon (16px) + tech name.
 */
'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { MotionSection } from '@/components/ui/MotionSection'
import type { SITE_SETTINGS_QUERY_RESULT } from '@/sanity.types'

/** Tech stack with minimal inline SVG logos. */
import { SiReact, SiNextdotjs, SiTypescript, SiNodedotjs, SiTailwindcss, SiFigma, SiSanity, SiVercel } from 'react-icons/si'

const TECH_STACK = [
  { name: 'React', icon: SiReact },
  { name: 'Next.js', icon: SiNextdotjs },
  { name: 'TypeScript', icon: SiTypescript },
  { name: 'Node.js', icon: SiNodedotjs },
  { name: 'Tailwind', icon: SiTailwindcss },
  { name: 'Figma', icon: SiFigma },
  { name: 'Sanity', icon: SiSanity },
  { name: 'Vercel', icon: SiVercel },
]

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
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-16 lg:gap-24 items-start">
          {/* Left: text content */}
          <div className="max-w-xl">
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
              className="text-lg text-muted-on-dark leading-[1.8] text-pretty"
              data-testid="about-body"
            >
              {t('body')}
            </p>
          </div>

          {/* Right: tech stack */}
          <div className="w-full lg:w-[420px]">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-on-dark/60 mb-5 font-medium">Tech Stack</p>
            <div className="grid grid-cols-4 gap-px bg-white/[0.08]">
              {TECH_STACK.map((tech) => {
                const Icon = tech.icon
                return (
                  <div
                    key={tech.name}
                    className="group flex flex-col items-center justify-center gap-3 py-6 bg-surface-dark hover:bg-white/[0.08] transition-colors duration-200 cursor-default"
                  >
                    <Icon className="w-8 h-8 text-on-dark/60 group-hover:text-on-dark transition-colors duration-200" aria-hidden="true" />
                    <span className="text-xs text-on-dark/50 group-hover:text-on-dark/80 transition-colors duration-200 font-medium">{tech.name}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </MotionSection>
  )
}
