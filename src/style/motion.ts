import { useEffect, useState } from "react";
import { AccessibilityInfo, Platform, UIManager } from "react-native";

// Whether the platform has React Native's native animated module, and therefore whether
// `useNativeDriver: true` engages an off-thread animation. True on iOS/Android, false on
// web (react-native-web ships no native animated module). Use it to gate the driver on a
// ONE-SHOT animation (a fade or move that plays once): native runs it off-thread, web falls
// back to the JS driver.
//
// DO NOT use it for `Animated.loop`. The native driver does NOT loop reliably:
//   - On react-native-web there is no native module, so loop() takes the native-loop path
//     (it branches on the raw `useNativeDriver` flag) whose per-iteration restart is driven
//     by a native onEnd callback that never fires. The loop runs one pass, then freezes.
//   - Under the New Architecture on iOS the native loop likewise does not advance, so a
//     `useNativeDriver: true` loop sits frozen at its start value.
// Every `Animated.loop` must therefore pass `useNativeDriver: false`, which takes loop()'s JS
// `restart()` recursion (a self-rescheduling requestAnimationFrame) and iterates everywhere.
// A slow looping background animation is cheap on the JS thread, so this costs nothing real.
//
// Platform.OS is fixed per bundle, so this is evaluated once.
export const supportsNativeDriver: boolean = Platform.OS !== "web";

// Whether the user has asked the OS to reduce motion (iOS "Reduce Motion", Android
// "Remove animations", and the web `prefers-reduced-motion` media query, which
// react-native-web maps onto AccessibilityInfo). Components read this to drop or
// shorten NON-ESSENTIAL animation (a skeleton shimmer, an accordion's expand
// transition, a carousel's animated scroll) so the kit honors WCAG 2.3.3 on every
// platform from one codebase. Essential, information-bearing motion (a loading
// spinner, a determinate progress fill) is left intact.
//
// Returns false until the first async read resolves, then tracks live changes.
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (mounted) setReduced(value);
    });
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduced);
    return () => {
      mounted = false;
      sub?.remove?.();
    };
  }, []);
  return reduced;
}

// React Native's New Architecture (Fabric / Bridgeless) enables LayoutAnimation by default, and
// `UIManager.setLayoutAnimationEnabledExperimental` is a no-op there that LOGS A WARNING on every
// call. The OLD (Paper) architecture still needs the flag flipped on Android. So detect Fabric via
// the global the runtime installs, and only flip the experimental flag on old-arch Android — a
// no-op on iOS, web, and the New Architecture. Call once at module scope from any component that
// drives LayoutAnimation (Accordion, Collapsible). Evaluated per bundle; Fabric is known by then.
const IS_FABRIC = (globalThis as { nativeFabricUIManager?: unknown }).nativeFabricUIManager != null;

export function enableAndroidLayoutAnimations(): void {
  if (Platform.OS === "android" && !IS_FABRIC && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}
