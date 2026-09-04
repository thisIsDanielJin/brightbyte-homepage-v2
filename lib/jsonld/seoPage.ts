/**
 * lib/jsonld/seoPage.ts — pure-TS JSON-LD emitter functions for SEO pages (D-05).
 *
 * These build plain schema.org objects; the route serializes each via
 * `JSON.stringify()` into a `<script type="application/ld+json">` tag. Keeping
 * them JSX-free means they typecheck and unit-test in isolation and are reusable
 * from the sitemap/route without pulling React.
 *
 * T-06-01 (XSS): the ONLY sink is `JSON.stringify(...)` inside
 * dangerouslySetInnerHTML at the call site. JSON.stringify escapes so a
 * `</script>` inside a CMS string cannot break out of the script tag. No user
 * input reaches this path (build-time CMS content only, V5). Never interpolate a
 * raw CMS string into HTML elsewhere.
 *
 * Structural shapes ported from v1 (daniel-jin-studio-homepage
 * components/seo/SeoPageJsonLd.tsx): WebPage + FAQPage + BreadcrumbList.
 * Localized via inLanguage (de-DE | en-US). Source: 06-RESEARCH.md § Pattern 4.
 */

const SITE_NAME = 'BrightByte Berlin'

// Category → breadcrumb label, per locale (v1 used EN-only; we localize for D-04).
const CATEGORY_LABELS: Record<'de' | 'en', Record<string, string>> = {
  de: {
    service: 'Leistungen',
    industry: 'Branchen',
    need: 'Lösungen',
    location: 'Standorte',
  },
  en: {
    service: 'Services',
    industry: 'Industries',
    need: 'Solutions',
    location: 'Locations',
  },
}

const HOME_LABEL: Record<'de' | 'en', string> = { de: 'Startseite', en: 'Home' }

function inLanguage(locale: 'de' | 'en'): string {
  return locale === 'de' ? 'de-DE' : 'en-US'
}

/**
 * WebPage node. `url` is the absolute page URL; `baseUrl` the site origin.
 * `provider` is a ProfessionalService serving Berlin — mirrors v1.
 */
export function buildWebPageLd(
  title: string,
  description: string,
  url: string,
  locale: 'de' | 'en',
  baseUrl: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url,
    inLanguage: inLanguage(locale),
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: baseUrl,
    },
    provider: {
      '@type': 'ProfessionalService',
      name: SITE_NAME,
      url: baseUrl,
      areaServed: { '@type': 'City', name: 'Berlin' },
    },
  }
}

/**
 * FAQPage node. Each faq maps to a Question with a plain-string acceptedAnswer.text
 * (Pitfall 3 — the schema stores answer as `type: 'text'`, never Portable Text).
 */
export function buildFaqPageLd(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

/**
 * BreadcrumbList node: Home → category → this page. `pageUrl` is absolute;
 * `baseUrl` the site origin; `localeHome` the locale-prefixed home URL used for
 * the Home + category crumbs so breadcrumbs stay within the current locale.
 */
export function buildBreadcrumbLd(
  pageTitle: string,
  pageUrl: string,
  category: string,
  locale: 'de' | 'en',
  baseUrl: string,
  localeHome: string,
) {
  const categoryLabel = CATEGORY_LABELS[locale][category] ?? category
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: HOME_LABEL[locale],
        item: localeHome,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: categoryLabel,
        item: `${localeHome}#services`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        // v1 stripped a " | " suffix from the title for the crumb label.
        name: pageTitle.split(' | ')[0],
        item: pageUrl,
      },
    ],
  }
}

// baseUrl re-exported convenience is intentionally omitted; callers pass BASE_URL
// from lib/i18n/metadata.ts to keep a single source of truth for the origin.
