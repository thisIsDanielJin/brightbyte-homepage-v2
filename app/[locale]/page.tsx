/**
 * app/[locale]/page.tsx — Home page: all content sections wired to Sanity.
 *
 * Phase 4 Plan 02: extends the tracer (HeroSection) with the five content sections
 * in D-05 DOM order: Hero → Services → Pricing → Work → Testimonials → About → (Contact: 04-03).
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
 */
import type { Metadata } from 'next'
import { buildHreflangAlternates, BASE_URL } from '@/lib/i18n/metadata'
import { getSiteSettings, getServices, getProjects, getTestimonials } from '@/lib/sanity/queries'
import { HeroSection } from '@/components/sections/HeroSection'
import { ServicesSection } from '@/components/sections/ServicesSection'
import { PricingSection } from '@/components/sections/PricingSection'
import { WorkSection } from '@/components/sections/WorkSection'
import { TestimonialsSection } from '@/components/sections/TestimonialsSection'
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

  return (
    <main>
      {/* D-05 section order: Hero → Services → Pricing → Work → Testimonials → About → Contact */}

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

      {/* SEC-05 — Testimonials: metric as own field above quote */}
      <TestimonialsSection testimonials={testimonials} locale={locale} />

      {/* SEC-06 — About: photo or DJ initials fallback */}
      <AboutSection settings={settings} locale={locale} />

      {/*
        SEC-07 — Contact form (Plan 04-03): the ONLY client island of Phase 4.
        Route Handler + Resend + Zod, mounted as the FINAL section (D-05 order, after About).
      */}
      <ContactSection />
    </main>
  )
}
