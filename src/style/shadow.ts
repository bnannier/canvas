import { Platform, type ViewStyle } from "react-native";

// Elevation presets, matching the engine's old `shadow-*` scale one-for-one, as
// ready-to-spread RN ViewStyle objects. On native they resolve to the platform-correct
// shadow APIs (iOS `shadow*` props + Android `elevation`). On react-native-web the
// `shadow*` props are deprecated in favor of the cross-platform `boxShadow` string, so
// the web branch emits the equivalent boxShadow (the same conversion RN Web does
// internally, minus the console deprecation warning). Spread the result into a style:
// `{ ...shadow("md") }`.

export type ShadowLevel = "none" | "sm" | "DEFAULT" | "md" | "lg" | "xl";

const NATIVE_SHADOWS: Record<ShadowLevel, ViewStyle> = {
  none: { shadowOpacity: 0, elevation: 0 },
  sm: { shadowColor: "#000000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  DEFAULT: { shadowColor: "#000000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  md: { shadowColor: "#000000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4 },
  lg: { shadowColor: "#000000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 8 },
  xl: { shadowColor: "#000000", shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.1, shadowRadius: 25, elevation: 12 },
};

// The same drop shadows as a `boxShadow` string (offsetX offsetY blur color) for web.
const WEB_SHADOWS: Record<Exclude<ShadowLevel, "none">, string> = {
  sm: "0px 1px 2px rgba(0, 0, 0, 0.05)",
  DEFAULT: "0px 1px 3px rgba(0, 0, 0, 0.1)",
  md: "0px 4px 6px rgba(0, 0, 0, 0.1)",
  lg: "0px 10px 15px rgba(0, 0, 0, 0.1)",
  xl: "0px 20px 25px rgba(0, 0, 0, 0.1)",
};

/** The elevation preset for a level (defaults to the standard `shadow`). */
export function shadow(level: ShadowLevel = "DEFAULT"): ViewStyle {
  if (Platform.OS === "web") {
    return level === "none" ? { boxShadow: "none" } : { boxShadow: WEB_SHADOWS[level] };
  }
  return NATIVE_SHADOWS[level];
}

/**
 * A one-off drop shadow for components that need a shade off the preset scale. Returns
 * the platform-correct `shadow*` props (+ optional Android `elevation`) on native, and
 * the equivalent `boxShadow` string on web (so react-native-web does not warn). The
 * color must be a solid 6-digit hex; the opacity is applied to it.
 */
export function customShadow(opts: {
  color?: string;
  offsetY?: number;
  radius?: number;
  opacity?: number;
  elevation?: number;
}): ViewStyle {
  const { color = "#000000", offsetY = 1, radius = 2, opacity = 0.2, elevation } = opts;
  if (Platform.OS === "web") {
    return { boxShadow: `0px ${offsetY}px ${radius}px ${hexToRgba(color, opacity)}` };
  }
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: radius,
    ...(elevation != null ? { elevation } : null),
  };
}

function hexToRgba(hex: string, opacity: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
