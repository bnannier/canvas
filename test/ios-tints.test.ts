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

// iOS's own glass tints (src/style/glass-surface/ios-tints.ts), the owner's GS-8 decision
// (audit/DECISIONS.md, glass-surface-ios-dark-control-tint-1). Once the iOS frost painted a
// field's tint over its blur (glass-surface-native-frost-self-sample-1), the native set's dark
// control puck (white 0.12) painted at full strength: on the iPhone simulator a dark text
// field's body read #373740 where it had read #272730, and the GS-2 cap (`legibleInnerFill`)
// left its prefix and suffix addons no fill at all. iOS takes white 0.05 for that one tint,
// which returns the body to #272730 and leaves the addon a faint fill under the same cap;
// Android and the web keep theirs, and the light scheme is the native set's on iOS too.

const KEYS = ["glass-tint", "glass-tint-content", "glass-tint-control", "glass-tint-dense"] as const;
const alphaOf = (color: string) => channelsOf(color)![3];

describe("iOS's glass tints", () => {
  it("are the native set with the dark control puck at white 0.05", () => {
    expect(iosTintsFor("dark")["glass-tint-control"]).toBe("rgba(255, 255, 255, 0.05)");
    for (const key of KEYS) {
      if (key !== "glass-tint-control") expect(iosTintsFor("dark")[key], key).toBe(glassByScheme.dark[key]);
      for (const palette of ["blush", "mint"] as const) expect(iosTintsFor("light", palette)[key], `${palette} ${key}`).toBe(glassByScheme.light[key]);
    }
    expect(iosTintsFor("dark")).toBe(IOS_GLASS.dark);
  });

  it("leave Android's and the web's tints where they were", () => {
    expect(androidTintsFor("dark")).toBe(glassByScheme.dark);
    expect(androidTintsFor("light")).toBe(glassByScheme.light);
    expect(glassByScheme.dark["glass-tint-control"]).toBe("rgba(255, 255, 255, 0.12)");
    expect(webTintsFor("dark")).toBe(WEB_TINTS.dark);
    expect(webTintsFor("light", "blush")).toBe(WEB_TINTS.light);
    expect(webTintsFor("light", "mint")).toBe(WEB_TINTS.mint);
  });

  it("keep the control puck the light, sheer tint over the dark panes", () => {
    const dark = iosTintsFor("dark");
    expect(channelsOf(dark["glass-tint-control"])!.slice(0, 3)).toEqual([255, 255, 255]);
    expect(alphaOf(dark["glass-tint-control"])).toBeLessThan(alphaOf(glassByScheme.dark["glass-tint-control"]));
    expect(alphaOf(dark["glass-tint-control"])).toBeGreaterThan(0);
  });
});

describe("a dark iOS text field under the GS-2 cap", () => {
  const theme = (glass: GlassTokens) => ({ tokens: darkColors, glass, dark: true });
  const field = { layer: "control" as const, clear: false };

  it("keeps its addon a faint fill whose ink keeps 4.5:1, where the native set's 0.12 left none", () => {
    const ios = iosTintsFor("dark");
    const fill = legibleInnerFill(theme(ios), field, "soft");
    expect(alphaOf(fill)).toBeGreaterThan(0);
    expect(alphaOf(fill)).toBeLessThan(innerFillAlpha({ dark: true }, "soft"));
    // The bed the cap solves on: the addon's fill over the field's body, over the page and over a content pane.
    const body = ios["glass-tint-control"];
    for (const ground of [darkColors.background, composite(ios["glass-tint-content"], darkColors.background)]) {
      const bed = composite(fill, composite(body, ground));
      for (const ink of [darkColors["muted-foreground"], darkColors.foreground]) expect(contrastRatio(bed, ink), `${ink} over ${ground}`).toBeGreaterThanOrEqual(4.5);
    }
    // Android's dark field (the native set) and iOS's before GS-8: the cap leaves no fill.
    expect(alphaOf(legibleInnerFill(theme(glassByScheme.dark), field, "soft"))).toBe(0);
  });

  it("still paints no error wash: the error border and message carry the state", () => {
    const ios = iosTintsFor("dark");
    expect(legibleWash(theme(ios), "error", field)).toBe(ios["glass-tint-control"]);
  });
});
