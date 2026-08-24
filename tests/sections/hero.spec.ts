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
      await page.waitForLoadState('domcontentloaded')

      // #hero section must be visible
      const hero = page.locator('#hero')
      await expect(hero).toBeVisible()

      // Headline must have non-empty text (Sanity copy or next-intl fallback)
      const headline = hero.locator('h1')
      await expect(headline).toBeVisible()
      const headlineText = await headline.textContent()
      expect(headlineText?.trim().length).toBeGreaterThan(0)

      // ── Phase 5: Canvas visibility (HERO-01) ────────────────────────────────
      // The happy path (Canvas visible) depends on WebGL being available in the
      // headless Chromium — which is NOT guaranteed. Sniff WebGL support in-page
      // on a throwaway probe canvas; only then assert the Canvas branch. When
      // WebGL is absent, production canUseWebGL() returns false and the gradient
      // fallback shows with zero <canvas> — a legitimate green branch (mirrors
      // the real no-WebGL fallback), keeping this suite deterministic.
      const webglAvailable = await page.evaluate(() => {
        const c = document.createElement('canvas')
        return !!(c.getContext('webgl2') || c.getContext('webgl'))
      })

      const canvas = page.locator('#hero canvas')
      if (webglAvailable) {
        // Canvas mounts and fades in over the always-painted gradient fallback.
        await expect(canvas).toBeVisible()
        // Canvas is decorative: it sits inside an aria-hidden wrapper div so the
        // 3D scene is not exposed to the accessibility tree. R3F does not forward
        // aria-hidden onto the inner <canvas> element itself — an ancestor carries
        // it (matches UI-SPEC "aria-hidden on wrapper"; the a11y outcome is identical).
        // Assert via closest() so the contract holds regardless of nesting depth.
        const hiddenByAncestor = await canvas.evaluate(
          (el) => el.closest('[aria-hidden="true"]') !== null
        )
        expect(hiddenByAncestor).toBe(true)
      } else {
        // No-WebGL branch: gradient fallback visible, no canvas mounted at all.
        await expect(hero.locator('.hero-backdrop').first()).toBeVisible()
        await expect(canvas).toHaveCount(0)
      }

      // Capture screenshot for manual QA-02 review
      const viewport = page.viewportSize()
      const label = `${viewport?.width ?? 'x'}px`
      await hero.screenshot({
        path: `${SCREENSHOT_DIR}/hero-${locale}-${label}.png`,
      })
    })

    // D-06 / HERO-02: no <canvas> anywhere in #hero under reduced motion.
    test('no canvas in #hero when prefers-reduced-motion: reduce', async ({ browser }) => {
      const context = await browser.newContext({ reducedMotion: 'reduce' })
      const page = await context.newPage()
      await page.goto(`/${locale}`)
      await page.waitForLoadState('domcontentloaded')

      // Canvas is never mounted — HeroCanvas early-returns HeroFallback (D-06).
      await expect(page.locator('#hero canvas')).toHaveCount(0)
      // The static gradient fallback remains the backdrop. Under reduced motion
      // there are TWO .hero-backdrop divs by design — HeroSection's always-painted
      // one plus the HeroFallback that HeroCanvas returns from its early-return
      // gate — both identical, both correct (CLS = 0). Assert the first is visible.
      await expect(page.locator('#hero .hero-backdrop').first()).toBeVisible()

      await context.close()
    })
  })
}
