import { describe, it, expect } from "bun:test";
import { lightColors, darkColors, colorsByScheme, glassByScheme } from "../src/style/tokens.ts";

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
});

describe("glassByScheme", () => {
  it("makes only the popover fill translucent (the functional-layer material)", () => {
    expect(glassByScheme.light.popover).toMatch(/^rgba\(/);
    expect(glassByScheme.dark.popover).toMatch(/^rgba\(/);
  });

  it("keeps the card token solid (content layer stays opaque)", () => {
    // card is NOT overridden in glassByScheme — content surfaces stay solid.
    expect(glassByScheme.light.card).toBeUndefined();
    expect(glassByScheme.dark.card).toBeUndefined();
  });
});
