// GlassBackdrop — Android: wraps the app content in expo-blur's BlurTargetView and
// publishes its ref through GlassBlurTargetContext, so every frost GlassSurface can
// name it as the view to blur. expo-blur 57 changed the Android API: a BlurView no
// longer blurs whatever renders behind it; it blurs an explicitly designated
// BlurTargetView, and without one the dimezis method silently falls back to no blur.
// ThemeProvider mounts this around its children, so consumers get the frost wired
// with no extra setup.
//
// The wrapper mounts whenever the module is present — NOT only while the glass
// surface mode is active — so toggling solid/glass at runtime never reparents (and
// thereby remounts) the app subtree. The ref is published via state from a mount
// effect because expo-blur resolves `blurTarget.current` when the BlurView receives
// the prop and cannot detect a ref that attaches later; consumers therefore see null
// for the first frame and re-render with the attached target.

import { useContext, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { View } from "react-native";
import type * as ExpoBlurTypes from "expo-blur";
import { GlassBackdropPresenceContext, GlassBlurTargetContext } from "./glass-surface.shared.js";

// expo-blur is an OPTIONAL peer: consumers without it must still build, so it is
// loaded with a guarded require (a literal id, so bundlers that DO have it installed
// still include it) instead of a static import. BlurTargetView doubles as the API
// detector: expo-blur < 57 does not export it, and its legacy BlurView needs no
// target, so the passthrough below is the correct behavior there too.
declare const require: ((id: string) => unknown) | undefined;
let BlurTargetView: typeof ExpoBlurTypes.BlurTargetView | undefined;
try {
  if (typeof require === "function") {
    BlurTargetView = (require("expo-blur") as { BlurTargetView?: typeof ExpoBlurTypes.BlurTargetView })
      .BlurTargetView;
  }
} catch {
  BlurTargetView = undefined;
}

export function GlassBackdrop({ children }: { children?: ReactNode }) {
  // A nested ThemeProvider (the docs' theming page embeds one per example) must not
  // wrap again: the wrapper is a flex:1 View, which collapses to zero height in a
  // content-sized parent, and the app-root target is the correct backdrop anyway.
  const nested = useContext(GlassBackdropPresenceContext);
  const ref = useRef<View | null>(null);
  const [target, setTarget] = useState<RefObject<View | null> | null>(null);
  useEffect(() => {
    if (ref.current) setTarget(ref);
  }, []);

  if (!BlurTargetView || nested) return <>{children}</>;
  return (
    <GlassBackdropPresenceContext.Provider value={true}>
      <GlassBlurTargetContext.Provider value={target}>
        <BlurTargetView ref={ref} style={{ flex: 1 }}>
          {children}
        </BlurTargetView>
      </GlassBlurTargetContext.Provider>
    </GlassBackdropPresenceContext.Provider>
  );
}
