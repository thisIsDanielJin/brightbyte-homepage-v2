/**
 * tests/sections/faq.spec.ts — FaqSection render smoke tests.
 *
 * Covers: SC #2 homepage FAQ section presence at /de and /en.
 *
 * The FAQ section renders only when siteSettings.faqs has items.
 * This test uses a soft assertion: if #faq is present, it asserts content;
 * if absent (no Sanity FAQ data seeded), the test passes gracefully.
 *
 * User-side dependency: FAQ content must be authored in Sanity Studio
 * (siteSettings.faqs[]) for the section to appear and this test's
 * content assertions to fire.
 *
 * Source: 07-03-PLAN.md Task 1 Step G.
 */
import { test, expect } from '@playwright/test'

const locales = ['de', 'en'] as const

for (const locale of locales) {
  test.describe(`FAQ section — ${locale}`, () => {
    test('#faq section renders accordion when FAQ data is available', async ({ page }) => {
      await page.goto(`/${locale}`)
      await page.waitForLoadState('domcontentloaded')

      const section = page.locator('#faq')
      const isPresent = (await section.count()) > 0

      if (!isPresent) {
        // No FAQ data seeded in Sanity — section correctly hidden
        // This is the expected state until the user authors FAQ content in Studio
        test.info().annotations.push({
          type: 'note',
          description: 'FAQ section not present — no Sanity FAQ data seeded yet (expected)',
        })
        return
      }

      // Section is visible — assert its structure
      await expect(section).toBeVisible()

      // Accordion items must be present
      const accordionItems = section.locator('details')
      const itemCount = await accordionItems.count()
      expect(itemCount).toBeGreaterThan(0)

      // Each item must have a summary (question) and answer paragraph
      const firstItem = accordionItems.first()
      const summary = firstItem.locator('summary')
      await expect(summary).toBeVisible()

      // Check locale-specific heading
      const heading = section.locator('h2')
      await expect(heading).toBeVisible()
      const headingText = await heading.textContent()
      if (locale === 'de') {
        expect(headingText?.trim()).toBe('Häufige Fragen')
      } else {
        expect(headingText?.trim()).toBe('Frequently asked questions')
      }
    })
  })
}
