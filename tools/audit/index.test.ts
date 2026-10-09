import { afterEach, describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { analyzeCells, type CellAnalysis } from "./analyze.ts";
import { RUNS, checkoutWithRealRuns } from "./fixtures/real-runs.ts";
import { brokenLinks, buildIndex, cellFlags, cellRow, flagCounts, mdCell, rankEntries, renderComponentIndex, renderSummary, sortRows, type CellRow, type ComponentIndex } from "./index.ts";
import { currentCells, readRunCells, type AuditRun } from "./runs.ts";

const ROOT = "/repo";
const run = (id: string, platform: AuditRun["platform"], extra: Partial<AuditRun> = {}): AuditRun => ({
  id, dir: `${ROOT}/.audit/runs/${id}`, platform, startedAt: "2026-10-09T10:00:00.000Z", status: "complete", finished: true,
  sha: "00d04a76".padEnd(40, "0"), dirty: false, fingerprint: "d824fbb9fb3c".padEnd(64, "0"), fresh: true, served: "static export", ...extra,
});

function row(id: string, overrides: Partial<CellRow> = {}): CellRow {
  const [head, , middle] = id.split("/");
  const state = head === "web-states";
  return {
    id, family: state ? "state" : head!.endsWith("-pages") ? "page" : "variant", platform: head!.startsWith("web") ? "web" : (head!.split("-")[0] as "ios" | "android"),
    variant: state ? null : middle ?? null, label: null, state: state ? middle!.split(".")[0]! : null, row: state ? (middle!.split(".")[1] as CellRow["row"]) : null, width: head!.startsWith("web") ? id.split("/").pop()!.split(".")[0]! : null,
    run: "20261009-100000-web-aaaaaaa", capturedAt: "2026-10-09T10:00:01.000Z", sha: "a".repeat(40), dirty: false, fingerprint: "f".repeat(64),
    status: "ok", error: null, analyzed: true, flags: [], stateFlags: [], releaseFlags: [], axe: null, minFont: 12, contrast: { dom: 0, likely: 0, review: 0 }, overflow: [], clipped: 0, smallTargets: 0, problems: 0,
    notReached: false, file: `.audit/runs/20261009-100000-web-aaaaaaa/${id}/card.png`, sections: [], ...overrides,
  };
}

const analysis = (overrides: Partial<CellAnalysis> = {}): CellAnalysis => ({
  schema: 1, id: "web/x/default/phone.blush.solid", run: "20261009-100000-web-aaaaaaa", capturedAt: "t", analyzedAt: "t", platform: "web", family: "variant", status: "ok", flags: ["contrast-likely"],
  contrast: { dom: { checked: 3, fails: 1 }, pixels: { sampled: 4, failLikely: 2, review: 1, passed: 1, percentiles: 0 }, exempt: 0, unmeasured: 0, texts: [] },
  fonts: { texts: 7, min: 10.5, minText: "x", minRegion: "web", belowSourceFloor: 0, underBodyFloor: 2 },
  targets: { web: { floor: 24, unit: "px", note: "", small: [{ region: "web", role: "button", name: "a", width: 20, height: 20 }] }, ios: { floor: 44, unit: "pt", note: "", small: [] } },
  axe: { scanned: true, byImpact: { critical: 1, serious: 0, moderate: 2, minor: 0 }, rules: [] }, overflow: ["row:web"], clippedText: 1, problems: 3, ...overrides,
});

describe("a cell's row", () => {
  it("files a cell its analysis has not reached under what its capture recorded", () => {
    expect(cellFlags({ status: "failed", flags: [] }, null)).toEqual(["failed"]);
    expect(cellFlags({ status: "unstable", flags: [] }, null)).toEqual(["unstable"]);
    expect(cellFlags({ status: "state-not-reached", flags: [] }, null)).toEqual(["state-not-reached"]);
    expect(cellFlags({ status: "ok", flags: ["axe", "contrast"] }, null)).toEqual(["axe", "contrast"]);
    expect(cellFlags({ status: "ok", flags: ["axe"] }, analysis())).toEqual(["contrast-likely"]);
  });

  it("reads its columns from the analysis of this capture, and not from another run's", () => {
    const web = run("20261009-100000-web-aaaaaaa", "web");
    const [cell] = readRunCells(web, JSON.stringify({ id: "web/x/default/phone.blush.solid", status: "ok", flags: ["axe"], at: "2026-10-09T10:00:01.000Z" })).cells;
    const own = cellRow(cell!, analysis(), ROOT);
    expect(own).toMatchObject({ analyzed: true, flags: ["contrast-likely"], axe: { critical: 1, serious: 0, moderate: 2, minor: 0 }, minFont: 10.5, contrast: { dom: 1, likely: 2, review: 1 }, overflow: ["row:web"], clipped: 1, smallTargets: 1, problems: 3, sha: web.sha, fingerprint: web.fingerprint, file: null });
    const stale = cellRow(cell!, analysis({ run: "20261009-090000-web-zzzzzzz" }), ROOT);
    expect(stale).toMatchObject({ analyzed: false, flags: ["axe"], axe: null, contrast: null, smallTargets: null });
  });

  it("orders a variant's rows by platform, width, then look and surface", () => {
    const ids = ["android/x/v/blush.solid", "web/x/v/desktop.blush.solid", "web/x/v/phone.dark.glass", "ios/x/v/mint.glass", "web/x/v/phone.blush.solid", "ios/x/v/blush.solid", "web/x/v/phone.blush.glass"];
    expect(sortRows(ids.map((id) => row(id))).map((r) => r.id)).toEqual([
      "web/x/v/phone.blush.solid", "web/x/v/phone.blush.glass", "web/x/v/phone.dark.glass", "web/x/v/desktop.blush.solid", "ios/x/v/blush.solid", "ios/x/v/mint.glass", "android/x/v/blush.solid",
    ]);
  });
});

describe("rendering", () => {
  it("escapes what a Markdown table cell cannot hold", () => {
    expect(mdCell("a | b\nc \\ d")).toBe("a \\| b c \\\\ d");
  });

  it("writes a component's index: its checklist, sheets, runs and one row per cell with its run, commit and fingerprint", () => {
    const web = run("20261009-100000-web-aaaaaaa", "web", { dirty: true });
    const newer = run("20261009-110000-web-bbbbbbb", "web", { sha: "b".repeat(40), fingerprint: "e".repeat(64) });
    const model: ComponentIndex = {
      slug: "x",
      name: "Ex",
      kind: "component",
      checklist: "audit/components/x.md",
      checklistExists: true,
      variants: [{ key: "default", label: "Usage" }, { key: "ghost", label: "Ghost" }],
      sections: [],
      expected: { cells: { web: 36, ios: 12, android: 12 }, states: 24 },
      rows: [
        row("web/x/default/phone.blush.solid", { run: newer.id, sha: newer.sha, fingerprint: newer.fingerprint, flags: ["axe", "contrast-likely"], axe: { critical: 1, serious: 2, moderate: 0, minor: 0 }, minFont: 10, contrast: { dom: 0, likely: 2, review: 1 }, smallTargets: 3, problems: 1, file: `.audit/runs/${newer.id}/web/x/default/phone.blush.solid/card.png` }),
        row("web/x/ghost/phone.blush.solid", { status: "failed", error: "rail | selected no tab\nsecond line", flags: ["failed"], analyzed: false, minFont: null, contrast: null, clipped: null, smallTargets: null, problems: null, file: null }),
        row("ios/x/default/blush.solid", { run: "20261009T100000Z-ios-ccccccc", flags: [], contrast: null, clipped: null, minFont: null }),
        row("web-states/x/pressed.web/desktop.blush.glass", { variant: "default", label: "Usage", notReached: true, status: "state-not-reached", error: "holding the pointer down changed no watched style | against the hovered control", flags: ["state-not-reached", "press-selects-label"], releaseFlags: ["press-selects-label"], file: ".audit/runs/20261009-100000-web-aaaaaaa/web-states/x/pressed.web/desktop.blush.glass/probe.json", contrast: null, minFont: null, clipped: null, smallTargets: null }),
        row("web/x/retired/phone.blush.solid"),
      ],
      runs: [web, newer],
      sheets: { variants: new Map([["default", ["card-glass.jpg", "card-solid.jpg", "compare.jpg", "native.jpg", "row-web-phone.jpg"]], ["ghost", ["card-solid-1.jpg", "card-solid-10.jpg", "card-solid-2.jpg", "compare-glass.jpg", "row-ios-phone-1.jpg", "row-ios-phone-2.jpg"]]]), component: ["states.jpg"] },
      builtAt: "2026-10-09T12:00:00.000Z",
      root: ROOT,
    };
    const md = renderComponentIndex(model, ".audit/current/x");
    expect(md).toStartWith("# Ex\n");
    expect(md).toContain("- Checklist: [audit/components/x.md](../../../audit/components/x.md)");
    expect(md).toContain("- Captured: web 3 of 36, ios 1 of 12, android 0 of 12; interaction states 1 of 24 (1 not reached)");
    expect(md).toContain("- Flagged: 3 of 5 cell(s); 1 not analyzed (run `bun run audit:analyze`)");
    expect(md).toContain("| [20261009-100000-web-aaaaaaa](../../runs/20261009-100000-web-aaaaaaa/manifest.json) | web | 2026-10-09T10:00:00.000Z | 00d04a7 (dirty) | d824fbb9fb3c | static export | complete | 3 |");
    expect(md).toContain("| [20261009-110000-web-bbbbbbb](../../runs/20261009-110000-web-bbbbbbb/manifest.json) | web | 2026-10-09T10:00:00.000Z | bbbbbbb | eeeeeeeeeeee | static export | complete | 1 |");
    expect(md).toContain("| `default` | [solid](sheets/default/card-solid.jpg), [glass](sheets/default/card-glass.jpg) | web [phone](sheets/default/row-web-phone.jpg) | [native](sheets/default/native.jpg) | [solid](sheets/default/compare.jpg) |");
    expect(md).toContain("| `ghost` | solid ([1](sheets/ghost/card-solid-1.jpg), [2](sheets/ghost/card-solid-2.jpg), [10](sheets/ghost/card-solid-10.jpg)) | ios phone ([1](sheets/ghost/row-ios-phone-1.jpg), [2](sheets/ghost/row-ios-phone-2.jpg)) | - | [glass](sheets/ghost/compare-glass.jpg) |");
    expect(md).toContain("Interaction states (states x looks and surfaces), by width: [desktop](sheets/states.jpg)");
    expect(md).toContain("| [web/x/default/phone.blush.solid](../../runs/20261009-110000-web-bbbbbbb/web/x/default/phone.blush.solid/card.png) | ok | axe, contrast-likely | 1/2/0/0 | 10 | 0/2/1 | - | 0 | 3 | 1 | 20261009-110000-web-bbbbbbb | bbbbbbb | eeeeeeeeeeee |");
    expect(md).toContain("| web/x/ghost/phone.blush.solid | failed: rail \\| selected no tab | failed | - | - | - | - | - | - | - | 20261009-100000-web-aaaaaaa | aaaaaaa | ffffffffffff |");
    expect(md).toContain("| ok | none | - | - | - | - | - | 0 | 0 | 20261009T100000Z-ios-ccccccc |");
    // A state not reached: why, and what its release found, in its own table.
    expect(md).toContain("| [web-states/x/pressed.web/desktop.blush.glass](../../runs/20261009-100000-web-aaaaaaa/web-states/x/pressed.web/desktop.blush.glass/probe.json) | Usage (`default`) | not reached: holding the pointer down changed no watched style \\| against the hovered control | - | press-selects-label | - | - | - | - | - | - | 0 | 20261009-100000-web-aaaaaaa |");
    expect(md).toContain("## Interaction states\n\n1 cell(s), 0 reached and 1 not reached;");
    expect(md).toContain("| press-selects-label | 1 | dragging off the control selected its own label's text |");
    const sections = [...md.matchAll(/^### (.*)$/gm)].map((m) => m[1]);
    expect(sections).toEqual(["`default`: Usage", "`ghost`: Ghost", "Cells of variants the inventory no longer has", "Interaction states"]);
    expect(md.indexOf("web/x/default/phone.blush.solid")).toBeLessThan(md.indexOf("ios/x/default/blush.solid"));
    expect(md).toContain("| Flag | Cells |\n|---|---|\n| axe | 1 |");
  });

  it("ranks components by their cells' flags in SUMMARY.md and names the ones never captured", () => {
    const entries = [
      { slug: "calm", name: "Calm", kind: "component" as const, rows: [row("web/calm/d/phone.blush.solid")], expected: { cells: { web: 18, ios: 6, android: 6 }, states: 0 }, index: ".audit/current/calm/index.md" },
      { slug: "busy", name: "Busy", kind: "component" as const, rows: [row("web/busy/d/phone.blush.solid", { flags: ["axe", "contrast"] }), row("ios/busy/d/blush.solid", { flags: ["unstable"] })], expected: { cells: { web: 18, ios: 6, android: 6 }, states: 0 }, index: ".audit/current/busy/index.md" },
      { slug: "mid", name: "Mid", kind: "component" as const, rows: [row("web/mid/d/phone.blush.solid", { flags: ["axe", "contrast"] })], expected: { cells: { web: 18, ios: 6, android: 6 }, states: 0 }, index: null },
    ];
    expect(rankEntries(entries).map((entry) => entry.slug)).toEqual(["busy", "mid", "calm"]);
    expect(flagCounts(entries.flatMap((entry) => entry.rows))).toEqual([["axe", 2], ["contrast", 2], ["unstable", 1]]);
    const md = renderSummary(entries, ["lonely", "template-signin"], [run("20261009-100000-web-aaaaaaa", "web")], "2026-10-09T12:00:00.000Z", ".audit/current");
    expect(md).toContain("- Cells: 4, 3 flagged; web 3, ios 1, android 0");
    expect(md).toContain("| 1 | [Busy](busy/index.md) | 3 | 2 of 2 | 1/18 1/6 0/6 | - | - | axe 1, contrast 1, unstable 1 |");
    expect(md).toContain("| 2 | Mid | 2 | 1 of 1 |");
    expect(md).toContain("| 3 | [Calm](calm/index.md) | 0 | 0 of 1 | 1/18 0/6 0/6 | - | - | none |");
    // No state was captured, so there is nothing to say about states.
    expect(md).not.toContain("## Interaction states not reached");
    expect(md).toContain("2 component or page route(s) with no capture in any run: lonely, template-signin.");
  });
});

describe("the index over real run directories", () => {
  let root: string | null = null;
  afterEach(() => {
    if (root) rmSync(root, { recursive: true, force: true });
    root = null;
  });

  it("points a re-captured cell at the newer run and every other cell at the run that took it last", () => {
    root = mkdtempSync(join(tmpdir(), "audit-index-"));
    const writeRun = (name: string, startedAt: string, sha: string, cells: { id: string; at: string; flags?: string[] }[]) => {
      const dir = join(root!, ".audit", "runs", name);
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, "manifest.json"), JSON.stringify({ platform: "web", status: "complete", startedAt, source: { sha, dirty: false }, served: { mode: "static export", sourceFingerprint: sha[0]!.repeat(64), fresh: true } }));
      writeFileSync(join(dir, "cells.jsonl"), cells.map((cell) => JSON.stringify({ status: "ok", flags: [], ...cell })).join("\n"));
      for (const cell of cells) {
        mkdirSync(join(dir, cell.id), { recursive: true });
        writeFileSync(join(dir, cell.id, "card.png"), "");
      }
    };
    const ids = ["web/x/default/phone.blush.solid", "web/x/default/phone.dark.solid", "web/x/ghost/phone.blush.solid"];
    writeRun("20261009-100000-web-aaaaaaa", "2026-10-09T10:00:00.000Z", "a".repeat(40), ids.map((id, i) => ({ id, at: `2026-10-09T10:00:0${i}.000Z`, flags: ["axe"] })));
    writeRun("20261009-110000-web-bbbbbbb", "2026-10-09T11:00:00.000Z", "b".repeat(40), [{ id: ids[0]!, at: "2026-10-09T11:00:01.000Z" }, { id: ids[1]!, at: "2026-10-09T11:00:02.000Z" }]);
    const selection = currentCells(root, { only: null, runs: null });
    const rows = selection.cells.map((cell) => cellRow(cell, null, root!));
    const md = renderComponentIndex({
      slug: "x", name: "X", kind: "component", checklist: "audit/components/x.md", checklistExists: false,
      variants: [{ key: "default", label: "Usage" }, { key: "ghost", label: "Ghost" }], sections: [], expected: { cells: { web: 36, ios: 12, android: 12 }, states: 0 },
      rows, runs: selection.runs, sheets: { variants: new Map(), component: [] }, builtAt: "now", root,
    }, ".audit/current/x");
    expect(md).toContain("- Checklist: audit/components/x.md (missing)");
    expect(md).toContain("| [web/x/default/phone.blush.solid](../../runs/20261009-110000-web-bbbbbbb/web/x/default/phone.blush.solid/card.png) | ok | none (not analyzed) |");
    expect(md).toContain("| [web/x/default/phone.dark.solid](../../runs/20261009-110000-web-bbbbbbb/web/x/default/phone.dark.solid/card.png) | ok | none (not analyzed) |");
    expect(md).toContain("| [web/x/ghost/phone.blush.solid](../../runs/20261009-100000-web-aaaaaaa/web/x/ghost/phone.blush.solid/card.png) | ok | axe |");
    expect(md).toMatch(/\| \[20261009-100000-web-aaaaaaa\]\(\.\.\/\.\.\/runs\/20261009-100000-web-aaaaaaa\/manifest\.json\) \| web \| .* \| aaaaaaa \| aaaaaaaaaaaa \| static export \| complete \| 1 \|/);
    expect(md).toMatch(/\| \[20261009-110000-web-bbbbbbb\]\(.*\) \| web \| .* \| bbbbbbb \| bbbbbbbbbbbb \| static export \| complete \| 2 \|/);
  });
});

describe("the index over real runs", () => {
  let root: string | null = null;
  afterEach(() => {
    if (root) rmSync(root, { recursive: true, force: true });
    root = null;
  });

  it("indexes real variant, state and page captures: the states table, the page's sections linked, nothing dangling", async () => {
    root = checkoutWithRealRuns();
    await analyzeCells(currentCells(root, { only: null, runs: null }).cells, new Date("2026-10-09T18:00:00Z"));
    const result = buildIndex(root, { runs: null, only: null }, "2026-10-09T18:00:00.000Z");
    expect(result).toMatchObject({ cells: 10, entries: 5, unanalyzed: 0, states: 7, notReached: 1, written: 5, removed: [], warnings: [] });
    const read = (slug: string) => readFileSync(join(root!, ".audit", "current", slug, "index.md"), "utf8");
    const states = `../../runs/${RUNS.states}/web-states`;

    const button = read("button");
    expect(button).toContain("- Captured: web 2 of 270, ios 0 of 90, android 0 of 90; interaction states 4 of 24 (0 not reached)");
    expect(button).toContain("## Interaction states\n\n4 cell(s), 4 reached and 0 not reached;");
    expect(button).toContain(`| [web-states/button/pressed.web/desktop.blush.solid](${states}/button/pressed.web/desktop.blush.solid/state.png) | Default (\`default\`) | yes | - | - | contrast | 0/0/0/0 | 12 | 1/0/0 | 0 | 0 | 0 | ${RUNS.states} | b87e514 (dirty) |`);
    expect(button).toContain(`| [web-states/button/pressed.web/desktop.blush.glass](${states}/button/pressed.web/desktop.blush.glass/state.png) | Default (\`default\`) | yes | - | - | contrast-review | - | 12 | 0/0/1 |`);
    expect(button.indexOf("hover.web/desktop.blush.solid")).toBeLessThan(button.indexOf("pressed.web/desktop.blush.solid"));

    const heatmap = read("heatmap");
    expect(heatmap).toContain(`| [web-states/heatmap/pressed.web/desktop.blush.solid](${states}/heatmap/pressed.web/desktop.blush.solid/probe.json) | Calendar (\`calendar\`) | not reached: pressing [role="img"] [tabindex="-1"] #10 at 0.5, 0.5 of its box showed nothing the chart did not show with the pointer away (the pointer resting on it before the press had shown "13 contributions", "Jul 16, 2025", which the press took away) | - | - | - | - | - | - | - | - | 0 |`);

    const slider = read("slider");
    expect(slider).toContain("| press-not-cancelled | 1 | moving off before the button came up did not cancel the press: the row's tree, the address, or the control's look or pixels changed |");
    expect(slider).toContain("| yes | - | press-not-cancelled | - |");

    const tooltip = read("tooltip");
    expect(tooltip).toContain("| hover-unstable | 1 | the tooltip's bubble pushed its trigger out from under the resting pointer, which had to follow it |");

    const signin = read("template-signin");
    const shot = (width: string, key: string) => `../../runs/${RUNS.pages}/web-pages/template-signin/${width}.blush.glass/section.${key}.png`;
    expect(signin).toContain("## Sections");
    expect(signin).toContain(`| Centered card (\`centeredcard\`) | phone | - | [shot](${shot("phone", "centeredcard")}) (2 small) | - | - | - | - |`);
    expect(signin).toContain(`| Split-screen (\`splitscreen\`) | phone | - | [shot](${shot("phone", "splitscreen")}) (contrast 0/4/0) | - | - | - | - |`);
    expect(signin).toContain(`| [web-pages/template-signin/phone.blush.glass](../../runs/${RUNS.pages}/web-pages/template-signin/phone.blush.glass/viewport.png) | ok | contrast-likely |`);
    // No row for a width nothing was captured at.
    expect(signin).not.toContain("| Centered card (`centeredcard`) | tablet |");

    const summary = readFileSync(join(root, ".audit", "current", "SUMMARY.md"), "utf8");
    expect(summary).toContain("- Of them: 2 example variant cell(s), 7 interaction-state cell(s) (1 not reached), 1 page cell(s)");
    expect(summary).toContain("| [Heatmap](heatmap/index.md) | pressed.web | Calendar | 1: desktop.blush.solid | pressing [role=\"img\"]");
    expect(summary).toContain("| press-not-cancelled | moving off before the button came up did not cancel the press: the row's tree, the address, or the control's look or pixels changed | 1 | [Slider](slider/index.md) 1 |");
    // A full sweep holds 18 of Slider's state cells: its states, their rows and widths, by the six looks and surfaces.
    expect(summary).toContain("| [Slider](slider/index.md) | 1 | 1 of 1 | 0/144 0/48 0/48 | 1/18 (0) | press-not-cancelled 1 | press-not-cancelled 1 |");
    expect(summary).toContain("| [template-signin](template-signin/index.md) | 1 | 1 of 1 | 1/18 0/6 0/6 | - | - | contrast-likely 1 |");

    const built = JSON.parse(readFileSync(join(root, ".audit", "current", "current.json"), "utf8")) as { cells: { id: string; family: string; notReached?: boolean; releaseFlags?: string[]; sections?: { key: string; file: string }[] }[] };
    expect(built.cells.find((cell) => cell.id === "web-pages/template-signin/phone.blush.glass")!.sections!.map((section) => section.key)).toEqual(["centeredcard", "splitscreen", "magiclink"]);
    expect(built.cells.find((cell) => cell.id.startsWith("web-states/heatmap"))).toMatchObject({ family: "state", notReached: true });
    expect(brokenLinks(root)).toEqual([]);
  });
});
