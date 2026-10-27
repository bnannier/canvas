import { describe, expect, it } from "bun:test";
import { composite, contrastRatio } from "../src/style/color.ts";
import { statusColors, type StatusColorTone } from "../src/style/status.ts";
import { SOFT_ALPHA } from "../src/style/soft-roles.ts";
import { lightColors } from "../src/style/tokens.ts";
import { LOOKS } from "./fixtures/looks.ts";

// statusColors is the one place a toned surface reads its colors (src/style/status.ts):
// every tone's ink names the tone in text over its own wash and over a plain surface, and
// its dot marks it beside text. The ink is held to 4.5:1 (text), the dot to 3:1 (a
// non-text mark, WCAG 1.4.11), on the card and on the page, in every palette the kit ships.

const TONES: StatusColorTone[] = ["success", "warning", "error", "info", "neutral"];

describe("statusColors", () => {
  for (const look of LOOKS) {
    const t = look.tokens;
    for (const tone of TONES) {
      it(`keeps the ${tone} ink and dot legible in ${look.name}`, () => {
        const { ink, wash, dot } = statusColors(t, tone);
        for (const surface of [t.card, t.background]) {
          const bed = composite(wash, surface);
          expect(contrastRatio(ink, bed)).toBeGreaterThanOrEqual(4.5);
          expect(contrastRatio(ink, surface)).toBeGreaterThanOrEqual(4.5);
          expect(contrastRatio(dot, surface)).toBeGreaterThanOrEqual(3);
        }
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
