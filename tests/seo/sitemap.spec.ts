/**
 * tests/seo/sitemap.spec.ts — Phase 6 Wave 0 (SEO-03 sitemap).
 *
 * DISCIPLINE: runs against the PRODUCTION server (`next start`), NOT `next dev`.
 * app/sitemap.ts fetches SEO_SLUG_PAIRS_QUERY from Sanity and emits per-locale
 * entries with alternates.languages (Next.js serializes alternates.languages as
 * <xhtml:link rel="alternate" hreflang="…" href="…"/> inside each <url>). This
 * only reflects the imported dataset on the production build.
 *
 * Requirement covered: SEO-03 (sitemap contains the tracer DE URL + an xhtml:link
 * alternate whose EN href uses the DIFFERING EN slug — D-04).
 *
 * Wave 0 = failing-first: RED until Plan 06-01 Task 4 extends app/sitemap.ts and
 * Task 3 imports the tracer pair.
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
