import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { createSlider } from "../src/atoms/slider/slider.shared.tsx";
import { iosSkin, androidSkin, webSkin } from "../src/atoms/slider/slider.styles.ts";
import { lightColors, darkColors } from "../src/style/tokens.ts";

// The iOS 26 slider handle "transforms into liquid glass during interaction" (WWDC25).
// The kit expresses that as a skin-internal `glassThumb`: the shell routes the iOS thumb
// through GlassSurface (real Liquid Glass on iOS 26, degrading to the opaque capsule
// under solid surface / Reduce Transparency / Increase Contrast). These tests pin the
// skin flags and prove the glass wrapper keeps the adjustable slider semantics intact on
// both the glass and the solid surface — the regression risk of wrapping the thumb.

afterEach(cleanup);

const IOSSlider = createSlider(iosSkin);

function mount(ui: ReactNode, surface: "glass" | "solid") {
  return render(createElement(ThemeProvider, { surface }, ui));
}

const handle = (c: HTMLElement) => c.querySelector('[role="slider"]') as HTMLElement | null;

describe("Slider Liquid Glass handle", () => {
  it("marks ONLY the iOS skin as a glass thumb", () => {
    // Apple makes the iOS slider handle glass; Android's M3 bar handle and the web
    // thumb are not glass, so only the iOS skin opts in.
    expect(iosSkin.glassThumb).toBe(true);
    expect(androidSkin.glassThumb).toBeUndefined();
    expect(webSkin.glassThumb).toBeUndefined();
  });

  it("tints the glass knob a bright translucent white (not the popover default)", () => {
    // The under-fill is a light glass, scheme-independent, so the knob reads as a bright
    // puck rather than a popover-tinted blob. It must differ from the popover token.
    const light = iosSkin.glassTint?.(lightColors);
    const dark = iosSkin.glassTint?.(darkColors);
    expect(light).toBe("rgba(255, 255, 255, 0.55)");
    expect(dark).toBe("rgba(255, 255, 255, 0.55)");
    expect(light).not.toBe(lightColors.popover);
    expect(dark).not.toBe(darkColors.popover);
  });

  it("keeps the adjustable slider semantics under GLASS surface", () => {
    const { container } = mount(
      createElement(IOSSlider, { defaultValue: 60, min: 0, max: 100, accessibilityLabel: "Volume" }),
      "glass",
    );
    const h = handle(container);
    expect(h).toBeTruthy();
    expect(h!.getAttribute("aria-valuenow")).toBe("60");
    expect(h!.getAttribute("aria-valuemin")).toBe("0");
    expect(h!.getAttribute("aria-valuemax")).toBe("100");
  });

  it("keeps the same semantics under SOLID surface (the degraded capsule path)", () => {
    const { container } = mount(
      createElement(IOSSlider, { defaultValue: 60, min: 0, max: 100, accessibilityLabel: "Volume" }),
      "solid",
    );
    const h = handle(container);
    expect(h).toBeTruthy();
    expect(h!.getAttribute("aria-valuenow")).toBe("60");
  });

  it("still forwards the disabled state through the glass wrapper", () => {
    const { container } = mount(
      createElement(IOSSlider, { defaultValue: 30, disabled: true, accessibilityLabel: "Volume" }),
      "glass",
    );
    const h = handle(container);
    expect(h!.getAttribute("aria-disabled")).toBe("true");
  });
});
