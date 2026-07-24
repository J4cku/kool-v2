import { defineConfig, devices } from '@playwright/test';

/* Browser QA gate: builds the app, serves the production output, and drives
   every sitemap route in a real browser (see tests-e2e/routes.spec.ts).
   `next start` falls back to port 8080 when PORT is unset (see package.json). */
const PORT = 8080;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests-e2e',
  timeout: 60_000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI
    ? [['github'], ['list'], ['html', { open: 'never' }]]
    : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm build && pnpm start',
    url: `${BASE_URL}/pl`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
