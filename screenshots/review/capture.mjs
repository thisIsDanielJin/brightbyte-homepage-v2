import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://localhost:3003/de', { waitUntil: 'networkidle' })
  await page.waitForTimeout(3000)

  await page.screenshot({ path: 'screenshots/review/full-desktop.png', fullPage: true })
  for (const id of ['hero','services','work','about','pricing','guarantee','contact']) {
    const el = page.locator('#' + id)
    if (await el.count() > 0) await el.screenshot({ path: `screenshots/review/${id}-desktop.png` })
  }

  // Mobile
  await page.setViewportSize({ width: 375, height: 812 })
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(1000)
  await page.screenshot({ path: 'screenshots/review/full-mobile.png', fullPage: true })

  await browser.close()
  console.log('Done')
})()
