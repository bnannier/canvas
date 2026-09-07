import { describe, it, expect } from "bun:test";
import { readFileSync } from "node:fs";
import { join, relative as relativePath } from "node:path";
import { Glob } from "bun";
import { ICON_STROKE_WIDTH } from "../src/atoms/icon/icon.stroke.ts";

// Design rules, source side: the handful that are properties of the code itself
// rather than of a token or a skin object.
//
// Each one is a defect that is easy to introduce, invisible in review, and cheap to
// detect: a font size too small to read, a z-index picked out of the air, a second
// icon stroke weight, an animation long enough to feel like a hang.
//
// Scope is src/**/*.ts(x). Markdown is excluded on purpose: a docs example is allowed
// to demonstrate the wrong thing inside a "Don't" fence, and one does (the Calendar
// page crams event titles into 7px slivers to show exactly why not).

const ROOT = join(import.meta.dir, "..");

const sources = [...new Glob("src/**/*.{ts,tsx}").scanSync(ROOT)]
  .filter((f) => !f.endsWith(".d.ts"))
  .sort()
  .map((file) => ({ file, text: readFileSync(join(ROOT, file), "utf8") }));

it("finds the kit source", () => {
  expect(sources.length).toBeGreaterThan(200);
});

describe("layering", () => {
  // The CSS hand-off documents a deliberately shallow scale (10 raised, 40 dropdown,
  // 50 overlay) and every in-tree layer uses it. The two exceptions are the portal
  // outlets, which are not on that scale at all: they are full-screen React Native
  // hosts that must sit above an app's own content, and they never coexist with a
  // CSS z-index. An arbitrary 9999 is the defect this keeps out.
  const ALLOWED = new Set([1, 10, 40, 50, 900, 1000]);
  const OUTLETS: Record<string, number> = {
    "src/style/portal.tsx": 1000,
    "src/organisms/drag-drop/drag-drop.shared.tsx": 900,
  };

  it("every z-index comes from the scale, or is a named portal outlet", () => {
    const offenders: string[] = [];
    for (const { file, text } of sources) {
      text.split("\n").forEach((line, i) => {
        for (const m of line.matchAll(/zIndex:\s*(\d+)/g)) {
          const value = Number(m[1]);
          if (!ALLOWED.has(value)) offenders.push(`${file}:${i + 1} zIndex ${value}`);
          if (value > 50 && OUTLETS[file] !== value) {
            offenders.push(`${file}:${i + 1} zIndex ${value} is above the scale but is not a declared outlet`);
          }
        }
      });
    }
    expect(offenders).toEqual([]);
  });
});

describe("one icon stroke", () => {
  it("is declared once and drawn nowhere else", () => {
    const offenders: string[] = [];
    for (const { file, text } of sources) {
      // Chart marks set their own stroke widths: a series line, an axis rule and a
      // pie separator are data, not iconography.
      if (file.startsWith("src/charts/")) continue;
      if (file === "src/atoms/icon/icon.stroke.ts") continue;
      text.split("\n").forEach((line, i) => {
        if (/strokeWidth[=:]\s*\{?\s*[\d.]/.test(line)) offenders.push(`${file}:${i + 1} ${line.trim()}`);
      });
    }
    expect(offenders).toEqual([]);
  });

  it("is the Lucide-matching weight the glyph set was drawn at", () => {
    expect(ICON_STROKE_WIDTH).toBe(1.75);
  });

  it("is what the raster generator bakes into the native menu glyphs", () => {
    // A native iOS UIMenu cannot render SVG, so tools/rastergen bakes PNGs. Those
    // glyphs sit beside live Icons in the same menu, so a second weight there would
    // be visible in the one place it is hardest to notice in review.
    const generator = readFileSync(join(ROOT, "tools", "rastergen", "generate.ts"), "utf8");
    expect(generator).toContain("ICON_STROKE_WIDTH");
    expect(generator).not.toMatch(/stroke-width="[\d.]/);
  });
});

describe("animation length", () => {
  // A transition under 100ms is a jump; over 700ms the interface feels like it is
  // waiting on something. Loops are a different thing entirely: a spinner revolution
  // and an indeterminate progress sweep are paced to read as continuous motion, and
  // a clock driver has no duration of its own.
  const LOOPS = new Set([
    "src/atoms/spinner/spinner.shared.tsx",
    "src/atoms/progress/progress.shared.tsx",
    "src/atoms/skeleton/skeleton.shared.tsx",
    "src/organisms/backdrop/backdrop-clock.ts",
  ]);

  it("every transition lands between 100ms and 700ms", () => {
    const offenders: string[] = [];
    for (const { file, text } of sources) {
      if (LOOPS.has(file)) continue;
      text.split("\n").forEach((line, i) => {
        for (const m of line.matchAll(/duration:\s*(\d+)\b/g)) {
          const ms = Number(m[1]);
          if (ms < 100 || ms > 700) offenders.push(`${file}:${i + 1} duration ${ms}ms`);
        }
      });
    }
    expect(offenders).toEqual([]);
  });

  it("linear easing is reserved for the loops that need it", () => {
    // Linear on a transition reads mechanical; linear on a rotating spinner is the
    // only thing that keeps it from stuttering once per revolution.
    const offenders: string[] = [];
    for (const { file, text } of sources) {
      if (LOOPS.has(file)) continue;
      if (text.includes("Easing.linear")) offenders.push(file);
    }
    expect(offenders).toEqual([]);
  });
});
