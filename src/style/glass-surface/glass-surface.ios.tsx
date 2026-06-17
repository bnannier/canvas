// GlassSurface — iOS. Renders Apple's real Liquid Glass via expo-glass-effect's
// GlassView on iOS 26+ (gated by isLiquidGlassAvailable, which also honors the
// reduce-transparency accessibility setting); on iOS < 26 it falls to the same
// expo-blur frost the other platforms use; with neither module it degrades to a
// translucent View. Both modules are optional peer dependencies.

import { View } from "react-native";
import * as ExpoGlass from "expo-glass-effect";
import * as ExpoBlur from "expo-blur";
import { useTheme } from "../theme.js";
import {
  GlassBox,
  PlainSurface,
  glassTint,
  GLASS_INTENSITY,
  MATERIAL_FILL,
  type GlassSurfaceProps,
} from "./glass-surface.shared.js";

const GlassView = (ExpoGlass as { GlassView?: typeof ExpoGlass.GlassView }).GlassView;
const isLiquidGlassAvailable = (ExpoGlass as { isLiquidGlassAvailable?: () => boolean }).isLiquidGlassAvailable;
const BlurView = (ExpoBlur as { BlurView?: typeof ExpoBlur.BlurView }).BlurView;

export function GlassSurface({ style, children, pointerEvents }: GlassSurfaceProps) {
  const { surface, tokens, dark } = useTheme();

  if (surface !== "glass") {
    return (
      <PlainSurface style={style} pointerEvents={pointerEvents}>
        {children}
      </PlainSurface>
    );
  }

  // iOS 26+: the genuine system Liquid Glass material.
  if (GlassView && isLiquidGlassAvailable?.()) {
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
    const material = (
      <>
        <BlurView intensity={GLASS_INTENSITY} tint={dark ? "dark" : "light"} style={MATERIAL_FILL} />
        <View style={[MATERIAL_FILL, { backgroundColor: glassTint(tokens, dark) }]} />
      </>
    );
    return (
      <GlassBox style={style} material={material} pointerEvents={pointerEvents}>
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
