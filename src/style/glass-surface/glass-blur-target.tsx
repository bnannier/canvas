// GlassBlurTargetHost — base (web + iOS, and any platform without the Android
// fork). The host is the piece of <OverlayProvider> that decides whether its page
// content mounts inside an expo-blur BlurTargetView so outlet overlays can blur it
// (an Android-only need; see GlassBlurTargetContext in glass-surface.shared). Off
// Android no material ever reads a target — web blurs via backdrop-filter, iOS via
// its native materials — so this base renders the exact single-View wrapper the
// provider always had: content then outlet in one styled View, byte-for-byte the
// pre-target structure. glass-blur-target.android.tsx supplies the real host.

import { View } from "react-native";
import { type GlassBlurTargetHostProps } from "./glass-surface.shared.js";

// Whether this platform mounted a BlurTargetView the provider can publish. False
// here: the targetRef is never attached, so OverlayProvider publishes null and
// every frost keeps its current per-platform blur path.
export const glassBlurTargetAvailable = false;

export function GlassBlurTargetHost({ style, children, outlet }: GlassBlurTargetHostProps) {
  return (
    <View style={style}>
      {children}
      {outlet}
    </View>
  );
}
