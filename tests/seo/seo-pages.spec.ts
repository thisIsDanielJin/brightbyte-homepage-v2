/**
 * tests/seo/seo-pages.spec.ts — Phase 6 Wave 0 (SEO tracer render / JSON-LD / hreflang).
 *
 * DISCIPLINE: these specs run against the PRODUCTION server (`next start`), NOT
 * `next dev`. playwright.config.ts starts `npm run start` (= `next start`) as its
 * webServer and reuses an already-running one; the JSON-LD, hreflang, and
 * dynamicParams=false 404 behavior asserted here only hold on the production build.
 * Never point these at `next dev`.
 *
 * Requirements covered: SEO-01 (route + generateStaticParams), SEO-02 (JSON-LD),
 * I18N-02 (paired-slug hreflang with x-default → /de).
 *
 * Wave 0 = failing-first: RED until Plan 06-01 Task 4 (route + layout) ships the
 * /[locale]/s/[slug] page and Task 3 imports the tracer pair.
 *
 * Tracer slug pair (D-03 / D-04, differing per-locale slugs):
 *   DE: webentwickler-berlin   EN: web-developer-berlin
 *
 * Grep tags (VALIDATION per-task map): "renders DE tracer", "renders EN tracer",
 * "static params", "FAQPage JSON-LD", "hreflang x-default".
 *
 * Source: 06-VALIDATION.md § Per-Task Verification Map; 06-01-PLAN.md Task 1 <action>.
 */
import { test, expect } from '@playwright/test'

// Production (`next start`) origin — playwright.config.ts webServer baseURL.
const DE_SLUG = 'webentwickler-berlin'
const EN_SLUG = 'web-developer-berlin'

test('renders DE tracer page at /de/s/webentwickler-berlin (200, not 404)', async ({ page }) => {
  const res = await page.goto(`/de/s/${DE_SLUG}`)
  expect(res?.status()).toBe(200)
  const h1 = page.locator('main h1').first()
  await expect(h1).toBeVisible()
  expect((await h1.textContent())?.trim().length ?? 0).toBeGreaterThan(0)
})

test('renders EN tracer page at /en/s/web-developer-berlin (200, not 404)', async ({ page }) => {
  const res = await page.goto(`/en/s/${EN_SLUG}`)
  expect(res?.status()).toBe(200)
  const h1 = page.locator('main h1').first()
  await expect(h1).toBeVisible()
})

test('static params: all 50 locale×slug entries are prerendered (tracer 200; full set: 25 DE + 25 EN slugs)', async ({
  page,
}) => {
  // generateStaticParams loops ['de','en'] × getSeoPages(locale). With all 50
  // docs imported this yields exactly 50 entries (25 DE + 25 EN). Asserting the
  // two tracer slugs resolve is the portable proxy for "static params produced
  // entries" without scraping build logs (dynamicParams = false).
  const de = await page.goto(`/de/s/${DE_SLUG}`)
  expect(de?.status()).toBe(200)
  const en = await page.goto(`/en/s/${EN_SLUG}`)
  expect(en?.status()).toBe(200)
  // dynamicParams=false: an unseeded slug 404s.
  const missing = await page.goto('/de/s/this-slug-was-never-seeded')
  expect(missing?.status()).toBe(404)

  // Spot-check the 50-entry coverage: verify two additional DE + EN pairs.
  // These slugs are seeded and must resolve 200 in both locales.
  const deNeukoelln = await page.goto('/de/s/webdesign-neukoelln')
  expect(deNeukoelln?.status()).toBe(200)
  const enNeukoelln = await page.goto('/en/s/web-design-neukoelln')
  expect(enNeukoelln?.status()).toBe(200)

  const deAerzte = await page.goto('/de/s/website-fuer-aerzte')
  expect(deAerzte?.status()).toBe(200)
  const enAerzte = await page.goto('/en/s/websites-for-doctors')
  expect(enAerzte?.status()).toBe(200)
})

test('FAQPage JSON-LD present on the DE tracer with ≥1 Question item (SEO-02)', async ({ page }) => {
  await page.goto(`/de/s/${DE_SLUG}`)
  const scripts = await page.locator('script[type="application/ld+json"]').allTextContents()
  expect(scripts.length).toBeGreaterThan(0)

  const parsed = scripts.map((s) => JSON.parse(s))
  const faqPage = parsed.find((o) => o?.['@type'] === 'FAQPage')
  expect(faqPage, 'a FAQPage JSON-LD block should be emitted').toBeTruthy()

  const mainEntity = faqPage.mainEntity ?? []
  expect(Array.isArray(mainEntity)).toBe(true)
  expect(mainEntity.length).toBeGreaterThanOrEqual(1)
  expect(mainEntity[0]['@type']).toBe('Question')
  expect(typeof mainEntity[0].acceptedAnswer.text).toBe('string')
  expect(mainEntity[0].acceptedAnswer.text.length).toBeGreaterThan(0)
})

test('hreflang x-default and de → /de/s/webentwickler-berlin; en → differing EN slug (I18N-02)', async ({
  page,
}) => {
  await page.goto(`/de/s/${DE_SLUG}`)
  const deHref = await page.locator('link[hreflang="de"]').getAttribute('href')
  const enHref = await page.locator('link[hreflang="en"]').getAttribute('href')
  const xDefault = await page.locator('link[hreflang="x-default"]').getAttribute('href')

  expect(deHref).toContain(`/de/s/${DE_SLUG}`)
  // D-04: differing per-locale slug on the EN alternate.
  expect(enHref).toContain(`/en/s/${EN_SLUG}`)
  // D-05: x-default always → /de.
  expect(xDefault).toContain(`/de/s/${DE_SLUG}`)
})
