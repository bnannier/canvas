import { describe, it, expect } from "bun:test";
import { frostMethodProps } from "../src/style/glass-surface/glass-surface.shared.tsx";
import { resolveMaterial, type MaterialCapabilities } from "../src/style/glass-surface/material-resolution.ts";

// frostMethodProps picks expo-blur's Android blur-method prop by its API generation. Before
// expo-blur 57 (no BlurTargetView export) the frost blurs the content behind it through the
// legacy `experimentalBlurMethod`. From 57 the Android blur samples only a blur target, and
// the kit hands it none: a capture plane exists only where @nannier/canvas-blur mounted its
// capture host, where the Android host renders canvas-blur's own frost, and without one a
// surface that needs a target resolves solid before any BlurView mounts (pinned below), so
// from 57 it passes no method prop at all.

describe("frostMethodProps", () => {
  it("keeps the legacy prop on expo-blur < 57 (no BlurTargetView export)", () => {
    expect(frostMethodProps(false)).toEqual({ experimentalBlurMethod: "dimezisBlurView" });
  });

  it("passes no method prop on expo-blur 57+, which the kit never hands a blur target", () => {
    expect(frostMethodProps(true)).toEqual({});
  });
});

describe("expo-blur 57 on Android without a capture plane", () => {
  const glass = { surface: "glass" as const, increasedContrast: false, reducedTransparency: false };
  const expoBlur57: MaterialCapabilities = { platform: "android", frost: true, liquid: false, requiresTarget: true };

  it("resolves the complete solid skin, so its BlurView never mounts without a target", () => {
    expect(resolveMaterial(glass, { layer: "functional" }, expoBlur57, false)).toEqual({ renderer: "solid", static: false, fallback: "missing-target" });
    expect(resolveMaterial(glass, { layer: "content" }, expoBlur57, false)).toEqual({ renderer: "solid", static: true, fallback: "missing-target" });
  });
});
