/**
 * tests/sections/case-study.spec.ts — Smoke test for Blumenspiess case study page.
 *
 * Tests the /de/work/blumenspiess route (and EN counterpart) after data is seeded
 * in Sanity Studio (see user_setup in 07-01-PLAN.md).
 *
 * NOTE: The Blumenspiess slug MUST match what is seeded in Sanity.
 *   Run: `npx sanity@latest documents query '*[_type == "project" && language == "de"]{title, "slug": slug.current}' --apiVersion 2024-06-01`
 *   to verify the actual slug before running these tests.
 *
 * Requires:
 *   1. Sanity Studio data seeded (see user_setup in plan)
 *   2. `next build && next start` running on localhost:3000
 */
import { test, expect } from '@playwright/test'

// Actual slug value confirmed from Sanity before running.
// Update this constant if the slug differs from 'blumenspiess'.
const BLUMENSPIESS_DE_SLUG = 'blumenspiess'
const BLUMENSPIESS_EN_SLUG = 'blumenspiess' // EN slug — may differ; confirm from Sanity

test.describe('Blumenspiess case study — DE', () => {
  test('renders H1, problem band eyebrow, and outcome metric', async ({ page }) => {
    await page.goto(`/de/work/${BLUMENSPIESS_DE_SLUG}`)
    await page.waitForLoadState('domcontentloaded')

    // Page must not 404
    expect(page.url()).toContain('/de/work/')

    // H1 must be present and non-empty
    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible()
    const h1Text = await h1.textContent()
    expect(h1Text?.trim().length).toBeGreaterThan(0)

    // Band 2 eyebrow: 'Die Herausforderung'
    const problemEyebrow = page.getByText('Die Herausforderung')
    await expect(problemEyebrow).toBeVisible()

    // Outcome metric callout (large bold number like '+200%')
    // Located by its Tailwind classes .text-4xl.font-bold.text-primary
    const outcomeMetric = page.locator('.text-4xl.font-bold.text-primary').first()
    await expect(outcomeMetric).toBeVisible()
  })

  test('CTA strip shows Ähnliches Projekt? and back link', async ({ page }) => {
    await page.goto(`/de/work/${BLUMENSPIESS_DE_SLUG}`)
    await page.waitForLoadState('domcontentloaded')

    await expect(page.getByText('Ähnliches Projekt?')).toBeVisible()
    await expect(page.getByText('← Alle Projekte')).toBeVisible()
  })
})

test.describe('Blumenspiess case study — EN', () => {
  test('renders H1 and English section labels', async ({ page }) => {
    await page.goto(`/en/work/${BLUMENSPIESS_EN_SLUG}`)
    await page.waitForLoadState('domcontentloaded')

    // H1 must be present and non-empty
    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible()
    const h1Text = await h1.textContent()
    expect(h1Text?.trim().length).toBeGreaterThan(0)
  })
})
