/**
 * tests/seo/sitemap.spec.ts — Phase 6 Wave 0 + Wave 2 (SEO-03 sitemap).
 *
 * DISCIPLINE: runs against the PRODUCTION server (`next start`), NOT `next dev`.
 * app/sitemap.ts fetches SEO_SLUG_PAIRS_QUERY from Sanity and emits per-locale
 * entries with alternates.languages (Next.js serializes alternates.languages as
 * <xhtml:link rel="alternate" hreflang="..." href="..."/> inside each <url>). This
 * only reflects the imported dataset on the production build.
 *
 * Requirements covered: SEO-03 (sitemap contains all 50 SEO URLs with correct
 * paired alternates — D-04; tracer DE URL + differing-slug EN alternate).
 *
 * Wave 0 = failing-first: RED until Plan 06-01 Task 4 extends app/sitemap.ts and
 * Task 3 imports the tracer pair.
 * Wave 2 (06-02 Task 3): full 50-URL coverage assertion after all 50 docs imported.
 *
 * Source: 06-VALIDATION.md § Per-Task Verification Map; 06-01-PLAN.md Task 1 <action>.
 */
import { test, expect } from '@playwright/test'

const DE_SLUG = 'webentwickler-berlin'
const EN_SLUG = 'web-developer-berlin'

test('sitemap.xml returns 200 and contains the DE tracer URL with a differing-slug EN alternate (SEO-03)', async ({
  request,
}) => {
  const res = await request.get('/sitemap.xml')
  expect(res.status()).toBe(200)

  const xml = await res.text()

  // The DE tracer URL is present.
  expect(xml).toContain(`/de/s/${DE_SLUG}`)

  // An xhtml:link alternate for EN exists with the DIFFERING EN slug (D-04).
  // Next.js emits alternates.languages as <xhtml:link rel="alternate" .../>.
  expect(xml).toContain('xhtml:link')
  expect(xml).toContain(`/en/s/${EN_SLUG}`)

  // The EN slug must actually differ from the DE slug — guards against a
  // regression to identical-path hreflang (Pitfall 4).
  expect(EN_SLUG).not.toBe(DE_SLUG)
})

test('sitemap.xml contains all 50 SEO-page URLs (25 DE + 25 EN) with correct differing-slug alternates (SEO-03 full coverage)', async ({
  request,
}) => {
  const res = await request.get('/sitemap.xml')
  expect(res.status()).toBe(200)

  const xml = await res.text()

  // Count <loc> entries: 2 locale roots + 50 SEO pages = 52 total.
  // Assert at least 52 to allow for future additions without breaking the test.
  const locCount = (xml.match(/<loc>/g) ?? []).length
  expect(
    locCount,
    'sitemap must have at least 52 <loc> entries (2 roots + 50 SEO pages)',
  ).toBeGreaterThanOrEqual(52)

  // Spot-check: location/category slug (webdesign-neukoelln) with differing EN slug (D-04).
  expect(xml).toContain('/de/s/webdesign-neukoelln')
  expect(xml).toContain('/en/s/web-design-neukoelln')
  // Confirm the slugs differ (guard against same-slug regression, Pitfall 4).
  expect('web-design-neukoelln').not.toBe('webdesign-neukoelln')

  // Spot-check two more DE/EN pairs:
  expect(xml).toContain('/de/s/website-fuer-aerzte')
  expect(xml).toContain('/en/s/websites-for-doctors')
  expect(xml).toContain('/de/s/seo-optimierung-berlin')
  expect(xml).toContain('/en/s/seo-optimization-berlin')
})
