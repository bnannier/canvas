import { describe, expect, it } from "bun:test";
import { join } from "node:path";
import { WEB_CELLS_PER_VARIANT, components, type InventoryComponent } from "./inventory.ts";
import {
  AUDIT_ENV,
  DEFAULT_WORKERS,
  axeApplies,
  cellDir,
  freshness,
  parseAxe,
  parseRunArgs,
  parseWebFilters,
  planWebCapture,
  readCellRecords,
  runDirName,
  runStamp,
  summarizeCells,
  webCellId,
  workersFrom,
  type CellRecord,
} from "./web-capture.ts";

const inventory = components();
const button = inventory.find((c) => c.slug === "button")!;

function fixture(): InventoryComponent[] {
  const variant = (slug: string, label: string, key: string) => ({ slug, label, variant: key, path: `/components/${slug}${key === "default" ? "" : `/${key}`}` });
  return [
    { slug: "alpha", name: "Alpha", category: "Atoms", dir: "alpha", route: "/components/alpha", variants: [variant("alpha", "Usage", "default"), variant("alpha", "Ghost", "ghost")] },
    { slug: "beta", name: "Beta", category: "Atoms", dir: "beta", route: "/components/beta", variants: [variant("beta", "Usage", "default")] },
  ] as InventoryComponent[];
}

describe("the web capture filters", () => {
  it("default to every look, surface and width, and axe on solid phone and desktop", () => {
    const filters = parseWebFilters({});
    expect(filters).toEqual({
      only: null,
      variants: null,
      looks: ["blush", "mint", "dark"],
      surfaces: ["solid", "glass"],
      widths: ["phone", "tablet", "desktop"],
      axe: { kind: "solid", widths: ["phone", "desktop"] },
    });
  });

  it("read comma lists, keep each axis in its own order and drop repeats", () => {
    const filters = parseWebFilters({
      [AUDIT_ENV.only]: " button, dialog ,button",
      [AUDIT_ENV.looks]: "dark,blush",
      [AUDIT_ENV.surfaces]: "glass",
      [AUDIT_ENV.widths]: "desktop,phone",
    });
    expect(filters.only).toEqual(["button", "dialog"]);
    expect(filters.looks).toEqual(["blush", "dark"]);
    expect(filters.surfaces).toEqual(["glass"]);
    expect(filters.widths).toEqual(["phone", "desktop"]);
  });

  it("refuse a look, surface or width that does not exist", () => {
    expect(() => parseWebFilters({ [AUDIT_ENV.looks]: "sepia" })).toThrow(/AUDIT_LOOKS: unknown "sepia"/);
    expect(() => parseWebFilters({ [AUDIT_ENV.surfaces]: "matte" })).toThrow(/AUDIT_SURFACES/);
    expect(() => parseWebFilters({ [AUDIT_ENV.widths]: "watch" })).toThrow(/AUDIT_WIDTHS/);
  });

  it("read the axe policy and apply it per width and surface", () => {
    expect(parseAxe("none")).toEqual({ kind: "none" });
    expect(parseAxe("all")).toEqual({ kind: "all" });
    expect(parseAxe("tablet")).toEqual({ kind: "solid", widths: ["tablet"] });
    expect(() => parseAxe("tablet,watch")).toThrow(/AUDIT_AXE/);
    const policy = parseAxe(undefined);
    expect(axeApplies(policy, "phone", "solid")).toBe(true);
    expect(axeApplies(policy, "tablet", "solid")).toBe(false);
    expect(axeApplies(policy, "desktop", "glass")).toBe(false);
    expect(axeApplies({ kind: "all" }, "tablet", "glass")).toBe(true);
    expect(axeApplies({ kind: "none" }, "phone", "solid")).toBe(false);
  });
});

describe("the web capture plan", () => {
  it("captures 18 cells per variant: button's 15 variants are 270 cells in 6 tests", () => {
    const plan = planWebCapture(inventory, parseWebFilters({ [AUDIT_ENV.only]: "button" }));
    expect(button.variants.length).toBe(15);
    expect(plan.cells).toBe(button.variants.length * WEB_CELLS_PER_VARIANT);
    expect(plan.cells).toBe(270);
    expect(plan.groups.length).toBe(6);
    expect(plan.groups.every((g) => g.examples === 15 && g.widths.length === 3)).toBe(true);
  });

  it("covers the whole inventory when nothing is filtered", () => {
    const plan = planWebCapture(inventory, parseWebFilters({}));
    const variants = inventory.reduce((n, c) => n + c.variants.length, 0);
    expect(plan.components).toBe(inventory.length);
    expect(plan.cells).toBe(variants * WEB_CELLS_PER_VARIANT);
  });

  it("narrows by variant key, keeps the page's example count and docs order", () => {
    const plan = planWebCapture(fixture(), parseWebFilters({ [AUDIT_ENV.only]: "beta,alpha", [AUDIT_ENV.variants]: "ghost", [AUDIT_ENV.looks]: "dark", [AUDIT_ENV.widths]: "phone" }));
    expect(plan.groups.map((g) => `${g.slug} ${g.look} ${g.surface}`)).toEqual(["alpha dark solid", "alpha dark glass"]);
    expect(plan.groups[0]!.variants.map((v) => v.variant)).toEqual(["ghost"]);
    expect(plan.groups[0]!.examples).toBe(2);
    expect(plan).toMatchObject({ components: 1, variants: 1, cells: 2 });
  });

  it("refuses a slug or variant key nothing has, so a typo is not an empty run", () => {
    expect(() => planWebCapture(fixture(), parseWebFilters({ [AUDIT_ENV.only]: "gamma" }))).toThrow(/no component page is called "gamma"/);
    expect(() => planWebCapture(fixture(), parseWebFilters({ [AUDIT_ENV.only]: "beta", [AUDIT_ENV.variants]: "ghost" }))).toThrow(/no selected component has a variant "ghost"/);
  });
});

describe("the run's output paths", () => {
  it("name a run by UTC stamp, platform and short sha", () => {
    const at = new Date("2026-10-09T07:05:09.123Z");
    expect(runStamp(at)).toBe("20261009-070509");
    expect(runDirName(at, "web", "fd0ea8cd0123456789abcdef0123456789abcdef")).toBe("20261009-070509-web-fd0ea8c");
    expect(() => runDirName(at, "web", "HEAD")).toThrow(/not a commit sha/);
  });

  it("put a cell under web/<slug>/<variant>/<width>.<look>.<surface>", () => {
    const cell = { slug: "button", variant: "primary", label: "Primary", path: "/components/button/primary", width: { key: "phone", width: 390, height: 844 } as const, look: "mint" as const, surface: "glass" as const };
    expect(webCellId(cell)).toBe("web/button/primary/phone.mint.glass");
    expect(cellDir("/runs/x", cell)).toBe(join("/runs/x", "web", "button", "primary", "phone.mint.glass"));
  });
});

describe("the runner's flags", () => {
  it("map onto the environment the capture reads", () => {
    const args = parseRunArgs(["--", "--only=button,dialog", "--variants", "default", "--looks=dark", "--surfaces=solid", "--widths=phone", "--axe=all", "--base=http://localhost:8081/", "--workers=4", "--allow-stale"]);
    expect(args.errors).toEqual([]);
    expect(args.allowStale).toBe(true);
    expect(args.env).toEqual({
      AUDIT_ONLY: "button,dialog",
      AUDIT_VARIANTS: "default",
      AUDIT_LOOKS: "dark",
      AUDIT_SURFACES: "solid",
      AUDIT_WIDTHS: "phone",
      AUDIT_AXE: "all",
      E2E_BASE_URL: "http://localhost:8081",
      AUDIT_WORKERS: "4",
      AUDIT_ALLOW_STALE: "1",
    });
  });

  it("name what is wrong with a bad command line", () => {
    expect(parseRunArgs(["--colour=red"]).errors).toEqual(["unknown flag --colour"]);
    expect(parseRunArgs(["--only"]).errors).toEqual(["--only needs a value"]);
    expect(parseRunArgs(["--workers=0"]).errors).toEqual(['--workers must be a positive integer, not "0"']);
    expect(parseRunArgs(["--base=localhost:8081"]).errors).toEqual(['--base must be an http(s) URL, not "localhost:8081"']);
    expect(parseRunArgs(["--allow-stale=yes"]).errors).toEqual(["--allow-stale takes no value"]);
    expect(parseRunArgs(["button"]).errors).toEqual(['unexpected argument "button"']);
    expect(parseRunArgs(["--help"]).help).toBe(true);
  });

  it("run six workers unless told otherwise", () => {
    expect(workersFrom({})).toBe(DEFAULT_WORKERS);
    expect(DEFAULT_WORKERS).toBe(6);
    expect(workersFrom({ [AUDIT_ENV.workers]: "2" })).toBe(2);
    expect(() => workersFrom({ [AUDIT_ENV.workers]: "two" })).toThrow(/AUDIT_WORKERS/);
  });
});

describe("the served export's freshness", () => {
  const source = "a".repeat(64);
  it("is fresh only when the served fingerprint is this checkout's", () => {
    expect(freshness({ url: "u", sourceFingerprint: source }, source)).toEqual({ fresh: true });
    const stale = freshness({ url: "https://127.0.0.1:4173/testing/diagnostics", sourceFingerprint: "b".repeat(64) }, source);
    expect(stale.fresh).toBe(false);
    expect(stale.reason).toContain("bbbbbbbbbbbb");
    expect(stale.reason).toContain("--allow-stale");
  });

  it("is stale when the server reports no fingerprint", () => {
    expect(freshness({ url: "u", sourceFingerprint: null }, source).fresh).toBe(false);
    expect(freshness({ url: "u", sourceFingerprint: "unavailable" }, source).reason).toContain("no source fingerprint");
  });
});

describe("the run's cell records", () => {
  const record = (id: string, status: "ok" | "failed", ms: number, flags: string[] = []): CellRecord => ({
    id, slug: "button", variant: "default", label: "Usage", width: "phone", look: "blush", surface: "solid",
    status, flags, ms, bytes: 100, worker: 0, at: "2026-10-09T00:00:00.000Z", ...(status === "failed" ? { error: "boom" } : {}),
  });

  it("read jsonl and skip a torn last line", () => {
    const text = `${JSON.stringify(record("a", "ok", 1))}\n${JSON.stringify(record("b", "ok", 2))}\n{"id":"c","sta`;
    const { records, unreadable } = readCellRecords(text);
    expect(records.map((r) => r.id)).toEqual(["a", "b"]);
    expect(unreadable).toBe(1);
  });

  it("summarize counts, flags, timings and failures, a re-captured cell once", () => {
    const summary = summarizeCells([
      record("a", "failed", 9000),
      record("a", "ok", 4000, ["contrast"]),
      record("b", "ok", 2000, ["contrast", "small-target"]),
      record("c", "failed", 6000),
      record("d", "ok", 3000),
    ]);
    expect(summary).toMatchObject({ cells: 4, ok: 3, failed: 1, bytes: 400 });
    expect(summary.flags).toEqual({ contrast: 2, "small-target": 1 });
    expect(summary.ms).toEqual({ mean: 3750, p50: 3000, p95: 6000, max: 6000 });
    expect(summary.failures).toEqual([{ id: "c", error: "boom" }]);
  });
});
