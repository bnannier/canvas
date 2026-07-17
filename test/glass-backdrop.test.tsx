import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup, screen } from "@testing-library/react";
import { useContext } from "react";
import { Text } from "react-native";
import { GlassBackdrop } from "../src/style/glass-surface/glass-backdrop.tsx";
import { GlassBackdrop as GlassBackdropAndroid } from "../src/style/glass-surface/glass-backdrop.android.tsx";
import { frostMethodProps, GlassBlurTargetContext } from "../src/style/glass-surface/glass-surface.shared.tsx";

// GlassBackdrop wires expo-blur 57's Android blur target (ThemeProvider mounts it).
// expo-blur is stubbed to {} in the test setup — the optional-peer-absent case — so
// both platform files must take their documented passthrough branch: children render,
// no target is published. The API-generation choice itself is a pure function
// (frostMethodProps), covered directly below.

afterEach(cleanup);

function TargetProbe() {
  const target = useContext(GlassBlurTargetContext);
  return <Text>{`target:${target === null ? "null" : "ref"}`}</Text>;
}

describe("GlassBackdrop", () => {
  it("base (web/iOS) passes children through and publishes no blur target", () => {
    render(
      <GlassBackdrop>
        <TargetProbe />
      </GlassBackdrop>,
    );
    expect(screen.getByText("target:null")).toBeTruthy();
  });

  it("android without the optional expo-blur peer passes children through and publishes no blur target", () => {
    render(
      <GlassBackdropAndroid>
        <TargetProbe />
      </GlassBackdropAndroid>,
    );
    expect(screen.getByText("target:null")).toBeTruthy();
  });
});

describe("frostMethodProps", () => {
  it("keeps the legacy prop on expo-blur < 57 (no BlurTargetView export)", () => {
    expect(frostMethodProps(false, null)).toEqual({ experimentalBlurMethod: "dimezisBlurView" });
  });

  it("names the dimezis method with the target on expo-blur 57+ once the target is attached", () => {
    const target = { current: null };
    expect(frostMethodProps(true, target)).toEqual({ blurMethod: "dimezisBlurView", blurTarget: target });
  });

  it("asks for no blur on expo-blur 57+ while no target exists (web, or Android's first frame)", () => {
    expect(frostMethodProps(true, null)).toEqual({ blurMethod: "none" });
  });
});
