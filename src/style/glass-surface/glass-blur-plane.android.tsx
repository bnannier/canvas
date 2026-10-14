// A blur plane on Android: the app's own safe plane for the glass surfaces outside it. An
// in-page surface has none by default (the window's plane contains it, and a frost may not
// sample a plane that contains it), so it paints its complete solid skin. A page whose
// backdrop is a sibling behind its surfaces, the docs' page look under their frame, can make
// that backdrop the plane: GlassBlurPlane captures it through @nannier/canvas-blur, and the
// surfaces in a GlassBlurScope frost it. canvas-blur refuses a plane that contains the frost
// that samples it, so a surface placed inside its own plane falls back to the solid skin.
// Without the integration both render their children only, and the surfaces stay solid.
import { useMemo, type ComponentType, type ReactNode } from "react";
import type { ViewProps, ViewStyle } from "react-native";
import { createCaptureTarget, useCaptureEnabled, type CaptureTarget } from "./capture-target.js";
import { NativeCaptureHost, NativePaintHost, useCaptureAvailability, type CaptureHostProps } from "./capture-runtime.js";
import { GlassBlurTargetContext } from "./glass-surface.shared.js";

export interface GlassBlurPlaneHandle {
  /** @internal The capture target the host attaches and the scope offers. */
  readonly target: CaptureTarget;
}

export function useGlassBlurPlane(): GlassBlurPlaneHandle {
  return useMemo(() => ({ target: createCaptureTarget() }), []);
}

export interface GlassBlurPlaneProps {
  plane: GlassBlurPlaneHandle;
  children?: ReactNode;
}

// The plane fills its parent, as the backdrop it captures does, and takes no touches.
const PLANE: ViewStyle = { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, pointerEvents: "none" };
const FILL: ViewStyle = { flex: 1 };

/** The integration's two hosts the plane mounts, or undefined when it is not installed. */
export interface BlurPlaneHosts {
  PaintHost: ComponentType<ViewProps & { children?: ReactNode }>;
  CaptureHost: ComponentType<CaptureHostProps>;
}

/** The host and the scope over a given integration (the tests pass their own hosts). */
export function blurPlaneParts(hosts: BlurPlaneHosts | undefined) {
  function GlassBlurPlane({ plane, children }: GlassBlurPlaneProps) {
    const { ref, attach } = plane.target;
    const enabled = useCaptureEnabled(ref);
    const onAvailabilityChange = useCaptureAvailability(ref);
    if (!hosts) return <>{children}</>;
    const { PaintHost, CaptureHost } = hosts;
    return (
      <PaintHost style={PLANE}>
        <CaptureHost ref={attach} onAvailabilityChange={onAvailabilityChange} captureEnabled={enabled} style={FILL}>
          {children}
        </CaptureHost>
      </PaintHost>
    );
  }
  function GlassBlurScope({ plane, children }: GlassBlurScopeProps) {
    // Without the integration there is no plane to offer: the surfaces keep the solid skin
    // they paint today rather than waiting on a plane that never becomes ready.
    if (!hosts) return <>{children}</>;
    return <GlassBlurTargetContext.Provider value={plane.target.ref}>{children}</GlassBlurTargetContext.Provider>;
  }
  return { GlassBlurPlane, GlassBlurScope };
}

export interface GlassBlurScopeProps {
  plane: GlassBlurPlaneHandle;
  children?: ReactNode;
}

export const { GlassBlurPlane, GlassBlurScope } = blurPlaneParts(NativePaintHost && NativeCaptureHost ? { PaintHost: NativePaintHost, CaptureHost: NativeCaptureHost } : undefined);
