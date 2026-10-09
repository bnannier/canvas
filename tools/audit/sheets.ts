#!/usr/bin/env bun
// `bun run audit:sheets`: the component audit's contact sheets (plan 1e). From the newest
// capture of every cell across the runs under .audit/runs (runs.ts), it writes JPEG grids a
// reviewer reads beside a component's checklist, under .audit/current/<slug>/sheets/:
//
//   <variant>/card-solid.jpg, card-glass.jpg   the web card, widths x looks
//   <variant>/row-<ios|android|web>-<width>.jpg one platform row of the web card, looks x
//                                              surfaces, cut from card.png at the row's box
//                                              in probe.json
//   <variant>/native.jpg                       the device cards: iOS and Android x the six
//                                              looks and surfaces
//   <variant>/compare.jpg, compare-glass.jpg   per look, the browser's iOS row (phone width)
//                                              beside the iOS device's card, and the same
//                                              for Android; solid, then glass
//   states.jpg (states-<width>.jpg)            when the interaction-state runner has
//                                              captured the component: each state by the
//                                              looks and surfaces, phone width first
//
// Every tile is labelled with its cell id (its path under its run), and a cell that failed,
// was not reached or was never captured is a labelled placeholder, never a gap. Every
// sheet's long edge is at most 1600 px: the tiles are scaled together, by the largest
// factor that fits and no more than the sharpest source's own density, so their relative
// sizes stay true (a phone card is narrower than a desktop one); a grid is laid out in
// whichever orientation scales its tiles larger.
//
//   bun run audit:sheets                         every component with captures
//   bun run audit:sheets -- --only=button        one component
//   bun run audit:sheets -- --run=<run id>       built from those runs only
//
// A variant's sheets directory is emptied before it is written, so a sheet whose cells are
// gone does not linger. Exit status: 0, 1 when a sheet could not be written, 2 for a usage error.

import { existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join, relative } from "node:path";
import sharp, { type OverlayOptions } from "sharp";
import { ROOT } from "../../e2e/support/routes.ts";
import { LOOKS, SURFACES, WIDTHS, components, type Look, type Surface, type WidthKey } from "./inventory.ts";
import type { Box, RowPlatform } from "./probe-math.ts";
import { CURRENT_DIR, currentCells, notReached, parseToolArgs, pool, readJsonFile, type CapturedCell } from "./runs.ts";
import { CARD_FILE, PROBE_FILE } from "./web-capture.ts";

// --- Layout ---------------------------------------------------------------------------

/** No sheet's long edge exceeds this, in pixels. */
export const MAX_EDGE = 1600;

/** The sheet's fixed dimensions, in output pixels: they do not scale with the tiles. */
export const SHEET = {
  pad: 16,
  gutter: 12,
  titleFont: 14,
  titleLine: 19,
  labelFont: 11,
  labelLine: 14,
  /** A monospace glyph's advance as a share of its font size. */
  charWidth: 0.62,
  /** Space under a tile's label band before its image. */
  labelGap: 3,
  /** A placeholder's size, in layout units, where its whole row or column has no image. */
  placeholder: { width: 240, height: 90 },
} as const;

/** One tile of a grid, before layout. */
export interface TileInput {
  /** The cell id the tile shows. */
  label: string;
  /** Said under the label: why there is no picture, or the cell's status when it is not ok. */
  note?: string;
  /** The picture's size in layout units (CSS px, pt, dp), or null for a placeholder. */
  size: { width: number; height: number } | null;
  /** The picture's pixels per layout unit, or null for a placeholder. */
  density: number | null;
}

export interface GridInput {
  title: string;
  /** What the rows and columns stand for, said under the title. */
  rowsAre: string;
  colsAre: string;
  /** tiles[row][col]. */
  tiles: TileInput[][];
}

export interface PlacedTile {
  tile: TileInput;
  row: number;
  col: number;
  /** The tile's cell, top-left, output px. */
  x: number;
  y: number;
  /** The label band: the cell id's lines, then `note` lines of the tile's note. */
  label: { x: number; y: number; lines: string[]; note: number };
  /** Where the picture (or the placeholder) goes and its size, output px. */
  image: { x: number; y: number; width: number; height: number };
}

export interface SheetLayout {
  width: number;
  height: number;
  /** Output pixels per layout unit. */
  scale: number;
  transposed: boolean;
  title: string[];
  tiles: PlacedTile[];
}

/** Split `text` into lines of at most `max` characters, breaking after "/" or "." where it can. */
export function wrapLabel(text: string, max: number): string[] {
  const width = Math.max(4, Math.floor(max));
  const lines: string[] = [];
  let rest = text;
  while (rest.length > width) {
    const window = rest.slice(0, width + 1);
    const cut = Math.max(window.lastIndexOf("/"), window.lastIndexOf("."), window.lastIndexOf(" "));
    const at = cut > 0 ? cut + 1 : width;
    lines.push(rest.slice(0, at).trimEnd());
    rest = rest.slice(at).trimStart();
  }
  if (rest) lines.push(rest);
  return lines;
}

const charsFor = (px: number) => px / (SHEET.labelFont * SHEET.charWidth);

function transpose<T>(grid: T[][]): T[][] {
  const cols = Math.max(0, ...grid.map((row) => row.length));
  return Array.from({ length: cols }, (_, c) => grid.map((row) => row[c]!));
}

function layoutOnce(grid: GridInput, maxEdge: number, transposed: boolean): SheetLayout {
  const tiles = transposed ? transpose(grid.tiles) : grid.tiles;
  const rows = tiles.length;
  const cols = Math.max(0, ...tiles.map((row) => row.length));
  const present = tiles.flat().filter((tile) => tile.size && tile.density);
  const colWidth = Array.from({ length: cols }, (_, c) => Math.max(0, ...tiles.map((row) => row[c]?.size?.width ?? 0)) || SHEET.placeholder.width);
  const rowHeight = tiles.map((row) => Math.max(0, ...row.map((tile) => tile.size?.height ?? 0)) || SHEET.placeholder.height);
  const maxScale = present.length ? Math.min(...present.map((tile) => tile.density!)) : 1;
  const sumW = colWidth.reduce((a, b) => a + b, 0);
  const sumH = rowHeight.reduce((a, b) => a + b, 0);
  const title = [grid.title, transposed ? `rows: ${grid.colsAre}; columns: ${grid.rowsAre}` : `rows: ${grid.rowsAre}; columns: ${grid.colsAre}`];
  const titleHeight = title.length * SHEET.titleLine + SHEET.gutter;
  // The label bands depend on the column widths, which depend on the scale: settle them in turns.
  let scale = maxScale;
  let bands: number[] = rows ? Array(rows).fill(SHEET.labelLine * 2 + SHEET.labelGap) : [];
  let labels: { lines: string[]; note: number }[][] = [];
  for (let turn = 0; turn < 4; turn++) {
    const fixedW = 2 * SHEET.pad + SHEET.gutter * Math.max(0, cols - 1);
    const fixedH = 2 * SHEET.pad + titleHeight + SHEET.gutter * Math.max(0, rows - 1) + bands.reduce((a, b) => a + b, 0);
    scale = Math.max(0.01, Math.min(maxScale, (maxEdge - fixedW) / sumW, (maxEdge - fixedH) / sumH));
    labels = tiles.map((row) => row.map((tile, c) => {
      const chars = charsFor(Math.floor(colWidth[c]! * scale));
      const note = tile.note ? wrapLabel(tile.note, chars) : [];
      return { lines: [...wrapLabel(tile.label, chars), ...note], note: note.length };
    }));
    const next = labels.map((row) => Math.max(1, ...row.map((label) => label.lines.length)) * SHEET.labelLine + SHEET.labelGap);
    if (next.every((band, r) => band === bands[r])) break;
    bands = next;
  }
  const colPx = colWidth.map((w) => Math.floor(w * scale));
  const rowPx = rowHeight.map((h) => Math.floor(h * scale));
  const placed: PlacedTile[] = [];
  let y = SHEET.pad + titleHeight;
  for (let r = 0; r < rows; r++) {
    let x = SHEET.pad;
    for (let c = 0; c < cols; c++) {
      const tile = tiles[r]![c]!;
      const size = tile.size ?? { width: colWidth[c]!, height: rowHeight[r]! };
      placed.push({
        tile,
        row: r,
        col: c,
        x,
        y,
        label: { x, y, ...labels[r]![c]! },
        image: {
          x,
          y: y + bands[r]!,
          width: Math.max(1, Math.min(colPx[c]!, Math.floor(size.width * scale))),
          height: Math.max(1, Math.min(rowPx[r]!, Math.floor(size.height * scale))),
        },
      });
      x += colPx[c]! + SHEET.gutter;
    }
    y += bands[r]! + rowPx[r]! + SHEET.gutter;
  }
  const width = 2 * SHEET.pad + SHEET.gutter * Math.max(0, cols - 1) + colPx.reduce((a, b) => a + b, 0);
  const height = 2 * SHEET.pad + titleHeight + SHEET.gutter * Math.max(0, rows - 1) + bands.reduce((a, b) => a + b, 0) + rowPx.reduce((a, b) => a + b, 0);
  return { width, height, scale, transposed, title, tiles: placed };
}

/**
 * Lay a grid of tiles out on a sheet whose long edge is at most `maxEdge`: one scale for
 * every tile (so relative sizes stay true), no more than the sharpest source's density,
 * in whichever orientation gives the larger scale (the given one on a tie).
 */
export function layoutSheet(grid: GridInput, maxEdge = MAX_EDGE): SheetLayout {
  const straight = layoutOnce(grid, maxEdge, false);
  const turned = layoutOnce(grid, maxEdge, true);
  return turned.scale > straight.scale + 1e-9 ? turned : straight;
}

// --- Rendering -------------------------------------------------------------------------

/** Where a tile's picture comes from: an image file, and the part of it to show (device px), or all of it. */
export interface TileSource {
  path: string;
  crop?: { left: number; top: number; width: number; height: number };
}

const escapeXml = (text: string) => text.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[c]!);

const COLORS = { sheet: "#e6e6ea", title: "#16161c", label: "#22222a", note: "#5d5d68", warn: "#a1271d", frame: "#b9b9c2", hole: "#f6f6f8" };

/** The SVG laid over the composited pictures: the title, every label, every placeholder and every frame. */
export function overlaySvg(layout: SheetLayout): string {
  const parts: string[] = [];
  const font = `font-family="Menlo, Monaco, 'DejaVu Sans Mono', monospace"`;
  layout.title.forEach((line, i) => {
    parts.push(`<text x="${SHEET.pad}" y="${SHEET.pad + (i + 1) * SHEET.titleLine - 5}" ${font} font-size="${i === 0 ? SHEET.titleFont : SHEET.labelFont}" fill="${i === 0 ? COLORS.title : COLORS.note}" font-weight="${i === 0 ? 700 : 400}">${escapeXml(line)}</text>`);
  });
  for (const placed of layout.tiles) {
    const labelLines = placed.label.lines;
    const idLines = labelLines.length - placed.label.note;
    labelLines.forEach((line, i) => {
      const isNote = i >= idLines;
      const color = isNote ? (placed.tile.size ? COLORS.warn : COLORS.note) : COLORS.label;
      parts.push(`<text x="${placed.label.x}" y="${placed.label.y + (i + 1) * SHEET.labelLine - 3}" ${font} font-size="${SHEET.labelFont}" fill="${color}">${escapeXml(line)}</text>`);
    });
    const { x, y, width, height } = placed.image;
    if (placed.tile.size) {
      parts.push(`<rect x="${x - 0.5}" y="${y - 0.5}" width="${width + 1}" height="${height + 1}" fill="none" stroke="${COLORS.frame}" stroke-width="1"/>`);
    } else {
      parts.push(`<rect x="${x + 0.5}" y="${y + 0.5}" width="${width - 1}" height="${height - 1}" fill="${COLORS.hole}" stroke="${COLORS.frame}" stroke-width="1" stroke-dasharray="4 3"/>`);
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${layout.width}" height="${layout.height}">${parts.join("")}</svg>`;
}

/** Draw a laid-out sheet to a JPEG at `out`; returns its byte size. */
export async function renderSheet(layout: SheetLayout, sources: Map<PlacedTile["tile"], TileSource>, out: string): Promise<number> {
  const composites: OverlayOptions[] = [];
  for (const placed of layout.tiles) {
    const source = sources.get(placed.tile);
    if (!source || !placed.tile.size) continue;
    let image = sharp(source.path).flatten({ background: COLORS.hole });
    if (source.crop) image = image.extract(source.crop);
    const input = await image.resize(placed.image.width, placed.image.height, { fit: "fill", kernel: "lanczos3" }).toBuffer();
    composites.push({ input, left: placed.image.x, top: placed.image.y });
  }
  composites.push({ input: Buffer.from(overlaySvg(layout)), left: 0, top: 0 });
  const info = await sharp({ create: { width: layout.width, height: layout.height, channels: 3, background: COLORS.sheet } })
    .composite(composites)
    .jpeg({ quality: 86, chromaSubsampling: "4:4:4", mozjpeg: true })
    .toFile(out);
  return info.size;
}

// --- The sheets of a variant ---------------------------------------------------------------

interface CellPicture {
  cell: CapturedCell | undefined;
  /** card.png's size in device pixels and its density, read once per cell. */
  card: { path: string; width: number; height: number; dpr: number } | null;
  rows: Partial<Record<RowPlatform, Box>>;
}

/** What a cell can contribute to a sheet: its card picture and its row boxes, or why it has none. */
async function pictureOf(cell: CapturedCell | undefined): Promise<CellPicture> {
  if (!cell || cell.status === "failed" || notReached(cell)) return { cell, card: null, rows: {} };
  const path = join(cell.dir, CARD_FILE);
  if (!existsSync(path)) return { cell, card: null, rows: {} };
  const probe = readJsonFile<{ dpr?: number; rows?: { platform: RowPlatform; box: Box }[] }>(join(cell.dir, PROBE_FILE));
  const meta = await sharp(path).metadata();
  const dpr = probe?.dpr ?? 1;
  return {
    cell,
    card: { path, width: meta.width ?? 0, height: meta.height ?? 0, dpr },
    rows: Object.fromEntries((probe?.rows ?? []).map((row) => [row.platform, row.box])),
  };
}

const why = (picture: CellPicture): string => {
  if (!picture.cell) return "not captured";
  if (notReached(picture.cell)) return "state not reached";
  if (picture.cell.status === "failed") return `failed: ${(picture.cell.error ?? "unknown").split("\n")[0]!.slice(0, 90)}`;
  return "no card.png";
};

/** A tile showing a whole card. */
export function cardTile(id: string, picture: CellPicture, sources: Map<TileInput, TileSource>): TileInput {
  if (!picture.card) return { label: id, note: why(picture), size: null, density: null };
  const { path, width, height, dpr } = picture.card;
  const tile: TileInput = { label: id, ...(picture.cell?.status === "unstable" ? { note: "unstable: kept changing between grabs" } : {}), size: { width: width / dpr, height: height / dpr }, density: dpr };
  sources.set(tile, { path });
  return tile;
}

/** A tile showing one platform row of a web card, cut at its box. */
function rowTile(id: string, picture: CellPicture, platform: RowPlatform, sources: Map<TileInput, TileSource>): TileInput {
  const label = `${id} [${platform} row]`;
  const box = picture.rows[platform];
  if (!picture.card || !box) return { label, note: picture.card ? `no ${platform} row in probe.json` : why(picture), size: null, density: null };
  const { path, width, height, dpr } = picture.card;
  const left = Math.max(0, Math.round(box.x * dpr));
  const top = Math.max(0, Math.round(box.y * dpr));
  const crop = { left, top, width: Math.min(width - left, Math.round(box.width * dpr)), height: Math.min(height - top, Math.round(box.height * dpr)) };
  if (crop.width <= 0 || crop.height <= 0) return { label, note: "the row's box lies outside card.png", size: null, density: null };
  const tile: TileInput = { label, size: { width: crop.width / dpr, height: crop.height / dpr }, density: dpr };
  sources.set(tile, { path, crop });
  return tile;
}

export interface SheetSpec {
  /** The file name under the variant's (or the component's) sheets directory. */
  file: string;
  grid: GridInput;
  sources: Map<TileInput, TileSource>;
}

const LOOK_SURFACES = LOOKS.flatMap((look) => SURFACES.map((surface) => ({ look, surface })));
const webId = (slug: string, variant: string, width: WidthKey, look: Look, surface: Surface) => `web/${slug}/${variant}/${width}.${look}.${surface}`;
const nativeId = (platform: "ios" | "android", slug: string, variant: string, look: Look, surface: Surface) => `${platform}/${slug}/${variant}/${look}.${surface}`;

/** Every sheet of one variant, from the current cells by id. */
export async function variantSheets(slug: string, variant: string, cells: Map<string, CapturedCell>): Promise<SheetSpec[]> {
  const pictures = new Map<string, CellPicture>();
  const picture = async (id: string) => {
    let found = pictures.get(id);
    if (!found) {
      found = await pictureOf(cells.get(id));
      pictures.set(id, found);
    }
    return found;
  };
  const specs: SheetSpec[] = [];
  for (const surface of SURFACES) {
    const sources = new Map<TileInput, TileSource>();
    const tiles: TileInput[][] = [];
    for (const look of LOOKS) {
      const row: TileInput[] = [];
      for (const { key } of WIDTHS) {
        const id = webId(slug, variant, key, look, surface);
        row.push(cardTile(id, await picture(id), sources));
      }
      tiles.push(row);
    }
    specs.push({ file: `card-${surface}.jpg`, sources, grid: { title: `${slug} / ${variant}: the web card, ${surface}`, rowsAre: "looks", colsAre: "widths", tiles } });
  }
  for (const platform of ["ios", "android", "web"] as const) {
    for (const { key } of WIDTHS) {
      const sources = new Map<TileInput, TileSource>();
      const tiles: TileInput[][] = [];
      for (const look of LOOKS) {
        const row: TileInput[] = [];
        for (const surface of SURFACES) {
          const id = webId(slug, variant, key, look, surface);
          row.push(rowTile(id, await picture(id), platform, sources));
        }
        tiles.push(row);
      }
      specs.push({ file: `row-${platform}-${key}.jpg`, sources, grid: { title: `${slug} / ${variant}: the browser card's ${platform} row at ${key} width`, rowsAre: "looks", colsAre: "surfaces", tiles } });
    }
  }
  {
    const sources = new Map<TileInput, TileSource>();
    const tiles: TileInput[][] = [];
    for (const { look, surface } of LOOK_SURFACES) {
      const row: TileInput[] = [];
      for (const platform of ["ios", "android"] as const) {
        const id = nativeId(platform, slug, variant, look, surface);
        row.push(cardTile(id, await picture(id), sources));
      }
      tiles.push(row);
    }
    specs.push({ file: "native.jpg", sources, grid: { title: `${slug} / ${variant}: the device cards`, rowsAre: "looks and surfaces", colsAre: "iOS, Android", tiles } });
  }
  for (const surface of SURFACES) {
    const sources = new Map<TileInput, TileSource>();
    const tiles: TileInput[][] = [];
    for (const look of LOOKS) {
      const web = webId(slug, variant, "phone", look, surface);
      tiles.push([
        rowTile(web, await picture(web), "ios", sources),
        cardTile(nativeId("ios", slug, variant, look, surface), await picture(nativeId("ios", slug, variant, look, surface)), sources),
        rowTile(web, await picture(web), "android", sources),
        cardTile(nativeId("android", slug, variant, look, surface), await picture(nativeId("android", slug, variant, look, surface)), sources),
      ]);
    }
    specs.push({
      file: surface === "solid" ? "compare.jpg" : "compare-glass.jpg",
      sources,
      grid: { title: `${slug} / ${variant}: the browser's rows (phone width) beside the devices, ${surface}`, rowsAre: "looks", colsAre: "browser iOS row, iOS device, browser Android row, Android device", tiles },
    });
  }
  return specs;
}

/** The interaction-state sheets of one component, one per width its states were captured at. */
export async function stateSheets(slug: string, cells: CapturedCell[]): Promise<SheetSpec[]> {
  const states = cells.filter((cell) => cell.family === "state");
  if (!states.length) return [];
  const specs: SheetSpec[] = [];
  const widths = WIDTHS.map((w) => w.key).filter((key) => states.some((cell) => cell.width === key));
  for (const width of widths) {
    const atWidth = states.filter((cell) => cell.width === width);
    const keys = [...new Set(atWidth.map((cell) => `${cell.variant ? `${cell.variant}/` : ""}${cell.state}`))];
    const byId = new Map(atWidth.map((cell) => [cell.id, cell]));
    const sources = new Map<TileInput, TileSource>();
    const tiles: TileInput[][] = [];
    for (const key of keys) {
      const row: TileInput[] = [];
      for (const { look, surface } of LOOK_SURFACES) {
        const id = `web-states/${slug}/${key}/${width}.${look}.${surface}`;
        const cell = byId.get(id);
        row.push(cardTile(id, await stateCardPicture(cell), sources));
      }
      tiles.push(row);
    }
    specs.push({
      file: width === widths[0] ? "states.jpg" : `states-${width}.jpg`,
      sources,
      grid: { title: `${slug}: interaction states at ${width} width`, rowsAre: "states", colsAre: "looks and surfaces", tiles },
    });
  }
  return specs;
}

/** A state cell's picture: its card.png, or else the first other picture it wrote (never a failure shot). */
async function stateCardPicture(cell: CapturedCell | undefined): Promise<CellPicture> {
  const picture = await pictureOf(cell);
  if (picture.card || !cell || cell.status === "failed" || notReached(cell) || !existsSync(cell.dir)) return picture;
  const other = readdirSync(cell.dir).sort().find((name) => name.endsWith(".png") && name !== "failure.png");
  if (!other) return picture;
  const path = join(cell.dir, other);
  const meta = await sharp(path).metadata();
  const dpr = readJsonFile<{ dpr?: number }>(join(cell.dir, PROBE_FILE))?.dpr ?? 1;
  return { ...picture, card: { path, width: meta.width ?? 0, height: meta.height ?? 0, dpr } };
}

/** Whether a sheet has at least one picture: one with none is not written. */
export const hasPicture = (spec: SheetSpec) => spec.sources.size > 0;

// --- The command -------------------------------------------------------------------------

export interface SheetResult {
  path: string;
  bytes: number;
  width: number;
  height: number;
  scale: number;
}

async function writeSheets(dir: string, specs: SheetSpec[]): Promise<SheetResult[]> {
  const results: SheetResult[] = [];
  for (const spec of specs.filter(hasPicture)) {
    mkdirSync(dir, { recursive: true });
    const layout = layoutSheet(spec.grid);
    const path = join(dir, spec.file);
    const bytes = await renderSheet(layout, spec.sources, path);
    results.push({ path, bytes, width: layout.width, height: layout.height, scale: layout.scale });
  }
  return results;
}

const USAGE = "usage: bun run audit:sheets -- [--only=<slugs>] [--run=<run ids>]";

async function main(): Promise<number> {
  const args = parseToolArgs(process.argv.slice(2));
  if (args.help) {
    console.log(USAGE);
    return 0;
  }
  if (args.errors.length) {
    console.error(`audit:sheets: ${args.errors.join("; ")}\n${USAGE}`);
    return 2;
  }
  const started = Date.now();
  let selection: ReturnType<typeof currentCells>;
  try {
    selection = currentCells(ROOT, args);
  } catch (error) {
    console.error(`audit:sheets: ${(error as Error).message}`);
    return 2;
  }
  for (const problem of selection.problems) console.warn(`  warning  ${problem}`);
  const order = new Map(components().flatMap((component, c) => component.variants.map((variant, v) => [`${component.slug}/${variant.variant}`, c * 1000 + v] as const)));
  const bySlug = new Map<string, CapturedCell[]>();
  for (const cell of selection.cells) {
    if (cell.family === "page") continue;
    const list = bySlug.get(cell.slug);
    if (list) list.push(cell);
    else bySlug.set(cell.slug, [cell]);
  }
  const jobs: { slug: string; variant: string | null; cells: CapturedCell[] }[] = [];
  for (const [slug, cells] of bySlug) {
    const variants = [...new Set(cells.filter((cell) => cell.family === "variant").map((cell) => cell.variant!))]
      .sort((a, b) => (order.get(`${slug}/${a}`) ?? Infinity) - (order.get(`${slug}/${b}`) ?? Infinity) || a.localeCompare(b));
    for (const variant of variants) jobs.push({ slug, variant, cells });
    if (cells.some((cell) => cell.family === "state")) jobs.push({ slug, variant: null, cells });
  }
  let failed = 0;
  const results = (await pool(jobs, 4, async (job) => {
    const base = join(ROOT, CURRENT_DIR, job.slug, "sheets");
    try {
      if (job.variant === null) {
        for (const name of existsSync(base) ? readdirSync(base) : []) {
          if (/^states(-\w+)?\.jpg$/.test(name)) rmSync(join(base, name));
        }
        return await writeSheets(base, await stateSheets(job.slug, job.cells));
      }
      const dir = join(base, job.variant);
      rmSync(dir, { recursive: true, force: true });
      const byId = new Map(job.cells.map((cell) => [cell.id, cell]));
      return await writeSheets(dir, await variantSheets(job.slug, job.variant, byId));
    } catch (error) {
      failed += 1;
      console.error(`  failed   ${job.slug}${job.variant ? `/${job.variant}` : " states"}: ${(error as Error).message}`);
      return [];
    }
  })).flat();
  const ms = Date.now() - started;
  const bytes = results.reduce((n, r) => n + r.bytes, 0);
  const longest = results.reduce((n, r) => Math.max(n, r.width, r.height), 0);
  const scales = results.map((r) => r.scale).sort((a, b) => a - b);
  console.log(`audit:sheets: ${results.length} sheet(s) for ${jobs.filter((j) => j.variant).length} variant(s) of ${bySlug.size} component(s) from ${selection.runs.length} run(s)`);
  if (results.length) {
    console.log(`  size     ${(bytes / 1024 / 1024).toFixed(1)} MB, ${Math.round(bytes / results.length / 1024)} KB a sheet; longest edge ${longest} px; tile scale ${scales[0]!.toFixed(2)} to ${scales[scales.length - 1]!.toFixed(2)} px per layout unit (median ${scales[Math.floor(scales.length / 2)]!.toFixed(2)})`);
  }
  for (const smallest of [...results].sort((a, b) => a.scale - b.scale).slice(0, 3)) {
    console.log(`  smallest ${relative(ROOT, smallest.path)}: ${smallest.scale.toFixed(2)} px per layout unit (${smallest.width}x${smallest.height})`);
  }
  console.log(`  time     ${(ms / 1000).toFixed(1)} s`);
  console.log(`  output   ${relative(ROOT, join(ROOT, CURRENT_DIR))}/<slug>/sheets/`);
  return failed ? 1 : 0;
}

if (import.meta.main) process.exit(await main());
