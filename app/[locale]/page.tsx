/**
 * app/[locale]/page.tsx — Home page: all content sections wired to Sanity.
 *
 * Phase 4 Plan 02: extends the tracer (HeroSection) with the five content sections
 * in D-05 DOM order: Hero → Services → Pricing → Work → Testimonials → About → (Contact: 04-03).
 *
 * Phase 6 Plan 02: adds ProfessionalService/LocalBusiness JSON-LD (D-05 SEO-02).
 * The LD is sourced from getSiteSettings(locale) with D-05 constant fallbacks.
 * JSON.stringify is the ONLY serialization sink (T-06-05 — no raw CMS string in HTML).
 *
 * Single page-level Promise.all fetches all Sanity data (Pattern 2 — no per-section fetch).
 * Sections receive data as props; RSC sections have no client-side fetch.
 *
 * D-09 invariant: locale from awaited params (URL segment only, never client state).
 * IDENT-01: zero raw hex, zero text-gray-* in this file.
 * T-04-04 mitigation: prices rendered only from Sanity — no hardcoded figures.
 *
 * Sources:
 *   04-RESEARCH.md Pattern 2 (page-level Sanity fetch); 04-UI-SPEC.md layout contract
 *   04-01-SUMMARY.md (tracer pattern established here)
 *   06-CONTEXT.md D-05 (ProfessionalService JSON-LD)
 */
import type { Metadata } from 'next'
import { buildHreflangAlternates, BASE_URL } from '@/lib/i18n/metadata'
import { getSiteSettings, getServices, getProjects, getTestimonials } from '@/lib/sanity/queries'
import { buildLocalBusinessLd } from '@/lib/jsonld/organization'
import { HeroSection } from '@/components/sections/HeroSection'
import { ServicesSection } from '@/components/sections/ServicesSection'
import { PricingSection } from '@/components/sections/PricingSection'
import { WorkSection } from '@/components/sections/WorkSection'
import { CaseStudiesBridge } from '@/components/sections/CaseStudiesBridge'
import { TestimonialsSection } from '@/components/sections/TestimonialsSection'
import { ProcessSection } from '@/components/sections/ProcessSection'
import { GuaranteeSection } from '@/components/sections/GuaranteeSection'
import { FaqSection } from '@/components/sections/FaqSection'
import { AboutSection } from '@/components/sections/AboutSection'
import { ContactSection } from '@/components/sections/ContactSection'

type PageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params

  const titles: Record<string, string> = {
    de: 'BrightByte Berlin — Webdesign für kleine Unternehmen',
    en: 'BrightByte Berlin — Web Design for Small Businesses',
  }
  const descriptions: Record<string, string> = {
    de: 'Professionelles Webdesign für kleine Unternehmen in Berlin. Faire Preise, schnelle Lieferung.',
    en: 'Professional web design for small businesses in Berlin. Fair prices, fast delivery.',
  }

  return {
    title: titles[locale] ?? titles.de,
    description: descriptions[locale] ?? descriptions.de,
    alternates: {
      ...buildHreflangAlternates('/'),
      canonical: `${BASE_URL}/${locale}`, // WR-01: per-locale canonical
    },
  }
}

export default async function HomePage({ params }: PageProps) {
  // Locale from URL segment only (D-09: never client state).
  // Next.js 16 requires awaiting params (async params API).
  const { locale } = await params

  // Single page-level Promise.all — Pattern 2: one fetch waterfall, all sections get props.
  // stega:false lives on the client (lib/sanity/client.ts); never added here.
  const [settings, services, projects, testimonials] = await Promise.all([
    getSiteSettings(locale),
    getServices(locale),
    getProjects(locale),
    getTestimonials(locale),
  ])

  // D-05 / SEO-02: ProfessionalService/LocalBusiness JSON-LD for the homepage.
  // JSON.stringify is the ONLY serialization sink (T-06-05 — no raw CMS string in HTML).
  const safeLocale: 'de' | 'en' = locale === 'en' ? 'en' : 'de'
  const localBusinessLd = buildLocalBusinessLd(safeLocale, settings, BASE_URL)

  // Filter projects that have a case study page for the CaseStudiesBridge section.
  const projectsWithCaseStudy = (projects ?? []).filter(
    (p): p is typeof p & { hasCaseStudy: true } => !!p.hasCaseStudy,
  )

  // Filter faqs — only items with both question and answer populated.
  const validFaqs = (settings?.faqs ?? []).filter(
    (f): f is { question: string; answer: string } =>
      typeof f?.question === 'string' && typeof f?.answer === 'string',
  )

  return (
    <>
      {/* SEO-02 / D-05: ProfessionalService/LocalBusiness JSON-LD — build-time, stega:false */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessLd) }}
      />
      <main>
        {/* D-05 section order (Phase 7 extended):
            Hero → Services → Pricing → Work → CaseStudiesBridge → Testimonials
            → Process → Guarantee → FAQ → About → Contact */}

        {/* SEC-01 — Hero: static backdrop, Sanity copy (Phase 5 swaps backdrop for R3F canvas) */}
        <HeroSection
          headline={settings?.heroHeadline}
          subline={settings?.heroSubline}
        />

        {/* SEC-02 — Services: 1-col mobile / 2-col desktop, hidden when 0 */}
        <ServicesSection services={services} locale={locale} />

        {/* SEC-03 — Pricing: from Sanity price object only, never hardcoded (T-04-04) */}
        <PricingSection services={services} locale={locale} />

        {/* SEC-04 — Work grid: images + outcome notes, hover lift, empty state */}
        <WorkSection projects={projects} locale={locale} />

        {/* SEC-08 — Case Studies Bridge: cards linking to case study pages (hidden when 0) */}
        {projectsWithCaseStudy.length > 0 && (
          <CaseStudiesBridge projects={projectsWithCaseStudy} locale={locale} />
        )}

        {/* SEC-05 — Testimonials: metric as own field above quote */}
        <TestimonialsSection testimonials={testimonials} locale={locale} />

        {/* SEC-09 — Process: 3-step static section (message dictionary copy) */}
        <ProcessSection />

        {/* SEC-10 — Guarantee: trust strip, static (message dictionary copy) */}
        <GuaranteeSection />

        {/* SEC-11 — FAQ: accordion from siteSettings.faqs[], hidden when empty */}
        {validFaqs.length > 0 && <FaqSection faqs={validFaqs} />}

        {/* SEC-06 — About: photo or DJ initials fallback */}
        <AboutSection settings={settings} locale={locale} />

        {/*
          SEC-07 — Contact form (Plan 04-03): the ONLY client island of Phase 4.
          Route Handler + Resend + Zod, mounted as the FINAL section (D-05 order, after About).
        */}
        <ContactSection />
      </main>
    </>
  )
}
