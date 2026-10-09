import { afterEach, describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { readRunCells, type AuditRun, type CapturedCell } from "./runs.ts";
import { MAX_EDGE, SHEET, layoutSheet, overlaySvg, renderSheet, stateSheets, variantSheets, wrapLabel, type GridInput, type SheetLayout, type TileInput } from "./sheets.ts";

const tile = (label: string, width: number, height: number, density = 2): TileInput => ({ label, size: { width, height }, density });
const hole = (label: string, note = "not captured"): TileInput => ({ label, note, size: null, density: null });
const grid = (tiles: TileInput[][]): GridInput => ({ title: "t", rowsAre: "looks", colsAre: "widths", tiles });

/** Every placed tile inside the sheet and clear of every other. */
function expectSound(layout: SheetLayout) {
  expect(Math.max(layout.width, layout.height)).toBeLessThanOrEqual(MAX_EDGE);
  for (const placed of layout.tiles) {
    const { x, y, width, height } = placed.image;
    expect(x).toBeGreaterThanOrEqual(SHEET.pad);
    expect(y).toBeGreaterThan(placed.label.y);
    expect(x + width).toBeLessThanOrEqual(layout.width - SHEET.pad);
    expect(y + height).toBeLessThanOrEqual(layout.height - SHEET.pad);
    for (const other of layout.tiles) {
      if (other === placed) continue;
      const apart = x + width <= other.image.x || other.image.x + other.image.width <= x || y + height <= other.label.y || other.image.y + other.image.height <= placed.label.y;
      expect(apart).toBe(true);
    }
  }
}

describe("labels", () => {
  it("wraps a cell id at its slashes and dots, and hard-breaks a part that cannot fit", () => {
    expect(wrapLabel("web/button/default/phone.blush.solid", 40)).toEqual(["web/button/default/phone.blush.solid"]);
    expect(wrapLabel("web/button/default/phone.blush.solid", 20)).toEqual(["web/button/default/", "phone.blush.solid"]);
    expect(wrapLabel("web/data-table/numericandcustomcolumns/phone.blush.solid", 16)).toEqual(["web/data-table/", "numericandcustom", "columns/phone.", "blush.solid"]);
  });

  it("escapes what an SVG text cannot hold", () => {
    const layout = layoutSheet(grid([[tile(`a<b>&"c'`, 100, 50)]]));
    const svg = overlaySvg(layout);
    expect(svg).toContain("a&lt;b&gt;&amp;&quot;c&apos;");
    expect(svg).not.toContain("a<b>");
  });
});

describe("sheet layout", () => {
  it("keeps every sheet's long edge within 1600 px, the tiles inside it and clear of each other", () => {
    const cases: TileInput[][][] = [
      // The web card: three widths by three looks, a tall component.
      [0, 1, 2].map(() => [tile("p", 342, 2600), tile("t", 720, 1650), tile("d", 944, 1400)]),
      // Small cards, where the density cap, not the edge, decides the scale.
      [0, 1, 2].map(() => [tile("p", 120, 40), tile("t", 120, 40)]),
      // A row of very wide tiles and a holed grid.
      [[tile("a", 5000, 100), hole("b")], [hole("c"), tile("d", 300, 3000, 3)]],
      // Twelve tiles of mixed density.
      Array.from({ length: 6 }, (_, r) => [tile(`ios${r}`, 354, 100 + r * 40, 3), tile(`android${r}`, 363, 90 + r * 40, 2.625)]),
    ];
    for (const tiles of cases) expectSound(layoutSheet(grid(tiles)));
  });

  it("scales every tile by one factor, so a phone card stays narrower than a desktop one", () => {
    const layout = layoutSheet(grid([[tile("phone", 342, 274), tile("tablet", 720, 274), tile("desktop", 944, 274)]]));
    const [phone, tablet, desktop] = layout.tiles.map((placed) => placed.image.width);
    expect(phone! / desktop!).toBeCloseTo(342 / 944, 2);
    expect(tablet! / desktop!).toBeCloseTo(720 / 944, 2);
  });

  it("never scales past the sharpest source's own density", () => {
    const layout = layoutSheet(grid([[tile("a", 100, 50, 3), tile("b", 100, 50, 2.625)]]));
    expect(layout.scale).toBe(2.625);
    expect(layout.tiles[0]!.image).toMatchObject({ width: 262, height: 131 });
  });

  it("turns a grid whose tiles would scale larger the other way round, and says so", () => {
    // Six wide, short rows: two columns of them beat six.
    const wide = Array.from({ length: 2 }, (_, c) => Array.from({ length: 6 }, (_, r) => tile(`${c}${r}`, 360, 100, 3)));
    const layout = layoutSheet({ title: "native", rowsAre: "platforms", colsAre: "looks", tiles: wide });
    expect(layout.transposed).toBe(true);
    expect(layout.title[1]).toBe("rows: looks; columns: platforms");
    expect(layout.tiles.filter((placed) => placed.row === 0)).toHaveLength(2);
    const straight = layoutSheet({ title: "native", rowsAre: "looks", colsAre: "platforms", tiles: Array.from({ length: 6 }, (_, r) => [tile(`a${r}`, 360, 100, 3), tile(`b${r}`, 360, 100, 3)]) });
    expect(straight.transposed).toBe(false);
    expect(straight.scale).toBeCloseTo(layout.scale, 6);
  });

  it("sizes a placeholder to its row and column, or to a default where they hold no picture", () => {
    const layout = layoutSheet(grid([[tile("a", 200, 100), hole("b")], [hole("c"), hole("d")]]));
    const [, b, c, d] = layout.tiles;
    expect(b!.image.height).toBe(layout.tiles[0]!.image.height);
    expect(c!.image.width).toBe(layout.tiles[0]!.image.width);
    expect(d!.image.width / layout.scale).toBeCloseTo(SHEET.placeholder.width, -1);
    expect(b!.label.lines.at(-1)).toBe("not captured");
    expect(b!.label.note).toBe(1);
  });
});

describe("drawing sheets", () => {
  let dir: string | null = null;
  afterEach(() => {
    if (dir) rmSync(dir, { recursive: true, force: true });
    dir = null;
  });

  async function card(path: string, width: number, height: number, rgb: [number, number, number]) {
    mkdirSync(join(path, ".."), { recursive: true });
    await sharp({ create: { width, height, channels: 3, background: { r: rgb[0], g: rgb[1], b: rgb[2] } } }).png().toFile(path);
  }

  it("renders a JPEG at the laid-out size with the pictures where the layout put them", async () => {
    dir = mkdtempSync(join(tmpdir(), "audit-sheets-"));
    const red = join(dir, "red.png");
    const blue = join(dir, "blue.png");
    await card(red, 400, 200, [220, 30, 40]);
    await card(blue, 400, 200, [30, 40, 220]);
    const a = tile("web/x/default/phone.blush.solid", 200, 100);
    const b = tile("web/x/default/phone.dark.solid", 200, 100);
    const layout = layoutSheet(grid([[a, b, hole("web/x/default/phone.mint.solid")]]));
    const out = join(dir, "sheet.jpg");
    const bytes = await renderSheet(layout, new Map([[a, { path: red }], [b, { path: blue, crop: { left: 0, top: 0, width: 200, height: 100 } }]]), out);
    const meta = await sharp(out).metadata();
    expect([meta.format, meta.width, meta.height]).toEqual(["jpeg", layout.width, layout.height]);
    expect(bytes).toBeGreaterThan(0);
    const { data, info } = await sharp(out).raw().toBuffer({ resolveWithObject: true });
    const at = (x: number, y: number) => [...data.subarray((y * info.width + x) * info.channels, (y * info.width + x) * info.channels + 3)];
    const centre = (i: number) => at(layout.tiles[i]!.image.x + Math.floor(layout.tiles[i]!.image.width / 2), layout.tiles[i]!.image.y + Math.floor(layout.tiles[i]!.image.height / 2));
    expect(centre(0)[0]).toBeGreaterThan(200);
    expect(centre(1)[2]).toBeGreaterThan(200);
    // The hole is the placeholder's pale fill, not a picture.
    expect(Math.min(...centre(2))).toBeGreaterThan(230);
  });

  it("builds a variant's sheets from its cells: every tile named, every missing cell a labelled hole", async () => {
    dir = mkdtempSync(join(tmpdir(), "audit-sheets-"));
    const run: AuditRun = { id: "20261009-100000-web-aaaaaaa", dir: join(dir, "web-run"), platform: "web", startedAt: "2026-10-09T10:00:00.000Z", status: "complete", finished: true, sha: null, dirty: null, fingerprint: null, fresh: true, served: null };
    const ios: AuditRun = { ...run, id: "20261009T100000Z-ios-ccccccc", dir: join(dir, "ios-run"), platform: "ios" };
    const id = "web/x/default/phone.blush.solid";
    const cellDir = join(run.dir, id);
    await card(join(cellDir, "card.png"), 400, 300, [250, 250, 250]);
    writeFileSync(join(cellDir, "probe.json"), JSON.stringify({ dpr: 2, rows: [{ platform: "ios", box: { x: 0, y: 0, width: 200, height: 50 } }, { platform: "android", box: { x: 0, y: 50, width: 200, height: 50 } }, { platform: "web", box: { x: 0, y: 100, width: 200, height: 50 } }] }));
    const nativeId = "ios/x/default/blush.solid";
    await card(join(ios.dir, nativeId, "card.png"), 600, 150, [240, 240, 240]);
    writeFileSync(join(ios.dir, nativeId, "probe.json"), JSON.stringify({ dpr: 3 }));
    const cells: CapturedCell[] = [
      ...readRunCells(run, [JSON.stringify({ id, status: "ok", flags: [] }), JSON.stringify({ id: "web/x/default/phone.dark.solid", status: "failed", error: "the example rail selected no tab", flags: [] })].join("\n")).cells,
      ...readRunCells(ios, JSON.stringify({ id: nativeId, status: "ok" })).cells,
    ];
    const specs = await variantSheets("x", "default", new Map(cells.map((cell) => [cell.id, cell])));
    expect(specs.map((spec) => spec.file)).toEqual([
      "card-solid.jpg", "card-glass.jpg",
      "row-ios-phone.jpg", "row-ios-tablet.jpg", "row-ios-desktop.jpg",
      "row-android-phone.jpg", "row-android-tablet.jpg", "row-android-desktop.jpg",
      "row-web-phone.jpg", "row-web-tablet.jpg", "row-web-desktop.jpg",
      "native.jpg", "compare.jpg", "compare-glass.jpg",
    ]);
    const bySheet = new Map(specs.map((spec) => [spec.file, spec]));
    const cardSolid = bySheet.get("card-solid.jpg")!.grid.tiles;
    expect(cardSolid[0]![0]).toMatchObject({ label: id, size: { width: 200, height: 150 }, density: 2 });
    expect(cardSolid[2]![0]).toMatchObject({ label: "web/x/default/phone.dark.solid", note: "failed: the example rail selected no tab", size: null });
    expect(cardSolid[1]![1]).toMatchObject({ label: "web/x/default/tablet.mint.solid", note: "not captured" });
    expect(bySheet.get("row-android-phone.jpg")!.grid.tiles[0]![0]).toMatchObject({ label: `${id} [android row]`, size: { width: 200, height: 50 } });
    expect([...bySheet.get("row-android-phone.jpg")!.sources.values()][0]).toEqual({ path: join(cellDir, "card.png"), crop: { left: 0, top: 100, width: 400, height: 100 } });
    expect(bySheet.get("compare.jpg")!.grid.tiles[0]!.map((t) => t.label)).toEqual([`${id} [ios row]`, nativeId, `${id} [android row]`, "android/x/default/blush.solid"]);
    expect(bySheet.get("native.jpg")!.grid.tiles[0]![0]).toMatchObject({ label: nativeId, size: { width: 200, height: 50 }, density: 3 });
    expect(bySheet.get("row-web-tablet.jpg")!.sources.size).toBe(0);
  });

  it("lays out the interaction states a component has, a state not reached as a hole", async () => {
    dir = mkdtempSync(join(tmpdir(), "audit-sheets-"));
    const run: AuditRun = { id: "20261009-100000-web-aaaaaaa", dir, platform: "web", startedAt: "2026-10-09T10:00:00.000Z", status: "complete", finished: true, sha: null, dirty: null, fingerprint: null, fresh: true, served: null };
    await card(join(dir, "web-states/select/open/phone.blush.solid/card.png"), 300, 400, [250, 250, 250]);
    const cells = readRunCells(run, [
      JSON.stringify({ id: "web-states/select/open/phone.blush.solid", status: "ok", flags: [] }),
      JSON.stringify({ id: "web-states/select/hover/phone.blush.solid", status: "state-not-reached", flags: [] }),
      JSON.stringify({ id: "web-states/select/focus/desktop.dark.glass", status: "ok", flags: ["state-not-reached"] }),
    ].join("\n")).cells;
    const specs = await stateSheets("select", cells);
    expect(specs.map((spec) => spec.file)).toEqual(["states.jpg", "states-desktop.jpg"]);
    const rows = specs[0]!.grid.tiles;
    expect(rows.map((row) => row[0]!.label)).toEqual(["web-states/select/open/phone.blush.solid", "web-states/select/hover/phone.blush.solid"]);
    expect(rows[1]![0]).toMatchObject({ note: "state not reached", size: null });
    expect(specs[1]!.grid.tiles[0]![5]).toMatchObject({ label: "web-states/select/focus/desktop.dark.glass", note: "state not reached" });
    expect(await stateSheets("select", [])).toEqual([]);
  });
});
