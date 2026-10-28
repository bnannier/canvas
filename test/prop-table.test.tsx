import { describe, it, expect } from "bun:test";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import type { ComponentDocs, PropGroup } from "../docs/src/core/scope.ts";
import { INHERITED_PROPS } from "../docs/src/core/examples/inherited-props.ts";

// The generated prop tables live in each component's docs module
// (docs/src/core/examples/<category>/<dir>/<dir>-docs.tsx); the detail page's Props
// section (docs/src/ui/detail/props.tsx) renders them through the kit's own DataTable.
// This suite locks the generated data without needing the docs bundler: it is
// well-formed, names its axes and defaults, and carries the semantics, colour roles and
// related components the page reads. The modules are read straight from disk: the
// registry reaches them through Metro's `require.context`, which bun has no notion of,
// and each module carries nothing but its fences and its tables.

const EXAMPLES = join(import.meta.dir, "..", "docs", "src", "core", "examples");

async function loadDocs(): Promise<Record<string, ComponentDocs>> {
  const docs: Record<string, ComponentDocs> = {};
  for (const category of readdirSync(EXAMPLES)) {
    // examples/ also holds the shared inherited-props module beside the category dirs.
    if (category.endsWith(".ts")) continue;
    for (const dir of readdirSync(join(EXAMPLES, category))) {
      const mod = (await import(join(EXAMPLES, category, dir, `${dir}-docs.tsx`))) as { docs: ComponentDocs };
      docs[dir] = mod.docs;
    }
  }
  return docs;
}
const COMPONENT_DOCS = await loadDocs();
const COMPONENT_PROPS: Record<string, PropGroup[]> = Object.fromEntries(Object.entries(COMPONENT_DOCS).map(([dir, d]) => [dir, d.props]));

describe("generated prop tables", () => {
  it("every documented component has at least one well-formed prop group", () => {
    const keys = Object.keys(COMPONENT_PROPS);
    expect(keys.length).toBeGreaterThan(50);
    for (const key of keys) {
      for (const group of COMPONENT_PROPS[key]) {
        expect(group.name).toMatch(/Props$/);
        expect(group.props.length).toBeGreaterThan(0);
        for (const p of group.props) {
          expect(p.name.length).toBeGreaterThan(0);
          expect(p.type.length).toBeGreaterThan(0);
          expect(typeof p.required).toBe("boolean");
          // A prop's axis indexes its group's headers; its default is source text.
          if (p.group !== undefined) expect(group.groups[p.group]).toBeDefined();
          if (p.default !== undefined) expect(p.default.length).toBeGreaterThan(0);
        }
        for (const axis of group.groups) {
          expect(axis.title.length).toBeGreaterThan(0);
          expect(typeof axis.pickOne).toBe("boolean");
        }
        // An inherited interface is documented once, in INHERITED_PROPS.
        for (const heritage of group.inherits) expect(INHERITED_PROPS[heritage.match(/\w+Props/)![0]]).toBeDefined();
      }
    }
  });

  it("Avatar contributes three prop groups (AvatarMenu + Avatar + AvatarGroup)", () => {
    const groups = COMPONENT_PROPS["avatar"];
    expect(groups.map((g) => g.name)).toEqual(["AvatarMenuProps", "AvatarProps", "AvatarGroupProps"]);
  });

  it("Button's table names its axes and defaults and inherits the measure steps instead of listing them", () => {
    const [group] = COMPONENT_PROPS["button"];
    expect(group.inherits).toEqual(["MeasureProps"]);
    expect(group.props.some((p) => p.name === "xs")).toBe(false);
    expect(INHERITED_PROPS.MeasureProps.props.some((p) => p.name === "xs")).toBe(true);
    const intent = group.groups.findIndex((axis) => axis.title === "Intent");
    expect(group.groups[intent].pickOne).toBe(true);
    expect(group.props.find((p) => p.name === "destructive")).toMatchObject({ group: intent, default: "false" });
  });

  it("every docs module carries its semantics, colour roles and related components", () => {
    for (const docs of Object.values(COMPONENT_DOCS)) {
      for (const list of [docs.semantics.roles, docs.semantics.states, docs.semantics.aria, docs.semantics.touchTarget, docs.tokens, docs.related]) {
        expect(Array.isArray(list)).toBe(true);
      }
      expect(docs.related.length).toBeLessThanOrEqual(8);
    }
    const button = COMPONENT_DOCS["button"];
    expect(button.semantics.roles).toContain("button");
    expect(button.semantics.states).toContain("disabled");
    expect(button.tokens).toContain("primary");
    expect(button.related).not.toContain("button");
  });
});
