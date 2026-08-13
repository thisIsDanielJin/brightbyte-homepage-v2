/**
 * tests/a11y/axe.spec.ts — WCAG AA zero-violations audit (QA-03)
 *
 * Runs axe-playwright with wcag2a + wcag2aa tags on /de and /en.
 * Zero violations required — this is the QA-03 gate reused by every plan.
 * The decorative text-muted region (aria-hidden) is excluded (Phase 2 precedent).
 *
 * Runtime target: < 30 seconds per locale.
 */
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const locales = ['de', 'en'] as const

for (const locale of locales) {
  test(`home /${locale} — zero WCAG AA axe violations`, async ({ page }) => {
    await page.goto(`/${locale}`)
    await page.waitForLoadState('networkidle')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .exclude('[data-decorative="true"]')
      .analyze()

    expect(
      results.violations,
      `Axe violations on /${locale}:\n${JSON.stringify(results.violations.map((v) => ({ id: v.id, impact: v.impact, description: v.description, nodes: v.nodes.map((n) => n.html) })), null, 2)}`
    ).toHaveLength(0)
  })
}
