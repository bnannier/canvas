// GlassSurface — base (web + Android). On Chromium web the glass surface mode
// renders as the real Liquid Glass LENS (an SVG displacement filter applied as
// the material's backdrop-filter — see glass-lens.ts); elsewhere it renders as
// an expo-blur frost (backdrop blur on non-Chromium web via react-native-web,
// native blur on Android via the dimezis method). Falls back to a plain
// translucent View when not in glass mode or when no material is available
// (expo-blur is an optional peer dependency; bare consumers that skip it
// degrade here, and non-Chromium engines without it do too).
//
// expo-glass-effect is NOT imported here, so web and Android bundles never pull
// the iOS-only Liquid Glass native module. iOS resolves glass-surface.ios.tsx.

import { useContext } from "react";
import type * as ExpoBlurTypes from "expo-blur";
import { View, type ViewStyle } from "react-native";
import { useTheme } from "../theme.js";
import { useGlassLens, GLASS_LENS_FILTER } from "./glass-lens.js";
import {
  GlassBox,
  PlainSurface,
  degradedGlassSurface,
  frostMethodProps,
  specularRim,
  GlassBlurTargetContext,
  GLASS_INTENSITY,
  SHEER_INTENSITY,
  SHEER_FILL_OPACITY,
  materialFill,
  type GlassSurfaceProps,
} from "./glass-surface.shared.js";

// expo-blur is an OPTIONAL peer: consumers without it must still build, so it is
// loaded with a guarded require (a literal id, so bundlers that DO have it
// installed still include it) instead of a static import (which fails module
// resolution for everyone who skipped the optional peer). Undefined when absent
// or in a pure-ESM runtime with no `require` — then we fall back below.
// BlurTargetView doubles as the API-generation detector: expo-blur 57+ exports it
// and wants `blurMethod` + `blurTarget`; older expo-blur takes the legacy
// `experimentalBlurMethod` (see frostMethodProps).
declare const require: (id: string) => unknown;
let BlurView: typeof ExpoBlurTypes.BlurView | undefined;
let supportsBlurTarget = false;
try {
  // Directly in the try block: an intervening `if` makes Metro treat this as
  // a REQUIRED dependency. See src/organisms/backdrop/skia-runtime.ts.
  const mod = require("expo-blur") as {
    BlurView?: typeof ExpoBlurTypes.BlurView;
    BlurTargetView?: typeof ExpoBlurTypes.BlurTargetView;
  };
  BlurView = mod.BlurView;
  supportsBlurTarget = mod.BlurTargetView !== undefined;
} catch {
  BlurView = undefined;
}

// The lens layer's style: the SVG filter as the layer's backdrop-filter.
// `backdropFilter` is not in RN's ViewStyle typing, but react-native-web passes
// it through to CSS untouched — the same mechanism expo-blur's web BlurView
// uses for the frost. Unprefixed only: the gate guarantees Chromium, which
// honors the unprefixed property, and the -webkit- alias would only ever paint
// on a WebKit engine the gate exists to exclude.
const LENS_BACKDROP = { backdropFilter: GLASS_LENS_FILTER } as unknown as ViewStyle;

export function GlassSurface({ style, children, pointerEvents, testID, role, sheer, tint }: GlassSurfaceProps) {
  const { surface, dark, tokens, reducedTransparency, increasedContrast } = useTheme();
  // The under-fill behind the frost: the caller's `tint` for a bright glass control
  // (the Slider knob), else the `popover` token that keeps panels legible.
  const underFill = tint ?? tokens.popover;
  // The Android blur target (see GlassBlurTargetContext in the shared file):
  // non-null only where blurring it is native-sibling-safe — inside an
  // OverlayProvider's outlet or an RN Modal bridged by GlassModalBlurTarget.
  // Elsewhere (in-content shells, web, iOS) it stays null and the frost renders
  // fill-only under expo-blur 57+. Read unconditionally: hooks must not sit
  // behind the early returns.
  const blurTarget = useContext(GlassBlurTargetContext);
  // The web lens gate (glass-lens.ts): true only on Chromium web once the SVG
  // filter is present in the document; always false on Android and until the
  // filter exists. Read unconditionally like the context above.
  const lens = useGlassLens(surface === "glass");

  if (surface !== "glass") {
    return (
      <PlainSurface style={style} pointerEvents={pointerEvents} testID={testID} role={role}>
        {children}
      </PlainSurface>
    );
  }

  // Accessibility rungs (Reduce Transparency / Increase Contrast) render the surface
  // opaque, before the frost material below AND before the no-module fallback, so an
  // opaque + bordered surface is guaranteed even when expo-blur is not installed
  // (Apple AX1/AX2).
  const degraded = degradedGlassSurface({ reducedTransparency, increasedContrast, tokens }, { style, children, pointerEvents, testID, role });
  if (degraded) return degraded;

  // Chromium web: the real Liquid Glass LENS. The SVG displacement filter is the
  // whole material — it bends the backdrop at the rim and carries its own blur +
  // saturation — so it replaces the frost's BlurView (and needs no expo-blur at
  // all). The popover under-fill stays beneath it and the specular rim above it,
  // exactly as the iOS 26 native path keeps its under-fill beneath the GlassView:
  // the fill guarantees a legible panel, the rim supplies the lit edge the filter
  // itself does not draw.
  if (lens) {
    const material = (
      <>
        <View style={[materialFill(style), { backgroundColor: underFill, opacity: sheer ? SHEER_FILL_OPACITY : 1, pointerEvents: "none" }]} />
        <View style={[materialFill(style), LENS_BACKDROP, { pointerEvents: "none" }]} />
        <View style={[specularRim(style, dark), { pointerEvents: "none" }]} />
      </>
    );
    return (
      <GlassBox style={style} material={material} pointerEvents={pointerEvents} testID={testID} role={role}>
        {children}
      </GlassBox>
    );
  }

  // Glass mode but expo-blur is absent: the translucent `popover` fill fallback.
  if (!BlurView) {
    return (
      <PlainSurface style={style} pointerEvents={pointerEvents} testID={testID} role={role}>
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
      <View style={[materialFill(style), { backgroundColor: underFill, opacity: sheer ? SHEER_FILL_OPACITY : 1, pointerEvents: "none" }]} />
      <BlurView
        intensity={sheer ? SHEER_INTENSITY : GLASS_INTENSITY}
        tint={dark ? "dark" : "light"}
        {...frostMethodProps(supportsBlurTarget, blurTarget)}
        style={materialFill(style)}
      />
      {/* Specular edge on top of the frost (below the content): a lit rim that reads as glass. */}
      <View style={[specularRim(style, dark), { pointerEvents: "none" }]} />
    </>
  );

  return (
    <GlassBox style={style} material={material} pointerEvents={pointerEvents} testID={testID} role={role}>
      {children}
    </GlassBox>
  );
}
