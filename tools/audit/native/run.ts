// The native capture run: `bun run audit:native -- --platform=ios,android`. Photographs
// every component example (and every pattern and template page) in the audit app on
// the booted simulator and emulator, in each look and surface, through the in-app
// driver and the host in server.ts. Writes one run directory per platform:
//
//   .audit/runs/<stamp>-<ios|android>-<sha7>/
//     manifest.json                         the run: device, build, options, counts, timings
//     cells.jsonl                           one line per cell as it finishes
//     driver-log.jsonl                      console problems raised between items
//     <platform>/<slug>/<variant>/<look>.<surface>/{screen.png, card.png, probe.json, a11y.json}
//     <platform>-pages/<kind>-<slug>/<look>.<surface>/{...}
//
// Options:
//   --platform=ios,android   the platforms (default both, run at once)
//   --only=button,switch     component slugs and page ids (pattern-glass), or a page's slug
//                            no component has (inventory.ts `resolveNames`: `calendar` is
//                            the component, `template-calendar` its page)
//   --looks=blush,mint,dark  --surfaces=solid,glass   a subset of the six looks
//   --a11y=none|default|all  accessibility dumps: none; every variant in blush solid and the
//                            first example (and every page) in the other looks (default);
//                            every cell
//   --devices=ios:<udid>,android:<serial>   when more than one device is booted
//   --dev                    drive a Debug build (`audit:native:build -- --dev`, Metro)
//   --keep-motion            leave the OS's motion settings alone
//
// The audit app must be built from this checkout first (`bun run audit:native:build`):
// the host refuses a build whose source or native fingerprint differs. A run always ends:
// an app that stays silent through three relaunches in a row abandons its platform's run,
// which the manifest and the summary name. For the run, each device is put into a capture
// state (a 9:41 status bar, Android demo mode, reduced motion: iOS Reduce Motion, Android
// animation scales 0) and every change is undone on the way out, on success, failure or
// Ctrl-C.

import { execFileSync, spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { createRequire } from "node:module";
import { ROOT } from "../../../e2e/support/routes.ts";
import { components, LOOKS, pages, SURFACES, cellId, pageCellId, resolveNamesOrThrow, type Look, type Surface } from "../inventory.ts";
import type { AuditItem, AuditLook, AuditPlatform, HelloRequest } from "../../../docs/src/audit/protocol.ts";
import { findMaestro, MAESTRO_DIR } from "./a11y.ts";
import { AUDIT_APP_ID, parseDeviceOverrides, resolveDevice, type AuditDevice, type DeviceInfo } from "./devices.ts";
import { startAuditHost, ITEM_TIMEOUT_MS, MAX_ATTEMPTS, MAX_RELAUNCHES, STABLE_MAD, type AuditHost, type CellRecord, type PlatformRun, type QueueItem } from "./server.ts";

const require = createRequire(import.meta.url);
const { sourceFingerprint, nativeFingerprint } = require("../../../docs/scripts/build-info.cjs") as { sourceFingerprint(root: string): string; nativeFingerprint(root: string): string };

export type A11yPolicy = "none" | "default" | "all";

export interface RunOptions {
  platforms: AuditPlatform[];
  only: string[] | null;
  looks: Look[];
  surfaces: Surface[];
  a11y: A11yPolicy;
  devices: Partial<Record<AuditPlatform, string>>;
  dev: boolean;
  reduceMotion: boolean;
}

/** A look as the docs theme sets it. Dark Factory has one dark palette, so dark is spelled with blush. */
export function lookFor(look: Look, surface: Surface): AuditLook {
  if (look === "dark") return { scheme: "dark", surface, palette: "blush" };
  return { scheme: "light", surface, palette: look };
}

/**
 * Every item of a platform's run, look-major: all of one look and surface before the
 * next, so the app's theme changes once per look rather than once per item. Within a
 * look the order is the docs' own (components, then patterns and templates).
 */
export function buildQueue(platform: AuditPlatform, options: Pick<RunOptions, "only" | "looks" | "surfaces" | "a11y">): QueueItem[] {
  // The inventory's one name grammar (inventory.ts `resolveNames`): a component's slug names
  // the component alone, and a page is named by its id or by a slug no component has.
  const named = options.only ? resolveNamesOrThrow("--only", options.only) : null;
  const comps = components().filter((c) => !named || named.components.includes(c.slug));
  const pageList = pages().filter((p) => !named || named.pages.includes(p.id));
  const queue: QueueItem[] = [];
  const base = { settleMs: 0, scrollSettleMs: 0, deadlineMs: 0 };
  for (const look of options.looks) {
    for (const surface of options.surfaces) {
      const auditLook = lookFor(look, surface);
      const everywhere = options.a11y === "all";
      const baseline = options.a11y === "default" && look === "blush" && surface === "solid";
      for (const component of comps) {
        component.variants.forEach((variant, index) => {
          const item: AuditItem = {
            ...base,
            kind: "component",
            id: cellId({ platform, slug: component.slug, variant: variant.variant, look, surface }),
            route: variant.path,
            look: auditLook,
            slug: component.slug,
            variant: variant.variant,
            label: variant.label,
          };
          queue.push({ item, a11y: everywhere || baseline || (options.a11y === "default" && index === 0) });
        });
      }
      for (const page of pageList) {
        const item: AuditItem = { ...base, kind: "page", id: pageCellId({ platform, page: page.id, look, surface }), route: page.route, look: auditLook, page: page.id };
        queue.push({ item, a11y: options.a11y !== "none" });
      }
    }
  }
  return queue;
}

export function parseRunArgs(argv: string[]): RunOptions {
  const arg = (name: string) => argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
  const list = (name: string) => arg(name)?.split(",").map((s) => s.trim()).filter(Boolean);
  const platforms = list("platform") ?? ["ios", "android"];
  for (const p of platforms) if (p !== "ios" && p !== "android") throw new Error(`--platform takes ios and android, not "${p}"`);
  const looks = list("looks") ?? [...LOOKS];
  for (const l of looks) if (!(LOOKS as readonly string[]).includes(l)) throw new Error(`--looks takes ${LOOKS.join(", ")}, not "${l}"`);
  const surfaces = list("surfaces") ?? [...SURFACES];
  for (const s of surfaces) if (!(SURFACES as readonly string[]).includes(s)) throw new Error(`--surfaces takes ${SURFACES.join(", ")}, not "${s}"`);
  const a11y = arg("a11y") ?? "default";
  if (a11y !== "none" && a11y !== "default" && a11y !== "all") throw new Error(`--a11y takes none, default or all, not "${a11y}"`);
  return {
    platforms: platforms as AuditPlatform[],
    only: list("only") ?? null,
    looks: looks as Look[],
    surfaces: surfaces as Surface[],
    a11y,
    devices: parseDeviceOverrides(arg("devices")),
    dev: argv.includes("--dev"),
    reduceMotion: !argv.includes("--keep-motion"),
  };
}

/** A run's timestamp, UTC: 20261009T061230Z. */
export function runStamp(date = new Date()): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
}

interface PlatformSetup {
  run: PlatformRun;
  device: AuditDevice;
  info: DeviceInfo;
  prepared: string[];
  restored: string[] | null;
  started: number;
}

function summary(records: CellRecord[]) {
  const count = (status: CellRecord["status"]) => records.filter((r) => r.status === status).length;
  const shot = records.filter((r) => r.status !== "failed");
  const seconds = shot.map((r) => r.seconds);
  const mean = seconds.length > 0 ? seconds.reduce((a, b) => a + b, 0) / seconds.length : null;
  const sorted = [...seconds].sort((a, b) => a - b);
  return {
    cells: records.length,
    ok: count("ok"),
    unstable: count("unstable"),
    failed: count("failed"),
    retried: records.filter((r) => r.attempts > 1).length,
    segments: records.reduce((sum, r) => sum + r.segments, 0),
    secondsPerCell: mean === null ? null : Number(mean.toFixed(2)),
    secondsPerCellMedian: sorted.length > 0 ? Number(sorted[Math.floor(sorted.length / 2)].toFixed(2)) : null,
    a11y: { requested: records.filter((r) => r.a11y !== undefined).length, captured: records.filter((r) => r.a11y === "ok").length },
  };
}

async function writeManifest(setup: PlatformSetup, options: RunOptions, extra: { sha: string; fingerprint: string; nativeFingerprint: string; hello: HelloRequest | null; refused: string | null; abandoned: string | null; records: CellRecord[]; finished: number | null }) {
  const manifest = {
    schema: 1,
    run: setup.run.dir.split("/").pop(),
    platform: setup.run.platform,
    sourceRevision: extra.sha,
    sourceFingerprint: extra.fingerprint,
    nativeFingerprint: extra.nativeFingerprint,
    started: new Date(setup.started).toISOString(),
    finished: extra.finished === null ? null : new Date(extra.finished).toISOString(),
    wallSeconds: extra.finished === null ? null : Number(((extra.finished - setup.started) / 1000).toFixed(1)),
    device: setup.info,
    app: extra.hello ? {
      id: extra.hello.app.id, name: extra.hello.app.name, version: extra.hello.app.version, build: extra.hello.build,
      update: extra.hello.update, dev: extra.hello.dev, window: extra.hello.window, screen: extra.hello.screen, dpr: extra.hello.dpr,
      fontScale: extra.hello.fontScale, insets: extra.hello.insets, reduceMotion: extra.hello.reduceMotion,
      reduceTransparency: extra.hello.reduceTransparency, liquidGlass: extra.hello.liquidGlass, osVersion: extra.hello.osVersion, constants: extra.hello.constants,
    } : null,
    refused: extra.refused,
    abandoned: extra.abandoned,
    options: { only: options.only, looks: options.looks, surfaces: options.surfaces, a11y: options.a11y, dev: options.dev, reduceMotion: options.reduceMotion },
    host: { itemTimeoutSeconds: ITEM_TIMEOUT_MS / 1000, maxAttempts: MAX_ATTEMPTS, maxRelaunches: MAX_RELAUNCHES, stableMad: STABLE_MAD },
    devicePrepared: setup.prepared,
    deviceRestored: setup.restored,
    queued: setup.run.queue.length,
    summary: summary(extra.records),
  };
  await writeFile(join(setup.run.dir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
}

async function main() {
  const options = parseRunArgs(process.argv.slice(2));
  // iOS needs Maestro twice over: for the tab bar's frame (server.ts systemChrome) and for
  // the accessibility dumps.
  if (options.platforms.includes("ios") && !findMaestro()) {
    throw new Error(`iOS runs need the pinned Maestro: node scripts/install-maestro.mjs ${relative(ROOT, MAESTRO_DIR)} (JDK 17 at JAVA_HOME or /opt/homebrew/opt/openjdk@17)`);
  }
  const sha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: ROOT, encoding: "utf8" }).trim();
  const fingerprint = sourceFingerprint(ROOT);
  const native = nativeFingerprint(ROOT);
  const stamp = runStamp();
  const setups: PlatformSetup[] = [];
  for (const platform of options.platforms) {
    const device = await resolveDevice(platform, options.devices[platform]);
    if (!(await device.isInstalled(AUDIT_APP_ID))) throw new Error(`${AUDIT_APP_ID} is not installed on ${device.id}: run bun run audit:native:build -- --platform=${platform}`);
    const dir = join(ROOT, ".audit", "runs", `${stamp}-${platform}-${sha.slice(0, 7)}`);
    await mkdir(dir, { recursive: true });
    const queue = buildQueue(platform, options);
    setups.push({ run: { platform, device, dir, queue, dev: options.dev }, device, info: await device.info(), prepared: [], restored: null, started: Date.now() });
  }

  // Keep the Mac awake for the run (a full sweep is hours); the assertion ends with this process.
  if (process.platform === "darwin") spawn("caffeinate", ["-dimsu", "-w", String(process.pid)], { stdio: "ignore", detached: true }).unref();

  let restoring: Promise<void> | null = null;
  const restore = () => (restoring ??= (async () => {
    for (const setup of setups) {
      await setup.device.terminate(AUDIT_APP_ID).catch(() => undefined);
      setup.restored = await setup.device.restore();
      for (const line of setup.restored) console.log(`[${setup.run.platform}] restored: ${line}`);
    }
  })());
  const abort = (signal: string) => {
    console.log(`\n${signal}: restoring the devices before exit`);
    void restore().finally(() => process.exit(130));
  };
  process.once("SIGINT", () => abort("SIGINT"));
  process.once("SIGTERM", () => abort("SIGTERM"));

  let host: AuditHost | null = null;
  try {
    for (const setup of setups) {
      setup.prepared = await setup.device.prepare({ reduceMotion: options.reduceMotion });
      for (const line of setup.prepared) console.log(`[${setup.run.platform}] ${line}`);
      console.log(`[${setup.run.platform}] ${setup.info.name} (${setup.info.model}, ${setup.info.os}): ${setup.run.queue.length} cells -> ${setup.run.dir}`);
    }
    host = await startAuditHost(setups.map((s) => s.run), {
      fingerprint,
      nativeFingerprint: native,
      events: {
        log: (platform, line) => console.log(`[${platform}] ${line}`),
        hello: (platform, hello) => console.log(`[${platform}] hello from ${hello.app.name} ${hello.app.id}: ${hello.window.width}x${hello.window.height} @${hello.dpr}x, reduce motion ${hello.reduceMotion}, liquid glass ${hello.liquidGlass}`),
        refused: (platform, why) => console.error(`[${platform}] REFUSED: ${why}`),
        abandoned: (platform, why) => console.error(`[${platform}] ABANDONED: ${why}`),
        cell: (platform, rec, done, total) => console.log(`[${platform}] ${done}/${total} ${rec.status.padEnd(8)} ${rec.seconds.toFixed(1)}s ${rec.id}${rec.reason ? `: ${rec.reason}` : ""}`),
        stalled: async (platform, why) => {
          console.log(`[${platform}] relaunching the app: ${why}`);
          const setup = setups.find((s) => s.run.platform === platform);
          if (!setup) return;
          await setup.device.terminate(AUDIT_APP_ID);
          await setup.device.launch(AUDIT_APP_ID);
        },
      },
    });
    // A fresh process per run: the driver says hello as soon as it is up.
    for (const setup of setups) {
      setup.started = Date.now();
      await setup.device.terminate(AUDIT_APP_ID);
      await setup.device.launch(AUDIT_APP_ID);
      await writeManifest(setup, options, { sha, fingerprint, nativeFingerprint: native, hello: null, refused: null, abandoned: null, records: [], finished: null });
    }
    await host.finished;
  } finally {
    host?.stop();
    await restore();
  }

  let failed = false;
  for (const setup of setups) {
    const records = host?.records(setup.run.platform) ?? [];
    const refused = host?.refused(setup.run.platform) ?? null;
    const abandoned = host?.abandoned(setup.run.platform) ?? null;
    await writeManifest(setup, options, { sha, fingerprint, nativeFingerprint: native, hello: host?.hello(setup.run.platform) ?? null, refused, abandoned, records, finished: Date.now() });
    const s = summary(records);
    console.log(`\n[${setup.run.platform}] ${s.cells}/${setup.run.queue.length} cells: ${s.ok} ok, ${s.unstable} unstable, ${s.failed} failed (${s.retried} needed a second attempt); ${s.secondsPerCell ?? "n/a"} s per cell (median ${s.secondsPerCellMedian ?? "n/a"}); a11y ${s.a11y.captured}/${s.a11y.requested}`);
    console.log(`[${setup.run.platform}] ${setup.run.dir}`);
    for (const rec of records.filter((r) => r.status !== "ok")) console.log(`  ${rec.status} ${rec.id}${rec.reason ? `: ${rec.reason}` : ""}`);
    if (refused) console.log(`  refused: ${refused}`);
    if (abandoned) console.log(`  abandoned: ${abandoned}`);
    if (refused || abandoned || s.failed > 0 || s.cells < setup.run.queue.length) failed = true;
  }
  process.exit(failed ? 1 : 0);
}

if (import.meta.main) await main();
