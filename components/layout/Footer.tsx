/**
 * components/layout/Footer.tsx — Dark-surface footer (RSC — no 'use client').
 *
 * D-13: footer uses --color-surface-dark (#0F0F10) + --color-on-dark tokens — the
 *   intended dark-accent moment in the design. Text, nav links, and legal links all
 *   use on-dark token utilities.
 * IDENT-01: zero raw hex, zero text-gray-* — all via @theme token utilities.
 * D-04: anchor nav links are plain <a href="#...">; locale routes via i18n Link.
 *
 * Props: siteSettings from getSiteSettings(locale) — contactEmail, copyright year.
 * Falls back gracefully when siteSettings fields are null/absent.
 *
 * Source: 04-UI-SPEC.md Footer spec; 04-RESEARCH.md Pattern 3.
 */

import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'

interface FooterSettings {
  contactEmail?: string | null
  siteTitle?: string | null
}

interface FooterProps {
  settings: FooterSettings | null
  locale: string
}

export async function Footer({ settings, locale }: FooterProps) {
  const t = await getTranslations('Footer')
  const nav = await getTranslations('Nav')
  const currentYear = new Date().getFullYear()
  const email = settings?.contactEmail ?? 'hello@brightbyte-berlin.com'

  const navLinks = [
    { href: '#services', label: nav('services') },
    { href: '#pricing', label: nav('pricing') },
    { href: '#work', label: nav('work') },
    { href: '#contact', label: nav('contact') },
  ]

  return (
    <footer className="bg-surface-dark text-on-dark">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        {/* Three-column at desktop, stacked at mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Column 1: Logo + tagline */}
          <div className="flex flex-col gap-4">
            <a href="#hero" aria-label="BrightByte Berlin — zur Startseite">
              <Image
                src="/logo-dark.svg"
                alt="BrightByte Berlin"
                width={140}
                height={32}
                className="h-8 w-auto"
              />
            </a>
            <p className="text-sm text-muted-on-dark leading-relaxed max-w-48">
              {t('tagline')}
            </p>
          </div>

          {/* Column 2: Anchor nav links */}
          <nav aria-label="Footer Navigation">
            <ul className="flex flex-col gap-3">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <a
                    href={href}
                    className="text-sm text-on-dark hover:text-on-dark [transition-duration:150ms] [transition-timing-function:var(--ease-standard)] transition-opacity hover:opacity-80"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 3: Legal links + contact email */}
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-muted-on-dark uppercase tracking-widest">
              {t('legal')}
            </p>
            <ul className="flex flex-col gap-2">
              <li>
                <Link
                  href="/impressum"
                  locale={locale as 'de' | 'en'}
                  className="text-sm text-on-dark hover:text-on-dark [transition-duration:150ms] [transition-timing-function:var(--ease-standard)] transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-sm"
                >
                  {t('impressum')}
                </Link>
              </li>
              <li>
                <Link
                  href="/datenschutz"
                  locale={locale as 'de' | 'en'}
                  className="text-sm text-on-dark hover:text-on-dark [transition-duration:150ms] [transition-timing-function:var(--ease-standard)] transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-sm"
                >
                  {t('datenschutz')}
                </Link>
              </li>
            </ul>
            <a
              href={`mailto:${email}`}
              className="text-sm text-on-dark underline decoration-accent underline-offset-2 hover:opacity-80 [transition-duration:150ms] [transition-timing-function:var(--ease-standard)] transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-sm mt-2 inline-block"
            >
              {email}
            </a>
          </div>
        </div>

        {/* Copyright bar */}
        <div className="mt-12 pt-6 border-t border-muted-on-dark/20">
          <p className="text-sm text-muted-on-dark">
            © {currentYear} {t('copyright')}
          </p>
        </div>
      </div>
    </footer>
  )
}
