import { type ComponentType, type Ref, type RefObject, useLayoutEffect, useState } from "react";
import { findNodeHandle, Platform, type View, type ViewProps } from "react-native";
import { forCurrentTarget } from "./capture-rejection.js";

// Canvas's own Android backdrop capture. Its native half is the Expo module in android/,
// which Expo autolinks from this package's expo-module.config.json; an app leaves it out
// with `"expo": { "autolinking": { "exclude": ["@nannier/canvas"] } }`. capture-runtime.ts
// passes in expo-modules-core through its guarded require and treats a throw here (no
// module registered: Expo Go, an excluded module, a bare React Native app) as absence.

export interface CaptureStats {
  hosts: number;
  activeHosts: number;
  recordings: number;
  frostViews: number;
  frameListeners: number;
}

interface NativeModule {
  supported: boolean;
  getCaptureStats(): CaptureStats;
}

/** The two expo-modules-core calls the capture module makes. */
export interface ExpoModulesCore {
  requireNativeModule<T>(moduleName: string): T;
  requireNativeViewManager<P>(moduleName: string, viewName?: string): ComponentType<P>;
}

export interface CaptureHostProps extends ViewProps {
  ref?: Ref<View>;
  captureEnabled: boolean;
  onAvailabilityChange?: (event: { nativeEvent: { targetId: number; available: boolean } }) => void;
}

/** Why a FrostView refused its target. */
export type TargetRejectionReason = "ancestor";

/** The event a FrostView sends when it refuses the host `targetRef` names. */
export interface TargetRejectedEvent {
  nativeEvent: { targetId: number; reason: TargetRejectionReason };
}

export interface FrostViewProps extends ViewProps {
  targetRef: RefObject<View | null>;
  intensity: number;
  tint: "light" | "dark";
  /**
   * Called once when the frost refuses its target: `ancestor` when the host contains the
   * frost, which it can never sample (its recording would draw the frost itself). The
   * frost then draws no blur, so the app falls back to its solid look. A host that is
   * merely detached reports through its own `onAvailabilityChange` instead.
   */
  onTargetRejected?: (event: TargetRejectedEvent) => void;
}

interface NativeFrostProps extends ViewProps {
  targetId: number | null;
  intensity: number;
  tint: "light" | "dark";
  onTargetRejected?: (event: TargetRejectedEvent) => void;
}

export interface CaptureModule {
  available: boolean;
  PaintHost?: ComponentType<ViewProps>;
  CaptureHost?: ComponentType<CaptureHostProps>;
  FrostView?: ComponentType<FrostViewProps>;
  getCaptureStats(): CaptureStats;
}

/** Binds the native module. Throws when Android has no `CanvasBlur` module registered. */
export function createCaptureModule(core: ExpoModulesCore): CaptureModule {
  const native = Platform.OS === "android" ? core.requireNativeModule<NativeModule>("CanvasBlur") : null;
  const available = native?.supported === true;
  // Canvas only renders these when available.
  const PaintHost = available ? core.requireNativeViewManager<ViewProps>("CanvasBlur", "PaintHost") : undefined;
  const CaptureHost = available ? core.requireNativeViewManager<CaptureHostProps>("CanvasBlur", "CaptureHost") : undefined;
  const NativeFrost = available ? core.requireNativeViewManager<NativeFrostProps>("CanvasBlur", "FrostView") : undefined;

  const FrostView: ComponentType<FrostViewProps> | undefined = NativeFrost ? function FrostView({ targetRef, intensity, tint, onTargetRejected, ...props }) {
    const [targetId, setTargetId] = useState<number | null>(null);
    const currentHost = targetRef.current;
    useLayoutEffect(() => {
      setTargetId(currentHost ? findNodeHandle(currentHost) : null);
    }, [currentHost]);
    return (
      <NativeFrost
        {...props}
        targetId={targetId}
        intensity={intensity}
        tint={tint}
        onTargetRejected={forCurrentTarget(targetId, onTargetRejected)}
      />
    );
  } : undefined;

  /** Read-only lifecycle counters for device verification and diagnostics. */
  function getCaptureStats(): CaptureStats {
    return native?.getCaptureStats() ?? { hosts: 0, activeHosts: 0, recordings: 0, frostViews: 0, frameListeners: 0 };
  }

  return { available, PaintHost, CaptureHost, FrostView, getCaptureStats };
}
