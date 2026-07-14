// `bun run dev` (or `npm run dev`): starts the Expo docs dev server AND the local
// preview opener together, so the ios/android/web preview links work whenever the
// docs are running. Extra args are forwarded to Expo (e.g. `bun run dev --clear`).
// Ctrl-C stops both.

import { spawn } from "node:child_process";
import { startPreviewServer } from "./preview-server.mjs";

const server = startPreviewServer();

const expo = spawn("expo", ["start", ...process.argv.slice(2)], {
  stdio: "inherit",
  env: process.env,
});

expo.on("exit", (code) => {
  try {
    server.close();
  } catch {}
  process.exit(code ?? 0);
});

function shutdown(signal) {
  try {
    server.close();
  } catch {}
  if (expo.exitCode === null && !expo.killed) expo.kill(signal);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
