import { defineConfig, devices } from "@playwright/test";

/**
 * End to end tests run against the real API and the production build.
 * Start both first (see docs/TESTING.md), or let Playwright start them.
 */
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: { baseURL: "http://localhost:3000", trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    { command: "RATE_LIMITS=off DATABASE_PATH=./data/e2e.db npm start --prefix ../backend", url: "http://localhost:4000/api/health", reuseExistingServer: true, timeout: 60_000 },
    { command: "npm run build && npm start", url: "http://localhost:3000", reuseExistingServer: true, timeout: 180_000 },
  ],
});
