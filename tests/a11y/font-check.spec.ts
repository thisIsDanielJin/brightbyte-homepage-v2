/**
 * TDD RED: Font bridge verification
 * Asserts Plus Jakarta Sans is loaded via next/font + @theme inline bridge.
 * This test will FAIL until Task 1 scaffold and font wiring are complete.
 */
import { test, expect } from '@playwright/test'

test('Plus Jakarta Sans loads via @theme inline bridge (not system fallback)', async ({ page }) => {
  await page.goto('/token-audit')
  const fontLoaded = await page.evaluate(async () => {
    await document.fonts.ready
    return document.fonts.check('16px "Plus Jakarta Sans"')
  })
  expect(fontLoaded).toBe(true)
})
