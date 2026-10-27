import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { PALETTES, colorsFor, paletteHue, type Palette } from "../src/style/tokens";

// The accent is the hand-off's `oklch(L C hue)`, converted to sRGB by the kit
// (src/style/color.ts oklchHex: Oklab, then per-channel clipping). Chrome paints the
// hand-off's values; tools/v4/accent-samples.json records what it painted for every hue
// in both schemes, and the kit must land within one channel unit of each (the matrices'
// rounding differs from Chrome's by at most one).

interface Samples {
  accent: Record<string, { dark: { ion: string; ionText: string }; light: { ion: string; ionText: string } }>;
  chart2to8: { dark: string[]; light: string[] };
}
const samples = JSON.parse(readFileSync(new URL("../tools/v4/accent-samples.json", import.meta.url), "utf8")) as Samples;

const channels = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
function near(got: string, want: string) {
  const delta = Math.max(...channels(got).map((c, i) => Math.abs(c - channels(want)[i]!)));
  expect({ got, want, close: delta <= 1 }).toEqual({ got, want: want, close: true });
}

/** The looks whose accent text the floor moves off the hand-off's value. */
const SOLVED_TEXT: Record<"dark" | "light", readonly Palette[]> = { light: ["cyan", "mint", "rose"], dark: [] };

describe("v4 accent", () => {
  it("covers every palette", () => {
    expect(PALETTES.map((p) => String(paletteHue[p])).sort()).toEqual(Object.keys(samples.accent).sort());
  });

  for (const palette of PALETTES as readonly Palette[]) {
    for (const scheme of ["dark", "light"] as const) {
      it(`${palette} ${scheme} matches what Chrome paints`, () => {
        const want = samples.accent[String(paletteHue[palette])]![scheme];
        const t = colorsFor(palette, scheme);
        near(t.primary, want.ion);
        // The accent text keeps the hand-off's value unless it misses its legibility floor,
        // when the token table solves it (src/style/ink-floor.ts); the solved looks are listed
        // so a change to which ones move is a visible decision.
        if (SOLVED_TEXT[scheme].includes(palette)) expect(t["primary-text"]).not.toBe(want.ionText);
        else near(t["primary-text"]!, want.ionText);
      });
    }
  }

  for (const scheme of ["dark", "light"] as const) {
    it(`the ${scheme} chart series 2 to 8 match what Chrome paints`, () => {
      const t = colorsFor("violet", scheme);
      samples.chart2to8[scheme].forEach((want, i) => near(t[`chart-${i + 2}` as "chart-2"]!, want));
    });
  }
});
