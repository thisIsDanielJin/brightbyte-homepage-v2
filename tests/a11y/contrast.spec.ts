/**
 * Wave 0 — WCAG AA Contrast Audit
 *
 * Proves every readable foreground/background token pair on /token-audit
 * passes WCAG AA before any component work begins (IDENT-02).
 *
 * The decorative Text Muted region (aria-hidden="true", data-decorative="true")
 * is excluded from the axe scan via .exclude() — it intentionally fails AA
 * (2.56:1) and is restricted to decorative/disabled states per D-06 / UI-SPEC.
 *
 * Token pairs verified by this test (via axe color-contrast rule):
 *   - text-primary on bg-surface         — 17.72:1  AAA
 *   - text-primary on bg-surface-subtle  — 16.97:1  AAA
 *   - text-secondary on bg-surface       — 7.73:1   AAA
 *   - text-accent on bg-surface          — 8.93:1   AAA
 *   - text-on-dark on bg-surface-dark    — 17.43:1  AAA
 *
 * Runtime target: < 30 seconds (chromium, single page).
 */
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('token-audit: zero color-contrast violations on all readable token pairs', async ({ page }) => {
  await page.goto('/token-audit')

  // Verify the page actually loaded (not a 404)
  await expect(page.locator('h1')).toContainText('Token Audit')

  // Run axe color-contrast rule, excluding the decorative Text Muted region.
  // The [data-decorative="true"] section is aria-hidden and intentionally fails AA —
  // it is the known exception restricted to captions/placeholders/disabled states.
  const accessibilityScanResults = await new AxeBuilder({ page })
    .withRules(['color-contrast'])
    .exclude('[data-decorative="true"]')
    .analyze()

  // Assert zero violations — all readable token pairs must pass WCAG AA
  expect(
    accessibilityScanResults.violations,
    `Color contrast violations found:\n${JSON.stringify(accessibilityScanResults.violations, null, 2)}`
  ).toHaveLength(0)
})

test('token-audit: Plus Jakarta Sans font loads via @theme inline bridge', async ({ page }) => {
  await page.goto('/token-audit')

  const fontLoaded = await page.evaluate(async () => {
    await document.fonts.ready
    return document.fonts.check('16px "Plus Jakarta Sans"')
  })

  expect(fontLoaded).toBe(true)
})

test('token-audit: accent token pair is present in audited page', async ({ page }) => {
  await page.goto('/token-audit')

  // The accent token pair must be rendered on the page for the audit to be meaningful.
  // Verify the text-accent element is present and visible.
  const accentText = page.locator('.text-accent').first()
  await expect(accentText).toBeVisible()
})
