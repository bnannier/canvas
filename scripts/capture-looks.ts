/**
 * Landing-hero capture pipeline for the "One component API. Three native looks."
 * comparison rotator.
 *
 * Captures every atom's docs page as a FULL device screen (status bar, app bar, tab bar
 * and gesture bar all in frame, nothing cropped) on three surfaces, then encodes the set
 * to webp and regenerates the shot map that docs/src/shell/three-looks-rotator.tsx reads.
 *
 * Every surface is captured at one uniform size, the iPhone 17 Pro screen: 402x874 pt /
 * 1206x2622 px. On Android `wm density 480` makes that pixel size resolve to exactly
 * 402x874 dp, so both platforms lay out at the same logical size and the three hero panes
 * are identical in shape. The emulator override is always reset on exit.
 *
 * Prerequisites: the iPhone 17 Pro simulator booted with the docs app installed, the
 * Android emulator running with the docs app installed, and the docs web server up.
 *
 * Usage:
 *   bun scripts/capture-looks.ts                          # all atoms, all surfaces
 *   bun scripts/capture-looks.ts --only=switch,button      # a subset
 *   bun scripts/capture-looks.ts --surfaces=ios,web        # a subset of surfaces
 *   BASE=http://localhost:8081 bun scripts/capture-looks.ts
 */
import { execFileSync } from "node:child_process";
import { mkdir, rm, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { chromium, type Page } from "@playwright/test";
import { COMPONENTS } from "../docs/src/core/data/components.ts";

const ROOT = join(import.meta.dir, "..");
const RAW = join(ROOT, ".looks-raw");
const OUT = join(ROOT, "docs", "assets", "images", "looks");
const MAP = join(ROOT, "docs", "src", "shell", "looks-shots.web.ts");

// The iPhone 17 Pro screen, used verbatim for all three surfaces.
const SCREEN = { w: 1206, h: 2622, pt: { w: 402, h: 874 }, scale: 3 };
// Display size in the hero. 480 wide is ~1.5x the rendered pane, enough to stay crisp.
const OUT_W = 480;
const OUT_H = Math.round((OUT_W * SCREEN.h) / SCREEN.w); // 1044
// A painted page at 1206x2622 is hundreds of KB of PNG; a blank splash is ~25KB.
const BLANK_BYTES = 60_000;

const SCHEME = "canvas";
const ANDROID_PKG = "com.nannier.canvas";
const ADB = process.env.ADB ?? "/opt/homebrew/share/android-commandlinetools/platform-tools/adb";
const BASE = process.env.BASE ?? "http://localhost:8081";

const arg = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const only = arg("only")?.split(",").filter(Boolean);
const surfaces = (arg("surfaces")?.split(",").filter(Boolean) ?? ["ios", "android", "web"]) as Surface[];

type Surface = "ios" | "android" | "web";

const ATOMS = COMPONENTS.filter((c) => c.category === "Atoms")
  .map((c) => c.slug)
  .filter((s) => !only || only.includes(s))
  .sort();

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const sh = (cmd: string, args: string[]) => execFileSync(cmd, args, { encoding: "buffer" });
const adb = (...args: string[]) => sh(ADB, args);

// ---------------------------------------------------------------------------
// iOS: deep link into the booted simulator, then grab the whole screen.
// ---------------------------------------------------------------------------
async function captureIos(slug: string, file: string) {
  sh("xcrun", ["simctl", "openurl", "booted", `${SCHEME}:///components/${slug}`]);
  await sleep(2600);
  sh("xcrun", ["simctl", "io", "booted", "screenshot", file]);
}

// ---------------------------------------------------------------------------
// Android: same deep link over an intent, screen grabbed off the framebuffer.
// ---------------------------------------------------------------------------
async function captureAndroid(slug: string, file: string) {
  adb("shell", "am", "start", "-a", "android.intent.action.VIEW", "-d", `${SCHEME}:///components/${slug}`);
  await sleep(2600);
  await writeFile(file, adb("exec-out", "screencap", "-p"));
}

// Retarget the emulator to the iPhone's screen for the run. Density 480 makes
// 1206x2622 px land on exactly 402x874 dp, matching the iOS point size.
async function androidSetup() {
  adb("shell", "wm", "size", `${SCREEN.w}x${SCREEN.h}`);
  adb("shell", "wm", "density", "480");
  // A metrics change restarts the activity, and this is a dev build that has to pull a
  // Metro bundle on cold start. Without a real wait here the first deep links land on a
  // process that is still coming up and capture a blank splash.
  adb("shell", "am", "force-stop", ANDROID_PKG);
  adb("shell", "monkey", "-p", ANDROID_PKG, "-c", "android.intent.category.LAUNCHER", "1");
  await sleep(18000);
}

function androidTeardown() {
  try {
    adb("shell", "wm", "size", "reset");
    adb("shell", "wm", "density", "reset");
  } catch {
    console.warn("! could not reset the emulator display; run `adb shell wm size reset` by hand");
  }
}

// ---------------------------------------------------------------------------
// Web: the docs at phone width, captured at 3x so it matches the native pixel size.
// ---------------------------------------------------------------------------
async function captureWeb(page: Page, slug: string, file: string) {
  await page.goto(`${BASE}/components/${slug}`, { waitUntil: "networkidle" });
  await sleep(1200);
  await page.screenshot({ path: file });
}

// ---------------------------------------------------------------------------
// Encode + map
// ---------------------------------------------------------------------------
async function encode(raw: string, out: string) {
  await sharp(raw).resize(OUT_W, OUT_H, { fit: "fill" }).webp({ quality: 82 }).toFile(out);
}

// A deep link that has not routed yet leaves the PREVIOUS atom's page on screen, which
// is painted and full-size, so the blank guard sails right past it. Compare each grab
// with the last accepted one on the same surface: a real navigation changes the title
// and body enough to move this well past the threshold, a stale frame barely moves.
async function fingerprint(file: string) {
  return await sharp(file).grayscale().resize(64, 139, { fit: "fill" }).raw().toBuffer();
}

function meanAbsDiff(a: Buffer, b: Buffer) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += Math.abs(a[i] - b[i]);
  return sum / a.length;
}

const STALE_MAD = 4;

async function writeMap() {
  const rows = ATOMS.map((slug) => {
    const req = (p: Surface) => `require("../../assets/images/looks/${slug}-${p}.webp")`;
    return `  "${slug}": { ios: ${req("ios")}, android: ${req("android")}, web: ${req("web")} },`;
  }).join("\n");
  await writeFile(
    MAP,
    `// GENERATED by scripts/capture-looks.ts (full device-screen captures of each atom's
// docs page on the iPhone 17 Pro simulator, the Android emulator retargeted to the same
// screen, and phone-width web; encoded ${OUT_W}x${OUT_H} webp). Every surface shares the
// iPhone 17 Pro aspect so the three hero panes are identical. Do not edit by hand.
/* eslint-disable @typescript-eslint/no-require-imports */
export const LOOKS_SHOTS: Record<string, { ios: number; android: number; web: number }> = {
${rows}
};

export const LOOKS_ASPECT = ${SCREEN.w} / ${SCREEN.h};
`,
  );
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------
async function main() {
  await mkdir(RAW, { recursive: true });
  await mkdir(OUT, { recursive: true });
  console.log(`Capturing ${ATOMS.length} atoms on [${surfaces.join(", ")}] at ${SCREEN.w}x${SCREEN.h}`);

  let browser, page: Page | undefined;
  if (surfaces.includes("web")) {
    browser = await chromium.launch();
    page = await browser.newPage({
      viewport: { width: SCREEN.pt.w, height: SCREEN.pt.h },
      deviceScaleFactor: SCREEN.scale,
      colorScheme: "dark",
    });
  }
  if (surfaces.includes("android")) await androidSetup();

  // Last accepted frame per surface, used to prove each deep link actually routed.
  const lastPrint: Partial<Record<Surface, Buffer>> = {};

  try {
    for (const [i, slug] of ATOMS.entries()) {
      for (const s of surfaces) {
        const raw = join(RAW, `${slug}-${s}.png`);
        // A page that has not painted yet compresses to almost nothing, so an
        // implausibly small grab means "still loading", not "captured". Retry rather
        // than banking a blank splash screen.
        let bytes = 0;
        let print: Buffer | undefined;
        for (let attempt = 1; attempt <= 4; attempt++) {
          if (s === "ios") await captureIos(slug, raw);
          if (s === "android") await captureAndroid(slug, raw);
          if (s === "web" && page) await captureWeb(page, slug, raw);

          bytes = (await stat(raw)).size;
          if (bytes < BLANK_BYTES) {
            console.warn(`    ${slug}-${s}: ${bytes}B looks blank, retry ${attempt}/4`);
            await sleep(4000);
            continue;
          }

          print = await fingerprint(raw);
          const prev = lastPrint[s];
          const diff = prev ? meanAbsDiff(print, prev) : Infinity;
          if (diff >= STALE_MAD) break;
          console.warn(`    ${slug}-${s}: still showing the previous page (diff ${diff.toFixed(2)}), retry ${attempt}/4`);
          await sleep(3500);
        }
        if (bytes < BLANK_BYTES) throw new Error(`${slug}-${s} never painted (${bytes}B)`);
        if (print) lastPrint[s] = print;
        await encode(raw, join(OUT, `${slug}-${s}.webp`));
      }
      console.log(`  [${i + 1}/${ATOMS.length}] ${slug}`);
    }
  } finally {
    if (surfaces.includes("android")) androidTeardown();
    await browser?.close();
  }

  if (!only && surfaces.length === 3) await writeMap();
  await rm(RAW, { recursive: true, force: true });
  console.log("Done.");
}

await main();
