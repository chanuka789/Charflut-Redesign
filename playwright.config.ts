import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.BASE_URL ?? "http://127.0.0.1:3200";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  retries: 0,
  reporter: [["list"]],
  use: { baseURL, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  // Without BASE_URL, test the production build locally.
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: "PORT=3200 HOSTNAME=127.0.0.1 node .next/standalone/server.js",
        url: `${baseURL}/api/health`,
        reuseExistingServer: false,
        timeout: 60_000,
      },
});
