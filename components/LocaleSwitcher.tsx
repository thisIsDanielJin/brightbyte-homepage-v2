/**
 * components/LocaleSwitcher.tsx — Path-preserving language switcher.
 *
 * Implements I18N-03: pure <Link> navigation switching /de/... ↔ /en/...
 * while preserving the current path segment. Zero client-side locale state.
 *
 * Design invariants enforced:
 *   - Imports Link + usePathname from @/i18n/navigation ONLY (Pitfall 4):
 *     usePathname() from @/i18n/navigation returns the locale-STRIPPED path
 *     (e.g. "/" not "/de/"), so <Link href={pathname} locale={otherLocale}>
 *     prefixes exactly once — never producing /de/de/... or /en/en/...
 *   - useLocale() from next-intl reads locale from URL segment (not state)
 *   - Pure <Link> navigation only — no client state hooks, no local storage, no router.replace()
 *   - Styling: @theme token utilities only — no raw hex, no text-gray-* (IDENT-01)
 *
 * Sources:
 *   next-intl.dev/docs/routing/navigation#link
 *   .planning/phases/02-i18n-shell-routing/02-RESEARCH.md §Pattern 5
 *   .planning/phases/02-i18n-shell-routing/02-CONTEXT.md I18N-03, D-06, D-09
 */
'use client'

import { Link, usePathname } from '@/i18n/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { routing } from '@/i18n/routing'

export default function LocaleSwitcher() {
  // usePathname from @/i18n/navigation returns the locale-stripped path.
  // e.g. on /de/about → "/about", on /de → "/"
  // This is critical: using next/navigation's usePathname would return the
  // full path including the locale prefix, causing double-prefix URLs.
  const pathname = usePathname()

  // useLocale() reads the active locale from the URL segment (via next-intl
  // server context) — this is NOT component state, it is URL-derived (D-09).
  const currentLocale = useLocale()

  // Locale names and aria-label from message files (D-02: no hardcoded strings).
  const t = useTranslations('LocaleSwitcher')

  return (
    <nav aria-label={t('label')}>
      {routing.locales.map((locale) => (
        <Link
          key={locale}
          href={pathname}
          locale={locale}
          aria-current={locale === currentLocale ? 'true' : undefined}
          className={
            locale === currentLocale
              ? 'text-primary font-medium'
              : 'text-secondary hover:text-primary'
          }
        >
          {t(locale)}
        </Link>
      ))}
    </nav>
  )
}
