import { describe, expect, it } from "bun:test";
import { planPrune } from "./prune.ts";
import { readRunCells, type AuditRun, type CapturedCell } from "./runs.ts";

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
});
