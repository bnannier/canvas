import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { catalogSections } from "../docs/src/catalog/sections.ts";
import { SECTION_ROOMS } from "../docs/src/data/rooms.ts";

describe("the component catalog's v4 sections", () => {
  it("uses every room and its reading order even when source previews arrive out of order", () => {
    const tiles = SECTION_ROOMS.flatMap((room) => room.items).map(({ href }) => ({ href })).reverse();
    const groups = catalogSections(tiles);
    expect(groups.map((group) => group.label)).toEqual(SECTION_ROOMS.map((room) => room.title));
    for (const [index, group] of groups.entries()) {
      expect(group.href).toBe(SECTION_ROOMS[index]!.href!);
      expect(group.count).toBe(SECTION_ROOMS[index]!.items.length);
      expect(group.tiles.map((tile) => tile.href)).toEqual(SECTION_ROOMS[index]!.items.map((item) => item.href));
    }
  });

  it("counts the room's whole catalog separately from the available live previews", () => {
    const [foundations] = catalogSections([{ href: "/components/text" }, { href: "/components/icon" }]);
    expect(foundations?.href).toBe("/foundations");
    expect(foundations?.count).toBe(6);
    expect(foundations?.summary).toBe("6 components · 2 previews");
    expect(foundations?.tiles).toHaveLength(2);
  });

  it("keeps all existing component previews, without adding a substitute for a missing preview", () => {
    const tiles = ["atoms", "molecules", "organisms", "charts"].flatMap((file) => {
      const source = readFileSync(new URL(`../docs/src/catalog/${file}.tsx`, import.meta.url), "utf8");
      return [...source.matchAll(/href: "(\/components\/[^\"]+)"/g)].map((match) => ({ href: match[1]! }));
    });
    expect(tiles.length).toBeGreaterThan(0);
    const grouped = catalogSections(tiles).flatMap((group) => group.tiles);
    expect(grouped.map((tile) => tile.href).sort()).toEqual(tiles.map((tile) => tile.href).sort());
    expect(new Set(grouped).size).toBe(tiles.length);
    expect(grouped.every((tile) => tiles.includes(tile))).toBe(true);
  });
});
