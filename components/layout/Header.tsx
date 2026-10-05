/**
 * components/layout/Header.tsx — Clean, modern sticky header.
 *
 * Minimal: logo left, nav links center-right, CTA right.
 * No active-section underline (too busy). Subtle text weight change instead.
 * Contact CTA matches the hero's dark-fill button style.
 * Frosted backdrop on scroll.
 */
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from '@/i18n/navigation'
import LocaleSwitcher from '@/components/LocaleSwitcher'
import { useTranslations } from 'next-intl'

const NAV_SECTIONS = ['services', 'pricing', 'work', 'contact'] as const

export function Header() {
  const t = useTranslations('Nav')
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const setActiveSectionRef = useRef(setActiveSection)
  setActiveSectionRef.current = setActiveSection

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSectionRef.current(entry.target.id)
        })
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 },
    )
    const sections = NAV_SECTIONS.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    sections.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const closeMobileNav = useCallback(() => setMobileOpen(false), [])

  const textNavLinks = NAV_SECTIONS.filter((id) => id !== 'contact').map((id) => ({
    id, href: `#${id}`, label: t(id),
  }))
  const contactHref = '#contact'
  const contactLabel = t('contact')
  const isActive = (id: string) => activeSection === id

  return (
    <header
      className={`sticky top-0 z-50 w-full h-16 [transition-duration:200ms] [transition-timing-function:var(--ease-standard)] transition-all ${
        scrolled ? 'bg-surface/80 backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <div className="h-full flex items-center justify-between px-6 md:px-8 lg:px-12 xl:px-[max(calc((100vw-90rem)/2+3rem),3rem)]">
        {/* Logo — text mark, clean */}
        <a
          href="#hero"
          onClick={closeMobileNav}
          className="text-lg font-bold text-primary tracking-[-0.02em] hover:opacity-80 transition-opacity"
          aria-label="BrightByte Berlin"
        >
          BrightByte
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {textNavLinks.map(({ id, href, label }) => (
            <a
              key={id}
              href={href}
              className={`text-sm px-3 py-1.5 [transition-duration:150ms] transition-colors ${
                isActive(id)
                  ? 'text-primary font-medium'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              {label}
            </a>
          ))}
          <div className="ml-1">
            <LocaleSwitcher />
          </div>
          <a
            href={contactHref}
            className="ml-3 inline-flex items-center justify-center bg-primary text-surface text-sm font-medium h-9 px-5 hover:bg-primary/85 [transition-duration:150ms] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            {contactLabel}
          </a>
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden p-2 text-secondary hover:text-primary"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          aria-label={mobileOpen ? t('closeMenu') : t('openMenu')}
        >
          {mobileOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div id="mobile-nav" className="md:hidden absolute top-16 left-0 right-0 bg-surface border-t border-border z-50" role="navigation">
          <nav className="px-6 py-6 flex flex-col gap-1">
            {textNavLinks.map(({ id, href, label }) => (
              <a key={id} href={href} onClick={closeMobileNav}
                className={`text-base py-3 [transition-duration:150ms] transition-colors ${isActive(id) ? 'text-primary font-medium' : 'text-secondary hover:text-primary'}`}
              >{label}</a>
            ))}
            <a href={contactHref} onClick={closeMobileNav}
              className="mt-2 inline-flex items-center justify-center bg-primary text-surface text-base font-medium h-12 px-6 hover:bg-primary/85 transition-colors"
            >{contactLabel}</a>
            <div className="pt-4 border-t border-border mt-2">
              <LocaleSwitcher />
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
