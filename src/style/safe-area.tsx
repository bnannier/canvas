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
//
// The same peer gives the overlay layer the window's safe-area insets: its
// SafeAreaInsetsContext, read with useContext, which is null when no SafeAreaProvider is
// mounted (its useSafeAreaInsets hook throws there instead). Without the peer a
// null-valued context stands in, so a reader sees no safe area either way. The peer's
// frame is not read: on the web it is the document's size, measured once when the
// provider mounts and never again on a resize, so a box measured from it goes stale
// (src/style/portal.tsx insets the window it measures itself instead).
declare const require: (id: string) => unknown;

type SafeAreaEdges = readonly ("top" | "right" | "bottom" | "left")[];
export type SafeAreaViewComponent = ComponentType<ViewProps & { edges?: SafeAreaEdges }>;
type SafeAreaProviderComponent = ComponentType<ViewProps>;

/** The safe-area insets the peer reports for its provider's frame. */
export interface SafeAreaInsets { top: number; right: number; bottom: number; left: number }

let SafeAreaView: SafeAreaViewComponent = View;
let SafeAreaProvider: SafeAreaProviderComponent = View;
let SafeAreaInsetsContext: Context<SafeAreaInsets | null> = createContext<SafeAreaInsets | null>(null);
try {
  // Directly in the try block: an intervening `if` makes Metro treat this as
  // a REQUIRED dependency. See src/style/glass-surface/material-runtime.ts.
  const mod = require("react-native-safe-area-context") as {
    SafeAreaView?: SafeAreaViewComponent;
    SafeAreaProvider?: SafeAreaProviderComponent;
    SafeAreaInsetsContext?: Context<SafeAreaInsets | null>;
  };
  if (mod?.SafeAreaView) SafeAreaView = mod.SafeAreaView;
  if (mod?.SafeAreaProvider) SafeAreaProvider = mod.SafeAreaProvider;
  if (mod?.SafeAreaInsetsContext) SafeAreaInsetsContext = mod.SafeAreaInsetsContext;
} catch {
  SafeAreaView = View;
  SafeAreaProvider = View;
}

/**
 * The window's safe-area insets (the status bar, the Dynamic Island, the home indicator
 * and a landscape sensor housing), each a finite length of 0 or more. Null when no
 * SafeAreaProvider is mounted or the peer is absent. Stable while the insets are.
 */
export function useSafeAreaInsetsOrNull(): SafeAreaInsets | null {
  const insets = useContext(SafeAreaInsetsContext);
  return useMemo(() => {
    if (!insets) return null;
    const side = (value: number) => (Number.isFinite(value) ? Math.max(0, value) : 0);
    return { top: side(insets.top), right: side(insets.right), bottom: side(insets.bottom), left: side(insets.left) };
  }, [insets]);
}

export { SafeAreaView, SafeAreaProvider, SafeAreaInsetsContext };
