// Keeps every connected Android device or emulator able to reach this Mac's dev servers,
// so the docs app on it takes Fast Refresh from Metro without a hand-run step.
//
// The docs debug build loads its JavaScript from Metro at localhost:8081 on the DEVICE,
// which reaches this Mac only through an `adb reverse` port mapping. A mapping lives as
// long as the device's adb connection: an emulator that boots (a quick-boot snapshot
// included) or a phone plugged in after `bun run dev` started has none, so its app keeps
// the last bundle it loaded, however old, and never sees an edit. This watches adb's
// device list (`adb track-devices`, one long-lived connection that reports each change)
// and maps the ports on every device that comes online. iOS needs nothing: the simulator
// shares the Mac's localhost.
//
// Both commands reach adb as execFile/spawn arguments, never through a shell.

import { execFile, spawn } from "node:child_process";

/**
 * Splits `adb track-devices` output into its frames. Each frame is a 4 hex digit length
 * then that many bytes of `serial<TAB>state` lines, the whole device list at that moment.
 * Returns the complete frames' device lists and the bytes of an incomplete trailing frame.
 */
export function parseDeviceFrames(buffer) {
  const frames = [];
  let rest = buffer;
  while (rest.length >= 4) {
    const length = Number.parseInt(rest.slice(0, 4), 16);
    if (Number.isNaN(length) || rest.length < 4 + length) break;
    const body = rest.slice(4, 4 + length);
    rest = rest.slice(4 + length);
    frames.push(
      body
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          const [serial, state] = line.split("\t");
          return { serial, state };
        }),
    );
  }
  return { frames, rest };
}

/**
 * Watches adb's device list and runs `adb -s <serial> reverse tcp:<port> tcp:<port>` for
 * each of `ports` on every device as it comes online (state `device`). Returns a stop
 * function. Where adb is missing or exits, it logs once and stops: the web docs and the
 * iOS simulator need none of this.
 */
export function watchDevicePorts({ adb, ports, run = execFile, start = spawn, log = console.log }) {
  const online = new Set();
  let child;
  try {
    child = start(adb, ["track-devices"], { stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    return () => {};
  }
  let buffer = "";
  child.on("error", () => {});
  child.stdout?.setEncoding("utf8");
  child.stdout?.on("data", (chunk) => {
    const { frames, rest } = parseDeviceFrames(buffer + chunk);
    buffer = rest;
    for (const devices of frames) {
      const ready = new Set(devices.filter((d) => d.state === "device").map((d) => d.serial));
      for (const serial of ready) {
        if (online.has(serial)) continue;
        online.add(serial);
        for (const port of ports) {
          run(adb, ["-s", serial, "reverse", `tcp:${port}`, `tcp:${port}`], {}, (error) => {
            if (error) log(`  adb reverse tcp:${port} on ${serial} failed: ${error.message}`);
          });
        }
        log(`  Android ${serial}: reaching Metro and the preview opener on ${ports.join(", ")}`);
      }
      // A device that went away is mapped again when it comes back.
      for (const serial of [...online]) if (!ready.has(serial)) online.delete(serial);
    }
  });
  return () => {
    try {
      child.kill();
    } catch {}
  };
}
