import { focusHaloColor } from "../src/style/field-colors.ts";
import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { colorsFor, PALETTES, paletteHue, type ColorScheme, type ColorTokens } from "../src/style/tokens.ts";
import { blockDeclarations, cssColorToHex, cssRgbaToCanonical } from "../tools/tokens/css-tokens.ts";
import { render } from "../tools/v4/derive-css.ts";
import { hueToneColors } from "../src/style/hue-tone.ts";

// Read the actual renderer's CSS rather than a second authored fixture. D14 requires
// literal reference fidelity, including values that the earlier contrast solver moved.
const handoff = readFileSync(new URL("../tools/v4/handoff/Canvas v4.0.0 Component.dc.html", import.meta.url), "utf8");
const dark = blockDeclarations(handoff, "[data-ion]").decls;
const light = { ...dark, ...blockDeclarations(handoff, '[data-ion][data-scheme="light"]').decls };
const sources = { dark, light };
const roles: Partial<Record<keyof ColorTokens, string>> = {
  background: "bg", "surface-sunken": "bg2", card: "sf", popover: "sf2",
  secondary: "sf3", muted: "sf3", accent: "sf3", "surface-raised": "sf4",
  foreground: "tx", "card-foreground": "tx", "popover-foreground": "tx",
  "secondary-foreground": "tx", "accent-foreground": "tx",
  "muted-foreground": "tx2", "subtle-foreground": "tx3",
  border: "ln", input: "ln2", "field-border": "ln2", "field-fill": "bg2", highlight: "hl",
  primary: "ion", "primary-text": "ion-tx", "primary-foreground": "ion-fg",
  "primary-soft": "ion-soft", action: "ion", "action-foreground": "ion-fg", "action-soft": "ion-soft",
  info: "ion-tx", "info-soft": "ion-soft", ring: "ion-ring", glow: "ion-glow",
  destructive: "bad", "destructive-text": "bad", "destructive-foreground": "bad-fg", "destructive-soft": "bad-soft",
  success: "ok", "success-text": "ok", "success-foreground": "ok-fg", "success-soft": "ok-soft",
  warning: "warn", "warning-text": "warn", "warning-foreground": "warn-fg", "warning-soft": "warn-soft", scrim: "scrim",
  "chart-1": "c1", "chart-2": "c2", "chart-3": "c3", "chart-4": "c4",
  "chart-5": "c5", "chart-6": "c6", "chart-7": "c7", "chart-8": "c8",
};
function resolve(name: string, scheme: ColorScheme, hue: number): string {
  const value = sources[scheme][name];
  if (!value) throw new Error(`Missing hand-off --${name}`);
  return value.replace(/var\(--([\w-]+)\)/g, (_, role: string) => role === "hue" ? String(hue) : resolve(role, scheme, hue));
}
const canonical = (value: string) => cssRgbaToCanonical(value) ?? cssColorToHex(value);

describe("v4 component hand-off color parity (D14)", () => {
  for (const palette of PALETTES) for (const scheme of ["light", "dark"] as const) {
    it(`${palette} ${scheme} keeps every mapped role at the renderer's exact value`, () => {
      const t = colorsFor(palette, scheme), hue = paletteHue[palette];
      for (const [role, source] of Object.entries(roles)) {
        expect(canonical(t[role as keyof ColorTokens]!), `${role} = --${source}`).toEqual(canonical(resolve(source, scheme, hue)));
      }
      expect(t["inverse-primary"]).toBe(cssColorToHex(resolve("ion-tx", scheme === "dark" ? "light" : "dark", hue)));
      for (const tone of ["cyan", "mint"] as const) expect(hueToneColors(t, scheme === "dark", tone).ink).toBe(cssColorToHex(resolve(tone, scheme, hue)));
    });
  }
  it("uses a translucent reference ring directly as the field halo even without glow", () => {
    const t = { ...colorsFor("violet", "light"), glow: undefined };
    expect(focusHaloColor(t)).toBe(t.ring);
  });
  it("keeps hue-tone ink and wash connected to consumer chart-role overrides", () => {
    const t = { ...colorsFor("violet", "light"), "chart-2": "#123456" };
    expect(hueToneColors(t, false, "cyan")).toEqual({ ink: "#123456", wash: "rgba(18, 52, 86, 0.16)" });
  });
  it("keeps CSS text and ring formulas dependent on the wrapper hue", () => {
    const css = render();
    expect(css).toContain("--primary-text:oklch(0.47 0.2 var(--hue))");
    expect(css).toContain("--primary-text:oklch(0.8 0.14 var(--hue))");
    expect(css).toContain("--ring:oklch(0.5 0.22 var(--hue) / 0.28)");
    expect(css).toContain("--ring:oklch(0.74 0.17 var(--hue) / 0.35)");
  });
});
