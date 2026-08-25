import { useEffect, useState } from "react";
import { AccessibilityInfo, Platform } from "react-native";

// Two accessibility-preference hooks that drive the glass surface's degradation,
// mirroring useReducedMotion (src/style/motion.ts): async first read behind a
// mounted guard, then a live subscription. Apple's Liquid Glass HIG requires the
// material to degrade for these settings, and React Native does NOT wire them into
// custom views for free, so the kit reads them here and the ThemeProvider +
// GlassSurface react:
//   - Reduce Transparency  -> glass becomes opaque/frostier (obscures content behind).
//   - Increase Contrast    -> glass becomes near-solid with a contrasting border.
// Both are single shared files (no .web.tsx fork), exactly as motion.ts handles the
// same "native setting on iOS/Android, media query on the web" split.

// The web media-query subscription lives in media-query.ts (shared with the
// pointer-capability hooks); behavior is unchanged.
import { subscribeMedia } from "./media-query.js";

/**
 * Whether the user has asked the OS to reduce transparency (iOS "Reduce
 * Transparency", or the web `prefers-reduced-transparency: reduce` media query).
 * Under this setting the glass surface renders opaque instead of translucent, per
 * Apple's Liquid Glass guidance ("makes Liquid Glass frostier and obscures more of
 * the content behind it").
 *
 * Android has no equivalent OS setting, so this is always false there (RN's
 * isReduceTransparencyEnabled resolves false on Android). Returns false until the
 * first async read resolves, then tracks live changes.
 */
export function useReducedTransparency(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let mounted = true;
    // Feature-detect: react-native-web does NOT implement this method (undefined),
    // so the web path falls through to the media query below.
    const nativeQuery = AccessibilityInfo.isReduceTransparencyEnabled;
    if (typeof nativeQuery === "function") {
      nativeQuery().then((value) => {
        if (mounted) setReduced(value);
      });
      // The change event is iOS-only; addEventListener returns a no-op remover on
      // Android, so subscribing unconditionally is safe.
      const sub = AccessibilityInfo.addEventListener("reduceTransparencyChanged", setReduced);
      return () => {
        mounted = false;
        sub?.remove?.();
      };
    }
    const media = subscribeMedia("(prefers-reduced-transparency: reduce)", (value) => {
      if (mounted) setReduced(value);
    });
    setReduced(media.matches);
    return () => {
      mounted = false;
      media.remove();
    };
  }, []);
  return reduced;
}

/**
 * Whether the user has asked the OS to increase contrast (iOS "Increase Contrast",
 * Android "High contrast text", or the web `prefers-contrast: more` media query).
 * Under this setting the glass surface renders near-solid with a contrasting
 * border, per Apple's Liquid Glass guidance ("makes elements predominantly black or
 * white and highlights them with a contrasting border").
 *
 * The native query is PLATFORM-PICKED and this is mandatory: on iOS the setting is
 * isDarkerSystemColorsEnabled and on Android the nearest is isHighTextContrastEnabled,
 * but each of those RN methods NEVER settles its promise on the OTHER platform (an
 * upstream RN bug), so calling the wrong one hangs. Returns false until the first
 * async read resolves, then tracks live changes.
 */
export function useIncreasedContrast(): boolean {
  const [increased, setIncreased] = useState(false);
  useEffect(() => {
    let mounted = true;
    const nativeQuery =
      Platform.OS === "android"
        ? AccessibilityInfo.isHighTextContrastEnabled
        : AccessibilityInfo.isDarkerSystemColorsEnabled;
    if (typeof nativeQuery === "function") {
      nativeQuery().then((value) => {
        if (mounted) setIncreased(value);
      });
      // Subscribe both change events; each is a no-op remover on the platform that
      // lacks it (darkerSystemColorsChanged is iOS-only, highTextContrastChanged
      // Android-only).
      const darker = AccessibilityInfo.addEventListener("darkerSystemColorsChanged", setIncreased);
      const highText = AccessibilityInfo.addEventListener("highTextContrastChanged", setIncreased);
      return () => {
        mounted = false;
        darker?.remove?.();
        highText?.remove?.();
      };
    }
    // Web (RNW implements neither method). forced-colors is a separate axis the
    // browser restyles on its own, so only prefers-contrast is mapped here.
    const media = subscribeMedia("(prefers-contrast: more)", (value) => {
      if (mounted) setIncreased(value);
    });
    setIncreased(media.matches);
    return () => {
      mounted = false;
      media.remove();
    };
  }, []);
  return increased;
}
