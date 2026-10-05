/**
 * components/LocaleSwitcher.tsx — Path-preserving language switcher.
 *
 * Click-toggle dropdown (not hover-only, which was unreachable).
 * Opens on click, closes on outside click, blur-away, or Escape.
 * Hover also opens on desktop for discoverability.
 *
 * IDENT-01: token utilities only.
 */
'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Link, usePathname } from '@/i18n/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { routing } from '@/i18n/routing'

export default function LocaleSwitcher() {
  const pathname = usePathname()
  const currentLocale = useLocale()
  const t = useTranslations('LocaleSwitcher')

  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Close when focus leaves the whole switcher
  const handleBlur = useCallback((e: React.FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setOpen(false)
    }
  }, [])

  // Escape closes and returns focus to the trigger
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      setOpen(false)
      buttonRef.current?.focus()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative"
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={t('label')}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 px-2 py-1.5 text-sm font-medium text-secondary hover:text-primary [transition-duration:150ms] [transition-timing-function:var(--ease-standard)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        <span className="uppercase">{currentLocale}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`transition-transform [transition-duration:150ms] ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <ul
          role="menu"
          aria-label={t('label')}
          className="absolute right-0 top-full mt-1 min-w-[9rem] border border-border bg-surface shadow-sm py-1 z-50"
        >
          {routing.locales.map((locale) => (
            <li key={locale} role="none">
              <Link
                href={pathname}
                locale={locale}
                role="menuitem"
                aria-current={locale === currentLocale ? 'page' : undefined}
                onClick={() => setOpen(false)}
                className={`block px-4 py-2.5 text-sm [transition-duration:150ms] [transition-timing-function:var(--ease-standard)] transition-colors ${
                  locale === currentLocale
                    ? 'text-primary font-semibold bg-surface-subtle'
                    : 'text-secondary hover:text-primary hover:bg-surface-subtle'
                }`}
              >
                {t(locale)}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
