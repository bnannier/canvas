#!/usr/bin/env bun
// `bun run audit:analyze`: the component audit's analysis step (plan 1e). For the newest
// capture of every cell across the runs under .audit/runs (runs.ts), it reads what the
// capture recorded and writes `analysis.json` beside the cell's probe.json:
//
// - contrast: from the probe's DOM-composited background where it resolved (probe-math.ts,
//   method "dom": fails under the 4.5 or 3 the text owes); where the DOM could not say what
//   is under a text (a backdrop filter, a gradient, an image), sampled from card.png at the
//   text's box, method "pixels": the 10th and 90th luminance percentiles of the box are taken
//   as ink and background, which keeps antialiasing and a stray pixel from deciding it.
//   Sampling under-reads thin glyphs, so it never says "fail" outright: under 8/9 of what
//   the text owes (4.0 for 4.5, 2.67 for 3) is "fail-likely", from there up to what it owes
//   is "review". A disabled control's text owes nothing (WCAG 1.4.3's inactive exception),
//   and a text something else paints over is not sampled.
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
// - the cell's flags: the capture's own and the analysis' (ANALYSIS_FLAGS).
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
import { TARGET_FLOORS, flagsOf, parseCssColor, type Box, type ProbeSummary, type ProbeTarget, type ProbeText, type RowPlatform } from "./probe-math.ts";
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

// --- Pixel contrast ---------------------------------------------------------------

export type RGB = [number, number, number];

/** The percentiles the pixel method reads as ink and background. */
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

/** A text's sampled contrast: its box as device pixels, narrowed to its ink, then the percentiles. */
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

export type ContrastVerdict = "pass" | "fail" | "review" | "fail-likely" | "exempt" | "unmeasured";

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
  method: "dom" | "pixels" | "none";
  contrast: number | null;
  verdict: ContrastVerdict;
  /** The text's colour as painted (dom) or the sampled percentile nearer the text's own colour (pixels). */
  ink?: string;
  background?: string;
  samples?: number;
  /** Why it was not measured, or why the DOM could not resolve it. */
  reason?: string;
}

/**
 * One text's contrast: the probe's DOM verdict where it resolved, else sampled from the
 * card image (when one is given), else unmeasured with the reason.
 */
export function textContrast(row: RowPlatform, text: ProbeText, sample: ((box: Box) => PixelSample | null) | null): TextContrast {
  const base = { row, text: text.text, size: text.size, required: text.required };
  if (text.disabled) return { ...base, method: text.contrast === null ? "none" : "dom", contrast: text.contrast, verdict: "exempt", reason: "disabled: WCAG 1.4.3's inactive exception" };
  if (text.contrast !== null) {
    return { ...base, method: "dom", contrast: text.contrast, verdict: text.contrastFails ? "fail" : "pass", ink: text.painted, background: text.background };
  }
  const why = text.indeterminate ?? "indeterminate";
  if (text.covered) return { ...base, method: "none", contrast: null, verdict: "unmeasured", reason: `covered: something else paints over it (${why})` };
  if (text.scrolled) return { ...base, method: "none", contrast: null, verdict: "unmeasured", reason: `scrolled: part of its box is out of its scroller's view, so the photograph does not show it (${why})` };
  if (!sample) return { ...base, method: "none", contrast: null, verdict: "unmeasured", reason: `${why}; no card image to sample` };
  const measured = sample(text.box);
  if (!measured) return { ...base, method: "none", contrast: null, verdict: "unmeasured", reason: `${why}; its box holds too few pixels of the card to sample` };
  // The percentile nearer the text's declared colour is its ink; contrast is symmetric either way.
  const declared = parseCssColor(text.color);
  let [ink, background] = [measured.low, measured.high];
  if (declared) {
    const target = relativeLuminance([declared[0], declared[1], declared[2]]);
    if (Math.abs(measured.high.luminance - target) < Math.abs(measured.low.luminance - target)) [ink, background] = [measured.high, measured.low];
  }
  return {
    ...base,
    method: "pixels",
    contrast: measured.contrast,
    verdict: pixelVerdict(measured.contrast, text.required),
    ink: hex(ink.rgb),
    background: hex(background.rgb),
    samples: measured.samples,
    reason: why,
  };
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
    pixels: { sampled: number; failLikely: number; review: number; passed: number };
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

const emptyContrast = (): CellAnalysis["contrast"] => ({ dom: { checked: 0, fails: 0 }, pixels: { sampled: 0, failLikely: 0, review: 0, passed: 0 }, exempt: 0, unmeasured: 0, texts: [] });

/** The analysis of one web cell from its probe and, where the DOM left a text indeterminate, its card image. */
export function analyzeWebProbe(cell: Pick<CapturedCell, "id" | "status" | "flags"> & { run: string; capturedAt: string }, probe: WebProbe, sample: ((box: Box) => PixelSample | null) | null, structure: Structure | undefined, now: Date): CellAnalysis {
  const contrast = emptyContrast();
  const texts = probe.rows.flatMap((row) => row.texts.map((text) => ({ row: row.platform, text })));
  for (const { row, text } of texts) {
    const verdict = textContrast(row, text, sample);
    if (verdict.verdict === "exempt") contrast.exempt += 1;
    else if (verdict.method === "dom") {
      contrast.dom.checked += 1;
      if (verdict.verdict === "fail") contrast.dom.fails += 1;
    } else if (verdict.method === "pixels") {
      contrast.pixels.sampled += 1;
      if (verdict.verdict === "fail-likely") contrast.pixels.failLikely += 1;
      else if (verdict.verdict === "review") contrast.pixels.review += 1;
      else contrast.pixels.passed += 1;
    } else contrast.unmeasured += 1;
    if (verdict.method === "pixels" || verdict.verdict !== "pass") contrast.texts.push(verdict);
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
  failLikely: number;
  review: number;
  domFails: number;
  flags: Record<string, number>;
}

async function analyzeGroup(group: CapturedCell[], now: Date, totals: AnalyzeTotals): Promise<void> {
  const probes = group.map((cell) => ({ cell, probe: existsSync(join(cell.dir, PROBE_FILE)) ? readJsonFile<WebProbe>(join(cell.dir, PROBE_FILE)) : null }));
  const structures = structureOf(
    [...probes]
      .sort((a, b) => lookRank(a.cell) - lookRank(b.cell))
      .map(({ cell, probe }) => ({ id: cell.id, aria: probe?.rows.find((row) => row.platform === "web")?.aria ?? null })),
  );
  for (const { cell, probe } of probes) {
    if (!probe || notReached(cell)) {
      totals.skipped += 1;
      continue;
    }
    const cardPath = join(cell.dir, CARD_FILE);
    const needsPixels = probe.rows.some((row) => row.texts.some((text) => text.contrast === null && !text.disabled && !text.covered && !text.scrolled));
    const image = needsPixels && existsSync(cardPath) ? await decodeImage(cardPath) : null;
    const sample = image ? (box: Box) => sampleText(image, box, probe.dpr) : null;
    const analysis = analyzeWebProbe({ id: cell.id, status: cell.status, flags: cell.flags, run: cell.run.id, capturedAt: cell.capturedAt }, probe, sample, structures.get(cell.id), now);
    writeFileSync(join(cell.dir, ANALYSIS_FILE), `${JSON.stringify(analysis, null, 2)}\n`);
    count(totals, analysis);
  }
}

function count(totals: AnalyzeTotals, analysis: CellAnalysis) {
  totals.analyzed += 1;
  totals.sampled += analysis.contrast.pixels.sampled;
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
  const totals: AnalyzeTotals = { cells: selection.cells.length, analyzed: 0, skipped: 0, sampled: 0, failLikely: 0, review: 0, domFails: 0, flags: {} };
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
  console.log(`  contrast  ${totals.domFails} DOM fail(s); ${totals.sampled} text(s) sampled from pixels: ${totals.failLikely} fail-likely, ${totals.review} to review`);
  const flags = Object.entries(totals.flags).sort((a, b) => b[1] - a[1]);
  console.log(`  flags     ${flags.length ? flags.map(([flag, n]) => `${flag} ${n}`).join(", ") : "none"}`);
  console.log(`  time      ${(ms / 1000).toFixed(1)} s (${totals.analyzed ? (ms / totals.analyzed).toFixed(1) : "0"} ms a cell)`);
  console.log(`  output    ${ANALYSIS_FILE} beside each cell's probe under ${relative(ROOT, join(ROOT, ".audit", "runs"))}`);
  return 0;
}

if (import.meta.main) process.exit(await main());
