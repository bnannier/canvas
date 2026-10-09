import { describe, expect, it } from "bun:test";
import { join } from "node:path";
import auditConfig from "../../playwright.audit.config.ts";
import { CHROMIUM_ARGS } from "../../playwright.config.ts";
import { FIXED_TIME } from "../../e2e/support/docs.ts";
import { WEB_CELLS_PER_VARIANT, components, pages, type InventoryComponent } from "./inventory.ts";
import {
  AUDIT_ENV,
  DEFAULT_WORKERS,
  PACKAGER_RUNNING,
  SERVED_MODES,
  axeApplies,
  captureSettings,
  cellDir,
  classifyServed,
  describeKinds,
  describeServed,
  freshness,
  cutSides,
  marginClip,
  paintedMargin,
  parseAxe,
  parseBoxShadows,
  parseKinds,
  parseRunArgs,
  parseWebFilters,
  planPageCapture,
  planWebCapture,
  readCellRecords,
  runDirName,
  runStamp,
  splitOnly,
  stateCellId,
  summarizeCells,
  webCellId,
  webPageCellId,
  workersFrom,
  type CellRecord,
  type RawCaster,
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

  it("take --states with or without a list after an =, and --pages with none", () => {
    expect(parseRunArgs(["--states", "--only=button"]).env).toEqual({ AUDIT_STATES: "all", AUDIT_ONLY: "button" });
    expect(parseRunArgs(["--states=hover,open"]).env).toEqual({ AUDIT_STATES: "hover,open" });
    expect(parseRunArgs(["--pages"]).env).toEqual({ AUDIT_PAGES: "1" });
    expect(parseRunArgs(["--states="]).errors).toEqual(["--states= needs a state, or drop the = for every state"]);
    expect(parseRunArgs(["--pages=all"]).errors).toEqual(["--pages takes no value"]);
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

describe("what a run captures", () => {
  const pageList = pages();

  it("is the variants alone unless states or pages are asked for", () => {
    expect(parseKinds({})).toEqual({ variants: true, states: null, pages: false });
    expect(parseKinds({ [AUDIT_ENV.states]: "all" })).toEqual({ variants: false, states: ["hover", "focus", "pressed", "open", "invalid", "disabled"], pages: false });
    expect(parseKinds({ [AUDIT_ENV.states]: "open,hover", [AUDIT_ENV.pages]: "1" })).toEqual({ variants: false, states: ["hover", "open"], pages: true });
    expect(() => parseKinds({ [AUDIT_ENV.states]: "hover,dragged" })).toThrow(/AUDIT_STATES: unknown "dragged"/);
    expect(() => parseKinds({ [AUDIT_ENV.pages]: "yes" })).toThrow(/AUDIT_PAGES must be 1/);
    expect(describeKinds(parseKinds({ [AUDIT_ENV.states]: "focus", [AUDIT_ENV.pages]: "1" }))).toBe("states (focus), pages");
  });

  it("splits --only between components and pages, a page by id or slug, a slug that is both to each kind", () => {
    const both = parseKinds({ [AUDIT_ENV.states]: "all", [AUDIT_ENV.pages]: "1" });
    expect(splitOnly(["button", "template-signin", "glass", "calendar"], both, inventory, pageList)).toEqual({
      components: ["button", "calendar"],
      pages: ["template-signin", "pattern-glass", "template-calendar"],
    });
    expect(splitOnly(null, parseKinds({ [AUDIT_ENV.pages]: "1" }), inventory, pageList)).toEqual({ components: [], pages: null });
    expect(splitOnly(null, parseKinds({}), inventory, pageList)).toEqual({ components: null, pages: [] });
  });

  it("refuses a name nothing has, or one only a kind the run does not capture has", () => {
    expect(() => splitOnly(["buton"], parseKinds({}), inventory, pageList)).toThrow(/no component or page is called "buton"/);
    expect(() => splitOnly(["template-signin"], parseKinds({ [AUDIT_ENV.states]: "all" }), inventory, pageList)).toThrow(/names a page, and this run captures no pages/);
    expect(() => splitOnly(["button"], parseKinds({ [AUDIT_ENV.pages]: "1" }), inventory, pageList)).toThrow(/names a component, and this run captures only pages/);
  });

  it("plans 18 cells per page, its sections from the inventory, narrowed by id", () => {
    const all = planPageCapture(pageList, parseWebFilters({}));
    expect(all.pages).toBe(24);
    expect(all.cells).toBe(24 * 18);
    expect(all.groups.length).toBe(24 * 6);
    const two = planPageCapture(pageList, { ...parseWebFilters({ [AUDIT_ENV.looks]: "dark", [AUDIT_ENV.widths]: "phone" }), only: ["template-signin"] });
    expect(two).toMatchObject({ pages: 1, cells: 2 });
    expect(two.groups[0]!.page.sections.map((s) => s.key)).toEqual(["centeredcard", "splitscreen", "magiclink"]);
    expect(() => planPageCapture(pageList, { ...parseWebFilters({}), only: ["template-nope"] })).toThrow(/no pattern or template page is called "template-nope"/);
  });

  it("puts a state under web-states/<slug>/<state>.<row>/ and a page under web-pages/<kind>-<slug>/", () => {
    const width = { key: "phone", width: 390, height: 844 } as const;
    expect(stateCellId({ slug: "dialog", state: "open", row: "ios", width, look: "dark", surface: "glass" })).toBe("web-states/dialog/open.ios/phone.dark.glass");
    const signin = pageList.find((p) => p.id === "template-signin")!;
    expect(webPageCellId({ page: signin, width, look: "mint", surface: "solid" })).toBe("web-pages/template-signin/phone.mint.solid");
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
    expect(summary).toMatchObject({ notReached: 0, unreached: [], kinds: { variant: 4, state: 0, page: 0 } });
  });

  it("count a state not reached apart from the ok and the failed, with its reason, and the cells by kind", () => {
    const base = { width: "desktop", look: "dark", surface: "solid", flags: [], ms: 1000, bytes: 10, worker: 0, at: "2026-10-09T00:00:00.000Z" } as const;
    const records: CellRecord[] = [
      { ...base, kind: "state", id: "web-states/button/hover.web/desktop.dark.solid", slug: "button", variant: "default", label: "Usage", state: "hover", row: "web", status: "ok" },
      { ...base, kind: "state", id: "web-states/video/pressed.web/desktop.dark.solid", slug: "video", variant: "default", label: "Usage", state: "pressed", row: "web", status: "state-not-reached", reason: "no press feedback" },
      { ...base, kind: "page", id: "web-pages/template-signin/desktop.dark.solid", page: "template-signin", route: "/templates/signin", sections: 3, status: "ok" },
      record("a", "ok", 1000),
    ];
    const summary = summarizeCells(records);
    expect(summary).toMatchObject({ cells: 4, ok: 3, failed: 0, notReached: 1, kinds: { variant: 1, state: 2, page: 1 } });
    expect(summary.unreached).toEqual([{ id: "web-states/video/pressed.web/desktop.dark.solid", reason: "no press feedback" }]);
  });

  it("count a release's flags like any other, a state not reached's too", () => {
    const base = { width: "desktop", look: "dark", surface: "solid", ms: 1000, bytes: 10, worker: 0, at: "2026-10-09T00:00:00.000Z", variant: "default", label: "Default", row: "web" } as const;
    const summary = summarizeCells([
      // A press with no look of its own that still fired when the pointer left before coming up.
      { ...base, kind: "state", id: "web-states/video/pressed.web/desktop.dark.solid", slug: "video", state: "pressed", status: "state-not-reached", reason: "no press feedback", flags: ["press-not-cancelled"] },
      { ...base, kind: "state", id: "web-states/dialog/open.web/desktop.dark.solid", slug: "dialog", state: "open", status: "ok", flags: ["overlay-not-closed"] },
      { ...base, kind: "state", id: "web-states/chart/pressed.web/desktop.dark.solid", slug: "chart", state: "pressed", status: "ok", flags: ["contrast", "inspection-not-cleared"] },
    ]);
    expect(summary.flags).toEqual({ "press-not-cancelled": 1, "overlay-not-closed": 1, contrast: 1, "inspection-not-cleared": 1 });
  });
});

describe("the shot margin", () => {
  const viewport = { left: 0, top: 0, right: 1440, bottom: 900 };
  // The shades as the export computes them (src/style/shadow.ts in the blush palette): the
  // resting card, and the raised (and hovered) one.
  const RESTING = "rgba(121, 100, 214, 0.22) 0px 20px 44px -24px";
  const RAISED = "rgba(121, 100, 214, 0.22) 0px 30px 54px -24px";
  const caster = (over: Partial<RawCaster> = {}): RawCaster => ({
    node: '<div> "Lifted above the page"',
    box: { left: 289, top: 97, right: 1183, bottom: 168 },
    scale: { x: 1, y: 1 },
    boxShadow: RAISED,
    outline: null,
    transformed: false,
    clip: null,
    ...over,
  });

  it("reads a computed box-shadow layer by layer, the colour's commas inside it", () => {
    expect(parseBoxShadows(RAISED)).toEqual([{ x: 0, y: 30, blur: 54, spread: -24, inset: false, alpha: 0.22 }]);
    expect(parseBoxShadows("rgb(0, 0, 0) 0px 0px 0px 2px inset, rgba(0, 0, 0, 0) 1px 2px 3px 0px, rgba(0, 0, 0, 0.45) 0px 50px 100px -30px")).toEqual([
      { x: 0, y: 0, blur: 0, spread: 2, inset: true, alpha: 1 },
      { x: 1, y: 2, blur: 3, spread: 0, inset: false, alpha: 0 },
      { x: 0, y: 50, blur: 100, spread: -30, inset: false, alpha: 0.45 },
    ]);
    expect(parseBoxShadows("none")).toEqual([]);
  });

  it("reaches as far as a raised card's shade: 60 px below it and 30 px to each side, none above", () => {
    // The Card page's Raised example, as the export paints it (src/style/shadow.ts md: 30 px down, 54 px blur, -24 px spread).
    const raised = paintedMargin({ box: caster().box, casters: [caster()] });
    expect(raised.margin).toEqual({ top: 0, right: 30, bottom: 60, left: 30 });
    expect(raised.by.bottom).toBe('<div> "Lifted above the page" box-shadow 0px 30px 54px -24px');
    // A resting card in a page section, 24 px inside it: 40 px below the card is 16 past the section.
    const section = { left: 265, top: 73, right: 1207, bottom: 192 };
    expect(paintedMargin({ box: section, casters: [caster({ boxShadow: RESTING })] }).margin).toEqual({ top: 0, right: 0, bottom: 16, left: 0 });
  });

  it("takes a lift in: a card a hover moved up 2 px past its column's top, with the raised shade it took", () => {
    // The Card page's Pressable example under the pointer: transform matrix(1, 0, 0, 1, 0, -2).
    const column = { left: 289, top: 97, right: 1183, bottom: 289 };
    const lifted = caster({ box: { left: 289, top: 95, right: 1183, bottom: 183 }, transformed: true });
    const resting = caster({ box: { left: 289, top: 201, right: 1183, bottom: 289 }, boxShadow: RESTING });
    expect(paintedMargin({ box: column, casters: [lifted, resting] }).margin).toEqual({ top: 2, right: 30, bottom: 40, left: 30 });
    // At rest neither moves, and the resting shade sets every side.
    expect(paintedMargin({ box: column, casters: [caster({ box: { left: 289, top: 97, right: 1183, bottom: 185 }, boxShadow: RESTING }), resting] }).margin).toEqual({ top: 0, right: 20, bottom: 40, left: 20 });
  });

  it("scales a shadow with its caster, and cuts it to what clips it inside the element", () => {
    // Scaled 1.5 across and 2 down (a 100 px tall card on screen at 200): every length with it.
    const tall = { left: 289, top: 97, right: 1183, bottom: 297 };
    expect(paintedMargin({ box: tall, casters: [caster({ box: tall, scale: { x: 1.5, y: 2 } })] }).margin).toEqual({ top: 0, right: 45, bottom: 120, left: 45 });
    // Scaled down until its negative spread swallows the shape, it paints nothing.
    expect(paintedMargin({ box: caster().box, casters: [caster({ scale: { x: 1.5, y: 2 } })] }).margin).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
    // A scroller around the card clips its shade 10 px below the card, and not on the sides.
    const clip = { left: null, top: 0, right: null, bottom: 178 };
    expect(paintedMargin({ box: caster().box, casters: [caster({ clip })] }).margin).toEqual({ top: 0, right: 30, bottom: 10, left: 30 });
  });

  it("counts an outline past its offset, and nothing for an inset, a transparent or a vanished shadow", () => {
    expect(paintedMargin({ box: caster().box, casters: [caster({ boxShadow: "none", outline: { width: 2, offset: 2 } })] }).margin).toEqual({ top: 4, right: 4, bottom: 4, left: 4 });
    const none = ["rgb(164, 150, 255) 0px 0px 0px 2px inset", "rgba(0, 0, 0, 0) 0px 20px 44px 0px", "rgb(0, 0, 0) 0px 0px 10px -40px"];
    for (const boxShadow of none) expect(paintedMargin({ box: caster().box, casters: [caster({ boxShadow, box: { left: 0, top: 0, right: 60, bottom: 60 } })] }).margin).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
    // Fractional boxes round up to whole px, without a float's noise adding one.
    expect(paintedMargin({ box: { left: 0, top: 0, right: 10, bottom: 10.25 }, casters: [caster({ box: { left: 0, top: 0, right: 10, bottom: 10.25 }, boxShadow: "rgb(0, 0, 0) 0px 0.1px 0.2px 0px" })] }).margin.bottom).toBe(1);
  });

  it("grows a box by the margin on each side, keeps it inside the bounds, and says which sides the bounds cut", () => {
    const margin = { top: 0, right: 30, bottom: 60, left: 30 };
    const box = { x: 289, y: 97, width: 894, height: 71 };
    expect(marginClip(box, viewport, margin)).toEqual({ x: 259, y: 97, width: 954, height: 131 });
    expect(cutSides(box, marginClip(box, viewport, margin), margin)).toEqual([]);
    // Under a 72 px top bar the margin above a section stops at the bar; the viewport's foot cuts the shade below.
    const low = { x: 252, y: 80, width: 1024, height: 800 };
    const clip = marginClip(low, { left: 0, top: 72, right: 1440, bottom: 900 }, { top: 12, right: 12, bottom: 40, left: 12 });
    expect(clip).toEqual({ x: 240, y: 72, width: 1048, height: 828 });
    expect(cutSides(low, clip, { top: 12, right: 12, bottom: 40, left: 12 })).toEqual(["top", "bottom"]);
  });
});
