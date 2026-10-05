import { test } from '@playwright/test'

test('hero prototypes - all three directions', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/en/prototypes', { waitUntil: 'networkidle' })
  await page.waitForTimeout(5000) // let R3F scenes render + assembly animation

  // Direction 1: The Assembly
  await page.screenshot({ path: 'screenshots/proto-assembly.png' })

  // Direction 2: The Wireframe
  await page.evaluate(() => window.scrollTo(0, window.innerHeight))
  await page.waitForTimeout(2000)
  await page.screenshot({ path: 'screenshots/proto-wireframe.png' })

  // Direction 3: The Monolith
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2))
  await page.waitForTimeout(2000)
  await page.screenshot({ path: 'screenshots/proto-monolith.png' })
})
