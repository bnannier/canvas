import { afterEach, describe, expect, it } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { analyzeCells } from "./analyze.ts";
import { EARLIER, RUNS, checkoutWithRealRuns } from "./fixtures/real-runs.ts";
import { brokenLinks, buildIndex, builtSelection } from "./index.ts";
import { planPrune, pruneRuns, survivingSelection } from "./prune.ts";
import { currentCells, readRunCells, type AuditRun, type CapturedCell } from "./runs.ts";

const run = (id: string, startedAt: string, platform: AuditRun["platform"] = "web", finished = true): AuditRun => ({
  id, dir: `/r/${id}`, platform, startedAt, status: finished ? "complete" : "running", finished, sha: null, dirty: null, fingerprint: null, fresh: true, served: null,
});

const cellsOf = (r: AuditRun, ids: string[], minute: number): CapturedCell[] =>
  readRunCells(r, ids.map((id, i) => JSON.stringify({ id, status: "ok", flags: [], at: `2026-10-09T${String(minute).padStart(2, "0")}:00:${String(i).padStart(2, "0")}.000Z` })).join("\n")).cells;

const FULL = ["web/button/default/phone.blush.solid", "web/button/ghost/phone.blush.solid", "web/switch/default/phone.blush.solid"];
const BUTTON = ["web/button/default/phone.blush.solid"];

describe("pruning", () => {
  it("keeps the newest runs of each platform and every run holding one of a cell's newest captures", () => {
    const a = run("a-full", "2026-10-09T01:00:00Z");
    const b = run("b-full", "2026-10-09T02:00:00Z");
    const c = run("c-button", "2026-10-09T03:00:00Z");
    const d = run("d-button", "2026-10-09T04:00:00Z");
    const ios = run("ios-old", "2026-10-09T00:00:00Z", "ios");
    const cells = [...cellsOf(a, FULL, 1), ...cellsOf(b, FULL, 2), ...cellsOf(c, BUTTON, 3), ...cellsOf(d, BUTTON, 4)];
    const plan = (keep: number) => new Map(planPrune([ios, a, b, c, d], cells, { keep, candidates: null, only: null }).map((decision) => [decision.run.id, decision]));
    const two = plan(2);
    expect(two.get("d-button")!.reason).toBe("one of the newest 2 web run(s)");
    expect(two.get("c-button")!.remove).toBe(false);
    // b holds the newest capture of two cells; a the second newest of the same two.
    expect(two.get("b-full")).toMatchObject({ remove: false, reason: "holds one of the newest 2 captures of 2 cell(s) (the current one of 2)" });
    expect(two.get("a-full")).toMatchObject({ remove: false, reason: "holds one of the newest 2 captures of 2 cell(s)" });
    expect(two.get("ios-old")!.remove).toBe(false);
    const one = plan(1);
    expect(one.get("a-full")).toMatchObject({ remove: true, reason: "every one of its 3 cell(s) has 1 newer capture(s)" });
    expect(one.get("b-full")!.remove).toBe(false);
    expect(one.get("c-button")).toMatchObject({ remove: true });
  });

  it("removes a full sweep once two later sweeps cover every one of its cells", () => {
    const runs = [run("a", "2026-10-09T01:00:00Z"), run("b", "2026-10-09T02:00:00Z"), run("c", "2026-10-09T03:00:00Z")];
    const cells = runs.flatMap((r, i) => cellsOf(r, FULL, i + 1));
    const decisions = planPrune(runs, cells, { keep: 2, candidates: null, only: null });
    expect(decisions.map((decision) => [decision.run.id, decision.remove])).toEqual([["a", true], ["b", false], ["c", false]]);
  });

  it("never removes an unfinished run, and narrows to the runs named or the components named", () => {
    const runs = [run("old", "2026-10-09T01:00:00Z", "web", false), run("button-only", "2026-10-09T02:00:00Z"), run("b", "2026-10-09T03:00:00Z"), run("c", "2026-10-09T04:00:00Z"), run("empty", "2026-10-09T00:30:00Z")];
    const cells = [...cellsOf(runs[0]!, FULL, 1), ...cellsOf(runs[1]!, BUTTON, 2), ...cellsOf(runs[2]!, FULL, 3), ...cellsOf(runs[3]!, FULL, 4)];
    const all = new Map(planPrune(runs, cells, { keep: 2, candidates: null, only: null }).map((d) => [d.run.id, d]));
    expect(all.get("old")!.reason).toMatch(/^not finished \(running\)/);
    expect(all.get("button-only")!.remove).toBe(true);
    expect(all.get("empty")).toMatchObject({ remove: true, reason: "holds no cell" });
    const named = planPrune(runs, cells, { keep: 2, candidates: new Set(["empty"]), only: null }).filter((d) => d.remove).map((d) => d.run.id);
    expect(named).toEqual(["empty"]);
    const only = new Map(planPrune(runs, cells, { keep: 2, candidates: null, only: ["button"] }).map((d) => [d.run.id, d]));
    expect(only.get("button-only")!.remove).toBe(true);
    expect(only.get("b")!.reason).toBe("captured components or pages --only does not name");
    expect(only.get("empty")!.reason).toBe("holds no cell, and --only names components");
    expect(() => planPrune(runs, cells, { keep: 0, candidates: null, only: null })).toThrow(/at least 1/);
  });

  it("keeps the --run names of a built view that still name a run, and every run when none does", () => {
    const remaining = [run("20261009-110000-web-bbbbbbb", "2026-10-09T11:00:00Z"), run("20261009-120000-web-ccccccc", "2026-10-09T12:00:00Z")];
    expect(survivingSelection(null, remaining)).toBeNull();
    expect(survivingSelection(["20261009-110000", "20261009-100000-web-aaaaaaa"], remaining)).toEqual(["20261009-110000"]);
    expect(survivingSelection(["20261009-100000-web-aaaaaaa"], remaining)).toBeNull();
  });
});

describe("pruning under a built view", () => {
  let root: string | null = null;
  afterEach(() => {
    if (root) rmSync(root, { recursive: true, force: true });
    root = null;
  });

  const IDS = ["web/button/default/phone.blush.solid", "web/button/default/phone.dark.glass", "web/switch/default/desktop.mint.solid"];

  function writeRun(name: string, startedAt: string, sha: string, ids: string[]) {
    const dir = join(root!, ".audit", "runs", name);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "manifest.json"), JSON.stringify({ platform: "web", status: "complete", startedAt, source: { sha, dirty: false }, served: { mode: "static export", sourceFingerprint: sha[0]!.repeat(64), fresh: true } }));
    const at = (i: number) => new Date(Date.parse(startedAt) + (i + 1) * 1000).toISOString();
    writeFileSync(join(dir, "cells.jsonl"), ids.map((id, i) => JSON.stringify({ id, status: "ok", flags: [], at: at(i) })).join("\n"));
    for (const id of ids) {
      mkdirSync(join(dir, id), { recursive: true });
      writeFileSync(join(dir, id, "card.png"), "");
      writeFileSync(join(dir, id, "probe.json"), "{}");
    }
  }

  /** Every link of the view, checked here on its own terms: each Markdown link from its page's directory, each file and run current.json names. */
  function danglingLinks(): string[] {
    const current = join(root!, ".audit", "current");
    const dangling: string[] = [];
    const pages = [join(current, "SUMMARY.md"), ...readdirSync(current, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => join(current, e.name, "index.md")).filter(existsSync)];
    let links = 0;
    for (const page of pages) {
      for (const [, target] of readFileSync(page, "utf8").matchAll(/\]\(([^)\s]+)\)/g)) {
        links += 1;
        if (!existsSync(join(dirname(page), target!))) dangling.push(`${page}: ${target}`);
      }
    }
    const built = JSON.parse(readFileSync(join(current, "current.json"), "utf8")) as { runs: { id: string }[]; cells: { run: string; file: string | null }[] };
    for (const r of built.runs) if (!existsSync(join(root!, ".audit", "runs", r.id))) dangling.push(`current.json run ${r.id}`);
    for (const cell of built.cells) {
      links += 1;
      if (!cell.file || !existsSync(join(root!, cell.file))) dangling.push(`current.json ${cell.file}`);
      if (!existsSync(join(root!, ".audit", "runs", cell.run))) dangling.push(`current.json cell run ${cell.run}`);
    }
    expect(links).toBeGreaterThan(IDS.length);
    return dangling;
  }

  it("rebuilds the view after deleting a run it still pointed at, so no link dangles", () => {
    root = mkdtempSync(join(tmpdir(), "audit-prune-"));
    writeRun("20261009-100000-web-aaaaaaa", "2026-10-09T10:00:00.000Z", "a".repeat(40), IDS);
    const first = buildIndex(root, { runs: null, only: null }, "2026-10-09T10:30:00.000Z");
    expect(first).toMatchObject({ cells: 3, written: 2 });
    expect(builtSelection(root)).toEqual({ runs: null });
    // Two newer sweeps arrive and the view is not rebuilt: it still points at the first run.
    writeRun("20261009-110000-web-bbbbbbb", "2026-10-09T11:00:00.000Z", "b".repeat(40), IDS);
    writeRun("20261009-120000-web-ccccccc", "2026-10-09T12:00:00.000Z", "c".repeat(40), IDS);
    expect(danglingLinks()).toEqual([]);
    const view = readFileSync(join(root, ".audit", "current", "button", "index.md"), "utf8");
    expect(view).toContain("20261009-100000-web-aaaaaaa");

    const dry = pruneRuns(root, { keep: 2, only: null, runs: null, dryRun: true });
    expect(dry.decisions.filter((d) => d.remove).map((d) => d.run.id)).toEqual(["20261009-100000-web-aaaaaaa"]);
    // One run entry and three cells of current.json point into it.
    expect(dry.pointing).toBe(4);
    expect(dry.rebuilt).toBeNull();
    expect(existsSync(join(root, ".audit", "runs", "20261009-100000-web-aaaaaaa"))).toBe(true);

    const pruned = pruneRuns(root, { keep: 2, only: null, runs: null, dryRun: false });
    expect(existsSync(join(root, ".audit", "runs", "20261009-100000-web-aaaaaaa"))).toBe(false);
    expect(pruned.rebuilt).toMatchObject({ selection: null, was: null, result: { cells: 3, written: 2 } });
    expect(pruned.broken).toEqual([]);
    expect(danglingLinks()).toEqual([]);
    const rebuilt = readFileSync(join(root, ".audit", "current", "button", "index.md"), "utf8");
    expect(rebuilt).not.toContain("20261009-100000-web-aaaaaaa");
    expect(rebuilt).toContain("](../../runs/20261009-120000-web-ccccccc/web/button/default/phone.blush.solid/card.png)");
  });

  it("finds the links a run deleted by hand leaves dangling, and a whole build drops the index of a component with no cell left", () => {
    root = mkdtempSync(join(tmpdir(), "audit-prune-"));
    writeRun("20261009-100000-web-aaaaaaa", "2026-10-09T10:00:00.000Z", "a".repeat(40), [IDS[2]!]);
    writeRun("20261009-110000-web-bbbbbbb", "2026-10-09T11:00:00.000Z", "b".repeat(40), IDS.slice(0, 2));
    buildIndex(root, { runs: null, only: null });
    expect(brokenLinks(root)).toEqual([]);
    rmSync(join(root, ".audit", "runs", "20261009-100000-web-aaaaaaa"), { recursive: true });
    const broken = brokenLinks(root);
    expect(broken).toContain(".audit/current/switch/index.md -> ../../runs/20261009-100000-web-aaaaaaa/manifest.json");
    expect(broken).toContain(".audit/current/current.json -> run 20261009-100000-web-aaaaaaa");
    expect(broken).toContain(`.audit/current/current.json -> .audit/runs/20261009-100000-web-aaaaaaa/${IDS[2]}/card.png`);
    const rebuilt = buildIndex(root, { runs: null, only: null });
    expect(rebuilt.removed).toEqual([".audit/current/switch/index.md"]);
    expect(brokenLinks(root)).toEqual([]);
    expect(danglingLinks()).toEqual([]);
  });
});

describe("pruning real runs", () => {
  let root: string | null = null;
  afterEach(() => {
    if (root) rmSync(root, { recursive: true, force: true });
    root = null;
  });

  it("removes the run whose one state cell has two newer captures, and rebuilds a view of states and page sections that resolves", async () => {
    root = checkoutWithRealRuns({ earlier: true });
    await analyzeCells(currentCells(root, { only: null, runs: null }).cells, new Date("2026-10-09T18:00:00Z"));
    buildIndex(root, { runs: null, only: null }, "2026-10-09T18:00:00.000Z");
    expect(brokenLinks(root)).toEqual([]);
    const dry = pruneRuns(root, { keep: 2, only: null, runs: null, dryRun: true });
    const decisions = new Map(dry.decisions.map((decision) => [decision.run.id, decision]));
    expect(decisions.get(EARLIER[0])).toMatchObject({ remove: true, reason: "every one of its 1 cell(s) has 2 newer capture(s)" });
    expect(decisions.get(EARLIER[1])).toMatchObject({ remove: false, reason: "holds one of the newest 2 captures of 1 cell(s)" });
    expect(decisions.get(RUNS.pages)!.remove).toBe(false);
    expect(decisions.get(RUNS.states)!.remove).toBe(false);
    // The view names every run, the oldest included.
    expect(dry.pointing).toBe(1);
    const pruned = pruneRuns(root, { keep: 2, only: null, runs: null, dryRun: false });
    expect(existsSync(join(root, ".audit", "runs", EARLIER[0]))).toBe(false);
    expect(pruned.rebuilt).toMatchObject({ selection: null, result: { cells: 10, states: 7, notReached: 1 } });
    expect(pruned.broken).toEqual([]);
    const built = JSON.parse(readFileSync(join(root, ".audit", "current", "current.json"), "utf8")) as { runs: { id: string }[]; cells: { file: string | null; sections?: { file: string }[] }[] };
    expect(built.runs.map((run) => run.id)).not.toContain(EARLIER[0]);
    // Every file the rebuilt view names is there: each cell's photograph and each page section's.
    const files = built.cells.flatMap((cell) => [cell.file, ...(cell.sections ?? []).map((section) => section.file)]).filter((file): file is string => file !== null);
    expect(files.filter((file) => file.endsWith(".png"))).toHaveLength(9 + 3);
    for (const file of files) expect(existsSync(join(root, file))).toBe(true);
  });
});
