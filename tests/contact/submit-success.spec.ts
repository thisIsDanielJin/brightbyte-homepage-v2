/**
 * tests/contact/submit-success.spec.ts — Contact form happy path (SEC-07 success path).
 *
 * Intercepts POST /api/contact and fulfills it with 200 { ok: true } so the test does
 * not depend on Resend / a real email send. Asserts:
 *   - A valid submission POSTs to /api/contact with the expected payload shape
 *     (name/email/message/website honeypot empty/_timestamp number).
 *   - The inline success confirmation is shown (no full-page reload / navigation).
 *   - The form is replaced by the success state (submit button gone).
 *
 * Also asserts the server-side error branch surfaces inline (500 → inline error copy,
 * form re-enabled, no reload).
 *
 * Runs in DE and EN at both configured viewports (mobile-375 + desktop-1440).
 */
import { test, expect } from '@playwright/test'

const locales = ['de', 'en'] as const

for (const locale of locales) {
  test.describe(`Contact submit — ${locale}`, () => {
    test('valid submit posts and shows inline success (no reload)', async ({ page }) => {
      let capturedBody: Record<string, unknown> | null = null

      await page.route('**/api/contact', async (route) => {
        const req = route.request()
        capturedBody = req.postDataJSON() as Record<string, unknown>
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true, id: 'test-id' }),
        })
      })

      await page.goto(`/${locale}`)
      await page.waitForLoadState('domcontentloaded')

      const contact = page.locator('#contact')
      await expect(contact).toBeVisible()

      const urlBefore = page.url()

      await contact.locator('#contact-name').fill('Jane Smith')
      await contact.locator('#contact-email').fill('jane@example.com')
      await contact.locator('#contact-message').fill('I need a website for my bakery.')

      await contact.getByTestId('contact-submit').click()

      // Inline success confirmation shows; no navigation occurred.
      await expect(contact.getByTestId('contact-success')).toBeVisible()
      await expect(contact.getByTestId('contact-submit')).toHaveCount(0)
      expect(page.url()).toBe(urlBefore)

      // Payload shape sent to the Route Handler.
      expect(capturedBody).not.toBeNull()
      const body = capturedBody as unknown as Record<string, unknown>
      expect(body).toMatchObject({
        name: 'Jane Smith',
        email: 'jane@example.com',
        message: 'I need a website for my bakery.',
        website: '', // honeypot empty for a real user
      })
      expect(typeof body._timestamp).toBe('number')
    })

    test('server failure surfaces inline error and re-enables the form (no reload)', async ({ page }) => {
      await page.route('**/api/contact', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'send_failed' }),
        })
      })

      await page.goto(`/${locale}`)
      await page.waitForLoadState('domcontentloaded')

      const contact = page.locator('#contact')
      await expect(contact).toBeVisible()

      const urlBefore = page.url()

      await contact.locator('#contact-name').fill('Jane Smith')
      await contact.locator('#contact-email').fill('jane@example.com')
      await contact.locator('#contact-message').fill('I need a website for my bakery.')

      await contact.getByTestId('contact-submit').click()

      // Inline error shown; submit button still present (form re-enabled); no reload.
      await expect(contact.getByTestId('contact-error')).toBeVisible()
      await expect(contact.getByTestId('contact-submit')).toBeEnabled()
      expect(page.url()).toBe(urlBefore)
    })
  })
}
