// GlassSurface — base (web + Android). Renders the glass surface mode as an
// expo-blur frost (real backdrop blur on web via react-native-web, native blur on
// Android via the dimezis method). Falls back to a plain translucent View when not
// in glass mode or when expo-blur is not installed (an optional peer dependency;
// the Vite docs build stubs it, and bare consumers that skip it degrade here).
//
// expo-glass-effect is NOT imported here, so web and Android bundles never pull
// the iOS-only Liquid Glass native module. iOS resolves glass-surface.ios.tsx.

import * as ExpoBlur from "expo-blur";
import { useTheme } from "../theme.js";
import {
  GlassBox,
  PlainSurface,
  GLASS_INTENSITY,
  MATERIAL_FILL,
  type GlassSurfaceProps,
} from "./glass-surface.shared.js";

// Optional: undefined when expo-blur is absent/stubbed (then we fall back).
const BlurView = (ExpoBlur as { BlurView?: typeof ExpoBlur.BlurView }).BlurView;

export function GlassSurface({ style, children, pointerEvents }: GlassSurfaceProps) {
  const { surface, dark } = useTheme();

  if (surface !== "glass" || !BlurView) {
    return (
      <PlainSurface style={style} pointerEvents={pointerEvents}>
        {children}
      </PlainSurface>
    );
  }

  const material = (
    <BlurView
      intensity={GLASS_INTENSITY}
      tint={dark ? "dark" : "light"}
      experimentalBlurMethod="dimezisBlurView"
      style={MATERIAL_FILL}
    />
  );

  return (
    <GlassBox style={style} material={material} pointerEvents={pointerEvents}>
      {children}
    </GlassBox>
  );
}
