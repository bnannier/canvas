import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { GUIDES_ROOM, PILL_LINKS, SECTION_ROOMS, pillIndexFor, roomFor } from "../docs/src/data/rooms.ts";
import { SECTIONS } from "../docs/src/core/data/detail-sections.ts";
import { NAMES } from "../src/atoms/icon/icon.glyphs.ts";

// The docs' rooms (docs/src/data/rooms.ts): the v4 hand-off's eight sections and the
// Guides room, the pill's ten links, and where a path sits among them.
const HANDOFF = join(import.meta.dir, "../tools/v4/handoff");

describe("the rooms", () => {
  it("are the hand-off's eight sections, every component in its section's order", () => {
    expect(SECTION_ROOMS.map((room) => room.title)).toEqual(SECTIONS.map((section) => section.title));
    for (const [index, room] of SECTION_ROOMS.entries()) {
      expect(room.items.map((item) => item.id)).toEqual([...SECTIONS[index]!.slugs]);
    }
  });

  it("take each section page's own lead line", () => {
    const pages = ["Foundations", "Layout", "Controls", "Inputs", "Navigation", "Data", "Charts", "Overlays"];
    for (const [index, room] of SECTION_ROOMS.entries()) {
      const page = readFileSync(join(HANDOFF, `Canvas v4.0.0 ${pages[index]}.dc.html`), "utf8");
      expect(page).toContain(`text-wrap:balance">${room.title}</h2>`);
      expect(page).toContain(`text-wrap:balance">${room.lead}</p>`);
    }
  });

  it("take each section page's own paragraph under the lead", () => {
    const pages = ["Foundations", "Layout", "Controls", "Inputs", "Navigation", "Data", "Charts", "Overlays"];
    for (const [index, room] of SECTION_ROOMS.entries()) {
      const page = readFileSync(join(HANDOFF, `Canvas v4.0.0 ${pages[index]}.dc.html`), "utf8");
      const paragraph = page.match(/font:400 17px\/1\.55 var\(--ft\);color:var\(--tx2\);text-wrap:pretty">(.*?)<\/p>/);
      expect(paragraph, pages[index]).not.toBeNull();
      // Foundations sets its file path in the mono face: the body's code span.
      expect(room.body?.replace(/`/g, "")).toBe(paragraph![1]!.replace(/<[^>]+>/g, ""));
    }
  });

  it("count Foundations' glyphs from the icon set", () => {
    const glyphs = Number(SECTION_ROOMS[0]!.body?.match(/(\d+) glyphs/)?.[1]);
    expect(glyphs).toBe(NAMES.length);
  });

  it("put the pill's ten links in the hand-off pill's order", () => {
    expect(PILL_LINKS.map((link) => link.label)).toEqual([
      "Foundations", "Layout", "Controls", "Inputs", "Navigation", "Data", "Charts", "Overlays", "Skins", "Templates",
    ]);
  });

  it("place a path in its room", () => {
    expect(roomFor("/controls")).toEqual({ room: SECTION_ROOMS[2]! });
    expect(roomFor("/components/button")?.room.id).toBe("controls");
    expect(roomFor("/components/button")?.active).toBe("button");
    expect(roomFor("/components/button/primary")?.active).toBe("button");
    expect(roomFor("/components/line-chart")?.room.id).toBe("charts");
    expect(roomFor("/tokens/colors")).toEqual({ room: GUIDES_ROOM, active: "colors" });
    expect(roomFor("/")).toBeNull();
    expect(roomFor("/components")).toBeNull();
    expect(roomFor("/templates/activity")).toBeNull();
  });

  it("light the pill link of a path's room", () => {
    expect(pillIndexFor("/data")).toBe(5);
    expect(pillIndexFor("/components/dialog")).toBe(7);
    expect(pillIndexFor("/skins")).toBe(8);
    expect(pillIndexFor("/templates")).toBe(9);
    expect(pillIndexFor("/templates/activity")).toBe(9);
    expect(pillIndexFor("/tokens/colors")).toBe(-1);
    expect(pillIndexFor("/")).toBe(-1);
  });
});
