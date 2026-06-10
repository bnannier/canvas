import { type ViewStyle } from "react-native";

// Elevation presets, matching the engine's old `shadow-*` scale one-for-one, as
// ready-to-spread RN ViewStyle objects (iOS shadow* props + Android elevation).
// Spread the result into a style: `{ ...shadow("md") }`.

export type ShadowLevel = "none" | "sm" | "DEFAULT" | "md" | "lg" | "xl";

const SHADOWS: Record<ShadowLevel, ViewStyle> = {
  none: { shadowOpacity: 0, elevation: 0 },
  sm: { shadowColor: "#000000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  DEFAULT: { shadowColor: "#000000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  md: { shadowColor: "#000000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4 },
  lg: { shadowColor: "#000000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 8 },
  xl: { shadowColor: "#000000", shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.1, shadowRadius: 25, elevation: 12 },
};

/** The elevation preset for a level (defaults to the standard `shadow`). */
export function shadow(level: ShadowLevel = "DEFAULT"): ViewStyle {
  return SHADOWS[level];
}
