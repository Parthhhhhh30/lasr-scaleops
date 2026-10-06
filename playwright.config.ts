import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";
const systemBrowser =
  process.env.PLAYWRIGHT_EXECUTABLE_PATH ??
  (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined);
const publicBaseURL = process.env.PLAYWRIGHT_BASE_URL;
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: publicBaseURL ?? "http://127.0.0.1:3000",
    trace: "retain-on-failure",
    launchOptions: { executablePath: systemBrowser },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: publicBaseURL
    ? undefined
    : {
        command: "npm run start",
        url: "http://127.0.0.1:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
      },
});
