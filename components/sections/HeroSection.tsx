/**
 * components/sections/HeroSection.tsx — Hero section (D-06 Phase-5 swap container).
 *
 * The CLS-zero swap container: `<section id="hero" className="relative min-h-svh flex items-center">`.
 * Phase 5 mounts an absolute-inset R3F Canvas (<HeroCanvas />) OVER the static CSS
 * gradient backdrop; the gradient (.hero-backdrop) is the always-painted LCP element
 * and the reduced-motion / no-WebGL fallback (D-06, D-10, D-11).
 *
 * TYPOGRAPHY (UI-SPEC):
 *   - Headline: text-4xl md:text-5xl font-bold text-primary
 *   - Subline: text-base text-secondary max-w-[560px]
 *   - CTA: bg-accent text-surface, href="#contact"
 *
 * CONTENT: headline/subline from Sanity siteSettings (D-07). If null, next-intl fallback renders.
 * IDENT-01: zero raw hex, zero text-gray-*, zero inline styles — all via @theme token utilities.
 * SEC-11/D-14: wrapped in MotionSection for whisper-quiet entrance fade.
 *
 * 'use client' required for useTranslations (i18n fallback copy) and MotionSection.
 *
 * Source: 04-UI-SPEC.md Hero Shell; 04-RESEARCH.md Pattern 3.
 */
'use client'

import { useTranslations } from 'next-intl'
import { MotionSection } from '@/components/ui/MotionSection'
import { HeroCanvas } from '@/components/hero/HeroCanvas'

interface HeroSectionProps {
  headline?: string | null
  subline?: string | null
}

export function HeroSection({ headline, subline }: HeroSectionProps) {
  const t = useTranslations('Hero')

  // Use Sanity copy when available; fall back to next-intl messages (never empty)
  const headlineText = headline ?? t('headline')
  const sublineText = subline ?? t('subline')

  return (
    <MotionSection
      id="hero"
      className="relative min-h-svh flex items-center bg-surface"
    >
      {/*
        Phase 5 backdrop swap (D-06, D-10, D-11):
        - HeroFallback (.hero-backdrop radial gradient) is ALWAYS painted first —
          it is the LCP element and is never removed (guarantees CLS = 0).
        - <HeroCanvas /> mounts the R3F Canvas OVER it (ssr:false dynamic import),
          fading in once ready; under reduced-motion or no-WebGL it early-returns
          the same gradient, so the fallback is the single source of visual truth.
        No inline styles, no raw hex here (IDENT-01). Text column below stays z-10.
      */}
      <div className="absolute inset-0 hero-backdrop" aria-hidden="true" />
      <HeroCanvas />

      {/* Text content — relative child, stays above Phase 5 canvas */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 py-32">
        <div className="max-w-[640px] md:max-w-[50%]">
          <h1 className="text-4xl md:text-5xl font-bold text-primary leading-[1.1] mb-8">
            {headlineText}
          </h1>
          <p className="text-base text-secondary leading-[1.6] max-w-[560px] mb-10">
            {sublineText}
          </p>
          <a
            href="#contact"
            className="inline-block bg-accent text-surface text-sm font-medium px-6 py-3 rounded-sm hover:bg-accent-hover [transition-duration:150ms] [transition-timing-function:var(--ease-standard)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            {t('cta')}
          </a>
        </div>
      </div>
    </MotionSection>
  )
}
