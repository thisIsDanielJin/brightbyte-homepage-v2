/**
 * tests/contact/validation.spec.ts — Contact form client validation (SEC-07 error path).
 *
 * Asserts the per-field client-preview validation blocks submission BEFORE any POST:
 *   - Submitting an empty form shows inline "required" errors and fires NO request.
 *   - A bad email address shows the inline email-format error and fires NO request.
 *   - No navigation / full-page reload occurs.
 *
 * The form validates via the shared schema (lib/contact/schema.ts) before fetching,
 * so a blocked submit must never hit /api/contact.
 *
 * Runs in DE and EN at both configured viewports (mobile-375 + desktop-1440).
 */
import { test, expect } from '@playwright/test'

const locales = ['de', 'en'] as const

for (const locale of locales) {
  test.describe(`Contact validation — ${locale}`, () => {
    test('empty submit shows inline errors and fires no request', async ({ page }) => {
      // Track any POST to /api/contact — a blocked submit must not fire one.
      let contactRequestFired = false
      await page.route('**/api/contact', (route) => {
        contactRequestFired = true
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true }),
        })
      })

      await page.goto(`/${locale}`)
      await page.waitForLoadState('domcontentloaded')

      const contact = page.locator('#contact')
      await expect(contact).toBeVisible()

      const urlBefore = page.url()

      // Submit the empty form.
      await contact.getByTestId('contact-submit').click()

      // Inline required errors must appear on each field (name/email/message).
      await expect(contact.locator('#contact-name-error')).toBeVisible()
      await expect(contact.locator('#contact-email-error')).toBeVisible()
      await expect(contact.locator('#contact-message-error')).toBeVisible()

      // No POST fired, no navigation.
      expect(contactRequestFired).toBe(false)
      expect(page.url()).toBe(urlBefore)
    })

    test('bad email shows inline email error and fires no request', async ({ page }) => {
      let contactRequestFired = false
      await page.route('**/api/contact', (route) => {
        contactRequestFired = true
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true }),
        })
      })

      await page.goto(`/${locale}`)
      await page.waitForLoadState('domcontentloaded')

      const contact = page.locator('#contact')
      await expect(contact).toBeVisible()

      await contact.locator('#contact-name').fill('Jane Smith')
      await contact.locator('#contact-email').fill('not-an-email')
      await contact.locator('#contact-message').fill('I need a website for my bakery.')

      await contact.getByTestId('contact-submit').click()

      // Email field shows an inline error; the required fields do not.
      await expect(contact.locator('#contact-email-error')).toBeVisible()
      await expect(contact.locator('#contact-name-error')).toHaveCount(0)
      await expect(contact.locator('#contact-message-error')).toHaveCount(0)

      expect(contactRequestFired).toBe(false)
    })
  })
}
