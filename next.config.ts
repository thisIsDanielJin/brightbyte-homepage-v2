import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

/**
 * Wire next-intl plugin — required for getRequestConfig to be found at build time.
 * requestConfig points to i18n/request.ts (the per-request locale + messages loader).
 * Source: next-intl.dev/docs/getting-started/app-router/with-i18n-routing
 *
 * [Rule 3 - Blocking] Auto-fix: plugin was missing, causing build failure
 * "Couldn't find next-intl config file".
 */
const withNextIntl = createNextIntlPlugin({
  requestConfig: './i18n/request.ts',
})

const nextConfig: NextConfig = {
  // Enable experimental Turbopack for faster dev builds
  // Note: production build still uses Webpack
}

export default withNextIntl(nextConfig)
