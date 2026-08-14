/**
 * components/sections/ContactSection.tsx — Contact form client island (SEC-07, D-08, D-09, D-10).
 *
 * The ONLY 'use client' island of Phase 4. Mounted as the FINAL section in
 * app/[locale]/page.tsx (D-05 order, after About).
 *
 * Behavior:
 *   - 3 visible fields: Name (text), Email (email), Message (textarea rows=5).
 *   - Hidden honeypot input name="website" (tabIndex=-1, aria-hidden, className="hidden") — D-10.
 *   - Records mount time via useState(() => Date.now()) and sends it as _timestamp (Pitfall 8).
 *   - Per-field client-preview validation via the shared schema (lib/contact/schema.ts).
 *   - POSTs { name, email, message, website, _timestamp } to /api/contact.
 *   - Loading: inline 16px SVG spinner + disabled + opacity-75 (no reload).
 *   - Success: inline success heading + body; form hidden (no reload).
 *   - Error (network/server/validation): inline error copy; form re-enabled (no reload).
 *
 * i18n: strings from next-intl messages ONLY (I18N-01) — never client state / localStorage.
 * IDENT-01: zero raw hex, zero gray-* — all colors via @theme token utilities.
 * MotionSection: whisper-quiet entrance fade, respects prefers-reduced-motion (D-14/SEC-11).
 * T-04-07: RESEND_API_KEY is NEVER imported here — the key lives only in the Route Handler.
 *
 * Source: 04-UI-SPEC.md Contact Section + Contact Form Field States; 04-RESEARCH.md Pattern 4.
 */
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { MotionSection } from '@/components/ui/MotionSection'
import { contactVisibleSchema, type ContactVisibleField } from '@/lib/contact/schema'

type FieldErrors = Partial<Record<ContactVisibleField, string>>
type SubmitState = 'idle' | 'loading' | 'success' | 'error'

export function ContactSection() {
  const t = useTranslations('Contact')

  // Mount time (ms epoch) for the time-to-submit spam check (Pitfall 8).
  // Not a locale — I18N-01 invariant is about locale-in-state only.
  const [mountedAt] = useState(() => Date.now())

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('') // honeypot — real users never fill this
  const [errors, setErrors] = useState<FieldErrors>({})
  const [state, setState] = useState<SubmitState>('idle')

  function validate(): FieldErrors {
    const result = contactVisibleSchema.safeParse({ name, email, message })
    if (result.success) return {}

    const next: FieldErrors = {}
    for (const issue of result.error.issues) {
      const field = issue.path[0] as ContactVisibleField
      if (next[field]) continue // keep the first error per field

      // A field that is empty is "required"; a non-empty email that still fails
      // the schema is an email-format error.
      const value = field === 'name' ? name : field === 'email' ? email : message
      next[field] =
        field === 'email' && value.length > 0
          ? t('validationEmail')
          : t('validationRequired')
    }
    return next
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const fieldErrors = validate()
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length > 0) {
      setState('idle')
      return
    }

    setState('loading')
    setErrors({})

    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        message,
        website,
        _timestamp: mountedAt,
      }),
    }).catch(() => null)

    if (res && res.ok) {
      setState('success')
      return
    }

    setState('error')
  }

  const disabled = state === 'loading'

  return (
    <MotionSection id="contact" className="py-16 md:py-24 px-4 md:px-8 lg:px-16">
      <div className="max-w-[640px] mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-semibold text-primary">
            {t('heading')}
          </h2>
          <p className="text-base text-secondary mt-3">{t('subline')}</p>
        </div>

        {state === 'success' ? (
          // Inline success confirmation — no reload (SEC-07)
          <div
            role="status"
            aria-live="polite"
            className="text-center py-8"
            data-testid="contact-success"
          >
            <svg
              className="mx-auto mb-4 h-10 w-10 text-accent"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <h3 className="text-2xl font-semibold text-primary">
              {t('successHeading')}
            </h3>
            <p className="text-base text-secondary mt-2">{t('successBody')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="contact-name" className="text-sm font-medium text-primary block mb-1">
                {t('labelName')}
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={disabled}
                placeholder={t('placeholderName')}
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={errors.name ? 'contact-name-error' : undefined}
                className={`w-full rounded-sm px-4 py-3 text-base text-primary bg-surface placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  errors.name
                    ? 'border border-destructive ring-1 ring-destructive'
                    : 'border border-border'
                }`}
              />
              {errors.name && (
                <p id="contact-name-error" className="text-sm text-destructive mt-1">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="contact-email" className="text-sm font-medium text-primary block mb-1">
                {t('labelEmail')}
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={disabled}
                placeholder={t('placeholderEmail')}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? 'contact-email-error' : undefined}
                className={`w-full rounded-sm px-4 py-3 text-base text-primary bg-surface placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  errors.email
                    ? 'border border-destructive ring-1 ring-destructive'
                    : 'border border-border'
                }`}
              />
              {errors.email && (
                <p id="contact-email-error" className="text-sm text-destructive mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Message */}
            <div>
              <label htmlFor="contact-message" className="text-sm font-medium text-primary block mb-1">
                {t('labelMessage')}
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={disabled}
                placeholder={t('placeholderMessage')}
                aria-invalid={errors.message ? true : undefined}
                aria-describedby={errors.message ? 'contact-message-error' : undefined}
                className={`w-full rounded-sm px-4 py-3 text-base text-primary bg-surface placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  errors.message
                    ? 'border border-destructive ring-1 ring-destructive'
                    : 'border border-border'
                }`}
              />
              {errors.message && (
                <p id="contact-message-error" className="text-sm text-destructive mt-1">
                  {errors.message}
                </p>
              )}
            </div>

            {/* Honeypot — hidden from real users (D-10). Never populated legitimately. */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="contact-website">Website</label>
              <input
                id="contact-website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={disabled}
              className={`inline-flex items-center justify-center gap-2 rounded-sm bg-accent px-6 py-3 text-sm font-medium text-surface transition-colors duration-150 hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 w-full md:w-auto ${
                disabled ? 'opacity-75 cursor-not-allowed' : ''
              }`}
              data-testid="contact-submit"
            >
              {state === 'loading' && (
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
                  />
                </svg>
              )}
              {state === 'loading' ? t('submitLoading') : t('submitIdle')}
            </button>

            {/* Inline error (network/server) — button re-enabled, no reload (SEC-07) */}
            {state === 'error' && (
              <p
                role="alert"
                aria-live="assertive"
                className="text-sm text-destructive mt-1"
                data-testid="contact-error"
              >
                {t('errorGeneric')}
              </p>
            )}
          </form>
        )}
      </div>
    </MotionSection>
  )
}
