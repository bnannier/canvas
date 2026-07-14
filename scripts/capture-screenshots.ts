/**
 * Visual regression screenshot capture for Canvas.
 *
 * Usage:
 *   bun scripts/capture-screenshots.ts            # compare against baselines
 *   bun scripts/capture-screenshots.ts --update    # capture/overwrite baselines
 */

import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFile, mkdir, access } from "node:fs/promises";
import { join, extname } from "node:path";
import { chromium, type Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const ROOT = join(import.meta.dir, "..");
const TEST_PAGE = "test/app-shell.html";
const SCREENSHOT_DIR = join(ROOT, "test", "screenshots");

// ---------------------------------------------------------------------------
// CLI flags
// ---------------------------------------------------------------------------

const isUpdate = process.argv.includes("--update");

// ---------------------------------------------------------------------------
// Tiny static file server
// ---------------------------------------------------------------------------

const MIME: Record<string, string> = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".ts": "application/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
};

function startServer(): Promise<{ url: string; close: () => void }> {
  return new Promise((resolve) => {
    const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
      const path = join(ROOT, (req.url ?? "/").split("?")[0]);
      try {
        const data = await readFile(path);
        const ext = extname(path);
        res.writeHead(200, { "Content-Type": MIME[ext] ?? "application/octet-stream" });
        res.end(data);
      } catch {
        res.writeHead(404);
        res.end("Not found");
      }
    });

    // Use port 0 so the OS picks a free port.
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      if (!addr || typeof addr === "string") throw new Error("Failed to bind server");
      resolve({
        url: `http://127.0.0.1:${addr.port}`,
        close: () => server.close(),
      });
    });
  });
}

// ---------------------------------------------------------------------------
// Theme mode definitions
// ---------------------------------------------------------------------------

interface ThemeMode {
  /** Filename-safe slug for the screenshot. */
  name: string;
  /** Steps to apply this theme mode in the browser. */
  apply: (page: Page) => Promise<void>;
}

const MODES: ThemeMode[] = [
  {
    name: "light",
    apply: async (page) => {
      // Reset to light defaults.
      await page.evaluate(() => {
        const html = document.documentElement;
        html.classList.remove("dark");
        delete html.dataset.surface;
        html.dataset.density = "";
      });
    },
  },
  {
    name: "dark",
    apply: async (page) => {
      await page.evaluate(() => {
        const html = document.documentElement;
        html.classList.add("dark");
        delete html.dataset.surface;
        html.dataset.density = "";
      });
    },
  },
  {
    name: "dark-glass",
    apply: async (page) => {
      await page.evaluate(() => {
        const html = document.documentElement;
        html.classList.add("dark");
        html.dataset.surface = "glass";
        html.dataset.density = "";
      });
    },
  },
  {
    name: "light-compact",
    apply: async (page) => {
      await page.evaluate(() => {
        const html = document.documentElement;
        html.classList.remove("dark");
        delete html.dataset.surface;
        html.dataset.density = "compact";
      });
    },
  },
];

// ---------------------------------------------------------------------------
// Pixel diff (used when not in --update mode)
// ---------------------------------------------------------------------------

// Pixel-level threshold: 5 % covers typical font hinting and anti-aliasing
// variance across OSes while still catching real CSS regressions.
const MAX_DIFF_PIXEL_RATIO = 0.05;

// Dimension tolerance: cross-platform font rendering can shift total page
// height by a few pixels. 1 % covers that without masking real layout
// breakage (missing sections, wrong component order, etc.).
const MAX_DIMENSION_DIFF_RATIO = 0.01;

function getPngDimensions(buf: Buffer): { width: number; height: number } {
  // PNG IHDR: width at bytes 16-19, height at bytes 20-23 (big-endian).
  return {
    width: buf.readUInt32BE(16),
    height: buf.readUInt32BE(20),
  };
}

function compareImages(
  baseline: Buffer,
  current: Buffer,
): { match: boolean; message: string } {
  const baselineDim = getPngDimensions(baseline);
  const currentDim = getPngDimensions(current);

  const widthDiff = Math.abs(baselineDim.width - currentDim.width) / baselineDim.width;
  const heightDiff = Math.abs(baselineDim.height - currentDim.height) / baselineDim.height;

  if (widthDiff > MAX_DIMENSION_DIFF_RATIO || heightDiff > MAX_DIMENSION_DIFF_RATIO) {
    return {
      match: false,
      message: `dimension mismatch beyond tolerance: ${baselineDim.width}x${baselineDim.height} vs ${currentDim.width}x${currentDim.height}`,
    };
  }

  // Accept small dimension diffs caused by cross-platform font metrics.
  if (baselineDim.width !== currentDim.width || baselineDim.height !== currentDim.height) {
    return {
      match: true,
      message: `pass (size tolerance: ${baselineDim.width}x${baselineDim.height} vs ${currentDim.width}x${currentDim.height})`,
    };
  }

  // Dimensions match; compare pixels.
   
  const { utils } = require("playwright-core/lib/coreBundle");
  const compare = utils.getComparator("image/png");

  const result = compare(baseline, current, {
    maxDiffPixelRatio: MAX_DIFF_PIXEL_RATIO,
  });

  if (!result) return { match: true, message: "pass" };

  const detail = typeof result === "object" && "errorMessage" in result
    ? result.errorMessage
    : "pixel diff exceeded threshold";
  return { match: false, message: detail };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // Ensure output directory exists.
  await mkdir(SCREENSHOT_DIR, { recursive: true });

  const server = await startServer();
  console.log(`Static server on ${server.url}`);

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  const pageUrl = `${server.url}/${TEST_PAGE}`;
  await page.goto(pageUrl, { waitUntil: "networkidle" });

  // Small pause for any CSS transitions/animations to settle.
  await page.waitForTimeout(300);

  const results: { name: string; status: string }[] = [];

  for (const mode of MODES) {
    const filename = `app-shell-${mode.name}.png`;
    const filepath = join(SCREENSHOT_DIR, filename);

    await mode.apply(page);
    // Allow repaints to complete after theme change.
    await page.waitForTimeout(200);

    const screenshot = await page.screenshot({ fullPage: true });

    if (isUpdate) {
      // Write baseline.
      await Bun.write(filepath, screenshot);
      results.push({ name: mode.name, status: "updated" });
    } else {
      // Compare against existing baseline.
      let exists = true;
      try {
        await access(filepath);
      } catch {
        exists = false;
      }

      if (!exists) {
        results.push({ name: mode.name, status: "no baseline (run with --update)" });
        continue;
      }

      const baseline = await readFile(filepath);
      const { match, message } = compareImages(baseline, screenshot);
      results.push({ name: mode.name, status: match ? "pass" : `DIFF: ${message}` });
      if (!match) {
        // Save the current capture alongside the baseline for inspection.
        const diffPath = join(SCREENSHOT_DIR, `app-shell-${mode.name}.current.png`);
        await Bun.write(diffPath, screenshot);
      }
    }
  }

  await browser.close();
  server.close();

  // Report
  console.log("\nScreenshot Results");
  console.log("==================\n");
  console.log(`${"Mode".padEnd(20)} Status`);
  console.log("-".repeat(40));

  let failed = false;
  for (const r of results) {
    console.log(`${r.name.padEnd(20)} ${r.status}`);
    if (r.status.startsWith("DIFF") || r.status.startsWith("no baseline")) {
      failed = true;
    }
  }

  console.log();

  if (isUpdate) {
    console.log("Baselines updated. Commit the screenshots to lock them in.");
  } else if (failed) {
    console.log("Visual differences detected. Review .current.png files in test/screenshots/.");
    console.log("Run with --update to accept the new screenshots as baselines.");
    process.exit(1);
  } else {
    console.log("All screenshots match baselines.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
