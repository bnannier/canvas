import { referenceContrast } from "./fixtures/reference-contrast.ts";
import { describe, it, expect } from "bun:test";
import { readFileSync } from "node:fs";
import { CSSMediaRule, CSSStyleRule, Window } from "happy-dom";
import { lightColors, darkColors, colorsByScheme, colorsFor, glassByScheme, palette, PALETTES } from "../src/style/tokens.ts";
import { WEB_FROST, WEB_TINTS, webBackdrop } from "../src/style/glass-surface/web-frost.ts";
import { statusHues } from "../src/style/status-hue.ts";
import { LOOKS, type Look } from "./fixtures/looks.ts";
import { ACCENT_SELECTOR, paletteSelector } from "../tools/tokens/css-tokens.ts";
import { composite, contrastRatio } from "../src/style/color.ts";

const REQUIRED = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "muted",
  "muted-foreground",
  "accent",
  "destructive",
  "border",
  "input",
  "ring",
] as const;

describe("color tokens", () => {
  it("every palette in both schemes defines every required token as a string", () => {
    for (const look of LOOKS) for (const k of REQUIRED) expect(typeof look.tokens[k], `${look.name} ${k}`).toBe("string");
  });

  it("each palette is keyed exactly like the default and moves only its accent", () => {
    for (const p of PALETTES) {
      for (const scheme of ["light", "dark"] as const) {
        const t = colorsFor(p, scheme);
        const base = colorsByScheme[scheme];
        expect(Object.keys(t).sort()).toEqual(Object.keys(base).sort());
        // The neutrals are the scheme's, whatever the hue.
        expect(t.background).toBe(base.background);
        expect(t.foreground).toBe(base.foreground);
        if (p !== "violet") expect(t.primary, `${p} ${scheme}`).not.toBe(base.primary);
      }
    }
  });

  it("colorsFor resolves each palette in each scheme, the default violet the published constants", () => {
    expect(colorsFor("violet", "light")).toBe(lightColors);
    expect(colorsFor("violet", "dark")).toBe(darkColors);
    expect(colorsFor("mint", "dark")).not.toBe(darkColors);
  });

  it("light and dark use distinct surface + text colors", () => {
    expect(lightColors.background).not.toBe(darkColors.background);
    expect(lightColors.foreground).not.toBe(darkColors.foreground);
    expect(lightColors.primary).not.toBe(darkColors.primary);
  });

  it("colorsByScheme maps each scheme to its token set", () => {
    expect(colorsByScheme.light.background).toBe(lightColors.background);
    expect(colorsByScheme.dark.background).toBe(darkColors.background);
  });

  it("defines the eight categorical chart tokens in every palette", () => {
    for (let i = 1; i <= 8; i++) {
      const key = `chart-${i}` as const;
      for (const look of LOOKS) expect(look.tokens[key], `${look.name} ${key}`).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("keeps series colors distinct and off the reserved status tokens", () => {
    for (const colors of LOOKS.map((look) => look.tokens)) {
      const series = Array.from({ length: 8 }, (_, i) => colors[`chart-${i + 1}` as keyof typeof colors]);
      // No duplicate slots: identity encoding needs eight distinct hues.
      expect(new Set(series).size).toBe(8);
      // Status colors are reserved for state, never reused as series identity.
      for (const status of [colors.destructive, colors.success, colors.warning]) {
        expect(series).not.toContain(status);
      }
    }
  });
});

describe("statusHues", () => {
  it("maps each semantic status tone to a palette hue family", () => {
    expect(statusHues).toEqual({ success: "green", warning: "amber", error: "red", info: "blue" });
  });

  it("names hues that exist at every step Alert and Badge reach for", () => {
    // Alert: 50/200 + 600/700/800 in light, 950/800 + 200/300/400 in dark.
    // Badge: the same pill surfaces, a 700/400 label, and a saturated 500 dot.
    const steps = [50, 200, 300, 400, 500, 600, 700, 800, 950];
    for (const hue of Object.values(statusHues)) {
      for (const step of steps) {
        expect(palette[`${hue}-${step}`]).toMatch(/^#[0-9a-f]{6}$/);
      }
    }
  });
});

describe("glassByScheme and WEB_TINTS (the glass material's own tokens)", () => {
  it("gives the material its own rgba fill in each scheme", () => {
    // The native set: iOS Liquid Glass and frost and the Android blur read it, seeded on the
    // hand-off's 62% `--gl` for the functional layer. The web's set is WEB_TINTS, which the
    // CSS hand-off carries (checked against the shipped stylesheet below, and by
    // scripts/validate-tokens.ts).
    expect(glassByScheme.light["glass-tint"]).toBe("rgba(255, 255, 255, 0.62)");
    expect(glassByScheme.dark["glass-tint"]).toBe("rgba(18, 18, 26, 0.62)");
    for (const scheme of ["light", "dark"] as const) {
      for (const tint of Object.values(WEB_TINTS[scheme])) expect(tint).toMatch(/^rgba\(\d+, \d+, \d+, 0\.\d+\)$/);
    }
  });

  it("overrides NO semantic token, so a dense menu and a sheer bar are independent", () => {
    // The regression this shape exists to prevent: glass used to swap `popover`
    // translucent, so every popover-filled surface (menus, select lists, alert
    // dialogs) went see-through the moment glass turned on, and densifying one of
    // them would have densified the bars with it. The material carries its own
    // fills now, one per layer; the semantic set is untouched.
    for (const tints of [glassByScheme, WEB_TINTS]) {
      for (const scheme of ["light", "dark"] as const) {
        // One tint per LAYER of the glass model (functional, content, control, dense),
        // and nothing that names a semantic surface.
        expect(Object.keys(tints[scheme])).toEqual(["glass-tint", "glass-tint-content", "glass-tint-control", "glass-tint-dense"]);
        expect(tints[scheme]).not.toHaveProperty("popover");
        expect(tints[scheme]).not.toHaveProperty("card");
      }
    }
    // popover and card stay opaque in both schemes, exactly as the hand-off ships them.
    for (const colors of [lightColors, darkColors]) {
      expect(colors.popover).toMatch(/^#[0-9a-f]{6}$/);
      expect(colors.card).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("keys the family by its CSS custom-property name, so the hand-off stays cross-checked", () => {
    // scripts/validate-tokens.ts matches these keys against `--<name>` in
    // styles/tokens/colors.css; a key renamed to a JS-style one would silently
    // drop out of that check, which is how the two layers drift.
    for (const tints of [glassByScheme, WEB_TINTS]) {
      for (const scheme of ["light", "dark"] as const) {
        for (const key of Object.keys(tints[scheme])) expect(key).toMatch(/^glass-[a-z-]+$/);
      }
    }
  });
});

describe("CSS material handoff fallbacks", () => {
  // Parse the shipping stylesheets through CSSOM. Resolve their real aliases so
  // an omitted layer cannot pass by checking just the first tint or blur token.
  const cssWindow = new Window();
  const sheet = new cssWindow.CSSStyleSheet();
  sheet.replaceSync(["colors", "shadows", "surface"].map((name) =>
    readFileSync(new URL(`../styles/tokens/${name}.css`, import.meta.url), "utf8"),
  ).join("\n"));

  // The accessibility and print fallbacks lead their selector list with the glass root,
  // then name the scheme and palette wrappers that declare tints of their own.
  const GLASS_ROOT = '[data-surface="glass"]';
  const FALLBACK_SELECTOR = `${GLASS_ROOT},${GLASS_ROOT} :is(.dark,[data-palette])`;

  function materialValues(look: Look, media?: string) {
    const values = new Map<string, string>();
    const apply = (rule: CSSStyleRule) => {
      for (let i = 0; i < rule.style.length; i++) {
        const key = rule.style.item(i);
        values.set(key, rule.style.getPropertyValue(key).trim());
      }
    };
    // The look's blocks in sheet order: the light scheme, the dark one, the palette's hue,
    // the accent rows, and the glass root.
    const squash = (selector: string) => selector.replace(/\s*,\s*/g, ",");
    const own = [":root", ...(look.scheme === "dark" ? [".dark"] : []), paletteSelector(look.palette), ACCENT_SELECTOR[look.scheme], GLASS_ROOT].map(squash);
    for (const rule of sheet.cssRules) {
      if (rule instanceof CSSStyleRule && own.includes(squash(rule.selectorText))) apply(rule);
      if (rule instanceof CSSMediaRule && rule.conditionText === media) {
        for (const nested of rule.cssRules) {
          if (nested instanceof CSSStyleRule && nested.selectorText === FALLBACK_SELECTOR) apply(nested);
        }
      }
    }
    function resolve(key: string, seen = new Set<string>()): string {
      if (seen.has(key)) throw new Error(`Circular CSS token: ${key}`);
      seen.add(key);
      const value = values.get(key);
      if (value === undefined) throw new Error(`Missing CSS token: ${key}`);
      return value.replace(/var\((--[a-z-]+)\)/g, (_, alias: string) => resolve(alias, new Set(seen)));
    }
    return resolve;
  }

  // An rgba() colour's four channels, so the stylesheet's spelling (no spaces) and the
  // JS tables' (spaced) compare as values.
  const channels = (value: string) => (/^rgba\(([^)]*)\)$/.exec(value)?.[1] ?? "").split(",").map(Number);

  for (const look of LOOKS) {
    const { name: scheme } = look;
    it(`retains translucent ${scheme} material when no fallback is active`, () => {
      const value = materialValues(look);
      // The hand-off is the WEB material: the v4 frost, whose table is web-frost.ts.
      for (const [tint, fill] of Object.entries(look.webGlass)) {
        expect(value(`--${tint}`)).toMatch(/^rgba\(.+,\s*0\.\d+\)$/);
        expect(channels(value(`--${tint}`))).toEqual(channels(fill));
      }
      // One blur with the hand-off's saturation lift.
      expect(value("--glass-blur")).toBe(`${WEB_FROST.blur}px`);
      expect(value("--glass-frost")).toBe(webBackdrop(WEB_FROST.blur));
      // The lens is gone, and its tokens with it.
      expect(() => value("--glass-lens")).toThrow("Missing CSS token");
      expect(() => value("--glass-illumination")).toThrow("Missing CSS token");
      // The rim is one inset hairline in the hand-off's strong line, no specular highlight.
      expect(channels(value("--glass-edge"))).toEqual(channels(WEB_FROST.rim[look.scheme]));
      expect(value("--glass-specular")).toBe(`inset 0 0 0 ${WEB_FROST.rimWidth}px ${value("--glass-edge")}`);
      // The page behind the frost is the app's own: the kit ships no backdrop token.
      expect(() => value("--surface-backdrop")).toThrow("Missing CSS token");
    });

    for (const media of ["(prefers-reduced-transparency:reduce)", "(prefers-contrast:more)", "print"]) {
      it(`restores every ${scheme} material layer to an opaque skin for ${media}`, () => {
        const value = materialValues(look, media);
        for (const tint of Object.keys(look.webGlass)) {
          const fill = value(`--${tint}`);
          expect([value("--card"), value("--popover")]).toContain(fill);
          expect(fill).toMatch(/^#[0-9a-f]{6}$/);
        }
        expect(value("--glass-frost")).toBe("none");
        expect([value("--border"), value("--input")]).toContain(value("--glass-edge"));
        expect(value("--glass-specular")).toBe(media === "print" ? "none" : value("--shadow-lg"));
        // Material fallback must not recolor the content placed above it.
        expect(value("--foreground")).toBe(materialValues(look)("--foreground"));
      });
    }
  }
});

// D14 restores the hand-off’s 16% control hairline. Pin its composed contrast and
// retain the historical 3:1 floor as an explicit audit result, never a recoloring rule.
describe("reference control boundary contrast (WCAG 1.4.11 audit)", () => {
  /** sRGB hex -> WCAG relative luminance. */
  function luminance(hex: string): number {
    const h = hex.replace("#", "");
    const channel = (i: number) => {
      const v = parseInt(h.slice(i, i + 2), 16) / 255;
      return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
  }

  function contrast(a: string, b: string): number {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  }

  it("computes a known ratio, so a broken helper cannot pass the checks below", () => {
    // Black on white is the fixed 21:1 endpoint of the scale.
    expect(contrast("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrast("#ffffff", "#ffffff")).toBeCloseTo(1, 5);
  });

  for (const { name: scheme, tokens: t } of LOOKS) {
    // Every surface a bordered control is placed on: the page, a card or popover,
    // and a muted/accent panel. The muted fill is the tightest of the three.
    it(`records the reference input boundary on every ${scheme} surface`, () => {
      expect(t.input).toBe(t["field-border"]!);
      referenceContrast(`${scheme} input boundary`, [t.background, t.card, t.popover, t.muted, t.accent, t.secondary].map((surface) => contrastRatio(composite(t.input, surface), surface)), 3);
    });

    it(`records the ${scheme} switch thumb contrast against its unchecked track`, () => {
      // The reference off-track uses the translucent input hairline.
      referenceContrast(`${scheme} switch thumb`, [contrastRatio(t.background, composite(t.input, t.background))], 3);
    });
  }

  it("`field-border` and `input` share the reference strong hairline above the divider", () => {
    // Both control and field boundaries name --ln2; separators name the finer --ln.
    for (const { tokens: t } of LOOKS) {
      const rest = composite(t["field-border"]!, t.card);
      expect(contrastRatio(rest, t.card)).toBeLessThan(3);
      expect(contrastRatio(rest, t.card)).toBeGreaterThan(contrastRatio(composite(t.border, t.card), t.card));
      expect(t["field-border"]).toBe(t.input);
    }
  });

  it("does NOT hold `border` to the control floor, keeping the separator hairline", () => {
    // Guards the split from the other side: someone "fixing" the contrast run
    // by collapsing border back onto input would coarsen every divider and card
    // edge in the kit. These are expected to stay well under 3:1.
    for (const { tokens: t } of LOOKS) {
      expect(contrastRatio(composite(t.border, t.background), t.background)).toBeLessThan(3);
      expect(t.border).not.toBe(t.input);
    }
  });
});
