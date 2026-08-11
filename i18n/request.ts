/**
 * i18n/request.ts — Per-request config for next-intl.
 *
 * Resolves the active locale from next/root-params (Next.js 16.3+ pattern),
 * validates it against the supported locales allowlist (T-2-01 threat mitigation:
 * hasLocale prevents open redirect + path traversal via attacker-controlled locale param),
 * and loads the corresponding message JSON.
 *
 * MUST return `locale` explicitly — next-intl v4 breaking change from v3.
 *
 * Source: github.com/amannn/next-intl/blob/main/examples/example-app-router/src/i18n/request.ts
 * Pitfall 3: `import { locale as ... }` alias avoids segment-name collision.
 * next/root-params only supports named imports — the getter is named after the
 * dynamic segment folder ([locale] → locale). Namespace imports do not expose
 * the getter as a callable and will return undefined at runtime.
 */
import { locale as getLocale } from 'next/root-params'
import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  // Resolve locale from root-params when not supplied by the callback arg
  let locale = await requestLocale

  if (!locale) {
    // next/root-params getter is named after the segment folder: [locale] → locale()
    // Aliased as getLocale on import to avoid shadowing the `locale` variable (Pitfall 3)
    const paramValue = await getLocale()
    locale = paramValue ?? undefined
  }

  // V5 input validation — validate locale against the allowlist before any use.
  // hasLocale rejects attacker-controlled values; notFound() on invalid prevents
  // open redirect and path traversal (T-2-01 in plan threat model).
  if (!locale || !hasLocale(routing.locales, locale)) {
    notFound()
  }

  return {
    locale,  // REQUIRED: must be returned explicitly (next-intl v4 breaking change)
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
