import { describe, it, expect } from "bun:test";
import { frostMethodProps } from "../src/style/glass-surface/glass-surface.shared.tsx";

// frostMethodProps picks the frost BlurView's Android blur-method props by expo-blur
// API generation (57+ exports BlurTargetView and wants blurMethod + blurTarget; older
// releases take the legacy experimentalBlurMethod). No provider publishes a target
// today — an ancestor target render-node-cycles libhwui into a segfault, see
// GlassBlurTargetContext — so the with-target case covers the future sibling-target
// providers the context is kept for.

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
