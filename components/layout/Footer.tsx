/**
 * components/layout/Footer.tsx — Dark-surface footer (RSC).
 *
 * Structure:
 *   Row 1: Logo + tagline | Nav links | Legal + email (3-col)
 *   Row 2: SEO pages as a quiet inline flowing list (keeps crawlable links, minimal height)
 *   Row 3: Copyright
 *
 * IDENT-01: zero raw hex, zero text-gray-* — all via @theme token utilities.
 */

import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'
import { getSeoPages } from '@/lib/sanity/queries'

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
  const seoPages = await getSeoPages(locale)

  const navLinks = [
    { href: '#services', label: nav('services') },
    { href: '#pricing', label: nav('pricing') },
    { href: '#work', label: nav('work') },
    { href: '#contact', label: nav('contact') },
  ]

  return (
    <footer className="bg-surface-dark text-on-dark">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-12 md:py-16">

        {/* Row 1: Logo + Nav + Legal — clean 3-col */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10 md:gap-16">
          {/* Logo + tagline */}
          <div className="flex flex-col gap-3 md:max-w-[200px]">
            <a href="#hero" aria-label="BrightByte Berlin, zur Startseite">
              <Image
                src="/logo-dark.svg"
                alt="BrightByte Berlin"
                width={140}
                height={32}
                unoptimized
                className="h-7 w-auto"
              />
            </a>
            <p className="text-sm text-muted-on-dark leading-relaxed">
              {t('tagline')}
            </p>
          </div>

          {/* Nav links — horizontal on desktop */}
          <nav aria-label="Footer Navigation" className="flex flex-wrap gap-x-8 gap-y-2">
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="text-sm text-on-dark [transition-duration:150ms] [transition-timing-function:var(--ease-standard)] transition-opacity hover:opacity-70"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Legal + email */}
          <div className="flex flex-col gap-2 md:items-end">
            <div className="flex gap-6">
              <Link
                href="/impressum"
                locale={locale as 'de' | 'en'}
                className="text-sm text-muted-on-dark [transition-duration:150ms] [transition-timing-function:var(--ease-standard)] transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                {t('impressum')}
              </Link>
              <Link
                href="/datenschutz"
                locale={locale as 'de' | 'en'}
                className="text-sm text-muted-on-dark [transition-duration:150ms] [transition-timing-function:var(--ease-standard)] transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                {t('datenschutz')}
              </Link>
            </div>
            <a
              href={`mailto:${email}`}
              className="text-sm text-on-dark underline decoration-accent underline-offset-3 [transition-duration:150ms] [transition-timing-function:var(--ease-standard)] transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              {email}
            </a>
          </div>
        </div>

        {/* Row 2: SEO pages — quiet inline flowing list, separated by middots */}
        {seoPages.length > 0 && (
          <nav
            aria-label="Leistungsseiten"
            className="mt-10 pt-8 border-t border-muted-on-dark/15"
          >
            <div className="flex flex-wrap gap-x-1.5 gap-y-1 text-[11px] text-muted-on-dark/60 leading-relaxed">
              {seoPages.map((page, i) => (
                <span key={page._id}>
                  <Link
                    href={`/s/${page.slug?.current}`}
                    locale={locale as 'de' | 'en'}
                    className="hover:text-on-dark [transition-duration:150ms] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {page.title ?? page.slug?.current}
                  </Link>
                  {i < seoPages.length - 1 && (
                    <span className="ml-1.5" aria-hidden="true">&middot;</span>
                  )}
                </span>
              ))}
            </div>
          </nav>
        )}

        {/* Row 3: Copyright */}
        <div className="mt-8 pt-6 border-t border-muted-on-dark/15">
          <p className="text-xs text-muted-on-dark/50">
            &copy; {currentYear} {t('copyright')}
          </p>
        </div>
      </div>
    </footer>
  )
}
