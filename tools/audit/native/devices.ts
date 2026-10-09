// The iOS simulator and the Android emulator as the native capture host sees them: find
// the booted device, launch and stop the audit app, take a screenshot, and put the
// device into a capture-ready state for the length of a run (a fixed 9:41 status bar,
// Android's demo mode, animations off, iOS Reduce Motion, the host port reversed onto
// the emulator) and back out of it afterwards. Every change prepare() makes is read
// first and restored by restore(), which run.ts calls on every way out of a run.
//
// The wrappers follow scripts/capture-looks.ts (the same simctl and adb calls, the
// same ADB default), made asynchronous so one host can drive both devices at once.

import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { AUDIT_PORT, type AuditPlatform } from "../../../docs/src/audit/protocol.ts";

/** The adb binary: `ADB`, else the SDK under ANDROID_HOME, else capture-looks.ts's default. */
export const ADB = process.env.ADB
  ?? [process.env.ANDROID_HOME, process.env.ANDROID_SDK_ROOT]
    .filter((root): root is string => Boolean(root))
    .map((root) => join(root, "platform-tools", "adb"))
    .find((path) => existsSync(path))
  ?? "/opt/homebrew/share/android-commandlinetools/platform-tools/adb";

/** The audit app's identity on both platforms (docs/app.config.js under CANVAS_AUDIT_BUILD=1). */
export const AUDIT_APP_ID = "com.nannier.canvas.audit";

export interface RunResult {
  stdout: Buffer;
  stderr: string;
}

/** Runs a command and resolves its output; rejects with the command line and stderr on a non-zero exit. */
export function run(command: string, args: string[], options: { timeoutMs?: number; env?: NodeJS.ProcessEnv } = {}): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    execFile(command, args, { encoding: "buffer", maxBuffer: 256 * 1024 * 1024, timeout: options.timeoutMs ?? 120_000, env: options.env ?? process.env }, (error, stdout, stderr) => {
      const err = stderr.toString("utf8");
      if (error) reject(new Error(`${command} ${args.join(" ")} failed: ${err.trim() || error.message}`));
      else resolve({ stdout, stderr: err });
    });
  });
}

const text = async (command: string, args: string[], options?: { timeoutMs?: number }) => (await run(command, args, options)).stdout.toString("utf8").trim();

export interface DeviceInfo {
  platform: AuditPlatform;
  id: string;
  name: string;
  model: string;
  os: string;
  /** What the host knows of the device's display and renderer. */
  details: Record<string, string>;
}

export interface PrepareOptions {
  /** Turn on the OS's reduced motion for the run (Android: animation scales 0, which React Native reads as reduced motion). */
  reduceMotion: boolean;
}

export interface AuditDevice {
  readonly platform: AuditPlatform;
  readonly id: string;
  info(): Promise<DeviceInfo>;
  prepare(options: PrepareOptions): Promise<string[]>;
  /** Undoes prepare(), in reverse; safe to call twice. Returns what it restored. */
  restore(): Promise<string[]>;
  isInstalled(appId: string): Promise<boolean>;
  launch(appId: string): Promise<void>;
  terminate(appId: string): Promise<void>;
  /** The whole screen as PNG bytes, in device pixels. */
  screenshot(): Promise<Buffer>;
}

// ---------------------------------------------------------------------------
// iOS simulator
// ---------------------------------------------------------------------------

interface SimDevice {
  udid: string;
  name: string;
  state: string;
  deviceTypeIdentifier?: string;
}

async function simulators(): Promise<(SimDevice & { runtime: string })[]> {
  const listing = JSON.parse(await text("xcrun", ["simctl", "list", "devices", "-j"])) as { devices: Record<string, SimDevice[]> };
  return Object.entries(listing.devices).flatMap(([runtime, devices]) => devices.map((device) => ({ ...device, runtime })));
}

class IosSimulator implements AuditDevice {
  readonly platform = "ios" as const;
  private undo: { label: string; run: () => Promise<unknown> }[] = [];
  /** A private directory for screenshots on their way off the simulator. */
  private shots: string | null = null;

  constructor(readonly id: string) {}

  async info(): Promise<DeviceInfo> {
    const device = (await simulators()).find((d) => d.udid === this.id);
    if (!device) throw new Error(`no simulator ${this.id}`);
    const runtime = device.runtime.replace("com.apple.CoreSimulator.SimRuntime.", "").replace(/-(\d+)-(\d+)$/, " $1.$2");
    return {
      platform: "ios",
      id: this.id,
      name: device.name,
      model: (device.deviceTypeIdentifier ?? "").replace("com.apple.CoreSimulator.SimDeviceType.", ""),
      os: runtime,
      details: { state: device.state },
    };
  }

  private simctl(...args: string[]) {
    return text("xcrun", ["simctl", ...args]);
  }

  private async accessibilityDefault(key: string): Promise<string | null> {
    try {
      return await this.simctl("spawn", this.id, "defaults", "read", "com.apple.Accessibility", key);
    } catch {
      return null;
    }
  }

  async prepare(options: PrepareOptions): Promise<string[]> {
    const done: string[] = [];
    // A status bar someone else overrode is theirs: clearing ours at exit would clear it too.
    const overrides = await this.simctl("status_bar", this.id, "list");
    if (/\S+\s*[:=]/.test(overrides.replace(/^Current Status Bar Overrides:\s*=*\s*/m, ""))) {
      done.push("status bar: left alone, it already carries overrides");
    } else {
      await this.simctl("status_bar", this.id, "override", "--time", "9:41", "--dataNetwork", "wifi", "--wifiMode", "active", "--wifiBars", "3",
        "--cellularMode", "active", "--cellularBars", "4", "--operatorName", "", "--batteryState", "charged", "--batteryLevel", "100");
      this.undo.push({ label: "status bar override cleared", run: () => this.simctl("status_bar", this.id, "clear") });
      done.push("status bar: 9:41, full battery and signal");
    }
    if (options.reduceMotion) {
      const previous = await this.accessibilityDefault("ReduceMotionEnabled");
      if (previous !== "1") {
        await this.simctl("spawn", this.id, "defaults", "write", "com.apple.Accessibility", "ReduceMotionEnabled", "-bool", "true");
        this.undo.push({
          label: `Reduce Motion restored to ${previous ?? "unset"}`,
          run: () => previous === null
            ? this.simctl("spawn", this.id, "defaults", "delete", "com.apple.Accessibility", "ReduceMotionEnabled")
            : this.simctl("spawn", this.id, "defaults", "write", "com.apple.Accessibility", "ReduceMotionEnabled", "-bool", previous === "1" ? "true" : "false"),
        });
      }
      done.push(`Reduce Motion on (was ${previous ?? "unset"})`);
    }
    return done;
  }

  async restore(): Promise<string[]> {
    if (this.shots) await rm(this.shots, { recursive: true, force: true });
    this.shots = null;
    return restoreAll(this.undo);
  }

  async isInstalled(appId: string) {
    try {
      await this.simctl("get_app_container", this.id, appId);
      return true;
    } catch {
      return false;
    }
  }

  async launch(appId: string) {
    await this.simctl("launch", this.id, appId);
  }

  async terminate(appId: string) {
    try {
      await this.simctl("terminate", this.id, appId);
    } catch {
      // Not running.
    }
  }

  // Through a file: simctl's help offers "-" for stdout, but the Xcode 27 simctl writes a
  // file named "-" in the working directory instead.
  async screenshot(): Promise<Buffer> {
    this.shots ??= await mkdtemp(join(tmpdir(), "canvas-audit-ios-"));
    const file = join(this.shots, "screen.png");
    await run("xcrun", ["simctl", "io", this.id, "screenshot", "--type=png", file], { timeoutMs: 30_000 });
    const png = await readFile(file);
    await rm(file, { force: true });
    return png;
  }
}

// ---------------------------------------------------------------------------
// Android emulator
// ---------------------------------------------------------------------------

const ANIMATION_SCALES = ["window_animation_scale", "transition_animation_scale", "animator_duration_scale"];

class AndroidEmulator implements AuditDevice {
  readonly platform = "android" as const;
  private undo: { label: string; run: () => Promise<unknown> }[] = [];

  constructor(readonly id: string) {}

  private adb(...args: string[]) {
    return text(ADB, ["-s", this.id, ...args]);
  }

  private shell(...args: string[]) {
    return this.adb("shell", ...args);
  }

  async info(): Promise<DeviceInfo> {
    const prop = (name: string) => this.shell("getprop", name);
    const [model, release, sdk, size, density, avd, surfaceFlinger] = await Promise.all([
      prop("ro.product.model"), prop("ro.build.version.release"), prop("ro.build.version.sdk"),
      this.shell("wm", "size"), this.shell("wm", "density"), this.adb("emu", "avd", "name").catch(() => ""),
      this.shell("dumpsys", "SurfaceFlinger").catch(() => ""),
    ]);
    const renderer = /^GLES: (.*)$/m.exec(surfaceFlinger)?.[1] ?? "unknown";
    return {
      platform: "android",
      id: this.id,
      name: avd.split("\n")[0]?.trim() || this.id,
      model,
      os: `Android ${release} (API ${sdk})`,
      details: { size: size.replace(/\s+/g, " "), density: density.replace(/\s+/g, " "), renderer },
    };
  }

  /** The emulator's AVD name, which is what Expo CLI's --device takes. */
  async avdName(): Promise<string> {
    return (await this.adb("emu", "avd", "name")).split("\n")[0]?.trim() ?? "";
  }

  private async setting(key: string): Promise<string | null> {
    const value = await this.shell("settings", "get", "global", key);
    return value === "null" ? null : value;
  }

  private putSetting(key: string, value: string | null) {
    return value === null ? this.shell("settings", "delete", "global", key) : this.shell("settings", "put", "global", key, value);
  }

  private demo(command: string, ...extras: string[]) {
    return this.shell("am", "broadcast", "-a", "com.android.systemui.demo", "-e", "command", command, ...extras);
  }

  async prepare(options: PrepareOptions): Promise<string[]> {
    const done: string[] = [];
    // The driver's 127.0.0.1:<port> on the device is this host's port.
    const reversed = await this.adb("reverse", "--list");
    if (!reversed.includes(`tcp:${AUDIT_PORT} `) && !reversed.endsWith(`tcp:${AUDIT_PORT}`)) {
      await this.adb("reverse", `tcp:${AUDIT_PORT}`, `tcp:${AUDIT_PORT}`);
      this.undo.push({ label: `adb reverse tcp:${AUDIT_PORT} removed`, run: () => this.adb("reverse", "--remove", `tcp:${AUDIT_PORT}`) });
    }
    done.push(`adb reverse tcp:${AUDIT_PORT}`);

    const allowed = await this.setting("sysui_demo_allowed");
    await this.putSetting("sysui_demo_allowed", "1");
    this.undo.push({ label: `sysui_demo_allowed restored to ${allowed ?? "unset"}`, run: () => this.putSetting("sysui_demo_allowed", allowed) });
    await this.demo("enter");
    this.undo.push({ label: "demo mode exited", run: () => this.demo("exit") });
    await this.demo("clock", "-e", "hhmm", "0941");
    await this.demo("battery", "-e", "level", "100", "-e", "plugged", "false");
    await this.demo("network", "-e", "wifi", "show", "-e", "level", "4");
    await this.demo("network", "-e", "mobile", "show", "-e", "datatype", "none", "-e", "level", "4");
    await this.demo("notifications", "-e", "visible", "false");
    done.push("demo mode: 9:41, full battery and signal, no notifications");

    if (options.reduceMotion) {
      const previous: Record<string, string | null> = {};
      for (const key of ANIMATION_SCALES) previous[key] = await this.setting(key);
      for (const key of ANIMATION_SCALES) await this.putSetting(key, "0");
      this.undo.push({
        label: `animation scales restored to ${ANIMATION_SCALES.map((key) => previous[key] ?? "unset").join("/")}`,
        run: async () => {
          for (const key of ANIMATION_SCALES) await this.putSetting(key, previous[key] ?? null);
        },
      });
      done.push(`animation scales 0 (were ${ANIMATION_SCALES.map((key) => previous[key] ?? "unset").join("/")})`);
    }
    return done;
  }

  async restore(): Promise<string[]> {
    return restoreAll(this.undo);
  }

  async isInstalled(appId: string) {
    return (await this.shell("pm", "path", appId).catch(() => "")).startsWith("package:");
  }

  // The launcher activity, started directly. capture-looks.ts's `monkey` launch exits
  // non-zero once the animation scales are 0, so it cannot tell a launch from a failure.
  async launch(appId: string) {
    const resolved = await this.shell("pm", "resolve-activity", "--brief", "-c", "android.intent.category.LAUNCHER", appId);
    const component = resolved.split("\n").map((line) => line.trim()).find((line) => line.startsWith(`${appId}/`));
    if (!component) throw new Error(`${appId} has no launcher activity: ${resolved}`);
    await this.shell("am", "start", "-W", "-n", component);
  }

  async terminate(appId: string) {
    await this.shell("am", "force-stop", appId);
  }

  // The framebuffer raw, encoded here: `screencap -p` compresses on the device, which
  // is the slow half of a grab. The raw header is width, height and pixel format, plus a
  // colour space word on newer releases, so its length is whatever precedes the pixels.
  async screenshot(): Promise<Buffer> {
    const raw = (await run(ADB, ["-s", this.id, "exec-out", "screencap"], { timeoutMs: 30_000 })).stdout;
    const width = raw.readUInt32LE(0);
    const height = raw.readUInt32LE(4);
    const format = raw.readUInt32LE(8);
    const header = raw.length - width * height * 4;
    if (format !== 1 || (header !== 12 && header !== 16)) throw new Error(`unexpected screencap layout: ${width}x${height} format ${format}, ${raw.length} bytes`);
    return sharp(raw.subarray(header), { raw: { width, height, channels: 4 } }).png({ compressionLevel: 3 }).toBuffer();
  }
}

async function restoreAll(undo: { label: string; run: () => Promise<unknown> }[]): Promise<string[]> {
  const restored: string[] = [];
  while (undo.length > 0) {
    const step = undo.pop();
    if (!step) break;
    try {
      await step.run();
      restored.push(step.label);
    } catch (error) {
      restored.push(`FAILED to restore (${step.label}): ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  return restored;
}

// ---------------------------------------------------------------------------
// Resolution
// ---------------------------------------------------------------------------

/** `--devices=ios:<udid>,android:<serial>`, parsed. */
export function parseDeviceOverrides(value: string | undefined): Partial<Record<AuditPlatform, string>> {
  const overrides: Partial<Record<AuditPlatform, string>> = {};
  for (const entry of (value ?? "").split(",").filter(Boolean)) {
    const [platform, ...rest] = entry.split(":");
    const id = rest.join(":");
    if ((platform !== "ios" && platform !== "android") || !id) throw new Error(`--devices takes ios:<udid> and android:<serial>, not "${entry}"`);
    overrides[platform] = id;
  }
  return overrides;
}

/** The device to drive on a platform: the one named, else the only booted one. */
export async function resolveDevice(platform: "ios", id?: string): Promise<IosSimulator>;
export async function resolveDevice(platform: "android", id?: string): Promise<AndroidEmulator>;
export async function resolveDevice(platform: AuditPlatform, id?: string): Promise<AuditDevice>;
export async function resolveDevice(platform: AuditPlatform, id?: string): Promise<AuditDevice> {
  if (platform === "ios") {
    const booted = (await simulators()).filter((d) => d.state === "Booted");
    const wanted = id ?? process.env.IOS_DEVICE;
    if (wanted) {
      const device = booted.find((d) => d.udid === wanted || d.name === wanted);
      if (!device) throw new Error(`no booted simulator ${wanted} (booted: ${booted.map((d) => `${d.name} ${d.udid}`).join(", ") || "none"})`);
      return new IosSimulator(device.udid);
    }
    if (booted.length !== 1) throw new Error(`${booted.length} simulators are booted; name one with --devices=ios:<udid> (${booted.map((d) => `${d.name} ${d.udid}`).join(", ") || "none"})`);
    return new IosSimulator(booted[0].udid);
  }
  const listing = await text(ADB, ["devices"]);
  const online = listing.split("\n").slice(1).map((line) => line.trim().split(/\s+/)).filter(([, state]) => state === "device").map(([serial]) => serial);
  const wanted = id ?? process.env.ANDROID_SERIAL;
  if (wanted) {
    if (!online.includes(wanted)) throw new Error(`no online Android device ${wanted} (online: ${online.join(", ") || "none"})`);
    return new AndroidEmulator(wanted);
  }
  if (online.length !== 1) throw new Error(`${online.length} Android devices are online; name one with --devices=android:<serial> (${online.join(", ") || "none"})`);
  return new AndroidEmulator(online[0]);
}

export type { IosSimulator, AndroidEmulator };
