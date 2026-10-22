import { useCallback, type RefObject } from "react";
import { findNodeHandle, Platform, type View } from "react-native";
import { createCaptureModule, type CaptureModule, type ExpoModulesCore } from "./capture-module.js";
import { captureTargetOwner } from "./capture-target.js";

export type { CaptureHostProps } from "./capture-module.js";

type AvailabilityEvent = { nativeEvent: { targetId: number; available: boolean } };
type CaptureIntegration = Partial<Pick<CaptureModule, "available" | "PaintHost" | "CaptureHost" | "FrostView">>;

// Canvas's own native capture module (capture-module.tsx) binds through expo-modules-core,
// an optional peer loaded through the guarded require that material-runtime.ts explains;
// keep the require directly inside the try block, or Metro registers it as a required
// dependency.
declare const require: (id: string) => unknown;
let integration: CaptureIntegration | undefined;
try {
  const core = require("expo-modules-core") as ExpoModulesCore;
  integration = createCaptureModule(core);
} catch { /* Native module not linked (Expo Go, an excluded module, a bare React Native app): use supported Expo frost or the solid skin. */ }

// A partial or older integration cannot preserve paint ownership. Resolve all
// three together so every consumer takes the same complete solid fallback.
export function resolveCaptureComponents(platform: string, module?: CaptureIntegration) {
  if (platform !== "android" || !module?.available || !module.PaintHost || !module.CaptureHost || !module.FrostView) return undefined;
  return { PaintHost: module.PaintHost, CaptureHost: module.CaptureHost, FrostView: module.FrostView };
}
const components = resolveCaptureComponents(Platform.OS, integration);
export const NativePaintHost = components?.PaintHost;
export const NativeCaptureHost = components?.CaptureHost;
export const NativeCaptureFrost = components?.FrostView;
export const nativeCaptureAvailable = components !== undefined;

/** Ignore delayed events from a replaced native host sharing the same React ref. */
export function useCaptureAvailability(targetRef: RefObject<View | null>) {
  return useCallback((event: AvailabilityEvent) => {
    const view = targetRef.current;
    if (view && findNodeHandle(view) === event.nativeEvent.targetId) {
      captureTargetOwner(targetRef)?.setAvailable(view, event.nativeEvent.available);
    }
  }, [targetRef]);
}
