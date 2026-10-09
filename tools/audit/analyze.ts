#!/usr/bin/env bun
// `bun run audit:analyze`: the component audit's analysis step (plan 1e). For the newest
// capture of every cell across the runs under .audit/runs (runs.ts), it reads what the
// capture recorded and writes `analysis.json` beside the cell's probe.json. Every web cell
// is read the same way, whichever capture wrote it: its regions (a variant card's platform
// rows, photographed in card.png; an interaction state's row and the panel it opened,
// photographed in state.png; a page's sections, each photographed in its own
// section.<key>.png), each placed in its photograph by where its boxes are measured from
// (`origin`) and the shot's clip, and judged by its platform's floors:
//
// - contrast: from the probe's DOM-composited background where it resolved (probe-math.ts,
//   method "dom": fails under the 4.5 or 3 the text owes). Where the DOM could not say what
//   is under a text (a backdrop filter, a gradient, an image), only the background is read
//   from the photograph, method "painted-ink+pixel-background": the ink is the text's colour
//   as the probe recorded it (its own alpha and its opacity groups, composited over that
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
//   exception), and a text something else paints over, or one its photograph does not show,
//   is not sampled.
// - type: the smallest painted size (the probe's computed size times its glyph scale), and
//   the counts under the 10 px source floor and the 12 px body floor.
// - targets: per platform, the interactive boxes under its floor (44 pt iOS, 48 dp Android,
//   24 px web; probe-math.ts TARGET_FLOORS), each with the region it is in; on a device, the
//   Android accessibility nodes a user acts on under 48 dp.
// - structure: a cell's tree must be identical across the looks and surfaces of its group
//   at one width: a variant's web row, a state's row and the panel it opened, a page's
//   sections in order. The cells that differ from the group's most common tree are flagged
//   with the first line that differs.
// - interaction states: the state's own flags (e2e/support/state-recipes.ts STATE_FLAGS:
//   a focus ring missing, hidden or off-colour, an overlay not announced as expanded, ...)
//   and what its release found (RELEASE_FLAGS: a press not cancelled, an overlay not
//   closed, ...); a state its recipe could not reach is filed under `state-not-reached`
//   with the reason and its release's flags, and nothing else.
// - native accessibility: every node a user acts on has a name a screen reader announces
//   (Android: clickable or checkable nodes, named themselves or by a named node inside
//   them, as TalkBack reads them; iOS: XCUITest through Maestro reports no traits, so a node
//   announced only by its value is the one with no name).
// - the cell's flags: the capture's own and the analysis' (ANALYSIS_FLAGS). A cell its record
//   says failed is filed under `failed` whatever files it left, and its tree takes no part
//   in its group's structure vote.
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
import { RELEASE_FLAGS, STATE_FLAGS } from "../../e2e/support/state-recipes.ts";
import type { A11yNode, A11ySnapshot } from "./native/a11y.ts";
import { TARGET_FLOORS, flagsOf, over, parseCssColor, type Box, type ProbeSummary, type ProbeTarget, type ProbeText, type RowPlatform } from "./probe-math.ts";
import {
  ANALYSIS_FILE,
  STATE_NOT_REACHED,
  currentCells,
  groupKey,
  notReached,
  parseToolArgs,
  pool,
  readJsonFile,
  type CapturedCell,
  type CellFamily,
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
  /** The colour's own alpha times the text's fill or placeholder opacity times the opacity groups its backdrop is not in. */
  alpha: number;
  /**
   * The opacity groups the text is inside with its backdrop, when they dim: their opacity,
   * and the colour behind them (read from the photograph around the outermost group's box).
   * They mix the ink and the backdrop alike with that colour.
   */
  shared?: { opacity: number; behind: RGB };
}

/**
 * The ink a text paints with, from what the probe recorded, or why there is none to take.
 * HTML text paints with its colour alone; an SVG text's fill-opacity and a placeholder's own
 * opacity are `colorAlpha`, which probes written before it was recorded do not carry. Of the
 * opacity groups it paints inside, only those its backdrop is not in dim it against the
 * background the photograph shows (`ownOpacity`); a probe written before that was recorded
 * gives every group's.
 */
export function paintedInk(text: Pick<ProbeText, "color" | "colorAlpha" | "opacity" | "ownOpacity" | "svg" | "field">): PaintedInk | { none: string } {
  const color = parseCssColor(text.color);
  if (!color) return { none: `its colour ${text.color} cannot be read` };
  const own = text.colorAlpha ?? (text.svg || text.field?.part === "placeholder" ? null : 1);
  if (own === null) return { none: `the probe predates the ${text.svg ? "SVG fill-opacity" : "placeholder opacity"} it paints with` };
  const alpha = color[3] * own * (text.ownOpacity ?? text.opacity);
  if (!(alpha > 0)) return { none: "its colour is transparent, so something other than its colour paints its glyphs" };
  return { rgb: [color[0], color[1], color[2]], alpha: Math.min(1, alpha) };
}

/**
 * `ink` as a photograph shows it where `background` shows around it. Inside the groups it
 * shares with its backdrop the ink paints over the backdrop, and the groups then mix both
 * with what lies behind them (O) at their opacity s, so with the ink's own alpha a over the
 * photographed background B the pixel is a*s*ink + (1 - a)*B + a*(1 - s)*O; with no shared
 * group that is the ink over B at its alpha.
 */
export function inkOver(ink: PaintedInk, background: RGB): RGB {
  if (!ink.shared) return ink.alpha >= 1 ? ink.rgb : over([ink.rgb[0], ink.rgb[1], ink.rgb[2], ink.alpha], background);
  const { opacity: s, behind } = ink.shared;
  const a = ink.alpha;
  return [0, 1, 2].map((c) => a * s * ink.rgb[c]! + (1 - a) * background[c]! + a * (1 - s) * behind[c]!) as RGB;
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
  return dominant(pixels, (i) => distance[i]! >= threshold);
}

/**
 * The dominant colour of the `pixels` (RGB triples) `taken` admits: binned 16 levels a
 * channel, the mean of every taken pixel within one bin's width of the fullest bin's mean.
 */
function dominant(pixels: Uint8Array, taken: (i: number) => boolean): { rgb: RGB; count: number } {
  const n = pixels.length / 3;
  const bins = new Uint32Array(BINS_PER_CHANNEL ** 3);
  const binOf = (i: number) => ((pixels[i * 3]! >> BIN_SHIFT) * BINS_PER_CHANNEL + (pixels[i * 3 + 1]! >> BIN_SHIFT)) * BINS_PER_CHANNEL + (pixels[i * 3 + 2]! >> BIN_SHIFT);
  for (let i = 0; i < n; i++) if (taken(i)) bins[binOf(i)]! += 1;
  let peak = 0;
  for (let bin = 1; bin < bins.length; bin++) if (bins[bin]! > bins[peak]!) peak = bin;
  const mean = (keep: (i: number) => boolean): { rgb: RGB; count: number } => {
    const sum = [0, 0, 0];
    let count = 0;
    for (let i = 0; i < n; i++) {
      if (!taken(i) || !keep(i)) continue;
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
  if (ink.alpha < 1 || ink.shared) found = dominantFar(pixels, inkOver(ink, found.rgb));
  return { rgb: found.rgb, samples: n, share: found.count / n, region: box };
}

/** How wide a ring around an opacity group's box is read for the colour behind the group, CSS px. */
export const BEHIND_RING = 3;

/**
 * The colour just outside `region` of `image` (a ring `ring` device pixels wide, as much of
 * it as the image holds): what lies behind an opacity group whose element is that region.
 * The dominant colour, so a neighbour's edge in the ring does not set it. Null when the image
 * shows fewer than MIN_SAMPLES pixels of the ring.
 */
export function sampleAround(image: RawImage, region: PixelRegion, ring: number): { rgb: RGB; samples: number } | null {
  const outer = clampRegion(image, { left: region.left - ring, top: region.top - ring, width: region.width + 2 * ring, height: region.height + 2 * ring });
  const inside = (x: number, y: number) => x >= region.left && x < region.left + region.width && y >= region.top && y < region.top + region.height;
  const values: number[] = [];
  for (let y = outer.top; y < outer.top + outer.height; y++) {
    for (let x = outer.left; x < outer.left + outer.width; x++) {
      if (inside(x, y)) continue;
      const offset = (y * image.width + x) * image.channels;
      values.push(image.data[offset]!, image.data[offset + 1]!, image.data[offset + 2]!);
    }
  }
  const n = values.length / 3;
  if (n < MIN_SAMPLES) return null;
  return { rgb: dominant(Uint8Array.from(values), () => true).rgb, samples: n };
}

/**
 * Where the analysis reads a photograph's pixels for the texts the DOM could not resolve.
 * The boxes it is given are the probe's, measured from the region's origin; the sampler
 * places them in its photograph.
 */
export interface CardSampler {
  /** Whether any of a text's box lies in the photograph. */
  shows(box: Box): boolean;
  /** The colour behind an opacity group whose element has `box`: the photograph just around it. */
  around(box: Box): { rgb: RGB; samples: number } | null;
  /** The background behind a text's box (its ink's bounds), given the ink it paints with. */
  background(box: Box, ink: PaintedInk): BackgroundSample | null;
  /** The 10th and 90th luminance percentiles at a text's ink, for a text with no painted ink. */
  percentiles(box: Box): PixelSample | null;
}

/**
 * A sampler over a decoded photograph taken at `dpr` device pixels per CSS px, in which the
 * origin the probe measured the boxes from sits at `offset` (CSS px): (0, 0) for card.png,
 * which is the card itself; the region's origin less the shot's clip for a state or a page
 * section, whose photograph is a clip of the viewport or the viewport itself.
 */
export function cardSampler(image: RawImage, dpr: number, offset: { x: number; y: number } = { x: 0, y: 0 }): CardSampler {
  const placed = (box: Box): Box => ({ ...box, x: box.x + offset.x, y: box.y + offset.y });
  return {
    shows: (box) => boxToRegion(placed(box), dpr, image) !== null,
    around(box) {
      const at = placed(box);
      // The box as device pixels, unclamped: the ring is clamped to the image, the box is not.
      const left = Math.floor(at.x * dpr);
      const top = Math.floor(at.y * dpr);
      const region = { left, top, width: Math.ceil((at.x + at.width) * dpr) - left, height: Math.ceil((at.y + at.height) * dpr) - top };
      return sampleAround(image, region, Math.round(BEHIND_RING * dpr));
    },
    background(box, ink) {
      const region = boxToRegion(placed(box), dpr, image);
      return region ? sampleBackground(image, inkRegion(image, region), ink) : null;
    },
    percentiles: (box) => sampleText(image, placed(box), dpr),
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
  /** The floors it is held to: its row's platform (a page's sections are the web's). */
  row: RowPlatform;
  /** The region of the cell it is in: a row (`web`, `ios`, `android`), `panel`, or `section:<key>`. */
  region: string;
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
  /** painted-ink+pixel-background, for a text inside opacity groups with its backdrop: the colour behind the groups. */
  behind?: string;
  /** Why it was not measured, why the DOM could not resolve it, and why the percentiles were used. */
  reason?: string;
}

/** A contrast read from the card's pixels, by the method the text's recorded ink allows. */
export type PixelContrast = Required<Pick<TextContrast, "method" | "ink" | "background" | "samples">> & Pick<TextContrast, "backgroundShare" | "behind"> & { contrast: number; fallback?: string; note?: string };

/**
 * A text's painted ink over the background its box shows, or null when its box holds too
 * few pixels. A text inside opacity groups with its backdrop (`shared`) is painted with the
 * colour behind them, read around the outermost group's box; where the photograph shows too
 * little of that, the ink is dimmed over the background instead, as if the groups held the
 * text alone, and `note` says so.
 */
export function paintedInkContrast(text: Pick<ProbeText, "box" | "shared">, ink: PaintedInk, sampler: CardSampler): PixelContrast | null {
  let painting = ink;
  let note: string | undefined;
  if (text.shared && text.shared.opacity < 1) {
    const behind = sampler.around(text.shared.box);
    if (behind) painting = { ...ink, shared: { opacity: text.shared.opacity, behind: behind.rgb } };
    else {
      painting = { rgb: ink.rgb, alpha: ink.alpha * text.shared.opacity };
      note = "the photograph shows too little around its opacity group to read what is behind it, so the group is taken to dim the ink alone";
    }
  }
  const background = sampler.background(text.box, painting);
  if (!background) return null;
  const painted = inkOver(painting, background.rgb);
  return {
    method: CONTRAST_METHODS.paintedInk,
    contrast: Math.round(contrastOfLuminance(relativeLuminance(painted), relativeLuminance(background.rgb)) * 100) / 100,
    ink: hex(painted),
    background: hex(background.rgb),
    samples: background.samples,
    backgroundShare: Math.round(background.share * 100) / 100,
    ...(painting.shared ? { behind: hex(painting.shared.behind) } : {}),
    ...(note ? { note } : {}),
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
 * One text's contrast: the probe's DOM verdict where it resolved, else read from the
 * region's photograph (pixelContrast), else unmeasured with the reason: `photo` is the
 * photograph's sampler, or why the region has none.
 */
export function textContrast(row: RowPlatform, text: ProbeText, photo: CardSampler | { none: string }, region: string = row): TextContrast {
  const base = { row, region, text: text.text, size: text.size, required: text.required };
  const none = CONTRAST_METHODS.none;
  if (text.disabled) return { ...base, method: text.contrast === null ? none : CONTRAST_METHODS.dom, contrast: text.contrast, verdict: "exempt", reason: "disabled: WCAG 1.4.3's inactive exception" };
  if (text.contrast !== null) {
    return { ...base, method: CONTRAST_METHODS.dom, contrast: text.contrast, verdict: text.contrastFails ? "fail" : "pass", ink: text.painted, background: text.background };
  }
  const why = text.indeterminate ?? "indeterminate";
  if (text.covered) return { ...base, method: none, contrast: null, verdict: "unmeasured", reason: `covered: something else paints over it (${why})` };
  if (text.scrolled) return { ...base, method: none, contrast: null, verdict: "unmeasured", reason: `scrolled: part of its box is out of its scroller's view, so the photograph does not show it (${why})` };
  if ("none" in photo) return { ...base, method: none, contrast: null, verdict: "unmeasured", reason: `${why}; ${photo.none}` };
  if (!photo.shows(text.box)) return { ...base, method: none, contrast: null, verdict: "unmeasured", reason: `${why}; its box lies outside the photograph` };
  const measured = pixelContrast(text, photo);
  if (!measured) return { ...base, method: none, contrast: null, verdict: "unmeasured", reason: `${why}; its box holds too few pixels of the photograph to sample` };
  const { fallback, note, ...reading } = measured;
  const reason = [why, fallback ? `no painted ink colour: ${fallback}` : null, note ?? null].filter(Boolean).join("; ");
  return { ...base, ...reading, verdict: pixelVerdict(measured.contrast, text.required), reason };
}

// --- Reading a web cell's probe -----------------------------------------------------------

/** One region a web capture probed (probe-math.ts ProbeRow as the captures write it), the parts the analysis reads. */
export interface WrittenRegion {
  platform: RowPlatform;
  /** Where its boxes are measured from, in the viewport; probes written before it was recorded have none. */
  origin?: { x: number; y: number };
  box: Box;
  aria?: string;
  texts: ProbeText[];
  interactive: ProbeTarget[];
}

type Axe = { scanned: boolean; violations: { id: string; impact: string; help: string; nodes: number }[] };

/** probe.json as the variant capture writes it (e2e/audit/cell.ts). */
export interface VariantProbe {
  dpr: number;
  rows: WrittenRegion[];
  overflow: Record<string, number>;
  axe: Axe;
  problems: unknown[];
  summary: ProbeSummary;
}

/** probe.json as the interaction-state capture writes it (e2e/audit/state-cell.ts). */
export interface StateProbe {
  status: "ok" | "state-not-reached";
  dpr: number;
  recipe: { state: string; variant: string; how: string; frame: "row" | "viewport" };
  /** Why the state was not reached. */
  reason?: string;
  /** What verify read off the page. */
  evidence?: Record<string, unknown>;
  /** A reached state's photograph and the part of the viewport it shows (null: all of it). */
  shot?: { file: string; frame: "row" | "viewport"; clip: Box | null };
  row?: WrittenRegion;
  /** The panel the state opened: read with the row when the row draws it (`inRow`; probes written before that have no `inRow`). */
  panel?: (Partial<WrittenRegion> & { inRow?: boolean }) | null;
  overflow?: Record<string, number>;
  axe?: Axe;
  problems: unknown[];
  summary?: ProbeSummary;
  /** The probe's flags with the state's own (STATE_FLAGS) and its release's (RELEASE_FLAGS). */
  flags: string[];
  release?: Record<string, unknown>;
}

/** probe.json as the page capture writes it (e2e/audit/page-cell.ts). */
export interface PageProbe {
  dpr: number;
  viewport: { size: { width: number; height: number }; file: string };
  sections: (WrittenRegion & { key: string; title: string; file: string; clip?: Box })[];
  overflow: Record<string, number>;
  axe: Axe;
  problems: unknown[];
  summary: ProbeSummary;
}

/** Where a region's texts are photographed: the file in the cell's directory, and where the region's origin sits in it (CSS px). */
export interface RegionPhoto {
  file: string;
  offset: { x: number; y: number };
}

/** One region of a cell the analysis judges: a card's platform row, a state's row or the panel it opened, a page's section. */
export interface ProbedRegion {
  /** The region's name: the row's platform (`web`), `panel`, or `section:<key>`. */
  key: string;
  /** The floors its texts and targets are held to. */
  platform: RowPlatform;
  texts: ProbeText[];
  interactive: ProbeTarget[];
  /** Its photograph, or why it has none. */
  photo: RegionPhoto | { none: string };
}

/** A web cell's probe, read the same way whatever kind of cell wrote it. */
export interface CellProbe {
  dpr: number;
  regions: ProbedRegion[];
  /**
   * The tree held identical across the looks and surfaces of the cell's group: a variant's
   * web row, a state's row and the panel it opened, a page's sections in order; null where
   * the probe has none.
   */
  tree: string | null;
  summary: ProbeSummary;
  axe: Axe;
  problems: unknown[];
  /** The capture's flags beyond the probe's: a state's own and its release's. */
  own: string[];
}

const PREDATES_ORIGIN = "the probe predates the region origins that place its texts in the photograph (re-capture the cell)";

/** Where a region's origin sits in a photograph of the viewport, or of `clip` of it. */
function photoOf(file: string, origin: { x: number; y: number } | undefined, clip: Box | null | undefined): RegionPhoto | { none: string } {
  if (!origin) return { none: PREDATES_ORIGIN };
  return { file, offset: { x: origin.x - (clip?.x ?? 0), y: origin.y - (clip?.y ?? 0) } };
}

/** A variant cell's probe: its rows, photographed in card.png, which is the card the boxes are measured from. */
export function readVariantProbe(probe: VariantProbe): CellProbe {
  return {
    dpr: probe.dpr,
    regions: probe.rows.map((row) => ({ key: row.platform, platform: row.platform, texts: row.texts, interactive: row.interactive, photo: { file: CARD_FILE, offset: { x: 0, y: 0 } } })),
    tree: probe.rows.find((row) => row.platform === "web")?.aria ?? null,
    summary: probe.summary,
    axe: probe.axe,
    problems: probe.problems,
    own: [],
  };
}

/** A reached state's probe: its row and the panel it opened (when not drawn in the row), photographed in state.png. Null for a state not reached. */
export function readStateProbe(probe: StateProbe): CellProbe | null {
  if (probe.status !== "ok" || !probe.row || !probe.shot || !probe.summary || !probe.axe) return null;
  const { file, clip } = probe.shot;
  const regions: ProbedRegion[] = [{ key: probe.row.platform, platform: probe.row.platform, texts: probe.row.texts, interactive: probe.row.interactive, photo: photoOf(file, probe.row.origin, clip) }];
  const panel = probe.panel;
  if (panel && !panel.inRow && panel.texts && panel.interactive) {
    regions.push({ key: "panel", platform: panel.platform ?? probe.row.platform, texts: panel.texts, interactive: panel.interactive, photo: photoOf(file, panel.origin, clip) });
  }
  const trees = [probe.row.aria, panel?.aria].filter((tree): tree is string => typeof tree === "string");
  return {
    dpr: probe.dpr,
    regions,
    tree: trees.length ? trees.join("\n") : null,
    summary: probe.summary,
    axe: probe.axe,
    problems: probe.problems,
    own: probe.flags,
  };
}

/** A page cell's probe: its sections, each photographed in its own section.<key>.png. */
export function readPageProbe(probe: PageProbe): CellProbe {
  return {
    dpr: probe.dpr,
    regions: probe.sections.map((section) => ({
      key: `section:${section.key}`,
      platform: section.platform ?? "web",
      texts: section.texts,
      interactive: section.interactive,
      photo: photoOf(section.file, section.origin, section.clip),
    })),
    tree: probe.sections.map((section) => `[section ${section.key}]\n${section.aria ?? ""}`).join("\n"),
    summary: probe.summary,
    axe: probe.axe,
    problems: probe.problems,
    own: [],
  };
}

// --- A web cell's analysis -------------------------------------------------------------

export const AXE_IMPACTS = ["critical", "serious", "moderate", "minor"] as const;

export interface Structure {
  /** The cells compared: this cell's look and surface peers at its width. */
  peers: number;
  /** Whether its tree is the group's most common one; null when there is nothing to compare. */
  identical: boolean | null;
  /** The peer cells whose tree is the most common one. */
  agreesWith: string[];
  /** The first line where this cell's tree leaves the most common one. */
  firstDifference?: { line: number; expected: string; found: string };
}

/** The flags the analysis files a cell under, beside the capture's own (probe-math.ts flagsOf, and a state's STATE_FLAGS and RELEASE_FLAGS). */
export const ANALYSIS_FLAGS = {
  failed: "failed",
  notReached: STATE_NOT_REACHED,
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
  small: { region: string; role: string; name: string; width: number; height: number }[];
}

/** One region's share of a cell's analysis, for a reader looking for where a finding is. */
export interface RegionAnalysis {
  texts: number;
  minFont: number | null;
  contrast: { domFails: number; failLikely: number; review: number };
  smallTargets: number;
}

/** What an interaction-state cell was, and what its capture found beyond the probe. */
export interface StateAnalysis {
  state: string;
  row: RowPlatform | null;
  /** The example the recipe applies the state to, and its label. */
  variant: string | null;
  label: string | null;
  reached: boolean;
  /** Why it was not reached. */
  reason?: string;
  /** The defects the state shows (STATE_FLAGS) and those its release found (RELEASE_FLAGS). */
  stateFlags: string[];
  releaseFlags: string[];
}

export interface CellAnalysis {
  schema: 1;
  id: string;
  run: string;
  capturedAt: string;
  analyzedAt: string;
  platform: "web" | "ios" | "android";
  family: CellFamily;
  status: string;
  flags: string[];
  contrast: {
    dom: { checked: number; fails: number };
    /** Texts read from the photographs, by either pixel method; `percentiles` of them had no painted ink colour. */
    pixels: { sampled: number; failLikely: number; review: number; passed: number; percentiles: number };
    exempt: number;
    unmeasured: number;
    /** Every text that did not pass on the DOM, and every sampled one. */
    texts: TextContrast[];
  };
  fonts: { texts: number; min: number | null; minText: string | null; minRegion: string | null; belowSourceFloor: number; underBodyFloor: number };
  targets: Partial<Record<RowPlatform, TargetReport>>;
  axe: { scanned: boolean; byImpact: Record<string, number>; rules: string[] };
  overflow: string[];
  clippedText: number;
  problems: number;
  /** Per region (a row, a panel, a page's section): where the findings are. */
  regions?: Record<string, RegionAnalysis>;
  structure?: Structure;
  state?: StateAnalysis;
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
 * Structure invariance over one group (one variant, state or page at one width, its looks
 * and surfaces): the most common tree is the group's; a tie goes to the tree the earliest
 * cell in `cells`' order has (the caller orders blush solid first). Cells with no tree are
 * left out and get null.
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
const emptyFonts = (): CellAnalysis["fonts"] => ({ texts: 0, min: null, minText: null, minRegion: null, belowSourceFloor: 0, underBodyFloor: 0 });
const noAxe = (): CellAnalysis["axe"] => ({ scanned: false, byImpact: Object.fromEntries(AXE_IMPACTS.map((impact) => [impact, 0])), rules: [] });

/** What the analysis is told about the capture it judges. */
export type AnalyzedCell = Pick<CapturedCell, "id" | "status" | "family" | "state" | "row" | "variant" | "label"> & { run: string; capturedAt: string };

/** A state cell's flags split into the state's own and its release's. */
function stateOf(cell: AnalyzedCell, own: string[], reason?: string): StateAnalysis {
  return {
    state: cell.state ?? "unknown",
    row: cell.row,
    variant: cell.variant,
    label: cell.label,
    reached: cell.status !== STATE_NOT_REACHED,
    ...(reason ? { reason } : {}),
    stateFlags: own.filter((flag) => flag in STATE_FLAGS),
    releaseFlags: own.filter((flag) => flag in RELEASE_FLAGS),
  };
}

/**
 * The analysis of one web cell (a variant, a reached state, a page) from its probe and,
 * where the DOM left a text indeterminate, the photograph its region was taken in
 * (`samplerFor` gives the photograph's sampler, or null when it could not be read). A cell
 * its record says failed is filed under `failed` whatever it left on disk: the probe a
 * timed-out capture still wrote is read, but the cell is not a finished one.
 */
export function analyzeWebCell(cell: AnalyzedCell, probe: CellProbe, samplerFor: (photo: RegionPhoto) => CardSampler | null, structure: Structure | undefined, now: Date): CellAnalysis {
  const contrast = emptyContrast();
  const regions: Record<string, RegionAnalysis> = {};
  let min: { size: number; text: string; region: string } | null = null;
  const targets: CellAnalysis["targets"] = {};
  for (const region of probe.regions) {
    const sampler = "none" in region.photo ? region.photo : samplerFor(region.photo) ?? { none: `its photograph ${region.photo.file} could not be read` };
    const tally: RegionAnalysis = { texts: region.texts.length, minFont: null, contrast: { domFails: 0, failLikely: 0, review: 0 }, smallTargets: 0 };
    for (const text of region.texts) {
      const verdict = textContrast(region.platform, text, sampler, region.key);
      if (verdict.verdict === "exempt") contrast.exempt += 1;
      else if (verdict.method === CONTRAST_METHODS.dom) {
        contrast.dom.checked += 1;
        if (verdict.verdict === "fail") {
          contrast.dom.fails += 1;
          tally.contrast.domFails += 1;
        }
      } else if (isPixelMethod(verdict.method)) {
        contrast.pixels.sampled += 1;
        if (verdict.method === CONTRAST_METHODS.percentiles) contrast.pixels.percentiles += 1;
        if (verdict.verdict === "fail-likely") {
          contrast.pixels.failLikely += 1;
          tally.contrast.failLikely += 1;
        } else if (verdict.verdict === "review") {
          contrast.pixels.review += 1;
          tally.contrast.review += 1;
        } else contrast.pixels.passed += 1;
      } else contrast.unmeasured += 1;
      if (isPixelMethod(verdict.method) || verdict.verdict !== "pass") contrast.texts.push(verdict);
      if (tally.minFont === null || text.size < tally.minFont) tally.minFont = text.size;
      if (!min || text.size < min.size) min = { size: text.size, text: text.text, region: region.key };
    }
    const floor = TARGET_FLOORS[region.platform];
    const report = (targets[region.platform] ??= { floor: floor.size, unit: floor.unit, note: floor.note, small: [] });
    for (const item of region.interactive) {
      if (!item.belowTarget) continue;
      report.small.push({ region: region.key, role: item.role, name: item.name, width: item.box.width, height: item.box.height });
      tally.smallTargets += 1;
    }
    regions[region.key] = tally;
  }
  const byImpact: Record<string, number> = Object.fromEntries(AXE_IMPACTS.map((impact) => [impact, 0]));
  for (const violation of probe.axe.violations) byImpact[violation.impact] = (byImpact[violation.impact] ?? 0) + 1;
  const flags = [...flagsOf(probe.summary), ...probe.own];
  if (cell.status === ANALYSIS_FLAGS.failed) flags.unshift(ANALYSIS_FLAGS.failed);
  if (contrast.pixels.failLikely) flags.push(ANALYSIS_FLAGS.contrastLikely);
  if (contrast.pixels.review) flags.push(ANALYSIS_FLAGS.contrastReview);
  if (structure?.identical === false) flags.push(ANALYSIS_FLAGS.structure);
  return {
    schema: 1,
    id: cell.id,
    run: cell.run,
    capturedAt: cell.capturedAt,
    analyzedAt: now.toISOString(),
    platform: "web",
    family: cell.family,
    status: cell.status,
    flags: [...new Set(flags)],
    contrast,
    fonts: {
      texts: probe.regions.reduce((n, region) => n + region.texts.length, 0),
      min: min?.size ?? null,
      minText: min?.text ?? null,
      minRegion: min?.region ?? null,
      belowSourceFloor: probe.summary.textBelowSourceFloor,
      underBodyFloor: probe.summary.textUnderBodyFloor,
    },
    targets,
    axe: { scanned: probe.axe.scanned, byImpact, rules: probe.axe.violations.map((v) => `${v.id} (${v.impact}, ${v.nodes} node${v.nodes === 1 ? "" : "s"})`) },
    overflow: probe.summary.overflowing,
    clippedText: probe.summary.clippedText,
    problems: probe.problems.length,
    regions,
    ...(structure ? { structure } : {}),
    ...(cell.family === "state" ? { state: stateOf(cell, probe.own) } : {}),
  };
}

/**
 * The analysis of a state its recipe could not reach: nothing was photographed or probed,
 * so it is filed under `state-not-reached` and whatever its release found (a press with no
 * look of its own can still fire when it should have been cancelled).
 */
export function analyzeUnreachedState(cell: AnalyzedCell, probe: Pick<StateProbe, "reason" | "flags" | "problems">, now: Date): CellAnalysis {
  const state = stateOf(cell, probe.flags, probe.reason);
  return {
    schema: 1,
    id: cell.id,
    run: cell.run,
    capturedAt: cell.capturedAt,
    analyzedAt: now.toISOString(),
    platform: "web",
    family: "state",
    status: cell.status,
    flags: [...new Set([ANALYSIS_FLAGS.notReached, ...probe.flags])],
    contrast: emptyContrast(),
    fonts: emptyFonts(),
    targets: {},
    axe: noAxe(),
    overflow: [],
    clippedText: 0,
    problems: probe.problems.length,
    state,
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
export function analyzeNativeCell(cell: Pick<CapturedCell, "id" | "status" | "platform" | "family"> & { run: string; capturedAt: string }, probe: NativeProbe, snapshot: A11ySnapshot | null, now: Date): CellAnalysis {
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
    targets.android = { floor: TARGET_FLOORS.android.size, unit: TARGET_FLOORS.android.unit, note: "the view's accessibility bounds; a hitSlop is not in the tree", small: a11y.smallTargets.map((target) => ({ region: "device", ...target })) };
  }
  return {
    schema: 1,
    id: cell.id,
    run: cell.run,
    capturedAt: cell.capturedAt,
    analyzedAt: now.toISOString(),
    platform,
    family: cell.family,
    status: cell.status,
    flags,
    contrast: emptyContrast(),
    fonts: emptyFonts(),
    targets,
    axe: noAxe(),
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

/** A web cell's probe.json read as a CellProbe by the family that wrote it; null for a state not reached. */
export function readCellProbe(family: CellFamily, json: unknown): CellProbe | null {
  if (family === "state") return readStateProbe(json as StateProbe);
  if (family === "page") return readPageProbe(json as PageProbe);
  return readVariantProbe(json as VariantProbe);
}

/** Whether a text needs its photograph read: the DOM did not resolve it, it owes contrast, and the photograph shows it. */
export const needsPixels = (text: ProbeText) => text.contrast === null && !text.disabled && !text.covered && !text.scrolled;

/**
 * The samplers of a cell's photographs: each photograph a region `wanted` is taken in (by
 * default, a region with a text the DOM could not resolve), decoded once. A photograph that
 * is missing is left out, and its region's texts are unmeasured with the reason.
 */
export async function cellSamplers(dir: string, probe: CellProbe, wanted: (region: ProbedRegion) => boolean = (region) => region.texts.some(needsPixels)): Promise<(photo: RegionPhoto) => CardSampler | null> {
  const images = new Map<string, RawImage>();
  for (const region of probe.regions) {
    if ("none" in region.photo || images.has(region.photo.file) || !wanted(region)) continue;
    const path = join(dir, region.photo.file);
    if (existsSync(path)) images.set(region.photo.file, await decodeImage(path));
  }
  return (photo) => {
    const image = images.get(photo.file);
    return image ? cardSampler(image, probe.dpr, photo.offset) : null;
  };
}

/** A cell's look and surface order within its group, blush solid first, for ties in the structure vote. */
const LOOK_ORDER = ["blush.solid", "blush.glass", "mint.solid", "mint.glass", "dark.solid", "dark.glass"];
const lookRank = (cell: CapturedCell) => LOOK_ORDER.indexOf(`${cell.look}.${cell.surface}`);

export interface AnalyzeTotals {
  cells: number;
  analyzed: number;
  skipped: number;
  /** Analyzed cells per family. */
  families: Record<CellFamily, number>;
  sampled: number;
  /** Of the sampled texts, those with no painted ink colour, read by the percentiles. */
  percentiles: number;
  failLikely: number;
  review: number;
  domFails: number;
  /** Texts the DOM could not resolve and no photograph could answer for. */
  unmeasured: number;
  flags: Record<string, number>;
}

const analyzedCell = (cell: CapturedCell): AnalyzedCell => ({ id: cell.id, status: cell.status, family: cell.family, state: cell.state, row: cell.row, variant: cell.variant, label: cell.label, run: cell.run.id, capturedAt: cell.capturedAt });

/** One group of web cells (one variant, state or page at one width, its looks and surfaces), whose structure is voted on together. */
async function analyzeGroup(group: CapturedCell[], now: Date, totals: AnalyzeTotals): Promise<void> {
  const read = group.map((cell) => {
    const json = existsSync(join(cell.dir, PROBE_FILE)) ? readJsonFile<unknown>(join(cell.dir, PROBE_FILE)) : null;
    return { cell, json, probe: json === null ? null : readCellProbe(cell.family, json) };
  });
  // A failed cell's tree is not its variant's (a redirect, a wrong example, a page cut off mid-probe): it takes no part in the vote.
  const structures = structureOf(
    [...read]
      .sort((a, b) => lookRank(a.cell) - lookRank(b.cell))
      .map(({ cell, probe }) => ({ id: cell.id, aria: cell.status === ANALYSIS_FLAGS.failed ? null : probe?.tree ?? null })),
  );
  for (const { cell, json, probe } of read) {
    let analysis: CellAnalysis;
    if (cell.family === "state" && notReached(cell) && json !== null) analysis = analyzeUnreachedState(analyzedCell(cell), json as StateProbe, now);
    else if (probe) analysis = analyzeWebCell(analyzedCell(cell), probe, await cellSamplers(cell.dir, probe), structures.get(cell.id), now);
    else {
      totals.skipped += 1;
      continue;
    }
    writeFileSync(join(cell.dir, ANALYSIS_FILE), `${JSON.stringify(analysis, null, 2)}\n`);
    count(totals, analysis);
  }
}

function count(totals: AnalyzeTotals, analysis: CellAnalysis) {
  totals.analyzed += 1;
  totals.families[analysis.family] += 1;
  totals.sampled += analysis.contrast.pixels.sampled;
  totals.percentiles += analysis.contrast.pixels.percentiles;
  totals.failLikely += analysis.contrast.pixels.failLikely;
  totals.review += analysis.contrast.pixels.review;
  totals.domFails += analysis.contrast.dom.fails;
  totals.unmeasured += analysis.contrast.unmeasured;
  for (const flag of analysis.flags) totals.flags[flag] = (totals.flags[flag] ?? 0) + 1;
}

async function analyzeNative(cell: CapturedCell, now: Date, totals: AnalyzeTotals): Promise<void> {
  const probe = readJsonFile<NativeProbe>(join(cell.dir, PROBE_FILE));
  if (!probe) {
    totals.skipped += 1;
    return;
  }
  const snapshot = readJsonFile<A11ySnapshot>(join(cell.dir, "a11y.json"));
  const analysis = analyzeNativeCell({ id: cell.id, status: cell.status, platform: cell.platform, family: cell.family, run: cell.run.id, capturedAt: cell.capturedAt }, probe, snapshot, now);
  writeFileSync(join(cell.dir, ANALYSIS_FILE), `${JSON.stringify(analysis, null, 2)}\n`);
  count(totals, analysis);
}

/**
 * Analyze `cells` (current captures, runs.ts currentCells) and write each one's
 * analysis.json: the web cells in groups of one variant, state or page at one width (the
 * structure vote is over the group), the native cells one by one.
 */
export async function analyzeCells(cells: CapturedCell[], now: Date): Promise<AnalyzeTotals> {
  const totals: AnalyzeTotals = { cells: cells.length, analyzed: 0, skipped: 0, families: { variant: 0, state: 0, page: 0 }, sampled: 0, percentiles: 0, failLikely: 0, review: 0, domFails: 0, unmeasured: 0, flags: {} };
  const groups = new Map<string, CapturedCell[]>();
  const native: CapturedCell[] = [];
  for (const cell of cells) {
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
  return totals;
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
  const totals = await analyzeCells(selection.cells, new Date());
  const ms = Date.now() - started;
  const families = (Object.entries(totals.families) as [CellFamily, number][]).filter(([, n]) => n).map(([family, n]) => `${n} ${family}`).join(", ");
  console.log(`audit:analyze over ${selection.runs.length} run(s): ${totals.analyzed} of ${totals.cells} current cell(s) analyzed${families ? ` (${families})` : ""}${totals.skipped ? `, ${totals.skipped} with no probe (failed)` : ""}`);
  console.log(`  contrast  ${totals.domFails} DOM fail(s); ${totals.sampled} text(s) read against their photograph's pixels (${totals.sampled - totals.percentiles} ${CONTRAST_METHODS.paintedInk}, ${totals.percentiles} ${CONTRAST_METHODS.percentiles}): ${totals.failLikely} fail-likely, ${totals.review} to review; ${totals.unmeasured} unmeasured`);
  const flags = Object.entries(totals.flags).sort((a, b) => b[1] - a[1]);
  console.log(`  flags     ${flags.length ? flags.map(([flag, n]) => `${flag} ${n}`).join(", ") : "none"}`);
  console.log(`  time      ${(ms / 1000).toFixed(1)} s (${totals.analyzed ? (ms / totals.analyzed).toFixed(1) : "0"} ms a cell)`);
  console.log(`  output    ${ANALYSIS_FILE} beside each cell's probe under ${relative(ROOT, join(ROOT, ".audit", "runs"))}`);
  return 0;
}

if (import.meta.main) process.exit(await main());
