#!/usr/bin/env bun
// `bun run audit:calibrate`: how far the analysis' contrast read from a photograph's pixels
// can be trusted (analyze.ts). It runs both pixel methods over the newest capture of every
// web cell (the variant cards, the interaction states and the page sections, each region in
// the photograph it was taken in, placed as the analysis places it) and sets their verdicts
// beside what the DOM says:
//
// - Solid cells. On every text the DOM resolved (the probe composited its paint stack), the
//   pixel methods read the photograph as if the DOM had not: of the DOM passes, how many
//   read fail-likely (a false fail-likely) or review; of the DOM fails, how many read
//   fail-likely (caught), review, or pass (missed); and how far the pixel reading strays
//   from the DOM's. A region placed wrong in its photograph reads the wrong pixels, so this
//   is also the check that the states' and pages' placement is right.
// - Glass cells. Every glass text a method reads as fail-likely or review, beside its solid
//   twin (the same text in the same region of the same cell, width and look, on the solid
//   surface): how many of the twins pass on the DOM. Glass is a different material, so a
//   twin that passes does not prove the glass verdict wrong; it is the share a reviewer
//   should expect to clear on looking.
//
// The methods are "painted-ink+pixel-background" (what the analysis uses: the text's
// recorded ink over the background read from the pixels) and "pixel-percentiles" (its
// fallback where no painted ink colour exists: both colours read from the pixels). A text
// with no painted ink colour is counted under the first as unread.
//
//   bun run audit:calibrate                     every current web cell
//   bun run audit:calibrate -- --only=alert     those components' cells
//   bun run audit:calibrate -- --run=<run id>   only those runs' cells
//
// It writes nothing. Exit status: 0, or 2 for a usage error.

import { existsSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "../../e2e/support/routes.ts";
import {
  CONTRAST_METHODS,
  cellSamplers,
  paintedInk,
  paintedInkContrast,
  percentileContrast,
  pixelVerdict,
  readCellProbe,
  type CardSampler,
  type CellProbe,
  type RegionPhoto,
} from "./analyze.ts";
import type { ProbeText } from "./probe-math.ts";
import { currentCells, parseToolArgs, pool, readJsonFile, type CapturedCell, type CellFamily } from "./runs.ts";
import { PROBE_FILE } from "./web-capture.ts";

export const PIXEL_METHODS = [CONTRAST_METHODS.paintedInk, CONTRAST_METHODS.percentiles] as const;
export type PixelMethod = (typeof PIXEL_METHODS)[number];

/** One text the DOM resolved, read again from its photograph's pixels by each method (null: not readable that way). */
export interface SolidReading {
  run: string;
  cell: string;
  family: CellFamily;
  /** The region it is in (analyze.ts ProbedRegion `key`). */
  region: string;
  text: string;
  required: number;
  dom: number;
  domFails: boolean;
  pixels: Record<PixelMethod, number | null>;
}

/** The texts a calibration reads: not exempt, nothing painted over them, wholly in view. */
const readable = (text: ProbeText) => !text.disabled && !text.covered && !text.scrolled;

/** Each pixel method's reading of one text, null where the method cannot read it. */
export function readBoth(text: ProbeText, sampler: CardSampler): Record<PixelMethod, number | null> {
  const ink = paintedInk(text);
  return {
    [CONTRAST_METHODS.paintedInk]: "rgb" in ink ? paintedInkContrast(text, ink, sampler)?.contrast ?? null : null,
    [CONTRAST_METHODS.percentiles]: percentileContrast(text, sampler)?.contrast ?? null,
  };
}

/** The solid readings of one cell: every text the DOM resolved and its photograph shows. */
export function solidReadings(cell: Pick<CapturedCell, "id" | "family"> & { run: string }, probe: Pick<CellProbe, "regions">, samplerFor: (photo: RegionPhoto) => CardSampler | null): SolidReading[] {
  const out: SolidReading[] = [];
  for (const region of probe.regions) {
    const sampler = "none" in region.photo ? null : samplerFor(region.photo);
    if (!sampler) continue;
    for (const text of region.texts) {
      if (text.contrast === null || !readable(text) || !sampler.shows(text.box)) continue;
      out.push({ run: cell.run, cell: cell.id, family: cell.family, region: region.key, text: text.text, required: text.required, dom: text.contrast, domFails: text.contrastFails, pixels: readBoth(text, sampler) });
    }
  }
  return out;
}

export interface VerdictCounts {
  texts: number;
  pass: number;
  review: number;
  failLikely: number;
  /** Not readable by the method (no painted ink colour, or too few pixels). */
  unread: number;
}

export interface SolidSummary {
  texts: number;
  domPasses: number;
  domFails: number;
  methods: Record<PixelMethod, {
    onPasses: VerdictCounts;
    onFails: VerdictCounts;
    /** (pixel - DOM) / DOM over the texts read: the median and the extremes. */
    error: { median: number; under: number; over: number };
  }>;
}

const counts = (): VerdictCounts => ({ texts: 0, pass: 0, review: 0, failLikely: 0, unread: 0 });

function tally(into: VerdictCounts, contrast: number | null, required: number) {
  into.texts += 1;
  if (contrast === null) {
    into.unread += 1;
    return;
  }
  const verdict = pixelVerdict(contrast, required);
  if (verdict === "fail-likely") into.failLikely += 1;
  else if (verdict === "review") into.review += 1;
  else into.pass += 1;
}

const round = (value: number, places = 3) => Math.round(value * 10 ** places) / 10 ** places;

/** Every method's verdicts on the solid readings, beside the DOM's. */
export function summarizeSolid(readings: SolidReading[]): SolidSummary {
  const methods = {} as SolidSummary["methods"];
  for (const method of PIXEL_METHODS) {
    const onPasses = counts();
    const onFails = counts();
    const errors: number[] = [];
    for (const reading of readings) {
      const contrast = reading.pixels[method];
      tally(reading.domFails ? onFails : onPasses, contrast, reading.required);
      if (contrast !== null) errors.push((contrast - reading.dom) / reading.dom);
    }
    errors.sort((a, b) => a - b);
    methods[method] = {
      onPasses,
      onFails,
      error: errors.length ? { median: round(errors[Math.floor(errors.length / 2)]!), under: round(errors[0]!), over: round(errors[errors.length - 1]!) } : { median: 0, under: 0, over: 0 },
    };
  }
  return { texts: readings.length, domPasses: readings.filter((r) => !r.domFails).length, domFails: readings.filter((r) => r.domFails).length, methods };
}

/** What the solid twin of a glass text says on the DOM. */
export type TwinVerdict = "passes" | "fails" | "unresolved" | "no twin";

/**
 * The solid twin of a glass text: the text at the same place in the same region of the solid
 * cell, or failing that the first with the same words in that region.
 */
export function twinOf(probe: Pick<CellProbe, "regions"> | null, region: string, index: number, text: string): TwinVerdict {
  const texts = probe?.regions.find((r) => r.key === region)?.texts;
  if (!texts) return "no twin";
  const twin = texts[index]?.text === text ? texts[index] : texts.find((t) => t.text === text);
  if (!twin) return "no twin";
  if (twin.contrast === null || twin.disabled) return "unresolved";
  return twin.contrastFails ? "fails" : "passes";
}

export interface GlassVerdicts {
  /** Glass texts read by the method. */
  read: number;
  failLikely: Record<TwinVerdict, number>;
  review: Record<TwinVerdict, number>;
}

const twins = (): Record<TwinVerdict, number> => ({ passes: 0, fails: 0, unresolved: 0, "no twin": 0 });

/** A glass cell's flagged texts per method, each beside its solid twin's DOM verdict. */
export function glassVerdicts(probe: Pick<CellProbe, "regions">, samplerFor: (photo: RegionPhoto) => CardSampler | null, twin: Pick<CellProbe, "regions"> | null, into: Record<PixelMethod, GlassVerdicts>): void {
  for (const region of probe.regions) {
    const sampler = "none" in region.photo ? null : samplerFor(region.photo);
    if (!sampler) continue;
    region.texts.forEach((text, index) => {
      if (text.contrast !== null || !readable(text) || !sampler.shows(text.box)) return;
      const readings = readBoth(text, sampler);
      for (const method of PIXEL_METHODS) {
        const contrast = readings[method];
        if (contrast === null) continue;
        into[method].read += 1;
        const verdict = pixelVerdict(contrast, text.required);
        if (verdict === "pass") continue;
        const bucket = verdict === "fail-likely" ? into[method].failLikely : into[method].review;
        bucket[twinOf(twin, region.key, index, text.text)] += 1;
      }
    });
  }
}

export const emptyGlass = (): Record<PixelMethod, GlassVerdicts> =>
  Object.fromEntries(PIXEL_METHODS.map((method) => [method, { read: 0, failLikely: twins(), review: twins() }])) as Record<PixelMethod, GlassVerdicts>;

/** The solid twin's id of a glass cell id. */
export const solidTwinId = (id: string) => id.replace(/\.glass$/, ".solid");

// --- The command -----------------------------------------------------------------------

const pct = (n: number, of: number) => (of ? `${((100 * n) / of).toFixed(1)}%` : "-");

function printSolid(title: string, summary: SolidSummary) {
  console.log(`${title}: ${summary.texts} text(s) the DOM resolved, ${summary.domPasses} pass(es) and ${summary.domFails} fail(s)`);
  for (const method of PIXEL_METHODS) {
    const { onPasses, onFails, error } = summary.methods[method];
    console.log(`  ${method}`);
    console.log(`    on DOM passes  ${onPasses.failLikely} fail-likely (${pct(onPasses.failLikely, onPasses.texts)}), ${onPasses.review} review (${pct(onPasses.review, onPasses.texts)}), ${onPasses.pass} pass, ${onPasses.unread} unread`);
    console.log(`    on DOM fails   ${onFails.failLikely} fail-likely (${pct(onFails.failLikely, onFails.texts)} caught), ${onFails.review} review, ${onFails.pass} pass (missed), ${onFails.unread} unread`);
    console.log(`    error          median ${(error.median * 100).toFixed(1)}%, from ${(error.under * 100).toFixed(1)}% to +${(error.over * 100).toFixed(1)}% of the DOM's contrast`);
  }
}

function printGlass(glass: Record<PixelMethod, GlassVerdicts>, cells: number) {
  console.log(`glass: ${cells} cell(s); each flagged text beside its solid twin's DOM verdict`);
  for (const method of PIXEL_METHODS) {
    const { read, failLikely, review } = glass[method];
    const line = (name: string, bucket: Record<TwinVerdict, number>) => {
      const total = Object.values(bucket).reduce((a, b) => a + b, 0);
      return `    ${name.padEnd(12)} ${total}: twin passes ${bucket.passes}, twin fails ${bucket.fails}, twin unresolved ${bucket.unresolved}, no twin ${bucket["no twin"]}`;
    };
    console.log(`  ${method}: ${read} text(s) read`);
    console.log(line("fail-likely", failLikely));
    console.log(line("review", review));
  }
}

const USAGE = "usage: bun run audit:calibrate -- [--only=<slugs>] [--run=<run ids>]";

async function main(): Promise<number> {
  const args = parseToolArgs(process.argv.slice(2));
  if (args.help) {
    console.log(USAGE);
    return 0;
  }
  if (args.errors.length) {
    console.error(`audit:calibrate: ${args.errors.join("; ")}\n${USAGE}`);
    return 2;
  }
  let selection: ReturnType<typeof currentCells>;
  try {
    selection = currentCells(ROOT, args);
  } catch (error) {
    console.error(`audit:calibrate: ${(error as Error).message}`);
    return 2;
  }
  for (const problem of selection.problems) console.warn(`  warning  ${problem}`);
  const started = Date.now();
  const usable = (cell: CapturedCell) => cell.platform === "web" && cell.status === "ok" && existsSync(join(cell.dir, PROBE_FILE));
  const cells = selection.cells.filter(usable);
  const byId = new Map(cells.map((cell) => [cell.id, cell]));
  const probeOf = (cell: CapturedCell | undefined): CellProbe | null => {
    const json = cell ? readJsonFile<unknown>(join(cell.dir, PROBE_FILE)) : null;
    return cell && json !== null ? readCellProbe(cell.family, json) : null;
  };
  const solid: SolidReading[] = [];
  const glass = emptyGlass();
  const glassCells: Record<CellFamily, number> = { variant: 0, state: 0, page: 0 };
  await pool(cells, 6, async (cell) => {
    const probe = probeOf(cell);
    if (!probe) return;
    // Every photograph a region was taken in, whether or not the DOM resolved its texts.
    const samplers = await cellSamplers(cell.dir, probe, () => true);
    if (cell.surface === "solid") solid.push(...solidReadings({ id: cell.id, family: cell.family, run: cell.run.id }, probe, samplers));
    else {
      glassCells[cell.family] += 1;
      glassVerdicts(probe, samplers, probeOf(byId.get(solidTwinId(cell.id))), glass);
    }
  });
  const families = (Object.keys(glassCells) as CellFamily[]).map((family) => `${cells.filter((cell) => cell.family === family).length} ${family}`).join(", ");
  console.log(`audit:calibrate over ${cells.length} current web cell(s) (${families}) from ${selection.runs.length} run(s), in ${((Date.now() - started) / 1000).toFixed(1)} s`);
  printSolid("solid", summarizeSolid(solid));
  const present = (Object.keys(glassCells) as CellFamily[]).filter((family) => solid.some((reading) => reading.family === family));
  if (present.length > 1) for (const family of present) printSolid(`solid, ${family} cells`, summarizeSolid(solid.filter((reading) => reading.family === family)));
  const runs = [...new Set(solid.map((reading) => reading.run))].sort();
  if (runs.length > 1) for (const run of runs) printSolid(`solid, run ${run}`, summarizeSolid(solid.filter((reading) => reading.run === run)));
  printGlass(glass, Object.values(glassCells).reduce((a, b) => a + b, 0));
  return 0;
}

if (import.meta.main) process.exit(await main());
