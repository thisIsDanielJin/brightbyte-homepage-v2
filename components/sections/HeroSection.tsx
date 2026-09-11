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
      className="relative min-h-svh bg-surface"
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

      {/*
        D-08 legibility scrim (UI-SPEC Option B): a token-only `bg-surface` wash
        over the copy region, sitting ABOVE the canvas (z-0 wrapper) and BELOW
        the z-10 text column. No raw hex (bg-surface + v4 opacity modifiers);
        pointer-events-none so it never blocks the CTA.

        - Mobile (< md): the glass is centered + pushed back, so the copy sits over
          dark scene pixels. A near-solid full-bleed `bg-surface/85` band restores
          WCAG AA for headline (#18181B) AND subline (#52525B) across the whole
          full-width column.
        - Desktop (md+): the glass focal mass is right-of-center (~65-70%), so a
          left-anchored gradient that fades to transparent lightens the copy while
          leaving the glass reveal on the right fully intact.
      */}
      <div
        className="absolute inset-0 z-0 bg-surface/90 md:hidden pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute inset-y-0 left-0 z-0 hidden md:block md:w-2/3 bg-gradient-to-r from-surface/95 via-surface/80 to-transparent pointer-events-none"
        aria-hidden="true"
      />

      {/* Text content — relative child, stays above Phase 5 canvas */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 py-32 md:py-0 flex items-center min-h-svh">
        <div className="max-w-[720px]">
          {/* Overline */}
          <p className="text-xs font-medium text-accent uppercase tracking-[0.2em] mb-6 md:mb-8">
            Berlin · Webdesign Studio
          </p>

          {/* Headline — editorial scale, tight leading */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-primary leading-[0.95] tracking-[-0.02em] mb-8 md:mb-10">
            {headlineText}
          </h1>

          {/* Subline + CTA row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <p className="text-base md:text-lg text-secondary leading-[1.6] max-w-[380px]">
              {sublineText}
            </p>
            <a
              href="#contact"
              className="flex-shrink-0 inline-block bg-accent text-surface text-sm font-semibold px-7 py-3.5 rounded-sm hover:bg-accent-hover [transition-duration:150ms] [transition-timing-function:var(--ease-standard)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:scale-[0.98]"
            >
              {t('cta')}
            </a>
          </div>

          {/* Scroll hint */}
          <div className="mt-16 md:mt-20 flex items-center gap-3" aria-hidden="true">
            <div className="w-px h-8 bg-border" />
            <span className="text-xs text-muted uppercase tracking-[0.15em]">{t('scrollHint')}</span>
          </div>
        </div>
      </div>
    </MotionSection>
  )
}
