import { describe, it, expect } from "bun:test";
import { lightColors, darkColors, colorsByScheme, glassByScheme, brandColors, palette } from "../src/style/tokens.ts";
import { statusHues } from "../src/style/status-hue.ts";

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
  it("light and dark define every required token as a string", () => {
    for (const k of REQUIRED) {
      expect(typeof lightColors[k]).toBe("string");
      expect(typeof darkColors[k]).toBe("string");
    }
  });

  it("light and dark use distinct surface + text colors", () => {
    expect(lightColors.background).toBe("#ffffff");
    expect(darkColors.background).toBe("#09090b");
    expect(lightColors.foreground).not.toBe(darkColors.foreground);
    expect(lightColors.primary).not.toBe(darkColors.primary);
  });

  it("colorsByScheme maps each scheme to its token set", () => {
    expect(colorsByScheme.light.background).toBe(lightColors.background);
    expect(colorsByScheme.dark.background).toBe(darkColors.background);
  });

  it("defines the eight categorical chart tokens in both schemes", () => {
    for (let i = 1; i <= 8; i++) {
      const key = `chart-${i}` as const;
      expect(lightColors[key]).toMatch(/^#[0-9a-f]{6}$/);
      expect(darkColors[key]).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("keeps series colors distinct and off the reserved status tokens", () => {
    for (const colors of [lightColors, darkColors]) {
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

describe("brandColors", () => {
  it("defines the three orb constants as lowercase hexes", () => {
    for (const key of ["orb-indigo", "orb-violet", "orb-cyan"] as const) {
      expect(brandColors[key]).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("does not flip with the scheme, so it stays out of the light/dark token sets", () => {
    // A brand mark is one mark: it must not be reachable as a scheme-aware token.
    for (const key of Object.keys(brandColors)) {
      expect(lightColors).not.toHaveProperty(key);
      expect(darkColors).not.toHaveProperty(key);
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

describe("glassByScheme (the glass material's own tokens)", () => {
  it("gives the material its own rgba fill in each scheme", () => {
    // Read from the web hand-off (--glass-tint in styles/tokens/colors.css), never
    // invented here; scripts/validate-tokens.ts fails the build on any drift.
    expect(glassByScheme.light["glass-tint"]).toBe("rgba(255, 255, 255, 0.20)");
    expect(glassByScheme.dark["glass-tint"]).toBe("rgba(22, 22, 28, 0.30)");
  });

  it("overrides NO semantic token, so an opaque menu and a glass bar are independent", () => {
    // The regression this shape exists to prevent: glass used to swap `popover`
    // translucent, so every popover-filled surface (menus, select lists, alert
    // dialogs) went see-through the moment glass turned on, and making one of them
    // opaque would have made the bars opaque with it. The material carries its own
    // fill now; the semantic set is untouched.
    for (const scheme of ["light", "dark"] as const) {
      expect(Object.keys(glassByScheme[scheme])).toEqual(["glass-tint"]);
      expect(glassByScheme[scheme]).not.toHaveProperty("popover");
      expect(glassByScheme[scheme]).not.toHaveProperty("card");
    }
    // popover and card stay opaque in both schemes, exactly as the hand-off ships them.
    expect(lightColors.popover).toBe("#ffffff");
    expect(darkColors.popover).toBe("#18181b");
    expect(lightColors.card).toBe("#ffffff");
    expect(darkColors.card).toBe("#18181b");
  });

  it("keys the family by its CSS custom-property name, so the hand-off stays cross-checked", () => {
    // scripts/validate-tokens.ts matches these keys against `--<name>` in
    // styles/tokens/colors.css; a key renamed to a JS-style one would silently
    // drop out of that check, which is how the two layers drift.
    for (const scheme of ["light", "dark"] as const) {
      for (const key of Object.keys(glassByScheme[scheme])) expect(key).toMatch(/^glass-[a-z-]+$/);
    }
  });
});
