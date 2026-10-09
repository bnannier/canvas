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
// Each platform is `expo prebuild --clean` (the generated docs/ios and docs/android are
// gitignored and regenerated under the audit identity) and then `expo run:<platform>`
// with --no-bundler (iOS builds to .audit/builds/ios and installs with simctl). `--incremental` skips the prebuild when docs/<platform> already
// holds the audit project, for a change to JS alone. `--devices=ios:<udid>,android:<serial>`
// names the device when more than one is booted. Needs LANG set for CocoaPods and JDK 17
// for Gradle; both default to this Mac's Homebrew installs when unset.

import { spawn } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { rm } from "node:fs/promises";
import { join } from "node:path";
import { ROOT } from "../../../e2e/support/routes.ts";
import { AUDIT_APP_ID, parseDeviceOverrides, resolveDevice } from "./devices.ts";
import type { AuditPlatform } from "../../../docs/src/audit/protocol.ts";

const DOCS = join(ROOT, "docs");
const EXPO = join(DOCS, "node_modules", ".bin", "expo");
/** The docs development app the Preview links open; the audit build must leave it installed. */
const DEV_APP_ID = "com.nannier.canvas";

const HOMEBREW_JDK = "/opt/homebrew/opt/openjdk@17";
const HOMEBREW_ANDROID = "/opt/homebrew/share/android-commandlinetools";

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

function step(command: string, args: string[], env: NodeJS.ProcessEnv): Promise<void> {
  console.log(`\n$ ${[command, ...args].join(" ")}`);
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: DOCS, env, stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code, signal) => (code === 0 ? resolve() : reject(new Error(`${command} ${args.join(" ")} exited ${signal ?? code}`))));
  });
}

// Whether docs/<platform> was generated under the audit identity, which is what lets
// `--incremental` reuse it. The docs development app's own prebuild writes the same
// directories under com.nannier.canvas, and building on that would install over the
// docs development app.
function hasAuditProject(platform: AuditPlatform): boolean {
  const file = platform === "ios" ? join(DOCS, "ios", "CanvasAudit.xcodeproj", "project.pbxproj") : join(DOCS, "android", "app", "build.gradle");
  if (!existsSync(file)) return false;
  const source = readFileSync(file, "utf8");
  return platform === "ios"
    ? source.includes(`PRODUCT_BUNDLE_IDENTIFIER = ${AUDIT_APP_ID};`)
    : source.includes(`applicationId '${AUDIT_APP_ID}'`) || source.includes(`applicationId "${AUDIT_APP_ID}"`);
}

export async function buildAuditApp(platform: AuditPlatform, options: { dev: boolean; incremental: boolean; device?: string }) {
  const env = auditBuildEnv();
  const device = await resolveDevice(platform, options.device);
  const hadDevApp = await device.isInstalled(DEV_APP_ID);
  const started = Date.now();

  // --incremental keeps the generated project, so only the bundle and changed sources
  // rebuild: right after a JS-only change, wrong after a change to app.config.js, a
  // config plugin or a native dependency, which only a fresh prebuild picks up.
  if (options.incremental && hasAuditProject(platform)) console.log(`\n${platform}: reusing docs/${platform} (--incremental)`);
  else await step(EXPO, ["prebuild", "--clean", "--platform", platform], env);
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
  // One at a time: a parallel Xcode and Gradle build fight over the same cores and memory.
  for (const platform of platforms as AuditPlatform[]) await buildAuditApp(platform, { dev, incremental, device: devices[platform] });
  if (dev) console.log("\nDebug builds load their bundle from Metro: run `EXPO_PUBLIC_CANVAS_AUDIT=1 CANVAS_AUDIT_BUILD=1 bun run dev` in docs/.");
}

if (import.meta.main) await main();
