import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration — Phase 4 Wave 0
 *
 * Projects:
 *   - mobile-375:  375×812 viewport (iOS portrait — the spec breakpoint)
 *   - desktop-1440: 1440×900 viewport (wide desktop — the spec breakpoint)
 *
 * baseURL: http://localhost:3000 (Next.js dev server)
 * webServer: starts `next start` before tests; reuses existing server if already running.
 * testDir: ./tests
 * No watch-mode flags.
 *
 * See: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: 'mobile-375',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 375, height: 812 },
      },
    },
    {
      name: 'desktop-1440',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
