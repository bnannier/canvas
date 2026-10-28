import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  INDEX_COPY,
  LIBRARY_HEADLINE,
  LIBRARY_HERO,
  LIBRARY_INDEX,
  PRINCIPLES,
  SUB_COMPONENTS,
  SUB_COMPONENT_COUNT,
  TIER_LEGEND,
  heroStats,
} from "../docs/src/data/library.ts";
import { SECTION_ROOMS } from "../docs/src/data/rooms.ts";
import { tierOf } from "../docs/src/data/tiers.ts";
import { COMPONENTS } from "../docs/src/core/data/components.ts";
import {
  COLLAGE,
  HERO_TYPE,
  heroType,
  auroraDiscs,
  blurredDisc,
  panelTransform,
  projectCss,
  type TransformOp,
} from "../docs/src/brand/library-hero-look.ts";
import { fluidRoles, fluidType } from "../src/style/type-scale.ts";

// The docs home (docs/src/shell/home.tsx): the v4 hand-off's Library page as data
// (docs/src/data/library.ts) and the brand illustrations' math
// (docs/src/brand/library-hero-look.ts), held to the hand-off and to the kit.
const ROOT = join(import.meta.dir, "..");
const LIBRARY = readFileSync(join(ROOT, "tools/v4/handoff/Canvas v4.0.0 Library.dc.html"), "utf8");
const API = JSON.parse(readFileSync(join(ROOT, "test/fixtures/public-api.json"), "utf8")) as Record<string, unknown>;
const METRICS = JSON.parse(readFileSync(join(ROOT, "tools/native/reference/v4-library-hero/metrics.json"), "utf8")) as Record<
  string,
  { stackBox: number[]; panels: { box: number[]; natural: number[] }[] }
>;

describe("the Library index", () => {
  it("files every section room's component once, in the room's order, with its tier", () => {
    expect(LIBRARY_INDEX.map((column) => column.title)).toEqual(SECTION_ROOMS.map((room) => room.title));
    const seen = new Set<string>();
    for (const [index, column] of LIBRARY_INDEX.entries()) {
      const room = SECTION_ROOMS[index]!;
      expect(column.num).toBe(String(index + 1).padStart(2, "0"));
      expect(column.href).toBe(room.href!);
      expect(column.items.map((item) => item.slug)).toEqual(room.items.map((item) => item.id));
      for (const item of column.items) {
        expect(seen.has(item.slug)).toBe(false);
        seen.add(item.slug);
        expect(item.tier).toBe(tierOf(item.slug)!);
        expect(item.href).toBe(`/components/${item.slug}`);
      }
    }
    expect(seen.size).toBe(SECTION_ROOMS.reduce((sum, room) => sum + room.items.length, 0));
  });

  it("tags each component with the tier the hand-off's index gives it", () => {
    const idx = LIBRARY.slice(LIBRARY.indexOf("const IDX=["), LIBRARY.indexOf("const ICON_SET="));
    const handoff = new Map<string, string>();
    for (const [, list] of idx.matchAll(/'\d\d','([^']+)'\]/g)) {
      for (const entry of list!.split("|")) {
        const [name, tag] = entry.split(":");
        handoff.set(name!, tag!);
      }
    }
    const legend = new Map(TIER_LEGEND.map((entry) => [entry.tier, entry.letter]));
    for (const column of LIBRARY_INDEX) {
      for (const item of column.items) expect(`${item.name} ${legend.get(item.tier)}`).toBe(`${item.name} ${handoff.get(item.name)}`);
    }
  });

  it("counts from the registries", () => {
    expect(heroStats()[0]).toBe(`${COMPONENTS.length} components`);
    expect(INDEX_COPY.title()).toBe(`${COMPONENTS.length} components`);
  });
});

describe("the Library copy", () => {
  it("takes the hand-off's headline, eyebrow and calls", () => {
    expect(LIBRARY_HEADLINE).toBe("Made of light.");
    expect(LIBRARY).toContain(`Light as <em style=`);
    expect(LIBRARY).toContain(`">material.</em></h1>`);
    expect(LIBRARY).toContain(`${LIBRARY_HERO.eyebrow("4.0.0")}</div>`);
    expect(LIBRARY).toContain(`>${LIBRARY_HERO.primary.label} <span>`);
    expect(LIBRARY).toContain(`>${LIBRARY_HERO.secondary.label} <span`);
  });

  it("takes the hand-off's first three principles word for word", () => {
    for (const principle of PRINCIPLES.slice(0, 3)) {
      expect(LIBRARY).toContain(`>${principle.num}</div><div style="font:500 22px/1.15 var(--fd);letter-spacing:-.02em">${principle.title}</div>`);
      expect(LIBRARY).toContain(`text-wrap:pretty">${principle.body}</p>`);
    }
  });

  it("lists sub-components that are real exports of the kit", () => {
    for (const group of SUB_COMPONENTS) {
      for (const name of group.names) expect(`${name} ${name in API}`).toBe(`${name} true`);
      expect(COMPONENTS.some((component) => `/components/${component.slug}` === group.href)).toBe(true);
    }
    expect(SUB_COMPONENT_COUNT).toBe(SUB_COMPONENTS.flatMap((group) => group.names).length);
  });
});

/** A React Native transform list as a 4x4 matrix, with the CSS meaning of each operation. */
function matrixOf(ops: TransformOp[]): number[][] {
  const identity = () => [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
  const multiply = (a: number[][], b: number[][]) => a.map((row) => b[0]!.map((_, j) => row.reduce((sum, value, k) => sum + value * b[k]![j]!, 0)));
  return ops.reduce((acc, op) => {
    const m = identity();
    const [key, value] = Object.entries(op)[0] as [string, number | string];
    if (key === "translateX") m[0]![3] = value as number;
    else if (key === "translateY") m[1]![3] = value as number;
    else if (key === "scale") { m[0]![0] = value as number; m[1]![1] = value as number; }
    else if (key === "perspective") m[3]![2] = -1 / (value as number);
    else {
      const a = (parseFloat(value as string) * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
      if (key === "rotateX") { m[1]![1] = c; m[1]![2] = -s; m[2]![1] = s; m[2]![2] = c; }
      if (key === "rotateY") { m[0]![0] = c; m[0]![2] = s; m[2]![0] = -s; m[2]![2] = c; }
      if (key === "rotateZ") { m[0]![0] = c; m[0]![1] = -s; m[1]![0] = s; m[1]![1] = c; }
    }
    return multiply(acc, m);
  }, identity());
}

describe("the hero illustrations", () => {
  it("draw the headline word in the kit's hero role", () => {
    expect(HERO_TYPE).toEqual(fluidRoles.hero);
    for (const width of [0, 390, 1024, 1440, 2000]) expect(heroType(width)).toEqual(fluidType(fluidRoles.hero, width) as ReturnType<typeof heroType>);
  });

  it("fold each collage panel's depth into a transform that projects as the hand-off's", () => {
    for (const width of ["1440", "390"]) {
      const { stackBox, panels } = METRICS[width]!;
      for (const [index, panel] of COLLAGE.panels.entries()) {
        const [, , w, h] = panels[index]!.natural as [number, number, number, number];
        const m = matrixOf(panelTransform(panel, stackBox[2]!));
        const xs: number[] = [];
        const ys: number[] = [];
        for (const [x, y] of [[0, 0], [w, 0], [0, h], [w, h]] as [number, number][]) {
          const v = [x, y, 0, 1];
          const [px, py, , pw] = m.map((row) => row.reduce((sum, value, j) => sum + value * v[j]!, 0)) as [number, number, number, number];
          const [cx, cy] = projectCss(panel, stackBox[2]!, [x, y]);
          expect(Math.abs(panel.x + px / pw - cx)).toBeLessThan(0.01);
          expect(Math.abs(panel.y + py / pw - cy)).toBeLessThan(0.01);
          xs.push(cx + stackBox[0]!);
          ys.push(cy + stackBox[1]!);
        }
        const box = [Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)];
        for (const [k, value] of box.entries()) expect(Math.abs(value - panels[index]!.box[k]!)).toBeLessThanOrEqual(1.5);
      }
    }
  });

  it("blur a disc into a profile that falls from its centre to nothing", () => {
    const { radius, stops } = blurredDisc(200, 70, 14);
    expect(radius).toBe(410);
    for (let i = 1; i < stops.length; i++) expect(stops[i]!.opacity).toBeLessThanOrEqual(stops[i - 1]!.opacity);
    expect(stops[0]!.opacity).toBeGreaterThan(0.5);
    expect(stops.at(-1)!.opacity).toBeLessThan(0.01);
    const discs = auroraDiscs(1440, 797);
    expect(discs.map((disc) => disc.role)).toEqual(["featured-start", "featured-middle", "featured-end"]);
    // The accent disc: 46vw at the layer's left edge, 5 percent down it.
    expect(discs[0]!.cx).toBeCloseTo(-0.2 * 1440 + 0.23 * 1440, 6);
    expect(discs[0]!.cy).toBeCloseTo(-0.2 * 797 + 0.05 * 1.4 * 797 + 0.23 * 1440, 6);
  });
});
