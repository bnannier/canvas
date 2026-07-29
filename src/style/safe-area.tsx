import { type ComponentType } from "react";
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

let SafeAreaView: SafeAreaViewComponent = View;
try {
  // Directly in the try block: an intervening `if` makes Metro treat this as
  // a REQUIRED dependency. See src/organisms/backdrop/skia-runtime.ts.
  const mod = require("react-native-safe-area-context") as { SafeAreaView?: SafeAreaViewComponent };
  if (mod?.SafeAreaView) SafeAreaView = mod.SafeAreaView;
} catch {
  SafeAreaView = View;
}

export { SafeAreaView };
