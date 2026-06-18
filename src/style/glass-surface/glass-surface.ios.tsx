// GlassSurface — iOS. Renders Apple's real Liquid Glass via expo-glass-effect's
// GlassView on iOS 26+ (gated by isLiquidGlassAvailable, which also honors the
// reduce-transparency accessibility setting); on iOS < 26 it falls to the same
// expo-blur frost the other platforms use; with neither module it degrades to a
// translucent View. Both modules are optional peer dependencies.

import * as ExpoGlass from "expo-glass-effect";
import * as ExpoBlur from "expo-blur";
import { useTheme } from "../theme.js";
import {
  GlassBox,
  PlainSurface,
  GLASS_INTENSITY,
  MATERIAL_FILL,
  type GlassSurfaceProps,
} from "./glass-surface.shared.js";

const GlassView = (ExpoGlass as { GlassView?: typeof ExpoGlass.GlassView }).GlassView;
const isLiquidGlassAvailable = (ExpoGlass as { isLiquidGlassAvailable?: () => boolean }).isLiquidGlassAvailable;
const BlurView = (ExpoBlur as { BlurView?: typeof ExpoBlur.BlurView }).BlurView;

// isLiquidGlassAvailable() resolves the native ExpoGlassEffect module on its first
// call (requireNativeModule), which THROWS when that native module is not in the
// build: the optional peer dep was not installed, or the dev client predates it. The
// optional-peer-dependency contract is graceful degradation, so swallow that and
// report false — the surface then falls to the expo-blur frost instead of crashing.
// (A bare `isLiquidGlassAvailable?.()` only guards the function being undefined, not
// it throwing when called.)
function liquidGlassAvailable(): boolean {
  if (!GlassView || !isLiquidGlassAvailable) return false;
  try {
    return isLiquidGlassAvailable();
  } catch {
    return false;
  }
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
        material={<GlassView glassEffectStyle="regular" isInteractive={false} style={MATERIAL_FILL} />}
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
