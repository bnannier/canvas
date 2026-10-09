import { describe, expect, it } from "bun:test";
import { join } from "node:path";
import auditConfig from "../../playwright.audit.config.ts";
import { CHROMIUM_ARGS } from "../../playwright.config.ts";
import { FIXED_TIME } from "../../e2e/support/docs.ts";
import { WEB_CELLS_PER_VARIANT, components, type InventoryComponent } from "./inventory.ts";
import {
  AUDIT_ENV,
  DEFAULT_WORKERS,
  PACKAGER_RUNNING,
  SERVED_MODES,
  axeApplies,
  captureSettings,
  cellDir,
  classifyServed,
  describeServed,
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
  type ServedRecord,
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

describe("the server the cells hit", () => {
  const METRO_BUNDLE = "http://localhost:8081/node_modules/expo-router/entry.bundle?platform=web&dev=true&hot=false&lazy=true&transform.routerRoot=src%2Fapp";
  const EXPORT_SCRIPTS = [
    "https://127.0.0.1:4173/_expo/static/js/web/__expo-metro-runtime-1f8f5d3ca6b7f58204d51e14506d73fb.js",
    "https://127.0.0.1:4173/_expo/static/js/web/entry-59356601ec37742861210508174b32d6.js",
  ];
  const metro = { body: `${PACKAGER_RUNNING}\n`, projectRoot: "/work/canvas/docs" };

  it("is a live dev server when the page loads a bundle built on request, with the root Metro names", () => {
    expect(classifyServed([METRO_BUNDLE], metro)).toEqual({ mode: SERVED_MODES.dev, bundle: METRO_BUNDLE, projectRoot: "/work/canvas/docs" });
    expect(SERVED_MODES.dev).toBe("live dev server");
  });

  it("names no project root that Metro's own /status did not", () => {
    expect(classifyServed([METRO_BUNDLE], null).projectRoot).toBeNull();
    expect(classifyServed([METRO_BUNDLE], { body: "<!doctype html>", projectRoot: "/elsewhere" }).projectRoot).toBeNull();
    expect(classifyServed([METRO_BUNDLE], { body: PACKAGER_RUNNING, projectRoot: null })).toMatchObject({ mode: SERVED_MODES.dev, projectRoot: null });
  });

  it("is a static export when the page loads the hashed files an export wrote, whatever answers /status", () => {
    expect(classifyServed(EXPORT_SCRIPTS, null)).toEqual({ mode: SERVED_MODES.export, bundle: null, projectRoot: null });
    expect(classifyServed(EXPORT_SCRIPTS, metro)).toEqual({ mode: SERVED_MODES.export, bundle: null, projectRoot: null });
  });
});

describe("the served bundle's freshness", () => {
  const checkout = { fingerprint: "a".repeat(64), docsRoot: "/work/canvas/docs" };
  const exported = { url: "https://127.0.0.1:4173/testing/diagnostics", mode: SERVED_MODES.export, projectRoot: null };

  it("is fresh for an export only when the served fingerprint is this checkout's", () => {
    expect(freshness({ ...exported, sourceFingerprint: checkout.fingerprint }, checkout)).toEqual({ fresh: true, by: "source fingerprint" });
    const stale = freshness({ ...exported, sourceFingerprint: "b".repeat(64) }, checkout);
    expect(stale).toMatchObject({ fresh: false, by: "source fingerprint" });
    expect(stale.reason).toContain("bbbbbbbbbbbb");
    expect(stale.reason).toContain("--allow-stale");
  });

  it("is stale for an export that reports no fingerprint", () => {
    expect(freshness({ ...exported, sourceFingerprint: null }, checkout).fresh).toBe(false);
    expect(freshness({ ...exported, sourceFingerprint: "unavailable" }, checkout).reason).toContain("no source fingerprint");
  });

  it("is fresh for a live dev server of this checkout's docs app, whatever fingerprint it reports", () => {
    const dev = { url: "http://localhost:8081/testing/diagnostics", mode: SERVED_MODES.dev, projectRoot: "/work/canvas/docs" };
    expect(freshness({ ...dev, sourceFingerprint: "b".repeat(64) }, checkout)).toEqual({ fresh: true, by: "project root" });
    expect(freshness({ ...dev, sourceFingerprint: null }, checkout)).toEqual({ fresh: true, by: "project root" });
  });

  it("is stale for a live dev server of another checkout, or one that names no project", () => {
    const other = freshness({ url: "http://localhost:8081/testing/diagnostics", mode: SERVED_MODES.dev, projectRoot: "/work/canvas-main/docs", sourceFingerprint: checkout.fingerprint }, checkout);
    expect(other).toMatchObject({ fresh: false, by: "project root" });
    expect(other.reason).toContain("/work/canvas-main/docs");
    expect(other.reason).toContain("--allow-stale");
    const unnamed = freshness({ url: "u", mode: SERVED_MODES.dev, projectRoot: null, sourceFingerprint: null }, checkout);
    expect(unnamed).toMatchObject({ fresh: false, by: "project root" });
    expect(unnamed.reason).toContain("names no project root");
  });

  it("is described in one line, a dev server as one", () => {
    const base: ServedRecord = {
      url: "http://localhost:8081/testing/diagnostics", mode: SERVED_MODES.dev, bundle: "b", projectRoot: "/work/canvas-main/docs",
      sourceFingerprint: null, candidateRevision: null, sourceDirty: null, packageVersion: null, inputMode: null,
      fresh: false, by: "project root", checkout, allowStale: true,
    };
    expect(describeServed(base)).toBe("http://localhost:8081/testing/diagnostics: live dev server for /work/canvas-main/docs (NOT this checkout, captured with --allow-stale; it builds from the source on disk, so its fingerprint is not compared)");
    expect(describeServed({ ...base, mode: SERVED_MODES.export, projectRoot: null, sourceFingerprint: "c".repeat(64), fresh: true, by: "source fingerprint", allowStale: false }))
      .toBe("http://localhost:8081/testing/diagnostics: static export of source cccccccccccc (this checkout)");
  });
});

describe("the capture settings a manifest records", () => {
  it("are read off the audit configuration and the suite's fixed clock", () => {
    expect(captureSettings(auditConfig, FIXED_TIME)).toEqual({
      browser: "chromium",
      deviceScaleFactor: 2,
      reducedMotion: "reduce",
      fixedTime: FIXED_TIME.toISOString(),
      launchArgs: CHROMIUM_ARGS,
    });
  });

  it("follow the configuration: a project's use wins, as Playwright merges them", () => {
    const config = {
      use: { deviceScaleFactor: 2, contextOptions: { reducedMotion: "reduce" }, launchOptions: { args: ["--a"] } },
      projects: [{ use: { browserName: "firefox", deviceScaleFactor: 3 } }],
    };
    expect(captureSettings(config, new Date("2026-02-01T00:00:00Z"))).toEqual({
      browser: "firefox", deviceScaleFactor: 3, reducedMotion: "reduce", fixedTime: "2026-02-01T00:00:00.000Z", launchArgs: ["--a"],
    });
  });

  it("refuse a configuration that leaves a setting to Playwright's default, or runs other than one project", () => {
    expect(() => captureSettings({ use: {}, projects: [{ use: { browserName: "chromium" } }] }, FIXED_TIME))
      .toThrow("the audit configuration does not set deviceScaleFactor, contextOptions.reducedMotion");
    expect(() => captureSettings({ projects: [] }, FIXED_TIME)).toThrow(/0 projects/);
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
