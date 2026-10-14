// Native iOS: intentional content frost and functional Apple Liquid Glass.
import { View } from "react-native";
import { FrostView, LiquidView } from "./material-runtime.ios.js";
import { useMaterialResolution } from "./use-material-theme.js";
import {
  GlassBox, CLEAR_INTENSITY, contrastStyle, frostFill, SHEER_FILL_OPACITY, materialFill,
  SpecularRim, surfaceIntensity, type GlassSurfaceProps,
} from "./glass-surface.shared.js";

/**
 * The host every kit glass surface renders through (a Card, a Dialog, a Popover's card, the
 * Navbar, an option list and the rest), painting its layer's material behind its children.
 *
 * On the web the material is Dark Factory's plain frost (the layer's tint, a 24 px backdrop
 * blur with no saturation shift and a 1 px inset hairline). On iOS 26 and later it is
 * Apple's Liquid Glass through expo-glass-effect for the functional, control and dense
 * layers, and expo-blur's frost with a specular rim for content and static surfaces and
 * before iOS 26. On Android 12 and later with `@nannier/canvas-blur` installed, it is that
 * package's capture frost where a capture plane is ready (an overlay outlet, a bridged Modal),
 * and a surface in the page, which has none, resolves its solid skin; otherwise (without the
 * package, or on Android 11 and earlier, where it captures nothing) it is expo-blur's frost on
 * expo-blur's releases before 57, in the page as in an overlay, and from 57 the surface
 * resolves solid. A `brand` paints brand-tinted glass and a `tint` a wash.
 *
 * Where its material resolves solid (in solid mode, under Reduce Transparency or Increase
 * Contrast, where an optional peer is missing, a browser lacks a backdrop filter or an
 * Android surface that needs a capture plane has none) it renders the plain box: the skin's
 * `style` untouched, with the contrasting `foreground` border under Increase Contrast. Under
 * glass the fill gives way to the material and a resting border becomes padding, so the
 * material covers the surface's whole solid footprint; a `stateBorder` stays over it.
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
 * This is the iOS host.
 */
export function GlassSurface(props: GlassSurfaceProps) {
  const { theme, material: resolved } = useMaterialResolution(props);
  const { style, layer = "functional", brand, clear, interactive = false } = props;
  const solid = resolved.renderer === "solid";
  const translucent = props.sheer && layer === "content";
  const fill = materialFill(style, props.stateBorder);
  const native = resolved.renderer === "liquid";
  // Liquid Glass takes a brand as its own tintColor and paints no fill for it; the frost
  // paints the fill, a brand one OVER the blur (`frostFill`).
  const fillOf = frostFill(theme, props);
  const fillLayer = <View style={[fill, { backgroundColor: fillOf.color, opacity: translucent ? SHEER_FILL_OPACITY : 1 }]} />;
  const paintsFill = !native || brand == null || props.tint != null;
  const over = !native && fillOf.over;
  const material = solid ? null : <>
    {paintsFill && !over ? fillLayer : null}
    {native && LiquidView ? <LiquidView glassEffectStyle={clear ? "clear" : "regular"} isInteractive={interactive} tintColor={brand} colorScheme={theme.dark ? "dark" : "light"} style={fill} />
      : FrostView ? <FrostView intensity={clear ? CLEAR_INTENSITY : surfaceIntensity(layer, translucent)} tint={theme.dark ? "dark" : "light"} style={fill} /> : null}
    {paintsFill && over ? fillLayer : null}
    {!native ? <SpecularRim style={style} dark={theme.dark} inside={props.stateBorder} /> : null}
  </>;
  return <GlassBox {...props} style={contrastStyle(theme, style, props.stateBorder)} solid={solid} material={material} />;
}
