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
import { type ColorTokens } from "../tokens.js";

export interface GlassSurfaceProps {
  /** The skin's shape + fill style (radius, padding, border, shadow, the popover
   *  fill). The fill is stripped under glass; the material supplies it. */
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  pointerEvents?: ViewProps["pointerEvents"];
  /** E2E hook forwarded to the root element. */
  testID?: string;
}

// Blur strength for the frost. expo-blur maps intensity to a blur radius (~0.2px
// per point on web), so ~80 lands near the docs' established blur(16px) frost.
// expo-blur supplies its own light/dark tint at this intensity, so no extra tint
// overlay is layered on top (that would double-darken the material).
export const GLASS_INTENSITY = 80;

// Under the OS "Increase Contrast" setting, Apple makes Liquid Glass "predominantly
// black or white and highlights them with a contrasting border". The kit renders the
// opaque surface (via PlainSurface) plus this border, in `foreground` (near-black on
// light, near-white on dark) — a true contrasting edge, unlike the subtle `border`
// hairline token. Applied as a style-array override so it wins over (or adds to) a
// skin's own border. Border-box in RN, so it adds no external layout shift.
export const CONTRAST_BORDER_WIDTH = 1;

export function contrastBorder(tokens: ColorTokens): ViewStyle {
  return { borderWidth: CONTRAST_BORDER_WIDTH, borderColor: tokens.foreground };
}

// Keys that must live on the OUTER box: shadow (overflow:hidden would clip it),
// absolute positioning, outer-margin/self-alignment, and SIZING (flex/width/
// height) so the surface fills or sizes within its parent exactly as the single-
// View version did. The inner clip box then fills the outer (flex: 1). Radius keys
// are duplicated onto the outer box so its shadow is rounded. Both the physical
// (left/right, marginLeft/Right) and the logical (start/end, marginStart/End) edge
// keys are listed so a surface anchored either way routes to the outer box the same.
const OUTER_KEYS = new Set<string>([
  "shadowColor", "shadowOffset", "shadowOpacity", "shadowRadius", "elevation", "boxShadow",
  "position", "top", "right", "bottom", "left", "start", "end", "zIndex",
  "margin", "marginTop", "marginBottom", "marginLeft", "marginRight", "marginStart", "marginEnd", "marginHorizontal", "marginVertical",
  "alignSelf", "flex", "flexGrow", "flexShrink", "flexBasis",
  "width", "height", "minWidth", "maxWidth", "minHeight", "maxHeight",
]);
const RADIUS_KEYS = new Set<string>([
  "borderRadius",
  "borderTopLeftRadius", "borderTopRightRadius", "borderBottomLeftRadius", "borderBottomRightRadius",
  "borderTopStartRadius", "borderTopEndRadius", "borderBottomStartRadius", "borderBottomEndRadius",
]);
// Border width/color/style keys stripped under glass: the material supplies the edge
// (Apple's Liquid Glass carries its own on iOS 26; the SPECULAR_RIM does on the frost),
// so a skin's hairline would double it and fight the material (Apple: remove custom
// backgrounds/borders from navigation surfaces). Radius keys are NOT here — they shape
// the clip and must survive. Logical (start/end) variants are listed alongside physical.
const BORDER_KEYS = new Set<string>([
  "borderWidth", "borderTopWidth", "borderBottomWidth", "borderLeftWidth", "borderRightWidth",
  "borderStartWidth", "borderEndWidth",
  "borderColor", "borderTopColor", "borderBottomColor", "borderLeftColor", "borderRightColor",
  "borderStartColor", "borderEndColor", "borderBlockColor", "borderBlockStartColor", "borderBlockEndColor",
  "borderStyle",
]);

interface Split {
  outer: ViewStyle;
  clip: ViewStyle;
}

export function splitSurfaceStyle(style: StyleProp<ViewStyle>): Split {
  const flat = (StyleSheet.flatten(style) ?? {}) as Record<string, unknown>;
  const outer: Record<string, unknown> = {};
  // flex:1 makes the clip box fill the outer box (whose size the OUTER_KEYS set),
  // so the material covers the whole surface even when the surface is sized by flex
  // (e.g. a full-height sidebar) rather than by its content.
  const clip: Record<string, unknown> = { overflow: "hidden", flex: 1 };
  for (const [key, value] of Object.entries(flat)) {
    if (value == null) continue;
    if (key === "backgroundColor" || BORDER_KEYS.has(key)) continue; // the material supplies the fill + edge
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
  testID,
  material,
}: GlassSurfaceProps & { material: ReactNode }) {
  const { outer, clip } = splitSurfaceStyle(style);
  return (
    <View style={[outer, pointerEvents ? { pointerEvents } : null]} testID={testID}>
      <View style={clip}>
        {material}
        {children}
      </View>
    </View>
  );
}

// The no-glass / no-module fallback: one plain View identical to the pre-portal
// surface (keeps the solid or translucent popover fill from `style`).
export function PlainSurface({ style, children, pointerEvents, testID }: GlassSurfaceProps) {
  return (
    <View style={[style, pointerEvents ? { pointerEvents } : null]} testID={testID}>
      {children}
    </View>
  );
}

// The accessibility degradation rungs, shared by both platform files so the ladder
// is defined ONCE (Apple: these modifiers must apply to every glass element). When
// either setting is on the surface renders opaque via PlainSurface — the ThemeProvider
// has already reverted the translucent `popover` token to its solid value, so the
// skin's own fill is opaque here with no extra work. Increase Contrast additionally
// adds a contrasting `foreground` border. Returns null when neither setting is on, so
// the caller proceeds to its normal material path. Precedence: Increase Contrast wins
// over Reduce Transparency (its rung is a superset — opaque plus the border).
export function degradedGlassSurface(
  flags: { increasedContrast: boolean; reducedTransparency: boolean; tokens: ColorTokens },
  props: GlassSurfaceProps,
): ReactNode | null {
  if (!flags.increasedContrast && !flags.reducedTransparency) return null;
  const style = flags.increasedContrast ? [props.style, contrastBorder(flags.tokens)] : props.style;
  return (
    <PlainSurface style={style} pointerEvents={props.pointerEvents} testID={props.testID}>
      {props.children}
    </PlainSurface>
  );
}

// The absolute-fill style for material layers, with taps passing through (the
// content sits on top; the dismiss backdrop, when present, is a portal sibling).
// A full-bleed cover layer (all four edges pinned), so it is direction-agnostic
// and stays physical left/right — the RTL sweep converts reading-direction edges,
// not symmetric full covers.
export const MATERIAL_FILL: ViewStyle = {
  position: "absolute",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  pointerEvents: "none",
};

// The specular edge that lifts the flat frost toward a liquid-glass look: light
// catches the TOP edge, a faint hairline defines the whole rim, and the bottom edge
// takes a soft shade. Painted with the cross-platform `boxShadow` style prop (RN 0.85:
// web + Android + iOS), so it is one code path, not a web-only effect. Scheme-adaptive
// so it reads on light and dark. Applied on the FROST paths only (web, Android, iOS < 26)
// — iOS 26's native GlassView material is never decorated. Once skin borders are stripped
// under glass, this rim is the surface's edge.
export const SPECULAR_RIM = {
  light:
    "inset 0 1px 1px rgba(255,255,255,0.55), inset 0 0 0 0.5px rgba(255,255,255,0.40), inset 0 -1px 1.5px rgba(0,0,0,0.06)",
  dark:
    "inset 0 1px 1px rgba(255,255,255,0.16), inset 0 0 0 0.5px rgba(255,255,255,0.10), inset 0 -1px 1.5px rgba(0,0,0,0.22)",
} as const;

// The corner radii from the skin's style, so the rim hugs the surface's rounded shape.
function radiusOf(style: StyleProp<ViewStyle>): ViewStyle {
  const f = (StyleSheet.flatten(style) ?? {}) as ViewStyle;
  return {
    borderRadius: f.borderRadius,
    borderTopLeftRadius: f.borderTopLeftRadius,
    borderTopRightRadius: f.borderTopRightRadius,
    borderBottomLeftRadius: f.borderBottomLeftRadius,
    borderBottomRightRadius: f.borderBottomRightRadius,
    borderTopStartRadius: f.borderTopStartRadius,
    borderTopEndRadius: f.borderTopEndRadius,
    borderBottomStartRadius: f.borderBottomStartRadius,
    borderBottomEndRadius: f.borderBottomEndRadius,
  };
}

// The absolute-fill specular-rim overlay style for a frost surface: the skin's radii
// (so the rim follows the rounded corners) plus the scheme's inset boxShadow. Render as
// `<View style={specularRim(style, dark)} pointerEvents="none" />` on top of the blur,
// below the content.
export function specularRim(style: StyleProp<ViewStyle>, dark: boolean): ViewStyle {
  return { ...MATERIAL_FILL, ...radiusOf(style), boxShadow: dark ? SPECULAR_RIM.dark : SPECULAR_RIM.light };
}
