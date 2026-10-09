import { describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { COMPONENTS } from "../../docs/src/core/data/components.ts";
import {
  FACTS_BEGIN,
  FACTS_END,
  VARIANTS_BEGIN,
  VARIANTS_END,
  checkChecklists,
  defaultSources,
  findBlock,
  mergeChecklist,
  parseVariantsTable,
  renderVariantsTable,
  writeChecklists,
  type ChecklistSources,
} from "./checklists.ts";
import { NATIVE_CELLS_PER_VARIANT, WEB_CELLS_PER_VARIANT, cellId, cellsFor, components, pageCellId, pages } from "./inventory.ts";
import { COMPONENT_PLANS, FAMILY_CHECKLISTS, UNIVERSAL_RUBRIC } from "./plan-specifics.ts";
import { auditStatus, checklistStatus } from "./status.ts";

// The real inventory and facts, narrowed to a few routes so each case writes a handful
// of files rather than all 128. The facts corpus is loaded once for the whole file.
const all = defaultSources();
const sources: ChecklistSources = {
  components: all.components.filter((c) => ["avatar", "button", "view", "line-chart"].includes(c.slug)),
  pages: all.pages.filter((p) => ["pattern-glass", "template-activity"].includes(p.id)),
  corpus: all.corpus,
};

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

describe("the audit checklists", () => {
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
      expect({ ...second, unchanged: second.unchanged.sort() }).toEqual({ seeded: [], updated: [], unchanged: first.seeded });
      for (const file of first.seeded) expect(read(dir, file)).toBe(before[file]);
      // The seed carries the plan's sections and the sign-off rows.
      const avatar = read(dir, "components/avatar.md");
      expect(avatar).toContain("### Media and identity");
      expect(avatar).toContain("- [ ] divergence misreport (K4)");
      expect(avatar).toContain("| android |  |  |  |  |");
      expect(avatar).toContain("| Platform entries | iOS: web build: Avatar, AvatarGroup; own build: AvatarMenu");
      // The parity report's "no equivalent" dash is read as the word none.
      expect(avatar).toContain("Avatar.size (Boolean axis: `small`, `large`)");
      expect(avatar).not.toContain(String.fromCharCode(0x2014));
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
