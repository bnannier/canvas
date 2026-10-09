import { afterEach, describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  capturesById,
  checkOnly,
  cellMatches,
  currentCells,
  describeRun,
  groupKey,
  listRuns,
  notReached,
  parseCellId,
  parseRunName,
  parseToolArgs,
  pickRuns,
  readRunCells,
  recipeRank,
  selectCurrent,
  unknownNames,
  type AuditRun,
} from "./runs.ts";
import { RUNS, checkoutWithRealRuns } from "./fixtures/real-runs.ts";

const run = (id: string, startedAt: string, platform: AuditRun["platform"] = "web"): AuditRun => ({
  id, dir: `/runs/${id}`, platform, startedAt, status: "complete", finished: true, sha: "a".repeat(40), dirty: false, fingerprint: "f".repeat(64), fresh: true, served: "static export",
});

describe("cell ids", () => {
  // Ids as the runners write them: the web variant runner (e2e/audit/cell.ts), the state and
  // page runners (state-cell.ts, page-cell.ts) and the native host, each taken from a run.
  it("reads every family's layout", () => {
    expect(parseCellId("web/button/default/phone.blush.solid")).toEqual({
      id: "web/button/default/phone.blush.solid", family: "variant", platform: "web", slug: "button", variant: "default", state: null, recipe: null, row: null, width: "phone", look: "blush", surface: "solid",
    });
    expect(parseCellId("ios/switch/default/dark.glass")).toMatchObject({ family: "variant", platform: "ios", slug: "switch", variant: "default", width: null, look: "dark", surface: "glass" });
    expect(parseCellId("web-states/tooltip/open.android/phone.mint.solid")).toEqual({
      id: "web-states/tooltip/open.android/phone.mint.solid", family: "state", platform: "web", slug: "tooltip", variant: null, state: "open", recipe: "open", row: "android", width: "phone", look: "mint", surface: "solid",
    });
    expect(parseCellId("web-states/button/pressed.web/desktop.dark.glass")).toMatchObject({ family: "state", state: "pressed", recipe: "pressed", row: "web", width: "desktop" });
    // A state a component has several recipes of names each for its example.
    expect(parseCellId("web-states/dropdown/disabled-disableditem.web/desktop.blush.solid")).toMatchObject({ family: "state", state: "disabled", recipe: "disabled-disableditem", row: "web", width: "desktop" });
    expect(parseCellId("web-pages/template-signin/phone.blush.glass")).toEqual({
      id: "web-pages/template-signin/phone.blush.glass", family: "page", platform: "web", slug: "template-signin", variant: null, state: null, recipe: null, row: null, width: "phone", look: "blush", surface: "glass",
    });
    expect(parseCellId("android-pages/pattern-glass/dark.glass")).toMatchObject({ family: "page", platform: "android", slug: "pattern-glass", width: null });
  });

  it("refuses an id that follows no layout", () => {
    for (const id of [
      "web/button/phone.blush.solid",
      "web/button/default/huge.blush.solid",
      "web/button/default/phone.teal.solid",
      "ios/button/default/phone.blush.solid",
      "mac/button/default/blush.solid",
      "web/button//phone.blush.solid",
      // A state with no row, a row no card has, a state the recipes do not name, a variant in a state's path.
      "web-states/select/open/tablet.mint.solid",
      "web-states/select/open.watch/tablet.mint.solid",
      "web-states/select/dragged.web/tablet.mint.solid",
      "web-states/dropdown/dragged-disableditem.web/desktop.blush.solid",
      "web-states/dropdown/disabled-.web/desktop.blush.solid",
      "web-states/dropdown/disabled-Disabled-Item.web/desktop.blush.solid",
      "web-states/button/outline/hover.web/desktop.dark.glass",
      "ios-states/button/hover.web/dark.glass",
      // A page's sections are files of its cell, never a level of its path.
      "web-pages/template-signin/centeredcard/phone.blush.glass",
      "android-pages/pattern-glass/hero/dark.glass",
    ]) {
      expect(parseCellId(id)).toBeNull();
    }
  });

  it("ranks a state cell's recipe in the state table's order, and a recipe the table no longer has at -1", () => {
    const rank = (id: string) => recipeRank(parseCellId(id)!);
    // Dropdown's states in capture order: hover, focus, pressed, open, then its two disabled recipes.
    expect(["hover", "focus", "pressed", "open", "disabled-disabledtrigger", "disabled-disableditem"].map((name) => rank(`web-states/dropdown/${name}.web/desktop.blush.solid`))).toEqual([0, 1, 2, 3, 4, 5]);
    // The name its one disabled recipe had before the second, and a state it has no recipe of.
    expect(rank("web-states/dropdown/disabled.web/desktop.blush.solid")).toBe(-1);
    expect(rank("web-states/dropdown/invalid.web/desktop.blush.solid")).toBe(-1);
    expect(rank("web-states/button/disabled.web/desktop.blush.solid")).toBe(3);
  });

  it("groups a cell with its looks and surfaces at its width", () => {
    expect(groupKey(parseCellId("web/button/default/phone.blush.solid")!)).toBe("web/button/default/phone");
    expect(groupKey(parseCellId("web/button/default/phone.dark.glass")!)).toBe("web/button/default/phone");
    expect(groupKey(parseCellId("ios/button/default/dark.glass")!)).toBe("ios/button/default/native");
    expect(groupKey(parseCellId("web-states/tooltip/open.ios/tablet.dark.glass")!)).toBe("web-states/tooltip/open.ios/tablet");
    expect(groupKey(parseCellId("web-pages/template-signin/desktop.mint.solid")!)).toBe("web-pages/template-signin/desktop");
  });
});

describe("runs", () => {
  it("reads both stamps a run directory can carry", () => {
    expect(parseRunName("20261009-135735-web-00d04a7")).toEqual({ startedAt: "2026-10-09T13:57:35.000Z", platform: "web", sha7: "00d04a7" });
    expect(parseRunName("20261009T113232Z-ios-3ebafe3")).toEqual({ startedAt: "2026-10-09T11:32:32.000Z", platform: "ios", sha7: "3ebafe3" });
    expect(parseRunName("20261009T113232Z-web-3ebafe3")).toBeNull();
    expect(parseRunName("notes")).toBeNull();
  });

  it("reads the web runner's and the native host's manifests", () => {
    const web = describeRun("20261009-135735-web-00d04a7", "/d", {
      platform: "web", status: "complete", startedAt: "2026-10-09T13:57:35.576Z", source: { sha: "00d04a7".padEnd(40, "0"), dirty: true },
      served: { mode: "static export", sourceFingerprint: "d".repeat(64), fresh: true, checkout: { fingerprint: "c".repeat(64) } },
    })!;
    expect(web).toMatchObject({ platform: "web", startedAt: "2026-10-09T13:57:35.576Z", finished: true, dirty: true, fingerprint: "d".repeat(64), fresh: true, served: "static export" });
    const dev = describeRun("20261009-135735-web-00d04a7", "/d", { platform: "web", status: "complete", served: { mode: "live dev server", sourceFingerprint: null, checkout: { fingerprint: "c".repeat(64) } } })!;
    expect(dev.fingerprint).toBe("c".repeat(64));
    expect(dev.startedAt).toBe("2026-10-09T13:57:35.000Z");
    const native = describeRun("20261009T113232Z-ios-3ebafe3", "/d", {
      platform: "ios", sourceRevision: "3".repeat(40), sourceFingerprint: "4".repeat(64), started: "2026-10-09T11:32:35.300Z", finished: "2026-10-09T11:49:37.564Z",
      device: { name: "Canvas Audit", model: "iPhone-17-Pro", os: "iOS 27.0" }, refused: null, abandoned: null,
    })!;
    expect(native).toMatchObject({ platform: "ios", status: "complete", finished: true, sha: "3".repeat(40), fingerprint: "4".repeat(64), served: "Canvas Audit, iPhone-17-Pro, iOS 27.0" });
    expect(describeRun("20261009T113232Z-ios-3ebafe3", "/d", { platform: "ios", started: "x", finished: null })!.status).toBe("running");
    expect(describeRun("20261009T113232Z-ios-3ebafe3", "/d", { platform: "ios", started: "x", finished: "y", refused: "stale" })!.status).toBe("refused");
  });

  it("picks runs by name or by a prefix that names one", () => {
    const runs = [run("20261009-100000-web-aaaaaaa", "2026-10-09T10:00:00Z"), run("20261009-110000-web-bbbbbbb", "2026-10-09T11:00:00Z"), run("20261009T120000Z-ios-ccccccc", "2026-10-09T12:00:00Z", "ios")];
    expect(pickRuns(runs, ["20261009-11"]).map((r) => r.id)).toEqual(["20261009-110000-web-bbbbbbb"]);
    expect(pickRuns(runs, ["20261009T120000Z-ios-ccccccc", "20261009-10"]).map((r) => r.id)).toEqual(["20261009-100000-web-aaaaaaa", "20261009T120000Z-ios-ccccccc"]);
    expect(() => pickRuns(runs, ["20261009-1"])).toThrow(/starts 2 runs/);
    expect(() => pickRuns(runs, ["nope"])).toThrow(/no run/);
  });
});

describe("cells and the newest capture of each", () => {
  const line = (id: string, extra: Record<string, unknown> = {}) => JSON.stringify({ id, status: "ok", flags: [], ...extra });

  it("reads cells.jsonl, the last record of an id winning and a torn line counted", () => {
    const r = run("20261009-100000-web-aaaaaaa", "2026-10-09T10:00:00.000Z");
    const text = [line("web/button/default/phone.blush.solid", { status: "failed", error: "boom", at: "2026-10-09T10:00:01.000Z" }), line("web/button/default/phone.blush.solid", { at: "2026-10-09T10:00:05.000Z", flags: ["axe"] }), "not json", line("mystery/cell"), '{"id":"web/button/def'].join("\n");
    const read = readRunCells(r, text);
    expect(read.unreadable).toBe(2);
    expect(read.unknown).toEqual(["mystery/cell"]);
    expect(read.cells).toHaveLength(1);
    expect(read.cells[0]).toMatchObject({ status: "ok", flags: ["axe"], capturedAt: "2026-10-09T10:00:05.000Z", line: 2, dir: "/runs/20261009-100000-web-aaaaaaa/web/button/default/phone.blush.solid" });
  });

  it("takes the native host's `reason` as the error and the run's start where a record has no time", () => {
    const r = run("20261009T120000Z-ios-ccccccc", "2026-10-09T12:00:00.000Z", "ios");
    const [cell] = readRunCells(r, JSON.stringify({ id: "ios/button/default/blush.solid", status: "failed", reason: "verify: wrong route", attempts: 2 })).cells;
    expect(cell).toMatchObject({ error: "verify: wrong route", capturedAt: "2026-10-09T12:00:00.000Z" });
  });

  it("selects the newest capture of every cell across runs: a partial re-capture replaces only its cells", () => {
    const full = run("20261009-100000-web-aaaaaaa", "2026-10-09T10:00:00.000Z");
    const partial = run("20261009-110000-web-bbbbbbb", "2026-10-09T11:00:00.000Z");
    const ids = ["web/button/default/phone.blush.solid", "web/button/outline/phone.blush.solid", "web/switch/default/phone.blush.solid"];
    const a = readRunCells(full, ids.map((id, i) => line(id, { at: `2026-10-09T10:00:0${i}.000Z` })).join("\n")).cells;
    const b = readRunCells(partial, line(ids[0]!, { at: "2026-10-09T11:00:01.000Z", status: "failed", error: "x" })).cells;
    const current = selectCurrent([...b, ...a]);
    expect(current.map((cell) => [cell.id, cell.run.id, cell.status])).toEqual([
      [ids[0], partial.id, "failed"],
      [ids[1], full.id, "ok"],
      [ids[2], full.id, "ok"],
    ]);
    expect(capturesById([...a, ...b]).get(ids[0]!)!.map((cell) => cell.run.id)).toEqual([partial.id, full.id]);
  });

  it("orders by the record's time before the run's start, so an overlapping run's earlier cell does not win", () => {
    const early = run("20261009-100000-web-aaaaaaa", "2026-10-09T10:00:00.000Z");
    const late = run("20261009-100500-web-bbbbbbb", "2026-10-09T10:05:00.000Z");
    const id = "web/button/default/phone.blush.solid";
    const fromEarly = readRunCells(early, line(id, { at: "2026-10-09T10:30:00.000Z" })).cells;
    const fromLate = readRunCells(late, line(id, { at: "2026-10-09T10:06:00.000Z" })).cells;
    expect(selectCurrent([...fromLate, ...fromEarly])[0]!.run.id).toBe(early.id);
  });

  it("refuses an --only name no component or page has", () => {
    const known = { components: ["button", "switch"], pages: [{ id: "template-signin", slug: "signin" }] };
    expect(unknownNames(["button", "signin", "template-signin", "buton"], known)).toEqual(["buton"]);
    expect(() => checkOnly(["button", "no-such-thing"])).toThrow('--only: no component or page is called "no-such-thing"');
    expect(() => checkOnly(["button", "template-signin"])).not.toThrow();
  });

  it("narrows to components, and to pages by id or by slug", () => {
    expect(cellMatches({ slug: "button", family: "variant" }, ["button"])).toBe(true);
    expect(cellMatches({ slug: "button-group", family: "variant" }, ["button"])).toBe(false);
    expect(cellMatches({ slug: "template-signin", family: "page" }, ["signin"])).toBe(true);
    expect(cellMatches({ slug: "template-signin", family: "page" }, ["template-signin"])).toBe(true);
    expect(cellMatches({ slug: "x", family: "variant" }, null)).toBe(true);
  });
});

describe("the shared flags", () => {
  it("reads --only, --run, --keep and --dry-run where a command takes them", () => {
    expect(parseToolArgs(["--", "--only=button, switch", "--run", "20261009-1"])).toMatchObject({ only: ["button", "switch"], runs: ["20261009-1"], errors: [] });
    expect(parseToolArgs(["--keep=2"]).errors).toEqual(["unknown flag --keep"]);
    expect(parseToolArgs(["--keep=3", "--dry-run"], ["keep", "dry-run"])).toMatchObject({ keep: 3, dryRun: true, errors: [] });
    expect(parseToolArgs(["--keep=0"], ["keep"]).errors).toEqual(['--keep must be a positive integer, not "0"']);
    expect(parseToolArgs(["--only"]).errors).toEqual(["--only needs a value"]);
    expect(parseToolArgs(["stray"]).errors).toEqual(['unexpected argument "stray"']);
    expect(parseToolArgs(["--help"]).help).toBe(true);
  });
});

describe("reading a checkout's runs", () => {
  let root: string | null = null;
  afterEach(() => {
    if (root) rmSync(root, { recursive: true, force: true });
    root = null;
  });

  it("lists the runs, oldest first, and selects the current cells from them", () => {
    root = mkdtempSync(join(tmpdir(), "audit-runs-"));
    const write = (name: string, manifest: object | null, lines: object[]) => {
      const dir = join(root!, ".audit", "runs", name);
      mkdirSync(dir, { recursive: true });
      if (manifest) writeFileSync(join(dir, "manifest.json"), JSON.stringify(manifest));
      writeFileSync(join(dir, "cells.jsonl"), lines.map((l) => JSON.stringify(l)).join("\n"));
    };
    write("20261009-110000-web-bbbbbbb", { platform: "web", status: "complete", startedAt: "2026-10-09T11:00:00.000Z" }, [{ id: "web/button/default/phone.blush.solid", status: "ok", flags: [], at: "2026-10-09T11:00:01.000Z" }]);
    write("20261009-100000-web-aaaaaaa", { platform: "web", status: "complete", startedAt: "2026-10-09T10:00:00.000Z" }, [
      { id: "web/button/default/phone.blush.solid", status: "ok", flags: ["axe"], at: "2026-10-09T10:00:01.000Z" },
      { id: "web/switch/default/phone.blush.solid", status: "ok", flags: [], at: "2026-10-09T10:00:02.000Z" },
    ]);
    write("20261009T090000Z-ios-ccccccc", null, [{ id: "ios/button/default/blush.solid", status: "ok", attempts: 1 }]);
    mkdirSync(join(root, ".audit", "runs", "scratch"));
    const listed = listRuns(root);
    expect(listed.runs.map((r) => r.id)).toEqual(["20261009T090000Z-ios-ccccccc", "20261009-100000-web-aaaaaaa", "20261009-110000-web-bbbbbbb"]);
    expect(listed.runs[0]!.status).toBe("unknown");
    const all = currentCells(root, { only: null, runs: null });
    expect(all.cells.map((c) => `${c.id} ${c.run.id}`)).toEqual([
      "ios/button/default/blush.solid 20261009T090000Z-ios-ccccccc",
      "web/button/default/phone.blush.solid 20261009-110000-web-bbbbbbb",
      "web/switch/default/phone.blush.solid 20261009-100000-web-aaaaaaa",
    ]);
    expect(currentCells(root, { only: ["switch"], runs: null }).cells.map((c) => c.id)).toEqual(["web/switch/default/phone.blush.solid"]);
    expect(currentCells(root, { only: null, runs: ["20261009-10"] }).cells.map((c) => `${c.id} ${c.run.id}`)).toEqual([
      "web/button/default/phone.blush.solid 20261009-100000-web-aaaaaaa",
      "web/switch/default/phone.blush.solid 20261009-100000-web-aaaaaaa",
    ]);
  });
});

describe("reading real runs", () => {
  let root: string | null = null;
  afterEach(() => {
    if (root) rmSync(root, { recursive: true, force: true });
    root = null;
  });

  it("reads the variant, state and page runners' records as they write them", () => {
    root = checkoutWithRealRuns();
    const listed = listRuns(root);
    expect(listed.problems).toEqual([]);
    expect(listed.runs.map((run) => [run.id, run.status, run.served, run.fresh])).toEqual([
      [RUNS.variants, "complete", "static export", true],
      [RUNS.states, "complete", "static export", true],
      [RUNS.pages, "complete", "static export", true],
    ]);
    const { cells, problems } = currentCells(root, { only: null, runs: null });
    expect(problems).toEqual([]);
    const byId = new Map(cells.map((cell) => [cell.id, cell]));
    // A state's example comes from its record, since its id names only the state and the row.
    expect(byId.get("web-states/tooltip/open.web/phone.blush.solid")).toMatchObject({ family: "state", state: "open", row: "web", variant: "onhover", label: "On hover", width: "phone", status: "ok", flags: ["hover-unstable"] });
    expect(byId.get("web-states/slider/pressed.web/desktop.blush.solid")).toMatchObject({ flags: ["press-not-cancelled"] });
    // A state not reached: its status, and the recipe's reason as the cell's error.
    const heatmap = byId.get("web-states/heatmap/pressed.web/desktop.blush.solid")!;
    expect(heatmap).toMatchObject({ family: "state", status: "state-not-reached", variant: "calendar", label: "Calendar" });
    expect(notReached(heatmap)).toBe(true);
    expect(heatmap.error).toStartWith("pressing [role=\"img\"]");
    // A page cell holds every section; its id names the page alone.
    expect(byId.get("web-pages/template-signin/phone.blush.glass")).toMatchObject({ family: "page", slug: "template-signin", variant: null, state: null, width: "phone" });
    expect(byId.get("web/button/default/desktop.blush.glass")).toMatchObject({ family: "variant", variant: "default", label: null });
    // --only takes a page by its slug, and a component's states with its variants.
    expect(currentCells(root, { only: ["signin"], runs: null }).cells.map((cell) => cell.id)).toEqual(["web-pages/template-signin/phone.blush.glass"]);
    expect(currentCells(root, { only: ["button"], runs: null }).cells.map((cell) => cell.family).sort()).toEqual(["state", "state", "state", "state", "variant", "variant"]);
  });
});
