import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 120000, // 2 min timeout to accommodate 1s slowMo across data-driven loops
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: [
    ['html', { open: 'never', outputFolder: 'reports/html-report' }],
    ['list']
  ],
  use: {
    baseURL: 'https://login.yahoo.com',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
    launchOptions: {
      slowMo: 1000, // 1 second delay between each browser action
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'Mobile_Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
});
