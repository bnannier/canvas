import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup } from "@testing-library/react";
import { useContext, type RefObject } from "react";
import { View } from "react-native";
import {
  GlassBlurTargetContext,
  GlassWindowBlurTargetContext,
  GlassModalBlurTarget,
} from "../src/style/glass-surface/glass-surface.shared.tsx";
import { glassBlurTargetAvailable as baseAvailable } from "../src/style/glass-surface/glass-blur-target.tsx";
import { splitHostStyle } from "../src/style/glass-surface/glass-blur-target.android.tsx";
import { OverlayProvider, Portal } from "../src/style/portal.tsx";

// The Android sibling blur-target wiring (expo-blur 57+). What must hold, per
// GlassBlurTargetContext in glass-surface.shared: a surface may only receive a
// target it is NOT a native descendant of (an ancestor target segfaults Android's
// RenderThread), so OverlayProvider gives its outlet its OWN sibling target only,
// GlassModalBlurTarget bridges the window-level target into a separate-window
// Modal, and the base (non-Android) fork never reports a target at all. The
// Android fork's BlurTargetView mounting itself is device-verified (the module
// needs a native runtime); here we lock the pure style split it uses.

afterEach(cleanup);

const ref = (): RefObject<View | null> => ({ current: null });

describe("glass-blur-target base fork", () => {
  it("reports no target off Android, so OverlayProvider publishes null and every frost keeps its current path", () => {
    expect(baseAvailable).toBe(false);
  });
});

describe("splitHostStyle (Android fork)", () => {
  it("keeps box keys on the wrapper and moves child-arrangement keys onto the target", () => {
    const { box, content } = splitHostStyle([
      { flex: 1, minWidth: 0 },
      { gap: 28, paddingHorizontal: 24, alignItems: "center", backgroundColor: "#000" },
    ]);
    expect(box).toEqual({ flex: 1, minWidth: 0, backgroundColor: "#000" });
    expect(content).toEqual({
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: "auto",
      gap: 28,
      paddingHorizontal: 24,
      alignItems: "center",
    });
  });

  it("fills the wrapper with longhands (no `flex` shorthand, whose web basis rewrite collapses content-sized hosts)", () => {
    const { box, content } = splitHostStyle(undefined);
    expect(box).toEqual({});
    expect(content).toEqual({ flexGrow: 1, flexShrink: 1, flexBasis: "auto" });
    expect("flex" in content).toBe(false);
  });
});

describe("GlassModalBlurTarget", () => {
  it("bridges the window-level target into GlassBlurTargetContext for a separate-window Modal", () => {
    const target = ref();
    let seen: unknown = "unset";
    function Probe() {
      seen = useContext(GlassBlurTargetContext);
      return null;
    }
    render(
      <GlassWindowBlurTargetContext.Provider value={target}>
        <GlassModalBlurTarget>
          <Probe />
        </GlassModalBlurTarget>
      </GlassWindowBlurTargetContext.Provider>,
    );
    expect(seen).toBe(target);
  });

  it("provides null with no window target published (no OverlayProvider, or a target-less platform)", () => {
    let seen: unknown = "unset";
    function Probe() {
      seen = useContext(GlassBlurTargetContext);
      return null;
    }
    render(
      <GlassModalBlurTarget>
        <Probe />
      </GlassModalBlurTarget>,
    );
    expect(seen).toBe(null);
  });
});

describe("OverlayProvider target publishing", () => {
  it("passes an inherited window target through to nested consumers (outermost provider wins for Modals)", () => {
    const outer = ref();
    let seen: unknown = "unset";
    function Probe() {
      seen = useContext(GlassWindowBlurTargetContext);
      return null;
    }
    render(
      <GlassWindowBlurTargetContext.Provider value={outer}>
        <OverlayProvider>
          <OverlayProvider>
            <Probe />
          </OverlayProvider>
        </OverlayProvider>
      </GlassWindowBlurTargetContext.Provider>,
    );
    expect(seen).toBe(outer);
  });

  it("gives portaled outlet content its OWN target only — here null (base fork), even with a window target above", () => {
    const outer = ref();
    let seen: unknown = "unset";
    function Probe() {
      seen = useContext(GlassBlurTargetContext);
      return null;
    }
    render(
      <GlassWindowBlurTargetContext.Provider value={outer}>
        <OverlayProvider>
          <Portal>
            <Probe />
          </Portal>
        </OverlayProvider>
      </GlassWindowBlurTargetContext.Provider>,
    );
    // The outlet must never receive an ANCESTOR's target (that is the crash); on
    // this platform the provider's own target is unavailable, so it must be null,
    // not the inherited window target.
    expect(seen).toBe(null);
  });
});
