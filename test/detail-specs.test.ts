import { describe, expect, it } from "bun:test";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import * as ts from "typescript";
import { COMPONENTS } from "../docs/src/core/data/components.ts";
import { DETAIL_SPECS, KEYBOARD_PATTERNS, type DetailSpec } from "../docs/src/core/data/detail-specs.ts";
import { SECTIONS, SECTION_OF } from "../docs/src/core/data/detail-sections.ts";
import type { PropGroup } from "../docs/src/core/scope.ts";
import { INHERITED_PROPS } from "../docs/src/core/examples/inherited-props.ts";
import { extractProps, isPropSource, program } from "../tools/docgen/extract-props.ts";
import { exportedTags } from "../tools/docgen/scan-detail.ts";

// The detail pages' hand-off specs (docs/src/core/data/detail-specs.ts, written by
// tools/v4/derive-detail-specs.ts) drive the page's playground, sizes, states and anatomy
// with prop names taken from the v4 hand-off. The repository's API wins over the
// hand-off's: every name the specs pass must be a real prop of the component's props
// interface as docs:gen extracted it (or of React Native's own props for a primitive),
// and a hand-off knob the repository lacks must be listed under `dropped` with a reason.

const REPO = join(import.meta.dir, "..");
const EXAMPLES = join(REPO, "docs", "src", "core", "examples");
// A state the docs pin through the interaction override, not a prop.
const INTERACTION_STATES = new Set(["hover", "focus", "pressed"]);

// The groups docs:gen writes into each `<dir>-docs.tsx`, extracted the same way here.
function loadGroups(): Record<string, PropGroup[]> {
  const sources: { dir: string; file: string }[] = [];
  for (const category of readdirSync(join(REPO, "src"), { withFileTypes: true })) {
    if (!category.isDirectory()) continue;
    for (const dir of readdirSync(join(REPO, "src", category.name), { withFileTypes: true })) {
      if (!dir.isDirectory()) continue;
      for (const f of readdirSync(join(REPO, "src", category.name, dir.name)).sort()) {
        if (isPropSource(f)) sources.push({ dir: dir.name, file: join(REPO, "src", category.name, dir.name, f) });
      }
    }
  }
  return extractProps(sources, prog);
}

const prog = program();
const checker = prog.getTypeChecker();
const GROUPS = loadGroups();

// A React Native props interface's member names, resolved through the module the kit imports.
function reactNativeProps(name: string): Set<string> {
  const shell = prog.getSourceFile(join(REPO, "src/atoms/button/button.shared.tsx"))!;
  const specifier = shell.statements.find(
    (s): s is ts.ImportDeclaration => ts.isImportDeclaration(s) && (s.moduleSpecifier as ts.StringLiteral).text === "react-native",
  )!.moduleSpecifier;
  const module = checker.getSymbolAtLocation(specifier)!;
  const exported = checker.getExportsOfModule(module).find((s) => s.name === name);
  if (!exported) return new Set();
  const symbol = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
  return new Set(checker.getPropertiesOfType(checker.getDeclaredTypeOfSymbol(symbol)).map((p) => p.getName()));
}

// Icon's glyph booleans (IconGlyphProps), which the glyph knob names.
function glyphs(): Set<string> {
  for (const sf of prog.getSourceFiles()) {
    if (!sf.fileName.includes(join("src", "atoms", "icon"))) continue;
    for (const node of sf.statements) {
      if ((ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) && node.name.text === "IconGlyphProps") {
        return new Set(checker.getPropertiesOfType(checker.getTypeAtLocation(node)).map((p) => p.getName()));
      }
    }
  }
  return new Set();
}
const GLYPHS = glyphs();

const dirOf = (slug: string) => {
  const c = COMPONENTS.find((x) => x.slug === slug)!;
  return c.dir ?? c.slug;
};
const categoryOf = (dir: string) => readdirSync(EXAMPLES, { withFileTypes: true }).find((c) => c.isDirectory() && readdirSync(join(EXAMPLES, c.name)).includes(dir))!.name;

/** The prop names a spec may pass, or null when its props interface is not found. */
function propNames(slug: string, spec: DetailSpec): Set<string> | null {
  if (spec.propsInterface.startsWith("react-native:")) {
    const names = reactNativeProps(spec.propsInterface.slice("react-native:".length));
    return names.size ? names : null;
  }
  const group = (GROUPS[dirOf(slug)] ?? []).find((g) => g.name === spec.propsInterface);
  if (!group) return null;
  const names = new Set(group.props.map((p) => p.name));
  for (const heritage of group.inherits) {
    const inherited = INHERITED_PROPS[heritage.match(/\w+Props/)![0]];
    const omitted = [...heritage.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    for (const p of inherited?.props ?? []) if (!omitted.includes(p.name)) names.add(p.name);
  }
  return names;
}

/** Every name a spec passes that is not a prop, as "<slug>: <where> <name>". */
function mismatches(slug: string, spec: DetailSpec): string[] {
  const names = propNames(slug, spec);
  if (!names) return [`${slug}: no props interface ${spec.propsInterface}`];
  const out: string[] = [];
  const need = (where: string, name: string | null) => {
    if (name !== null && !names.has(name)) out.push(`${slug}: ${where} ${name}`);
  };
  for (const knob of spec.knobs) {
    if (knob.kind === "axis") knob.options.forEach((o) => need(`axis ${knob.label}`, o));
    else if (knob.kind === "glyph") {
      if (!GLYPHS.has(knob.value)) out.push(`${slug}: glyph ${knob.value}`);
    } else if (knob.kind === "component") {
      const tags = exportedTags(prog, [{ dir: dirOf(slug), entry: join(REPO, "src", categoryOf(dirOf(slug)), dirOf(slug), `${dirOf(slug)}.tsx`) }]);
      for (const o of knob.options) if (!tags.has(o)) out.push(`${slug}: component ${o}`);
    } else need(`${knob.kind} knob`, knob.prop);
  }
  if (spec.sizes?.prop) need("size prop", spec.sizes.prop);
  else spec.sizes?.options.forEach((o) => need("size", o));
  for (const state of spec.states ?? []) if (state !== null && !INTERACTION_STATES.has(state)) need("state", state);
  for (const prop of Object.keys(spec.anatomy.props)) need("anatomy prop", prop);
  // A drop goes stale the moment the repository gains the prop.
  for (const drop of spec.dropped ?? []) {
    const name = drop.knob.replace(/^(anatomy|state)\./, "");
    if (names.has(name)) out.push(`${slug}: dropped ${drop.knob} is a prop now; take the knob back`);
  }
  return out;
}

describe("v4 hand-off detail specs", () => {
  it("covers every registered component, and nothing else, under its hand-off section", () => {
    expect(Object.keys(DETAIL_SPECS).sort()).toEqual(COMPONENTS.map((c) => c.slug).sort());
    expect(SECTIONS.flatMap((s) => s.slugs).sort()).toEqual(COMPONENTS.map((c) => c.slug).sort());
    for (const c of COMPONENTS) {
      expect(c.section).toBe(SECTION_OF[c.slug]);
      expect(DETAIL_SPECS[c.slug].section).toBe(c.section);
    }
  });

  it("names only real props: every knob, axis option, size, state prop and anatomy prop", () => {
    const found = Object.entries(DETAIL_SPECS).flatMap(([slug, spec]) => mismatches(slug, spec));
    expect(found).toEqual([]);
  }, 60_000);

  it("drops a hand-off knob only with its reason", () => {
    for (const spec of Object.values(DETAIL_SPECS)) {
      for (const drop of spec.dropped ?? []) {
        expect(drop.knob.length).toBeGreaterThan(0);
        expect(drop.reason.length).toBeGreaterThan(20);
      }
    }
  });

  it("names a keyboard table for every component, each a list of [keys, effect] rows", () => {
    for (const spec of Object.values(DETAIL_SPECS)) expect(KEYBOARD_PATTERNS[spec.keyboard]).toBeDefined();
    for (const [key, rows] of Object.entries(KEYBOARD_PATTERNS)) {
      if (key === "none") expect(rows).toEqual([]);
      else for (const row of rows) expect(row.every((cell) => cell.length > 0)).toBe(true);
    }
  });

  it("is what tools/v4/derive-detail-specs.ts writes from the vendored hand-off", () => {
    const run = Bun.spawnSync(["bun", join(REPO, "tools/v4/derive-detail-specs.ts"), "--check"], { cwd: REPO });
    expect(run.stderr.toString()).toBe("");
    expect(run.exitCode).toBe(0);
  }, 30_000);
});
