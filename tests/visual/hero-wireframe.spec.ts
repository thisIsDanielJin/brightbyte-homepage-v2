import { test } from '@playwright/test'

test('hero with wireframe - full build animation', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/en', { waitUntil: 'networkidle' })
  // Wait for GSAP build animation to complete (starts at 600ms, cascades ~2s)
  await page.waitForTimeout(4000)
  await page.screenshot({ path: 'screenshots/hero-wireframe-built.png' })

  // Wait for first morph
  await page.waitForTimeout(5000)
  await page.screenshot({ path: 'screenshots/hero-wireframe-morph1.png' })

  // Scroll to see the full wireframe
  await page.evaluate(() => window.scrollTo(0, 300))
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'screenshots/hero-wireframe-scrolled.png' })
})
