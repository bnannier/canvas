import { referenceContrast } from "./fixtures/reference-contrast.ts";
import { describe, expect, it } from "bun:test";
import { composite, contrastRatio } from "../src/style/color.ts";
import { statusColors, type StatusColorTone } from "../src/style/status.ts";
import { SOFT_ALPHA } from "../src/style/soft-roles.ts";
import { lightColors } from "../src/style/tokens.ts";
import { LOOKS } from "./fixtures/looks.ts";

// statusColors is the one place a toned surface reads its colors (src/style/status.ts):
// every tone's ink names the tone in text over its own wash and over a plain surface, and
// its dot marks it beside text. D14 keeps reference colors: composed contrast against
// the text (4.5:1) and mark (3:1) floors is recorded rather than used to recolor them.

const TONES: StatusColorTone[] = ["success", "warning", "error", "info", "neutral"];

describe("statusColors", () => {
  for (const look of LOOKS) {
    const t = look.tokens;
    for (const tone of TONES) {
      it(`records the ${tone} reference ink and dot contrast in ${look.name}`, () => {
        const { ink, wash, dot } = statusColors(t, tone);
        const inkRatios: number[] = [], dotRatios: number[] = [];
        for (const surface of [t.card, t.background]) {
          const bed = composite(wash, surface);
          inkRatios.push(contrastRatio(ink, bed), contrastRatio(ink, surface));
          dotRatios.push(contrastRatio(dot, surface));
        }
        referenceContrast(`${look.name} ${tone} text`, inkRatios, 4.5);
        referenceContrast(`${look.name} ${tone} dot`, dotRatios, 3);
      });
    }
  }

  it("reads the theme's roles, so an override repaints every toned surface", () => {
    // A brand override reaches statusColors through the ThemeProvider's merge, which carries an
    // overriding `success` onto `success-text` too (src/style/theme.tsx).
    const tokens = { ...lightColors, success: "#0f6b3a", "success-text": "#0f6b3a", "success-soft": "rgba(15, 107, 58, 0.1)" };
    expect(statusColors(tokens, "success")).toEqual({ ink: "#0f6b3a", wash: "rgba(15, 107, 58, 0.1)", dot: "#0f6b3a" });
    expect(statusColors(tokens, "info").dot).toBe(tokens.primary);
    expect(statusColors(tokens, "error").ink).toBe(tokens["destructive-text"]);
  });

  it("falls back to the hand-off's wash alphas when a map omits the soft roles", () => {
    // The v4 hand-off washes every light tone at 0.1 (SOFT_ALPHA.light).
    const { "success-soft": _s, "warning-soft": _w, "destructive-soft": _d, "primary-soft": _p, ...legacy } = lightColors;
    for (const tone of ["success", "warning", "error", "info"] as const) {
      expect(statusColors(legacy, tone).wash, tone).toMatch(new RegExp(`^rgba\\(.*, ${SOFT_ALPHA.light[tone]}\\)$`));
    }
  });
});
