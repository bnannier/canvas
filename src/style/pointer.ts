import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { subscribeMedia } from "./media-query.js";

// Pointer-capability hooks: the INPUT half of the desktop form factor (macOS
// via the web skin in a browser or the Tauri shell, and desktop web itself).
// The kit's components already behave correctly by construction (hover events
// never fire for touch pointers; the web skin is pointer-first), so nothing is
// rewired here: these expose the capability for app-level decisions (show a
// hover-only affordance, widen a hit target on web-touch).
//
// Native iOS/Android are touch-first constants. The web reads the standard
// media features LIVE, so an iPad browser, a touch laptop, and a mouse plugged
// into a tablet all resolve correctly, and docking/undocking updates.
// Desktop-first defaults where nothing can be read (SSR, the pre-effect first
// frame): a fine pointer that can hover.
//
// Single shared file (no .web.tsx fork), exactly as a11y-preferences.ts and
// motion.ts handle the same "native constant, web media query" split.

const NATIVE_TOUCH = Platform.OS === "ios" || Platform.OS === "android";

function useMediaCapability(query: string, nativeValue: boolean, webDefault: boolean): boolean {
  const [value, setValue] = useState(NATIVE_TOUCH ? nativeValue : webDefault);
  useEffect(() => {
    if (NATIVE_TOUCH) return;
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const sub = subscribeMedia(query, setValue);
    setValue(sub.matches);
    return sub.remove;
  }, [query]);
  return value;
}

/** True when the primary pointer is coarse (touch). Native iOS/Android: always
 *  true. Web: `(pointer: coarse)`, live. SSR / first frame: false
 *  (desktop-first). */
export function usePointerCoarse(): boolean {
  return useMediaCapability("(pointer: coarse)", true, false);
}

/** True when the primary input can hover. Native iOS/Android: always false.
 *  Web: `(hover: hover)`, live. SSR / first frame: true (desktop-first). */
export function useHoverCapable(): boolean {
  return useMediaCapability("(hover: hover)", false, true);
}
