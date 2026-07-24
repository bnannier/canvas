import { I18nManager } from "react-native";

// The single cross-platform reader for the active layout direction.
//
// Native React Native exposes `I18nManager.isRTL` as a direct boolean, but React
// Native Web's I18nManager exports ONLY `allowRTL`, `forceRTL`, and
// `getConstants` — there is no `isRTL` property, so `I18nManager.isRTL` reads
// `undefined` on the web. That silently breaks any comparison against it: a check
// like `(edge === "right") !== I18nManager.isRTL` becomes `false !== undefined`
// (always true) on the web, which is exactly how the Drawer's slide direction
// flipped backward. `getConstants().isRTL` is the one accessor implemented on
// BOTH native and web, so every component routes its RTL check through here
// instead of touching `I18nManager.isRTL` directly.
export function isRTL(): boolean {
  return I18nManager.getConstants().isRTL;
}
