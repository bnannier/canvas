import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, render, renderHook, screen } from "@testing-library/react";
import { forwardRef, useContext, type ReactNode } from "react";
import { Text, View, type ViewProps } from "react-native";
import { GlassBlurTargetContext } from "../src/style/glass-surface/glass-surface.shared.tsx";
import * as base from "../src/style/glass-surface/glass-blur-plane.tsx";

// A page's own blur plane (the public GlassBlurPlane, GlassBlurScope and useGlassBlurPlane):
// the backdrop a page captures, and the scope that offers it to the glass surfaces above it.
// An in-page surface has no safe plane on Android by default, so it paints its solid skin;
// the docs' frame frosts their page backdrop through this. What must hold: off Android both
// render their children only and offer nothing; on Android without @nannier/canvas-blur the
// same (the surfaces stay solid rather than wait on a plane that never becomes ready); with
// it, the plane's children mount inside a capture host and only the scope offers the plane.
// The native capture itself is device-verified.

afterEach(cleanup);

function Offered({ label }: { label: string }) {
  const target = useContext(GlassBlurTargetContext);
  return <Text testID={label}>{target ? "plane" : "none"}</Text>;
}

describe("the blur plane off Android (the base fork)", () => {
  it("renders the plane's children and the scope's children, and offers no plane", () => {
    const { result } = renderHook(() => base.useGlassBlurPlane());
    render(
      <View>
        <base.GlassBlurPlane plane={result.current}><Text testID="backdrop">backdrop</Text></base.GlassBlurPlane>
        <base.GlassBlurScope plane={result.current}><Offered label="scoped" /></base.GlassBlurScope>
      </View>,
    );
    expect(screen.getByTestId("backdrop").textContent).toBe("backdrop");
    expect(screen.getByTestId("scoped").textContent).toBe("none");
  });

  it("keeps the same plane for the component's life", () => {
    const { result, rerender } = renderHook(() => base.useGlassBlurPlane());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
});

describe("the blur plane on Android", () => {
  it("without @nannier/canvas-blur renders its children only and offers no plane", async () => {
    const android = await import("../src/style/glass-surface/glass-blur-plane.android.tsx");
    const { result } = renderHook(() => android.useGlassBlurPlane());
    render(
      <View>
        <android.GlassBlurPlane plane={result.current}><Text testID="backdrop">backdrop</Text></android.GlassBlurPlane>
        <android.GlassBlurScope plane={result.current}><Offered label="scoped" /></android.GlassBlurScope>
      </View>,
    );
    expect(screen.getByTestId("backdrop").textContent).toBe("backdrop");
    expect(screen.getByTestId("scoped").textContent).toBe("none");
  });

  it("with the integration captures its children in a host and offers the plane only inside the scope", async () => {
    const { blurPlaneParts, useGlassBlurPlane } = await import("../src/style/glass-surface/glass-blur-plane.android.tsx");
    const attached: unknown[] = [];
    const host = (name: string) => forwardRef<View, ViewProps & { children?: ReactNode; captureEnabled?: boolean; onAvailabilityChange?: unknown }>(function Host({ children, captureEnabled: _enabled, onAvailabilityChange: _change, ...props }, ref) {
      return <View ref={(view) => { if (name === "capture" && view) attached.push(view); if (typeof ref === "function") ref(view); }} testID={name} {...props}>{children}</View>;
    });
    const { GlassBlurPlane, GlassBlurScope } = blurPlaneParts({ PaintHost: host("paint"), CaptureHost: host("capture") });
    const { result } = renderHook(() => useGlassBlurPlane());
    render(
      <View>
        <GlassBlurPlane plane={result.current}><Text testID="backdrop">backdrop</Text></GlassBlurPlane>
        <GlassBlurScope plane={result.current}><Offered label="scoped" /></GlassBlurScope>
        <Offered label="outside" />
      </View>,
    );
    expect(screen.getByTestId("paint").contains(screen.getByTestId("capture"))).toBe(true);
    expect(screen.getByTestId("capture").contains(screen.getByTestId("backdrop"))).toBe(true);
    expect(result.current.target.ref.current).toBe(attached.at(-1));
    expect(screen.getByTestId("scoped").textContent).toBe("plane");
    expect(screen.getByTestId("outside").textContent).toBe("none");
  });
});
