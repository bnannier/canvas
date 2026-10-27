import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { typeRoles } from "../src/style/type-scale";

// The kit's type roles are derived from the v4 hand-off, not typed in: each role is the
// hand-off Typography renderer's `TY` entry (tools/v4/handoff/cv-kit-controls.js), its
// tracking converted from em to px at the role's size and its line height the size times
// the ratio rounded up to a whole pixel (Android ceils line heights). A hand edit to
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
    lineHeight: Math.ceil(size * ratio - 1e-9),
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
