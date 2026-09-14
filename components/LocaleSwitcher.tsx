/**
 * components/LocaleSwitcher.tsx — Path-preserving language switcher.
 *
 * Implements I18N-03: pure <Link> navigation switching /de/... ↔ /en/...
 * while preserving the current path segment. Zero client-side locale state
 * (only open/close UI state for the dropdown).
 *
 * UI: a translate-icon trigger button that reveals a dropdown of full locale
 * names ("Deutsch" / "English"). Opens on hover (desktop pointer), on click
 * (touch), and on keyboard focus; closes on mouse-leave, blur-away, or Escape.
 *
 * Design invariants enforced:
 *   - Imports Link + usePathname from @/i18n/navigation ONLY (Pitfall 4):
 *     usePathname() returns the locale-STRIPPED path so <Link href={pathname}
 *     locale={otherLocale}> prefixes exactly once — never /de/de/...
 *   - useLocale() reads locale from URL segment (not state) — D-09
 *   - Navigation is pure <Link> — no router.replace(), no local storage
 *   - Styling: @theme token utilities only — no raw hex, no text-gray-* (IDENT-01)
 *   - Accessible: hover has click + keyboard-focus fallback (not hover-only)
 *
 * Sources:
 *   next-intl.dev/docs/routing/navigation#link
 *   .planning/phases/02-i18n-shell-routing/02-RESEARCH.md §Pattern 5
 *   .planning/phases/02-i18n-shell-routing/02-CONTEXT.md I18N-03, D-06, D-09
 */
'use client'

import { useState, useRef, useCallback } from 'react'
import { Link, usePathname } from '@/i18n/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { routing } from '@/i18n/routing'

export default function LocaleSwitcher() {
  // usePathname from @/i18n/navigation returns the locale-stripped path.
  // e.g. on /de/about → "/about", on /de → "/"
  const pathname = usePathname()

  // useLocale() reads the active locale from the URL segment (URL-derived, D-09).
  const currentLocale = useLocale()

  // Locale names + aria-label from message files (D-02: no hardcoded strings).
  const t = useTranslations('LocaleSwitcher')

  // Dropdown open/close — the ONLY client state in this component.
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Close when focus leaves the whole switcher (keyboard tab-away).
  // relatedTarget is the element receiving focus; if it's outside, close.
  const handleBlur = useCallback((e: React.FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setOpen(false)
    }
  }, [])

  // Escape closes and returns focus to the trigger.
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
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
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
        className="flex items-center p-2 rounded-sm text-secondary hover:text-primary [transition-duration:150ms] [transition-timing-function:var(--ease-standard)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        {/* Material "translate" glyph — inherits currentColor, no asset needed */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
        </svg>
      </button>

      {open && (
        <ul
          role="menu"
          aria-label={t('label')}
          className="absolute right-0 top-full mt-1 min-w-[9rem] rounded-md border border-border bg-surface shadow-sm py-1 z-50"
        >
          {routing.locales.map((locale) => (
            <li key={locale} role="none">
              <Link
                href={pathname}
                locale={locale}
                role="menuitem"
                aria-current={locale === currentLocale ? 'page' : undefined}
                onClick={() => setOpen(false)}
                className={`block px-4 py-2 text-base [transition-duration:150ms] [transition-timing-function:var(--ease-standard)] transition-colors ${
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
