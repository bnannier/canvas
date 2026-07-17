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

import { createContext, type ReactNode, type RefObject } from "react";
import { View, StyleSheet, type StyleProp, type ViewStyle, type ViewProps } from "react-native";
import type * as ExpoBlurTypes from "expo-blur";
import { type ColorTokens } from "../tokens.js";

export interface GlassSurfaceProps {
  /** The skin's shape + fill style (radius, padding, border, shadow, the popover
   *  fill). The fill is stripped under glass; the material supplies it. */
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  pointerEvents?: ViewProps["pointerEvents"];
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /**
   * Render the material as an INTERACTIVE control surface: on iOS 26 the native
   * Liquid Glass responds to touch with its fluid press animation (Apple's
   * `isInteractive`). Use for glass that is itself a tappable control (e.g. an
   * account-trigger avatar), not for passive shells like navbars. Ignored on the
   * frost/solid fallbacks, which have no interactive material. Defaults to false.
   */
  interactive?: boolean;
  /**
   * Render a SHEER (more see-through) frost: a lighter blur and a thinner fill so
   * whatever animates behind the surface reads clearly through it. For CONTENT-layer
   * surfaces that float over a live backdrop and do NOT need to occlude what is behind
   * them (the docs' example stages, tables, and cards over the Canvas Universe). Do NOT
   * use it on functional overlays (menus, dropdowns, dialogs), which must stay opaque
   * enough to occlude the content they open over. Defaults to false (the full frost).
   */
  sheer?: boolean;
}

// The Android blur-backdrop plumbing for expo-blur 57+. Its new Android API blurs an
// explicitly designated BlurTargetView (passed by ref) instead of whatever sits behind
// the BlurView; without a target the dimezis method silently falls back to no blur.
// GlassBackdrop (mounted by ThemeProvider, forked to wrap the app content in a
// BlurTargetView on Android) publishes the target ref here ONCE the ref is attached —
// expo-blur resolves `blurTarget.current` when the BlurView receives the prop, so
// publishing a not-yet-attached ref would freeze the frost at "no target".
export const GlassBlurTargetContext = createContext<RefObject<View | null> | null>(null);

// True inside a mounted GlassBackdrop, provided synchronously (unlike the target ref
// above). Nested ThemeProviders (the docs' theming page embeds one per example) must
// NOT wrap again: the wrapper is a flex:1 View, which collapses to zero height in a
// content-sized parent, and one app-root target is the correct backdrop anyway.
export const GlassBackdropPresenceContext = createContext(false);

// The Android blur-method props for the frost BlurView, chosen by which expo-blur API
// generation is installed. expo-blur 57+ (detected by its BlurTargetView export) wants
// `blurMethod` + `blurTarget`; passing the legacy prop there logs a deprecation
// warning, and naming the dimezis method without a target logs a fallback warning, so
// without a target it asks for "none" outright (the popover fill under the blur keeps
// the surface a substantial material). Older expo-blur keeps the legacy prop
// unchanged. Web ignores all three props (its backdrop-filter path never reads them).
export function frostMethodProps(
  supportsBlurTarget: boolean,
  target: RefObject<View | null> | null,
): Partial<ExpoBlurTypes.BlurViewProps> {
  if (!supportsBlurTarget) return { experimentalBlurMethod: "dimezisBlurView" };
  return target ? { blurMethod: "dimezisBlurView", blurTarget: target } : { blurMethod: "none" };
}

// Blur strength for the frost. expo-blur maps intensity to a blur radius (~0.2px
// per point on web), so ~80 lands near the docs' established blur(16px) frost.
// expo-blur supplies its own light/dark tint at this intensity, so no extra tint
// overlay is layered on top (that would double-darken the material).
export const GLASS_INTENSITY = 80;

// The SHEER frost (GlassSurfaceProps.sheer): a lighter blur plus a thinner popover
// fill (the fill layer is drawn at SHEER_FILL_OPACITY, so its effective alpha drops
// from ~0.66-0.72 to ~0.5), so a live backdrop reads clearly through a content
// surface. The full frost keeps GLASS_INTENSITY + a solid fill for functional
// overlays, which must occlude what they open over.
export const SHEER_INTENSITY = 50;
export const SHEER_FILL_OPACITY = 0.75;

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
