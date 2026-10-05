import { test } from '@playwright/test'

test('wireframe hero prototypes - three layouts', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/en/prototypes/wireframe', { waitUntil: 'networkidle' })
  // Wait for R3F + build animation (rects expand over ~2.5s)
  await page.waitForTimeout(6000)

  // Layout A: centered text, wireframe around
  await page.screenshot({ path: 'screenshots/wireframe-a-centered.png' })

  // Layout B: text left, wireframe right
  await page.evaluate(() => window.scrollTo(0, window.innerHeight))
  await page.waitForTimeout(3000)
  await page.screenshot({ path: 'screenshots/wireframe-b-split.png' })

  // Layout C: text top, wireframe below
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2))
  await page.waitForTimeout(3000)
  await page.screenshot({ path: 'screenshots/wireframe-c-stacked.png' })
})
