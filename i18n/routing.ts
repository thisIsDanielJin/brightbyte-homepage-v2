/**
 * i18n/routing.ts — Single source of truth for locale routing config.
 *
 * D-03: localePrefix 'always' — /de/... and /en/... for all routes.
 * D-05: defaultLocale 'de' — root redirect always goes to /de.
 *
 * Shared by proxy.ts (createMiddleware) and i18n/navigation.ts (createNavigation).
 * Source: next-intl.dev/docs/getting-started/app-router/with-i18n-routing
 */
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['de', 'en'],
  defaultLocale: 'de',        // D-05: always redirect to /de
  localePrefix: 'always',     // D-03: /de/... and /en/... — no prefix-less URLs
  localeDetection: false,     // D-05: reject Accept-Language; root redirect is always /de
})
