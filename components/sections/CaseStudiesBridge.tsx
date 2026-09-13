/**
 * components/sections/CaseStudiesBridge.tsx — Case studies CTA bridge (homepage).
 *
 * RSC that receives filtered projects (hasCaseStudy=true) and locale from page.tsx.
 * Each card links to /{locale}/work/{slug}. Section hidden when no projects.
 *
 * UI-SPEC: bg-surface-subtle py-16; 3-col grid sm:grid-cols-3 gap-6;
 * each card: bg-surface border-border rounded-sm with hover lift.
 * Text link "Mehr erfahren" / "Read more" in text-accent text-sm.
 * aria-label on each card for screen readers (card has no visible standalone label).
 *
 * IDENT-01: zero raw hex, zero text-gray-* in this file.
 * T-07-08: project title/outcomeNote rendered as escaped JSX text nodes.
 *
 * Source: 07-UI-SPEC.md § Case Studies CTA Bridge; 07-03-PLAN.md Task 1 Step F.
 */
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { MotionSection } from '@/components/ui/MotionSection'
import { urlFor } from '@/lib/sanity/image'
import type { PROJECTS_QUERY_RESULT } from '@/sanity.types'

type Project = PROJECTS_QUERY_RESULT[number]

interface CaseStudiesBridgeProps {
  projects: Project[]
  locale: string
}

export function CaseStudiesBridge({ projects, locale }: CaseStudiesBridgeProps) {
  const t = useTranslations('CaseStudies')

  // Section hidden when no case-study projects exist
  if (!projects || projects.length === 0) return null

  return (
    <MotionSection id="case-studies" className="bg-surface-subtle py-16 px-4 md:px-8 lg:px-16">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-10">
          <p className="text-sm text-secondary uppercase tracking-widest mb-2">
            {t('eyebrow')}
          </p>
          <h2 className="text-4xl font-bold text-primary">{t('heading')}</h2>
        </div>

        {/* Project cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project._id}
              href={`/${locale}/work/${project.slug?.current ?? ''}`}
              aria-label={
                locale === 'de'
                  ? `Fallstudie ${project.title ?? ''} lesen`
                  : `Read case study for ${project.title ?? ''}`
              }
              className="bg-surface border border-border rounded-sm overflow-hidden [transition-duration:var(--duration-standard)] [transition-timing-function:var(--ease-standard)] transition-transform hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              {/* Project image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
                {project.image ? (
                  <Image
                    src={urlFor(project.image).width(600).height(450).fit('crop').auto('format').url()}
                    alt={project.title ?? ''}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                ) : null}
              </div>

              {/* Card body */}
              <div className="p-4">
                <p className="text-base font-semibold text-primary mb-1">{project.title}</p>
                {project.outcomeNote && (
                  <p className="text-sm text-secondary">{project.outcomeNote}</p>
                )}
                <p className="text-sm text-accent mt-2">{t('readMore')}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </MotionSection>
  )
}
