/**
 * i18n Smoke Tests — Phase 2 Wave 0
 *
 * Tests (1)-(3) go GREEN in Plan 02-01 (tracer slice):
 *   (1) / redirects to /de
 *   (2) /de has <html lang="de">
 *   (3) /en has <html lang="en">
 *
 * Tests (4)-(6) exercise artifacts built in Plans 02-02/02-03 and are
 * expected RED until those plans complete:
 *   (4) /de emits bidirectional hreflang + x-default (→ /de per D-05)
 *   (5) /en emits bidirectional hreflang
 *   (6) language switcher navigates /de ↔ /en preserving the path
 *
 * Source: .planning/phases/02-i18n-shell-routing/02-RESEARCH.md §"CI smoke test approach (D-09)"
 */

import { test, expect } from '@playwright/test'

// ── Tests (1)-(3): GREEN in Plan 02-01 ──────────────────────────────────────

test('(1) / redirects to /de', async ({ page }) => {
  await page.goto('/')
  expect(page.url()).toContain('/de')
})

test('(2) /de has <html lang="de">', async ({ page }) => {
  await page.goto('/de')
  const lang = await page.locator('html').getAttribute('lang')
  expect(lang).toBe('de')
})

test('(3) /en has <html lang="en">', async ({ page }) => {
  await page.goto('/en')
  const lang = await page.locator('html').getAttribute('lang')
  expect(lang).toBe('en')
})

// ── Tests (4)-(6): RED until Plans 02-02 / 02-03 ────────────────────────────
// These tests cover hreflang (I18N-02) and the language switcher (I18N-03).
// They will fail until Plan 02-02 (generateMetadata helper) and Plan 02-03
// (LocaleSwitcher component) are implemented.

test('(4) /de emits bidirectional hreflang including x-default → /de', async ({ page }) => {
  await page.goto('/de')
  const deHref = await page.locator('link[hreflang="de"]').getAttribute('href')
  const enHref = await page.locator('link[hreflang="en"]').getAttribute('href')
  const xDefault = await page.locator('link[hreflang="x-default"]').getAttribute('href')
  expect(deHref).toContain('/de')
  expect(enHref).toContain('/en')
  // x-default → /de per D-05 (always DE, not Accept-Language)
  expect(xDefault).toContain('/de')
})

test('(5) /en emits bidirectional hreflang pointing to correct alternates', async ({ page }) => {
  await page.goto('/en')
  const deHref = await page.locator('link[hreflang="de"]').getAttribute('href')
  const enHref = await page.locator('link[hreflang="en"]').getAttribute('href')
  expect(deHref).toContain('/de')
  expect(enHref).toContain('/en')
})

test('(6) language switcher navigates /de → /en preserving the path', async ({ page }) => {
  await page.goto('/de')
  // The switcher is the LocaleSwitcher component built in Plan 02-03.
  // It uses Link from @/i18n/navigation with locale prop — pure <Link>, no state.
  const enLink = page.locator('a[href*="/en"]').first()
  await enLink.click()
  await page.waitForURL('**/en**')
  expect(page.url()).toContain('/en')
  const lang = await page.locator('html').getAttribute('lang')
  expect(lang).toBe('en')
})
