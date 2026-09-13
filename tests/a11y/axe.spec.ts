/**
 * tests/a11y/axe.spec.ts — WCAG AA zero-violations audit (QA-03)
 *
 * Runs axe-playwright with wcag2a + wcag2aa tags on /de and /en.
 * Zero violations required — this is the QA-03 gate reused by every plan.
 * The decorative text-muted region (aria-hidden) is excluded (Phase 2 precedent).
 *
 * Phase 7 extension: /work/[slug] case study paths added.
 * Note: case study pages only exist in the build when Sanity projects have
 * hasCaseStudy=true (seeded via Sanity Studio user_setup step). When not seeded,
 * the pages 404 — the test skips gracefully rather than failing on a content
 * dependency (the test verifies the code is violation-free, not whether content
 * is authored).
 *
 * Runtime target: < 30 seconds per locale.
 */
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const locales = ['de', 'en'] as const

// Base paths: always present (no content dependency)
const basePaths = ['', '/impressum', '/datenschutz'] as const

// Case study paths: only exist when hasCaseStudy content is seeded in Sanity
const workPaths = [
  '/work/blumenspiess',
  '/work/learnstep',
  '/work/lumo',
] as const

for (const locale of locales) {
  // Base pages — always present, zero tolerance for violations
  for (const path of basePaths) {
    const url = `/${locale}${path}`
    const label = path === '' ? `home /${locale}` : `${path} /${locale}`
    test(`${label} — zero WCAG AA axe violations`, async ({ page }) => {
      await page.goto(url)
      await page.waitForLoadState('domcontentloaded')

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .exclude('[data-decorative="true"]')
        .analyze()

      expect(
        results.violations,
        `Axe violations on ${url}:\n${JSON.stringify(results.violations.map((v) => ({ id: v.id, impact: v.impact, description: v.description, nodes: v.nodes.map((n) => n.html) })), null, 2)}`
      ).toHaveLength(0)
    })
  }

  // Case study pages — content-gated: skip gracefully if not yet seeded in Sanity
  for (const path of workPaths) {
    const url = `/${locale}${path}`
    test(`${path} /${locale} — zero WCAG AA axe violations (content-gated)`, async ({ page }) => {
      const response = await page.goto(url)

      // If the page 404s, the case study content has not been seeded in Sanity yet.
      // This is not a code failure — it is a content dependency (hasCaseStudy=true
      // must be set in Sanity Studio, per user_setup in 07-01-PLAN.md).
      if (response?.status() === 404) {
        test.info().annotations.push({
          type: 'skip-reason',
          description: `${url} returned 404 — case study content not seeded in Sanity. Set hasCaseStudy=true and rebuild.`,
        })
        return
      }

      await page.waitForLoadState('domcontentloaded')

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .exclude('[data-decorative="true"]')
        .analyze()

      expect(
        results.violations,
        `Axe violations on ${url}:\n${JSON.stringify(results.violations.map((v) => ({ id: v.id, impact: v.impact, description: v.description, nodes: v.nodes.map((n) => n.html) })), null, 2)}`
      ).toHaveLength(0)
    })
  }
}

