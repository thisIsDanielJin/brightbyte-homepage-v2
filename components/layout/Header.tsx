/**
 * components/layout/Header.tsx — Sticky header with frosted backdrop, anchor nav,
 * active-section highlight, and mobile hamburger overlay.
 *
 * SEC-08: sticky top-0, h-16, anchor nav (#services,#pricing,#work,#contact),
 *   frosted backdrop on scroll, hamburger overlay at 375px.
 * IDENT-01: zero raw hex, zero text-gray-* — all via @theme token utilities.
 * D-04: in-page anchor hrefs (#...) are plain <a> tags; locale routes use next-intl Link.
 * D-09: locale from URL segment only — LocaleSwitcher reads from useLocale() (URL-derived).
 *
 * Active section: IntersectionObserver on section[id] elements (no scroll listeners).
 * rootMargin: '-30% 0px -60% 0px' prevents rapid flickering on scroll.
 *
 * Source: 04-RESEARCH.md Pattern 1; 04-UI-SPEC.md Header spec.
 */
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import LocaleSwitcher from '@/components/LocaleSwitcher'
import { useTranslations } from 'next-intl'

const NAV_SECTIONS = ['services', 'pricing', 'work', 'contact'] as const

export function Header() {
  const t = useTranslations('Nav')

  // Scroll state — transparent at top, frosted when scrolled
  const [scrolled, setScrolled] = useState(false)

  // Mobile nav overlay open/close
  const [mobileOpen, setMobileOpen] = useState(false)

  // Active section id for nav highlight
  const [activeSection, setActiveSection] = useState<string | null>(null)

  // Use a ref to hold setActiveSection so the IO callback doesn't need it as a dep
  const setActiveSectionRef = useRef(setActiveSection)
  setActiveSectionRef.current = setActiveSection

  // Scroll listener — toggles frosted backdrop
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll() // initial check
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // IntersectionObserver for active section highlight
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSectionRef.current(entry.target.id)
          }
        })
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
    )

    const sections = NAV_SECTIONS.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    sections.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  // Close mobile nav on route change / section click
  const closeMobileNav = useCallback(() => setMobileOpen(false), [])

  const navLinks = NAV_SECTIONS.map((id) => ({
    id,
    href: `#${id}`,
    label: t(id),
  }))

  const isActive = (id: string) => activeSection === id

  return (
    <header
      className={`sticky top-0 z-50 w-full h-16 transition-all [transition-duration:150ms] [transition-timing-function:var(--ease-standard)] ${
        scrolled
          ? 'bg-surface-subtle/90 backdrop-blur-sm shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-full flex items-center justify-between">
        {/* Logo */}
        <a href="#hero" onClick={closeMobileNav} aria-label="BrightByte Berlin — zur Startseite">
          <Image
            src="/logo-light.svg"
            alt="BrightByte Berlin"
            width={140}
            height={32}
            priority
            unoptimized
            className="h-8 w-auto"
          />
        </a>

        {/* Desktop nav — hidden on mobile */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Hauptnavigation">
          {navLinks.map(({ id, href, label }) => (
            <a
              key={id}
              href={href}
              className={`text-sm font-medium [transition-duration:150ms] [transition-timing-function:var(--ease-standard)] transition-colors ${
                isActive(id)
                  ? 'text-primary border-b-2 border-accent pb-0.5'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              {label}
            </a>
          ))}
          <LocaleSwitcher />
        </nav>

        {/* Mobile hamburger — shown only on mobile */}
        <button
          type="button"
          className="md:hidden p-2 text-secondary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-sm"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          aria-label={mobileOpen ? t('closeMenu') : t('openMenu')}
        >
          {mobileOpen ? (
            // Close icon
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            // Hamburger icon
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile nav overlay — full-width dropdown */}
      {mobileOpen && (
        <div
          id="mobile-nav"
          className="md:hidden absolute top-16 left-0 right-0 bg-surface border-t border-border shadow-sm z-50"
          role="navigation"
          aria-label="Mobile Navigation"
        >
          <nav className="px-4 py-6 flex flex-col gap-4">
            {navLinks.map(({ id, href, label }) => (
              <a
                key={id}
                href={href}
                onClick={closeMobileNav}
                className={`text-base font-medium py-2 [transition-duration:150ms] [transition-timing-function:var(--ease-standard)] transition-colors ${
                  isActive(id) ? 'text-primary' : 'text-secondary hover:text-primary'
                }`}
              >
                {label}
              </a>
            ))}
            <div className="pt-2 border-t border-border">
              <LocaleSwitcher />
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
