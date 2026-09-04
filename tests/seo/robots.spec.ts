/**
 * tests/seo/robots.spec.ts — Phase 6 Wave 0 (SEO-03 robots.txt).
 *
 * DISCIPLINE: runs against the PRODUCTION server (`next start`), NOT `next dev`.
 * app/robots.ts returns MetadataRoute.Robots; Next.js serializes it to /robots.txt
 * with a `Sitemap:` line referencing the absolute sitemap URL.
 *
 * Requirement covered: SEO-03 (robots.txt 200 + sitemap reference).
 *
 * Wave 0 = failing-first: RED until Plan 06-01 Task 4 adds app/robots.ts.
 *
 * Source: 06-VALIDATION.md § Per-Task Verification Map; 06-01-PLAN.md Task 1 <action>.
 */
import { test, expect } from '@playwright/test'

test('robots.txt returns 200 and references the sitemap (SEO-03)', async ({ request }) => {
  const res = await request.get('/robots.txt')
  expect(res.status()).toBe(200)

  const body = await res.text()
  // A Sitemap: directive pointing at /sitemap.xml.
  expect(body.toLowerCase()).toContain('sitemap')
  expect(body).toContain('/sitemap.xml')
  // Baseline crawl permission.
  expect(body.toLowerCase()).toContain('user-agent')
})
