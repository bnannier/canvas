import { afterEach, describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { readRunCells, type AuditRun, type CapturedCell } from "./runs.ts";
import {
  MAX_EDGE,
  MIN_SCALE,
  SHEET,
  STATE_SHEET,
  commitOf,
  layoutSheet,
  overlaySvg,
  partFile,
  planSheets,
  renderSheet,
  runsLine,
  stateSheets,
  usualCommit,
  variantSheets,
  wrapLabel,
  type Capture,
  type GridInput,
  type SheetLayout,
  type TileInput,
} from "./sheets.ts";

const tile = (label: string, width: number, height: number, density = 2, capture?: Capture): TileInput => ({ label, ...(capture ? { capture } : {}), size: { width, height }, density });
const hole = (label: string, note = "not captured"): TileInput => ({ label, note, size: null, density: null });
const grid = (tiles: TileInput[][]): GridInput => ({ title: "t", rowsAre: "looks", colsAre: "widths", tiles });

/** A layout that exists. */
function laid(layout: SheetLayout | null): SheetLayout {
  expect(layout).not.toBeNull();
  return layout!;
}

/** Every placed tile inside the sheet and clear of every other, every label inside its band. */
function expectSound(layout: SheetLayout) {
  expect(Math.max(layout.width, layout.height)).toBeLessThanOrEqual(MAX_EDGE);
  expect(layout.title.length * SHEET.titleLine).toBeLessThan(layout.tiles[0]!.y);
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
    expect(placed.label.y + placed.label.lines.length * SHEET.labelLine).toBeLessThanOrEqual(y);
  }
}

describe("labels", () => {
  it("wraps a cell id at its slashes and dots, and hard-breaks a part that cannot fit", () => {
    expect(wrapLabel("web/button/default/phone.blush.solid", 40)).toEqual(["web/button/default/phone.blush.solid"]);
    expect(wrapLabel("web/button/default/phone.blush.solid", 20)).toEqual(["web/button/default/", "phone.blush.solid"]);
    expect(wrapLabel("web/data-table/numericandcustomcolumns/phone.blush.solid", 16)).toEqual(["web/data-table/", "numericandcustom", "columns/phone.", "blush.solid"]);
  });

  it("escapes what an SVG text cannot hold", () => {
    const layout = laid(layoutSheet(grid([[tile(`a<b>&"c'`, 100, 50)]])));
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
    for (const tiles of cases) expectSound(laid(layoutSheet(grid(tiles))));
  });

  it("scales every tile by one factor, so a phone card stays narrower than a desktop one", () => {
    const layout = laid(layoutSheet(grid([[tile("phone", 342, 274), tile("tablet", 720, 274), tile("desktop", 944, 274)]])));
    const [phone, tablet, desktop] = layout.tiles.map((placed) => placed.image.width);
    expect(phone! / desktop!).toBeCloseTo(342 / 944, 2);
    expect(tablet! / desktop!).toBeCloseTo(720 / 944, 2);
  });

  it("never scales past the sharpest source's own density", () => {
    const layout = laid(layoutSheet(grid([[tile("a", 100, 50, 3), tile("b", 100, 50, 2.625)]])));
    expect(layout.scale).toBe(2.625);
    expect(layout.tiles[0]!.image).toMatchObject({ width: 262, height: 131 });
  });

  it("turns a grid whose tiles would scale larger the other way round, and says so", () => {
    // Six wide, short rows: two columns of them beat six.
    const wide = Array.from({ length: 2 }, (_, c) => Array.from({ length: 6 }, (_, r) => tile(`${c}${r}`, 360, 100, 3)));
    const layout = laid(layoutSheet({ title: "native", rowsAre: "platforms", colsAre: "looks", tiles: wide }));
    expect(layout.transposed).toBe(true);
    expect(layout.title[1]).toEqual({ text: "rows: looks; columns: platforms", strong: false });
    expect(layout.tiles.filter((placed) => placed.row === 0)).toHaveLength(2);
    const straight = laid(layoutSheet({ title: "native", rowsAre: "looks", colsAre: "platforms", tiles: Array.from({ length: 6 }, (_, r) => [tile(`a${r}`, 360, 100, 3), tile(`b${r}`, 360, 100, 3)]) }));
    expect(straight.transposed).toBe(false);
    expect(straight.scale).toBeCloseTo(layout.scale, 6);
  });

  it("sizes a placeholder to its row and column, or to a default where they hold no picture", () => {
    const layout = laid(layoutSheet(grid([[tile("a", 200, 100), hole("b")], [hole("c"), hole("d")]])));
    const [, b, c, d] = layout.tiles;
    expect(b!.image.height).toBe(layout.tiles[0]!.image.height);
    expect(c!.image.width).toBe(layout.tiles[0]!.image.width);
    expect(d!.image.width / layout.scale).toBeCloseTo(SHEET.placeholder.width, -1);
    expect(b!.label.lines.at(-1)).toEqual({ text: "not captured", kind: "note" });
  });
});

describe("cutting a sheet too large to read", () => {
  const LOOK_SURFACES = ["blush.solid", "blush.glass", "mint.solid", "mint.glass", "dark.solid", "dark.glass"];
  const at = (run: string, sha: string, dirty = false): Capture => ({ run, sha: sha.padEnd(40, "0"), dirty });
  const web = at("20261009-135735-web-00d04a7", "00d04a7", true);
  const fresh = at("20261009-155447-web-ac1ad55", "ac1ad55", true);

  /** Every tile of `grid` on exactly one sheet, every sheet sound. */
  function expectCovered(grid: GridInput, parts: { grid: GridInput; layout: SheetLayout }[]) {
    for (const part of parts) expectSound(part.layout);
    const drawn = parts.flatMap((part) => part.layout.tiles.map((placed) => placed.tile));
    expect(new Set(drawn).size).toBe(drawn.length);
    expect(new Set(drawn)).toEqual(new Set(grid.tiles.flat()));
  }

  it("cuts eight states by six looks of the tallest real card into one sheet per state, within the edge", () => {
    // data-table's stacked card at phone width is 342 x 2362 CSS px, the tallest the runs hold.
    const states = ["default/hover", "default/focus", "default/pressed", "default/open", "default/invalid", "default/disabled", "numericandcustomcolumns/hover", "numericandcustomcolumns/focus"];
    const grid: GridInput = {
      title: "data-table: interaction states at phone width",
      rowsAre: "states",
      colsAre: "looks and surfaces",
      rowKeys: states,
      colKeys: LOOK_SURFACES,
      splitBy: "rows",
      tiles: states.map((state) => LOOK_SURFACES.map((leaf) => tile(`web-states/data-table/${state}/phone.${leaf}`, 342, 2362, 2, web))),
    };
    // On one sheet the 1600 px edge holds only by drawing them at a fraction of a pixel a CSS px.
    const whole = layoutSheet(grid);
    if (whole) {
      expect(Math.max(whole.width, whole.height)).toBeLessThanOrEqual(MAX_EDGE);
      expect(whole.scale).toBeLessThan(0.1);
    }
    const parts = planSheets(grid);
    expect(parts.map((part) => part.grid.part)).toEqual(states.map((state, i) => `sheet ${i + 1} of 8: states: ${state}`));
    expectCovered(grid, parts);
    for (const part of parts) {
      expect(part.layout.tiles).toHaveLength(6);
      // As large as the card can be drawn at all: the hardest of its tiles on a sheet of its own is no larger.
      const alone = Math.min(...part.grid.tiles.flat().map((t) => laid(layoutSheet({ ...part.grid, tiles: [[t]] })).scale));
      expect(part.layout.scale).toBeGreaterThanOrEqual(alone - 1e-9);
      expect(part.layout.scale).toBeGreaterThan(0.59);
      expect(part.layout.title.map((line) => line.text).join(" ")).toContain("states: ");
    }
  });

  it("cuts a tall card's card sheet per width, keeping a width's looks side by side, and a width still too wide by looks", () => {
    // data-table's stacked card: phone 342 x 2362, tablet 720 x 1612, desktop 944 x 1324.
    const sizes = [[342, 2362], [720, 1612], [944, 1324]] as const;
    const looks = ["blush", "mint", "dark"];
    const grid: GridInput = {
      title: "data-table / stacked: the web card, solid",
      rowsAre: "looks",
      colsAre: "widths",
      rowKeys: looks,
      colKeys: ["phone", "tablet", "desktop"],
      splitBy: "columns",
      // Mint from an older run than blush and dark, as a partial re-capture leaves it: the title names both runs.
      tiles: looks.map((look) => sizes.map(([w, h], c) => tile(`web/data-table/stacked/${["phone", "tablet", "desktop"][c]}.${look}.solid`, w, h, 2, look === "mint" ? web : fresh))),
    };
    expect(laid(layoutSheet(grid)).scale).toBeLessThan(MIN_SCALE);
    const parts = planSheets(grid);
    expect(parts.map((part) => part.grid.part)).toEqual([
      "sheet 1 of 4: widths: phone",
      "sheet 2 of 4: widths: tablet",
      "sheet 3 of 4: widths: desktop; looks: blush, mint",
      "sheet 4 of 4: widths: desktop; looks: dark",
    ]);
    expectCovered(grid, parts);
    // The phone's three looks stay on one sheet: drawn one alone under the same title, a card is no larger.
    expect(parts[0]!.layout.tiles).toHaveLength(3);
    expect(parts[0]!.layout.scale).toBeGreaterThan(0.59);
    expect(parts[0]!.layout.title.map((line) => line.text).join(" ")).toContain("from 2 runs at 2 commits");
    for (const part of parts.slice(1)) expect(part.layout.scale).toBeGreaterThanOrEqual(MIN_SCALE);
  });

  it("draws a grid readable on one sheet on one, and leaves out a share with no picture", () => {
    const small: GridInput = { ...grid([[tile("a", 342, 274), tile("b", 720, 274)], [tile("c", 342, 274), tile("d", 720, 274)]]), splitBy: "columns" };
    const parts = planSheets(small);
    expect(parts).toHaveLength(1);
    expect(parts[0]!.grid.part).toBeUndefined();
    expect(planSheets(grid([[hole("x")]]))).toEqual([]);
    // Two widths of a tall card where only the phone has a picture: one sheet, saying what it holds.
    const tall: GridInput = { ...grid([[tile("p", 342, 2362), hole("t")], [tile("p2", 342, 2362), hole("t2")], [tile("p3", 342, 2362), hole("t3")], [tile("p4", 342, 2362), hole("t4")]]), colKeys: ["phone", "tablet"], splitBy: "columns" };
    const only = planSheets(tall);
    expect(only.map((part) => part.grid.part)).toEqual(["widths: phone"]);
  });

  it("numbers the files of a cut sheet, and knows them for a component's states", () => {
    expect(partFile("card-solid.jpg", 0, 1)).toBe("card-solid.jpg");
    expect(partFile("card-solid.jpg", 1, 4)).toBe("card-solid-2.jpg");
    for (const name of ["states.jpg", "states-desktop.jpg", "states-3.jpg", "states-tablet-2.jpg"]) expect(STATE_SHEET.test(name)).toBe(true);
    expect(STATE_SHEET.test("card-solid.jpg")).toBe(false);
  });
});

describe("the commit on every tile", () => {
  const ios = { run: "20261009T113232Z-ios-3ebafe3", sha: "3ebafe33b42cd537b076b2d6f28a83affc519bc0", dirty: false };
  const oldAndroid = { run: "20261009T113232Z-android-3ebafe3", sha: "3ebafe33b42cd537b076b2d6f28a83affc519bc0", dirty: false };
  const newAndroid = { run: "20261009T131032Z-android-7196be8", sha: "7196be852cbdeb442f13d5f710cf67c39850f2cb", dirty: false };
  const web = { run: "20261009-135735-web-00d04a7", sha: "00d04a76d21d390871cc4168cedb9f18209c083f", dirty: true };

  it("names a capture's commit, dirty when the checkout had changes", () => {
    expect(commitOf(web)).toBe("00d04a7 dirty");
    expect(commitOf(ios)).toBe("3ebafe3");
    expect(commitOf({ run: "r", sha: null, dirty: null })).toBe("unknown commit");
  });

  it("lists the runs a sheet draws from, and marks the tiles whose commit is not the sheet's usual one", () => {
    // button / default compare: the browser rows from one run, iOS and one Android look from 3ebafe3, two Android looks re-captured at 7196be8.
    const rows = ["blush", "mint", "dark"].map((look, r) => [
      tile(`web/button/default/phone.${look}.solid [ios row]`, 342, 120, 2, web),
      tile(`ios/button/default/${look}.solid`, 354, 238, 3, ios),
      tile(`web/button/default/phone.${look}.solid [android row]`, 342, 120, 2, web),
      tile(`android/button/default/${look}.solid`, 363, 186, 2.625, r === 0 ? oldAndroid : newAndroid),
    ]);
    const all = rows.flat();
    expect(runsLine(all)).toBe("from 4 runs at 3 commits: 20261009-135735-web-00d04a7 (dirty), 20261009T113232Z-android-3ebafe3, 20261009T113232Z-ios-3ebafe3, 20261009T131032Z-android-7196be8");
    expect(usualCommit(all)).toBe("00d04a7 dirty");
    expect(usualCommit([tile("a", 1, 1, 1, ios)])).toBeNull();
    const layout = laid(layoutSheet({ title: "button / default: compare", rowsAre: "looks", colsAre: "browser iOS row, iOS device, browser Android row, Android device", tiles: rows }));
    expect(layout.title.map((line) => line.text).join(" ")).toContain("from 4 runs at 3 commits: 20261009-135735-web-00d04a7 (dirty),");
    const commitLine = (label: string) => layout.tiles.find((placed) => placed.tile.label === label)!.label.lines.find((line) => line.kind !== "id")!;
    expect(commitLine("web/button/default/phone.blush.solid [ios row]")).toEqual({ text: "commit 00d04a7 dirty", kind: "commit" });
    expect(commitLine("ios/button/default/blush.solid")).toEqual({ text: "commit 3ebafe3", kind: "odd-commit" });
    expect(commitLine("android/button/default/mint.solid")).toEqual({ text: "commit 7196be8", kind: "odd-commit" });
    expect(overlaySvg(layout)).toContain(">commit 7196be8</text>");
    // A sheet of one commit marks nothing.
    const one = laid(layoutSheet(grid([[tile("a", 100, 50, 2, web), tile("b", 100, 50, 2, web)]])));
    expect(one.tiles.flatMap((placed) => placed.label.lines).filter((line) => line.kind === "odd-commit")).toEqual([]);
    expect(one.title.at(-1)!.text).toBe("from 1 run at 1 commit: 20261009-135735-web-00d04a7 (dirty)");
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
    const layout = laid(layoutSheet(grid([[a, b, hole("web/x/default/phone.mint.solid")]])));
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
    expect(cardSolid[0]![0]).toMatchObject({ label: id, capture: { run: run.id, sha: null, dirty: null }, size: { width: 200, height: 150 }, density: 2 });
    expect(cardSolid[1]![0]!.capture).toBeUndefined();
    expect(cardSolid[2]![0]).toMatchObject({ label: "web/x/default/phone.dark.solid", note: "failed: the example rail selected no tab", capture: { run: run.id }, size: null });
    expect(cardSolid[1]![1]).toMatchObject({ label: "web/x/default/tablet.mint.solid", note: "not captured" });
    expect(bySheet.get("row-android-phone.jpg")!.grid.tiles[0]![0]).toMatchObject({ label: `${id} [android row]`, size: { width: 200, height: 50 } });
    expect([...bySheet.get("row-android-phone.jpg")!.sources.values()][0]).toEqual({ path: join(cellDir, "card.png"), crop: { left: 0, top: 100, width: 400, height: 100 } });
    expect(bySheet.get("compare.jpg")!.grid.tiles[0]!.map((t) => t.label)).toEqual([`${id} [ios row]`, nativeId, `${id} [android row]`, "android/x/default/blush.solid"]);
    expect(bySheet.get("native.jpg")!.grid.tiles[0]![0]).toMatchObject({ label: nativeId, capture: { run: ios.id }, size: { width: 200, height: 50 }, density: 3 });
    expect(bySheet.get("card-solid.jpg")!.grid).toMatchObject({ splitBy: "columns", colKeys: ["phone", "tablet", "desktop"], rowKeys: ["blush", "mint", "dark"] });
    expect(bySheet.get("compare.jpg")!.grid.splitBy).toBe("rows");
    expect(runsLine(bySheet.get("compare.jpg")!.grid.tiles.flat())).toBe(`from 2 runs at 1 commit: ${run.id}, ${ios.id}`);
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
