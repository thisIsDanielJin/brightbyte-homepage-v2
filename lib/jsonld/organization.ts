/**
 * lib/jsonld/organization.ts — ProfessionalService/LocalBusiness JSON-LD emitter (D-05).
 *
 * Builds the site-wide organization LD for the homepage. Type is `ProfessionalService`
 * (schema.org) which is a subtype of LocalBusiness — Google's recommended type for a
 * freelance web design studio. `areaServed` is a `City` node pointing to Berlin; email
 * and postal address are sourced from `siteSettings` (SANITY → getSiteSettings(locale))
 * with safe fallbacks to the D-05 constants so the LD is always non-empty even if CMS
 * fields are blank.
 *
 * T-06-05 (XSS): siteSettings strings enter HTML via `JSON.stringify()` at the call
 * site in app/[locale]/page.tsx — never interpolated raw.
 * T-06-06 (stega): the siteSettings query uses the shared stega:false client
 * (lib/sanity/client.ts); no stega tokens can reach this LD.
 *
 * Source: 06-CONTEXT.md D-05; 06-RESEARCH.md Pattern 4 (JSON-LD in RSC).
 */

// D-05 fallback constants (used when siteSettings field is absent/null).
const D05_EMAIL = 'hello@brightbyte-berlin.com'
const D05_ADDRESS = 'Karl-Marx-Allee 118'
const D05_POSTAL_CODE = '10243'
const D05_LOCALITY = 'Berlin'
const D05_COUNTRY = 'DE'
const D05_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://brightbyte.berlin'

const SITE_NAME = 'BrightByte Berlin'

function inLanguage(locale: 'de' | 'en'): string {
  return locale === 'de' ? 'de-DE' : 'en-US'
}

/**
 * SiteSettings subset used here — intentionally minimal so the function is usable
 * even when siteSettings has other fields the caller doesn't pass.
 */
type SiteSettingsPartial = {
  contactEmail?: string | null
  address?: string | null
} | null | undefined

/**
 * buildLocalBusinessLd — returns a `ProfessionalService` (LocalBusiness subtype)
 * schema.org object for the BrightByte Berlin homepage.
 *
 * @param locale   'de' | 'en' — controls `inLanguage` and the siteUrl locale.
 * @param settings SiteSettings partial — contactEmail and address from Sanity.
 * @param baseUrl  Explicit base URL override (defaults to NEXT_PUBLIC_BASE_URL).
 */
export function buildLocalBusinessLd(
  locale: 'de' | 'en',
  settings: SiteSettingsPartial,
  baseUrl: string = D05_BASE_URL,
) {
  const email = settings?.contactEmail ?? D05_EMAIL

  // Parse address from Sanity if available; Sanity stores it as a single string,
  // e.g. "Karl-Marx-Allee 118, 10243 Berlin". Fall back to D-05 constants.
  let streetAddress = D05_ADDRESS
  let postalCode = D05_POSTAL_CODE
  let addressLocality = D05_LOCALITY
  if (settings?.address) {
    // Best-effort parse: "street, postalCode city" → split on first comma.
    const parts = settings.address.split(',').map((s) => s.trim())
    if (parts.length >= 2) {
      streetAddress = parts[0]
      // Second part: "10243 Berlin"
      const rest = parts.slice(1).join(' ').trim()
      const postalMatch = rest.match(/^(\d{5})\s+(.+)$/)
      if (postalMatch) {
        postalCode = postalMatch[1]
        addressLocality = postalMatch[2]
      }
    } else {
      streetAddress = settings.address
    }
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: SITE_NAME,
    url: baseUrl,
    inLanguage: inLanguage(locale),
    areaServed: {
      '@type': 'City',
      name: 'Berlin',
    },
    email,
    address: {
      '@type': 'PostalAddress',
      streetAddress,
      postalCode,
      addressLocality,
      addressCountry: D05_COUNTRY,
    },
    founder: {
      '@type': 'Person',
      name: 'Daniel Jin Wodke',
    },
  }
}
