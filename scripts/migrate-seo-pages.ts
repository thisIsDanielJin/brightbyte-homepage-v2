/**
 * scripts/migrate-seo-pages.ts — one-off NDJSON generator for the 25 bilingual
 * SEO pages (D-07), run with `npx tsx scripts/migrate-seo-pages.ts`.
 *
 * Source of content (D-02): v1's human-written seoPages array at
 * ~/Documents/daniel-jin-studio-homepage/data/seo-pages.ts. EN document content is
 * ported from v1's existing English fields (titleEn, metaDescriptionEn,
 * heroHeadlineEn, heroSubtextEn, faqs[].qEn/aEn, benefits[].textEn, ctaTextEn) —
 * NO fresh EN copy is authored here.
 *
 * D-03 (ONE-WAY DOOR): the EN slugs below are the user-APPROVED map (25 entries,
 * approved verbatim, no edits). DE slugs are v1-verbatim (Pitfall 7). The script
 * THROWS if any v1 slug lacks an EN_SLUGS entry — you cannot silently publish an
 * un-approved EN URL.
 *
 * Output: content/seo-pages.ndjson — for each v1 entry:
 *   - a DE doc   `seoPage.<deSlug>.de`     (language 'de', slug = deSlug verbatim)
 *   - an EN doc  `seoPage.<deSlug>.en`     (language 'en', slug = EN_SLUGS[deSlug])
 *   - a link     `translation.metadata.seoPage.<deSlug>`
 *                (schemaTypes ['seoPage'] — Pitfall 6; translations de/en refs)
 * = 50 docs + 25 links. Array items carry `_key: String(index)` (Pitfall 5).
 * trustMetrics is omitted entirely (no v1 entry populates it).
 *
 * IMPORT is a SEPARATE, explicit step (NOT run by this script) — the tracer imports
 * only the webentwickler-berlin pair; see the run log / PLAN Task 3.
 *
 * Source: 06-RESEARCH.md § Pattern 7 (NDJSON shapes), § Code Examples.
 */
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { homedir } from 'node:os'
import { pathToFileURL } from 'node:url'

// v1 content lives in a sibling project. ESM import specifiers must be static
// literals, so we cannot compute the path in an `import` statement. Load it via a
// dynamic import() of the absolute file URL instead — tsx transpiles the sibling
// .ts on the fly. The v1 module shape: `export const seoPages: SeoPage[]`.
type V1Faq = { q: string; a: string; qEn: string; aEn: string }
type V1Benefit = { text: string; textEn: string }
type V1SeoPage = {
  slug: string
  category: 'service' | 'industry' | 'need' | 'location'
  title: string
  titleEn: string
  metaDescription: string
  metaDescriptionEn: string
  heroHeadline: string
  heroHeadlineEn: string
  heroSubtext: string
  heroSubtextEn: string
  faqs: V1Faq[]
  ctaText: string
  ctaTextEn: string
  benefits: V1Benefit[]
  trustMetrics?: { value: string; label: string; labelEn: string }[]
}

const V1_PATH = resolve(
  homedir(),
  'Documents/daniel-jin-studio-homepage/data/seo-pages.ts',
)

// ── D-03 APPROVED EN SLUG MAP (25 entries, verbatim) ────────────────────────
const EN_SLUGS: Record<string, string> = {
  'webentwickler-berlin': 'web-developer-berlin',
  'website-fuer-aerzte': 'websites-for-doctors',
  'seo-optimierung-berlin': 'seo-optimization-berlin',
  'webdesign-mitte': 'web-design-berlin-mitte',
  'website-fuer-restaurants': 'websites-for-restaurants',
  'website-fuer-startups': 'websites-for-startups',
  'website-fuer-anwaelte': 'websites-for-law-firms',
  'website-fuer-immobilien': 'real-estate-websites',
  'webdesign-kreuzberg': 'web-design-kreuzberg',
  'webdesign-charlottenburg': 'web-design-charlottenburg',
  'webdesign-prenzlauer-berg': 'web-design-prenzlauer-berg',
  'website-relaunch-berlin': 'website-relaunch-berlin',
  'landing-page-erstellen': 'landing-page-creation',
  'schnelle-website': 'fast-website-berlin',
  'wordpress-alternative': 'wordpress-alternative-berlin',
  'react-entwicklung-berlin': 'react-development-berlin',
  'webdesign-fuer-kmu': 'web-design-for-smbs-berlin',
  'website-fuer-handwerker': 'websites-for-tradespeople',
  'website-fuer-coaches': 'websites-for-coaches',
  'lead-generation-berlin': 'lead-generation-berlin',
  'online-booking-integration': 'online-booking-integration',
  'mehrsprachige-website': 'multilingual-website-berlin',
  'dsgvo-konforme-website': 'gdpr-compliant-website',
  'webdesign-friedrichshain': 'web-design-friedrichshain',
  'webdesign-neukoelln': 'web-design-neukoelln',
}

type Doc = Record<string, unknown>

function slugField(current: string): Doc {
  return { _type: 'slug', current }
}

async function main(): Promise<void> {
  // ESM import specifiers must be static literals, so the sibling-project path is
  // loaded via dynamic import() of the absolute file URL. Wrapped in an async
  // main() (rather than top-level await) so tsx can require() this module without
  // ERR_REQUIRE_ASYNC_MODULE. The v1 module shape: `export const seoPages`.
  const { seoPages } = (await import(pathToFileURL(V1_PATH).href)) as {
    seoPages: V1SeoPage[]
  }

  const docs: Doc[] = []

  for (const page of seoPages) {
    const enSlug = EN_SLUGS[page.slug]
    if (!enSlug) {
      // D-03 gate: refuse to emit an un-approved EN URL.
      throw new Error(
        `No approved EN slug for DE slug "${page.slug}". Add it to EN_SLUGS (requires D-03 re-approval) before migrating.`,
      )
    }

    const deId = `seoPage.${page.slug}.de`
    const enId = `seoPage.${page.slug}.en`

    // DE doc — slug verbatim from v1 (Pitfall 7).
    docs.push({
      _id: deId,
      _type: 'seoPage',
      language: 'de',
      title: page.title,
      slug: slugField(page.slug),
      category: page.category,
      heroHeadline: page.heroHeadline,
      heroSubtext: page.heroSubtext,
      ctaText: page.ctaText,
      faqs: page.faqs.map((f, i) => ({
        _key: String(i),
        question: f.q,
        answer: f.a,
      })),
      benefits: page.benefits.map((b, i) => ({ _key: String(i), text: b.text })),
      metaDescription: page.metaDescription,
    })

    // EN doc — content ported from v1's English fields (D-02); slug from approved map.
    docs.push({
      _id: enId,
      _type: 'seoPage',
      language: 'en',
      title: page.titleEn,
      slug: slugField(enSlug),
      category: page.category,
      heroHeadline: page.heroHeadlineEn,
      heroSubtext: page.heroSubtextEn,
      ctaText: page.ctaTextEn,
      faqs: page.faqs.map((f, i) => ({
        _key: String(i),
        question: f.qEn,
        answer: f.aEn,
      })),
      benefits: page.benefits.map((b, i) => ({ _key: String(i), text: b.textEn })),
      metaDescription: page.metaDescriptionEn,
    })

    // translation.metadata link — schemaTypes MUST be ["seoPage"] (Pitfall 6).
    docs.push({
      _id: `translation.metadata.seoPage.${page.slug}`,
      _type: 'translation.metadata',
      schemaTypes: ['seoPage'],
      translations: [
        { _key: 'de', value: { _type: 'reference', _ref: deId } },
        { _key: 'en', value: { _type: 'reference', _ref: enId } },
      ],
    })
  }

  const ndjson = docs.map((d) => JSON.stringify(d)).join('\n') + '\n'
  const outPath = resolve(process.cwd(), 'content/seo-pages.ndjson')
  writeFileSync(outPath, ndjson, 'utf8')

  const seoDocs = docs.filter((d) => d._type === 'seoPage').length
  const links = docs.filter((d) => d._type === 'translation.metadata').length
  console.log(
    `Wrote ${outPath}: ${seoDocs} seoPage docs + ${links} translation.metadata links (${seoPages.length} pairs).`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
