/**
 * components/sections/ContactSection.tsx — Contact on dark background.
 *
 * Dark surface with blue accent details. The final CTA of the page
 * gets visual weight through the dark treatment.
 * Form inputs are light on dark. Submit button in accent blue.
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
  const [mountedAt] = useState(() => Date.now())
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [state, setState] = useState<SubmitState>('idle')

  function validate(): FieldErrors {
    const result = contactVisibleSchema.safeParse({ name, email, message })
    if (result.success) return {}
    const next: FieldErrors = {}
    for (const issue of result.error.issues) {
      const field = issue.path[0] as ContactVisibleField
      if (next[field]) continue
      const value = field === 'name' ? name : field === 'email' ? email : message
      next[field] = field === 'email' && value.length > 0 ? t('validationEmail') : t('validationRequired')
    }
    return next
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fieldErrors = validate()
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length > 0) { setState('idle'); return }
    setState('loading')
    setErrors({})
    const res = await fetch('/api/contact', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message, website, _timestamp: mountedAt }),
    }).catch(() => null)
    setState(res && res.ok ? 'success' : 'error')
  }

  const disabled = state === 'loading'
  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-3 text-sm text-primary bg-surface border ${hasError ? 'border-destructive' : 'border-border'} placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent`

  return (
    <MotionSection id="contact" className="relative py-24 md:py-32 bg-surface-dark overflow-hidden">
      {/* Subtle blue radial glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 60% 50% at 20% 50%, rgba(28,57,187,0.06), transparent 70%)',
      }} />

      <div className="relative px-6 md:px-8 lg:px-12 xl:px-[max(calc((100vw-90rem)/2+3rem),3rem)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
          {/* Left: heading + process */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-on-dark leading-[1.1] tracking-[-0.02em] mb-4">
              {t('heading')}
            </h2>
            <p className="text-base text-muted-on-dark leading-relaxed text-pretty mb-10">{t('subline')}</p>

            <ul className="space-y-4 mb-10">
              {[t('step1'), t('step2'), t('step3')].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-1 flex-shrink-0 text-accent" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-base text-muted-on-dark leading-relaxed text-pretty">{step}</span>
                </li>
              ))}
            </ul>

            <a href={'mailto:' + t('directEmail')} className="text-sm font-medium text-on-dark underline decoration-accent underline-offset-3 hover:opacity-70 transition-opacity">
              {t('directEmail')}
            </a>
          </div>

          {/* Right: form */}
          <div>
            {state === 'success' ? (
              <div role="status" aria-live="polite" className="py-8" data-testid="contact-success">
                <h3 className="text-2xl font-bold text-on-dark mb-2">{t('successHeading')}</h3>
                <p className="text-base text-muted-on-dark">{t('successBody')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div>
                  <label htmlFor="contact-name" className="text-xs text-muted-on-dark uppercase tracking-wide block mb-2">{t('labelName')}</label>
                  <input id="contact-name" name="name" type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} disabled={disabled} placeholder={t('placeholderName')}
                    aria-invalid={errors.name ? true : undefined} className={inputClass(!!errors.name)} />
                  {errors.name && <p className="text-sm text-destructive mt-1.5">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="contact-email" className="text-xs text-muted-on-dark uppercase tracking-wide block mb-2">{t('labelEmail')}</label>
                  <input id="contact-email" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={disabled} placeholder={t('placeholderEmail')}
                    aria-invalid={errors.email ? true : undefined} className={inputClass(!!errors.email)} />
                  {errors.email && <p className="text-sm text-destructive mt-1.5">{errors.email}</p>}
                </div>
                <div>
                  <label htmlFor="contact-message" className="text-xs text-muted-on-dark uppercase tracking-wide block mb-2">{t('labelMessage')}</label>
                  <textarea id="contact-message" name="message" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} disabled={disabled} placeholder={t('placeholderMessage')}
                    aria-invalid={errors.message ? true : undefined} className={inputClass(!!errors.message)} />
                  {errors.message && <p className="text-sm text-destructive mt-1.5">{errors.message}</p>}
                </div>
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="contact-website">Website</label>
                  <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
                </div>
                <button type="submit" disabled={disabled} data-testid="contact-submit"
                  className={`inline-flex items-center justify-center gap-2 bg-accent text-surface text-sm font-medium h-10 px-6 w-full hover:bg-accent-hover transition-colors ${disabled ? 'opacity-75 cursor-not-allowed' : ''}`}>
                  {state === 'loading' && (
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
                    </svg>
                  )}
                  {state === 'loading' ? t('submitLoading') : t('submitIdle')}
                </button>
                <p className="text-xs text-muted-on-dark text-center">{t('trustNote')}</p>
                {state === 'error' && (
                  <p role="alert" className="text-sm text-destructive mt-1" data-testid="contact-error">{t('errorGeneric')}</p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </MotionSection>
  )
}
