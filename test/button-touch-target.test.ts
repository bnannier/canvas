import { describe, it, expect } from "bun:test";
import { minTargetSlop } from "../src/atoms/button/button.shared.tsx";
import { iosSkin, androidSkin, webSkin } from "../src/atoms/button/button.styles.ts";

// Native minimum touch targets for the Button atom (iOS HIG 44x44pt, Android M3
// 48x48dp). The skins declare the platform minimum; the shell measures the rendered
// control and extends the touch area with hitSlop (minTargetSlop), so sub-minimum
// buttons (small text, icon squares) become tappable at the platform minimum with
// ZERO layout shift. Web declares no minimum: pointer targets stay purely visual.

describe("Button skin minTarget", () => {
  it("declares the iOS HIG 44pt minimum", () => {
    expect(iosSkin.minTarget).toBe(44);
  });

  it("declares the Android M3 48dp minimum", () => {
    expect(androidSkin.minTarget).toBe(48);
  });

  it("declares none on web (layout and touch untouched)", () => {
    expect(webSkin.minTarget).toBeNull();
  });
});

describe("minTargetSlop", () => {
  it("extends the 36pt iOS small text button to 44pt (vertical only)", () => {
    // small: lineHeight 20 + 2x8 padding = 36pt tall; width is text-driven (> 44 here).
    expect(minTargetSlop(44, 80, 36)).toEqual({ top: 4, bottom: 4, left: 0, right: 0 });
  });

  it("extends the 30dp Android small text button to 48dp (vertical only)", () => {
    // small: lineHeight 18 + 2x6 padding = 30dp tall.
    expect(minTargetSlop(48, 80, 30)).toEqual({ top: 9, bottom: 9, left: 0, right: 0 });
  });

  it("extends the 40dp Android base button to 48dp (M3 container 40dp, target 48dp)", () => {
    expect(minTargetSlop(48, 120, 40)).toEqual({ top: 4, bottom: 4, left: 0, right: 0 });
  });

  it("extends a sub-minimum icon square on both axes", () => {
    // Android small icon button = 32x32dp square.
    expect(minTargetSlop(48, 32, 32)).toEqual({ top: 8, bottom: 8, left: 8, right: 8 });
  });

  it("returns undefined when the control already meets the minimum", () => {
    expect(minTargetSlop(44, 120, 50)).toBeUndefined(); // iOS base: 50pt tall
    expect(minTargetSlop(44, 44, 44)).toBeUndefined(); // exactly at the minimum
  });
});
