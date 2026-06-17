// Shared internals for the GlassSurface primitive (the glass theming surface
// mode's renderer). The platform files (glass-surface.tsx for web+Android,
// glass-surface.ios.tsx for iOS) pick the material — Apple Liquid Glass on iOS
// 26+, an expo-blur frost on web/Android/older iOS, a translucent View fallback
// otherwise — and hand it to GlassBox, which lays the material behind the content.
//
// Why two boxes in the glass path: clipping the material to the skin's rounded
// corners needs overflow:"hidden", but that also clips the surface's drop shadow.
// So the glass path nests an inner CLIP box (radius + overflow:hidden, holds the
// material and children) inside an outer SHADOW box (shadow + position + margin +
// matching radius, no clip). The fallback path is a single plain View, byte-for-
// byte the pre-glass behavior, so non-glass themes and module-absent cases never
// change layout.

import { type ReactNode } from "react";
import { View, StyleSheet, type StyleProp, type ViewStyle, type ViewProps } from "react-native";

export interface GlassSurfaceProps {
  /** The skin's shape + fill style (radius, padding, border, shadow, the popover
   *  fill). The fill is stripped under glass; the material supplies it. */
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  pointerEvents?: ViewProps["pointerEvents"];
}

// Blur strength for the frost. expo-blur maps intensity to a blur radius (~0.2px
// per point on web), so ~80 lands near the docs' established blur(16px) frost.
// expo-blur supplies its own light/dark tint at this intensity, so no extra tint
// overlay is layered on top (that would double-darken the material).
export const GLASS_INTENSITY = 80;

// Keys that must live on the OUTER box: shadow (overflow:hidden would clip it),
// absolute positioning, and outer-margin/self-alignment (so the surface sits
// where the single-View version did). Radius keys are duplicated onto the outer
// box so its shadow is rounded.
const OUTER_KEYS = new Set<string>([
  "shadowColor", "shadowOffset", "shadowOpacity", "shadowRadius", "elevation",
  "position", "top", "right", "bottom", "left", "zIndex",
  "margin", "marginTop", "marginBottom", "marginLeft", "marginRight", "marginHorizontal", "marginVertical",
  "alignSelf",
]);
const RADIUS_KEYS = new Set<string>([
  "borderRadius", "borderTopLeftRadius", "borderTopRightRadius", "borderBottomLeftRadius", "borderBottomRightRadius",
]);

interface Split {
  outer: ViewStyle;
  clip: ViewStyle;
}

export function splitSurfaceStyle(style: StyleProp<ViewStyle>): Split {
  const flat = (StyleSheet.flatten(style) ?? {}) as Record<string, unknown>;
  const outer: Record<string, unknown> = {};
  const clip: Record<string, unknown> = { overflow: "hidden" };
  for (const [key, value] of Object.entries(flat)) {
    if (value == null) continue;
    if (key === "backgroundColor") continue; // the material supplies the fill
    if (OUTER_KEYS.has(key)) outer[key] = value;
    else clip[key] = value;
    if (RADIUS_KEYS.has(key)) outer[key] = value; // round the shadow too
  }
  return { outer: outer as ViewStyle, clip: clip as ViewStyle };
}

// The two-box glass structure. `material` is the platform's blur/glass node(s),
// rendered absolute-fill behind the content.
export function GlassBox({
  style,
  children,
  pointerEvents,
  material,
}: GlassSurfaceProps & { material: ReactNode }) {
  const { outer, clip } = splitSurfaceStyle(style);
  return (
    <View style={outer} pointerEvents={pointerEvents}>
      <View style={clip}>
        {material}
        {children}
      </View>
    </View>
  );
}

// The no-glass / no-module fallback: one plain View identical to the pre-portal
// surface (keeps the solid or translucent popover fill from `style`).
export function PlainSurface({ style, children, pointerEvents }: GlassSurfaceProps) {
  return (
    <View style={style} pointerEvents={pointerEvents}>
      {children}
    </View>
  );
}

// The absolute-fill style for material layers, with taps passing through (the
// content sits on top; the dismiss backdrop, when present, is a portal sibling).
export const MATERIAL_FILL: ViewStyle = {
  position: "absolute",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  pointerEvents: "none",
};
