/**
 * tests/sections/work.spec.ts — WorkSection render + screenshot QA
 *
 * Covers SEC-04, SEC-10, D-11: work grid at 375px + 1440px in DE + EN.
 *
 * Data-aware: if Sanity returns 0 projects (D-03 dataset ACL blocker),
 * the empty-state copy renders (correct behavior per UI Considerations row 25).
 *
 * When projects exist:
 *   - Cards render with outcome notes
 *   - No links on cards (D-11)
 *   - Hover lift via CSS transition (not a link)
 * When 0 projects:
 *   - Empty-state heading renders ("Projekte folgen in Kürze" / "Projects coming soon")
 *   - No broken layout
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
  test.describe(`Work grid — ${locale}`, () => {
    test('work section renders with cards or correct empty state (SEC-04)', async ({ page }) => {
      await page.goto(`/${locale}`)
      await page.waitForLoadState('domcontentloaded')

      // #work section must always be visible (either cards or empty state)
      const section = page.locator('#work')
      await expect(section).toBeVisible()

      const cards = section.locator('[data-testid="work-card"]')
      const cardCount = await cards.count()

      if (cardCount > 0) {
        // Projects exist: verify card structure
        expect(cardCount).toBeGreaterThanOrEqual(1)

        // Cards must not be links (D-11 — display only)
        const firstCard = cards.first()
        const tagName = await firstCard.evaluate((el) => el.tagName.toLowerCase())
        expect(tagName).not.toBe('a')

        // Outcome note must be present
        const outcomeNote = firstCard.locator('[data-testid="work-outcome"]')
        await expect(outcomeNote).toBeVisible()
        const outcomeText = await outcomeNote.textContent()
        expect(outcomeText?.trim().length).toBeGreaterThan(0)
      } else {
        // Empty state: must show the "coming soon" copy
        const emptyHeading = section.locator('[data-testid="work-empty-heading"]')
        await expect(emptyHeading).toBeVisible()
        const emptyText = await emptyHeading.textContent()
        expect(emptyText?.trim().length).toBeGreaterThan(0)

        if (locale === 'de') {
          expect(emptyText).toContain('Projekte')
        } else {
          expect(emptyText).toContain('Projects')
        }
      }

      // Screenshot for visual QA
      const viewport = page.viewportSize()
      const label = `${viewport?.width ?? 'x'}px`
      await section.screenshot({
        path: `${SCREENSHOT_DIR}/work-${locale}-${label}.png`,
      })
    })

    test('work cards have no links — display only (D-11)', async ({ page }) => {
      await page.goto(`/${locale}`)
      await page.waitForLoadState('domcontentloaded')

      const section = page.locator('#work')
      await expect(section).toBeVisible()

      const cards = section.locator('[data-testid="work-card"]')
      const cardCount = await cards.count()

      // When cards exist, ensure none are wrapped in <a> tags
      for (let i = 0; i < cardCount; i++) {
        const card = cards.nth(i)
        const tagName = await card.evaluate((el) => el.tagName.toLowerCase())
        expect(tagName).not.toBe('a')
        // Also check no anchor descendants that wrap the whole card
        const links = card.locator('a')
        const linkCount = await links.count()
        expect(linkCount).toBe(0)
      }
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
