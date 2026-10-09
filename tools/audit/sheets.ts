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
//   states.jpg, states-tablet.jpg,             a component's interaction states
//   states-phone.jpg                           (e2e/audit/state-cell.ts): a row per state
//                                              and the browser card's row it was reached
//                                              from, by the six looks and surfaces, each
//                                              tile its state.png with the state's and
//                                              its release's flags under it; desktop
//                                              first, where every state is captured, then
//                                              the widths only overlays are captured at
//   viewport-solid.jpg, viewport-glass.jpg     a pattern or template page's first screen
//                                              (viewport.png), widths x looks; its
//                                              sections are linked from its index.md
//
// Every tile is labelled with its cell id (its path under its run) and the commit its
// capture was taken at (its short sha, and "dirty" when the checkout had changes), and a
// cell that failed, was not reached or was never captured is a labelled placeholder, never
// a gap. A sheet's title names the runs its tiles come from; when they span more than one
// commit, a tile whose commit is not the sheet's most common one has its commit drawn in
// blue. Every sheet's long edge is at most 1600 px: the tiles are scaled together, by the
// largest factor that fits and no more than the sharpest source's own density, so their
// relative sizes stay true (a phone card is narrower than a desktop one), and a grid is laid
// out in whichever orientation scales its tiles larger. A grid whose tiles would fall under
// a readable 0.6 px per layout unit (MIN_SCALE) at that size is cut into numbered sheets
// instead (`card-solid-1.jpg`, `card-solid-2.jpg`, ...), along the axis a reader does not
// compare across: a card sheet per width (its looks stay side by side), the other sheets per
// row (a look, a state), as many neighbouring ones a sheet as stay readable together, and a
// slice still too large by the other axis too. A card too tall for the floor even on a sheet
// of its own (data-table's stacked card at phone width) is drawn as large as the edge
// allows, beside the looks that fit with it at that scale.
//
//   bun run audit:sheets                         every component with captures
//   bun run audit:sheets -- --only=button        one component
//   bun run audit:sheets -- --run=<run id>       built from those runs only
//
// A variant's sheets directory is emptied before it is written, and a component's state
// sheets and a page's sheets are removed before they are written, so a sheet whose cells
// are gone does not linger. Exit status: 0, 1 when a sheet could not be written, 2 for a
// usage error.

import { existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join, relative } from "node:path";
import sharp, { type OverlayOptions } from "sharp";
import { ROOT } from "../../e2e/support/routes.ts";
import { RELEASE_FLAGS, STATE_FLAGS, STATE_NAMES } from "../../e2e/support/state-recipes.ts";
import { LOOKS, SURFACES, WIDTHS, components, type Look, type Surface, type WidthKey } from "./inventory.ts";
import type { Box, RowPlatform } from "./probe-math.ts";
import { CURRENT_DIR, currentCells, notReached, parseToolArgs, pool, readJsonFile, type CapturedCell } from "./runs.ts";
import { CARD_FILE, PAGES_DIR as WEB_PAGES_DIR, PROBE_FILE, STATES_DIR, STATE_FILE, VIEWPORT_FILE } from "./web-capture.ts";

// --- Layout ---------------------------------------------------------------------------

/** No sheet's long edge exceeds this, in pixels. */
export const MAX_EDGE = 1600;

/**
 * The smallest scale a sheet draws its tiles at, in output px per layout unit (CSS px, pt,
 * dp), where the tiles' own density allows it: a 12 px body line paints about 7 px tall, the
 * smallest a reader still reads in a JPEG. A grid whose tiles would fall under it is cut
 * into numbered sheets rather than shrunk.
 */
export const MIN_SCALE = 0.6;

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
  /** The narrowest sheet: its title wraps to this, however narrow its tiles. */
  minWidth: 480,
} as const;

/** The run and commit a tile's capture was taken at. */
export interface Capture {
  run: string;
  sha: string | null;
  dirty: boolean | null;
}

/** One tile of a grid, before layout. */
export interface TileInput {
  /** The cell id the tile shows. */
  label: string;
  /** Said under the label: why there is no picture, or the cell's status when it is not ok. */
  note?: string;
  /** The capture it shows, or none for a cell never captured. */
  capture?: Capture;
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
  /** Each row's and each column's name, for the line that says which of them a numbered sheet holds. */
  rowKeys?: string[];
  colKeys?: string[];
  /**
   * The axis cut into numbered sheets when the tiles would fall under MIN_SCALE (rows when
   * unset): the other axis stays whole, so what a reader compares across it stays on one sheet.
   */
  splitBy?: "rows" | "columns";
  /** On a numbered sheet: which share of the grid it holds. */
  part?: string;
  /**
   * The tiles whose runs and usual commit the title and labels name, when not the grid's own:
   * a tile measured alone stands in for the piece it belongs to (planSheets).
   */
  context?: TileInput[];
  /** tiles[row][col]. */
  tiles: TileInput[][];
}

/** One line of a tile's label band. */
export interface LabelLine {
  text: string;
  /** The cell id, its commit (`odd-commit`: not the sheet's most common one), or its note (`warn` on a tile with a picture). */
  kind: "id" | "commit" | "odd-commit" | "note" | "warn";
}

export interface PlacedTile {
  tile: TileInput;
  row: number;
  col: number;
  /** The tile's cell, top-left, output px. */
  x: number;
  y: number;
  /** The label band: the cell id's lines, its commit, then its note. */
  label: { x: number; y: number; lines: LabelLine[] };
  /** Where the picture (or the placeholder) goes and its size, output px. */
  image: { x: number; y: number; width: number; height: number };
}

export interface SheetLayout {
  width: number;
  height: number;
  /** Output pixels per layout unit. */
  scale: number;
  transposed: boolean;
  /** The title wrapped to the sheet: the grid's title (strong), its axes, its part, its runs. */
  title: { text: string; strong: boolean }[];
  tiles: PlacedTile[];
}

/** Split `text` into lines of at most `max` characters, breaking after "/", "." or a space where it can. */
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

const charsFor = (px: number, font: number = SHEET.labelFont) => px / (font * SHEET.charWidth);

/** A capture's commit as a tile says it: the short sha, and "dirty" when the checkout had changes. */
export function commitOf(capture: Capture): string {
  return capture.sha ? `${capture.sha.slice(0, 7)}${capture.dirty ? " dirty" : ""}` : "unknown commit";
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** The title's runs line: every run the tiles' captures come from, and how many commits they span. */
export function runsLine(tiles: TileInput[]): string | null {
  const runs = new Map<string, Capture>();
  for (const tile of tiles) if (tile.capture && !runs.has(tile.capture.run)) runs.set(tile.capture.run, tile.capture);
  if (!runs.size) return null;
  const commits = new Set([...runs.values()].map(commitOf));
  const named = [...runs.values()].sort((a, b) => a.run.localeCompare(b.run)).map((capture) => `${capture.run}${capture.dirty ? " (dirty)" : ""}`);
  return `from ${plural(runs.size, "run")} at ${plural(commits.size, "commit")}: ${named.join(", ")}`;
}

/** The commit most of the tiles were captured at (the first such on a tie) when they span more than one, else null. */
export function usualCommit(tiles: TileInput[]): string | null {
  const counts = new Map<string, number>();
  for (const tile of tiles) if (tile.capture) counts.set(commitOf(tile.capture), (counts.get(commitOf(tile.capture)) ?? 0) + 1);
  if (counts.size < 2) return null;
  let most: string | null = null;
  for (const [commit, n] of counts) if (most === null || n > counts.get(most)!) most = commit;
  return most;
}

/** A tile's label lines at `chars` characters a line: its id, its commit, its note. */
function labelLines(tile: TileInput, chars: number, usual: string | null): LabelLine[] {
  const lines: LabelLine[] = wrapLabel(tile.label, chars).map((text) => ({ text, kind: "id" }));
  if (tile.capture) {
    const commit = commitOf(tile.capture);
    const kind = usual !== null && commit !== usual ? "odd-commit" : "commit";
    lines.push(...wrapLabel(`commit ${commit}`, chars).map((text) => ({ text, kind }) as LabelLine));
  }
  if (tile.note) lines.push(...wrapLabel(tile.note, chars).map((text) => ({ text, kind: tile.size ? "warn" : "note" }) as LabelLine));
  return lines;
}

function transpose<T>(grid: T[][]): T[][] {
  const cols = Math.max(0, ...grid.map((row) => row.length));
  return Array.from({ length: cols }, (_, c) => grid.map((row) => row[c]!));
}

/** The sharpest scale the tiles allow: no more than their sources' own density. */
function densityCap(tiles: TileInput[]): number {
  const present = tiles.filter((tile) => tile.size && tile.density);
  return present.length ? Math.min(...present.map((tile) => tile.density!)) : 1;
}

/**
 * Lay the grid out in one orientation at the largest scale that keeps both edges within
 * `maxEdge`, or null when none does. The label bands and the title's wrapping depend on the
 * column widths, which depend on the scale: they are settled in turns from one line a row,
 * each turn only adding lines (so the scale only falls), until a turn needs no more.
 */
function layoutOnce(grid: GridInput, maxEdge: number, transposed: boolean): SheetLayout | null {
  const tiles = transposed ? transpose(grid.tiles) : grid.tiles;
  const rows = tiles.length;
  const cols = Math.max(0, ...tiles.map((row) => row.length));
  if (!rows || !cols) return null;
  const all = tiles.flat();
  const colWidth = Array.from({ length: cols }, (_, c) => Math.max(0, ...tiles.map((row) => row[c]?.size?.width ?? 0)) || SHEET.placeholder.width);
  const rowHeight = tiles.map((row) => Math.max(0, ...row.map((tile) => tile.size?.height ?? 0)) || SHEET.placeholder.height);
  const maxScale = densityCap(all);
  const sumW = colWidth.reduce((a, b) => a + b, 0);
  const sumH = rowHeight.reduce((a, b) => a + b, 0);
  const heading = [
    { text: grid.title, strong: true },
    { text: transposed ? `rows: ${grid.colsAre}; columns: ${grid.rowsAre}` : `rows: ${grid.rowsAre}; columns: ${grid.colsAre}`, strong: false },
    ...(grid.part ? [{ text: grid.part, strong: false }] : []),
    ...[runsLine(grid.context ?? all)].filter((line): line is string => line !== null).map((text) => ({ text, strong: false })),
  ];
  const usual = usualCommit(grid.context ?? all);
  const fixedW = 2 * SHEET.pad + SHEET.gutter * (cols - 1);
  let bands: number[] = Array(rows).fill(SHEET.labelLine + SHEET.labelGap);
  let titleLines = heading.length;
  for (;;) {
    const fixedH = 2 * SHEET.pad + titleLines * SHEET.titleLine + SHEET.gutter + SHEET.gutter * (rows - 1) + bands.reduce((a, b) => a + b, 0);
    const scale = Math.min(maxScale, (maxEdge - fixedW) / sumW, (maxEdge - fixedH) / sumH);
    if (!(scale > 0)) return null;
    const colPx = colWidth.map((w) => Math.floor(w * scale));
    const rowPx = rowHeight.map((h) => Math.floor(h * scale));
    const width = Math.max(SHEET.minWidth, fixedW + colPx.reduce((a, b) => a + b, 0));
    const title = heading.flatMap((line) => wrapLabel(line.text, charsFor(width - 2 * SHEET.pad, line.strong ? SHEET.titleFont : SHEET.labelFont)).map((text) => ({ text, strong: line.strong })));
    const labels = tiles.map((row) => row.map((tile, c) => labelLines(tile, charsFor(colPx[c]!), usual)));
    const needed = labels.map((row) => Math.max(1, ...row.map((lines) => lines.length)) * SHEET.labelLine + SHEET.labelGap);
    if (title.length > titleLines || needed.some((band, r) => band > bands[r]!)) {
      bands = bands.map((band, r) => Math.max(band, needed[r]!));
      titleLines = Math.max(titleLines, title.length);
      continue;
    }
    const titleHeight = titleLines * SHEET.titleLine + SHEET.gutter;
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
          label: { x, y, lines: labels[r]![c]! },
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
    const height = 2 * SHEET.pad + titleHeight + SHEET.gutter * (rows - 1) + bands.reduce((a, b) => a + b, 0) + rowPx.reduce((a, b) => a + b, 0);
    return { width, height, scale, transposed, title, tiles: placed };
  }
}

/**
 * Lay a grid of tiles out on one sheet whose edges are at most `maxEdge`: one scale for
 * every tile (so relative sizes stay true), no more than the sharpest source's density, in
 * whichever orientation gives the larger scale (the given one on a tie). Null when no scale
 * fits it at all; planSheets cuts such a grid, and one whose tiles would be unreadable.
 */
export function layoutSheet(grid: GridInput, maxEdge = MAX_EDGE): SheetLayout | null {
  const straight = layoutOnce(grid, maxEdge, false);
  const turned = layoutOnce(grid, maxEdge, true);
  if (!straight || !turned) return straight ?? turned;
  return turned.scale > straight.scale + 1e-9 ? turned : straight;
}

/** One sheet of a grid: the grid itself, or one numbered share of it. */
export interface SheetPart {
  grid: GridInput;
  layout: SheetLayout;
}

interface Piece {
  grid: GridInput;
  /** Which rows and columns it holds, as the part line says it. */
  holds: string[];
  layout: SheetLayout | null;
}

/** The rows (or columns) `indices` of a grid, with their names. */
function slice(grid: GridInput, axis: "rows" | "columns", indices: number[]): GridInput {
  if (axis === "rows") return { ...grid, tiles: indices.map((i) => grid.tiles[i]!), ...(grid.rowKeys ? { rowKeys: indices.map((i) => grid.rowKeys![i]!) } : {}) };
  return { ...grid, tiles: grid.tiles.map((row) => indices.map((i) => row[i]!)), ...(grid.colKeys ? { colKeys: indices.map((i) => grid.colKeys![i]!) } : {}) };
}

/** What a slice holds along `axis`, as a part line says it: "widths: phone, tablet". */
function holding(grid: GridInput, axis: "rows" | "columns", indices: number[]): string {
  const keys = axis === "rows" ? grid.rowKeys : grid.colKeys;
  const names = keys ? indices.map((i) => keys[i]!) : indices.map((i) => String(i + 1));
  return `${axis === "rows" ? grid.rowsAre : grid.colsAre}: ${names.join(", ")}`;
}

/** The part line of a share of a grid. */
const partLine = (index: string, of: string, holds: string[]) => `sheet ${index} of ${of}: ${holds.join("; ")}`;

const count = (grid: GridInput, axis: "rows" | "columns") => (axis === "rows" ? grid.tiles.length : Math.max(0, ...grid.tiles.map((row) => row.length)));

/**
 * The sheets a grid is drawn on, every one with both edges at most `maxEdge`: the whole
 * grid on one sheet when its tiles are readable there, else numbered sheets. Readable is
 * `minScale`, or less where nothing can reach it: the tiles' own density, or the scale the
 * piece's hardest tile gets on a sheet of its own (a card taller than the edge holds at the
 * floor); cutting further than that cannot draw any tile larger. The grid is cut along its
 * `splitBy` axis into runs of neighbouring rows (or columns), each run as long as stays
 * readable; a single row still unreadable is cut along the other axis the same way.
 * `keep` says which tiles count as a picture: a share with none is not drawn, and the others
 * are numbered among themselves.
 */
export function planSheets(grid: GridInput, keep: (tile: TileInput) => boolean = (tile) => tile.size !== null, maxEdge = MAX_EDGE, minScale = MIN_SCALE): SheetPart[] {
  // The longest part number any sheet can carry: a piece is tried with a part line never shorter than the one it is drawn with.
  const widest = "9".repeat(String(grid.tiles.flat().length).length);
  // A tile alone, under the piece's own title (its part line, the runs it names), is the largest the piece can draw it.
  const floor = (piece: Piece) => {
    const context = piece.grid.tiles.flat();
    let lowest = Math.min(minScale, densityCap(context));
    for (const tile of context) {
      const alone = layoutSheet({ ...piece.grid, tiles: [[tile]], context, part: piece.holds.length ? partLine(widest, widest, piece.holds) : undefined }, maxEdge);
      lowest = Math.min(lowest, alone?.scale ?? 0);
    }
    return lowest;
  };
  const readable = (piece: Piece): piece is Piece & { layout: SheetLayout } => piece.layout !== null && piece.layout.scale >= floor(piece) - 1e-9;
  const tryPiece = (from: GridInput, axis: "rows" | "columns", holds: string[], indices: number[]): Piece => {
    const piece = slice(from, axis, indices);
    const pieceHolds = [...holds, holding(from, axis, indices)];
    return { grid: piece, holds: pieceHolds, layout: layoutSheet({ ...piece, part: partLine(widest, widest, pieceHolds) }, maxEdge) };
  };
  // Each piece takes as many of the next rows (or columns) as stay readable together.
  const cut = (from: GridInput, axis: "rows" | "columns", holds: string[], deeper: boolean): Piece[] => {
    const n = count(from, axis);
    const other = axis === "rows" ? "columns" : "rows";
    const run = (start: number, end: number) => Array.from({ length: end - start }, (_, i) => start + i);
    const pieces: Piece[] = [];
    for (let start = 0; start < n; ) {
      let piece = tryPiece(from, axis, holds, [start]);
      let end = start + 1;
      while (end < n && readable(piece)) {
        const wider = tryPiece(from, axis, holds, run(start, end + 1));
        if (!readable(wider)) break;
        piece = wider;
        end += 1;
      }
      if (readable(piece)) pieces.push(piece);
      else if (deeper && count(piece.grid, other) > 1) pieces.push(...cut(piece.grid, other, piece.holds, false));
      else if (piece.layout) pieces.push(piece);
      else throw new Error(`${grid.title}: ${piece.holds.join("; ")} cannot be laid out within ${maxEdge} px`);
      start = end;
    }
    return pieces;
  };
  const whole: Piece = { grid, holds: [], layout: layoutSheet(grid, maxEdge) };
  if (readable(whole)) return grid.tiles.flat().some(keep) ? [{ grid, layout: whole.layout }] : [];
  const pieces = cut(grid, grid.splitBy ?? "rows", [], true).filter((piece) => piece.grid.tiles.flat().some(keep));
  return pieces.map((piece, i) => {
    const part = { ...piece.grid, part: pieces.length > 1 ? partLine(String(i + 1), String(pieces.length), piece.holds) : piece.holds.join("; ") };
    const layout = layoutSheet(part, maxEdge);
    if (!layout) throw new Error(`${grid.title}: ${part.part} cannot be laid out within ${maxEdge} px`);
    return { grid: part, layout };
  });
}

/** The file a sheet of `count` is written to: `card-solid.jpg` alone, `card-solid-2.jpg` among several. */
export function partFile(file: string, index: number, count: number): string {
  return count > 1 ? file.replace(/\.jpg$/, `-${index + 1}.jpg`) : file;
}

// --- Rendering -------------------------------------------------------------------------

/** Where a tile's picture comes from: an image file, and the part of it to show (device px), or all of it. */
export interface TileSource {
  path: string;
  crop?: { left: number; top: number; width: number; height: number };
}

const escapeXml = (text: string) => text.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[c]!);

const COLORS = { sheet: "#e6e6ea", title: "#16161c", label: "#22222a", note: "#5d5d68", warn: "#a1271d", odd: "#1f4fbf", frame: "#b9b9c2", hole: "#f6f6f8" };

const LINE_COLOR: Record<LabelLine["kind"], string> = { id: COLORS.label, commit: COLORS.note, "odd-commit": COLORS.odd, note: COLORS.note, warn: COLORS.warn };

/** The SVG laid over the composited pictures: the title, every label, every placeholder and every frame. */
export function overlaySvg(layout: SheetLayout): string {
  const parts: string[] = [];
  const font = `font-family="Menlo, Monaco, 'DejaVu Sans Mono', monospace"`;
  layout.title.forEach((line, i) => {
    parts.push(`<text x="${SHEET.pad}" y="${SHEET.pad + (i + 1) * SHEET.titleLine - 5}" ${font} font-size="${line.strong ? SHEET.titleFont : SHEET.labelFont}" fill="${line.strong ? COLORS.title : COLORS.note}" font-weight="${line.strong ? 700 : 400}">${escapeXml(line.text)}</text>`);
  });
  for (const placed of layout.tiles) {
    placed.label.lines.forEach((line, i) => {
      parts.push(`<text x="${placed.label.x}" y="${placed.label.y + (i + 1) * SHEET.labelLine - 3}" ${font} font-size="${SHEET.labelFont}" fill="${LINE_COLOR[line.kind]}"${line.kind === "odd-commit" ? ` font-weight="700"` : ""}>${escapeXml(line.text)}</text>`);
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
  /** The photograph's size in device pixels and its density, read once per cell. */
  card: { path: string; width: number; height: number; dpr: number } | null;
  rows: Partial<Record<RowPlatform, Box>>;
}

/** What a cell can contribute to a sheet: its photograph (`file`: card.png, state.png, viewport.png) and its row boxes, or why it has none. */
async function pictureOf(cell: CapturedCell | undefined, file: string = CARD_FILE): Promise<CellPicture> {
  if (!cell || cell.status === "failed" || notReached(cell)) return { cell, card: null, rows: {} };
  const path = join(cell.dir, file);
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

/** The run and commit of the capture a picture is of; none for a cell never captured. */
const captureOf = (picture: CellPicture): { capture: Capture } | Record<string, never> =>
  picture.cell ? { capture: { run: picture.cell.run.id, sha: picture.cell.run.sha, dirty: picture.cell.run.dirty } } : {};

const firstLine = (text: string | null) => (text ?? "unknown").split("\n")[0]!.slice(0, 90);

const why = (picture: CellPicture, file: string): string => {
  if (!picture.cell) return "not captured";
  if (notReached(picture.cell)) return `not reached: ${firstLine(picture.cell.error)}`;
  if (picture.cell.status === "failed") return `failed: ${firstLine(picture.cell.error)}`;
  return `no ${file}`;
};

/** A tile showing a whole photograph: a card, a state, a page's first screen. `flags` are said under it. */
export function cardTile(id: string, picture: CellPicture, sources: Map<TileInput, TileSource>, file: string = CARD_FILE, flags: string[] = []): TileInput {
  const said = flags.length ? `flags: ${flags.join(", ")}` : null;
  if (!picture.card) return { label: id, note: [why(picture, file), said].filter(Boolean).join("; "), ...captureOf(picture), size: null, density: null };
  const { path, width, height, dpr } = picture.card;
  const notes = [picture.cell?.status === "unstable" ? "unstable: kept changing between grabs" : null, said].filter(Boolean);
  const tile: TileInput = { label: id, ...(notes.length ? { note: notes.join("; ") } : {}), ...captureOf(picture), size: { width: width / dpr, height: height / dpr }, density: dpr };
  sources.set(tile, { path });
  return tile;
}

/** A tile showing one platform row of a web card, cut at its box. */
function rowTile(id: string, picture: CellPicture, platform: RowPlatform, sources: Map<TileInput, TileSource>): TileInput {
  const label = `${id} [${platform} row]`;
  const box = picture.rows[platform];
  if (!picture.card || !box) return { label, note: picture.card ? `no ${platform} row in probe.json` : why(picture, CARD_FILE), ...captureOf(picture), size: null, density: null };
  const { path, width, height, dpr } = picture.card;
  const left = Math.max(0, Math.round(box.x * dpr));
  const top = Math.max(0, Math.round(box.y * dpr));
  const crop = { left, top, width: Math.min(width - left, Math.round(box.width * dpr)), height: Math.min(height - top, Math.round(box.height * dpr)) };
  if (crop.width <= 0 || crop.height <= 0) return { label, note: "the row's box lies outside card.png", ...captureOf(picture), size: null, density: null };
  const tile: TileInput = { label, ...captureOf(picture), size: { width: crop.width / dpr, height: crop.height / dpr }, density: dpr };
  sources.set(tile, { path, crop });
  return tile;
}

export interface SheetSpec {
  /** The file name under the variant's (or the component's) sheets directory; a grid cut into several sheets numbers it (partFile). */
  file: string;
  grid: GridInput;
  sources: Map<TileInput, TileSource>;
}

const LOOK_SURFACES = LOOKS.flatMap((look) => SURFACES.map((surface) => ({ look, surface })));
const LOOK_SURFACE_KEYS = LOOK_SURFACES.map(({ look, surface }) => `${look}.${surface}`);
const WIDTH_KEYS = WIDTHS.map((w) => w.key);
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
    // Cut per width when too tall to read: a width's looks stay side by side.
    specs.push({ file: `card-${surface}.jpg`, sources, grid: { title: `${slug} / ${variant}: the web card, ${surface}`, rowsAre: "looks", colsAre: "widths", rowKeys: [...LOOKS], colKeys: WIDTH_KEYS, splitBy: "columns", tiles } });
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
      specs.push({ file: `row-${platform}-${key}.jpg`, sources, grid: { title: `${slug} / ${variant}: the browser card's ${platform} row at ${key} width`, rowsAre: "looks", colsAre: "surfaces", rowKeys: [...LOOKS], colKeys: [...SURFACES], splitBy: "rows", tiles } });
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
    specs.push({ file: "native.jpg", sources, grid: { title: `${slug} / ${variant}: the device cards`, rowsAre: "looks and surfaces", colsAre: "iOS, Android", rowKeys: LOOK_SURFACE_KEYS, colKeys: ["iOS", "Android"], splitBy: "rows", tiles } });
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
      grid: {
        title: `${slug} / ${variant}: the browser's rows (phone width) beside the devices, ${surface}`,
        rowsAre: "looks",
        colsAre: "browser iOS row, iOS device, browser Android row, Android device",
        rowKeys: [...LOOKS],
        colKeys: ["browser iOS row", "iOS device", "browser Android row", "Android device"],
        splitBy: "rows",
        tiles,
      },
    });
  }
  return specs;
}

/** The widths a component's states are laid out at, the desktop first: every state is captured there, an overlay at the other two as well. */
const STATE_WIDTHS: WidthKey[] = ["desktop", "tablet", "phone"];
/** The browser card's rows a state is reached from, in the order a reader takes them: the web's own first. */
const STATE_ROWS: RowPlatform[] = ["web", "ios", "android"];

/** The state flags and release flags a state's capture recorded: what its tile says under it. */
const stateFlagsOf = (cell: CapturedCell | undefined) => (cell ? cell.flags.filter((flag) => flag in STATE_FLAGS || flag in RELEASE_FLAGS) : []);

/**
 * The interaction-state sheets of one component (e2e/audit/state-cell.ts): one per width
 * its states were captured at (`states.jpg` the desktop's, where every state is; then
 * `states-tablet.jpg` and `states-phone.jpg`, where only the overlays are), a row per state
 * and the platform row it was reached from, in the recipes' order, by the six looks and
 * surfaces. Each tile is the state's photograph (state.png: the row with a margin, or the
 * viewport an overlay opened in), its state and release flags said under it; a state not
 * reached is a hole saying why.
 */
export async function stateSheets(slug: string, cells: CapturedCell[]): Promise<SheetSpec[]> {
  const states = cells.filter((cell) => cell.family === "state" && cell.slug === slug);
  if (!states.length) return [];
  const specs: SheetSpec[] = [];
  const rank = (cell: CapturedCell) => STATE_NAMES.indexOf(cell.state!) * STATE_ROWS.length + STATE_ROWS.indexOf(cell.row!);
  const widths = STATE_WIDTHS.filter((key) => states.some((cell) => cell.width === key));
  for (const width of widths) {
    const atWidth = states.filter((cell) => cell.width === width).sort((a, b) => rank(a) - rank(b));
    const byId = new Map(atWidth.map((cell) => [cell.id, cell]));
    const rows = [...new Map(atWidth.map((cell) => [`${cell.state}.${cell.row}`, cell])).entries()];
    const sources = new Map<TileInput, TileSource>();
    const tiles: TileInput[][] = [];
    for (const [key] of rows) {
      const row: TileInput[] = [];
      for (const { look, surface } of LOOK_SURFACES) {
        const id = `${STATES_DIR}/${slug}/${key}/${width}.${look}.${surface}`;
        const cell = byId.get(id);
        row.push(cardTile(id, await pictureOf(cell, STATE_FILE), sources, STATE_FILE, stateFlagsOf(cell)));
      }
      tiles.push(row);
    }
    specs.push({
      file: width === widths[0] ? "states.jpg" : `states-${width}.jpg`,
      sources,
      // Cut per group of states when too large to read: a state's looks and surfaces stay side by side.
      grid: {
        title: `${slug}: interaction states at ${width} width (state.row: the state, and the browser card's row it was reached from; the example in brackets)`,
        rowsAre: "states",
        colsAre: "looks and surfaces",
        rowKeys: rows.map(([key, cell]) => `${key}${cell.label ? ` (${cell.label})` : ""}`),
        colKeys: LOOK_SURFACE_KEYS,
        splitBy: "rows",
        tiles,
      },
    });
  }
  return specs;
}

/**
 * A pattern or template page's sheets (e2e/audit/page-cell.ts): its first screen
 * (viewport.png) at every width by the three looks, `viewport-solid.jpg` and
 * `viewport-glass.jpg`, cut per width when too large to read so a width's looks stay side by
 * side. Each section's own photograph is linked from the page's index.md, not drawn here.
 */
export async function pageSheets(page: string, cells: CapturedCell[]): Promise<SheetSpec[]> {
  const byId = new Map(cells.filter((cell) => cell.family === "page" && cell.platform === "web" && cell.slug === page).map((cell) => [cell.id, cell]));
  if (!byId.size) return [];
  const specs: SheetSpec[] = [];
  for (const surface of SURFACES) {
    const sources = new Map<TileInput, TileSource>();
    const tiles: TileInput[][] = [];
    for (const look of LOOKS) {
      const row: TileInput[] = [];
      for (const { key } of WIDTHS) {
        const id = `${WEB_PAGES_DIR}/${page}/${key}.${look}.${surface}`;
        row.push(cardTile(id, await pictureOf(byId.get(id), VIEWPORT_FILE), sources, VIEWPORT_FILE));
      }
      tiles.push(row);
    }
    specs.push({
      file: `viewport-${surface}.jpg`,
      sources,
      grid: { title: `${page}: the first screen, ${surface}`, rowsAre: "looks", colsAre: "widths", rowKeys: [...LOOKS], colKeys: WIDTH_KEYS, splitBy: "columns", tiles },
    });
  }
  return specs;
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
    const parts = planSheets(spec.grid, (tile) => spec.sources.has(tile));
    for (const [index, { layout }] of parts.entries()) {
      const path = join(dir, partFile(spec.file, index, parts.length));
      const bytes = await renderSheet(layout, spec.sources, path);
      results.push({ path, bytes, width: layout.width, height: layout.height, scale: layout.scale });
    }
  }
  return results;
}

/** A component's interaction-state sheet: states.jpg, states-<width>.jpg, and their numbered parts. */
export const STATE_SHEET = /^states(-[a-z]+)?(-\d+)?\.jpg$/;
/** A page's sheet: viewport-solid.jpg, viewport-glass.jpg, and their numbered parts. */
export const PAGE_SHEET = /^viewport-(solid|glass)(-\d+)?\.jpg$/;

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
    const list = bySlug.get(cell.slug);
    if (list) list.push(cell);
    else bySlug.set(cell.slug, [cell]);
  }
  type Job = { kind: "variant"; slug: string; variant: string; cells: CapturedCell[] } | { kind: "states"; slug: string; cells: CapturedCell[] } | { kind: "page"; slug: string; cells: CapturedCell[] };
  const jobs: Job[] = [];
  for (const [slug, cells] of bySlug) {
    const variants = [...new Set(cells.filter((cell) => cell.family === "variant").map((cell) => cell.variant!))]
      .sort((a, b) => (order.get(`${slug}/${a}`) ?? Infinity) - (order.get(`${slug}/${b}`) ?? Infinity) || a.localeCompare(b));
    for (const variant of variants) jobs.push({ kind: "variant", slug, variant, cells });
    if (cells.some((cell) => cell.family === "state")) jobs.push({ kind: "states", slug, cells });
    if (cells.some((cell) => cell.family === "page" && cell.platform === "web")) jobs.push({ kind: "page", slug, cells });
  }
  let failed = 0;
  const results = (await pool(jobs, 4, async (job) => {
    const base = join(ROOT, CURRENT_DIR, job.slug, "sheets");
    // A component's or page's own sheets are cleared before they are written, so a sheet whose cells are gone does not linger.
    const clear = (pattern: RegExp) => {
      for (const name of existsSync(base) ? readdirSync(base) : []) if (pattern.test(name)) rmSync(join(base, name));
    };
    try {
      if (job.kind === "states") {
        clear(STATE_SHEET);
        return await writeSheets(base, await stateSheets(job.slug, job.cells));
      }
      if (job.kind === "page") {
        clear(PAGE_SHEET);
        return await writeSheets(base, await pageSheets(job.slug, job.cells));
      }
      const dir = join(base, job.variant);
      rmSync(dir, { recursive: true, force: true });
      const byId = new Map(job.cells.map((cell) => [cell.id, cell]));
      return await writeSheets(dir, await variantSheets(job.slug, job.variant, byId));
    } catch (error) {
      failed += 1;
      console.error(`  failed   ${job.slug}${job.kind === "variant" ? `/${job.variant}` : ` ${job.kind}`}: ${(error as Error).message}`);
      return [];
    }
  })).flat();
  const ms = Date.now() - started;
  const bytes = results.reduce((n, r) => n + r.bytes, 0);
  const longest = results.reduce((n, r) => Math.max(n, r.width, r.height), 0);
  const scales = results.map((r) => r.scale).sort((a, b) => a - b);
  const counted = (kind: Job["kind"]) => jobs.filter((job) => job.kind === kind).length;
  console.log(`audit:sheets: ${results.length} sheet(s) for ${counted("variant")} variant(s), ${counted("states")} component(s)' states and ${counted("page")} page(s), from ${selection.runs.length} run(s)`);
  if (results.length) {
    console.log(`  size     ${(bytes / 1024 / 1024).toFixed(1)} MB, ${Math.round(bytes / results.length / 1024)} KB a sheet; longest edge ${longest} px; tile scale ${scales[0]!.toFixed(2)} to ${scales[scales.length - 1]!.toFixed(2)} px per layout unit (median ${scales[Math.floor(scales.length / 2)]!.toFixed(2)})`);
  }
  const numbered = results.filter((r) => /-\d+\.jpg$/.test(r.path)).length;
  if (numbered) console.log(`  cut      ${numbered} numbered sheet(s), from grids too large to read at ${MIN_SCALE} px per layout unit on one`);
  const under = results.filter((r) => r.scale < MIN_SCALE - 1e-9);
  if (under.length) console.log(`  under    ${under.length} sheet(s) under ${MIN_SCALE}: a card on them is too large to draw at ${MIN_SCALE} within ${MAX_EDGE} px even alone, and is drawn as large as it can be`);
  for (const smallest of [...results].sort((a, b) => a.scale - b.scale).slice(0, 3)) {
    console.log(`  smallest ${relative(ROOT, smallest.path)}: ${smallest.scale.toFixed(2)} px per layout unit (${smallest.width}x${smallest.height})`);
  }
  console.log(`  time     ${(ms / 1000).toFixed(1)} s`);
  console.log(`  output   ${relative(ROOT, join(ROOT, CURRENT_DIR))}/<slug>/sheets/`);
  return failed ? 1 : 0;
}

if (import.meta.main) process.exit(await main());
