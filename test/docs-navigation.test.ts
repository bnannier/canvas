import { describe, expect, it } from "bun:test";
import { NAV_GROUPS, getActiveGroup, getActiveSlug, nativeMenuFor, sectionFor, type MenuNode } from "../docs/src/data/nav";
import { SECTION_ROOMS, GUIDES_ROOM } from "../docs/src/data/rooms";
import { COMPONENTS } from "../docs/src/core/data/components";

const leaves = (nodes: MenuNode[]): string[] => nodes.flatMap((node) => node.kind === "leaf" ? [node.href] : leaves(node.items));

describe("the shared mobile navigation", () => {
  it("files every component once in its v4 room, after that room's overview", () => {
    const componentLinks: string[] = [];
    for (const room of SECTION_ROOMS) {
      const group = NAV_GROUPS.find((entry) => entry.label === room.title)!;
      expect(group.items.map((item) => item.href)).toEqual([room.href!, ...room.items.map((item) => item.href)]);
      expect(getActiveGroup(room.href!)).toBe(room.title);
      expect(sectionFor(room.href!)).toBe("components");
      for (const item of room.items) {
        componentLinks.push(item.href);
        expect(getActiveGroup(item.href)).toBe(room.title);
      }
    }
    expect(componentLinks.length).toBe(COMPONENTS.length);
    expect(new Set(componentLinks).size).toBe(COMPONENTS.length);
    expect(NAV_GROUPS.some((group) => ["Atoms", "Molecules", "Organisms"].includes(group.label))).toBe(false);
  });

  it("uses the desktop Guides room's reading order in the drawer", () => {
    expect(NAV_GROUPS.find((group) => group.label === "Guides")!.items.map((item) => item.href))
      .toEqual(GUIDES_ROOM.items.map((item) => item.href));
  });

  it("makes room overviews, skins and the catalog reachable from native Home and Components", () => {
    const paths = ["/components", "/skins", "/templates", ...SECTION_ROOMS.map((room) => room.href!)];
    for (const section of ["home", "components"]) {
      const targets = leaves(nativeMenuFor(section));
      for (const path of paths) expect(targets).toContain(path);
      for (const component of COMPONENTS) expect(targets).toContain(`/components/${component.slug}`);
    }
  });

  it("opens the active native room inline and resolves deep links and trailing slashes consistently", () => {
    const nodes = nativeMenuFor("components", getActiveGroup("/components/button/primary"));
    expect(nodes[0]).toMatchObject({ kind: "submenu", label: "Controls", inline: true });
    expect(leaves([nodes[0]])).toContain("/controls");
    expect(getActiveSlug("/components/button/primary")).toBe("button");
    expect(getActiveGroup("/foundations/")).toBe("Foundations");
    expect(sectionFor("/foundations/")).toBe("components");
    expect(getActiveSlug("/templates/dashboard/")).toBe("tpl-dashboard");
  });
});
