/**
 * Before any cell: read the build identity of the export the cells are about to capture,
 * and refuse a stale one.
 *
 * It runs here, after Playwright has started (or reused) the web server, because this is
 * the server the cells will actually hit: the configuration reuses a server already on the
 * export port, which may be another checkout's. /testing/diagnostics reports the running
 * bundle's source fingerprint (docs/scripts/build-info.cjs, embedded in the bundle at
 * export time), and it must equal the fingerprint of this checkout's source now, unless
 * the run was started with --allow-stale (AUDIT_ALLOW_STALE=1). Either way the identity
 * goes to the run directory for `bun run audit:web` to fold into the manifest.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium, type FullConfig } from "@playwright/test";
import { BASE_PATH } from "../support/docs";
import { stubRegistry } from "../support/fixtures";
import { ROOT } from "../support/routes";
import { AUDIT_ENV, SERVED_FILE, freshness, type ServedIdentity } from "../../tools/audit/web-capture.ts";
import { auditRunDir } from "./cell";

const { sourceFingerprint } = require("../../docs/scripts/build-info.cjs") as { sourceFingerprint(root: string): string };

const FIELDS = {
  sourceFingerprint: "source-fingerprint",
  candidateRevision: "candidate-revision",
  sourceDirty: "source-dirty",
  packageVersion: "package-version",
  inputMode: "input-mode",
} as const;

async function readServed(baseURL: string, ignoreHTTPSErrors: boolean): Promise<ServedIdentity> {
  const url = `${baseURL}${BASE_PATH}/testing/diagnostics`;
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ ignoreHTTPSErrors });
    await stubRegistry(context);
    const page = await context.newPage();
    await page.goto(url, { waitUntil: "load" });
    // The fingerprint renders once the bundle has hydrated and the route has loaded.
    await page.locator("html[data-hydrated]").waitFor({ state: "attached", timeout: 30_000 });
    const fingerprint = page.getByTestId(`diagnostic-${FIELDS.sourceFingerprint}`);
    await fingerprint.waitFor({ state: "attached", timeout: 30_000 });
    const identity: Record<string, string | null> = {};
    for (const [key, field] of Object.entries(FIELDS)) {
      const node = page.getByTestId(`diagnostic-${field}`);
      const text = (await node.count()) ? ((await node.textContent()) ?? "").trim() : "";
      identity[key] = text && text !== "unavailable" ? text : null;
    }
    return { url, ...identity } as unknown as ServedIdentity;
  } finally {
    await browser.close();
  }
}

export default async function globalSetup(config: FullConfig): Promise<void> {
  const runDir = auditRunDir();
  const use = config.projects[0]?.use ?? {};
  if (!use.baseURL) throw new Error("the audit configuration has no baseURL");
  const served = await readServed(use.baseURL, use.ignoreHTTPSErrors ?? false);
  const source = sourceFingerprint(ROOT);
  const verdict = freshness(served, source);
  const allowStale = process.env[AUDIT_ENV.allowStale] === "1";
  writeFileSync(join(runDir, SERVED_FILE), `${JSON.stringify({ ...served, checkoutFingerprint: source, ...verdict, allowStale }, null, 2)}\n`);
  if (!verdict.fresh && !allowStale) throw new Error(`refusing a stale export: ${verdict.reason}`);
}
