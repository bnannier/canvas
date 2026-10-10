import { describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { components, pages } from "./inventory.ts";
import { buildIdentity, findAppConfig, readInstalledAndroid, readInstalledIos, whyRebuild, type Exec, type InstalledBuild } from "./native/installed.ts";
import { BASE_PLACEHOLDER, exportState, formatPlan, parseTurnArgs, planTurn, readExportFingerprint, resolveTarget, runCells, sheetLines, turnScope, type TurnPlan } from "./turn.ts";
import { appendTurnRuns, readTurnRecord, renderTurnRecord, turnProblems, type TurnRun } from "./turn-record.ts";

const FP = (c: string) => c.repeat(64);
const temp = () => mkdtempSync(join(tmpdir(), "canvas-turn-"));

describe("audit:turn arguments", () => {
  it("reads the slug, the phase and the flags, and refuses what does not fit", () => {
    expect(parseTurnArgs(["--", "--slug=button", "--phase=before", "--web-only", "--only-first=3", "--workers=4", "--devices=ios:ABC"])).toMatchObject({
      slug: "button",
      phase: "before",
      webOnly: true,
      nativeOnly: false,
      onlyFirst: 3,
      workers: "4",
      devices: "ios:ABC",
      errors: [],
    });
    expect(parseTurnArgs([]).errors).toEqual(["--slug is required", "--phase is required (before or after)"]);
    expect(parseTurnArgs(["--slug=button", "--phase=during"]).errors).toEqual(['--phase takes before or after, not "during"']);
    expect(parseTurnArgs(["--slug=button", "--phase=after", "--web-only", "--native-only"]).errors).toEqual(["--web-only and --native-only exclude each other (pass neither for both)"]);
    expect(parseTurnArgs(["--slug=button", "--phase=after", "--only-first=0", "--dry-run=yes", "--colour=red", "loose"]).errors).toEqual([
      '--only-first takes a positive whole number, not "0"',
      "--dry-run takes no value",
      "unknown flag --colour",
      'unexpected argument "loose"',
    ]);
    expect(parseTurnArgs(["--help"])).toMatchObject({ help: true, errors: [] });
  });
});

describe("what a turn captures", () => {
  it("resolves a component, a page by id or slug, and a foundation by id or name, canonical names first", () => {
    expect(resolveTarget("button")).toMatchObject({ kind: "component", id: "button", checklist: "audit/components/button.md" });
    expect(resolveTarget("template-signin")).toMatchObject({ kind: "page", id: "template-signin", checklist: "audit/pages/template-signin.md" });
    expect(resolveTarget("signin")).toMatchObject({ kind: "page", id: "template-signin" });
    expect(resolveTarget("glass-pane")).toMatchObject({ kind: "foundation", id: "glass-pane", title: "GlassPane", checklist: "audit/foundation/glass-pane.md" });
    expect(resolveTarget("GlassPane")).toMatchObject({ kind: "foundation", id: "glass-pane" });
    expect(() => resolveTarget("nothing-here")).toThrow(/names no component, page or foundation/);
    // A component has no name but its slug, so the slug it shares with a page names the
    // component, and the page goes by its id: Calendar and template-calendar.
    expect(resolveTarget("calendar")).toMatchObject({ kind: "component", id: "calendar", checklist: "audit/components/calendar.md" });
    expect(resolveTarget("template-calendar")).toMatchObject({ kind: "page", id: "template-calendar" });
    // A component whose slug a foundation's id also were keeps it; the foundation goes by its name.
    const clash = [...components(), { ...components()[0]!, slug: "glass-pane", name: "Impostor" }];
    expect(resolveTarget("glass-pane", clash, pages())).toMatchObject({ kind: "component", id: "glass-pane" });
    expect(resolveTarget("GlassPane", clash, pages())).toMatchObject({ kind: "foundation", id: "glass-pane" });
    // A page slug two pages share names neither: each goes by its id.
    const twin = [...pages(), { ...pages().find((p) => p.id === "template-signin")!, kind: "pattern" as const, id: "pattern-signin" }];
    expect(() => resolveTarget("signin", components(), twin)).toThrow("--slug=signin is the slug of 2 pages; name one by its id (template-signin, pattern-signin)");
  });

  it("plans the Calendar component's turn without its template page, on every device and in the analysis", () => {
    const calendar = resolveTarget("calendar");
    const plan = planTurn({ webOnly: false, nativeOnly: false, noBuild: false, devices: null, workers: null }, calendar, "before", turnScope(calendar, null));
    expect(plan.slugs).toEqual(["calendar"]);
    const native = plan.steps.find((s) => s.kind === "native")!;
    expect(native.kind === "native" && native.cellsPerPlatform).toBe(components().find((c) => c.slug === "calendar")!.variants.length * 6);
    expect(plan.steps.some((s) => s.kind === "capture" && s.run === "pages")).toBe(false);
  });

  it("expands a foundation to its Capture through list, capped by --only-first, and refuses a cap on anything else", () => {
    const foundation = resolveTarget("glass-pane");
    const through = { components: ["chip", "emblem", "autocomplete", "button"], pages: ["pattern-glass"] };
    expect(turnScope(foundation, null, through)).toEqual({ components: ["chip", "emblem", "autocomplete", "button"], pages: ["pattern-glass"], capped: null });
    expect(turnScope(foundation, 2, through)).toEqual({ components: ["chip", "emblem"], pages: [], capped: { total: 5, kept: 2 } });
    expect(turnScope(foundation, 5, through)).toEqual({ components: ["chip", "emblem", "autocomplete", "button"], pages: ["pattern-glass"], capped: null });
    expect(() => turnScope(foundation, null, { components: [], pages: [] })).toThrow(/nothing in its Capture through list/);
    expect(() => turnScope(resolveTarget("button"), 2)).toThrow(/--only-first caps a foundation's Capture through list; button is a component/);
    expect(turnScope(resolveTarget("signin"), null)).toEqual({ components: [], pages: ["template-signin"], capped: null });
    // A real foundation's list comes from its facts: GlassPane's direct consumers come first.
    const real = turnScope(foundation, 3);
    expect(real.capped?.kept).toBe(3);
    expect(real.components).toHaveLength(3);
  });
});

describe("a turn's plan", () => {
  const button = resolveTarget("button");
  const plan = (args: Partial<Parameters<typeof planTurn>[0]>, scope = turnScope(button, null), target = button): TurnPlan =>
    planTurn({ webOnly: false, nativeOnly: false, noBuild: false, devices: null, workers: null, ...args }, target, "before", scope);

  it("runs the export, the server, the variants and the states, the native check and capture, then the analysis, the record and the sheets", () => {
    const full = plan({});
    expect(full.steps.map((s) => (s.kind === "capture" ? `capture:${s.run}` : s.kind))).toEqual([
      "export",
      "serve",
      "capture:variants",
      "capture:states",
      "native-build",
      "native",
      "post",
      "post",
      "post",
      "record",
      "sheets",
    ]);
    const argvs = full.steps.flatMap((s) => ("argv" in s ? [s.argv.join(" ")] : []));
    expect(argvs).toEqual([
      `bun run audit:web -- --only=button --base=${BASE_PLACEHOLDER}`,
      `bun run audit:web -- --states --only=button --base=${BASE_PLACEHOLDER}`,
      "bun run audit:native:build -- --platform=ios,android --incremental",
      "bun run audit:native -- --platform=ios,android --only=button",
      "bun run audit:analyze -- --only=button",
      "bun run audit:sheets -- --only=button",
      "bun run audit:index -- --only=button",
    ]);
    const variants = full.steps.find((s) => s.kind === "capture" && s.run === "variants")!;
    expect(variants.kind === "capture" && variants.cells).toBe(components().find((c) => c.slug === "button")!.variants.length * 18);
    const native = full.steps.find((s) => s.kind === "native")!;
    expect(native.kind === "native" && native.cellsPerPlatform).toBe(components().find((c) => c.slug === "button")!.variants.length * 6);
  });

  it("leaves the devices out with --web-only, the web out with --native-only, and passes --devices and --workers on", () => {
    expect(plan({ webOnly: true }).steps.some((s) => s.kind === "native" || s.kind === "native-build")).toBe(false);
    const native = plan({ nativeOnly: true, devices: "ios:ABC,android:emulator-5554" });
    expect(native.steps.some((s) => s.kind === "export" || s.kind === "serve" || s.kind === "capture")).toBe(false);
    expect(native.steps.flatMap((s) => ("argv" in s ? [s.argv.join(" ")] : [])).slice(0, 2)).toEqual([
      "bun run audit:native:build -- --platform=ios,android --incremental --devices=ios:ABC,android:emulator-5554",
      "bun run audit:native -- --platform=ios,android --only=button --devices=ios:ABC,android:emulator-5554",
    ]);
    const workers = plan({ webOnly: true, workers: "3" });
    expect(workers.steps.filter((s) => s.kind === "capture").every((s) => "argv" in s && s.argv.includes("--workers=3"))).toBe(true);
  });

  it("captures the states of the components that have recipes only, and the pages with --pages", () => {
    const foundation = resolveTarget("glass-pane");
    const scope = { components: ["emblem", "chip"], pages: ["pattern-glass"], capped: null };
    const steps = plan({ webOnly: true }, scope, foundation).steps;
    const argvs = steps.flatMap((s) => (s.kind === "capture" ? [s.argv.join(" ")] : []));
    expect(argvs).toEqual([
      `bun run audit:web -- --only=emblem,chip --base=${BASE_PLACEHOLDER}`,
      `bun run audit:web -- --states --only=chip --base=${BASE_PLACEHOLDER}`,
      `bun run audit:web -- --pages --only=pattern-glass --base=${BASE_PLACEHOLDER}`,
    ]);
    expect(steps.find((s) => s.kind === "post")).toMatchObject({ argv: ["bun", "run", "audit:analyze", "--", "--only=emblem,chip,pattern-glass"] });
  });

  it("prints the plan a dry run shows, reading no device", () => {
    const lines = formatPlan(plan({}), { export: { kind: "stale", embedded: FP("a"), checkout: FP("b"), detail: "entry" }, source: FP("b"), native: FP("c") });
    const text = lines.join("\n");
    expect(lines[0]).toBe("audit:turn button (component: Button), phase before");
    expect(text).toContain("docs/dist is stale now (embeds aaaaaaaaaaaa, this checkout is bbbbbbbbbbbb): rebuilt");
    expect(text).toContain("a dry run touches no device, so the installed builds are not read here");
    expect(text).toContain("source fingerprint bbbbbbbbbbbb, native cccccccccccc");
    expect(text).toContain(`append every run id the steps made to audit/turns/button.md under "before"`);
    const capped = formatPlan(plan({ webOnly: true, noBuild: true }, { components: ["chip"], pages: [], capped: { total: 73, kept: 1 } }, resolveTarget("glass-pane")), { export: { kind: "missing", embedded: null, checkout: FP("b"), detail: "docs/dist holds no export" }, source: FP("b"), native: FP("c") });
    expect(capped.join("\n")).toContain("capped by --only-first to the first 1 of 73");
    expect(capped.join("\n")).toContain("docs/dist is missing now (docs/dist holds no export): refused (--no-build)");
  });
});

describe("the web export the turn serves", () => {
  function dist(entryBody: string | null, index = true): string {
    const root = temp();
    const dir = join(root, "docs", "dist");
    mkdirSync(join(dir, "_expo", "static", "js", "web"), { recursive: true });
    if (index) writeFileSync(join(dir, "index.html"), `<html><script src="/_expo/static/js/web/entry-0123abcd.js" defer></script></html>`);
    if (entryBody !== null) writeFileSync(join(dir, "_expo", "static", "js", "web", "entry-0123abcd.js"), entryBody);
    return root;
  }

  it("reads the source fingerprint the entry bundle embeds, and calls the export fresh, stale, missing or unreadable", () => {
    const embedded = `var c=JSON.parse("{\\"extra\\":{\\"canvasBuild\\":{\\"sourceDirty\\":true,\\"sourceFingerprint\\":\\"${FP("a")}\\",\\"packageName\\":\\"@nannier/canvas\\"}}}")`;
    const roots = [dist(embedded), dist(`${embedded};${embedded.replace(FP("a"), FP("d"))}`), dist(null), dist(embedded, false)];
    try {
      expect(readExportFingerprint(join(roots[0]!, "docs", "dist"))).toEqual({ fingerprint: FP("a"), detail: "/_expo/static/js/web/entry-0123abcd.js" });
      expect(exportState(roots[0]!, FP("a"))).toMatchObject({ kind: "fresh", embedded: FP("a") });
      expect(exportState(roots[0]!, FP("b"))).toMatchObject({ kind: "stale", embedded: FP("a"), checkout: FP("b") });
      expect(exportState(roots[1]!, FP("a"))).toMatchObject({ kind: "unreadable", detail: "/_expo/static/js/web/entry-0123abcd.js embeds 2 different source fingerprints" });
      expect(exportState(roots[2]!, FP("a"))).toMatchObject({ kind: "unreadable", detail: "docs/dist/index.html loads /_expo/static/js/web/entry-0123abcd.js, which docs/dist does not hold" });
      expect(exportState(roots[3]!, FP("a"))).toMatchObject({ kind: "missing" });
    } finally {
      for (const root of roots) rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("what the turn records", () => {
  const run = (over: Partial<TurnRun> = {}): TurnRun => ({
    runId: "20261010-041055-web-b70acdf",
    kind: "variants",
    platform: "web",
    recorded: "2026-10-10T04:14:00.000Z",
    commit: "b70acdf dirty",
    status: "complete",
    cells: "270 of 270: 270 ok, 0 failed",
    slugs: "button",
    ...over,
  });

  it("reads a run's cells off its manifest, and whether it captured all it planned", () => {
    expect(runCells("web", { status: "complete", planned: { cells: 270 }, results: { cells: 270, ok: 270, failed: 0, notReached: 0 } })).toEqual({ text: "270 of 270: 270 ok, 0 failed", whole: true });
    expect(runCells("web", { status: "complete", planned: { cells: 24 }, results: { cells: 24, ok: 20, failed: 0, notReached: 4 } })).toEqual({ text: "24 of 24: 20 ok, 0 failed, 4 not reached", whole: true });
    expect(runCells("web", { status: "incomplete", planned: { cells: 270 }, results: { cells: 268, ok: 266, failed: 2 } }).whole).toBe(false);
    expect(runCells("ios", { queued: 90, summary: { cells: 90, ok: 89, unstable: 1, failed: 0 } })).toEqual({ text: "90 of 90: 89 ok, 1 unstable, 0 failed", whole: true });
    expect(runCells("android", { queued: 90, refused: "stale", summary: { cells: 0, ok: 0, unstable: 0, failed: 0 } }).whole).toBe(false);
    expect(runCells("web", null)).toEqual({ text: "no manifest", whole: false });
  });

  it("appends runs under their phase, keeps the earlier ones, and reads them back", () => {
    const first = appendTurnRuns(null, "button", "Button (component)", "audit/components/button.md", "before", [run()]);
    const second = appendTurnRuns(first, "button", "Button (component)", "audit/components/button.md", "before", [run({ runId: "20261010T050000Z-ios-b70acdf", kind: "native", platform: "ios", commit: "b70acdf", cells: "90 of 90: 90 ok, 0 unstable, 0 failed" })]);
    const third = appendTurnRuns(second, "button", "Button (component)", "audit/components/button.md", "after", [run({ runId: "20261011-010101-web-c0ffee1", commit: "c0ffee1" })]);
    const record = readTurnRecord(third);
    expect(record.malformed).toEqual([]);
    expect(record.phases.before.map((r) => r.runId)).toEqual(["20261010-041055-web-b70acdf", "20261010T050000Z-ios-b70acdf"]);
    expect(record.phases.before[0]).toEqual(run());
    expect(record.phases.after.map((r) => r.runId)).toEqual(["20261011-010101-web-c0ffee1"]);
    expect(third).toContain("# Turn record: Button (component)");
    expect(third).not.toContain(String.fromCharCode(0x2014));
    expect(renderTurnRecord("button", "Button (component)", "audit/components/button.md", record.phases)).toBe(third);
  });

  it("names every row it cannot read, refuses to append to such a record, and the check finds orphans", () => {
    const good = appendTurnRuns(null, "button", "Button (component)", "audit/components/button.md", "before", [run()]);
    const bad = good
      .replace("| `20261010-041055-web-b70acdf` | variants | web |", "| `20261010-041055-web-b70acdf` | native | web |")
      .replace("## after\n\n| Run id", "## after\n\n| `not-a-run` | variants | web | x | `abc1234` | complete | 1 | button |\n\n| Run id");
    const record = readTurnRecord(bad);
    expect(record.malformed.map((m) => m.reason)).toEqual([
      "a native run on web: the web takes variants, states and pages, a device takes native",
      expect.stringContaining("the turn header reads"),
    ]);
    expect(() => appendTurnRuns(bad, "button", "Button (component)", "audit/components/button.md", "after", [run()])).toThrow(/has lines it cannot read/);
    expect(readTurnRecord("# nothing\n").malformed.map((m) => m.reason)).toEqual(['no "## before" table (`| Run id | Kind | Platform | Recorded | Commit | Status | Cells | Slugs |`)', 'no "## after" table (`| Run id | Kind | Platform | Recorded | Commit | Status | Cells | Slugs |`)']);
    const dir = temp();
    try {
      mkdirSync(join(dir, "turns"));
      writeFileSync(join(dir, "turns", "button.md"), good);
      writeFileSync(join(dir, "turns", "gone.md"), good);
      writeFileSync(join(dir, "turns", "chip.md"), bad);
      const problems = turnProblems(dir, new Set(["button", "chip"]));
      expect(problems[0]).toMatch(/^audit\/turns\/chip\.md:\d+: a native run on web/);
      expect(problems.at(-1)).toBe('orphan turn record audit/turns/gone.md: no component, page or foundation is called "gone" (delete it, or restore its checklist)');
      expect(problems).toHaveLength(3);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("prints the index and every sheet directory a slug has", () => {
    const root = temp();
    try {
      const sheets = join(root, ".audit", "current", "button", "sheets");
      mkdirSync(join(sheets, "default"), { recursive: true });
      writeFileSync(join(root, ".audit", "current", "button", "index.md"), "#");
      for (const n of [10, 1, 2]) writeFileSync(join(sheets, `states-${n}.jpg`), "");
      writeFileSync(join(sheets, "default", "card-solid.jpg"), "");
      writeFileSync(join(sheets, "default", "card-glass.jpg"), "");
      expect(sheetLines(root, "button")).toEqual([
        "  .audit/current/button/index.md",
        "  .audit/current/button/sheets/: states-1.jpg, states-2.jpg, states-10.jpg",
        "  .audit/current/button/sheets/default/: card-glass.jpg, card-solid.jpg",
      ]);
      expect(sheetLines(root, "chip")).toEqual(["  .audit/current/chip/: no index (nothing captured for it)"]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("the installed audit build (tools/audit/native/installed.ts)", () => {
  const config = (source: string | null, native: string | null) => JSON.stringify({ name: "Canvas Audit", extra: { canvasBuild: { sourceFingerprint: source, nativeFingerprint: native } } });
  const checkout = { source: FP("a"), native: FP("b") };
  const build = (over: Partial<InstalledBuild>): InstalledBuild => ({ platform: "ios", installed: true, sourceFingerprint: FP("a"), nativeFingerprint: FP("b"), embeddedBundle: true, where: "/x", ...over });

  it("reuses only a Release build of this checkout's source and native inputs", () => {
    expect(buildIdentity(config(FP("a"), FP("b")))).toEqual({ sourceFingerprint: FP("a"), nativeFingerprint: FP("b") });
    expect(buildIdentity(config("short", null))).toEqual({ sourceFingerprint: null, nativeFingerprint: null });
    expect(whyRebuild(build({}), checkout)).toBeNull();
    expect(whyRebuild(build({ installed: false }), checkout)).toBe("com.nannier.canvas.audit is not installed");
    expect(whyRebuild(build({ embeddedBundle: false }), checkout)).toMatch(/no embedded JS bundle \(a Debug build/);
    expect(whyRebuild(build({ sourceFingerprint: FP("c") }), checkout)).toBe("the installed build is stale: built from source fingerprint cccccccccccc, this checkout is aaaaaaaaaaaa");
    expect(whyRebuild(build({ nativeFingerprint: null }), checkout)).toMatch(/no native fingerprint/);
    expect(whyRebuild(build({ nativeFingerprint: FP("c") }), checkout)).toMatch(/native project is stale: generated from native inputs cccccccccccc/);
  });

  it("reads an iOS install from its app container on this Mac", async () => {
    const root = temp();
    try {
      const app = join(root, "CanvasAudit.app");
      mkdirSync(join(app, "EXConstants.bundle"), { recursive: true });
      writeFileSync(join(app, "EXConstants.bundle", "app.config"), config(FP("a"), FP("b")));
      writeFileSync(join(app, "main.jsbundle"), "");
      const calls: string[][] = [];
      const exec: Exec = async (command, args) => {
        calls.push([command, ...args]);
        return Buffer.from(`${app}\n`);
      };
      expect(await readInstalledIos("UDID-1", exec)).toEqual({ platform: "ios", installed: true, sourceFingerprint: FP("a"), nativeFingerprint: FP("b"), embeddedBundle: true, where: app });
      expect(calls).toEqual([["xcrun", "simctl", "get_app_container", "UDID-1", "com.nannier.canvas.audit", "app"]]);
      expect(findAppConfig(root)).toBe(join(app, "EXConstants.bundle", "app.config"));
      const missing: Exec = async () => {
        throw new Error("No such app");
      };
      expect(await readInstalledIos("UDID-1", missing)).toMatchObject({ installed: false, embeddedBundle: false });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("reads an Android install from its pulled base APK", async () => {
    const calls: string[][] = [];
    const exec = (bundle: boolean): Exec => async (command, args) => {
      calls.push([command.endsWith("adb") ? "adb" : command, ...args]);
      if (args.includes("pm")) return Buffer.from("package:/data/app/~~x/com.nannier.canvas.audit-y/base.apk\npackage:/data/app/~~x/com.nannier.canvas.audit-y/split_config.arm64_v8a.apk\n");
      if (args[0] === "-p") return Buffer.from(config(FP("a"), FP("b")));
      if (args[0] === "-l") {
        if (!bundle) throw new Error("caution: filename not matched");
        return Buffer.from("  1234  2026-10-10 00:00   assets/index.android.bundle\n");
      }
      return Buffer.from("");
    };
    const release = await readInstalledAndroid("emulator-5554", exec(true));
    expect(release).toEqual({ platform: "android", installed: true, sourceFingerprint: FP("a"), nativeFingerprint: FP("b"), embeddedBundle: true, where: "/data/app/~~x/com.nannier.canvas.audit-y/base.apk" });
    expect(calls[0]).toEqual(["adb", "-s", "emulator-5554", "shell", "pm", "path", "com.nannier.canvas.audit"]);
    expect(calls[1]!.slice(0, 5)).toEqual(["adb", "-s", "emulator-5554", "pull", "/data/app/~~x/com.nannier.canvas.audit-y/base.apk"]);
    expect(calls[2]![0]).toBe("unzip");
    expect((await readInstalledAndroid("emulator-5554", exec(false))).embeddedBundle).toBe(false);
    const none: Exec = async () => Buffer.from("");
    expect(await readInstalledAndroid("emulator-5554", none)).toMatchObject({ installed: false });
  });
});
