// GlassSurface — iOS. Renders Apple's real Liquid Glass via expo-glass-effect's
// GlassView on iOS 26+ (gated by isLiquidGlassAvailable, which also honors the
// reduce-transparency accessibility setting); on iOS < 26 it falls to the same
// expo-blur frost the other platforms use; with neither module it degrades to a
// translucent View. Both modules are optional peer dependencies.

import type * as ExpoGlassTypes from "expo-glass-effect";
import type * as ExpoBlurTypes from "expo-blur";
import { useTheme } from "../theme.js";
import { liquidGlassAvailable } from "./liquid-glass.js";
import {
  GlassBox,
  PlainSurface,
  GLASS_INTENSITY,
  MATERIAL_FILL,
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

export function GlassSurface({ style, children, pointerEvents }: GlassSurfaceProps) {
  const { surface, dark } = useTheme();

  if (surface !== "glass") {
    return (
      <PlainSurface style={style} pointerEvents={pointerEvents}>
        {children}
      </PlainSurface>
    );
  }

  // iOS 26+: the genuine system Liquid Glass material. (The `GlassView &&` also
  // narrows it for the JSX below; liquidGlassAvailable() does the safe availability check.)
  if (GlassView && liquidGlassAvailable()) {
    return (
      <GlassBox
        style={style}
        pointerEvents={pointerEvents}
        material={<GlassView glassEffectStyle="regular" isInteractive={false} colorScheme={dark ? "dark" : "light"} style={MATERIAL_FILL} />}
      >
        {children}
      </GlassBox>
    );
  }

  // iOS < 26 (or reduce-transparency): the same frost as web/Android.
  if (BlurView) {
    return (
      <GlassBox
        style={style}
        pointerEvents={pointerEvents}
        material={<BlurView intensity={GLASS_INTENSITY} tint={dark ? "dark" : "light"} style={MATERIAL_FILL} />}
      >
        {children}
      </GlassBox>
    );
  }

  return (
    <PlainSurface style={style} pointerEvents={pointerEvents}>
      {children}
    </PlainSurface>
  );
}
