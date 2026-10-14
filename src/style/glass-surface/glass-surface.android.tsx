// Android material host: the layer's tint, then the canvas-blur capture frost when the
// app installed @nannier/canvas-blur and a safe capture target is ready, else expo-blur's
// frost on its releases before 57 (from 57 a surface without a target resolves solid,
// see frostMethodProps), then the specular rim. Only decoration changes when appearance
// does. The web and iOS hosts are their own files (glass-surface.tsx and
// glass-surface.ios.tsx), so a web material change never reaches Android.
import { View } from "react-native";
import { FrostView, requiresBlurTarget } from "./material-runtime.android.js";
import { NativeCaptureFrost } from "./capture-runtime.js";
import { useCaptureDemand } from "./capture-target.js";
import { useMaterialResolution } from "./use-material-theme.js";
import {
  GlassBox, CLEAR_INTENSITY, contrastStyle, frostFill, frostMethodProps, SHEER_FILL_OPACITY, materialFill,
  SpecularRim, surfaceIntensity, useBlurTargetRejection, type GlassSurfaceProps,
} from "./glass-surface.shared.js";

const EMPTY_TARGET = { current: null };

/**
 * The host every kit glass surface renders through (a Card, a Dialog, a Popover's card, the
 * Navbar, an option list and the rest), painting its layer's material behind its children.
 *
 * On the web the material is Dark Factory's plain frost (the layer's tint, a 24 px backdrop
 * blur with no saturation shift and a 1 px inset hairline). On iOS 26 and later it is
 * Apple's Liquid Glass through expo-glass-effect for the functional, control and dense
 * layers, and expo-blur's frost with a specular rim for content and static surfaces and
 * before iOS 26. On Android, with `@nannier/canvas-blur` installed, it is that package's
 * capture frost where a capture plane is ready (an overlay outlet, a bridged Modal), and a
 * surface in the page, which has none, resolves its solid skin; without it, it is expo-blur's
 * frost on expo-blur's releases before 57, in the page as in an overlay, and from 57 the
 * surface resolves solid. A `brand` paints brand-tinted glass, a `tint` a wash, and a
 * `boundaryFill` a control's boundary over the material.
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
 * This is the Android host.
 */
export function GlassSurface(props: GlassSurfaceProps) {
  const { theme, material: resolved, requestedTarget, target } = useMaterialResolution(props);
  const { layer = "functional", sheer, style, clear } = props;
  const solid = resolved.renderer === "solid";
  useCaptureDemand(requestedTarget ?? EMPTY_TARGET, !solid && NativeCaptureFrost !== undefined);
  // A frost refuses only a plane that contains it: under a GlassModalBlurTarget that sits
  // in the plane's own window. The bridge then withdraws the plane and this resolves solid.
  const reject = useBlurTargetRejection();
  // Sheer is a content-only treatment. It must never thin a menu or error verdict.
  const translucent = sheer && layer === "content";
  const intensity = clear ? CLEAR_INTENSITY : surfaceIntensity(layer, translucent);
  const fill = materialFill(style, props.stateBorder);
  const nativeCapture = NativeCaptureFrost !== undefined && target !== null && !solid;
  // The fill paints beneath the material, except over the capture frost (which samples
  // a separate plane), and a brand colour or a boundary fill, which paint over it so their
  // solved colour is the rendered one (`frostFill`).
  const fillOf = frostFill(theme, props);
  const tintLayer = <View style={[fill, { backgroundColor: fillOf.color, opacity: translucent ? SHEER_FILL_OPACITY : 1 }]} />;
  const over = nativeCapture || fillOf.over;
  const material = solid ? null : <>
    {over ? null : tintLayer}
    {NativeCaptureFrost && target ? <NativeCaptureFrost targetRef={target} intensity={intensity} tint={theme.dark ? "dark" : "light"} style={fill} onTargetRejected={reject ? () => reject(target) : undefined} />
      : FrostView ? <FrostView intensity={intensity} tint={theme.dark ? "dark" : "light"} {...frostMethodProps(requiresBlurTarget)} style={fill} /> : null}
    {over ? tintLayer : null}
    <SpecularRim style={style} dark={theme.dark} inside={props.stateBorder} />
  </>;
  return <GlassBox {...props} style={contrastStyle(theme, style, props.stateBorder)} solid={solid} material={material} />;
}
