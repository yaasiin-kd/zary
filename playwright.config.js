import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;
// Optional: point at a custom Chromium build (handy in sandboxes where Playwright can't download browsers).
const customChromium = process.env.PW_CHROMIUM_PATH
  ? { launchOptions: { executablePath: process.env.PW_CHROMIUM_PATH, args: ['--no-sandbox'] } }
  : {};

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }], ['list']]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: 'en-GB',
    timezoneId: 'Africa/Lome',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Video needs Playwright's own ffmpeg, which isn't there when using a custom Chromium
    video: process.env.PW_CHROMIUM_PATH ? 'off' : 'retain-on-failure',
  },
  projects: [
    // Full suite on desktop Chrome
    { name: 'chromium', use: { ...devices['Desktop Chrome'], ...customChromium }, testIgnore: /responsive\.spec/ },
    // Phone layout checks
    { name: 'mobile', use: { ...devices['Pixel 7'], ...customChromium }, testMatch: /responsive\.spec/ },
    // Smoke suite on the other engines
    { name: 'firefox', use: { ...devices['Desktop Firefox'] }, grep: /@smoke/ },
    { name: 'webkit', use: { ...devices['Desktop Safari'] }, grep: /@smoke/ },
  ],
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
