// Builds and installs the component audit's native app, the docs app with the in-app
// capture driver (docs/src/audit/driver.native.tsx), on the booted simulator and
// emulator. `bun run audit:native:build -- --platform=ios,android`.
//
// It is its own app (com.nannier.canvas.audit, "Canvas Audit", scheme canvas-audit:
// docs/app.config.js under CANVAS_AUDIT_BUILD=1), so it installs beside the docs
// development app the Preview links open and never replaces it. A sweep runs on a
// Release build: the bundle is embedded, so what is photographed is exactly this
// checkout, with no Metro in the loop and over-the-air updates off. `--dev` builds the
// Debug variant instead, for the fix loop, which loads its bundle from Metro on 8081;
// start Metro with `EXPO_PUBLIC_CANVAS_AUDIT=1 CANVAS_AUDIT_BUILD=1 bun run dev` in
// docs/ first, or the app runs without its driver.
//
// The audit's native projects never stay in docs/. Expo generates and builds a native
// project only at docs/<platform>, and `expo run:<platform>` (the docs' `bun run ios` and
// `bun run android`) builds whatever project is there without regenerating it, so an
// audit project left in docs/ios would be what the next `bun run ios` built and
// installed. Each build therefore sets the docs app's own project (if there is one) aside
// in .audit/native/docs-<platform>, generates or reuses the audit project in
// docs/<platform>, builds, then parks the audit project in .audit/native/<platform> and
// puts the docs project back, untouched, whether the build succeeded, failed or was
// interrupted. A build killed outright leaves both where the next build finds them and
// puts them right before it starts.
//
// Each platform is `expo prebuild --clean` and then `expo run:<platform>` with
// --no-bundler (iOS builds to .audit/builds/ios and installs with simctl). The generated
// project records the native fingerprint it was generated from (docs/scripts/
// build-info.cjs nativeFingerprint: the app config, the config plugins, the docs
// dependencies, lockfile and patches, the local native modules) in canvas-audit.json, and
// the build stamps that fingerprint into the app, which the capture host checks.
// `--incremental` reuses the parked project, for a change to JS alone, only while this
// checkout's native fingerprint is still the one it was generated from; otherwise the
// build prebuilds afresh and says why. `--devices=ios:<udid>,android:<serial>` names the
// device when more than one is booted. Needs LANG set for CocoaPods and JDK 17 for
// Gradle; both default to this Mac's Homebrew installs when unset.

import { spawn, type ChildProcess } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join, relative } from "node:path";
import { ROOT } from "../../../e2e/support/routes.ts";
import { AUDIT_APP_ID, parseDeviceOverrides, resolveDevice } from "./devices.ts";
import type { AuditPlatform } from "../../../docs/src/audit/protocol.ts";

const require = createRequire(import.meta.url);
const { nativeFingerprint } = require("../../../docs/scripts/build-info.cjs") as { nativeFingerprint(root: string): string };

const DOCS = join(ROOT, "docs");
const EXPO = join(DOCS, "node_modules", ".bin", "expo");
/** The docs development app the Preview links open; the audit build must leave it installed. */
export const DEV_APP_ID = "com.nannier.canvas";

const HOMEBREW_JDK = "/opt/homebrew/opt/openjdk@17";
const HOMEBREW_ANDROID = "/opt/homebrew/share/android-commandlinetools";

/** The file in a generated audit project that names the native fingerprint it was generated from. */
export const PROJECT_STAMP = "canvas-audit.json";

export interface ProjectStamp {
  schema: 1;
  platform: AuditPlatform;
  appId: string;
  nativeFingerprint: string;
  generated: string;
}

/** The environment both the config and the bundle read: the audit identity and the driver flag. */
export function auditBuildEnv(base: NodeJS.ProcessEnv = process.env): NodeJS.ProcessEnv {
  return {
    ...base,
    CANVAS_AUDIT_BUILD: "1",
    EXPO_PUBLIC_CANVAS_AUDIT: "1",
    // CocoaPods crashes on a non-UTF-8 locale.
    LANG: base.LANG || "en_US.UTF-8",
    JAVA_HOME: base.JAVA_HOME || (existsSync(HOMEBREW_JDK) ? HOMEBREW_JDK : undefined),
    ANDROID_HOME: base.ANDROID_HOME || (existsSync(HOMEBREW_ANDROID) ? HOMEBREW_ANDROID : undefined),
    // Non-interactive Expo CLI: no prompts, and no question about a dirty checkout.
    CI: "1",
    EXPO_NO_GIT_STATUS: "1",
    EXPO_NO_TELEMETRY: "1",
  };
}

// ---------------------------------------------------------------------------
// Where the projects are
// ---------------------------------------------------------------------------

export interface ProjectPaths {
  /** docs/<platform>: where Expo generates and builds a project, and where the docs app's own lives. */
  docs: string;
  /** .audit/native/<platform>: the audit project between builds. */
  parked: string;
  /** .audit/native/docs-<platform>: the docs app's project while an audit build has its place. */
  aside: string;
}

export function projectPaths(platform: AuditPlatform, root = ROOT): ProjectPaths {
  return {
    docs: join(root, "docs", platform),
    parked: join(root, ".audit", "native", platform),
    aside: join(root, ".audit", "native", `docs-${platform}`),
  };
}

/** The application id a generated project builds: its iOS bundle identifier or Android applicationId. */
export function projectAppId(dir: string, platform: AuditPlatform): string | null {
  if (!existsSync(dir)) return null;
  if (platform === "ios") {
    for (const name of readdirSync(dir).filter((entry) => entry.endsWith(".xcodeproj")).sort()) {
      const file = join(dir, name, "project.pbxproj");
      if (!existsSync(file)) continue;
      const id = /PRODUCT_BUNDLE_IDENTIFIER = "?([^";]+)"?;/.exec(readFileSync(file, "utf8"))?.[1];
      if (id) return id;
    }
    return null;
  }
  const gradle = join(dir, "app", "build.gradle");
  if (!existsSync(gradle)) return null;
  return /applicationId\s+['"]([^'"]+)['"]/.exec(readFileSync(gradle, "utf8"))?.[1] ?? null;
}

export function isAuditProject(dir: string, platform: AuditPlatform): boolean {
  return projectAppId(dir, platform) === AUDIT_APP_ID;
}

export function readStamp(dir: string): ProjectStamp | null {
  const file = join(dir, PROJECT_STAMP);
  if (!existsSync(file)) return null;
  try {
    const stamp = JSON.parse(readFileSync(file, "utf8")) as Partial<ProjectStamp>;
    return stamp.schema === 1 && typeof stamp.nativeFingerprint === "string" ? (stamp as ProjectStamp) : null;
  } catch {
    return null;
  }
}

/** Moves `from` to `to`, replacing whatever is at `to`. Both are in this checkout, so it is a rename. */
async function move(from: string, to: string) {
  await rm(to, { recursive: true, force: true });
  await mkdir(dirname(to), { recursive: true });
  await rename(from, to);
}

const shown = (path: string, root: string) => relative(root, path) || path;

/**
 * Puts right what an earlier build left behind: the docs app's project still set aside
 * (a build killed outright), or an audit project sitting in docs/<platform> (a build from
 * before builds parked their projects, or the same kill). Afterwards docs/<platform> holds
 * the docs app's project or nothing, and every audit project is parked. Refuses, touching
 * nothing, when docs/<platform> holds a project that is neither the audit's nor safe to
 * replace while another waits aside.
 */
export async function recoverProjects(paths: ProjectPaths, platform: AuditPlatform, root = ROOT): Promise<string[]> {
  const notes: string[] = [];
  if (existsSync(paths.aside)) {
    if (existsSync(paths.docs) && !isAuditProject(paths.docs, platform)) {
      throw new Error(`${shown(paths.aside, root)} holds the docs app's ${platform} project, set aside by an audit build that never finished, but ${shown(paths.docs, root)} holds another project (${projectAppId(paths.docs, platform) ?? "unreadable"}) that is not the audit's; keep the one you want in ${shown(paths.docs, root)} and delete the other`);
    }
    if (existsSync(paths.docs)) {
      await move(paths.docs, paths.parked);
      notes.push(`parked the audit project an interrupted build left in ${shown(paths.docs, root)}`);
    }
    await rename(paths.aside, paths.docs);
    notes.push(`put the docs app's ${platform} project back in ${shown(paths.docs, root)} from ${shown(paths.aside, root)}`);
  }
  if (existsSync(paths.docs) && isAuditProject(paths.docs, platform)) {
    await move(paths.docs, paths.parked);
    notes.push(`moved the audit project out of ${shown(paths.docs, root)} to ${shown(paths.parked, root)}`);
  }
  return notes;
}

/** Sets the docs app's project aside so the audit project can take its place; true when there was one. */
export async function setDocsProjectAside(paths: ProjectPaths): Promise<boolean> {
  if (!existsSync(paths.docs)) return false;
  await mkdir(dirname(paths.aside), { recursive: true });
  await rename(paths.docs, paths.aside);
  return true;
}

/** Parks the audit project (whatever state the build left it in) and puts the docs app's project back. */
export async function restoreDocsProject(paths: ProjectPaths, setAside: boolean): Promise<void> {
  if (existsSync(paths.docs)) await move(paths.docs, paths.parked);
  if (setAside) await rename(paths.aside, paths.docs);
}

/**
 * Whether the parked audit project can be built again as it is: only when it was generated
 * for this platform's audit app from the native inputs this checkout has now. Null when it
 * can, else why not.
 */
export function whyNotReuse(paths: ProjectPaths, platform: AuditPlatform, native: string): string | null {
  if (!existsSync(paths.parked)) return "there is no parked audit project";
  if (!isAuditProject(paths.parked, platform)) return "the parked project is not the audit app's";
  const stamp = readStamp(paths.parked);
  if (!stamp) return `the parked project has no ${PROJECT_STAMP}, so what it was generated from is unknown`;
  if (stamp.nativeFingerprint !== native) return `the native inputs changed since the parked project was generated (${stamp.nativeFingerprint.slice(0, 12)}, now ${native.slice(0, 12)})`;
  return null;
}

// ---------------------------------------------------------------------------
// The build
// ---------------------------------------------------------------------------

let active: ChildProcess | null = null;
let interrupted: string | null = null;

function step(command: string, args: string[], env: NodeJS.ProcessEnv): Promise<void> {
  if (interrupted) return Promise.reject(new Error(`stopped by ${interrupted}`));
  console.log(`\n$ ${[command, ...args].join(" ")}`);
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: DOCS, env, stdio: "inherit" });
    active = child;
    child.on("error", reject);
    child.on("exit", (code, signal) => {
      active = null;
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} exited ${signal ?? code}${interrupted ? ` (stopped by ${interrupted})` : ""}`));
    });
  });
}

export async function buildAuditApp(platform: AuditPlatform, options: { dev: boolean; incremental: boolean; device?: string }) {
  const device = await resolveDevice(platform, options.device);
  const hadDevApp = await device.isInstalled(DEV_APP_ID);
  const started = Date.now();
  const paths = projectPaths(platform);

  for (const note of await recoverProjects(paths, platform)) console.log(`${platform}: ${note}`);
  const native = nativeFingerprint(ROOT);
  const reuse = options.incremental ? whyNotReuse(paths, platform, native) : "not --incremental";
  const setAside = await setDocsProjectAside(paths);
  if (setAside) console.log(`\n${platform}: set the docs app's project aside in ${shown(paths.aside, ROOT)} for the build`);
  try {
    let stamp: ProjectStamp;
    if (reuse === null) {
      await rename(paths.parked, paths.docs);
      stamp = readStamp(paths.docs) as ProjectStamp;
      console.log(`\n${platform}: reusing the parked audit project (--incremental; native fingerprint ${native.slice(0, 12)} unchanged)`);
    } else {
      if (options.incremental) console.log(`\n${platform}: prebuilding afresh: ${reuse}`);
      await rm(paths.parked, { recursive: true, force: true });
      await step(EXPO, ["prebuild", "--clean", "--platform", platform], { ...auditBuildEnv(), CANVAS_AUDIT_NATIVE_FINGERPRINT: native });
      if (!isAuditProject(paths.docs, platform)) throw new Error(`expo prebuild left no ${AUDIT_APP_ID} project in ${shown(paths.docs, ROOT)} (it builds ${projectAppId(paths.docs, platform) ?? "nothing readable"})`);
      stamp = { schema: 1, platform, appId: AUDIT_APP_ID, nativeFingerprint: native, generated: new Date().toISOString() };
      await writeFile(join(paths.docs, PROJECT_STAMP), `${JSON.stringify(stamp, null, 2)}\n`);
    }
    // The app carries the fingerprint of the project it is built from, which is what the
    // capture host compares with this checkout's.
    const env = { ...auditBuildEnv(), CANVAS_AUDIT_NATIVE_FINGERPRINT: stamp.nativeFingerprint };

    if (platform === "ios") {
      // Built for the generic simulator destination and installed here. Installed by Expo,
      // the app is then opened through its dev-client URL, and for a build with no dev
      // client iOS answers with an "Open in Canvas Audit?" alert that stays over every app
      // on the simulator, the docs development app's Preview links included.
      const output = join(ROOT, ".audit", "builds", "ios");
      await rm(output, { recursive: true, force: true });
      await step(EXPO, ["run:ios", "--configuration", options.dev ? "Debug" : "Release", "--no-bundler", "--device", "generic", "--output", output], env);
      const app = readdirSync(output).find((name) => name.endsWith(".app"));
      if (!app) throw new Error(`expo run:ios left no .app in ${output}`);
      await step("xcrun", ["simctl", "install", device.id, join(output, app)], env);
    } else {
      const android = await resolveDevice("android", device.id);
      await step(EXPO, ["run:android", "--variant", options.dev ? "debug" : "release", "--no-bundler", "--device", await android.avdName()], env);
      // Expo opens the app on its dev-client URL after installing it; a run starts it afresh.
      await device.terminate(AUDIT_APP_ID);
    }
  } finally {
    await restoreDocsProject(paths, setAside);
    console.log(`\n${platform}: parked the audit project in ${shown(paths.parked, ROOT)}${setAside ? `; the docs app's project is back in ${shown(paths.docs, ROOT)}` : `; ${shown(paths.docs, ROOT)} is left empty, as it was`}`);
  }

  if (!(await device.isInstalled(AUDIT_APP_ID))) throw new Error(`${AUDIT_APP_ID} is not installed on ${device.id} after the build`);
  if (hadDevApp && !(await device.isInstalled(DEV_APP_ID))) throw new Error(`the docs development app ${DEV_APP_ID} is gone from ${device.id}`);
  const minutes = ((Date.now() - started) / 60_000).toFixed(1);
  console.log(`\n${platform}: ${AUDIT_APP_ID} (${options.dev ? "Debug" : "Release"}) installed on ${device.id} in ${minutes} min${hadDevApp ? `; ${DEV_APP_ID} still installed` : ""}`);
}

async function main() {
  const arg = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
  const platforms = (arg("platform") ?? "ios,android").split(",").filter(Boolean);
  for (const platform of platforms) {
    if (platform !== "ios" && platform !== "android") throw new Error(`--platform takes ios and android, not "${platform}"`);
  }
  const devices = parseDeviceOverrides(arg("devices"));
  const dev = process.argv.includes("--dev");
  const incremental = process.argv.includes("--incremental");
  // A stop lands in the running step, so the build's own clean-up puts the docs projects
  // back before the process ends, rather than the default exit leaving them aside.
  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.on(signal, () => {
      interrupted = signal;
      active?.kill(signal);
    });
  }
  // One at a time: a parallel Xcode and Gradle build fight over the same cores and memory.
  for (const platform of platforms as AuditPlatform[]) await buildAuditApp(platform, { dev, incremental, device: devices[platform] });
  if (dev) console.log("\nDebug builds load their bundle from Metro: run `EXPO_PUBLIC_CANVAS_AUDIT=1 CANVAS_AUDIT_BUILD=1 bun run dev` in docs/.");
}

if (import.meta.main) await main();
