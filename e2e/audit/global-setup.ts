/**
 * Before any cell: read what the cells are about to capture, and refuse what is not this
 * checkout's source.
 *
 * It runs here, after Playwright has started (or reused) the web server, because this is
 * the server the cells will actually hit: the configuration reuses a server already on the
 * export port, which may be another checkout's. /testing/diagnostics is opened on it, and
 * two kinds of server are told apart by how that page gets its code
 * (tools/audit/web-capture.ts `classifyServed`):
 *
 *   static export     the hashed files `bun run build:web` wrote. The page reports the
 *                     bundle's source fingerprint (docs/scripts/build-info.cjs, embedded at
 *                     export time), and it must equal this checkout's source fingerprint now.
 *   live dev server   Metro (`bun run dev` in docs/, the fixer loop's --base), which builds
 *                     the page's bundle from the source on disk when it is asked for it, so
 *                     a fingerprint it reports says nothing about what the cells will see.
 *                     What matters is whose source it is: the project root its /status
 *                     names must be this checkout's docs app.
 *
 * A mismatch refuses the run unless it was started with --allow-stale (AUDIT_ALLOW_STALE=1).
 * Either way the identity and the verdict go to the run directory for `bun run audit:web`
 * to fold into the manifest.
 */
import { realpathSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium, type BrowserContext, type FullConfig } from "@playwright/test";
import { BASE_PATH } from "../support/docs";
import { stubRegistry } from "../support/fixtures";
import { ROOT } from "../support/routes";
import {
  AUDIT_ENV,
  PROJECT_ROOT_HEADER,
  SERVED_FILE,
  classifyServed,
  freshness,
  type CheckoutIdentity,
  type PackagerStatus,
  type ServedIdentity,
  type ServedRecord,
} from "../../tools/audit/web-capture.ts";
import { auditRunDir } from "./cell";

const { sourceFingerprint } = require("../../docs/scripts/build-info.cjs") as { sourceFingerprint(root: string): string };

const FIELDS = {
  sourceFingerprint: "source-fingerprint",
  candidateRevision: "candidate-revision",
  sourceDirty: "source-dirty",
  packageVersion: "package-version",
  inputMode: "input-mode",
} as const;

/** A path with its symlinks resolved, or as given when it does not exist here. */
function resolved(path: string): string {
  try {
    return realpathSync(path);
  } catch {
    return path;
  }
}

/** What the server answers on Metro's `/status`, at its root; null when it does not answer. */
async function readPackagerStatus(context: BrowserContext, baseURL: string): Promise<PackagerStatus | null> {
  try {
    const response = await context.request.get(new URL("/status", baseURL).href, { timeout: 10_000, maxRedirects: 0 });
    return { body: (await response.text()).slice(0, 200), projectRoot: response.headers()[PROJECT_ROOT_HEADER] ?? null };
  } catch {
    return null;
  }
}

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
    const scripts = await page.evaluate(() => Array.from(document.scripts, (script) => script.src).filter(Boolean));
    const served = classifyServed(scripts, await readPackagerStatus(context, baseURL));
    return {
      url,
      ...served,
      projectRoot: served.projectRoot === null ? null : resolved(served.projectRoot),
      ...identity,
    } as ServedIdentity;
  } finally {
    await browser.close();
  }
}

export default async function globalSetup(config: FullConfig): Promise<void> {
  const runDir = auditRunDir();
  const use = config.projects[0]?.use ?? {};
  if (!use.baseURL) throw new Error("the audit configuration has no baseURL");
  const served = await readServed(use.baseURL, use.ignoreHTTPSErrors ?? false);
  const checkout: CheckoutIdentity = { fingerprint: sourceFingerprint(ROOT), docsRoot: resolved(join(ROOT, "docs")) };
  const verdict = freshness(served, checkout);
  const allowStale = process.env[AUDIT_ENV.allowStale] === "1";
  const record: ServedRecord = { ...served, ...verdict, checkout, allowStale };
  writeFileSync(join(runDir, SERVED_FILE), `${JSON.stringify(record, null, 2)}\n`);
  if (!verdict.fresh && !allowStale) throw new Error(`refusing the ${served.mode}: ${verdict.reason}`);
}
