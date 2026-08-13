/**
 * tests/sections/hero.spec.ts — Hero section render + screenshot QA
 *
 * Covers SEC-01, SEC-10 (hero at 375px + 1440px in DE + EN).
 * Verifies:
 *   - #hero is visible
 *   - Hero headline text node is non-empty (Sanity copy or fallback)
 *   - Screenshot captured per locale × viewport combination
 *
 * Screenshots land in tests/screenshots/ for visual critique (QA-01/QA-02 loop).
 */
import { test, expect } from '@playwright/test'
import * as fs from 'node:fs'

// Ensure screenshot dir exists at test time
const SCREENSHOT_DIR = 'tests/screenshots'
test.beforeAll(() => {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
  }
})

const locales = ['de', 'en'] as const

for (const locale of locales) {
  test.describe(`Hero — ${locale}`, () => {
    test('renders and hero headline is non-empty', async ({ page }) => {
      await page.goto(`/${locale}`)
      await page.waitForLoadState('networkidle')

      // #hero section must be visible
      const hero = page.locator('#hero')
      await expect(hero).toBeVisible()

      // Headline must have non-empty text (Sanity copy or next-intl fallback)
      const headline = hero.locator('h1')
      await expect(headline).toBeVisible()
      const headlineText = await headline.textContent()
      expect(headlineText?.trim().length).toBeGreaterThan(0)

      // Capture screenshot for manual QA-02 review
      const viewport = page.viewportSize()
      const label = `${viewport?.width ?? 'x'}px`
      await hero.screenshot({
        path: `${SCREENSHOT_DIR}/hero-${locale}-${label}.png`,
      })
    })
  })
}
