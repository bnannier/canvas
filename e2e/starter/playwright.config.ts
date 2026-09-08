import { defineConfig, devices } from "@playwright/test";
import { resolve } from "node:path";

const CI = !!process.env.CI;
const repo = resolve(__dirname, "../..");
// This suite validates the ordinary registry-installed starter. Candidate builds
// have a separate identity gate and intentionally enabled smoke routes.
const dist = resolve(repo, "examples/starter/dist");
const port = 4192;
const baseURL = process.env.STARTER_BASE_URL ?? `http://127.0.0.1:${port}`;
// Quote paths for the webServer shell, including temporary consumer paths with spaces.
const quote = (value: string) => `'${value.replaceAll("'", "'\\''")}'`;

export default defineConfig({
  testDir: ".",
  testMatch: "starter.spec.ts",
  fullyParallel: true,
  forbidOnly: CI,
  retries: 0,
  workers: CI ? 4 : undefined,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  outputDir: resolve(repo, "test-results/starter"),
  reporter: [[CI ? "github" : "list"], ["html", { outputFolder: resolve(repo, "playwright-report/starter"), open: "never" }]],
  use: {
    baseURL,
    viewport: { width: 1280, height: 900 },
    locale: "en-US",
    timezoneId: "UTC",
    colorScheme: "light",
    contextOptions: { reducedMotion: "reduce" },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    ...(["chromium", "firefox", "webkit"] as const).map((browserName) => ({
      name: `starter-${browserName}`,
      use: { browserName },
    })),
    { name: "starter-touch-chromium", use: { ...devices["Pixel 7"], browserName: "chromium" } },
    { name: "starter-touch-webkit", use: { ...devices["iPhone 13"], browserName: "webkit" } },
  ],
  webServer: process.env.STARTER_BASE_URL ? undefined : {
    command: `bun e2e/support/serve-dist.ts --root ${quote(dist)} --port ${port}`,
    cwd: repo,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 20_000,
    stdout: "pipe",
  },
});
