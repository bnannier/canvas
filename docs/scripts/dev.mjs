// `bun run dev` (or `npm run dev`): starts the Expo docs dev server AND the local
// preview opener together, so the ios/android/web preview links work whenever the
// docs are running. Extra args are forwarded to Expo (e.g. `bun run dev --clear`).
// Ctrl-C stops both.

import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { startPreviewServer } from "./preview-server.mjs";
import { adbPath } from "./preview-links.mjs";
import { watchDevicePorts } from "./device-ports.mjs";

const server = startPreviewServer();

// Every Android device or emulator that comes online reaches Metro and the opener through
// `adb reverse`, so its docs app live-reloads with no hand-run step (./device-ports.mjs).
const stopDevicePorts = watchDevicePorts({
  adb: adbPath(process.env, existsSync),
  ports: [Number(process.env.EXPO_WEB_PORT ?? process.env.RCT_METRO_PORT ?? 8081), Number(process.env.PREVIEW_PORT ?? 8790)],
});

const expo = spawn("expo", ["start", ...process.argv.slice(2)], {
  stdio: "inherit",
  // Hydrate the pre-rendered dev documents the way the export's pages hydrate, instead
  // of expo-router's dev default of rendering from scratch over the server's markup: a
  // hydration mismatch then shows in the dev console rather than only in production,
  // and the paint-first document the dev middleware serves (scripts/dev-documents.cjs)
  // becomes interactive in place. An explicit environment wins. This is what surfaced
  // Expo's useId shift under #root (docs/patches): production React never diffs a
  // hydrated attribute, so the export kept the wrong ids silently, and only a hydrating
  // development build reports them. Keep hydrating here.
  env: { EXPO_WEB_DEV_HYDRATE: "1", ...process.env },
});

expo.on("exit", (code) => {
  stopDevicePorts();
  try {
    server.close();
  } catch {}
  process.exit(code ?? 0);
});

function shutdown(signal) {
  stopDevicePorts();
  try {
    server.close();
  } catch {}
  if (expo.exitCode === null && !expo.killed) expo.kill(signal);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
