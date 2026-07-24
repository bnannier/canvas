// GlassSurface — iOS. Renders Apple's real Liquid Glass via expo-glass-effect's
// GlassView on iOS 26+ (gated by isLiquidGlassAvailable, which also honors the
// reduce-transparency accessibility setting); on iOS < 26 it falls to the same
// expo-blur frost the other platforms use; with neither module it degrades to a
// translucent View. Both modules are optional peer dependencies.

import type * as ExpoGlassTypes from "expo-glass-effect";
import type * as ExpoBlurTypes from "expo-blur";
import { View } from "react-native";
import { useTheme } from "../theme.js";
import { liquidGlassAvailable } from "./liquid-glass.js";
import {
  GlassBox,
  PlainSurface,
  degradedGlassSurface,
  specularRim,
  GLASS_INTENSITY,
  SHEER_INTENSITY,
  SHEER_FILL_OPACITY,
  materialFill,
  type GlassSurfaceProps,
} from "./glass-surface.shared.js";

// Both modules are OPTIONAL peers: consumers without them must still build, so
// each is loaded with a guarded literal require (bundlers that have it installed
// include it; missing packages degrade to the translucent fallback) instead of a
// static import (which fails module resolution for everyone who skipped it).
declare const require: ((id: string) => unknown) | undefined;
let GlassView: typeof ExpoGlassTypes.GlassView | undefined;
let BlurView: typeof ExpoBlurTypes.BlurView | undefined;
try {
  if (typeof require === "function") {
    GlassView = (require("expo-glass-effect") as { GlassView?: typeof ExpoGlassTypes.GlassView }).GlassView;
  }
} catch {
  GlassView = undefined;
}
try {
  if (typeof require === "function") {
    BlurView = (require("expo-blur") as { BlurView?: typeof ExpoBlurTypes.BlurView }).BlurView;
  }
} catch {
  BlurView = undefined;
}

export function GlassSurface({ style, children, pointerEvents, testID, interactive = false, sheer, tint }: GlassSurfaceProps) {
  const { surface, dark, tokens, reducedTransparency, increasedContrast } = useTheme();
  // The under-fill behind the material: the caller's `tint` for a bright glass
  // control (the Slider knob), else the `popover` token that keeps panels legible.
  const underFill = tint ?? tokens.popover;

  if (surface !== "glass") {
    return (
      <PlainSurface style={style} pointerEvents={pointerEvents} testID={testID}>
        {children}
      </PlainSurface>
    );
  }

  // Accessibility rungs (Reduce Transparency / Increase Contrast) win over every
  // material below, including the native GlassView: the wrapper's adaptation under
  // Increase Contrast is unverifiable, so the kit guarantees the opaque + bordered
  // result itself.
  const degraded = degradedGlassSurface({ reducedTransparency, increasedContrast, tokens }, { style, children, pointerEvents, testID });
  if (degraded) return degraded;

  // iOS 26+: the genuine system Liquid Glass material. The translucent `popover` fill
  // sits UNDER the GlassView, exactly as the frost path below layers it under the blur:
  // a bare regular-glass panel composites nearly clear over a flat surface (and clear
  // over the page in a portaled overlay), which turns a fill-and-border-stripped glass
  // menu or dialog into an invisible hole. The under-fill guarantees a legible material
  // (Apple: functional-layer glass must stay legible) while the GlassView still refracts
  // through the remaining translucency. (The `GlassView &&` also narrows it for the JSX
  // below; liquidGlassAvailable() does the safe availability check.)
  if (GlassView && liquidGlassAvailable()) {
    return (
      <GlassBox
        style={style}
        pointerEvents={pointerEvents}
        testID={testID}
        material={
          <>
            <View style={[materialFill(style), { backgroundColor: underFill, opacity: sheer ? SHEER_FILL_OPACITY : 1, pointerEvents: "none" }]} />
            <GlassView glassEffectStyle="regular" isInteractive={interactive} colorScheme={dark ? "dark" : "light"} style={materialFill(style)} />
          </>
        }
      >
        {children}
      </GlassBox>
    );
  }

  // iOS < 26: the same frost as web/Android. The translucent `popover` fill sits
  // UNDER the blur so the frost stays a substantial material (the blur alone is too
  // faint over a flat surface), matching the web/Android layering.
  if (BlurView) {
    return (
      <GlassBox
        style={style}
        pointerEvents={pointerEvents}
        testID={testID}
        material={
          <>
            <View style={[materialFill(style), { backgroundColor: underFill, opacity: sheer ? SHEER_FILL_OPACITY : 1, pointerEvents: "none" }]} />
            <BlurView intensity={sheer ? SHEER_INTENSITY : GLASS_INTENSITY} tint={dark ? "dark" : "light"} style={materialFill(style)} />
            {/* Specular edge (below the content): a lit rim that supplies the surface's
                edge now that skin borders are stripped under glass. iOS 26's native
                GlassView above is never decorated. */}
            <View style={[specularRim(style, dark), { pointerEvents: "none" }]} />
          </>
        }
      >
        {children}
      </GlassBox>
    );
  }

  return (
    <PlainSurface style={style} pointerEvents={pointerEvents} testID={testID}>
      {children}
    </PlainSurface>
  );
}
