// Web material host (and the fallback for a platform without its own host): Dark
// Factory's plain frost. The layer's tint, a backdrop blur with no saturation shift, and
// a 1px inset hairline; no refraction and no specular highlight. Every number is in
// web-frost.ts, the tuned table. Only decoration changes when appearance does. Android
// and iOS are their own files (glass-surface.android.tsx: the canvas-blur capture and
// expo-blur frost; glass-surface.ios.tsx: Liquid Glass and frost), so a web material
// change never reaches a native build.
import { Platform, View, type ViewStyle } from "react-native";
import { FrostView, requiresBlurTarget } from "./material-runtime.js";
import { useMaterialResolution } from "./use-material-theme.js";
import { frameBedsFor } from "../tokens.js";
import { WEB_FROST, webRimColor } from "./web-frost.js";
import {
  GlassBox, CLEAR_INTENSITY, brandOverMaterial, clearSurfaceTint, contrastStyle, frostMethodProps,
  materialFill, surfaceUnderFill, surfaceIntensity, type GlassSurfaceProps,
} from "./glass-surface.shared.js";

/**
 * The host every kit glass surface renders through (a Card, a Dialog, a Popover's card, the
 * Navbar, an option list and the rest), painting its layer's material behind its children.
 *
 * On the web the material is Dark Factory's plain frost (the layer's tint, a 24 px backdrop
 * blur with no saturation shift and a 1 px inset hairline). On iOS 26 and later it is
 * Apple's Liquid Glass through expo-glass-effect for the functional, control and dense
 * layers, and expo-blur's frost with a specular rim for content and static surfaces and
 * before iOS 26. On Android it is the capture frost of `@nannier/canvas-blur` where a capture
 * plane is ready (an overlay outlet, a bridged Modal) and expo-blur's frost on its releases
 * before 57, while a surface in the page resolves its solid skin. A `brand` paints
 * brand-tinted glass and a `tint` a wash.
 *
 * Where its material resolves solid (in solid mode, under Reduce Transparency or Increase
 * Contrast, where an optional peer is missing, a browser lacks a backdrop filter or an
 * Android surface has no plane) it renders the plain box: the skin's `style` untouched,
 * with the contrasting `foreground` border under Increase Contrast. Under glass the fill
 * gives way to the material and a resting border becomes padding, so the material covers
 * the surface's whole solid footprint; a `stateBorder` stays over it.
 *
 * Accessibility: its root is the one node it adds, carrying only the `role`, `testID` and
 * accessibility-escape handler it is given, the same in solid, glass and every rung of the
 * accessibility ladder, so a screen reader and the keyboard meet its children as they would
 * in a plain View: it takes no focus stop and adds no name. Its material is hidden from
 * VoiceOver and TalkBack (`accessibilityElementsHidden`, `importantForAccessibility`
 * `no-hide-descendants`) and on the web is a set of empty, pointer-transparent boxes with no
 * role or text. Every touch passes through the material to the children and their hit slop,
 * a borderless Android ripple inside it draws in front of the frost, and a mode switch never
 * remounts the children, so their focus, input values and scroll survive it.
 *
 * This is the web host, and the host of a platform with no file of its own.
 */
export function GlassSurface(props: GlassSurfaceProps) {
  // No capture target here: the browser's backdrop filter samples the page itself, and
  // only Android's frost needs a target (glass-surface.android.tsx), so the shared
  // resolution never finds one to require.
  const { theme, material: resolved } = useMaterialResolution(props);
  const { layer = "functional", sheer, tint, brand, style, clear } = props;
  const solid = resolved.renderer === "solid";
  // Sheer is a content-only treatment. It must never thin a menu or error verdict.
  const translucent = sheer && layer === "content";
  const fill = materialFill(style, props.stateBorder);
  const blur = clear ? WEB_FROST.clearBlur : WEB_FROST.blur;
  const frost = blur > 0 ? `blur(${blur}px)` : undefined;
  const scheme = theme.dark ? "dark" : "light";
  const rim: ViewStyle = { ...fill, boxShadow: `inset 0 0 0 ${WEB_FROST.rimWidth}px ${webRimColor(layer, scheme, theme.tokens.border)}` };
  const tintLayer = <View style={[fill, { backgroundColor: surfaceUnderFill(theme.glass, layer, brand, tint ?? (clear && brand == null ? clearSurfaceTint(theme.tokens, theme.dark) : undefined), theme.tokens, frameBedsFor(theme.palette, theme.scheme)), opacity: translucent ? WEB_FROST.sheerFillOpacity : 1 }]} />;
  // The fill paints beneath the material, except for a brand colour (see brandOverMaterial).
  const over = brandOverMaterial(brand, tint);
  // A platform without its own host and without a browser's backdrop filter frosts
  // through expo-blur when it is installed; the web never reaches that branch.
  const intensity = clear ? CLEAR_INTENSITY : surfaceIntensity(layer, translucent);
  const material = solid ? null : <>
    {over ? null : tintLayer}
    {Platform.OS === "web"
      ? frost ? <View style={[fill, { backdropFilter: frost, WebkitBackdropFilter: frost } as ViewStyle]} /> : null
      : FrostView ? <FrostView intensity={intensity} tint={theme.dark ? "dark" : "light"} {...frostMethodProps(requiresBlurTarget)} style={fill} /> : null}
    {over ? tintLayer : null}
    <View style={rim} />
  </>;
  return <GlassBox {...props} style={contrastStyle(theme, style, props.stateBorder)} solid={solid} material={material} />;
}
