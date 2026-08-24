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

// Legal routes are static RSC with no entrance animation — under reduced motion the
// h1 must be immediately visible (SEC-11 / D-14: no animation anywhere).
for (const path of ['/de/impressum', '/de/datenschutz', '/en/impressum', '/en/datenschutz']) {
  test(`no animation under prefers-reduced-motion — ${path} content visible`, async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' })
    const page = await context.newPage()
    await page.goto(path)
    await page.waitForLoadState('domcontentloaded')

    const h1 = page.locator('main h1').first()
    await expect(h1).toBeVisible()
    const opacity = await h1.evaluate((el) => window.getComputedStyle(el).opacity)
    expect(opacity).toBe('1')

    await context.close()
  })
}

// D-06 / HERO-02 (Phase 5): the R3F hero Canvas must not exist AT ALL under
// prefers-reduced-motion — not merely paused. useReducedMotion() in HeroCanvas
// takes the early-return HeroFallback branch, so no <canvas> is ever mounted.
test('no canvas element in DOM under prefers-reduced-motion (D-06 / HERO-02)', async ({ browser }) => {
  const context = await browser.newContext({
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  await page.goto('/de')
  await page.waitForLoadState('domcontentloaded')

  // D-06 locked contract: Canvas must not exist at all when reduced motion is active
  // (not merely paused — the element must be absent from the DOM entirely)
  await expect(page.locator('canvas')).toHaveCount(0)

  await context.close()
})
