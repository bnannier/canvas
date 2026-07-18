import { describe, it, expect } from "bun:test";
import { frostMethodProps } from "../src/style/glass-surface/glass-surface.shared.tsx";

// frostMethodProps picks the frost BlurView's Android blur-method props by expo-blur
// API generation (57+ exports BlurTargetView and wants blurMethod + blurTarget; older
// releases take the legacy experimentalBlurMethod). A target reaches a surface only
// where blurring it is sibling-safe — an OverlayProvider's outlet or a Modal bridged
// by GlassModalBlurTarget (an ancestor target render-node-cycles libhwui into a
// segfault, see GlassBlurTargetContext; that wiring is covered in
// glass-blur-target.test.tsx) — so the no-target case still covers every in-content
// surface.

describe("frostMethodProps", () => {
  it("keeps the legacy prop on expo-blur < 57 (no BlurTargetView export)", () => {
    expect(frostMethodProps(false, null)).toEqual({ experimentalBlurMethod: "dimezisBlurView" });
  });

  it("asks for no blur on expo-blur 57+ while no target exists (every platform today)", () => {
    expect(frostMethodProps(true, null)).toEqual({ blurMethod: "none" });
  });

  it("names the dimezis method with the target on expo-blur 57+ once a sibling target is published", () => {
    const target = { current: null };
    expect(frostMethodProps(true, target)).toEqual({ blurMethod: "dimezisBlurView", blurTarget: target });
  });
});
