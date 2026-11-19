import { defineConfig, devices } from '@playwright/test';

const live = process.argv.includes('--project=live');
if (!live && process.env.E2E_BASE_URL) {
  throw new Error('E2E_BASE_URL is supported only by test:e2e:live; mock tests require the isolated local server.');
}
const baseURL = process.env.E2E_BASE_URL || 'http://127.0.0.1:4173';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'mock', testMatch: /booking\.spec\.ts/, use: { ...devices['Desktop Chrome'] } },
    { name: 'live', testMatch: /booking\.live\.spec\.ts/, use: { ...devices['Desktop Chrome'], trace: 'off', screenshot: 'off' } },
  ],
  webServer: process.env.E2E_BASE_URL ? undefined : {
    command: 'pnpm dev --host 127.0.0.1 --port 4173 --strictPort',
    url: baseURL,
    reuseExistingServer: false,
    env: live ? {} : {
      VITE_SUPABASE_URL: 'https://e2e.supabase.invalid',
      VITE_SUPABASE_ANON_KEY: 'e2e-public-placeholder',
      VITE_API_URL: 'http://127.0.0.1:8080/api',
    },
  },
});
