import { describe, expect, it } from "bun:test";
import { glassTintsFor as iosTintsFor } from "../src/style/glass-surface/glass-tints.ios.ts";
import { glassTintsFor as androidTintsFor } from "../src/style/glass-surface/glass-tints.android.ts";
import { glassTintsFor as webTintsFor } from "../src/style/glass-surface/glass-tints.ts";
import { IOS_GLASS } from "../src/style/glass-surface/ios-tints.ts";
import { WEB_TINTS } from "../src/style/glass-surface/web-frost.ts";
import { legibleInnerFill, legibleWash } from "../src/style/glass-surface/glass-wash.ts";
import { innerFillAlpha } from "../src/style/glass-fill.ts";
import { channelsOf, composite, contrastRatio } from "../src/style/color.ts";
import { darkColors, glassByScheme, type GlassTokens } from "../src/style/tokens.ts";

// iOS's own glass tints (src/style/glass-surface/ios-tints.ts). Under the v4 hand-off iOS
// paints the public native set (`glassByScheme`) in both schemes: the GS-8 dark control
// override (white 0.05) corrected a LIGHT dark puck (white 0.12) that read #373740 under the
// frost, and the v4 dark puck is the hand-off's own raised surface (#1e1e29 at 0.72), so the
// override has nothing left to correct. Android paints the same native set, the web its frost
// table (web-frost.ts), one set per scheme whatever the palette.

const KEYS = ["glass-tint", "glass-tint-content", "glass-tint-control", "glass-tint-dense"] as const;
const alphaOf = (color: string) => channelsOf(color)![3];

describe("iOS's glass tints", () => {
  it("are the native set in both schemes, for every palette", () => {
    expect(iosTintsFor("dark")).toBe(IOS_GLASS.dark);
    expect(iosTintsFor("light")).toBe(IOS_GLASS.light);
    for (const key of KEYS) {
      expect(iosTintsFor("dark")[key], key).toBe(glassByScheme.dark[key]);
      for (const palette of ["violet", "cyan", "mint", "rose", "amber"] as const) expect(iosTintsFor("light", palette)[key], `${palette} ${key}`).toBe(glassByScheme.light[key]);
    }
  });

  it("match Android's, while the web keeps its own frost table", () => {
    expect(androidTintsFor("dark")).toBe(glassByScheme.dark);
    expect(androidTintsFor("light")).toBe(glassByScheme.light);
    expect(webTintsFor("dark")).toBe(WEB_TINTS.dark);
    expect(webTintsFor("light", "violet")).toBe(WEB_TINTS.light);
    expect(webTintsFor("light", "mint")).toBe(WEB_TINTS.light);
  });

  it("keep the dark control puck the hand-off's raised surface, denser than the functional layer", () => {
    const dark = iosTintsFor("dark");
    expect(channelsOf(dark["glass-tint-control"])!.slice(0, 3)).toEqual(channelsOf(darkColors.secondary)!.slice(0, 3));
    expect(alphaOf(dark["glass-tint-control"])).toBeGreaterThan(alphaOf(dark["glass-tint"]));
  });
});

describe("a dark iOS text field under the GS-2 cap", () => {
  const theme = (glass: GlassTokens) => ({ tokens: darkColors, glass, dark: true });
  const field = { layer: "control" as const, clear: false };

  it("keeps its addon a faint fill whose ink keeps 4.5:1", () => {
    const ios = iosTintsFor("dark");
    const fill = legibleInnerFill(theme(ios), field, "soft");
    expect(alphaOf(fill)).toBeGreaterThan(0);
    expect(alphaOf(fill)).toBeLessThanOrEqual(innerFillAlpha({ dark: true }, "soft"));
    // The bed the cap solves on: the addon's fill over the field's body, over the page and over a content pane.
    const body = ios["glass-tint-control"];
    for (const ground of [darkColors.background, composite(ios["glass-tint-content"], darkColors.background)]) {
      const bed = composite(fill, composite(body, ground));
      for (const ink of [darkColors["muted-foreground"], darkColors.foreground]) expect(contrastRatio(bed, ink), `${ink} over ${ground}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("paints an error wash only as deep as its ink keeps 4.5:1", () => {
    const ios = iosTintsFor("dark");
    const wash = legibleWash(theme(ios), "error", field);
    for (const ground of [darkColors.background, composite(ios["glass-tint-content"], darkColors.background)]) {
      const bed = composite(wash, ground);
      for (const ink of [darkColors["muted-foreground"], darkColors.foreground]) expect(contrastRatio(bed, ink), `${ink} over ${ground}`).toBeGreaterThanOrEqual(4.5);
    }
  });
});
