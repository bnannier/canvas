// Whether Apple's real Liquid Glass material is available on this iOS device —
// true on iOS 26+ with Reduce Transparency off (isLiquidGlassAvailable honors that
// accessibility setting), false otherwise. This drives BOTH the GlassSurface
// material choice AND the theme runtime's platform default (glass-by-default on
// iOS 26). Extracted into its own platform file so the theme runtime can import it
// without pulling in the GlassSurface/theme cycle, and so web/Android get the false
// stub (no expo-glass-effect import).
//
// isLiquidGlassAvailable() resolves the native ExpoGlassEffect module on first call
// (requireNativeModule), which THROWS when that module is not in the build (the
// optional peer dep was not linked, or the dev client predates it). The optional
// peer-dependency contract is graceful degradation, so swallow that and report false.

import * as ExpoGlass from "expo-glass-effect";

const GlassView = (ExpoGlass as { GlassView?: unknown }).GlassView;
const isLiquidGlassAvailable = (ExpoGlass as { isLiquidGlassAvailable?: () => boolean }).isLiquidGlassAvailable;

export function liquidGlassAvailable(): boolean {
  if (!GlassView || !isLiquidGlassAvailable) return false;
  try {
    return isLiquidGlassAvailable();
  } catch {
    return false;
  }
}
