import { test } from '@playwright/test'

/**
 * Visual test: full-page screenshots at desktop + mobile to verify
 * the three Silk instances and overall page composition.
 */

test('full page @ desktop (1440px)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/en', { waitUntil: 'networkidle' })
  await page.waitForTimeout(4000) // let Silk WebGL canvases render
  await page.screenshot({
    path: 'screenshots/full-page-desktop.png',
    fullPage: true,
  })
})

test('full page @ mobile (375px)', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/en', { waitUntil: 'networkidle' })
  await page.waitForTimeout(4000)
  await page.screenshot({
    path: 'screenshots/full-page-mobile.png',
    fullPage: true,
  })
})

test('hero closeup @ desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/en', { waitUntil: 'networkidle' })
  await page.waitForTimeout(4000)
  await page.screenshot({
    path: 'screenshots/hero-desktop.png',
  })
})

test('DE locale full page @ desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/de', { waitUntil: 'networkidle' })
  await page.waitForTimeout(4000)
  await page.screenshot({
    path: 'screenshots/full-page-desktop-de.png',
    fullPage: true,
  })
})
