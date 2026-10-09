#!/usr/bin/env bun
// `bun run audit:analyze`: the component audit's analysis step (plan 1e). For the newest
// capture of every cell across the runs under .audit/runs (runs.ts), it reads what the
// capture recorded and writes `analysis.json` beside the cell's probe.json:
//
// - contrast: from the probe's DOM-composited background where it resolved (probe-math.ts,
//   method "dom": fails under the 4.5 or 3 the text owes). Where the DOM could not say what
//   is under a text (a backdrop filter, a gradient, an image), only the background is read
//   from card.png, method "painted-ink+pixel-background": the ink is the text's colour as the
//   probe recorded it (its own alpha and its opacity groups, composited over that
//   background), and the background is the dominant colour among the pixels of the text's
//   box that are neither ink nor antialiasing. A photograph shows a glyph's ink only in its
//   thickest pixels, which is why reading the ink off the pixels under-read thin text; the
//   background fills most of the box and reads true. A text whose painted colour the probe
//   cannot give (a colour it cannot read, a transparent one, a probe older than the SVG fill
//   or placeholder opacity) falls back to the photograph alone, method "pixel-percentiles":
//   the 10th and 90th luminance percentiles of its ink's bounds read as ink and background.
//   Either way the background is a sample, so neither says "fail" outright: under 8/9 of
//   what the text owes (4.0 for 4.5, 2.67 for 3) is "fail-likely", from there up to what it
//   owes is "review". `bun run audit:calibrate` measures both against the DOM (audit/README.md
//   has the numbers). A disabled control's text owes nothing (WCAG 1.4.3's inactive
//   exception), and a text something else paints over is not sampled.
// - type: the smallest painted size (the probe's computed size times its glyph scale), and
//   the counts under the 10 px source floor and the 12 px body floor.
// - targets: per platform row, the interactive boxes under its floor (44 pt iOS, 48 dp
//   Android, 24 px web; probe-math.ts TARGET_FLOORS); on a device, the Android
//   accessibility nodes a user acts on under 48 dp.
// - structure: the web row's ariaSnapshot must be identical across the looks and surfaces
//   of one variant at one width; the cells that differ from the most common snapshot of
//   their group are flagged with the first line that differs.
// - native accessibility: every node a user acts on has a name a screen reader announces
//   (Android: clickable or checkable nodes, named themselves or by a named node inside
//   them, as TalkBack reads them; iOS: XCUITest through Maestro reports no traits, so a node
//   announced only by its value is the one with no name).
// - the cell's flags: the capture's own and the analysis' (ANALYSIS_FLAGS). A cell its record
//   says failed is filed under `failed` whatever files it left, and its accessibility tree
//   takes no part in its group's structure vote.
//
//   bun run audit:analyze                         every current cell
//   bun run audit:analyze -- --only=button,switch  those components' cells
//   bun run audit:analyze -- --run=20261009-135735-web-00d04a7   only that run's cells
//
// analysis.json is derived data: it is rewritten on every run of the command, and a cell's
// structure verdict depends on its peers' current captures, which a later re-capture can
// change. Exit status: 0, or 2 for a usage error.

import { existsSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import sharp from "sharp";
import { ROOT } from "../../e2e/support/routes.ts";
import type { A11yNode, A11ySnapshot } from "./native/a11y.ts";
import { TARGET_FLOORS, flagsOf, over, parseCssColor, type Box, type ProbeSummary, type ProbeTarget, type ProbeText, type RowPlatform } from "./probe-math.ts";
import {
  ANALYSIS_FILE,
  currentCells,
  groupKey,
  notReached,
  parseToolArgs,
  pool,
  readJsonFile,
  type CapturedCell,
} from "./runs.ts";
import { CARD_FILE, PROBE_FILE } from "./web-capture.ts";

// --- Contrast from the card's pixels ------------------------------------------------

export type RGB = [number, number, number];

/** The percentiles the percentile method reads as ink and background. */
export const PIXEL_PERCENTILES = { low: 10, high: 90 } as const;
/** The share of what a text owes under which a sampled contrast is "fail-likely" rather than "review": 4.0 of 4.5. */
export const FAIL_LIKELY_SHARE = 4 / 4.5;
/** A box with fewer device pixels than this is not sampled: too few to have both ink and background. */
export const MIN_SAMPLES = 16;

const LINEAR = Array.from({ length: 256 }, (_, i) => {
  const c = i / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
});

/** WCAG 2 relative luminance of an 8-bit sRGB colour. */
export function relativeLuminance(rgb: RGB): number {
  const [r, g, b] = rgb.map((c) => LINEAR[Math.max(0, Math.min(255, Math.round(c)))]!) as RGB;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2 contrast of two relative luminances. */
export function contrastOfLuminance(a: number, b: number): number {
  const [hi, lo] = a >= b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

/** A decoded image: its pixels row-major, `channels` bytes each (RGB first). */
export interface RawImage {
  data: Uint8Array;
  width: number;
  height: number;
  channels: number;
}

/** A region of an image, in its pixels. */
export interface PixelRegion {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** The nearest-rank `p`th percentile's index into `n` sorted values. */
export function percentileIndex(n: number, p: number): number {
  return Math.min(n - 1, Math.max(0, Math.ceil((p / 100) * n) - 1));
}

export interface PixelSample {
  samples: number;
  /** The darker percentile's pixel and its luminance. */
  low: { rgb: RGB; luminance: number };
  /** The lighter percentile's pixel and its luminance. */
  high: { rgb: RGB; luminance: number };
  contrast: number;
  /** The region sampled: the ink's bounds inside the text's box (`inkRegion`). */
  region: PixelRegion;
}

/** How far from the box's median a pixel's luminance must be, as a contrast, to count as ink. */
export const INK_CONTRAST = 1.25;

const luminanceAt = (image: RawImage, x: number, y: number) => {
  const offset = (y * image.width + x) * image.channels;
  return 0.2126 * LINEAR[image.data[offset]!]! + 0.7152 * LINEAR[image.data[offset + 1]!]! + 0.0722 * LINEAR[image.data[offset + 2]!]!;
};

/** `region` clamped to the image. */
export function clampRegion(image: Pick<RawImage, "width" | "height">, region: PixelRegion): PixelRegion {
  const left = Math.max(0, region.left);
  const top = Math.max(0, region.top);
  const right = Math.min(image.width, region.left + region.width);
  const bottom = Math.min(image.height, region.top + region.height);
  return { left, top, width: Math.max(0, right - left), height: Math.max(0, bottom - top) };
}

/**
 * The ink's bounds inside a text's box. A text's box is its element's, which a stretched
 * or padded element makes much larger than its glyphs, and with the ink a small share of
 * the box its 10th or 90th percentile lands on the background or on antialiasing. The
 * box's median luminance is its background (a text's ink covers less than half its box);
 * every pixel at least INK_CONTRAST from it is ink, and their bounds, one pixel wider on
 * each side and kept inside the box, are what is sampled. A box with no ink (text the
 * colour of its background) is sampled whole.
 */
export function inkRegion(image: RawImage, region: PixelRegion): PixelRegion {
  const box = clampRegion(image, region);
  const n = box.width * box.height;
  if (n === 0) return box;
  const values = new Float64Array(n);
  let i = 0;
  for (let y = box.top; y < box.top + box.height; y++) for (let x = box.left; x < box.left + box.width; x++) values[i++] = luminanceAt(image, x, y);
  const median = Float64Array.from(values).sort()[Math.floor(n / 2)]!;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  i = 0;
  for (let y = box.top; y < box.top + box.height; y++) {
    for (let x = box.left; x < box.left + box.width; x++) {
      if (contrastOfLuminance(values[i++]!, median) >= INK_CONTRAST) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }
  if (minX === Infinity) return box;
  const left = Math.max(box.left, minX - 1);
  const top = Math.max(box.top, minY - 1);
  return { left, top, width: Math.min(box.left + box.width, maxX + 2) - left, height: Math.min(box.top + box.height, maxY + 2) - top };
}

/**
 * The contrast inside `region` of `image`: the pixels' relative luminances sorted, the
 * `low`th and `high`th percentiles (nearest rank) read as the two colours, and the WCAG
 * contrast between them. Null when the region holds fewer than MIN_SAMPLES pixels.
 */
export function sampleRegion(image: RawImage, region: PixelRegion, percentiles: { low: number; high: number } = PIXEL_PERCENTILES): PixelSample | null {
  const { left, top, width, height } = clampRegion(image, region);
  const right = left + width;
  const bottom = top + height;
  const n = width * height;
  if (n < MIN_SAMPLES) return null;
  const luminance = new Float64Array(n);
  const order = new Uint32Array(n);
  const at = new Uint32Array(n);
  let i = 0;
  for (let y = top; y < bottom; y++) {
    for (let x = left; x < right; x++) {
      const offset = (y * image.width + x) * image.channels;
      luminance[i] = 0.2126 * LINEAR[image.data[offset]!]! + 0.7152 * LINEAR[image.data[offset + 1]!]! + 0.0722 * LINEAR[image.data[offset + 2]!]!;
      order[i] = i;
      at[i] = offset;
      i++;
    }
  }
  order.sort((a, b) => luminance[a]! - luminance[b]!);
  const pick = (p: number) => {
    const index = order[percentileIndex(n, p)]!;
    const offset = at[index]!;
    return { rgb: [image.data[offset]!, image.data[offset + 1]!, image.data[offset + 2]!] as RGB, luminance: luminance[index]! };
  };
  const low = pick(percentiles.low);
  const high = pick(percentiles.high);
  return { samples: n, low, high, contrast: Math.round(contrastOfLuminance(low.luminance, high.luminance) * 100) / 100, region: { left, top, width, height } };
}

/** A text's percentile contrast: its box as device pixels, narrowed to its ink, then the percentiles. */
export function sampleText(image: RawImage, box: Box, dpr: number): PixelSample | null {
  const region = boxToRegion(box, dpr, image);
  return region ? sampleRegion(image, inkRegion(image, region)) : null;
}

/** A box in CSS px (relative to the card) as the image's device pixels: rounded outward, clamped to the image. */
export function boxToRegion(box: Box, dpr: number, image: Pick<RawImage, "width" | "height">): PixelRegion | null {
  const left = Math.max(0, Math.floor(box.x * dpr));
  const top = Math.max(0, Math.floor(box.y * dpr));
  const right = Math.min(image.width, Math.ceil((box.x + box.width) * dpr));
  const bottom = Math.min(image.height, Math.ceil((box.y + box.height) * dpr));
  if (right <= left || bottom <= top) return null;
  return { left, top, width: right - left, height: bottom - top };
}

// --- The painted ink over the photographed background ---------------------------------

/** A text's ink as it paints: its colour, and the alpha it paints that colour with. */
export interface PaintedInk {
  rgb: RGB;
  /** The colour's own alpha times the text's fill or placeholder opacity times its opacity groups. */
  alpha: number;
}

/**
 * The ink a text paints with, from what the probe recorded, or why there is none to take.
 * HTML text paints with its colour alone; an SVG text's fill-opacity and a placeholder's own
 * opacity are `colorAlpha`, which probes written before it was recorded do not carry.
 */
export function paintedInk(text: Pick<ProbeText, "color" | "colorAlpha" | "opacity" | "svg" | "field">): PaintedInk | { none: string } {
  const color = parseCssColor(text.color);
  if (!color) return { none: `its colour ${text.color} cannot be read` };
  const own = text.colorAlpha ?? (text.svg || text.field?.part === "placeholder" ? null : 1);
  if (own === null) return { none: `the probe predates the ${text.svg ? "SVG fill-opacity" : "placeholder opacity"} it paints with` };
  const alpha = color[3] * own * text.opacity;
  if (!(alpha > 0)) return { none: "its colour is transparent, so something other than its colour paints its glyphs" };
  return { rgb: [color[0], color[1], color[2]], alpha: Math.min(1, alpha) };
}

/** `ink` as it paints over the opaque `background`. */
export function inkOver(ink: PaintedInk, background: RGB): RGB {
  return ink.alpha >= 1 ? ink.rgb : over([ink.rgb[0], ink.rgb[1], ink.rgb[2], ink.alpha], background);
}

/** The percentile of the pixels' distances from the ink that stands for the background's: a stray pixel does not set it. */
export const FAR_PERCENTILE = 95;
/**
 * The share of the background's distance from the ink a pixel must reach to be taken for
 * background: a glyph's antialiased edge, a blend of ink and background, mostly falls short.
 */
export const BACKGROUND_SHARE = 0.5;
/** A colour bin's width in 8-bit sRGB levels, and the radius the dominant colour's cluster is gathered within. */
export const BACKGROUND_BIN = 16;
export interface BackgroundSample {
  rgb: RGB;
  /** The pixels of the region sampled. */
  samples: number;
  /** The share of them the background's cluster holds. */
  share: number;
  /** The region sampled: the ink's bounds inside the text's box (`inkRegion`). */
  region: PixelRegion;
}

const BIN_SHIFT = Math.log2(BACKGROUND_BIN);
const BINS_PER_CHANNEL = 256 / BACKGROUND_BIN;

/**
 * The background among `pixels` (RGB triples) behind ink that paints `reference`. Every
 * pixel at least BACKGROUND_SHARE of the far distance from the ink (the FAR_PERCENTILE of
 * the distances) is taken for background, the rest for ink or its antialiasing; those are
 * binned, and the background is the mean of every one of them within one bin's width of the
 * fullest bin's mean.
 */
function dominantFar(pixels: Uint8Array, reference: RGB): { rgb: RGB; count: number } {
  const n = pixels.length / 3;
  const distance = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const dr = pixels[i * 3]! - reference[0];
    const dg = pixels[i * 3 + 1]! - reference[1];
    const db = pixels[i * 3 + 2]! - reference[2];
    distance[i] = Math.sqrt(dr * dr + dg * dg + db * db);
  }
  const far = Float64Array.from(distance).sort()[percentileIndex(n, FAR_PERCENTILE)]!;
  const threshold = BACKGROUND_SHARE * far;
  const bins = new Uint32Array(BINS_PER_CHANNEL ** 3);
  const binOf = (i: number) => ((pixels[i * 3]! >> BIN_SHIFT) * BINS_PER_CHANNEL + (pixels[i * 3 + 1]! >> BIN_SHIFT)) * BINS_PER_CHANNEL + (pixels[i * 3 + 2]! >> BIN_SHIFT);
  for (let i = 0; i < n; i++) if (distance[i]! >= threshold) bins[binOf(i)]! += 1;
  let peak = 0;
  for (let bin = 1; bin < bins.length; bin++) if (bins[bin]! > bins[peak]!) peak = bin;
  const mean = (keep: (i: number) => boolean): { rgb: RGB; count: number } => {
    const sum = [0, 0, 0];
    let count = 0;
    for (let i = 0; i < n; i++) {
      if (distance[i]! < threshold || !keep(i)) continue;
      sum[0] += pixels[i * 3]!;
      sum[1] += pixels[i * 3 + 1]!;
      sum[2] += pixels[i * 3 + 2]!;
      count += 1;
    }
    return { rgb: [sum[0]! / count, sum[1]! / count, sum[2]! / count], count };
  };
  const centre = mean((i) => binOf(i) === peak).rgb;
  return mean((i) => Math.hypot(pixels[i * 3]! - centre[0], pixels[i * 3 + 1]! - centre[1], pixels[i * 3 + 2]! - centre[2]) <= BACKGROUND_BIN);
}

/**
 * The background inside `region` of `image` behind a text that paints with `ink`: the
 * dominant colour among the pixels that are neither ink nor its antialiasing (dominantFar).
 * A translucent ink paints between its colour and the background, so the pixels are
 * measured again from what it paints over the first reading. Null when the region holds
 * fewer than MIN_SAMPLES pixels.
 */
export function sampleBackground(image: RawImage, region: PixelRegion, ink: PaintedInk): BackgroundSample | null {
  const box = clampRegion(image, region);
  const n = box.width * box.height;
  if (n < MIN_SAMPLES) return null;
  const pixels = new Uint8Array(n * 3);
  let i = 0;
  for (let y = box.top; y < box.top + box.height; y++) {
    for (let x = box.left; x < box.left + box.width; x++) {
      const offset = (y * image.width + x) * image.channels;
      pixels[i++] = image.data[offset]!;
      pixels[i++] = image.data[offset + 1]!;
      pixels[i++] = image.data[offset + 2]!;
    }
  }
  let found = dominantFar(pixels, ink.rgb);
  if (ink.alpha < 1) found = dominantFar(pixels, inkOver(ink, found.rgb));
  return { rgb: found.rgb, samples: n, share: found.count / n, region: box };
}

/** Where the analysis reads a card's pixels for the texts the DOM could not resolve. */
export interface CardSampler {
  /** The background behind a text's box (its ink's bounds), given the ink it paints with. */
  background(box: Box, ink: PaintedInk): BackgroundSample | null;
  /** The 10th and 90th luminance percentiles at a text's ink, for a text with no painted ink. */
  percentiles(box: Box): PixelSample | null;
}

/** A sampler over a decoded card image taken at `dpr` device pixels per CSS px. */
export function cardSampler(image: RawImage, dpr: number): CardSampler {
  return {
    background(box, ink) {
      const region = boxToRegion(box, dpr, image);
      return region ? sampleBackground(image, inkRegion(image, region), ink) : null;
    },
    percentiles: (box) => sampleText(image, box, dpr),
  };
}

export type ContrastVerdict = "pass" | "fail" | "review" | "fail-likely" | "exempt" | "unmeasured";

/** How a text's contrast was measured. */
export const CONTRAST_METHODS = {
  /** The probe's composite of the DOM's paint stack. */
  dom: "dom",
  /** The text's painted ink over the background read from the card's pixels. */
  paintedInk: "painted-ink+pixel-background",
  /** Both colours read from the card's pixels: only for a text with no painted ink colour. */
  percentiles: "pixel-percentiles",
  none: "none",
} as const;
export type ContrastMethod = (typeof CONTRAST_METHODS)[keyof typeof CONTRAST_METHODS];

/** Whether a method read the card's pixels, so its verdicts are fail-likely or review rather than fail. */
export const isPixelMethod = (method: ContrastMethod) => method === CONTRAST_METHODS.paintedInk || method === CONTRAST_METHODS.percentiles;

/** A sampled contrast's verdict against what the text owes. */
export function pixelVerdict(contrast: number, required: number): ContrastVerdict {
  if (contrast < required * FAIL_LIKELY_SHARE) return "fail-likely";
  if (contrast < required) return "review";
  return "pass";
}

const hex = (rgb: RGB) => `#${rgb.map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")}`;

export interface TextContrast {
  row: RowPlatform;
  text: string;
  size: number;
  required: number;
  method: ContrastMethod;
  contrast: number | null;
  verdict: ContrastVerdict;
  /** The text's colour as painted: the DOM's composite, the painted ink over the sampled background, or the sampled percentile nearer the text's own colour. */
  ink?: string;
  background?: string;
  samples?: number;
  /** painted-ink+pixel-background: the share of the sampled pixels the background's colour holds. */
  backgroundShare?: number;
  /** Why it was not measured, why the DOM could not resolve it, and why the percentiles were used. */
  reason?: string;
}

/** A contrast read from the card's pixels, by the method the text's recorded ink allows. */
export type PixelContrast = Required<Pick<TextContrast, "method" | "ink" | "background" | "samples">> & Pick<TextContrast, "backgroundShare"> & { contrast: number; fallback?: string };

/** A text's painted ink over the background its box shows, or null when its box holds too few pixels. */
export function paintedInkContrast(text: Pick<ProbeText, "box">, ink: PaintedInk, sampler: CardSampler): PixelContrast | null {
  const background = sampler.background(text.box, ink);
  if (!background) return null;
  const painted = inkOver(ink, background.rgb);
  return {
    method: CONTRAST_METHODS.paintedInk,
    contrast: Math.round(contrastOfLuminance(relativeLuminance(painted), relativeLuminance(background.rgb)) * 100) / 100,
    ink: hex(painted),
    background: hex(background.rgb),
    samples: background.samples,
    backgroundShare: Math.round(background.share * 100) / 100,
  };
}

/** A text's contrast from the percentiles of its ink's bounds alone, or null when its box holds too few pixels. */
export function percentileContrast(text: Pick<ProbeText, "box" | "color">, sampler: CardSampler): PixelContrast | null {
  const measured = sampler.percentiles(text.box);
  if (!measured) return null;
  // The percentile nearer the text's declared colour is its ink; contrast is symmetric either way.
  const declared = parseCssColor(text.color);
  let [ink, background] = [measured.low, measured.high];
  if (declared) {
    const target = relativeLuminance([declared[0], declared[1], declared[2]]);
    if (Math.abs(measured.high.luminance - target) < Math.abs(measured.low.luminance - target)) [ink, background] = [measured.high, measured.low];
  }
  return { method: CONTRAST_METHODS.percentiles, contrast: measured.contrast, ink: hex(ink.rgb), background: hex(background.rgb), samples: measured.samples };
}

/**
 * One text's contrast from the card's pixels: its painted ink over the sampled background
 * where the probe recorded the ink, else the percentiles (with why, as `fallback`), or null
 * when its box holds too few pixels. The DOM's own answer plays no part, so this also
 * measures the method against the texts the DOM did resolve (calibrate.ts).
 */
export function pixelContrast(text: ProbeText, sampler: CardSampler): PixelContrast | null {
  const ink = paintedInk(text);
  if ("rgb" in ink) return paintedInkContrast(text, ink, sampler);
  const measured = percentileContrast(text, sampler);
  return measured ? { ...measured, fallback: ink.none } : null;
}

/**
 * One text's contrast: the probe's DOM verdict where it resolved, else read from the card
 * image (when one is given; pixelContrast), else unmeasured with the reason.
 */
export function textContrast(row: RowPlatform, text: ProbeText, sampler: CardSampler | null): TextContrast {
  const base = { row, text: text.text, size: text.size, required: text.required };
  const none = CONTRAST_METHODS.none;
  if (text.disabled) return { ...base, method: text.contrast === null ? none : CONTRAST_METHODS.dom, contrast: text.contrast, verdict: "exempt", reason: "disabled: WCAG 1.4.3's inactive exception" };
  if (text.contrast !== null) {
    return { ...base, method: CONTRAST_METHODS.dom, contrast: text.contrast, verdict: text.contrastFails ? "fail" : "pass", ink: text.painted, background: text.background };
  }
  const why = text.indeterminate ?? "indeterminate";
  if (text.covered) return { ...base, method: none, contrast: null, verdict: "unmeasured", reason: `covered: something else paints over it (${why})` };
  if (text.scrolled) return { ...base, method: none, contrast: null, verdict: "unmeasured", reason: `scrolled: part of its box is out of its scroller's view, so the photograph does not show it (${why})` };
  if (!sampler) return { ...base, method: none, contrast: null, verdict: "unmeasured", reason: `${why}; no card image to sample` };
  const measured = pixelContrast(text, sampler);
  if (!measured) return { ...base, method: none, contrast: null, verdict: "unmeasured", reason: `${why}; its box holds too few pixels of the card to sample` };
  const { fallback, ...reading } = measured;
  return { ...base, ...reading, verdict: pixelVerdict(measured.contrast, text.required), reason: fallback ? `${why}; no painted ink colour: ${fallback}` : why };
}

// --- The web cell ------------------------------------------------------------------

/** probe.json as the web capture writes it (e2e/audit/cell.ts), the parts the analysis reads. */
export interface WebProbe {
  dpr: number;
  rows: { platform: RowPlatform; box: Box; aria?: string; texts: ProbeText[]; interactive: ProbeTarget[] }[];
  overflow: Record<string, number>;
  axe: { scanned: boolean; violations: { id: string; impact: string; help: string; nodes: number }[] };
  problems: unknown[];
  summary: ProbeSummary;
}

export const AXE_IMPACTS = ["critical", "serious", "moderate", "minor"] as const;

export interface Structure {
  /** The cells compared: this cell's look and surface peers at its width. */
  peers: number;
  /** Whether its web row's snapshot is the group's most common one; null when there is nothing to compare. */
  identical: boolean | null;
  /** The peer cells whose snapshot is the most common one. */
  agreesWith: string[];
  /** The first line where this cell's snapshot leaves the most common one. */
  firstDifference?: { line: number; expected: string; found: string };
}

/** The flags the analysis files a cell under, beside the capture's own (probe-math.ts flagsOf). */
export const ANALYSIS_FLAGS = {
  failed: "failed",
  notReached: "state-not-reached",
  contrastLikely: "contrast-likely",
  contrastReview: "contrast-review",
  structure: "structure-varies",
  unstable: "unstable",
  problems: "problems",
  a11yUnnamed: "a11y-unnamed",
  a11yError: "a11y-error",
  smallVisibleTarget: "small-visible-target",
} as const;

export interface TargetReport {
  floor: number;
  unit: string;
  note: string;
  small: { role: string; name: string; width: number; height: number }[];
}

export interface CellAnalysis {
  schema: 1;
  id: string;
  run: string;
  capturedAt: string;
  analyzedAt: string;
  platform: "web" | "ios" | "android";
  status: string;
  flags: string[];
  contrast: {
    dom: { checked: number; fails: number };
    /** Texts read from the card's pixels, by either pixel method; `percentiles` of them had no painted ink colour. */
    pixels: { sampled: number; failLikely: number; review: number; passed: number; percentiles: number };
    exempt: number;
    unmeasured: number;
    /** Every text that did not pass on the DOM, and every sampled one. */
    texts: TextContrast[];
  };
  fonts: { texts: number; min: number | null; minText: string | null; minRow: string | null; belowSourceFloor: number; underBodyFloor: number };
  targets: Partial<Record<RowPlatform, TargetReport>>;
  axe: { scanned: boolean; byImpact: Record<string, number>; rules: string[] };
  overflow: string[];
  clippedText: number;
  problems: number;
  structure?: Structure;
  a11y?: NativeA11y;
  stable?: boolean;
}

/** The lines of a multi-line text. */
const lines = (text: string) => text.replace(/\r\n/g, "\n").split("\n");

/** Where `found` first leaves `expected`, by line (1-based), or null when they are the same. */
export function firstDifference(expected: string, found: string): Structure["firstDifference"] | null {
  if (expected === found) return null;
  const a = lines(expected);
  const b = lines(found);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i] !== b[i]) return { line: i + 1, expected: a[i] ?? "(end)", found: b[i] ?? "(end)" };
  }
  return null;
}

/**
 * Structure invariance over one group (one variant at one width, its looks and surfaces):
 * the most common web-row snapshot is the group's; a tie goes to the snapshot the earliest
 * cell in `cells`' order has (the caller orders blush solid first). Cells with no snapshot
 * are left out and get null.
 */
export function structureOf(cells: { id: string; aria: string | null }[]): Map<string, Structure> {
  const result = new Map<string, Structure>();
  const known = cells.filter((cell): cell is { id: string; aria: string } => cell.aria !== null);
  const counts = new Map<string, number>();
  for (const cell of known) counts.set(cell.aria, (counts.get(cell.aria) ?? 0) + 1);
  let mode: string | null = null;
  for (const cell of known) {
    if (mode === null || counts.get(cell.aria)! > counts.get(mode)!) mode = cell.aria;
  }
  for (const cell of cells) {
    if (cell.aria === null || mode === null) {
      result.set(cell.id, { peers: known.length, identical: null, agreesWith: [] });
      continue;
    }
    const agreesWith = known.filter((peer) => peer.id !== cell.id && peer.aria === mode).map((peer) => peer.id);
    const difference = firstDifference(mode, cell.aria);
    result.set(cell.id, {
      peers: known.length,
      identical: known.length < 2 ? null : difference === null,
      agreesWith,
      ...(difference ? { firstDifference: difference } : {}),
    });
  }
  return result;
}

const emptyContrast = (): CellAnalysis["contrast"] => ({ dom: { checked: 0, fails: 0 }, pixels: { sampled: 0, failLikely: 0, review: 0, passed: 0, percentiles: 0 }, exempt: 0, unmeasured: 0, texts: [] });

/**
 * The analysis of one web cell from its probe and, where the DOM left a text indeterminate,
 * its card image. A cell its record says failed is filed under `failed` whatever it left on
 * disk: the probe a timed-out capture still wrote is read, but the cell is not a finished one.
 */
export function analyzeWebProbe(cell: Pick<CapturedCell, "id" | "status" | "flags"> & { run: string; capturedAt: string }, probe: WebProbe, sampler: CardSampler | null, structure: Structure | undefined, now: Date): CellAnalysis {
  const contrast = emptyContrast();
  const texts = probe.rows.flatMap((row) => row.texts.map((text) => ({ row: row.platform, text })));
  for (const { row, text } of texts) {
    const verdict = textContrast(row, text, sampler);
    if (verdict.verdict === "exempt") contrast.exempt += 1;
    else if (verdict.method === CONTRAST_METHODS.dom) {
      contrast.dom.checked += 1;
      if (verdict.verdict === "fail") contrast.dom.fails += 1;
    } else if (isPixelMethod(verdict.method)) {
      contrast.pixels.sampled += 1;
      if (verdict.method === CONTRAST_METHODS.percentiles) contrast.pixels.percentiles += 1;
      if (verdict.verdict === "fail-likely") contrast.pixels.failLikely += 1;
      else if (verdict.verdict === "review") contrast.pixels.review += 1;
      else contrast.pixels.passed += 1;
    } else contrast.unmeasured += 1;
    if (isPixelMethod(verdict.method) || verdict.verdict !== "pass") contrast.texts.push(verdict);
  }
  let min: { size: number; text: string; row: string } | null = null;
  for (const { row, text } of texts) if (!min || text.size < min.size) min = { size: text.size, text: text.text, row };
  const targets: CellAnalysis["targets"] = {};
  for (const row of probe.rows) {
    const floor = TARGET_FLOORS[row.platform];
    targets[row.platform] = {
      floor: floor.size,
      unit: floor.unit,
      note: floor.note,
      small: row.interactive.filter((item) => item.belowTarget).map((item) => ({ role: item.role, name: item.name, width: item.box.width, height: item.box.height })),
    };
  }
  const byImpact: Record<string, number> = Object.fromEntries(AXE_IMPACTS.map((impact) => [impact, 0]));
  for (const violation of probe.axe.violations) byImpact[violation.impact] = (byImpact[violation.impact] ?? 0) + 1;
  const flags = [...flagsOf(probe.summary)];
  if (cell.status === ANALYSIS_FLAGS.failed) flags.unshift(ANALYSIS_FLAGS.failed);
  if (contrast.pixels.failLikely) flags.push(ANALYSIS_FLAGS.contrastLikely);
  if (contrast.pixels.review) flags.push(ANALYSIS_FLAGS.contrastReview);
  if (structure?.identical === false) flags.push(ANALYSIS_FLAGS.structure);
  if (cell.flags.includes(ANALYSIS_FLAGS.notReached) || cell.status === ANALYSIS_FLAGS.notReached) flags.push(ANALYSIS_FLAGS.notReached);
  return {
    schema: 1,
    id: cell.id,
    run: cell.run,
    capturedAt: cell.capturedAt,
    analyzedAt: now.toISOString(),
    platform: "web",
    status: cell.status,
    flags: [...new Set(flags)],
    contrast,
    fonts: {
      texts: texts.length,
      min: min?.size ?? null,
      minText: min?.text ?? null,
      minRow: min?.row ?? null,
      belowSourceFloor: probe.summary.textBelowSourceFloor,
      underBodyFloor: probe.summary.textUnderBodyFloor,
    },
    targets,
    axe: { scanned: probe.axe.scanned, byImpact, rules: probe.axe.violations.map((v) => `${v.id} (${v.impact}, ${v.nodes} node${v.nodes === 1 ? "" : "s"})`) },
    overflow: probe.summary.overflowing,
    clippedText: probe.summary.clippedText,
    problems: probe.problems.length,
    ...(structure ? { structure } : {}),
  };
}

// --- The native cell ----------------------------------------------------------------

export interface NativeA11y {
  /** a11y.json read, or why there is none. */
  source: "uiautomator" | "maestro" | "not requested" | "not captured" | "error";
  error?: string;
  nodes: number;
  /** Nodes a user acts on; null on iOS, whose tree (XCUITest through Maestro) carries no traits. */
  interactive: number | null;
  unnamed: { role: string; value?: string; bounds: A11yNode["bounds"] }[];
  /** Android: nodes a user acts on whose view is under 48 dp (the view's bounds; a hitSlop is not in the tree). */
  smallTargets: { role: string; name: string; width: number; height: number }[];
}

const inside = (inner: A11yNode["bounds"], outer: A11yNode["bounds"], slack = 1) =>
  inner.x >= outer.x - slack && inner.y >= outer.y - slack && inner.x + inner.width <= outer.x + outer.width + slack && inner.y + inner.height <= outer.y + outer.height + slack;

/** Whether an Android node a user acts on is named: by itself, or by a named node inside it that TalkBack reads with it. */
function namedOnAndroid(nodes: A11yNode[], index: number): boolean {
  const node = nodes[index]!;
  if (node.name !== "") return true;
  for (let i = index + 1; i < nodes.length && nodes[i]!.depth > node.depth; i++) {
    if (nodes[i]!.name !== "" && inside(nodes[i]!.bounds, node.bounds)) return true;
  }
  return false;
}

/** The native accessibility verdict of one cell's a11y.json. */
export function analyzeA11y(platform: "ios" | "android", snapshot: A11ySnapshot): NativeA11y {
  const nodes = snapshot.nodes;
  if (platform === "android") {
    const acting = nodes.map((node, index) => ({ node, index })).filter(({ node }) => node.states.clickable || node.states.checkable);
    const floor = TARGET_FLOORS.android.size;
    return {
      source: snapshot.source,
      nodes: nodes.length,
      interactive: acting.length,
      unnamed: acting.filter(({ index }) => !namedOnAndroid(nodes, index)).map(({ node }) => ({ role: node.role, ...(node.value ? { value: node.value } : {}), bounds: node.bounds })),
      smallTargets: acting
        .filter(({ node }) => Math.min(node.bounds.width, node.bounds.height) < floor - 0.5)
        .map(({ node }) => ({ role: node.role, name: node.name, width: Math.round(node.bounds.width * 10) / 10, height: Math.round(node.bounds.height * 10) / 10 })),
    };
  }
  return {
    source: snapshot.source,
    nodes: nodes.length,
    interactive: null,
    unnamed: nodes.filter((node) => node.name === "").map((node) => ({ role: node.role, ...(node.value ? { value: node.value } : {}), bounds: node.bounds })),
    smallTargets: [],
  };
}

/** probe.json as the native host writes it (native/server.ts writeProbe), the parts the analysis reads. */
export interface NativeProbe {
  status: string;
  a11y: string | { error: string };
  problems: unknown[];
  segments: { stable: boolean }[];
}

/** The analysis of one native cell from its probe and accessibility dump. */
export function analyzeNativeCell(cell: Pick<CapturedCell, "id" | "status" | "platform"> & { run: string; capturedAt: string }, probe: NativeProbe, snapshot: A11ySnapshot | null, now: Date): CellAnalysis {
  const platform = cell.platform as "ios" | "android";
  let a11y: NativeA11y;
  if (snapshot) a11y = analyzeA11y(platform, snapshot);
  else if (typeof probe.a11y === "object") a11y = { source: "error", error: probe.a11y.error, nodes: 0, interactive: null, unnamed: [], smallTargets: [] };
  else a11y = { source: probe.a11y === "not requested" ? "not requested" : "not captured", nodes: 0, interactive: null, unnamed: [], smallTargets: [] };
  const stable = probe.segments.every((segment) => segment.stable);
  const flags: string[] = [];
  if (cell.status === "failed") flags.push(ANALYSIS_FLAGS.failed);
  if (!stable || cell.status === "unstable") flags.push(ANALYSIS_FLAGS.unstable);
  if (probe.problems.length) flags.push(ANALYSIS_FLAGS.problems);
  if (a11y.unnamed.length) flags.push(ANALYSIS_FLAGS.a11yUnnamed);
  if (a11y.source === "error") flags.push(ANALYSIS_FLAGS.a11yError);
  if (a11y.smallTargets.length) flags.push(ANALYSIS_FLAGS.smallVisibleTarget);
  const targets: CellAnalysis["targets"] = {};
  if (platform === "android" && snapshot) {
    targets.android = { floor: TARGET_FLOORS.android.size, unit: TARGET_FLOORS.android.unit, note: "the view's accessibility bounds; a hitSlop is not in the tree", small: a11y.smallTargets };
  }
  return {
    schema: 1,
    id: cell.id,
    run: cell.run,
    capturedAt: cell.capturedAt,
    analyzedAt: now.toISOString(),
    platform,
    status: cell.status,
    flags,
    contrast: emptyContrast(),
    fonts: { texts: 0, min: null, minText: null, minRow: null, belowSourceFloor: 0, underBodyFloor: 0 },
    targets,
    axe: { scanned: false, byImpact: Object.fromEntries(AXE_IMPACTS.map((impact) => [impact, 0])), rules: [] },
    overflow: [],
    clippedText: 0,
    problems: probe.problems.length,
    a11y,
    stable,
  };
}

// --- The command --------------------------------------------------------------------

/** Decode an image for sampling: flattened on white, three channels. */
export async function decodeImage(path: string): Promise<RawImage> {
  const { data, info } = await sharp(path).flatten({ background: "#ffffff" }).removeAlpha().toColourspace("srgb").raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height, channels: info.channels };
}

/** A cell's look and surface order within its group, blush solid first, for ties in the structure vote. */
const LOOK_ORDER = ["blush.solid", "blush.glass", "mint.solid", "mint.glass", "dark.solid", "dark.glass"];
const lookRank = (cell: CapturedCell) => LOOK_ORDER.indexOf(`${cell.look}.${cell.surface}`);

export interface AnalyzeTotals {
  cells: number;
  analyzed: number;
  skipped: number;
  sampled: number;
  /** Of the sampled texts, those with no painted ink colour, read by the percentiles. */
  percentiles: number;
  failLikely: number;
  review: number;
  domFails: number;
  flags: Record<string, number>;
}

async function analyzeGroup(group: CapturedCell[], now: Date, totals: AnalyzeTotals): Promise<void> {
  const probes = group.map((cell) => ({ cell, probe: existsSync(join(cell.dir, PROBE_FILE)) ? readJsonFile<WebProbe>(join(cell.dir, PROBE_FILE)) : null }));
  // A failed cell's tree is not its variant's (a redirect, a wrong example, a page cut off mid-probe): it takes no part in the vote.
  const structures = structureOf(
    [...probes]
      .sort((a, b) => lookRank(a.cell) - lookRank(b.cell))
      .map(({ cell, probe }) => ({ id: cell.id, aria: cell.status === ANALYSIS_FLAGS.failed ? null : probe?.rows.find((row) => row.platform === "web")?.aria ?? null })),
  );
  for (const { cell, probe } of probes) {
    if (!probe || notReached(cell)) {
      totals.skipped += 1;
      continue;
    }
    const cardPath = join(cell.dir, CARD_FILE);
    const needsPixels = probe.rows.some((row) => row.texts.some((text) => text.contrast === null && !text.disabled && !text.covered && !text.scrolled));
    const image = needsPixels && existsSync(cardPath) ? await decodeImage(cardPath) : null;
    const analysis = analyzeWebProbe({ id: cell.id, status: cell.status, flags: cell.flags, run: cell.run.id, capturedAt: cell.capturedAt }, probe, image ? cardSampler(image, probe.dpr) : null, structures.get(cell.id), now);
    writeFileSync(join(cell.dir, ANALYSIS_FILE), `${JSON.stringify(analysis, null, 2)}\n`);
    count(totals, analysis);
  }
}

function count(totals: AnalyzeTotals, analysis: CellAnalysis) {
  totals.analyzed += 1;
  totals.sampled += analysis.contrast.pixels.sampled;
  totals.percentiles += analysis.contrast.pixels.percentiles;
  totals.failLikely += analysis.contrast.pixels.failLikely;
  totals.review += analysis.contrast.pixels.review;
  totals.domFails += analysis.contrast.dom.fails;
  for (const flag of analysis.flags) totals.flags[flag] = (totals.flags[flag] ?? 0) + 1;
}

async function analyzeNative(cell: CapturedCell, now: Date, totals: AnalyzeTotals): Promise<void> {
  const probe = readJsonFile<NativeProbe>(join(cell.dir, PROBE_FILE));
  if (!probe) {
    totals.skipped += 1;
    return;
  }
  const snapshot = readJsonFile<A11ySnapshot>(join(cell.dir, "a11y.json"));
  const analysis = analyzeNativeCell({ id: cell.id, status: cell.status, platform: cell.platform, run: cell.run.id, capturedAt: cell.capturedAt }, probe, snapshot, now);
  writeFileSync(join(cell.dir, ANALYSIS_FILE), `${JSON.stringify(analysis, null, 2)}\n`);
  count(totals, analysis);
}

const USAGE = "usage: bun run audit:analyze -- [--only=<slugs>] [--run=<run ids>]";

async function main(): Promise<number> {
  const args = parseToolArgs(process.argv.slice(2));
  if (args.help) {
    console.log(USAGE);
    return 0;
  }
  if (args.errors.length) {
    console.error(`audit:analyze: ${args.errors.join("; ")}\n${USAGE}`);
    return 2;
  }
  const started = Date.now();
  let selection: ReturnType<typeof currentCells>;
  try {
    selection = currentCells(ROOT, args);
  } catch (error) {
    console.error(`audit:analyze: ${(error as Error).message}`);
    return 2;
  }
  for (const problem of selection.problems) console.warn(`  warning  ${problem}`);
  const now = new Date();
  const totals: AnalyzeTotals = { cells: selection.cells.length, analyzed: 0, skipped: 0, sampled: 0, percentiles: 0, failLikely: 0, review: 0, domFails: 0, flags: {} };
  const groups = new Map<string, CapturedCell[]>();
  const native: CapturedCell[] = [];
  for (const cell of selection.cells) {
    if (cell.platform !== "web") {
      native.push(cell);
      continue;
    }
    const key = groupKey(cell);
    const group = groups.get(key);
    if (group) group.push(cell);
    else groups.set(key, [cell]);
  }
  await pool([...groups.values()], 6, (group) => analyzeGroup(group, now, totals));
  await pool(native, 8, (cell) => analyzeNative(cell, now, totals));
  const ms = Date.now() - started;
  console.log(`audit:analyze over ${selection.runs.length} run(s): ${totals.analyzed} of ${totals.cells} current cell(s) analyzed${totals.skipped ? `, ${totals.skipped} with no probe (failed or not reached)` : ""}`);
  console.log(`  contrast  ${totals.domFails} DOM fail(s); ${totals.sampled} text(s) read against the card's pixels (${totals.sampled - totals.percentiles} ${CONTRAST_METHODS.paintedInk}, ${totals.percentiles} ${CONTRAST_METHODS.percentiles}): ${totals.failLikely} fail-likely, ${totals.review} to review`);
  const flags = Object.entries(totals.flags).sort((a, b) => b[1] - a[1]);
  console.log(`  flags     ${flags.length ? flags.map(([flag, n]) => `${flag} ${n}`).join(", ") : "none"}`);
  console.log(`  time      ${(ms / 1000).toFixed(1)} s (${totals.analyzed ? (ms / totals.analyzed).toFixed(1) : "0"} ms a cell)`);
  console.log(`  output    ${ANALYSIS_FILE} beside each cell's probe under ${relative(ROOT, join(ROOT, ".audit", "runs"))}`);
  return 0;
}

if (import.meta.main) process.exit(await main());
