/**
 * components/seo/SeoPageLayout.tsx — RSC landing layout for /[locale]/s/[slug] (D-06).
 *
 * Five vertical bands (UI-SPEC): Hero → Benefits → FAQ → Trust Metrics → CTA. The
 * shared Header/Footer shell is provided by app/[locale]/layout.tsx (not re-rendered
 * here). Each band is wrapped in MotionSection (whisper-quiet entrance; global
 * prefers-reduced-motion reset applies). Empty bands are omitted entirely (no
 * placeholders) per UI-SPEC state coverage:
 *   - benefits band omitted when benefits.length === 0
 *   - FAQ band omitted when faqs.length === 0
 *   - trust band rendered only when trustMetrics is non-empty
 *   - hero right image column omitted when no /images/seo/{slug|category}.jpg exists
 *     (currently always omitted — public/images/seo/ does not exist)
 *
 * Discipline: named token utilities only — zero raw hex, zero text-gray-*, zero
 * inline styles (IDENT-01 / D-06). All Sanity strings render as escaped JSX text
 * nodes; dangerouslySetInnerHTML is used ONLY for JSON-LD in the route, never here.
 * Structural labels (eyebrows, CTA headings, trust ticks) use a locale ternary —
 * bilingual, no raw German without an EN equivalent (UI-SPEC bilingual discipline).
 *
 * FAQ interactivity lives in the FaqAccordion client sub-component; this layout
 * stays a Server Component.
 *
 * Source: 06-UI-SPEC.md § SeoPageLayout — Layout Specification + Copywriting Contract.
 */
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import Image from 'next/image'
import { MotionSection } from '@/components/ui/MotionSection'
import { FaqAccordion } from '@/components/seo/FaqAccordion'
import type { SEO_PAGE_BY_SLUG_WITH_COUNTERPART_QUERY_RESULT } from '@/sanity.types'

type SeoPage = NonNullable<SEO_PAGE_BY_SLUG_WITH_COUNTERPART_QUERY_RESULT>
type Locale = 'de' | 'en'

// Structural (non-CMS) copy — bilingual pairs (UI-SPEC Copywriting Contract).
const LABELS = {
  benefitsEyebrow: { de: 'So hilft BrightByte', en: 'How BrightByte helps' },
  faqEyebrow: { de: 'Häufige Fragen', en: 'Frequently asked questions' },
  faqHeading: { de: 'Ihre Fragen beantwortet', en: 'Your questions answered' },
  ctaHeading: { de: 'Bereit loszulegen?', en: 'Ready to get started?' },
  ctaBody: {
    de: 'Lassen Sie uns über Ihr Projekt sprechen. Unverbindlich und kostenlos.',
    en: "Let's talk about your project. No commitment, no cost.",
  },
} as const

const TRUST_TICKS: Record<Locale, string[]> = {
  de: ['Festpreis', 'Unverbindlich', 'Antwort in 24h'],
  en: ['Fixed price', 'No obligation', 'Reply in 24h'],
}

const CTA_FALLBACK: Record<Locale, string> = {
  de: 'Projekt besprechen',
  en: 'Discuss your project',
}

// Resolve a slug/category-keyed hero image from public/images/seo/, else null
// (UI-SPEC: omit the right column, never render a broken <img>).
function resolveHeroImage(slug: string, category: string | null): string | null {
  const candidates = [`${slug}.jpg`, category ? `${category}.jpg` : null].filter(
    (c): c is string => c != null,
  )
  for (const file of candidates) {
    if (existsSync(join(process.cwd(), 'public', 'images', 'seo', file))) {
      return `/images/seo/${file}`
    }
  }
  return null
}

const CTA_CLASS =
  'inline-block rounded-sm bg-accent px-6 py-3 text-sm font-medium text-surface transition-colors duration-150 ease-[var(--ease-standard)] hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:scale-[0.98]'

export function SeoPageLayout({
  page,
  locale,
}: {
  page: SeoPage
  locale: Locale
}) {
  const headline = page.heroHeadline ?? page.title ?? ''
  const firstParagraph = (page.heroSubtext ?? '').split('\n\n')[0] ?? ''
  const ctaLabel = page.ctaText ?? CTA_FALLBACK[locale]
  const ctaHref = `/${locale}#contact`

  const benefits = (page.benefits ?? []).filter(
    (b): b is { text: string } => typeof b.text === 'string' && b.text.length > 0,
  )
  const faqs = (page.faqs ?? [])
    .filter(
      (f): f is { question: string; answer: string } =>
        typeof f.question === 'string' && typeof f.answer === 'string',
    )
    .map((f) => ({ question: f.question, answer: f.answer }))
  const trustMetrics = (page.trustMetrics ?? []).filter(
    (m): m is { value: string; label: string } =>
      typeof m.value === 'string' && typeof m.label === 'string',
  )

  const heroImage = resolveHeroImage(page.slug?.current ?? '', page.category)

  return (
    <main>
      {/* ── Band 1: Hero ─────────────────────────────────────────────────── */}
      <MotionSection className="bg-surface px-4 py-24 md:px-8 lg:px-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-[1.2fr_1fr]">
          <div>
            {page.category ? (
              <span className="mb-6 inline-block rounded-full border border-border px-3 py-1 text-sm font-medium uppercase tracking-widest text-secondary">
                {page.category}
              </span>
            ) : null}
            <h1 className="mb-6 whitespace-pre-line text-4xl font-bold leading-[1.1] text-primary md:text-5xl">
              {headline}
            </h1>
            {firstParagraph ? (
              <p className="mb-8 max-w-[520px] text-base leading-[1.6] text-secondary">
                {firstParagraph}
              </p>
            ) : null}
            <a href={ctaHref} className={CTA_CLASS}>
              {ctaLabel}
            </a>
          </div>

          {heroImage ? (
            <div className="relative hidden aspect-[4/3] overflow-hidden rounded-sm lg:block">
              <Image
                src={heroImage}
                alt={headline}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 0px, 40vw"
              />
            </div>
          ) : null}
        </div>
      </MotionSection>

      {/* ── Band 2: Benefits (omitted when empty) ────────────────────────── */}
      {benefits.length > 0 ? (
        <MotionSection className="bg-surface-subtle px-4 py-24 md:px-8 lg:px-16">
          <div className="mx-auto max-w-5xl">
            <p className="mb-8 text-sm font-medium uppercase tracking-widest text-secondary">
              {LABELS.benefitsEyebrow[locale]}
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {benefits.map((b, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 rounded-sm border border-border bg-surface p-6"
                >
                  <span
                    className="mt-0.5 flex-shrink-0 font-medium text-accent"
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                  <span className="text-base leading-[1.5] text-primary">{b.text}</span>
                </div>
              ))}
            </div>
          </div>
        </MotionSection>
      ) : null}

      {/* ── Band 3: FAQ (omitted when empty) ─────────────────────────────── */}
      {faqs.length > 0 ? (
        <MotionSection className="bg-surface px-4 py-24 md:px-8 lg:px-16">
          <div className="mx-auto max-w-3xl">
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-secondary">
              {LABELS.faqEyebrow[locale]}
            </p>
            <h2 className="mb-8 text-4xl font-semibold text-primary">
              {LABELS.faqHeading[locale]}
            </h2>
            <FaqAccordion faqs={faqs} />
          </div>
        </MotionSection>
      ) : null}

      {/* ── Band 4: Trust Metrics (conditional) ──────────────────────────── */}
      {trustMetrics.length > 0 ? (
        <MotionSection className="bg-surface-subtle px-4 py-16 md:px-8 lg:px-16">
          <div className="mx-auto grid max-w-3xl grid-cols-2 gap-8 text-center sm:grid-cols-3">
            {trustMetrics.map((m, i) => (
              <div key={i}>
                <div className="text-4xl font-bold text-primary">{m.value}</div>
                <div className="mt-2 text-sm font-medium text-secondary">{m.label}</div>
              </div>
            ))}
          </div>
        </MotionSection>
      ) : null}

      {/* ── Band 5: CTA strip ────────────────────────────────────────────── */}
      <MotionSection className="bg-surface px-4 py-24 text-center md:px-8 lg:px-16">
        <div className="mx-auto max-w-xl">
          <h2 className="mb-4 text-4xl font-bold text-primary">
            {LABELS.ctaHeading[locale]}
          </h2>
          <p className="mb-8 text-base leading-[1.6] text-secondary">
            {LABELS.ctaBody[locale]}
          </p>
          <a href={ctaHref} className={CTA_CLASS}>
            {ctaLabel}
          </a>
          <div className="mt-6 flex flex-wrap justify-center gap-6">
            {TRUST_TICKS[locale].map((tick) => (
              <span key={tick} className="text-sm text-secondary">
                {tick}
              </span>
            ))}
          </div>
        </div>
      </MotionSection>
    </main>
  )
}
