import { describe, expect, it, mock } from "bun:test";
import * as React from "react";

// The docs app resolves its own React; hand it the test's so the index's modules load.
mock.module(import.meta.resolve("../docs/node_modules/react/index.js"), () => React);
const { search, ALL_ENTRIES } = await import("../docs/src/core/data/search.ts");
const { COMPONENTS } = await import("../docs/src/core/data/components.ts");
const { SECTION_ROOMS, SKINS_PAGE, TEMPLATES_PAGE } = await import("../docs/src/data/rooms.ts");

// Components lead every search, whatever else matches (the owner's 2026-10-23 decision).
describe("docs search", () => {
  it("groups component results by their v4 section", () => {
    for (const component of COMPONENTS) {
      const entry = ALL_ENTRIES.find((item) => item.path === `/components/${component.slug}`);
      expect(entry?.category).toBe(component.section);
    }
    expect(ALL_ENTRIES.some((entry) => ["Atoms", "Molecules", "Organisms"].includes(entry.category))).toBe(false);
  });

  it("indexes every v4 section landing page, Skins and Templates", () => {
    for (const room of SECTION_ROOMS) {
      expect(ALL_ENTRIES.find((entry) => entry.path === room.href)?.title).toBe(room.title);
      expect(search(room.lead).some((entry) => entry.path === room.href)).toBe(true);
    }
    expect(search("skins").some((entry) => entry.path === SKINS_PAGE.href)).toBe(true);
    expect(search("templates").some((entry) => entry.path === TEMPLATES_PAGE.href)).toBe(true);
  });

  it("matches v4 typefaces and ignores surrounding search whitespace", () => {
    expect(search("Bricolage Grotesque").some((entry) => entry.path === "/tokens/typography")).toBe(true);
    expect(search("  button  ")).toEqual(search("button"));
  });

  const firstNonComponent = (hits: { component?: boolean }[]) => {
    const i = hits.findIndex((hit) => !hit.component);
    return i === -1 ? hits.length : i;
  };

  for (const query of ["typography", "theme", "layout", "dark", "native", "input", "a"]) {
    it(`puts every component ahead of the other entries for "${query}"`, () => {
      const hits = search(query);
      const cut = firstNonComponent(hits);
      expect(hits.slice(cut).some((hit) => hit.component)).toBe(false);
    });
  }

  it("ranks the Typography component ahead of the Typography guide page", () => {
    const hits = search("typography");
    const component = hits.findIndex((hit) => hit.path === "/components/typography");
    const guide = hits.findIndex((hit) => hit.path === "/tokens/typography");
    expect(component).toBeGreaterThanOrEqual(0);
    expect(guide).toBeGreaterThan(component);
  });

  it("keeps components within the 20-result cap when guides also match", () => {
    const hits = search("a");
    expect(hits).toHaveLength(20);
    expect(hits.every((hit) => hit.component)).toBe(true);
  });
});

describe("docs search, inside the components", () => {
  it("puts the exact title first, then title prefixes, then the rest", () => {
    const names = search("text").filter((hit) => hit.component).map((hit) => hit.title);
    expect(names[0]).toBe("Text");
    const prefixEnd = names.findIndex((name, i) => i > 0 && !name.toLowerCase().startsWith("text"));
    const rest = prefixEnd === -1 ? [] : names.slice(prefixEnd);
    expect(rest.some((name) => name.toLowerCase().startsWith("text"))).toBe(false);
  });
});
