import { defineConfig, devices } from "@playwright/test";
import { resolve } from "node:path";

const CI = !!process.env.CI;
const repo = resolve(__dirname, "../..");
// The smoke app's web export of a prepared candidate (scripts/native-smoke.mjs prepare,
// then build --platform web): the sealed package, never the kit's source.
const output = process.env.SMOKE_OUTPUT;
if (!output) throw new Error("SMOKE_OUTPUT must name a prepared native smoke output with a web export");
const dist = resolve(output, "web-dist");
const port = 4193;
const baseURL = `http://127.0.0.1:${port}`;
const quote = (value: string) => `'${value.replaceAll("'", "'\\''")}'`;

// The three form factors Canvas lays out for: a desktop window, a tablet and a phone.
export default defineConfig({
  testDir: ".",
  testMatch: "smoke-app.spec.ts",
  fullyParallel: true,
  forbidOnly: CI,
  retries: 0,
  workers: CI ? 4 : undefined,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  outputDir: resolve(repo, "test-results/smoke-app"),
  reporter: [[CI ? "github" : "list"], ["html", { outputFolder: resolve(repo, "playwright-report/smoke-app"), open: "never" }]],
  use: {
    baseURL,
    locale: "en-US",
    timezoneId: "UTC",
    colorScheme: "light",
    contextOptions: { reducedMotion: "reduce" },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    { name: "smoke-desktop", use: { browserName: "chromium", viewport: { width: 1280, height: 900 } } },
    { name: "smoke-tablet", use: { ...devices["iPad (gen 7)"], browserName: "webkit" } },
    { name: "smoke-phone", use: { ...devices["Pixel 7"], browserName: "chromium" } },
  ],
  webServer: {
    command: `bun e2e/support/serve-dist.ts --root ${quote(dist)} --port ${port}`,
    cwd: repo,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 20_000,
    stdout: "pipe",
  },
});
