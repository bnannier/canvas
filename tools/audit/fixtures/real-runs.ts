// Real capture records for the readers' tests (runs.ts, analyze.ts, sheets.ts, index.ts,
// prune.ts). Three runs of `bun run audit:web` over a static export on 2026-10-09, cut down
// to a few cells each and otherwise copied as the runners wrote them: each run's
// manifest.json (with the checkout's absolute path replaced by `<checkout>`), the cells'
// own lines of cells.jsonl, and each cell's probe.json. No captured images are kept.
// Tests generate geometric PNG patterns in their temporary checkout, using the probes'
// dimensions and text boxes. These exercise decoding, placement and known contrast;
// they do not calibrate the analyzer against a browser's rendered pixels.
//
//   variants  web/button/default/desktop.blush.{solid,glass}
//   states    web-states/button/hover.web and pressed.web at desktop.blush.{solid,glass},
//             web-states/slider/pressed.web/desktop.blush.solid (its release flagged
//             press-not-cancelled), web-states/heatmap/pressed.web/desktop.blush.solid (not
//             reached), web-states/tooltip/open.web/phone.blush.solid (the viewport, its
//             bubble drawn in the row, flagged hover-unstable)
//   pages     web-pages/template-signin/phone.blush.glass (the first screen and three sections)
//
// earlier-runs/ holds the two captures of web-states/button/hover.web/desktop.blush.solid the
// states run replaced (the same command run twice before it, on the commits that recorded
// the region origins and the text's own opacity), for the pruner: with them a cell has three
// captures, and the oldest run holds nothing a reviewer needs.

import { cpSync, mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import sharp from "sharp";
import { ROOT } from "../../../e2e/support/routes.ts";
import { parseCssColor, type Box, type ProbeText } from "../probe-math.ts";
import { RUNS_DIR } from "../web-capture.ts";

/** Where the copied runs are, laid out as .audit/runs is. */
export const REAL_RUNS = join(ROOT, "tools", "audit", "fixtures", "runs");

/** The two earlier captures of one state cell, laid out as .audit/runs is. */
export const EARLIER_RUNS = join(ROOT, "tools", "audit", "fixtures", "earlier-runs");

/** The earlier runs, oldest first. */
export const EARLIER = ["20261009-170001-web-90fb168", "20261009-170859-web-1914767"] as const;

/** The three runs, by what they captured. */
export const RUNS = {
  variants: "20261009-171438-web-b87e514",
  states: "20261009-171726-web-b87e514",
  pages: "20261009-171819-web-b87e514",
} as const;

type Size = { width: number; height: number };
type Point = { x: number; y: number };
interface Region {
  key?: string;
  origin?: Point;
  box: Box;
  texts: ProbeText[];
  file?: string;
  clip?: Box;
}
interface FixtureProbe {
  dpr: number;
  card?: { file: string; box: Box };
  rows?: Region[];
  row?: Region;
  panel?: Region & { inRow?: boolean };
  shot?: { file: string; clip: Box | null };
  viewport: { initial?: Size; grown?: Size; size?: Size; file?: string };
  sections?: Region[];
}
type RGB = [number, number, number];

/** Deliberately simple authored test colors, unrelated to a stored screenshot. */
const PAPER: RGB = [245, 242, 254];
const BRAND: RGB = [33, 128, 75];
const LOW_CONTRAST_PANEL: RGB = [220, 220, 235];

async function syntheticPictures(path: string): Promise<void> {
  const probe = JSON.parse(readFileSync(path, "utf8")) as FixtureProbe;
  const pictures = new Map<string, { size: Size; regions: { region: Region; offset: Point }[] }>();
  const add = (file: string, size: Size, region?: Region, clip?: Box | null, card = false) => {
    const picture = pictures.get(file) ?? { size, regions: [] };
    if (region) picture.regions.push({ region, offset: card ? { x: 0, y: 0 } : { x: (region.origin?.x ?? 0) - (clip?.x ?? 0), y: (region.origin?.y ?? 0) - (clip?.y ?? 0) } });
    pictures.set(file, picture);
  };
  if (probe.card) for (const row of probe.rows ?? []) add(probe.card.file, probe.card.box, row, null, true);
  if (probe.shot) {
    const size = probe.shot.clip ?? probe.viewport.grown ?? probe.viewport.initial!;
    if (probe.row) add(probe.shot.file, size, probe.row, probe.shot.clip);
    if (probe.panel && !probe.panel.inRow) add(probe.shot.file, size, probe.panel, probe.shot.clip);
  }
  if (probe.viewport.file && probe.viewport.size) add(probe.viewport.file, probe.viewport.size);
  for (const section of probe.sections ?? []) add(section.file!, section.clip ?? section.box, section, section.clip);

  for (const [file, picture] of pictures) {
    const width = Math.ceil(picture.size.width * probe.dpr);
    const height = Math.ceil(picture.size.height * probe.dpr);
    const pixels = Buffer.alloc(width * height * 3, 255);
    const paint = (box: Box, rgb: RGB) => {
      const left = Math.max(0, Math.floor(box.x * probe.dpr));
      const top = Math.max(0, Math.floor(box.y * probe.dpr));
      const right = Math.min(width, Math.ceil((box.x + box.width) * probe.dpr));
      const bottom = Math.min(height, Math.ceil((box.y + box.height) * probe.dpr));
      for (let y = top; y < bottom; y++) for (let x = left; x < right; x++) {
        const at = (y * width + x) * 3;
        pixels[at] = rgb[0]; pixels[at + 1] = rgb[1]; pixels[at + 2] = rgb[2];
      }
    };
    for (const { region, offset } of picture.regions) for (const text of region.texts) {
      const color = parseCssColor(text.color);
      if (!color) continue;
      // The split-screen's synthetic brand panel intentionally holds four marginal
      // labels. All other unknown backdrops use paper or a solid brand fill.
      const inPanel = region.key === "splitscreen" && text.box.y >= 220 && text.box.y < 400;
      const resolved = parseCssColor(text.background);
      const background: RGB = resolved ? [resolved[0], resolved[1], resolved[2]] : color.slice(0, 3).every((c) => c === 255) ? BRAND : inPanel ? LOW_CONTRAST_PANEL : PAPER;
      const box = { ...text.box, x: text.box.x + offset.x, y: text.box.y + offset.y };
      paint(box, background);
      const alpha = color[3] * (text.colorAlpha ?? 1) * (text.ownOpacity ?? text.opacity);
      const ink = background.map((c, i) => Math.round(color[i]! * alpha + c * (1 - alpha))) as RGB;
      // A thin central stripe gives the sampler actual ink and surrounding backdrop,
      // without retaining fonts, glyphs or any encoded capture bytes.
      paint({ x: box.x + box.width / 4, y: box.y + box.height / 3, width: box.width / 2, height: box.height / 4 }, ink);
    }
    await sharp(pixels, { raw: { width, height, channels: 3 } }).png().toFile(join(dirname(path), file));
  }
}

/** A temporary checkout with captured metadata and synthetic images; the caller removes it. */
export async function checkoutWithRealRuns(options: { earlier?: boolean } = {}): Promise<string> {
  const root = mkdtempSync(join(tmpdir(), "audit-real-runs-"));
  try {
    const copy = { recursive: true, filter: (source: string) => !source.endsWith(".png") };
    cpSync(REAL_RUNS, join(root, RUNS_DIR), copy);
    if (options.earlier) cpSync(EARLIER_RUNS, join(root, RUNS_DIR), copy);
    const walk = async (dir: string): Promise<void> => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) await walk(path);
        else if (entry.name === "probe.json") await syntheticPictures(path);
      }
    };
    await walk(join(root, RUNS_DIR));
    return root;
  } catch (error) {
    rmSync(root, { recursive: true, force: true });
    throw error;
  }
}
