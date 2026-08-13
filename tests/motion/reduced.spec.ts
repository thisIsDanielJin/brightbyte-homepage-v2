/**
 * tests/motion/reduced.spec.ts — No animation under prefers-reduced-motion (SEC-11 / D-14)
 *
 * Creates a browser context with reducedMotion:'reduce', loads /de,
 * and verifies:
 *   - #hero is immediately visible (no opacity:0 initial state persisting)
 *   - The hero's computed transform is 'none' (no translateY remaining)
 *
 * This guards the D-14 / SEC-11 contract: whisper-quiet entrance fade must
 * be fully disabled when the user prefers reduced motion.
 */
import { test, expect } from '@playwright/test'

test('no animation under prefers-reduced-motion — hero visible, no transform', async ({ browser }) => {
  const context = await browser.newContext({
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  await page.goto('/de')
  await page.waitForLoadState('domcontentloaded')

  // #hero must be immediately visible — no opacity:0 initial state persisting
  const hero = page.locator('#hero')
  await expect(hero).toBeVisible()

  // No translateY offset remaining — motion.section must have zeroed the transition
  const transform = await hero.evaluate(
    (el) => window.getComputedStyle(el).transform
  )
  // Under reduced motion, either 'none' or the identity matrix 'matrix(1, 0, 0, 1, 0, 0)'
  // Both indicate no translation is applied
  const hasNoTranslation =
    transform === 'none' || transform === 'matrix(1, 0, 0, 1, 0, 0)'
  expect(hasNoTranslation).toBe(true)

  await context.close()
})

test('no animation under prefers-reduced-motion — hero opacity is 1', async ({ browser }) => {
  const context = await browser.newContext({
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  await page.goto('/de')
  await page.waitForLoadState('domcontentloaded')

  const hero = page.locator('#hero')
  const opacity = await hero.evaluate(
    (el) => window.getComputedStyle(el).opacity
  )
  expect(opacity).toBe('1')

  await context.close()
})
