// A blur plane: a view that glass surfaces outside it may frost, declared by the app. The
// base fork, for the web and iOS and any platform without the Android fork, where no
// material reads a plane (the web blurs through a backdrop filter, iOS through its native
// materials), so the host and the scope render their children and nothing else.
// glass-blur-plane.android.tsx supplies the capture host and the scope's context.
import { useMemo, type ReactNode } from "react";
import { createCaptureTarget, type CaptureTarget } from "./capture-target.js";

/**
 * A blur plane made by `useGlassBlurPlane`: pass it to the `GlassBlurPlane` that wraps the
 * view to capture and to the `GlassBlurScope` around the surfaces that frost it.
 */
export interface GlassBlurPlaneHandle {
  /** @internal The capture target the Android host attaches and the scope offers. */
  readonly target: CaptureTarget;
}

/** A blur plane, stable for the component's life. */
export function useGlassBlurPlane(): GlassBlurPlaneHandle {
  return useMemo(() => ({ target: createCaptureTarget() }), []);
}

export interface GlassBlurPlaneProps {
  /** The plane `useGlassBlurPlane` made. */
  plane: GlassBlurPlaneHandle;
  /** The view to capture, laid out to fill the plane (a page backdrop). */
  children?: ReactNode;
}

/**
 * Makes its children the blur plane: on Android, with `@nannier/canvas-blur` installed, a
 * capture host filling its parent, which the glass surfaces in a matching `GlassBlurScope`
 * frost. Off Android it renders its children only.
 */
export function GlassBlurPlane({ children }: GlassBlurPlaneProps) {
  return <>{children}</>;
}

export interface GlassBlurScopeProps {
  /** The plane `useGlassBlurPlane` made. */
  plane: GlassBlurPlaneHandle;
  /** The glass surfaces that frost the plane. None of them may sit inside it. */
  children?: ReactNode;
}

/**
 * Offers the blur plane to the glass surfaces inside it: on Android they frost the plane in
 * place of the solid skin they paint without one. Off Android it renders its children only.
 */
export function GlassBlurScope({ children }: GlassBlurScopeProps) {
  return <>{children}</>;
}
