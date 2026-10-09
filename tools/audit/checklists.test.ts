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
  checkChecklists,
  defaultSources,
  findBlock,
  mergeChecklist,
  orphanChecklists,
  pageVariantRows,
  parseVariantsTable,
  readVariantsTable,
  renderVariantsTable,
  variantsHeader,
  writeChecklists,
  type ChecklistSources,
} from "./checklists.ts";
import { kitImportsOf, importsComponent, type PageFacts } from "./facts.ts";
import { NATIVE_CELLS_PER_VARIANT, WEB_CELLS_PER_VARIANT, cellId, cellsFor, components, pageCellId, pages, sectionKeys } from "./inventory.ts";
import { COMPONENT_PLANS, FAMILY_CHECKLISTS, UNIVERSAL_RUBRIC } from "./plan-specifics.ts";
import { auditStatus, checklistStatus } from "./status.ts";

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
      corpus: all.corpus,
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
      expect(auditStatus(dir).length).toBe(6);
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
        "orphan checklist audit/pages/template-gone.md: no docs route calls for it (delete it, or restore the route)",
      ]);
      // A write repairs the generated blocks and the missing file, and leaves the rest to hand.
      const repaired = writeChecklists(dir, sources);
      expect(repaired.seeded).toEqual(["components/view.md"]);
      expect(repaired.updated.sort()).toEqual(["components/avatar.md", "components/button.md"]);
      expect(checkChecklists(dir, sources)).toEqual([
        "audit/components/line-chart.md: sign-off section missing (a \"## Sign-off\" heading with a row per platform: web, ios, android)",
        "orphan checklist audit/pages/template-gone.md: no docs route calls for it (delete it, or restore the route)",
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
        "orphan checklist audit/components/gone.md: no docs route calls for it (delete it, or restore the route)",
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
  it("counts a test that imports the component from the kit or reads its own directory, never a react-native import", () => {
    const root = "/repo";
    const read = (source: string) => kitImportsOf(root, "/repo/test/x.test.tsx", source);
    const view = { exports: ["View"], sourceDir: "src/atoms/view" };
    const avatar = { exports: ["Avatar", "AvatarGroup", "AvatarMenu"], sourceDir: "src/atoms/avatar" };
    const button = { exports: ["Button"], sourceDir: "src/atoms/button" };
    const counts = (source: string, c: { exports: string[]; sourceDir: string }) => importsComponent(read(source), c.exports, c.sourceDir);
    // react-native's own View is not the kit's.
    expect(counts('import { View, Text } from "react-native";\nconst v = <View />;', view)).toBe(false);
    expect(counts('import { View } from "../src/style/primitives.ts";', view)).toBe(true);
    expect(counts('import { View as Box } from "@nannier/canvas";', view)).toBe(true);
    expect(counts('import type { ViewProps } from "../src/style/primitives.ts";\nimport { type View } from "../src/index.ts";', view)).toBe(false);
    // A module inside the component's directory, a skin or a platform entry, statically or not.
    expect(counts('import { iosSkin } from "../src/atoms/button/button.styles.ts";', button)).toBe(true);
    expect(counts('import * as skins from "../src/atoms/button/button.styles.ts";', button)).toBe(true);
    expect(counts("const load = async (file: string) => (await import(`../src/atoms/avatar/${file}.tsx`)).AvatarMenu;", avatar)).toBe(true);
    // A template head that stops mid-name (`button` could be `button-group`) is not the directory.
    expect(counts("const m = await import(`../src/atoms/button${suffix}.tsx`);", button)).toBe(false);
    // Names read off a dynamic import or a namespace of a kit module.
    expect(counts('const { Button, ThemeProvider } = await import("../dist/index.js");', button)).toBe(true);
    expect(counts('const B = ((await import("../src/index.ts")) as Kit).Button;', button)).toBe(true);
    expect(counts('const mod = await import(`../src/atoms/${dir}/${dir}.tsx`);\nmod.Button;', button)).toBe(true);
    expect(counts('const mod = await import(`../src/atoms/${dir}/${dir}.tsx`);\nmod.Avatar;', button)).toBe(false);
    expect(counts('import * as kit from "../src/index.ts";\nrender(<kit.Button />);', button)).toBe(true);
    // A word in the text, or a route literal, is not an import.
    expect(counts('// renders a Button inside a View\nconst path = "/components/view/conversions.h";', view)).toBe(false);
    expect(counts('import { Button } from "some-other-kit";', button)).toBe(false);
  });
});
