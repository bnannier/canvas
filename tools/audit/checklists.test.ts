import { describe, expect, it } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { COMPONENTS } from "../../docs/src/core/data/components.ts";
import { ROOT } from "../../e2e/support/routes.ts";
import {
  FACTS_BEGIN,
  FACTS_END,
  VARIANTS_BEGIN,
  VARIANTS_END,
  captureCells,
  checkChecklists,
  defaultSources,
  findBlock,
  mergeChecklist,
  orphanChecklists,
  FINDING_STATUSES,
  pageVariantRows,
  parseVariantsTable,
  readFindings,
  readVariantsTable,
  renderComponentFacts,
  renderPageFacts,
  renderVariantsTable,
  variantsHeader,
  writeChecklists,
  type ChecklistSources,
} from "./checklists.ts";
import { readSignOffs } from "./sign-off.ts";
import {
  UnreadableImport,
  codeLiterals,
  componentFacts,
  drivesRoute,
  isSourceModule,
  isSpecFile,
  isTestFile,
  kitImportsOf,
  importsComponent,
  pageFacts,
  pageKitNames,
  testingRoutes,
  touchTargetVocabulary,
  type PageFacts,
} from "./facts.ts";
import { NATIVE_CELLS_PER_VARIANT, WEB_CELLS_PER_VARIANT, cellId, cellsFor, components, pageCellId, pages, sectionKeys } from "./inventory.ts";
import { COMPONENT_PLANS, FAMILY_CHECKLISTS, STYLE_LAYER_RENDERABLES, UNIVERSAL_RUBRIC } from "./plan-specifics.ts";
import { auditStatus, checklistStatus, formatStatus } from "./status.ts";
import { splitRow } from "./table.ts";

// The facts read the kit's built prop surface for the hand-off parity records (through
// tools/handoff-parity/compare.ts), so the cases that write real checklists need dist/.
// CI and the pre-push hook build before testing; without a build they are skipped, the
// way the dist smoke test is, and the cases below that read no facts still run.
const hasDist = existsSync(join(ROOT, "dist", "index.d.ts"));

// The real inventory and facts, narrowed to a few routes so each case writes a handful
// of files rather than all 128. The facts corpus is loaded once for the whole file.
const all = hasDist ? defaultSources() : null;
const sources: ChecklistSources = all
  ? {
      components: all.components.filter((c) => ["avatar", "button", "view", "line-chart"].includes(c.slug)),
      pages: all.pages.filter((p) => ["pattern-glass", "template-activity"].includes(p.id)),
      foundations: all.foundations.filter((f) => ["glass-modal-blur-target", "theme-provider"].includes(f.id)),
      corpus: all.corpus,
      foundationSources: all.foundationSources,
    }
  : (null as never);

function temp(): string {
  return mkdtempSync(join(tmpdir(), "canvas-audit-"));
}

const read = (dir: string, file: string) => readFileSync(join(dir, file), "utf8");

describe("the audit inventory", () => {
  it("lists every component page with its variants and every pattern and template page", () => {
    const list = components();
    expect(list.length).toBe(COMPONENTS.length);
    expect(list.reduce((n, c) => n + c.variants.length, 0)).toBeGreaterThan(500);
    const button = list.find((c) => c.slug === "button")!;
    expect(button.variants[0]).toEqual({ slug: "button", label: "Default", variant: "default", path: "/components/button" });
    expect(button.variants.every((v) => /^[a-z0-9]+$/.test(v.variant))).toBe(true);
    const ids = pages().map((p) => p.id);
    expect(ids.length).toBe(24);
    expect(ids).toContain("pattern-glass");
    expect(ids).toContain("template-signin");
  });

  it("names 18 web and 6 native cells per variant, by one id scheme", () => {
    expect(WEB_CELLS_PER_VARIANT).toBe(18);
    expect(NATIVE_CELLS_PER_VARIANT).toBe(6);
    const cells = cellsFor("button", "primary");
    expect(cells.length).toBe(30);
    expect(cellId({ platform: "web", slug: "button", variant: "primary", width: "phone", look: "dark", surface: "glass" })).toBe("web/button/primary/phone.dark.glass");
    expect(cellId({ platform: "ios", slug: "button", variant: "primary", look: "mint", surface: "solid" })).toBe("ios/button/primary/mint.solid");
    expect(pageCellId({ platform: "web", page: "template-signin", width: "desktop", look: "blush", surface: "solid" })).toBe("web-pages/template-signin/desktop.blush.solid");
    expect(pageCellId({ platform: "android", page: "pattern-glass", look: "dark", surface: "glass" })).toBe("android-pages/pattern-glass/dark.glass");
    expect(new Set(cells.map(cellId)).size).toBe(30);
  });

  it("has a plan row for every component page and only for component pages", () => {
    const slugs = COMPONENTS.map((c) => c.slug).sort();
    expect(COMPONENT_PLANS.map((p) => p.slug).sort()).toEqual(slugs);
    expect(UNIVERSAL_RUBRIC.length).toBe(11);
    for (const plan of COMPONENT_PLANS) {
      expect(plan.families.length).toBeGreaterThan(0);
      expect(plan.specifics.length).toBeGreaterThan(0);
      for (const family of plan.families) expect(FAMILY_CHECKLISTS[family].length).toBeGreaterThan(0);
    }
  });
});

describe.skipIf(!hasDist)("the audit checklists", () => {
  it("writes one file per route, passes its own check, and changes nothing on a second write", () => {
    const dir = temp();
    try {
      const first = writeChecklists(dir, sources);
      expect(first.seeded.sort()).toEqual([
        "components/avatar.md",
        "components/button.md",
        "components/line-chart.md",
        "components/view.md",
        "foundation/glass-modal-blur-target.md",
        "foundation/theme-provider.md",
        "pages/pattern-glass.md",
        "pages/template-activity.md",
      ]);
      expect(checkChecklists(dir, sources)).toEqual([]);
      const before = Object.fromEntries(first.seeded.map((file) => [file, read(dir, file)]));
      const second = writeChecklists(dir, sources);
      expect({ ...second, unchanged: second.unchanged.sort() }).toEqual({ seeded: [], updated: [], unchanged: first.seeded, refused: [] });
      for (const file of first.seeded) expect(read(dir, file)).toBe(before[file]);
      // The seed carries the plan's sections and the sign-off rows.
      const avatar = read(dir, "components/avatar.md");
      expect(avatar).toContain("### Media and identity");
      expect(avatar).toContain("- [ ] divergence misreport (K4)");
      expect(avatar).toContain("| android |  |  |  |  |");
      expect(avatar).toContain("| Platform entries | iOS: web build: Avatar, AvatarGroup; own build: AvatarMenu");
      // The hand-off records are read from divergences.json; a record with no redirect
      // target (the report's dash) reads as the word none.
      expect(avatar).toContain("Avatar.size (Boolean axis: `small`, `large`)");
      expect(avatar).not.toContain(String.fromCharCode(0x2014));
      // A page's section rows are keyed by the section title's slug, not its position.
      const glass = read(dir, "pages/pattern-glass.md");
      expect(glass).toContain("| `page` | Whole page | [ ] | [ ] | [ ] |  |");
      expect(glass).toContain("| `livecomparison` | Live comparison | [ ] | [ ] | [ ] |  |");
      expect(glass).not.toContain("`section-");
      // Every checklist links the turn record audit:turn writes for it.
      expect(read(dir, "components/button.md")).toContain("| Turn record | `audit/turns/button.md`, written by `bun run audit:turn -- --slug=button --phase=before\\|after`");
      expect(glass).toContain("| Turn record | `audit/turns/pattern-glass.md`");
      // A foundation's checklist: its facts and consumers, the contract rubric, no variants table.
      const bridge = read(dir, "foundation/glass-modal-blur-target.md");
      expect(bridge).toContain("# GlassModalBlurTarget (foundation)");
      expect(bridge).toContain("| Public exports | 1: `GlassModalBlurTarget` (component) |");
      expect(bridge).toContain("| K12-2 status | 1 public: GlassModalBlurTarget |");
      expect(bridge).toContain("| Docs planned | `integration`: GlassModalBlurTarget |");
      expect(bridge).toContain("| `drawer` | directly | `GlassModalBlurTarget` |");
      expect(bridge).toContain("| `sidebar` | through other kit components | `drawer` |");
      expect(bridge).toMatch(/\| Capture through \| \d+, in this order: components `action-sheet`, `drawer`, /);
      expect(bridge).toContain("## Contract rubric");
      expect(bridge).toContain("- [ ] 5. **Accessibility it provides or must not break** (A, S, N)");
      expect(bridge).toContain("- [ ] K12-5: documented on `integration`");
      expect(bridge).not.toContain(VARIANTS_BEGIN);
      expect(bridge).toContain("| android |  |  |  |  |");
      expect(bridge).not.toContain(String.fromCharCode(0x2014));
      const theme = read(dir, "foundation/theme-provider.md");
      expect(theme).toContain("| K12-2 status | 6 public: Surface, ThemeProvider, ThemeProviderProps, ThemeTokenOverrides, ThemeValue, useTheme |");
      expect(theme).toContain('| Documented on | `theming`: ThemeProvider, useTheme ("Native (ThemeProvider)") |');
      expect(theme).toContain("| Pages using it | `pattern-accessibility` (useTheme), `pattern-glass` (ThemeProvider, useTheme) |");
      expect(theme).toContain("| Not captured | guide pages, which the capture inventory (component, pattern and template pages) does not hold: `/theming`");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("refuses a variants table in a foundation's checklist, and keeps its hand-maintained sections", () => {
    const dir = temp();
    try {
      writeChecklists(dir, sources);
      const file = "foundation/theme-provider.md";
      const edited = read(dir, file)
        .replace("- [ ] 6. **Performance**", "- [x] 6. **Performance**")
        .replace("|---|---|---|---|---|---|\n\n## Sign-off", "|---|---|---|---|---|---|\n| TP-1 | medium | web/card/default/phone.dark.glass | a finding seen through a consumer | open |  |\n| TP-2 | low | source | read in theme.tsx | open |  |\n\n## Sign-off");
      writeFileSync(join(dir, file), edited);
      expect(writeChecklists(dir, sources).unchanged).toContain(file);
      expect(read(dir, file)).toBe(edited);
      expect(checkChecklists(dir, sources)).toEqual([]);
      const status = auditStatus(dir).find((s) => s.file === file)!;
      expect(status).toMatchObject({ variants: { total: 0, web: 0, ios: 0, android: 0 }, items: { ticked: 1 }, findings: { total: 2, open: 2 }, unreadable: [] });
      // A cell of a component that does not render through it is not one of its capture ids.
      const outside = edited.replace("web/card/default/phone.dark.glass", "web/view/default/phone.dark.glass");
      writeFileSync(join(dir, file), outside);
      expect(checkChecklists(dir, sources)).toEqual([expect.stringContaining(`audit/${file}:`) as unknown as string]);
      // A variants block is refused, not guessed at.
      writeFileSync(join(dir, file), `${edited}\n${VARIANTS_BEGIN}\n${VARIANTS_END}\n`);
      expect(checkChecklists(dir, sources)).toEqual([`audit/${file}: a variants table, which a foundation's checklist does not have (it is captured through its consumers); remove the variants block`]);
      expect(writeChecklists(dir, sources).refused.map((r) => r.file)).toEqual([file]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("keeps a reviewer's ticks, notes, findings and sign-offs through a regeneration", () => {
    const dir = temp();
    try {
      writeChecklists(dir, sources);
      const file = "components/button.md";
      const edited = read(dir, file)
        .replace("| `default` | Default | [ ] | [ ] | [ ] |  |", "| `default` | Default | [x] | [ ] | [x] | phone glass dark is soft |")
        .replace("- [ ] 7. **Materials**", "- [x] 7. **Materials**")
        .replace("|---|---|---|---|---|---|\n\n## Sign-off", "|---|---|---|---|---|---|\n| BTN-1 | high | web/button/default/phone.dark.glass | label clipped | open |  |\n\n## Sign-off")
        .replace("| web |  |  |  |  |", "| web | 20261009-web-abc1234 | bn | 2026-10-09 | pass |");
      writeFileSync(join(dir, file), edited);
      expect(writeChecklists(dir, sources).unchanged).toContain(file);
      expect(read(dir, file)).toBe(edited);
      // A label change keeps the row's ticks: the row is keyed by variant, not label.
      const relabelled = {
        ...sources,
        components: sources.components.map((c) =>
          c.slug === "button" ? { ...c, variants: c.variants.map((v, i) => (i === 0 ? { ...v, label: "Usage" } : v)) } : c,
        ),
      };
      expect(writeChecklists(dir, relabelled).updated).toEqual([file]);
      expect(read(dir, file)).toContain("| `default` | Usage | [x] | [ ] | [x] | phone glass dark is soft |");
      const status = checklistStatus(file, read(dir, file));
      expect(status.variants).toEqual({ total: sources.components.find((c) => c.slug === "button")!.variants.length, web: 1, ios: 0, android: 1 });
      expect(status.items.ticked).toBe(1);
      expect(status.findings).toEqual({ total: 1, open: 1, bySeverity: { high: 1 }, byStatus: { open: 1 } });
      expect(status.signedOff).toEqual(["web"]);
      expect(auditStatus(dir).length).toBe(8);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("fails the check on a missing checklist, an orphan, stale facts, drifted variants and a missing sign-off", () => {
    const dir = temp();
    try {
      writeChecklists(dir, sources);
      unlinkSync(join(dir, "components/view.md"));
      mkdirSync(join(dir, "pages"), { recursive: true });
      writeFileSync(join(dir, "pages/template-gone.md"), "# gone\n");
      const avatar = join(dir, "components/avatar.md");
      writeFileSync(avatar, read(dir, "components/avatar.md").replace("| Overlay recipe | none |", "| Overlay recipe | yes |"));
      const button = join(dir, "components/button.md");
      writeFileSync(button, read(dir, "components/button.md").replace("| `default` | Default |", "| `usage` | Default |"));
      const chart = join(dir, "components/line-chart.md");
      writeFileSync(chart, read(dir, "components/line-chart.md").split("\n## Sign-off")[0]);
      const keys = sources.components.find((c) => c.slug === "button")!.variants.map((v) => v.variant);
      const errors = checkChecklists(dir, sources);
      expect(errors.sort()).toEqual([
        "audit/components/avatar.md: stale facts block (run `bun run audit:checklists`)",
        `audit/components/button.md: variant rows drift from the inventory (expected ${keys.join(", ")}; found ${["usage", ...keys.slice(1)].join(", ")}; run \`bun run audit:checklists\`)`,
        "audit/components/line-chart.md: sign-off section missing (a \"## Sign-off\" heading with a row per platform: web, ios, android)",
        "no checklist at audit/components/view.md (run `bun run audit:checklists`)",
        "orphan checklist audit/pages/template-gone.md: no docs route or foundation calls for it (delete it, or restore the route)",
      ]);
      // A write repairs the generated blocks and the missing file, and leaves the rest to hand.
      const repaired = writeChecklists(dir, sources);
      expect(repaired.seeded).toEqual(["components/view.md"]);
      expect(repaired.updated.sort()).toEqual(["components/avatar.md", "components/button.md"]);
      expect(checkChecklists(dir, sources)).toEqual([
        "audit/components/line-chart.md: sign-off section missing (a \"## Sign-off\" heading with a row per platform: web, ios, android)",
        "orphan checklist audit/pages/template-gone.md: no docs route or foundation calls for it (delete it, or restore the route)",
      ]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("refuses to merge into a file whose markers are gone, rather than guess", () => {
    expect(() => mergeChecklist("# x\n\nno markers\n", ["| a | b |"], [{ key: "default", label: "Default" }], "components/x.md")).toThrow(/facts block markers/);
    const facts = `${FACTS_BEGIN}\n| a | b |\n${FACTS_END}`;
    expect(() => mergeChecklist(`# x\n\n${facts}\n`, ["| a | b |"], [], "components/x.md")).toThrow(/variants table markers/);
    // A pipe in a note is escaped once, and an escaped pipe survives a re-render as is.
    const table = renderVariantsTable([{ key: "default", label: "Default" }], new Map([["default", { web: "[x]", ios: "[ ]", android: "[ ]", notes: "n | o" }]]));
    const block = findBlock(`${VARIANTS_BEGIN}\n${table.join("\n")}\n${VARIANTS_END}`, VARIANTS_BEGIN, VARIANTS_END)!;
    const parsed = parseVariantsTable(block.lines);
    expect([...parsed.entries()]).toEqual([["default", { web: "[x]", ios: "[ ]", android: "[ ]", notes: "n \\| o" }]]);
    expect(renderVariantsTable([{ key: "default", label: "Default" }], parsed)).toEqual(table);
  });
});

describe.skipIf(!hasDist)("the audit checklists keep a reviewer's work", () => {
  it("keeps a note with a raw pipe, flags the row as out of date rather than drift, and escapes it on the next write", () => {
    const dir = temp();
    try {
      writeChecklists(dir, sources);
      const file = "components/button.md";
      const edited = read(dir, file).replace("| `default` | Default | [ ] | [ ] | [ ] |  |", "| `default` | Default | [x] | [ ] | [x] | soft at phone | dark glass |");
      writeFileSync(join(dir, file), edited);
      expect(checkChecklists(dir, sources)).toEqual([
        'audit/components/button.md: variants table out of date (a relabelled row, a changed header, or a "|" in a note to escape); run `bun run audit:checklists`, which keeps every tick and note',
      ]);
      expect(writeChecklists(dir, sources).updated).toEqual([file]);
      expect(read(dir, file)).toContain("| `default` | Default | [x] | [ ] | [x] | soft at phone \\| dark glass |");
      expect(checkChecklists(dir, sources)).toEqual([]);
      expect(checklistStatus(file, read(dir, file)).variants).toMatchObject({ web: 1, ios: 0, android: 1 });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("reports a malformed row by line, and --write leaves that file untouched", () => {
    const dir = temp();
    try {
      writeChecklists(dir, sources);
      const file = "components/button.md";
      // A pipe in the label shifts the tick columns: the row cannot be read safely.
      const edited = read(dir, file).replace("| `default` | Default | [ ] | [ ] | [ ] |  |", "| `default` | Default | primary | [x] | [ ] | [x] | soft |");
      writeFileSync(join(dir, file), edited);
      const line = edited.split("\n").findIndex((l) => l.startsWith("| `default` |")) + 1;
      expect(checkChecklists(dir, sources)).toEqual([
        `audit/components/button.md:${line}: malformed variants row: the Web (18) cell reads "primary", not \`[ ]\` or \`[x]\` (a "|" in the label, or a missing cell, shifts the columns; write a pipe in a cell as \`\\|\`) (fix it by hand; \`bun run audit:checklists\` refuses a file with a malformed row rather than lose its ticks or note)`,
      ]);
      const result = writeChecklists(dir, sources);
      expect(result.refused.map((r) => r.file)).toEqual([file]);
      expect(result.refused[0].problems).toEqual([
        `line ${line}: malformed variants row: the Web (18) cell reads "primary", not \`[ ]\` or \`[x]\` (a "|" in the label, or a missing cell, shifts the columns; write a pipe in a cell as \`\\|\`); fix the row by hand`,
      ]);
      expect(read(dir, file)).toBe(edited);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("refuses to drop a row that carries ticks or a note when its key leaves the inventory", () => {
    const dir = temp();
    try {
      writeChecklists(dir, sources);
      const file = "components/button.md";
      writeFileSync(join(dir, file), read(dir, file).replace("| `default` | Default | [ ] | [ ] | [ ] |  |", "| `default` | Default | [x] | [ ] | [ ] | ok |"));
      const renamed = {
        ...sources,
        components: sources.components.map((c) => (c.slug === "button" ? { ...c, variants: c.variants.map((v, i) => (i === 0 ? { ...v, variant: "usage" } : v)) } : c)),
      };
      const before = read(dir, file);
      const line = before.split("\n").findIndex((l) => l.startsWith("| `default` |")) + 1;
      const [drift] = checkChecklists(dir, renamed);
      expect(drift).toContain(`\`default\` (line ${line}) carry ticks or notes the inventory has no row for`);
      const result = writeChecklists(dir, renamed);
      expect(result.refused.map((r) => r.problems)).toEqual([[expect.stringContaining(`line ${line}: \`default\` is no longer a row of this route`)]]);
      expect(read(dir, file)).toBe(before);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("reports a malformed findings or sign-off row by line, so audit:status never counts around it silently", () => {
    const dir = temp();
    try {
      writeChecklists(dir, sources);
      const file = "components/button.md";
      const edited = read(dir, file)
        .replace("|---|---|---|---|---|---|\n\n## Sign-off", "|---|---|---|---|---|---|\n| BTN-1 | high | source | label clipped | wraps | open | |\n| BTN-2 | high | source | no status |\n\n## Sign-off")
        .replace("| ios |  |  |  |  |", "| iOS | run | bn | 2026-10-09 | pass |\n| ios |  |  |  |  |");
      writeFileSync(join(dir, file), edited);
      const lineOf = (start: string) => edited.split("\n").findIndex((l) => l.startsWith(start)) + 1;
      expect(checkChecklists(dir, sources)).toEqual([
        `audit/components/button.md:${lineOf("| BTN-2 |")}: malformed findings row: too few cells (a findings row is \`| ID | Severity | Cell | Summary | Status | Fix commit |\`) (fix it by hand)`,
        `audit/components/button.md:${lineOf("| ios |")}: malformed sign-off row: a second sign-off row for ios (the first is on line ${lineOf("| iOS |")}) (fix it by hand)`,
      ]);
      // The pipe in BTN-1's summary stays in the summary, so its status still reads open.
      const status = checklistStatus(file, edited);
      expect(status.findings).toEqual({ total: 1, open: 1, bySeverity: { high: 1 }, byStatus: { open: 1 } });
      expect(status.signedOff).toEqual(["ios"]);
      expect(status.unreadable.map((p) => p.line)).toEqual([lineOf("| BTN-2 |"), lineOf("| ios |")]);
      // --write never rewrites the hand-maintained tables.
      writeChecklists(dir, sources);
      expect(read(dir, file)).toBe(edited);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("reads source facts from TypeScript modules only, nested ones included, never the markdown", () => {
    const button = componentFacts("button", sources.corpus);
    expect(button.sourceFiles).toContain("button.md");
    expect(button.sourceModules).not.toContain("button.md");
    expect(button.sourceModules.every(isSourceModule)).toBe(true);
    expect(button.implementation).toEqual({ kind: "directory", modules: button.sourceModules.map((m) => `src/atoms/button/${m}`) });
    for (const file of [...button.measureProps, ...button.touchTarget.modules.map((t) => t.module)]) expect(button.sourceModules).toContain(file);
    expect(componentFacts("checkbox", sources.corpus).sourceModules).toContain("indicator/shared.tsx");
  });

  it("names the kit's whole touch-target vocabulary, not two words of it, and the coverage test's record (item 3)", () => {
    // Chip builds its floor from the seeded slop, the seams and the clip slop, and its
    // skin from platformMinTarget and TOUCH_TARGET; it never names minTarget or
    // useMinTargetSlop, which is all the facts used to look for.
    const chip = componentFacts("chip", sources.corpus).touchTarget;
    expect(chip.modules).toEqual([
      { module: "chip.shared.tsx", names: expect.arrayContaining(["hitSlop", "reachSlop", "rowSeam", "useSeededMinTargetSlop"]) },
      { module: "chip.styles.ts", names: ["TOUCH_TARGET", "platformMinTarget"] },
    ]);
    expect(chip.coverage?.list).toBe("covered another way");
    expect(componentFacts("checkbox", sources.corpus).touchTarget.modules).toEqual([{ module: "checkbox.shared.tsx", names: ["hitSlop"] }]);
    // A control sized to the floor by its skin names none of it; the coverage test says how it meets it.
    expect(componentFacts("accordion", sources.corpus).touchTarget).toEqual({ modules: [], coverage: { list: "covered another way", reason: "triggers are 44/56 tall by skin" } });
    expect(componentFacts("tabs", sources.corpus).touchTarget.coverage?.list).toBe("known gap");
  });

  it("reads a raw primitive from the module that builds it, or says React Native builds it (item 4)", () => {
    const text = componentFacts("text", sources.corpus);
    expect(text.sourceModules).toEqual([]);
    expect(text.implementation).toEqual({ kind: "module", modules: ["src/style/text.tsx"], reactNative: "Text", platformBuilds: false });
    expect(componentFacts("text-input", sources.corpus).implementation).toMatchObject({ kind: "module", modules: ["src/style/text.tsx"], reactNative: "TextInput" });
    expect(componentFacts("pressable", sources.corpus).implementation).toMatchObject({ kind: "module", modules: ["src/style/pressable.tsx"], reactNative: "Pressable" });
    // ScrollView is wrapped once, for its themed focus ring, as Pressable is.
    expect(componentFacts("scroll-view", sources.corpus).implementation).toMatchObject({ kind: "module", modules: ["src/style/scroll-view.tsx"], reactNative: "ScrollView" });
    const view = componentFacts("view", sources.corpus);
    expect(view.implementation).toEqual({ kind: "package", modules: [], specifier: "react-native", name: "View", via: "src/style/primitives.ts" });
    expect(view.touchTarget).toEqual({ modules: [], coverage: null });
    expect(view.measureProps).toEqual([]);
    const rendered = renderComponentFacts(view).join("\n");
    expect(rendered).toContain("| Implementation | React Native's own `View`, re-exported from `src/style/primitives.ts`; the kit has no source of its own for it");
    expect(rendered).toContain("| Touch target | not applicable: the kit has no source of its own for it |");
    expect(renderComponentFacts(text).join("\n")).toContain("| Implementation | declared in `src/style/text.tsx`, which imports React Native's own `Text`; `src/atoms/text/` holds only its markdown |");
  });

  it("states the recipes the web runner applies, each static or exempt state with its checked reason, and the states the web can never show, with why", () => {
    const row = (slug: string) => renderComponentFacts(componentFacts(slug, sources.corpus)).find((line) => line.startsWith("| Interaction states |"));
    // The facts are the source's alone, generated with no capture, so the row says what the
    // runner sets up ("recipes"), never what a capture reached.
    for (const slug of ["button", "dialog", "input", "heatmap"]) expect(row(slug)).not.toContain("captured");
    // A state that exists only at some widths names them (the Heatmap's scroller is a stop at a phone's).
    expect(row("heatmap")).toBe("| Interaction states | recipes: hover on Calendar (web row; desktop), focus on Calendar (web row; phone), pressed on Calendar (web row; desktop). |");
    // A state applied inside the overlay a recipe opens first says so, and the rows its own
    // control is on: Dialog's Cancel is its own on the iOS and Android rows, a kit Button on the
    // web's. Its press is the iOS row's: the Android row's text buttons press with
    // `android_ripple` alone, which react-native-web does not draw, so that press is not
    // reachable on the web and the devices judge it.
    expect(row("dialog")).toBe(
      "| Interaction states | recipes: focus on Default inside the overlay it opens (iOS, Android rows; desktop), pressed on Default inside the overlay it opens (iOS row; desktop), open on Default (web, iOS, Android rows; phone, tablet and desktop). not reachable on the web: pressed in the overlay in `Present` on the Android row, where its controls' only pressed feedback is `android_ripple`, which react-native-web does not draw (judged on devices). |",
    );
    expect(row("alert-dialog")).toBe(
      "| Interaction states | recipes: focus on Default inside the overlay it opens (iOS, Android rows; desktop), pressed on Default inside the overlay it opens (iOS row; desktop), open on Default (web, iOS, Android rows; phone, tablet and desktop), disabled on Body field inside the overlay it opens (web, iOS, Android rows; desktop). not reachable on the web: pressed in the overlay in `Present` on the Android row, where its controls' only pressed feedback is `android_ripple`, which react-native-web does not draw (judged on devices). |",
    );
    // Input's and Textarea's Disabled fields are announced disabled (`aria-disabled` and an
    // accessibilityState beside `editable`), so their disabled recipes are plain recipes.
    expect(row("input")).toBe("| Interaction states | recipes: focus on Default (web row; desktop), pressed on Password (web row; desktop), invalid on Error (web row; desktop), disabled on Disabled (web row; desktop). |");
    expect(row("textarea")).toBe("| Interaction states | recipes: focus on Default (web row; desktop), invalid on Character counter (web row; desktop), disabled on Disabled (web row; desktop). |");
    // A recipe whose state the source never announces on the web stays (its cell records the
    // finding), and the row says why it cannot be reached: a field disabled only through `editable`.
    const input = componentFacts("input", sources.corpus);
    const readOnlyField = { ...input, states: { ...input.states, unreachable: ["disabled on Disabled on the web row: its source disables the field only through `editable`, which react-native-web renders read-only, never `aria-disabled` or a native `disabled`, so the page never announces it disabled and the recipe cannot confirm it"] } };
    expect(renderComponentFacts(readOnlyField).find((line) => line.startsWith("| Interaction states |"))).toBe(
      "| Interaction states | recipes: focus on Default (web row; desktop), pressed on Password (web row; desktop), invalid on Error (web row; desktop), disabled on Disabled (web row; desktop). not reachable on the web: disabled on Disabled on the web row: its source disables the field only through `editable`, which react-native-web renders read-only, never `aria-disabled` or a native `disabled`, so the page never announces it disabled and the recipe cannot confirm it. |",
    );
    // Sidebar's rail at the desktop, and its drill-down's rows inside the drawer it becomes at a phone's and a tablet's width.
    expect(row("sidebar")).toContain(
      "hover on Default (web row; desktop), hover on Default inside the overlay it opens (web row; phone and tablet), focus on Default (web row; desktop), focus on Default inside the overlay it opens (web row; phone and tablet), pressed on Default (web row; desktop), pressed on Default inside the overlay it opens (web row; phone and tablet)",
    );
    // A state its source gives only in a build no row of the page renders is the devices', never
    // a recipe's; several are each given with their reason.
    const sidebar = componentFacts("sidebar", sources.corpus);
    const judged = {
      ...sidebar,
      states: {
        ...sidebar.states,
        unreachable: ["focus in the overlay in `Sidebar` (the iOS build), which no row of its docs page renders (judged on devices)", "pressed in the overlay in `Sidebar` (the iOS build), which no row of its docs page renders (judged on devices)"],
      },
    };
    expect(renderComponentFacts(judged).find((line) => line.startsWith("| Interaction states |"))).toContain(
      "not reachable on the web: focus in the overlay in `Sidebar` (the iOS build), which no row of its docs page renders (judged on devices); pressed in the overlay in `Sidebar` (the iOS build), which no row of its docs page renders (judged on devices).",
    );
    // Dropdown is disabled in two places, its trigger and an item inside its menu.
    expect(row("dropdown")).toContain("disabled on Disabled trigger (web row; desktop), disabled on Disabled item inside the overlay it opens (web row; desktop).");
    // Where its source disables a control no rail example asks for disabled.
    expect(row("radio")).toContain("disabled controls its source renders and no rail example asks for: on its own surface.");
    expect(row("button-group")).toContain("disabled controls its source renders and no rail example asks for: in the overlay in `SplitButton`.");
    // A capture that also shows another state says so.
    expect(row("tooltip")).toContain("open on On hover (web, iOS, Android rows; phone, tablet and desktop; also its hover)");
    // A component that opens two overlays names the one each capture opens.
    expect(row("calendar")).toBe(
      "| Interaction states | recipes: hover on Week (web row; desktop; also its open; opens the overlay in `hoverCard`), focus on Default (web row; desktop), focus on Day peek inside the overlay it opens (web row; desktop; opens the overlay in `dayPeekOverlay`), pressed on Default (web row; desktop), open on Day peek (web, iOS, Android rows; phone, tablet and desktop; opens the overlay in `dayPeekOverlay`). pressed exempt, verified: An event block takes a press only with `onEventPress`, the day peek's included; no rail example passes it. |",
    );
    // A hover, a focus or a press on the component's own controls in each place it renders them:
    // FilterPanel's option rows on the panel and in the drawer it becomes at a phone's width.
    expect(row("filter-panel")).toContain("focus on Default (web row; desktop), focus on Responsive drawer inside the overlay it opens (web row; phone)");
    expect(row("dropdown")).toContain("focus on Custom trigger (web row; desktop), focus on Default inside the overlay it opens (web row; desktop)");
    expect(row("feeds")).toBe(
      "| Interaction states | static: An activity list whose rows are read-only in every rail example. focus exempt, verified: `onItemPress` makes each row a button, a tab stop, and `virtualized` scrolls the rows in a list that is one once they overflow; no rail example passes either. pressed exempt, verified: `onItemPress` makes each row a button; no rail example passes it. |",
    );
    expect(row("badge")).toBe("| Interaction states | static: A status label: it takes no input. |");
    const steps = componentFacts("steps", sources.corpus).states;
    expect(steps).toMatchObject({ listed: true, recipes: [], unanswered: [], unshown: [], unreachable: [], exempt: [{ state: "focus", failure: null }, { state: "pressed", failure: null }] });
  });

  it("reads a component's exports from every module its group barrel publishes from its directory", () => {
    // RevealGroup lives in reveal-group.tsx beside the entry, and src/atoms/index.ts
    // re-exports both, so the facts name both and credit the tests of either.
    expect(componentFacts("reveal", sources.corpus).exports).toEqual(["Reveal", "RevealGroup"]);
    expect(componentFacts("avatar", sources.corpus).exports).toEqual(["Avatar", "AvatarGroup", "AvatarMenu"]);
    // A raw primitive's directory holds only markdown: its name stands in.
    expect(componentFacts("view", sources.corpus).exports).toEqual(["View"]);
  });

  it("names what a platform entry passes on unbuilt beside what it builds", () => {
    // badge.ios.tsx builds Badge from its skin and re-exports the shared BadgeGroup;
    // grid.ios.tsx builds Grid and re-exports GridItem and two helpers.
    const badge = componentFacts("badge", sources.corpus).skins;
    expect(badge.iOS).toMatchObject({ exports: { Badge: null }, shared: ["BadgeGroup"] });
    expect(badge.Android.shared).toEqual(["BadgeGroup"]);
    expect(componentFacts("grid", sources.corpus).skins.iOS.shared).toEqual(["GridItem", "gridColumns", "gridCellWidth"]);
    // Avatar's entries build all three, so nothing is passed on unbuilt.
    expect(componentFacts("avatar", sources.corpus).skins.iOS.shared).toEqual([]);
    const lines = (slug: string) => renderComponentFacts(componentFacts(slug, sources.corpus)).join("\n");
    expect(lines("badge")).toContain("| Platform entries | iOS: web build: Badge; re-exports the shared build: BadgeGroup. Android: web build: Badge; re-exports the shared build: BadgeGroup |");
    expect(lines("gauge")).toContain("| Platform entries | iOS: re-exports the shared build: Gauge (nothing built per platform).");
  });

  it("credits every component of the skins smoke test's CASES table, read statically (item 1)", () => {
    // The smoke test mounts each row through one computed import and `mod[c.name]`.
    for (const slug of ["accordion", "board", "chip", "drag-drop", "toast", "row-column", "geo-map", "phone-input", "container", "grid", "card"]) {
      expect(componentFacts(slug, sources.corpus).tests).toContain("test/skins-smoke.test.tsx");
    }
    // A component with no CASES row is not credited by the table: every platform entry
    // has rows (the table's own guard), so these are the ones with no platform entries.
    for (const slug of ["text", "view", "scroll-view", "image"]) expect(componentFacts(slug, sources.corpus).tests).not.toContain("test/skins-smoke.test.tsx");
  });

  it("lists the catalog sweeps that drive a page apart from the specs that name it (item 2)", () => {
    const sweeps = (slug: string) => Object.fromEntries(componentFacts(slug, sources.corpus).e2eSweeps.map((s) => [s.file, s.catalogs]));
    expect(sweeps("chip")).toEqual({
      "e2e/a11y/components.e2e.ts": ["componentRoutes"],
      "e2e/journeys/keyboard.e2e.ts": ["componentRoutes"],
      "e2e/responsive/component-widths.e2e.ts": ["contentRoutes", "componentRoutes"],
      "e2e/smoke/examples.e2e.ts": ["componentExamples"],
      "e2e/smoke/routes.e2e.ts": ["allRoutes"],
      "e2e/visual/components.e2e.ts": ["componentRoutes"],
      "e2e/visual/materials.e2e.ts": ["MATERIAL_ROUTES"],
    });
    // The overlay sweeps reach only the overlays, through each spec's own catalog.
    expect(sweeps("dialog")).toMatchObject({ "e2e/behavior/overlays.e2e.ts": ["OVERLAYS"], "e2e/visual/overlays.e2e.ts": ["OVERLAYS"] });
    expect(sweeps("chip")["e2e/behavior/overlays.e2e.ts"]).toBeUndefined();
    // A data check over a catalog drives no page.
    expect(sweeps("chip")["e2e/visual/material-coverage.e2e.ts"]).toBeUndefined();
    // Pages: every template through hydration-ids' filtered spread, every content page through the widths sweep.
    const page = (id: string) => pageFacts(sources.pages.find((p) => p.id === id) ?? all!.pages.find((p) => p.id === id)!, sources.corpus);
    expect(page("template-activity").e2eSweeps.map((s) => s.file)).toEqual(["e2e/behavior/hydration-ids.e2e.ts", "e2e/responsive/component-widths.e2e.ts", "e2e/smoke/routes.e2e.ts"]);
    expect(page("pattern-glass").e2eSweeps.map((s) => s.file)).toEqual(["e2e/responsive/component-widths.e2e.ts", "e2e/smoke/routes.e2e.ts"]);
    // A route a spec builds from a literal list, or finds in a catalog by a literal, is named, not swept.
    expect(componentFacts("row-menu", sources.corpus).e2e).toContain("e2e/behavior/material-overlay-host.e2e.ts");
    expect(componentFacts("calendar", sources.corpus).e2e).toContain("e2e/responsive/overlay-state.e2e.ts");
    expect(page("template-activity").e2e).toContain("e2e/a11y/shell.e2e.ts");
  });

  it("credits e2e by import, by the exact docs route, or by a harness route that renders it, never by a word", () => {
    // Button's route is a prefix of button-group's, which material-states drives; the
    // route in routes.ts sits in a doc comment. Feed is driven only through the
    // /testing/scroll-focus harness page, whose code names it in prose comments too.
    const button = componentFacts("button", sources.corpus).e2e;
    expect(button).toContain("e2e/behavior/theme.e2e.ts");
    expect(button).not.toContain("e2e/visual/material-states.e2e.ts");
    expect(button).not.toContain("e2e/support/routes.ts");
    expect(componentFacts("feeds", sources.corpus).e2e).toEqual(["e2e/behavior/scroll-focus.e2e.ts", "e2e/journeys/keyboard.e2e.ts"]);
    expect(componentFacts("text", sources.corpus).e2e).toEqual([]);
  });

  it("credits the text-entry specs and the helper-loaded tests the facts used to drop (HIGH 1, HIGH 2, item a)", () => {
    // e2e/behavior/text-entry-clear.e2e.ts builds `/components/${recipe.slug}` in its `entry` helper.
    for (const slug of ["textarea", "input-otp", "phone-input", "input", "autocomplete", "stepper", "data-table"]) {
      expect(componentFacts(slug, sources.corpus).e2e).toContain("e2e/behavior/text-entry-clear.e2e.ts");
    }
    // test/touch-target-clips.test.tsx loads each component through `entry(path, name)`, and
    // test/dist-smoke.test.tsx reads `(kit as Record<string, unknown>)[name]` over a literal list.
    for (const slug of ["button", "pagination", "steps", "row-menu", "stepper", "toast", "stacked-lists"]) {
      expect(componentFacts(slug, sources.corpus).tests).toContain("test/touch-target-clips.test.tsx");
    }
    for (const slug of ["chip", "sparkline", "data-table", "qrcode"]) expect(componentFacts(slug, sources.corpus).tests).toContain("test/dist-smoke.test.tsx");
    expect(componentFacts("phone-input", sources.corpus).tests).not.toContain("test/dist-smoke.test.tsx");
  });

  it("counts the files `bun test` runs and the docs specs, crediting a test with the fixtures it reaches (items d, e)", () => {
    expect(isTestFile("test/chip.test.tsx")).toBe(true);
    expect(isTestFile("test/fixtures/control-refs-consumer.tsx")).toBe(false);
    expect(isTestFile("test/setup.ts")).toBe(false);
    for (const { file } of sources.corpus.tests) expect(isTestFile(file)).toBe(true);
    for (const { file } of sources.corpus.e2e) expect(isSpecFile(file)).toBe(true);
    // The fixture the type test hands the compiler by path is the type test's.
    const button = componentFacts("button", sources.corpus).tests;
    expect(button).toContain("test/control-refs-types.test.ts");
    expect(button.some((file) => file.startsWith("test/fixtures/"))).toBe(false);
    // The starter app's own suite drives the starter, not the docs.
    for (const slug of ["row-column", "typography"]) expect(componentFacts(slug, sources.corpus).e2e.some((file) => file.startsWith("e2e/starter/"))).toBe(false);
  });

  it("credits a pattern with the kit names its own entry uses, never a sibling's or a type (item f)", () => {
    const patterns = readFileSync(join(ROOT, "docs/src/core/data/patterns.tsx"), "utf8");
    const glass = pageKitNames("docs/src/core/data/patterns.tsx", patterns, "glass");
    // GlassDemo's material switch and the inventory's table; not Accessibility's Kbd or Responsive's Sidebar.
    expect(glass).toEqual(expect.arrayContaining(["Alert", "Card", "DataTable", "Switch", "ThemeProvider", "useTheme"]));
    for (const name of ["Kbd", "Sidebar", "Container", "Progress"]) expect(glass).not.toContain(name);
    const source = [
      'import type { Doc } from "./types";',
      'import { Card, Badge, type CardProps } from "@nannier/canvas";',
      "function Demo() { return <Card />; }",
      'const DOCS: Doc[] = [{ slug: "one", sections: [{ render: () => <Demo /> }] }, { slug: "two", sections: [{ render: () => <Badge /> }] }];',
    ].join("\n");
    expect(pageKitNames("x.tsx", source, "one")).toEqual(["Card"]);
    expect(pageKitNames("x.tsx", source, "two")).toEqual(["Badge"]);
    expect(() => pageKitNames("x.tsx", source, "three")).toThrow(/no entry whose slug is "three"/);
    expect(renderPageFacts(pageFacts(all!.pages.find((p) => p.id === "pattern-glass")!, sources.corpus)).join("\n")).toContain("| Kit names its entry uses | Alert, Button, Card,");
  });

  it("keeps a page section's ticks when another section is inserted before it", () => {
    const dir = temp();
    try {
      writeChecklists(dir, sources);
      const file = "pages/pattern-glass.md";
      writeFileSync(join(dir, file), read(dir, file).replace("| `livecomparison` | Live comparison | [ ] | [ ] | [ ] |  |", "| `livecomparison` | Live comparison | [x] | [x] | [ ] | checked |"));
      // The page gains a first section and loses its last one: every row that remains
      // keeps its ticks, because a row is keyed by its title, not its position.
      const sections = ["A new first section", "What 'glass' means in Canvas", "The four ingredients", "Surface inventory", "Live comparison", "When NOT to use glass"];
      const rows = pageVariantRows("pattern-glass", { sections } as PageFacts);
      expect(rows.map((r) => r.key)).toEqual(["page", "anewfirstsection", "whatglassmeansincanvas", "thefouringredients", "surfaceinventory", "livecomparison", "whennottouseglass"]);
      const existing = read(dir, file);
      const merged = mergeChecklist(existing, findBlock(existing, FACTS_BEGIN, FACTS_END)!.lines, rows, file);
      expect(merged).toContain("| `anewfirstsection` | A new first section | [ ] | [ ] | [ ] |  |");
      expect(merged).toContain("| `livecomparison` | Live comparison | [x] | [x] | [ ] | checked |");
      expect(merged).not.toContain("`implementation`");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("variants rows, orphans and section keys", () => {
  const header = variantsHeader();

  it("splits on unescaped pipes only and takes everything after the tick cells as the note", () => {
    const table = readVariantsTable(
      [
        ...header,
        "| `a` | A \\| B | [x] | [ ] | [X] | n \\| o |",
        "| `b` | B | [x] | [x] | [ ] | raw | pipe | kept |",
        "| `c` | C | [ ] | [ ] | [ ] |",
        "| `d` | D | [ ] | [ ] | [x] | no closing pipe",
        "",
      ],
      10,
    );
    expect(table.malformed).toEqual([]);
    expect(table.rows).toEqual([
      { key: "a", ticks: { web: "[x]", ios: "[ ]", android: "[X]", notes: "n \\| o" }, line: 12 },
      { key: "b", ticks: { web: "[x]", ios: "[x]", android: "[ ]", notes: "raw | pipe | kept" }, line: 13 },
      { key: "c", ticks: { web: "[ ]", ios: "[ ]", android: "[ ]", notes: "" }, line: 14 },
      { key: "d", ticks: { web: "[ ]", ios: "[ ]", android: "[x]", notes: "no closing pipe" }, line: 15 },
    ]);
    // A raw pipe in a note is escaped once on the way out, and the result reads back the same.
    const rendered = renderVariantsTable([{ key: "b", label: "B" }], new Map([["b", table.rows[1].ticks]]));
    expect(rendered[2]).toBe("| `b` | B | [x] | [x] | [ ] | raw \\| pipe \\| kept |");
    expect(renderVariantsTable([{ key: "b", label: "B" }], parseVariantsTable(rendered))).toEqual(rendered);
  });

  it("names each unreadable row by its line rather than dropping it", () => {
    const table = readVariantsTable(
      [
        ...header,
        "| default | Default | [ ] | [ ] | [ ] |  |",
        "| `a` | A | [x] | [ ] |",
        "| `b` | B | B2 | [x] | [ ] | [ ] | note |",
        "stray text",
        "| `c` | C | [ ] | [ ] | [ ] |  |",
        "| `c` | C | [x] | [ ] | [ ] |  |",
      ],
      40,
    );
    expect(table.rows.map((r) => r.key)).toEqual(["c"]);
    expect(table.malformed).toEqual([
      { line: 42, reason: 'the variant cell reads "default", not a back-ticked key' },
      { line: 43, reason: "too few cells (a variants row is `| variant | label | web | ios | android | notes |`)" },
      { line: 44, reason: 'the Web (18) cell reads "B2", not `[ ]` or `[x]` (a "|" in the label, or a missing cell, shifts the columns; write a pipe in a cell as `\\|`)' },
      { line: 45, reason: "not a table row (a variants row starts with `|`)" },
      { line: 47, reason: "a second row for `c` (the first is on line 46)" },
    ]);
  });

  it("counts only markdown files as orphans, so a .DS_Store does not fail the check", () => {
    const dir = temp();
    try {
      mkdirSync(join(dir, "components"), { recursive: true });
      mkdirSync(join(dir, "pages"), { recursive: true });
      writeFileSync(join(dir, "components/.DS_Store"), "");
      writeFileSync(join(dir, "pages/.DS_Store"), "");
      writeFileSync(join(dir, "components/notes.txt"), "");
      writeFileSync(join(dir, "components/button.md"), "# Button\n");
      writeFileSync(join(dir, "components/gone.md"), "# gone\n");
      expect(orphanChecklists(dir, new Set(["components/button.md"]))).toEqual([
        "orphan checklist audit/components/gone.md: no docs route or foundation calls for it (delete it, or restore the route)",
      ]);
      expect(auditStatus(dir).map((row) => row.file)).toEqual(["components/button.md", "components/gone.md"]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("keys page sections by title slug and refuses two titles that slugify alike", () => {
    expect(sectionKeys("template-signin", ["Centered card", "Split-screen", "Magic link"])).toEqual(["centeredcard", "splitscreen", "magiclink"]);
    expect(() => sectionKeys("pattern-x", ["Live demo", "Live-demo"])).toThrow('pattern-x has a section "Live-demo" whose key "livedemo" is taken by the section "Live demo"');
    expect(() => sectionKeys("pattern-x", ["Page"])).toThrow('pattern-x has a section "Page" whose key "page" is taken by the whole page');
    expect(() => sectionKeys("pattern-x", ["!!!"])).toThrow('pattern-x has a section whose title "!!!" slugifies to nothing');
  });
});

describe("tests naming a component", () => {
  const root = "/repo";
  const read = (source: string) => kitImportsOf(root, "test/x.test.tsx", source);
  const view = { exports: ["View"], sourceDir: "src/atoms/view" };
  const avatar = { exports: ["Avatar", "AvatarGroup", "AvatarMenu"], sourceDir: "src/atoms/avatar" };
  const button = { exports: ["Button"], sourceDir: "src/atoms/button" };
  const chip = { exports: ["Chip"], sourceDir: "src/atoms/chip" };
  const counts = (source: string, c: { exports: string[]; sourceDir: string }) => importsComponent(read(source), c.exports, c.sourceDir);

  it("counts a test that imports the component from the kit or reads its own directory, never a react-native import", () => {
    // react-native's own View is not the kit's.
    expect(counts('import { View, Text } from "react-native";\nconst v = <View />;', view)).toBe(false);
    expect(counts('import { View } from "../src/style/primitives.ts";', view)).toBe(true);
    expect(counts('import { View as Box } from "@nannier/canvas";', view)).toBe(true);
    expect(counts('import type { ViewProps } from "../src/style/primitives.ts";\nimport { type View } from "../src/index.ts";', view)).toBe(false);
    // A module inside the component's directory, a skin or a platform entry, statically or not.
    expect(counts('import { iosSkin } from "../src/atoms/button/button.styles.ts";', button)).toBe(true);
    expect(counts('import * as skins from "../src/atoms/button/button.styles.ts";', button)).toBe(true);
    expect(counts('const load = async (file: string) => (await import(`../src/atoms/avatar/${file}.tsx`)).AvatarMenu;\nawait load("avatar.ios");', avatar)).toBe(true);
    // A helper no code calls loads nothing.
    expect(counts("const load = async (file: string) => (await import(`../src/atoms/avatar/${file}.tsx`)).AvatarMenu;", avatar)).toBe(false);
    // Names read off a dynamic import or a namespace of a kit module.
    expect(counts('const { Button, ThemeProvider } = await import("../dist/index.js");', button)).toBe(true);
    expect(counts('const B = ((await import("../src/index.ts")) as Kit).Button;', button)).toBe(true);
    expect(counts('for (const dir of ["button", "chip"]) {\n  const mod = await import(`../src/atoms/${dir}/${dir}.tsx`);\n  mod.Avatar;\n}', avatar)).toBe(true);
    expect(counts('import * as kit from "../src/index.ts";\nrender(<kit.Button />);', button)).toBe(true);
    // A word in the text, or a route literal, is not an import.
    expect(counts('// renders a Button inside a View\nconst path = "/components/view/conversions.h";', view)).toBe(false);
    expect(counts('import { Button } from "some-other-kit";', button)).toBe(false);
  });

  it("reads a table-driven dynamic import row by row: each row's module and the name it reads (item 1)", () => {
    // The skins smoke test's shape: a CASES table, a platform loop, a suffix const, and `mod[c.name]`.
    const smoke = read(
      [
        'const CASES: { name: string; dir: string; file: string; label?: string }[] = [',
        '  { name: "Avatar", dir: "atoms/avatar", file: "avatar" },',
        '  { name: "Row", label: "Row", dir: "atoms/layout", file: "layout" },',
        '  { name: "Board", dir: "organisms/board", file: "board" },',
        '];',
        'const PLATFORMS = ["web", "ios", "android"] as const;',
        'for (const platform of PLATFORMS) {',
        '  describe(platform, () => {',
        '    for (const c of CASES) {',
        '      it(c.label ?? c.name, async () => {',
        '        const suffix = platform === "web" ? "" : `.${platform}`;',
        '        const mod = (await import(`../src/${c.dir}/${c.file}${suffix}.tsx`)) as Record<string, unknown>;',
        '        const Comp = mod[c.name];',
        '      });',
        '    }',
        '  });',
        '}',
      ].join("\n"),
    );
    expect([...smoke.modules].sort()).toEqual(
      ["src/atoms/avatar/avatar", "src/atoms/layout/layout", "src/organisms/board/board"].flatMap((stem) => [".android", ".ios", ""].map((suffix) => `${stem}${suffix}.tsx`)),
    );
    expect([...smoke.names].sort()).toEqual(["Avatar", "Board", "Row"]);
    expect(importsComponent(smoke, ["Feed"], "src/molecules/feeds")).toBe(false);
    expect(importsComponent(smoke, ["Board"], "src/organisms/board")).toBe(true);
    // The control-refs shape: a table destructured inside the loop, and `module[name]`.
    const refs = read(
      [
        'const cases = [{ name: "Switch", dir: "switch" }, { name: "Checkbox", dir: "checkbox" }] as const;',
        'for (const platform of ["web", "ios"]) {',
        '  for (const testCase of cases) {',
        '    const { name, dir } = testCase;',
        '    const suffix = platform === "web" ? "" : `.${platform}`;',
        '    const module = await import(`../src/atoms/${dir}/${dir}${suffix}.tsx`);',
        '    const Control = module[name];',
        '  }',
        '}',
      ].join("\n"),
    );
    expect([...refs.modules].sort()).toEqual(["src/atoms/checkbox/checkbox.ios.tsx", "src/atoms/checkbox/checkbox.tsx", "src/atoms/switch/switch.ios.tsx", "src/atoms/switch/switch.tsx"]);
    expect([...refs.names].sort()).toEqual(["Checkbox", "Switch"]);
  });

  it("binds a helper's parameters at each call site: a component loaded through `entry(path, name)` is credited (HIGH 2)", () => {
    // test/touch-target-clips.test.tsx's shape: the import and the member read sit in a
    // helper's returned loader, and only the table of calls names the modules.
    const clips = read(
      [
        "type Load = () => Promise<unknown>;",
        "const entry = (path: string, name: string): Load => async () => (await import(path))[name];",
        "const ANDROID = [",
        '  { name: "a Button", load: entry("../src/atoms/button/button.android.tsx", "Button") },',
        '  { name: "a Chip", load: entry("../src/atoms/chip/chip.android.tsx", "Chip") },',
        "];",
        "for (const c of ANDROID) it(c.name, async () => { await c.load(); });",
      ].join("\n"),
    );
    expect([...clips.modules].sort()).toEqual(["src/atoms/button/button.android.tsx", "src/atoms/chip/chip.android.tsx"]);
    expect([...clips.names].sort()).toEqual(["Button", "Chip"]);
    expect(importsComponent(clips, chip.exports, chip.sourceDir)).toBe(true);
    // A helper the module hands on, or exports, may be called with anything: its import fails.
    expect(() => read("export const load = async (path: string) => import(path);")).toThrow(UnreadableImport);
    expect(() => read("const load = async (path: string) => import(path);\ntest(\"x\", load);")).toThrow(/load is used as a value at line 2/);
  });

  it("reads a namespace through parentheses and casts, and `spyOn(ns, key)` (item a)", () => {
    // test/dist-smoke.test.tsx: a namespace from a dynamic import, read through a cast over a literal list.
    const smoke = read(
      ['const kit = await import("../dist/index.js");', 'for (const name of ["Button", "Chip"]) {', "  expect(typeof (kit as Record<string, unknown>)[name]).not.toBe(\"undefined\");", "}"].join("\n"),
    );
    expect([...smoke.names].sort()).toEqual(["Button", "Chip"]);
    expect(read('import * as kit from "../src/index.ts";\nconst B = (kit as unknown as Kit).Button;').names.has("Button")).toBe(true);
    expect(read('import { spyOn } from "bun:test";\nimport * as style from "../src/style/index.ts";\nspyOn(style, "View");').names.has("View")).toBe(true);
    // Read whole, a namespace is recorded for the corpus to judge, by line.
    expect(read('import * as kit from "../src/index.ts";\nconst all = Object.keys(kit);').whole).toEqual([{ file: "test/x.test.tsx", module: "src/index.ts", line: 2, what: "Object.keys(kit)" }]);
  });

  it("fails on an import or a member it cannot resolve, never drops it", () => {
    // A specifier built from a global, a key from a global, a let table.
    expect(() => read("const m = await import(`../src/atoms/button${suffix}.tsx`);")).toThrow(UnreadableImport);
    expect(() => read('import * as kit from "../src/index.ts";\nconst C = kit[process.env.NAME!];')).toThrow(/test\/x.test.tsx:2: it reads a member of a kit namespace by a key the reader cannot know/);
    expect(() => read('let CASES = [{ dir: "atoms/chip" }];\nfor (const c of CASES) await import(`../src/${c.dir}/x.tsx`);')).toThrow(UnreadableImport);
    // A const the module changes is not read as its literal (item g), and the message says where it changes.
    expect(() => read('const CASES = [{ dir: "atoms/chip" }];\nCASES.push({ dir: "atoms/button" });\nfor (const c of CASES) await import(`../src/${c.dir}/x.tsx`);')).toThrow(/CASES \(line 1\) is changed at line 2/);
    // A module copied into a run-time directory outside the checkout is provably not the kit's;
    // one whose directory the reader cannot place fails.
    const copied = [
      'import { mkdtemp } from "node:fs/promises";',
      'import { tmpdir } from "node:os";',
      'import { join } from "node:path";',
      "const temporary: string[] = [];",
      'const fresh = async () => { const dir = await mkdtemp(join(tmpdir(), "copy-")); temporary.push(dir); return dir; };',
      'it("loads the copy", async () => { const module = join(await fresh(), "check-size.ts"); await import(module); });',
    ].join("\n");
    expect(read(copied).modules).toEqual([]);
    expect(() => read(copied.replace("join(tmpdir(), \"copy-\")", "process.env.DIR!"))).toThrow(UnreadableImport);
  });

  it("credits only the rows a readable guard lets through, and fails on a guard it cannot read (item b)", () => {
    const guarded = read(
      [
        'for (const dir of ["button", "chip"]) {',
        '  if (dir === "chip") continue;',
        "  it(dir, async () => { await import(`../src/atoms/${dir}/${dir}.styles.ts`); });",
        "}",
      ].join("\n"),
    );
    expect(guarded.modules).toEqual(["src/atoms/button/button.styles.ts"]);
    expect(() =>
      read(['for (const dir of ["button", "chip"]) {', "  if (process.env[dir]) continue;", "  it(dir, async () => { await import(`../src/atoms/${dir}/${dir}.styles.ts`); });", "}"].join("\n")),
    ).toThrow(/a guard the reader cannot read/);
  });
});

describe("the touch-target vocabulary", () => {
  it("is every value the kit's touch-target modules export, the skin's field, and hitSlop (item 3)", () => {
    const vocabulary = touchTargetVocabulary(ROOT);
    for (const name of ["TOUCH_TARGET", "platformMinTarget", "useMinTargetSlop", "minTargetSlop", "useSeededMinTargetSlop", "seedSlop", "rowSeam", "columnSeam", "useSeamLimit", "reachSlop", "clipSlop", "minTarget", "hitSlop"]) {
      expect(vocabulary).toContain(name);
    }
    // Types are not vocabulary; a value is.
    expect(vocabulary).not.toContain("MinTargetOptions");
    expect(vocabulary).not.toContain("TouchTargetSkin");
  });
});

describe("findings and sign-off tables", () => {
  const content = [
    "# X",
    "",
    "## Findings",
    "",
    "One row per finding.",
    "",
    "| ID | Severity | Cell | Summary | Status | Fix commit |",
    "|---|---|---|---|---|---|",
    "| F1 | high | source | label clipped | wraps at 390 | open | |",
    "| F2 | Medium | web/x/default/phone.dark.glass | ok \\| escaped | fixed | abc1234 |",
    "| F3 | low | source | no fix yet | verified |",
    "| F4 | high | source | missing a cell |",
    "| F5 | severe | source | x | open | |",
    "| F1 | low | source | taken | open | |",
    "",
    "| F6 | critical | source | below the blank line | open | |",
    "",
    "## Sign-off",
    "",
    "| Platform | Run id | Reviewer | Date | Result |",
    "|---|---|---|---|---|",
    "| web | 20261009-web-abc | bn | 2026-10-09 | pass | with a pipe |",
    "| ios |  |  |  |  |",
    "| android | run-2 | bn | 2026-10-09 |",
    "| macos | x | | | |",
    "",
  ].join("\n");
  const lineOf = (start: string, from = 0) => content.split("\n").findIndex((l, i) => i >= from && l.startsWith(start)) + 1;

  it("keeps a pipe typed in a summary, reads an empty cell typed `| |`, and names every unreadable row by line", () => {
    // The old reader split on " | ": F1's raw pipe moved "wraps at 390" into the Status
    // column, and a trailing empty cell typed `| |` made the row too short to count.
    const findings = readFindings(content);
    expect(findings.found).toBe(true);
    expect(findings.rows.map(({ id, severity, summary, status, fix }) => ({ id, severity, summary, status, fix }))).toEqual([
      { id: "F1", severity: "high", summary: "label clipped | wraps at 390", status: "open", fix: "" },
      { id: "F2", severity: "medium", summary: "ok \\| escaped", status: "fixed", fix: "abc1234" },
      { id: "F3", severity: "low", summary: "no fix yet", status: "verified", fix: "" },
    ]);
    expect(findings.malformed).toEqual([
      { line: lineOf("| F4 |"), reason: "too few cells (a findings row is `| ID | Severity | Cell | Summary | Status | Fix commit |`)" },
      { line: lineOf("| F5 |"), reason: 'the Severity cell reads "severe", not one of critical, high, medium, low (a missing cell shifts the columns; write a pipe in a cell as `\\|`)' },
      { line: lineOf("| F1 |", 10), reason: `a second finding F1 (the first is on line ${lineOf("| F1 |")})` },
      { line: lineOf("| F6 |"), reason: "a findings row below the blank line that ends the table, so it does not render as a row; remove the blank line above it" },
    ]);
    const signOffs = readSignOffs(content);
    expect(signOffs.rows.map((r) => [r.platform, r.runId, r.result])).toEqual([
      ["web", "20261009-web-abc", "pass | with a pipe"],
      ["ios", "", ""],
      ["android", "run-2", ""],
    ]);
    expect(signOffs.malformed).toEqual([{ line: lineOf("| macos |"), reason: 'the Platform cell reads "macos", not one of web, ios, android' }]);
  });

  it("counts what it can read, lists the rest under the counts, and reads a changed header as unreadable", () => {
    const status = checklistStatus("components/x.md", content);
    expect(status.findings).toEqual({ total: 3, open: 2, bySeverity: { high: 1, low: 1 }, byStatus: { open: 1, fixed: 1, verified: 1 } });
    expect(status.signedOff).toEqual(["web", "android"]);
    expect(status.unreadable.map((p) => p.line)).toEqual([null, lineOf("| F4 |"), lineOf("| F5 |"), lineOf("| F1 |", 10), lineOf("| F6 |"), lineOf("| macos |")]);
    const report = formatStatus([status]);
    expect(report).toContain("  unreadable 6: left out of the counts above, which under-report by that much; fix each by hand");
    expect(report).toContain(`    audit/components/x.md:${lineOf("| F5 |")}: malformed findings row: the Severity cell reads "severe"`);
    const renamed = content.replace("| ID | Severity | Cell | Summary | Status | Fix commit |", "| ID | Sev | Cell | Summary | Status | Fix |");
    expect(readFindings(renamed)).toMatchObject({ found: false, rows: [], malformed: [{ line: lineOf("| ID |") }] });
    expect(readFindings("# X\n").found).toBe(false);
  });

  it("holds the Status cell to the README's words and a fixed finding to its Fix commit, by line (item 6)", () => {
    const table = [
      "## Findings",
      "",
      "| ID | Severity | Cell | Summary | Status | Fix commit |",
      "|---|---|---|---|---|---|",
      "| G1 | high | source | closed | fixed | 1a2b3c4 |",
      "| G2 | high | source | closed, back-ticked SHA | Fixed | `1a2b3c4d5e6f` |",
      "| G3 | high | source | closed with no commit | fixed |  |",
      "| G4 | low | source | closed by a word | fixed | soon |",
      "| G5 | low | source | the owner's call | wontfix-owner |  |",
      "| G6 | low | source | still open, fix pending | verified | abc1234 |",
      "",
    ].join("\n");
    const lineOf = (id: string) => table.split("\n").findIndex((l) => l.startsWith(`| ${id} |`)) + 1;
    const findings = readFindings(table);
    expect(findings.rows.map((r) => [r.id, r.status, r.fix])).toEqual([
      ["G1", "fixed", "1a2b3c4"],
      ["G2", "fixed", "`1a2b3c4d5e6f`"],
      ["G6", "verified", "abc1234"],
    ]);
    expect(findings.malformed).toEqual([
      { line: lineOf("G3"), reason: "the Status cell reads fixed but the Fix commit cell is empty; record the SHA of the commit that closed it" },
      { line: lineOf("G4"), reason: 'the Fix commit cell reads "soon", not a commit SHA (7 to 40 hex digits)' },
      { line: lineOf("G5"), reason: 'the Status cell reads "wontfix-owner", not one of open, verified, fixed, wontfix, duplicate (a missing cell shifts the columns; write a pipe in a cell as `\\|`)' },
    ]);
    // audit:status counts only what it can read and names the rest under the counts.
    const status = checklistStatus("components/x.md", table);
    expect(status.findings).toEqual({ total: 3, open: 1, bySeverity: { low: 1 }, byStatus: { fixed: 2, verified: 1 } });
    expect(status.unreadable.filter((p) => p.line !== null).map((p) => p.line)).toEqual([lineOf("G3"), lineOf("G4"), lineOf("G5")]);
  });

  it("holds the Cell column to the checklist's capture ids or `source`, by line (item h)", () => {
    const cells = new Set(["web/x/default/phone.dark.glass", "ios/x/default/dark.glass"]);
    const table = [
      "## Findings",
      "",
      "| ID | Severity | Cell | Summary | Status | Fix commit |",
      "|---|---|---|---|---|---|",
      "| F1 | high | source | read in the source | open | |",
      "| F2 | low | `web/x/default/phone.dark.glass` | back-ticked | open | |",
      "| F3 | low | ios/x/default/dark.glass | native | open | |",
      "| F4 | low | web/x/default/desktop.dark.glass | a cell this inventory does not have | open | |",
      "| F5 | low | web/y/default/phone.dark.glass | another checklist's cell | open | |",
      "| F6 | low | anywhere | not an id | open | |",
      "",
    ].join("\n");
    const lineOf = (id: string) => table.split("\n").findIndex((l) => l.startsWith(`| ${id} |`)) + 1;
    const findings = readFindings(table, cells);
    expect(findings.rows.map((r) => [r.id, r.cell])).toEqual([
      ["F1", "source"],
      ["F2", "web/x/default/phone.dark.glass"],
      ["F3", "ios/x/default/dark.glass"],
    ]);
    expect(findings.malformed.map((m) => m.line)).toEqual([lineOf("F4"), lineOf("F5"), lineOf("F6")]);
    expect(findings.malformed[0].reason).toStartWith('the Cell cell reads "web/x/default/desktop.dark.glass", not one of this checklist\'s capture ids');
    expect(checklistStatus("components/x.md", table, cells).unreadable.filter((u) => u.line !== null).map((u) => u.line)).toEqual([lineOf("F4"), lineOf("F5"), lineOf("F6")]);
    // The inventory's own ids, per checklist.
    const real = captureCells();
    expect(real.get("components/button.md")!.has("web/button/default/phone.blush.solid")).toBe(true);
    expect(real.get("components/button.md")!.has("android/button/default/dark.glass")).toBe(true);
    expect(real.get("components/button.md")!.has("web/chip/default/phone.blush.solid")).toBe(false);
    expect(real.get("pages/pattern-glass.md")!.has("web-pages/pattern-glass/desktop.dark.glass")).toBe(true);
    expect(real.get("pages/pattern-glass.md")!.has("ios-pages/pattern-glass/mint.solid")).toBe(true);
  });

  it("spells the Status vocabulary exactly as audit/README.md and the seeded prose do", () => {
    const readme = readFileSync(join(ROOT, "audit/README.md"), "utf8").replace(/\s+/g, " ");
    const listed = /status \(([^)]*)\)/.exec(readme)?.[1] ?? "";
    expect([...listed.matchAll(/`([a-z-]+)`/g)].map((m) => m[1])).toEqual([...FINDING_STATUSES]);
    // The prose every checklist was seeded with, above its findings table.
    const seeded = /Status: ([^.]*)\./.exec(readFileSync(join(ROOT, "audit/components/button.md"), "utf8"))?.[1] ?? "";
    expect(seeded.replace(/\([^)]*\)/g, "").split(",").map((w) => w.trim())).toEqual([...FINDING_STATUSES]);
  });

  it("lists exactly the style-layer renderables with no component page in audit/README.md, as the Foundations tier", () => {
    const readme = readFileSync(join(ROOT, "audit/README.md"), "utf8").replace(/\s+/g, " ");
    const names = [...STYLE_LAYER_RENDERABLES];
    const list = `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
    expect(readme).toContain(`The Foundations tier is the style-layer renderables with no component page of their own, ${list}, and the design tokens the docs' \`tokens/*\` pages document (Tokens).`);
    // Derived from the material inventory: the primitives with their own page are not in it.
    expect(names).toContain("ThemeProvider");
    expect(names).not.toContain("View");
  });

  it("splits a row with no free column strictly", () => {
    const shape = { name: "catalog", columns: ["A", "B"], minCells: 2 };
    expect(splitRow("| a | b |", shape)).toEqual({ cells: ["a", "b"] });
    expect(splitRow("| a \\| b | c", shape)).toEqual({ cells: ["a \\| b", "c"] });
    expect(splitRow("| a | b | c |", shape)).toEqual({ reason: "3 cells where the table has 2 (write a pipe inside a cell as `\\|`)" });
  });
});

describe("e2e driving a component", () => {
  const literals = (source: string) => codeLiterals("/repo/e2e/x.e2e.ts", source);
  const route = "/components/button";

  it("credits the exact route in code: a slug that continues, a comment or a substitution after it does not count", () => {
    expect(drivesRoute(literals('await gotoDocs(page, "/components/button");'), route)).toBe(true);
    expect(drivesRoute(literals('await gotoDocs(page, "/components/button/primary");'), route)).toBe(true);
    expect(drivesRoute(literals('await gotoDocs(page, "/components/button?scheme=dark");'), route)).toBe(true);
    expect(drivesRoute(literals("const url = `${base}/components/button`;"), route)).toBe(true);
    expect(drivesRoute(literals("const url = `/components/button/${variant}`;"), route)).toBe(true);
    expect(drivesRoute(literals('await gotoDocs(page, "/components/button-group");'), route)).toBe(false);
    expect(drivesRoute(literals("const url = `/components/button${suffix}`;"), route)).toBe(false);
    expect(drivesRoute(literals("// opens /components/button first\nconst x = 1;"), route)).toBe(false);
  });

  it("reads what a hidden harness page renders from its fixtures, not from the docs page frame", () => {
    const root = mkdtempSync(join(tmpdir(), "canvas-audit-routes-"));
    try {
      const write = (path: string, source: string) => {
        mkdirSync(join(root, path, ".."), { recursive: true });
        writeFileSync(join(root, path), source);
      };
      write("docs/src/app/(home)/testing/_layout.tsx", 'import { Slot } from "expo-router";');
      write(
        "docs/src/app/(home)/testing/lists.tsx",
        'import { ListsBody } from "../../../../../examples/starter/smoke/fixtures/lists";\nimport { Page } from "../../../ui/page";\nimport { Typography } from "@nannier/canvas";',
      );
      write("docs/src/ui/page.tsx", 'import { Card } from "@nannier/canvas";');
      write("examples/starter/smoke/fixtures/lists.tsx", 'import { Feed } from "@nannier-com/canvas";\nimport { rows } from "./rows";');
      write("examples/starter/smoke/fixtures/rows.ts", 'import { GridList } from "@nannier-com/canvas";\nexport const rows = [];');
      const routes = testingRoutes(root);
      expect(routes.map((t) => t.route)).toEqual(["/testing/lists"]);
      expect([...routes[0].imports.names].sort()).toEqual(["Feed", "GridList", "Typography"]);
      expect(importsComponent(routes[0].imports, ["Card"], "src/molecules/card")).toBe(false);
      expect(drivesRoute(literals('await gotoDocs(page, "/testing/lists?scheme=dark");'), routes[0].route)).toBe(true);
      expect(drivesRoute(literals('await gotoDocs(page, "/testing/lists-wide");'), routes[0].route)).toBe(false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("credits a kit import by the same rule as the tests, never a word in prose or a DOM global", () => {
    const imports = (source: string) => kitImportsOf("/repo", "/repo/e2e/behavior/x.e2e.ts", source);
    const prose = imports("// the Text under the Image\nconst img = new Image();\nconst label = page.getByText(\"Text\");");
    expect(importsComponent(prose, ["Text"], "src/atoms/text")).toBe(false);
    expect(importsComponent(prose, ["Image"], "src/atoms/image")).toBe(false);
    expect(importsComponent(imports('import { colorsFor } from "../../src/style/tokens.ts";'), ["Button"], "src/atoms/button")).toBe(false);
    expect(importsComponent(imports('import { Button } from "../../src/index.ts";'), ["Button"], "src/atoms/button")).toBe(true);
  });
});
