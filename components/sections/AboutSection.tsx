/**
 * components/sections/AboutSection.tsx — About section (SEC-06)
 *
 * RSC: receives siteSettings from page-level Promise.all fetch (Pattern 2).
 * Always renders (not data-gated) — About is structural, not conditional.
 *
 * Photo handling (Flag SEC-06 — deferred real photo):
 *   - With aboutPhoto → next/image rounded-full, 120px/160px in a 1:1 aspect box
 *   - Without aboutPhoto → circular bg-surface-muted with "DJ" initials
 *     text-2xl font-semibold text-secondary (fallback mark, ship-now state)
 *
 * Layout:
 *   375px: photo/fallback above text (column, centered)
 *   1440px: 40/60 two-column (photo left, text right)
 *
 * Body text from siteSettings with next-intl fallback (same content).
 * No social feed links (anti-feature per PROJECT.md).
 * IDENT-01: zero raw hex, zero text-gray-* — all via @theme token utilities.
 *
 * Source: 04-UI-SPEC.md About Section; 04-RESEARCH.md Flag SEC-06.
 */
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { MotionSection } from '@/components/ui/MotionSection'
import { urlFor } from '@/lib/sanity/image'
import type { SITE_SETTINGS_QUERY_RESULT } from '@/sanity.types'

interface AboutSectionProps {
  settings: SITE_SETTINGS_QUERY_RESULT | null
  locale: string
}

function AboutSectionInner({ settings }: AboutSectionProps) {
  const t = useTranslations('About')

  const hasPhoto = !!(settings?.aboutPhoto?.asset)
  const body = t('body')

  return (
    <MotionSection
      id="about"
      className="py-24 md:py-32 px-6 md:px-12 lg:px-16 bg-surface"
    >
      <div className="max-w-6xl mx-auto">
        {/* Two-column: photo left, text right — stacked mobile */}
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-12 md:gap-20 items-start">

          {/* Photo column */}
          <div className="flex-shrink-0">
            {hasPhoto ? (
              <div
                className="relative w-[160px] h-[200px] md:w-[200px] md:h-[260px] overflow-hidden"
                data-testid="about-photo"
              >
                <Image
                  src={urlFor(settings!.aboutPhoto!)
                    .width(400)
                    .height(520)
                    .fit('crop')
                    .url()}
                  alt="Daniel Jin Wodke"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 160px, 200px"
                />
              </div>
            ) : (
              <div
                className="w-[160px] h-[200px] md:w-[200px] md:h-[260px] bg-surface-muted border border-border flex items-center justify-center"
                data-testid="about-initials"
                role="img"
                aria-label="Daniel Jin Wodke"
              >
                <span className="text-3xl font-bold text-muted" aria-hidden="true">DJ</span>
              </div>
            )}
          </div>

          {/* Text column */}
          <div className="flex flex-col justify-center">
            <p className="text-xs font-medium text-accent uppercase tracking-[0.2em] mb-6">
              {t('eyebrow')}
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-primary leading-[1.05] tracking-[-0.02em] mb-2 text-balance">
              {t('name')}
            </h2>
            <p className="text-sm font-medium text-secondary mb-8">
              {t('subline')}
            </p>
            <p
              className="text-base md:text-lg text-secondary leading-[1.7] max-w-[520px] text-pretty"
              data-testid="about-body"
            >
              {body}
            </p>
          </div>
        </div>
      </div>
    </MotionSection>
  )
}

export function AboutSection({ settings, locale }: AboutSectionProps) {
  return <AboutSectionInner settings={settings} locale={locale} />
}
