/**
 * tests/sections/process.spec.ts — ProcessSection render smoke tests.
 *
 * Covers: SC #2 homepage Process section presence at /de and /en.
 *
 * Assertions:
 *   - #process section is visible
 *   - Contains exactly 3 items with data-testid="process-step"
 *   - DE locale renders "Vorgehen" eyebrow text
 *   - EN locale renders "Process" eyebrow text
 *
 * Source: 07-03-PLAN.md Task 1 Step G.
 */
import { test, expect } from '@playwright/test'

const locales = ['de', 'en'] as const

for (const locale of locales) {
  test.describe(`Process section — ${locale}`, () => {
    test('#process section is visible with 3 steps', async ({ page }) => {
      await page.goto(`/${locale}`)
      await page.waitForLoadState('domcontentloaded')

      const section = page.locator('#process')
      await expect(section).toBeVisible()

      // Exactly 3 step cards with data-testid
      const steps = section.locator('[data-testid="process-step"]')
      await expect(steps).toHaveCount(3)
    })

    test(`#process eyebrow text matches locale`, async ({ page }) => {
      await page.goto(`/${locale}`)
      await page.waitForLoadState('domcontentloaded')

      const section = page.locator('#process')
      await expect(section).toBeVisible()

      const eyebrowText = await section.locator('p').first().textContent()

      if (locale === 'de') {
        expect(eyebrowText?.trim()).toBe('Vorgehen')
      } else {
        expect(eyebrowText?.trim()).toBe('Process')
      }
    })
  })
}
