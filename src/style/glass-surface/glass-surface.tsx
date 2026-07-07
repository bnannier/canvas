// GlassSurface — base (web + Android). Renders the glass surface mode as an
// expo-blur frost (real backdrop blur on web via react-native-web, native blur on
// Android via the dimezis method). Falls back to a plain translucent View when not
// in glass mode or when expo-blur is not installed (an optional peer dependency;
// the docs build stubs it, and bare consumers that skip it degrade here).
//
// expo-glass-effect is NOT imported here, so web and Android bundles never pull
// the iOS-only Liquid Glass native module. iOS resolves glass-surface.ios.tsx.

import type * as ExpoBlurTypes from "expo-blur";
import { View, StyleSheet, type ViewStyle } from "react-native";
import { useTheme } from "../theme.js";
import {
  GlassBox,
  PlainSurface,
  GLASS_INTENSITY,
  MATERIAL_FILL,
  type GlassSurfaceProps,
} from "./glass-surface.shared.js";

// expo-blur is an OPTIONAL peer: consumers without it must still build, so it is
// loaded with a guarded require (a literal id, so bundlers that DO have it
// installed still include it) instead of a static import (which fails module
// resolution for everyone who skipped the optional peer). Undefined when absent
// or in a pure-ESM runtime with no `require` — then we fall back below.
declare const require: ((id: string) => unknown) | undefined;
let BlurView: typeof ExpoBlurTypes.BlurView | undefined;
try {
  if (typeof require === "function") {
    BlurView = (require("expo-blur") as { BlurView?: typeof ExpoBlurTypes.BlurView }).BlurView;
  }
} catch {
  BlurView = undefined;
}

// The specular edge that lifts the flat frost toward a liquid-glass look: light catches the
// TOP edge, a faint hairline defines the whole rim, and the bottom edge takes a soft shade.
// Painted with the cross-platform `boxShadow` style prop (RN 0.85: web + Android), so it is
// one code path, not a web-only effect. Scheme-adaptive so it reads on light and dark. This
// lives in the web/Android file ONLY — iOS keeps its native GlassView material untouched.
const SPECULAR_RIM = {
  light:
    "inset 0 1px 1px rgba(255,255,255,0.55), inset 0 0 0 0.5px rgba(255,255,255,0.40), inset 0 -1px 1.5px rgba(0,0,0,0.06)",
  dark:
    "inset 0 1px 1px rgba(255,255,255,0.16), inset 0 0 0 0.5px rgba(255,255,255,0.10), inset 0 -1px 1.5px rgba(0,0,0,0.22)",
} as const;

// The corner radii from the skin's style, so the rim hugs the surface's rounded shape.
function radiusOf(style: GlassSurfaceProps["style"]): ViewStyle {
  const f = (StyleSheet.flatten(style) ?? {}) as ViewStyle;
  return {
    borderRadius: f.borderRadius,
    borderTopLeftRadius: f.borderTopLeftRadius,
    borderTopRightRadius: f.borderTopRightRadius,
    borderBottomLeftRadius: f.borderBottomLeftRadius,
    borderBottomRightRadius: f.borderBottomRightRadius,
  };
}

export function GlassSurface({ style, children, pointerEvents }: GlassSurfaceProps) {
  const { surface, dark, tokens } = useTheme();

  if (surface !== "glass" || !BlurView) {
    return (
      <PlainSurface style={style} pointerEvents={pointerEvents}>
        {children}
      </PlainSurface>
    );
  }

  // The blur alone is too faint over a flat surface (a dark blur over a near-black page
  // reads as clear), so paint the translucent `popover` frost fill UNDER the blur. That
  // keeps the frost a substantial material in both schemes while the blur still shows
  // through the remaining translucency.
  const material = (
    <>
      <View style={[MATERIAL_FILL, { backgroundColor: tokens.popover }]} pointerEvents="none" />
      <BlurView
        intensity={GLASS_INTENSITY}
        tint={dark ? "dark" : "light"}
        experimentalBlurMethod="dimezisBlurView"
        style={MATERIAL_FILL}
      />
      {/* Specular edge on top of the frost (below the content): a lit rim that reads as glass. */}
      <View style={[MATERIAL_FILL, radiusOf(style), { boxShadow: dark ? SPECULAR_RIM.dark : SPECULAR_RIM.light }]} pointerEvents="none" />
    </>
  );

  return (
    <GlassBox style={style} material={material} pointerEvents={pointerEvents}>
      {children}
    </GlassBox>
  );
}
