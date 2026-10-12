import { type ComponentType, type Ref, type RefObject, useLayoutEffect, useState } from "react";
import { findNodeHandle, Platform, type View, type ViewProps } from "react-native";
import { requireNativeModule, requireNativeViewManager } from "expo-modules-core";

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

const native = Platform.OS === "android" ? requireNativeModule<NativeModule>("CanvasBlur") : null;
export const available = native?.supported === true;

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

// Canvas only renders these when available. Missing native registration throws
// on import so its guarded optional peer loader selects the complete solid skin.
export const PaintHost = available
  ? requireNativeViewManager<ViewProps>("CanvasBlur", "PaintHost")
  : undefined;
export const CaptureHost = available
  ? requireNativeViewManager<CaptureHostProps>("CanvasBlur", "CaptureHost")
  : undefined;
const NativeFrost = available
  ? requireNativeViewManager<NativeFrostProps>("CanvasBlur", "FrostView")
  : undefined;

export const FrostView: ComponentType<FrostViewProps> | undefined = NativeFrost ? function FrostView({ targetRef, intensity, tint, onTargetRejected, ...props }) {
  const [targetId, setTargetId] = useState<number | null>(null);
  const currentHost = targetRef.current;
  useLayoutEffect(() => {
    setTargetId(currentHost ? findNodeHandle(currentHost) : null);
  }, [currentHost]);
  // A refusal of a host this view no longer names (the ref moved on before the event
  // arrived) is not news about the current one.
  const rejected = onTargetRejected
    ? (event: TargetRejectedEvent) => { if (event.nativeEvent.targetId === targetId) onTargetRejected(event); }
    : undefined;
  return <NativeFrost {...props} targetId={targetId} intensity={intensity} tint={tint} onTargetRejected={rejected} />;
} : undefined;

/** Read-only lifecycle counters for device verification and diagnostics. */
export function getCaptureStats(): CaptureStats {
  return native?.getCaptureStats() ?? { hosts: 0, activeHosts: 0, recordings: 0, frostViews: 0, frameListeners: 0 };
}
