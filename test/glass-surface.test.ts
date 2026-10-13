import { describe, it, expect } from "bun:test";
import {
  contrastBorder,
  contrastStyle,
  specularRim,
  MATERIAL_FILL,
  GLASS_INTENSITY,
  CONTRAST_BORDER_WIDTH,
} from "../src/style/glass-surface/glass-surface.shared.tsx";
import { lightColors, darkColors } from "../src/style/tokens.ts";

describe("contrastBorder", () => {
  it("is a 1px foreground border on light", () => {
    expect(contrastBorder(lightColors)).toEqual({ borderWidth: CONTRAST_BORDER_WIDTH, borderColor: lightColors.foreground });
  });

  it("is a 1px foreground border on dark", () => {
    expect(contrastBorder(darkColors)).toEqual({ borderWidth: CONTRAST_BORDER_WIDTH, borderColor: darkColors.foreground });
  });
});

describe("contrastStyle", () => {
  const style = { borderRadius: 12, borderWidth: 2, borderColor: "#123456" };

  it("hands the skin's style back as given without Increase Contrast", () => {
    expect(contrastStyle({ increasedContrast: false, tokens: lightColors }, style)).toBe(style);
  });

  it("adds the contrasting border under Increase Contrast, never thinner than the skin's", () => {
    const [skin, border] = contrastStyle({ increasedContrast: true, tokens: lightColors }, style) as [typeof style, Record<string, unknown>];
    expect(skin).toBe(style);
    expect(border.borderWidth).toBe(2);
    expect(border.borderColor).toBe(lightColors.foreground);
  });

  it("keeps a state border's colour under Increase Contrast", () => {
    const [, border] = contrastStyle({ increasedContrast: true, tokens: lightColors }, style, true) as [unknown, Record<string, unknown>];
    expect(border.borderColor).toBe("#123456");
  });
});

describe("specularRim", () => {
  it("sits inside a kept border on the border's inner curve", () => {
    expect(specularRim({ borderRadius: 26, borderWidth: 2 }, false, true).borderRadius).toBe(24);
    expect(specularRim({ borderRadius: 26, borderWidth: 2 }, false).borderRadius).toBe(26);
  });

  it("carries the skin radius and a scheme-adaptive inset boxShadow", () => {
    const light = specularRim({ borderRadius: 26 }, false);
    const dark = specularRim({ borderRadius: 26 }, true);
    expect(light.borderRadius).toBe(26);
    expect(light.position).toBe("absolute");
    expect(typeof light.boxShadow).toBe("string");
    expect(light.boxShadow).not.toBe(dark.boxShadow);
  });
});

describe("material constants", () => {
  it("MATERIAL_FILL is an absolute-fill, non-interactive layer", () => {
    expect(MATERIAL_FILL.position).toBe("absolute");
    expect(MATERIAL_FILL.top).toBe(0);
    expect(MATERIAL_FILL.left).toBe(0);
    expect(MATERIAL_FILL.right).toBe(0);
    expect(MATERIAL_FILL.bottom).toBe(0);
    expect(MATERIAL_FILL.pointerEvents).toBe("none");
  });

  it("GLASS_INTENSITY is a sane blur intensity", () => {
    expect(typeof GLASS_INTENSITY).toBe("number");
    expect(GLASS_INTENSITY).toBeGreaterThan(0);
    expect(GLASS_INTENSITY).toBeLessThanOrEqual(100);
  });
});
