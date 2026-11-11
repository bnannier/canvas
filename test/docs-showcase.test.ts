import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SHOWCASE } from "../docs/src/data/showcase.ts";
import { SECTION_ROOMS } from "../docs/src/data/rooms.ts";
import { COMPONENTS } from "../docs/src/core/data/components.ts";
import { renderShowcase } from "../tools/v4/derive-showcase.ts";
import { REPOSITORY_CARDS, REPOSITORY_COMPONENTS } from "../tools/v4/repository-components.ts";

// The section pages' cards (docs/src/data/showcase.ts, written from the hand-off by
// tools/v4/derive-showcase.ts) and the section modules that render them (docs/src/sections).
// A card for a component the hand-off predates is the repository's (REPOSITORY_CARDS).
const SECTIONS_DIR = join(import.meta.dir, "../docs/src/sections");
const SLUGS = new Set(COMPONENTS.map((c) => c.slug));

describe("the section page cards", () => {
  it("are the hand-off's, as the derivation writes them", () => {
    expect(readFileSync(join(import.meta.dir, "../docs/src/data/showcase.ts"), "utf8")).toBe(renderShowcase());
  });

  it("cover the eight sections", () => {
    expect(Object.keys(SHOWCASE)).toEqual(SECTION_ROOMS.map((room) => room.id));
  });

  it("link only to components the docs list", () => {
    for (const section of Object.values(SHOWCASE)) {
      for (const card of section.cards) {
        for (const slug of card.links) expect(SLUGS.has(slug), `${card.id} links ${slug}`).toBe(true);
      }
    }
  });

  it("link every component of a room from some card on its page", () => {
    for (const room of SECTION_ROOMS) {
      const linked = new Set(SHOWCASE[room.id as keyof typeof SHOWCASE].cards.flatMap((card) => card.links));
      expect(room.items.filter((item) => !linked.has(item.id)).map((item) => item.id), room.id).toEqual([]);
    }
  });

  it("span the whole row where the hand-off's do", () => {
    const own = new Set(REPOSITORY_CARDS.map((card) => card.id));
    const full = Object.fromEntries(Object.entries(SHOWCASE).map(([id, section]) => [id, section.cards.filter((card) => card.full && !own.has(card.id)).map((card) => card.id)]));
    expect(full).toEqual({
      foundations: ["c-typography"],
      layout: ["c-breakpoints", "c-responsive", "c-sizing", "c-layout", "c-app-frame"],
      controls: ["c-button"],
      inputs: ["c-form"],
      navigation: ["c-navbar"],
      data: ["c-card-anatomy", "c-stats", "c-data-table", "c-board"],
      charts: ["c-chart"],
      overlays: ["c-wizard", "c-command"],
    });
  });

  it("place each repository card after the hand-off card it names, in that card's grid, frame and subsection", () => {
    for (const own of REPOSITORY_CARDS) {
      const cards = SHOWCASE[own.page as keyof typeof SHOWCASE].cards;
      const at = cards.findIndex((card) => card.id === own.id);
      expect(cards[at - 1]?.id, own.id).toBe(own.after);
      const { tile, inset, gap, headGap, footGap, group } = cards[at - 1]!;
      expect(cards[at]).toEqual({ id: own.id, links: [...own.links], tile, full: own.full, inset, gap, headGap, footGap, title: own.title, meta: own.meta, group });
      for (const slug of own.links) expect(REPOSITORY_COMPONENTS[slug], `${own.id} links ${slug}`).toBeDefined();
    }
  });

  it("link every repository component from a card of the hand-off's or the repository's", () => {
    const linked = new Set(Object.values(SHOWCASE).flatMap((section) => section.cards.flatMap((card) => card.links)));
    expect(Object.keys(REPOSITORY_COMPONENTS).filter((slug) => !linked.has(slug))).toEqual([]);
  });

  it("put Data's cards under its three subsections", () => {
    expect(SHOWCASE.data.groups.map((group) => group.title)).toEqual(["Lists & disclosure", "Content & media", "Workspace"]);
    expect(SHOWCASE.data.cards.filter((card) => card.group == null).map((card) => card.id)).toEqual(["c-card", "c-card-anatomy", "c-stats", "c-data-table"]);
  });
});

describe("the section modules", () => {
  const index = readFileSync(join(SECTIONS_DIR, "index.ts"), "utf8");

  it("give every section a page module", () => {
    for (const room of SECTION_ROOMS) expect(index).toContain(`import * as ${room.id} from "./${room.id}";`);
  });

  it("render every card of their page once a page renders cards", () => {
    for (const room of SECTION_ROOMS) {
      const source = readFileSync(join(SECTIONS_DIR, `${room.id}.tsx`), "utf8");
      // A page whose cards have not landed still shows the catalog body.
      if (!source.includes("ShowcaseCard")) continue;
      for (const card of SHOWCASE[room.id as keyof typeof SHOWCASE].cards) {
        expect(source.includes(`id="${card.id}"`), `${room.id} renders ${card.id}`).toBe(true);
      }
    }
  });

  it("render the Controls page's cards", () => {
    expect(readFileSync(join(SECTIONS_DIR, "controls.tsx"), "utf8")).toContain("ShowcaseCard");
  });
});
