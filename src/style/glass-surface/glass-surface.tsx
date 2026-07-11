// GlassSurface — base (web + Android). Renders the glass surface mode as an
// expo-blur frost (real backdrop blur on web via react-native-web, native blur on
// Android via the dimezis method). Falls back to a plain translucent View when not
// in glass mode or when expo-blur is not installed (an optional peer dependency;
// the docs build stubs it, and bare consumers that skip it degrade here).
//
// expo-glass-effect is NOT imported here, so web and Android bundles never pull
// the iOS-only Liquid Glass native module. iOS resolves glass-surface.ios.tsx.

import type * as ExpoBlurTypes from "expo-blur";
import { View } from "react-native";
import { useTheme } from "../theme.js";
import {
  GlassBox,
  PlainSurface,
  degradedGlassSurface,
  specularRim,
  GLASS_INTENSITY,
  SHEER_INTENSITY,
  SHEER_FILL_OPACITY,
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

export function GlassSurface({ style, children, pointerEvents, testID, sheer }: GlassSurfaceProps) {
  const { surface, dark, tokens, reducedTransparency, increasedContrast } = useTheme();

  if (surface !== "glass") {
    return (
      <PlainSurface style={style} pointerEvents={pointerEvents} testID={testID}>
        {children}
      </PlainSurface>
    );
  }

  // Accessibility rungs (Reduce Transparency / Increase Contrast) render the surface
  // opaque, before the frost material below AND before the no-module fallback, so an
  // opaque + bordered surface is guaranteed even when expo-blur is not installed
  // (Apple AX1/AX2).
  const degraded = degradedGlassSurface({ reducedTransparency, increasedContrast, tokens }, { style, children, pointerEvents, testID });
  if (degraded) return degraded;

  // Glass mode but expo-blur is absent: the translucent `popover` fill fallback.
  if (!BlurView) {
    return (
      <PlainSurface style={style} pointerEvents={pointerEvents} testID={testID}>
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
      <View style={[MATERIAL_FILL, { backgroundColor: tokens.popover, opacity: sheer ? SHEER_FILL_OPACITY : 1, pointerEvents: "none" }]} />
      <BlurView
        intensity={sheer ? SHEER_INTENSITY : GLASS_INTENSITY}
        tint={dark ? "dark" : "light"}
        experimentalBlurMethod="dimezisBlurView"
        style={MATERIAL_FILL}
      />
      {/* Specular edge on top of the frost (below the content): a lit rim that reads as glass. */}
      <View style={[specularRim(style, dark), { pointerEvents: "none" }]} />
    </>
  );

  return (
    <GlassBox style={style} material={material} pointerEvents={pointerEvents} testID={testID}>
      {children}
    </GlassBox>
  );
}
