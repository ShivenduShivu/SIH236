import { defineConfig, devices } from '@playwright/test'
export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: { timeout: 7000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  outputDir: '../tmp/browser-results',
  use: {
    baseURL: process.env.PACKORA_TEST_URL || 'http://127.0.0.1:8000',
    channel: process.env.PACKORA_BROWSER_CHANNEL || 'msedge',
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } },
    {
      name: 'mobile',
      use: {
        ...devices['iPhone 13'],
        defaultBrowserType: 'chromium',
        channel: process.env.PACKORA_BROWSER_CHANNEL || 'msedge',
      },
    },
  ],
})
