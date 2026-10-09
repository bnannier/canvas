/**
 * The component audit's web capture (plan 1c; `bun run audit:web`, tools/audit/run-web.ts):
 * the suite's own browser settings, pointed at e2e/audit, which `bun run e2e` never runs
 * (its testMatch is *.e2e.ts; these are *.audit.ts).
 *
 *   Chromium only     the probe reads paint stacks and the frame waits use Chromium's
 *                     DevTools protocol (e2e/support/docs.ts `animationFrames`).
 *   DPR 2             every card.png is a retina picture, the density the reviewers read.
 *   reduced motion    as the suite: the kit reads prefers-reduced-motion, so the loops and
 *                     transitions are still for the photograph.
 *   fixed clock       every cell pins page.clock to FIXED_TIME (e2e/support/docs.ts).
 *   AUDIT_WORKERS     default 6. Web and native sweeps never overlap (24 GB of RAM).
 *   the export        the suite's own docs server (DOCS_SERVER, serve-dist on 4173 with the
 *                     production headers, reused when one is already up), or whatever
 *                     E2E_BASE_URL names (`--base`, e.g. Metro on 8081 in the fixer loop).
 *                     The global setup reads /testing/diagnostics off it and refuses an
 *                     export whose source fingerprint is not this checkout's.
 *
 * No retries and no traces: a cell that fails is recorded on the cell (e2e/audit/cell.ts)
 * and the run goes on. Playwright's own output goes under .audit/, never test-results/, so
 * an audit run cannot clear an e2e run's results.
 */
import { defineConfig } from "@playwright/test";
import base, { CHROMIUM_ARGS, DOCS_SERVER } from "./playwright.config";
import { workersFrom } from "./tools/audit/web-capture.ts";

export default defineConfig({
  testDir: "./e2e/audit",
  testMatch: "**/*.audit.ts",
  outputDir: "./.audit/test-results",
  globalSetup: "./e2e/audit/global-setup.ts",
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  workers: workersFrom(process.env),
  // Each test raises its own timeout from its cell count (e2e/audit/variants.audit.ts).
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [["list"]],
  use: {
    ...base.use,
    deviceScaleFactor: 2,
    contextOptions: { reducedMotion: "reduce" },
    launchOptions: { args: CHROMIUM_ARGS },
    trace: "off",
    screenshot: "off",
    video: "off",
  },
  projects: [{ name: "audit-web", use: { browserName: "chromium" } }],
  webServer: process.env.E2E_BASE_URL ? undefined : DOCS_SERVER,
});
