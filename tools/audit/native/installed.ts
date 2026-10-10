// What the Canvas Audit app installed on a device was built from, read off the installed
// app itself: the build identity Expo embeds in it (`extra.canvasBuild` in the app config
// expo-constants writes into the bundle, docs/app.config.js) and whether it carries its JS
// bundle (a Release build) or loads it from Metro (a Debug build).
//
// `bun run audit:turn` reads it before a native capture to reuse the installed build when
// it is this checkout's (its source and native fingerprints, docs/scripts/build-info.cjs)
// and to run `audit:native:build -- --incremental` only when it is not. The capture host
// still checks the same identity in the app's hello (tools/audit/native/server.ts), so this
// is the turn's way to avoid launching a stale build, not the gate itself. The devices are
// shared by every checkout on this Mac (another worktree's audit build has the same app id),
// so the installed app is read, never a record a build left behind.
//
//   iOS      `xcrun simctl get_app_container <udid> <app id> app` names the installed .app
//            on this Mac's disk; its `EXConstants.bundle/app.config` is the config, and a
//            `main.jsbundle` beside it is the embedded bundle.
//   Android  `adb shell pm path <app id>` names the installed APK; it is pulled into a
//            temporary directory and read with `unzip`: `assets/app.config` is the config,
//            `assets/index.android.bundle` the embedded bundle.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ADB, AUDIT_APP_ID, run } from "./devices.ts";

/** Runs a command and resolves its standard output; rejects on a non-zero exit. */
export type Exec = (command: string, args: string[]) => Promise<Buffer>;

const defaultExec: Exec = async (command, args) => (await run(command, args, { timeoutMs: 180_000 })).stdout;

export interface InstalledBuild {
  platform: "ios" | "android";
  installed: boolean;
  /** `extra.canvasBuild.sourceFingerprint`, or null when the config carries none. */
  sourceFingerprint: string | null;
  /** `extra.canvasBuild.nativeFingerprint`, or null (a build from outside audit:native:build). */
  nativeFingerprint: string | null;
  /** Whether the JS bundle is embedded (a Release build), as the sweeps require. */
  embeddedBundle: boolean;
  /** Where it was read: the .app path or the APK path on the device. */
  where: string | null;
}

/** The fingerprints an embedded app config carries (`extra.canvasBuild`). */
export function buildIdentity(appConfig: string): { sourceFingerprint: string | null; nativeFingerprint: string | null } {
  const config = JSON.parse(appConfig) as { extra?: { canvasBuild?: { sourceFingerprint?: unknown; nativeFingerprint?: unknown } } };
  const build = config.extra?.canvasBuild;
  const hex = (value: unknown) => (typeof value === "string" && /^[0-9a-f]{64}$/.test(value) ? value : null);
  return { sourceFingerprint: hex(build?.sourceFingerprint), nativeFingerprint: hex(build?.nativeFingerprint) };
}

/**
 * Why the installed build cannot be reused for a capture of this checkout, or null when it
 * can: installed, a Release build, and built from this checkout's source and native inputs.
 */
export function whyRebuild(build: InstalledBuild, checkout: { source: string; native: string }): string | null {
  if (!build.installed) return `${AUDIT_APP_ID} is not installed`;
  if (!build.embeddedBundle) return "the installed build carries no embedded JS bundle (a Debug build, which loads its bundle from Metro; captures run on Release)";
  if (build.sourceFingerprint === null) return "the installed build's app config carries no source fingerprint";
  if (build.sourceFingerprint !== checkout.source) return `the installed build is stale: built from source fingerprint ${build.sourceFingerprint.slice(0, 12)}, this checkout is ${checkout.source.slice(0, 12)}`;
  if (build.nativeFingerprint === null) return "the installed build carries no native fingerprint (built outside audit:native:build)";
  if (build.nativeFingerprint !== checkout.native) return `the installed build's native project is stale: generated from native inputs ${build.nativeFingerprint.slice(0, 12)}, this checkout's are ${checkout.native.slice(0, 12)}`;
  return null;
}

/** The embedded app config under an installed .app: `EXConstants.bundle/app.config`, wherever the bundle sits inside it. */
export function findAppConfig(appDir: string, depth = 4): string | null {
  const direct = join(appDir, "EXConstants.bundle", "app.config");
  if (existsSync(direct)) return direct;
  if (depth === 0) return null;
  for (const name of readdirSync(appDir).sort()) {
    const path = join(appDir, name);
    if (!statSync(path).isDirectory() || name.endsWith(".lproj")) continue;
    const found = findAppConfig(path, depth - 1);
    if (found) return found;
  }
  return null;
}

/** The installed audit app on an iOS simulator. */
export async function readInstalledIos(udid: string, exec: Exec = defaultExec): Promise<InstalledBuild> {
  let appDir: string;
  try {
    appDir = (await exec("xcrun", ["simctl", "get_app_container", udid, AUDIT_APP_ID, "app"])).toString("utf8").trim();
  } catch {
    return { platform: "ios", installed: false, sourceFingerprint: null, nativeFingerprint: null, embeddedBundle: false, where: null };
  }
  const config = findAppConfig(appDir);
  if (!config) throw new Error(`the installed ${AUDIT_APP_ID} at ${appDir} has no EXConstants.bundle/app.config to read its build identity from`);
  return { platform: "ios", installed: true, ...buildIdentity(readFileSync(config, "utf8")), embeddedBundle: existsSync(join(appDir, "main.jsbundle")), where: appDir };
}

/** The installed audit app on an Android device: its base APK pulled into a temporary directory and read there. */
export async function readInstalledAndroid(serial: string, exec: Exec = defaultExec): Promise<InstalledBuild> {
  const listing = (await exec(ADB, ["-s", serial, "shell", "pm", "path", AUDIT_APP_ID]).catch(() => Buffer.from(""))).toString("utf8");
  const apks = listing.split("\n").map((line) => line.trim()).filter((line) => line.startsWith("package:")).map((line) => line.slice("package:".length));
  if (!apks.length) return { platform: "android", installed: false, sourceFingerprint: null, nativeFingerprint: null, embeddedBundle: false, where: null };
  const base = apks.find((path) => path.endsWith("/base.apk")) ?? apks[0]!;
  const dir = await mkdtemp(join(tmpdir(), "canvas-audit-apk-"));
  try {
    const apk = join(dir, "base.apk");
    await exec(ADB, ["-s", serial, "pull", base, apk]);
    const config = (await exec("unzip", ["-p", apk, "assets/app.config"])).toString("utf8");
    if (!config.trim()) throw new Error(`the installed ${AUDIT_APP_ID} (${base}) has no assets/app.config to read its build identity from`);
    const embeddedBundle = await exec("unzip", ["-l", apk, "assets/index.android.bundle"]).then(
      (out) => out.toString("utf8").includes("assets/index.android.bundle"),
      () => false,
    );
    return { platform: "android", installed: true, ...buildIdentity(config), embeddedBundle, where: base };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
