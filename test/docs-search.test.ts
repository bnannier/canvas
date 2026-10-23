import { describe, expect, it, mock } from "bun:test";
import * as React from "react";

// The docs app resolves its own React; hand it the test's so the index's modules load.
mock.module(import.meta.resolve("../docs/node_modules/react/index.js"), () => React);
const { search } = await import("../docs/src/core/data/search.ts");

// Components lead every search, whatever else matches (the owner's 2026-10-23 decision).
describe("docs search", () => {
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
