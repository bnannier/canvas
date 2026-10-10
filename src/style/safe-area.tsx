//
// The same peer gives the overlay layer the window's safe area: its SafeAreaInsetsContext
// and SafeAreaFrameContext, read with useContext, which is null when no SafeAreaProvider
// is mounted (its useSafeAreaInsets hook throws there instead). Without the peer a
// null-valued context stands in for each, so a reader sees no safe area either way.
import { type ComponentType, type Context, createContext, useContext, useMemo } from "react";
import { View, type ViewProps } from "react-native";

// react-native-safe-area-context is an OPTIONAL peer. React Native core's own
// `SafeAreaView` is deprecated and slated for removal; safe-area-context is the standard
// replacement (and a de-facto requirement of Expo Router / React Navigation, so real
// apps already ship it). When it is installed we use its `SafeAreaView` (real insets on
// every platform, driven by a `SafeAreaProvider`); when it is absent we fall back to a
// plain `View`, which matches the old core `SafeAreaView` off iOS (insets resolve to 0).
// This keeps the kit installable and buildable for consumers who skip the peer, and
// removes the core-`SafeAreaView` deprecation warning. See glass-surface for the same
// guarded literal-require pattern.
declare const require: (id: string) => unknown;

type SafeAreaEdges = readonly ("top" | "right" | "bottom" | "left")[];
export type SafeAreaViewComponent = ComponentType<ViewProps & { edges?: SafeAreaEdges }>;
type SafeAreaProviderComponent = ComponentType<ViewProps>;

/** The safe-area insets the peer reports for its provider's frame. */
export interface SafeAreaInsets { top: number; right: number; bottom: number; left: number }
/** The peer's provider frame, in window coordinates. */
export interface SafeAreaFrame { x: number; y: number; width: number; height: number }

let SafeAreaView: SafeAreaViewComponent = View;
let SafeAreaProvider: SafeAreaProviderComponent = View;
let SafeAreaInsetsContext: Context<SafeAreaInsets | null> = createContext<SafeAreaInsets | null>(null);
let SafeAreaFrameContext: Context<SafeAreaFrame | null> = createContext<SafeAreaFrame | null>(null);
try {
  // Directly in the try block: an intervening `if` makes Metro treat this as
  // a REQUIRED dependency. See src/style/glass-surface/material-runtime.ts.
  const mod = require("react-native-safe-area-context") as {
    SafeAreaView?: SafeAreaViewComponent;
    SafeAreaProvider?: SafeAreaProviderComponent;
    SafeAreaInsetsContext?: Context<SafeAreaInsets | null>;
    SafeAreaFrameContext?: Context<SafeAreaFrame | null>;
  };
  if (mod?.SafeAreaView) SafeAreaView = mod.SafeAreaView;
  if (mod?.SafeAreaProvider) SafeAreaProvider = mod.SafeAreaProvider;
  if (mod?.SafeAreaInsetsContext) SafeAreaInsetsContext = mod.SafeAreaInsetsContext;
  if (mod?.SafeAreaFrameContext) SafeAreaFrameContext = mod.SafeAreaFrameContext;
} catch {
  SafeAreaView = View;
  SafeAreaProvider = View;
}

/**
 * The window's safe rect, in window coordinates: the nearest SafeAreaProvider's frame
 * inset by its four insets (the status bar, the Dynamic Island, the home indicator and
 * a landscape sensor housing). Null when no provider is mounted or the peer is absent.
 */
export function useSafeAreaWindowRect(): SafeAreaFrame | null {
  const insets = useContext(SafeAreaInsetsContext);
  const frame = useContext(SafeAreaFrameContext);
  return useMemo(() => {
    if (!insets || !frame) return null;
    const side = (value: number) => (Number.isFinite(value) ? Math.max(0, value) : 0);
    const left = side(insets.left);
    const top = side(insets.top);
    return {
      x: frame.x + left,
      y: frame.y + top,
      width: Math.max(0, frame.width - left - side(insets.right)),
      height: Math.max(0, frame.height - top - side(insets.bottom)),
    };
  }, [insets, frame]);
}

export { SafeAreaView, SafeAreaProvider, SafeAreaInsetsContext, SafeAreaFrameContext };
