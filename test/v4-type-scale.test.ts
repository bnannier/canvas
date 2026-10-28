import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { fluidRoles, fluidType, typeRoles } from "../src/style/type-scale";

// The kit's type roles are derived from the v4 hand-off, not typed in: each role is the
// hand-off Typography renderer's `TY` entry (tools/v4/handoff/cv-kit-controls.js), its
// tracking converted from em to px at the role's size and its line height the size times
// the ratio to a hundredth of a pixel (Android ceils it in physical pixels itself). A hand edit to
// src/style/type-scale.ts, or a new hand-off snapshot, fails here.

const source = readFileSync(new URL("../tools/v4/handoff/cv-kit-controls.js", import.meta.url), "utf8");
const table = /const TY=\{(.*)\};$/m.exec(source)?.[1] ?? "";
const TY: Record<string, string> = Object.fromEntries(
  [...table.matchAll(/(\w+):'([^']*)'/g)].map((m) => [m[1]!, m[2]!]),
);

function derive(spec: string) {
  const m = /^(\d+) ([\d.]+)px\/([\d.]+)/.exec(spec);
  if (!m) throw new Error(`unparsed type spec: ${spec}`);
  const [weight, size, ratio] = [m[1]!, Number(m[2]), Number(m[3])];
  const track = /letter-spacing:(-?[\d.]+)em/.exec(spec);
  return {
    fontSize: size,
    lineHeight: Math.round(size * ratio * 100) / 100,
    fontWeight: weight,
    letterSpacing: track ? Math.round(Number(track[1]) * size * 100) / 100 : undefined,
    uppercase: spec.includes("text-transform:uppercase"),
  };
}

// The roles that are the renderer's own rows, by the kit's name for them.
const ROWS: Record<string, string> = {
  display: "display",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  subheading: "subheading",
  lead: "lead",
  label: "label",
  small: "small",
  caption: "caption",
  tiny: "tiny",
  mono: "mono",
  eyebrow: "eyebrow",
  statValue: "statValue",
};

describe("v4 type roles", () => {
  it("reads the hand-off's Typography table", () => {
    expect(Object.keys(TY).length).toBeGreaterThan(15);
  });

  for (const [kit, row] of Object.entries(ROWS)) {
    it(`${kit} is the hand-off's ${row}`, () => {
      const want = derive(TY[row]!);
      const got = typeRoles[kit as keyof typeof typeRoles] as { fontSize: number; lineHeight: number; fontWeight: string; letterSpacing?: number; textTransform?: string };
      expect(got.fontSize).toBe(want.fontSize);
      expect(got.lineHeight).toBe(want.lineHeight);
      expect(got.fontWeight).toBe(want.fontWeight);
      expect(got.letterSpacing).toBe(want.letterSpacing);
      expect(got.textTransform === "uppercase").toBe(want.uppercase);
    });
  }

  it("body is the renderer's default text", () => {
    const fallback = /let s='([^']*)'/.exec(source)?.[1] ?? "";
    const want = derive(fallback);
    expect(typeRoles.body).toMatchObject({ fontSize: want.fontSize, lineHeight: want.lineHeight, fontWeight: want.fontWeight });
  });

  it("the tier tag is the hand-off's 600 mono at the 10px source floor", () => {
    expect(typeRoles.tag).toMatchObject({ fontSize: 10, fontWeight: "600" });
  });
});

// The fluid headlines are the hand-off pages' own `font: 500 clamp(min, N vw, max)/ratio`
// with an em tracking, read from the page that sets each.
const FLUID_PAGES: Record<keyof typeof fluidRoles, string> = {
  hero: "Canvas v4.0.0 Library.dc.html",
  pageTitle: "Canvas v4.0.0 Component.dc.html",
};

describe("v4 fluid headlines", () => {
  for (const [role, page] of Object.entries(FLUID_PAGES) as [keyof typeof fluidRoles, string][]) {
    it(`${role} is the h1 clamp of ${page}`, () => {
      const html = readFileSync(new URL(`../tools/v4/handoff/${page}`, import.meta.url), "utf8");
      const m = /<h1 style="[^"]*font:(\d+) clamp\((\d+)px,([\d.]+)vw,(\d+)px\)\/([\d.]+)[^"]*letter-spacing:(-?[\d.]+)em/.exec(html);
      expect(m).not.toBeNull();
      const [, weight, min, vw, max, ratio, track] = m!;
      expect(fluidRoles[role]).toEqual({
        min: Number(min), vw: Math.round(Number(vw) * 10) / 1000, max: Number(max), ratio: Number(ratio), trackingEm: Number(track), fontWeight: weight as "500",
      });
    });
  }

  it("resolves the clamp at a window width as the browser does", () => {
    expect(fluidType(fluidRoles.hero, 0)).toMatchObject({ fontSize: 56, lineHeight: 52.64, letterSpacing: -2.52 });
    expect(fluidType(fluidRoles.hero, 1440)).toMatchObject({ fontSize: 103.68, lineHeight: 97.46, letterSpacing: -4.67 });
    expect(fluidType(fluidRoles.hero, 2000)).toMatchObject({ fontSize: 112 });
    expect(fluidType(fluidRoles.pageTitle, 1440)).toMatchObject({ fontSize: 64, lineHeight: 64, letterSpacing: -2.56 });
    expect(fluidType(fluidRoles.pageTitle, 390)).toMatchObject({ fontSize: 40 });
  });
});

