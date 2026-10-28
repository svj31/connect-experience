import { defineConfig, devices } from "@playwright/test";

/**
 * End to end tests run against the real API and the production build.
 * Start both first (see docs/TESTING.md), or let Playwright start them.
 */
// Override the ports to test next to an app that is already running on 3000 and 4000.
const WEB = Number(process.env.E2E_WEB_PORT ?? 3000);
const API = Number(process.env.E2E_API_PORT ?? 4000);
const isolated = WEB !== 3000 || API !== 4000;
const webEnv = isolated ? `API_ORIGIN=http://localhost:${API} NEXT_PUBLIC_SOCKET_URL=http://localhost:${API} NEXT_DIST_DIR=.next-e2e ` : "";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: { baseURL: `http://localhost:${WEB}`, trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    { command: `PORT=${API} WEB_ORIGIN=http://localhost:${WEB} RATE_LIMITS=off DATABASE_PATH=./data/e2e.db npm start --prefix ../backend`, url: `http://localhost:${API}/api/health`, reuseExistingServer: !isolated, timeout: 60_000 },
    { command: `${webEnv}npm run build && ${webEnv}npx next start -p ${WEB}`, url: `http://localhost:${WEB}`, reuseExistingServer: !isolated, timeout: 240_000 },
  ],
});
