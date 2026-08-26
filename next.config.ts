import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import path from 'path'

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

// When running inside a git worktree (.claude/worktrees/<agent>/), node_modules
// lives three levels up in the main project root. Turbopack's workspace root
// detection only looks at the current directory for package-manager lockfiles;
// it doesn't walk up into the parent. Setting turbopack.root to the main project
// root tells Turbopack where to find node_modules.
// path.resolve(__dirname, '../../..') from worktree === main project root.
const projectRoot = path.resolve(__dirname).includes('worktrees')
  ? path.resolve(__dirname, '../../..')
  : path.resolve(__dirname)

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  // Lever 2 (05-05 D-12 LCP fix): inline the ~7KB render-blocking CSS chunk into
  // <head> as a <style> tag so FCP/LCP no longer wait on a CSS round-trip
  // (metricSavings FCP 150 / LCP 150). Production-build only, not dev.
  // Next 16 doc-supported; explicitly recommended for Tailwind / atomic CSS.
  // Source: node_modules/next/dist/docs/ inlineCss.md (verified this session).
  experimental: {
    inlineCss: true,
  },
}

export default withNextIntl(nextConfig)
