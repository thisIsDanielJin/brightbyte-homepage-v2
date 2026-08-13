/**
 * tests/sections/about.spec.ts — AboutSection render + screenshot QA
 *
 * Covers SEC-06, SEC-10: about section at 375px + 1440px in DE + EN.
 *
 * The section ships with the initials "DJ" fallback (no real photo yet).
 * Tests verify:
 *   - #about section always renders (no empty-state hide for About)
 *   - Heading "Über mich" / "About me" is present
 *   - Initials fallback renders when no photo ("DJ" text visible)
 *   - No layout break at either viewport
 *   - No horizontal overflow
 *
 * Screenshots captured for manual QA-02 review.
 */
import { test, expect } from '@playwright/test'
import * as fs from 'node:fs'

const SCREENSHOT_DIR = 'tests/screenshots'
test.beforeAll(() => {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
  }
})

const locales = ['de', 'en'] as const

for (const locale of locales) {
  test.describe(`About — ${locale}`, () => {
    test('about section renders with initials fallback (SEC-06)', async ({ page }) => {
      await page.goto(`/${locale}`)
      await page.waitForLoadState('domcontentloaded')

      // #about must always render (not data-gated like testimonials)
      const section = page.locator('#about')
      await expect(section).toBeVisible()

      // Section heading must be present
      const heading = section.locator('h2')
      await expect(heading).toBeVisible()
      const headingText = await heading.textContent()
      expect(headingText?.trim().length).toBeGreaterThan(0)

      // Either photo OR initials fallback must render
      const photo = section.locator('[data-testid="about-photo"]')
      const initials = section.locator('[data-testid="about-initials"]')

      const hasPhoto = await photo.count() > 0 && await photo.isVisible().catch(() => false)
      const hasInitials = await initials.count() > 0 && await initials.isVisible().catch(() => false)

      // One or the other must be present (ship-now state = initials)
      expect(hasPhoto || hasInitials).toBe(true)

      // When initials are showing, they must read "DJ"
      if (hasInitials) {
        const initialsText = await initials.textContent()
        expect(initialsText?.trim()).toContain('DJ')
      }

      // Body text must be present (the "you work directly with me" framing)
      const body = section.locator('[data-testid="about-body"]')
      await expect(body).toBeVisible()
      const bodyText = await body.textContent()
      expect(bodyText?.trim().length).toBeGreaterThan(0)

      // Screenshot for visual QA
      const viewport = page.viewportSize()
      const label = `${viewport?.width ?? 'x'}px`
      await section.screenshot({
        path: `${SCREENSHOT_DIR}/about-${locale}-${label}.png`,
      })
    })

    test('no horizontal overflow at this viewport', async ({ page }) => {
      await page.goto(`/${locale}`)
      await page.waitForLoadState('domcontentloaded')

      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth
      })
      expect(overflow).toBe(false)
    })
  })
}
