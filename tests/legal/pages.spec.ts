/**
 * tests/legal/pages.spec.ts — Impressum + Datenschutz route render + shell QA (SEC-09).
 *
 * Covers, in DE + EN at 375px + 1440px (playwright projects):
 *   /impressum   — renders address + Steuernummer + §19 UStG note (from Sanity siteSettings)
 *   /datenschutz — renders the datenschutzBody prose (from Sanity siteSettings)
 *   both routes  — wrapped by the site header + footer shell (D-05)
 *
 * NOTE (correction to plan text): Sanity reads use a server-only Viewer token
 * (SANITY_API_READ_TOKEN) — NOT anonymous/tokenless. This is transparent to the
 * rendered page: the RSC fetches via the single client, so these DOM assertions
 * hold regardless of the read-auth mechanism.
 *
 * Screenshots captured for manual QA-02 (ui-skills) review.
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
  test.describe(`Legal — ${locale}`, () => {
    test('impressum renders address + Steuernummer inside the site shell (SEC-09)', async ({ page }) => {
      await page.goto(`/${locale}/impressum`)
      await page.waitForLoadState('domcontentloaded')

      // Wrapped by the header + footer shell (D-05)
      await expect(page.locator('header').first()).toBeVisible()
      await expect(page.locator('footer').first()).toBeVisible()

      // Page title h1 present and non-empty
      const h1 = page.locator('main h1').first()
      await expect(h1).toBeVisible()
      expect((await h1.textContent())?.trim().length ?? 0).toBeGreaterThan(0)

      // Address + Steuernummer from Sanity present in the page text
      const bodyText = (await page.locator('main').innerText())
      expect(bodyText).toContain('Karl-Marx-Allee 118')
      expect(bodyText).toContain('14/596/01847')
      // §19 UStG note (DE contains §19; both locales reference §19 UStG)
      expect(bodyText).toContain('§19 UStG')

      // No horizontal overflow
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      )
      expect(overflow).toBe(false)

      const label = `${page.viewportSize()?.width ?? 'x'}px`
      await page.locator('main').screenshot({ path: `${SCREENSHOT_DIR}/impressum-${locale}-${label}.png` })
    })

    test('datenschutz renders the DSGVO body inside the site shell (SEC-09)', async ({ page }) => {
      await page.goto(`/${locale}/datenschutz`)
      await page.waitForLoadState('domcontentloaded')

      await expect(page.locator('header').first()).toBeVisible()
      await expect(page.locator('footer').first()).toBeVisible()

      const h1 = page.locator('main h1').first()
      await expect(h1).toBeVisible()
      expect((await h1.textContent())?.trim().length ?? 0).toBeGreaterThan(0)

      // datenschutzBody prose present (placeholder + marker survive to render)
      const body = page.locator('[data-testid="legal-body"]')
      await expect(body).toBeVisible()
      expect((await body.innerText()).trim().length).toBeGreaterThan(40)

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      )
      expect(overflow).toBe(false)

      const label = `${page.viewportSize()?.width ?? 'x'}px`
      await page.locator('main').screenshot({ path: `${SCREENSHOT_DIR}/datenschutz-${locale}-${label}.png` })
    })
  })
}
