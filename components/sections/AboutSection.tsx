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
      className="py-16 px-4 md:px-8 lg:px-16"
    >
      <div className="max-w-5xl mx-auto">
        {/* Section header (eyebrow above the content block) */}
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-secondary uppercase tracking-widest mb-2">
            {t('eyebrow')}
          </p>
          <h2 className="text-4xl font-semibold text-primary">
            {t('heading')}
          </h2>
        </div>

        {/*
          Two-column at 1440px (40% photo / 60% text), stacked at 375px.
          Photo / initials aligned to start (left column); text in flex column.
        */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">

          {/* Photo column — 40% at desktop */}
          <div className="flex-shrink-0 flex justify-center md:w-[40%]">
            {hasPhoto ? (
              /* Real photo — next/image, rounded-full, 1:1 aspect box */
              <div
                className="relative w-[120px] h-[120px] md:w-[160px] md:h-[160px] rounded-full overflow-hidden"
                data-testid="about-photo"
              >
                <Image
                  src={urlFor(settings!.aboutPhoto!)
                    .width(160)
                    .height(160)
                    .fit('crop')
                    .url()}
                  alt="Daniel Jin Wodke"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 120px, 160px"
                />
              </div>
            ) : (
              /* Initials fallback — circular surface-muted, "DJ" centered.
               * role="img" required for aria-label on a non-semantic div (QA-03/WCAG 2). */
              <div
                className="w-[120px] h-[120px] md:w-[160px] md:h-[160px] rounded-full bg-surface-muted flex items-center justify-center flex-shrink-0"
                data-testid="about-initials"
                role="img"
                aria-label="Daniel Jin Wodke"
              >
                <span className="text-2xl font-semibold text-secondary" aria-hidden="true">
                  DJ
                </span>
              </div>
            )}
          </div>

          {/* Text column — 60% at desktop */}
          <div className="md:w-[60%] text-center md:text-left">
            {/* Name heading */}
            <h3 className="text-2xl font-semibold text-primary mb-1">
              {t('name')}
            </h3>

            {/* Solo-studio subline */}
            <p className="text-sm font-medium text-secondary mb-4">
              {t('subline')}
            </p>

            {/* Body — "you work directly with me" framing */}
            <p
              className="text-base text-secondary leading-relaxed"
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
