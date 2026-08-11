import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration — Wave 0 setup
 *
 * baseURL: http://localhost:3000 (Next.js dev server)
 * webServer: starts `next dev` before tests; reuses existing server if already running.
 * testDir: ./tests
 * project: chromium only — fast single-browser CI (30s target per VALIDATION.md)
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
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
