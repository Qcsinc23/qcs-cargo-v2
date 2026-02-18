import type { PlaywrightTestConfig } from '@playwright/test';
import { loadEnv } from 'vite';

const mode = process.env.NODE_ENV || 'test';
const env = loadEnv(mode, process.cwd(), '');

for (const [key, value] of Object.entries(env)) {
  if (process.env[key] === undefined) {
    process.env[key] = value;
  }
}

const config: PlaywrightTestConfig = {
  webServer: {
    command: 'npm run dev -- --port 5179',
    port: 5179,
    reuseExistingServer: true, // Use existing dev server
    timeout: 120000
  },
  testDir: 'tests/e2e',
  testMatch: /(.+\.)?(test|spec)\.[jt]s/,
  timeout: 30000,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:5179',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' }
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' }
    },
    {
      name: 'webkit',
      use: { browserName: 'webkit' }
    },
    {
      name: 'a11y',
      testDir: 'tests/a11y',
      use: { browserName: 'chromium' }
    }
  ]
};

export default config;
