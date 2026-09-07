import { describe, it, expect } from "bun:test";
import {
  blockDeclarations,
  cssColorToHex,
  cssRgbaToCanonical,
  declarationsIn,
  oklchToHex,
  parseFontShorthand,
  platformBlocks,
  platformValue,
  pxValue,
  resolveVars,
  rgbaAlphas,
  shadowLayers,
  stripComments,
} from "./css-tokens.ts";

// Unit tests for the hand-off parser, on hand-written CSS rather than the real files:
// the design-rule suites assert what styles/tokens SAYS, and these assert that the
// parser reads it correctly, which are two different failures.

describe("stripComments", () => {
  it("removes a comment sitting inside a value", () => {
    expect(stripComments("var(--background) /* @kind other */").trim()).toBe("var(--background)");
  });
});

describe("colours", () => {
  it("converts oklch to the hex a browser paints", () => {
    // White and the zinc-950 foreground, both from styles/tokens/colors.css.
    expect(oklchToHex(1, 0, 0)).toBe("#ffffff");
    expect(cssColorToHex("oklch(1 0 0)")).toBe("#ffffff");
    expect(cssColorToHex("oklch(0.141 0.005 285.823)")).toBe("#09090b");
  });

  it("expands short hex and passes long hex through", () => {
    expect(cssColorToHex("#FFF")).toBe("#ffffff");
    expect(cssColorToHex("#6366f1")).toBe("#6366f1");
  });

  it("declines anything that is not a plain colour", () => {
    expect(cssColorToHex("var(--primary)")).toBeNull();
    expect(cssColorToHex("0px 1px 2px rgba(0,0,0,0.05)")).toBeNull();
  });

  it("canonicalises rgba so formatting is not a difference", () => {
    expect(cssRgbaToCanonical("rgba(0,0,0,0.20)")).toBe("rgba(0, 0, 0, 0.2)");
    expect(cssRgbaToCanonical("rgb(255, 255, 255)")).toBe("rgba(255, 255, 255, 1)");
  });
});

describe("declaration blocks", () => {
  const css = `
:root{--a:1px;--b:2px}
.dark{--a:3px}
[data-platform="ios"]{--a:4px;--c:5px;--a:6px}
`;

  it("reads one selector's declarations, last one winning", () => {
    expect(declarationsIn(css, ":root")).toEqual({ a: "1px", b: "2px" });
    expect(declarationsIn(css, ".dark")).toEqual({ a: "3px" });
  });

  it("reports a name declared twice in the same block", () => {
    const block = blockDeclarations(css, '[data-platform="ios"]');
    expect(block.present).toBe(true);
    expect(block.duplicates).toEqual(["a"]);
    // The later declaration is what the cascade actually resolves to.
    expect(block.decls.a).toBe("6px");
  });

  it("says so when a selector has no block at all", () => {
    const missing = blockDeclarations(css, ".nope");
    expect(missing.present).toBe(false);
    expect(missing.duplicates).toEqual([]);
  });

  it("does not let a nested block end the outer one early", () => {
    const nested = `:root{--a:1px;@media (min-width:100px){--x:9px}--b:2px}`;
    expect(declarationsIn(nested, ":root")).toEqual({ a: "1px", x: "9px", b: "2px" });
  });
});

describe("platform blocks", () => {
  const css = `
:root,[data-platform="web"]{--p-x:1px;--p-y:2px}
[data-platform="ios"]{--p-x:3px}
[data-platform="android"]{--p-y:4px}
`;

  it("finds all three", () => {
    const blocks = platformBlocks(css);
    expect(blocks.web.present && blocks.ios.present && blocks.android.present).toBe(true);
  });

  it("inherits from web the way the cascade does", () => {
    const blocks = platformBlocks(css);
    // iOS overrides x and inherits y; Android is the mirror image.
    expect(platformValue(blocks, "ios", "p-x")).toBe("3px");
    expect(platformValue(blocks, "ios", "p-y")).toBe("2px");
    expect(platformValue(blocks, "android", "p-x")).toBe("1px");
    expect(platformValue(blocks, "android", "p-y")).toBe("4px");
  });
});

describe("lengths and shadows", () => {
  it("reads a length, with or without a unit", () => {
    expect(pxValue("12px")).toBe(12);
    expect(pxValue("0")).toBe(0);
    expect(pxValue("-0.15px")).toBe(-0.15);
    expect(pxValue("9999px")).toBe(9999);
    expect(pxValue("var(--x)")).toBeNull();
    expect(pxValue(undefined)).toBeNull();
  });

  it("collects every alpha in a multi-layer shadow", () => {
    expect(rgbaAlphas("0 1px 2px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.1)")).toEqual([0.05, 0.1]);
    // A three-channel rgb() is fully opaque.
    expect(rgbaAlphas("0 1px 2px rgb(0,0,0)")).toEqual([1]);
  });

  it("splits layers on the separating commas, not the ones inside rgba", () => {
    const layers = shadowLayers("0px 1px 2px rgba(0,0,0,0.05), inset 0px -1px 0px rgba(0,0,0,0.1)");
    expect(layers).toHaveLength(2);
    expect(layers[0]).toEqual({ inset: false, x: 0, y: 1, blur: 2, spread: 0 });
    expect(layers[1]).toEqual({ inset: true, x: 0, y: -1, blur: 0, spread: 0 });
  });

  it("treats none as no layers", () => {
    expect(shadowLayers("none")).toEqual([]);
    expect(shadowLayers("")).toEqual([]);
  });
});

describe("var resolution", () => {
  const decls = { "text-sm": "14px", "leading-sm": "20px", "weight-normal": "400", sans: "Geist" };

  it("substitutes until the value is literal", () => {
    expect(resolveVars("var(--weight-normal) var(--text-sm)/var(--leading-sm) var(--sans)", decls)).toBe(
      "400 14px/20px Geist",
    );
  });

  it("leaves an unresolvable reference visible rather than blanking it", () => {
    expect(resolveVars("var(--nope)", decls)).toBe("var(--nope)");
  });

  it("parses the font shorthand the role tokens use", () => {
    expect(parseFontShorthand("600 24px/32px Geist, sans-serif")).toEqual({
      weight: 600,
      size: 24,
      lineHeight: 32,
      family: "Geist, sans-serif",
    });
  });

  it("returns nulls rather than guesses on a shape it does not know", () => {
    expect(parseFontShorthand("italic small-caps bold 16px/2 cursive").size).toBeNull();
  });
});
