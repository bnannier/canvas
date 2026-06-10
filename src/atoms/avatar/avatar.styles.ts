import { type ViewStyle, type TextStyle, type ImageStyle } from "react-native";
import { type ColorTokens } from "../../style/index.js";

// Co-located Avatar styles. Diameter per size, corner radius per shape, and the
// muted fallback surface, all built from the active tokens.

export type Size = "small" | "default" | "large";
export type Shape = "circle" | "rounded";

// Diameter per size: small is the inline topbar/stack size, default the 40px row
// avatar, large the identity-header size.
const BOX: Record<Size, number> = { small: 28, default: 40, large: 48 };

// Circle by default; the rounded square uses the card/menu radius.
const RADIUS: Record<Shape, number> = { circle: 9999, rounded: 6 };

// Initials type per size, ~40% of the diameter.
const LABEL_SIZE: Record<Size, { fontSize: number; lineHeight: number }> = {
  small: { fontSize: 12, lineHeight: 16 },
  default: { fontSize: 16, lineHeight: 24 },
  large: { fontSize: 18, lineHeight: 28 },
};

export function container(tokens: ColorTokens, size: Size, shape: Shape, ring: boolean): ViewStyle {
  return {
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: tokens.muted,
    width: BOX[size],
    height: BOX[size],
    borderRadius: RADIUS[shape],
    // No ring-* equivalent in RN; a 2px background-colored border is the stand-in
    // for ring-2 ring-background, the separator outline used when avatars overlap.
    ...(ring ? { borderWidth: 2, borderColor: tokens.background } : null),
  };
}

// The photo fills the container exactly; the parent's overflow-hidden clips it
// to the circle (RN clips children to a parent's borderRadius).
export function image(shape: Shape): ImageStyle {
  return { width: "100%", height: "100%", borderRadius: RADIUS[shape] };
}

export function label(tokens: ColorTokens, size: Size): TextStyle {
  return { fontWeight: "500", color: tokens["muted-foreground"], ...LABEL_SIZE[size] };
}
