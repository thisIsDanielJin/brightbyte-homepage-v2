/**
 * components/sections/GuaranteeSection.tsx — Guarantee with blue accent background.
 *
 * Deep blue gradient with stripe texture echoing the hero's visual panel.
 * White text on blue creates a strong trust moment between About and FAQ.
 * CSS-only, no WebGL (performance-first per CONVENTIONS).
 */
import { useTranslations } from 'next-intl'
import { MotionSection } from '@/components/ui/MotionSection'

const TICK_ICONS = [
  // Code brackets
  <svg key="code" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-white/70" aria-hidden="true">
    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
  </svg>,
  // Lock open
  <svg key="lock" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-white/70" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </svg>,
  // Shield check
  <svg key="shield" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-white/70" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" />
  </svg>,
]

export function GuaranteeSection() {
  const t = useTranslations('Guarantee')
  const ticks = [t('tick1'), t('tick2'), t('tick3')]

  return (
    <MotionSection id="guarantee" className="relative py-16 md:py-24 overflow-hidden bg-accent">
      {/* Deep gradient base */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, var(--color-accent) 0%, #0F1F6B 60%, #0A1445 100%)',
        }}
      />

      {/* Subtle radial glow for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 20% 40%, rgba(74,108,247,0.25), transparent 60%)',
        }}
      />

      {/* Vertical stripe texture (echoes hero panel) */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          maskImage:
            'repeating-linear-gradient(90deg, black, black 5px, transparent 5px, transparent 11px)',
          WebkitMaskImage:
            'repeating-linear-gradient(90deg, black, black 5px, transparent 5px, transparent 11px)',
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)',
        }}
      />

      <div className="relative px-6 md:px-8 lg:px-12 xl:px-[max(calc((100vw-90rem)/2+3rem),3rem)]">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10 md:gap-16">
          {/* Copy */}
          <div className="max-w-lg">
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-[1.1] tracking-[-0.02em] mb-4">
              {t('heading')}
            </h2>
            <p className="text-lg text-white/70 leading-relaxed text-pretty">
              {t('body')}
            </p>
          </div>

          {/* Trust ticks */}
          <div className="flex flex-col gap-5 md:pt-2">
            {ticks.map((tick, i) => (
              <div key={tick} className="flex items-center gap-3">
                {TICK_ICONS[i]}
                <span className="text-sm font-medium text-white">{tick}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MotionSection>
  )
}
