// Material press feedback. On Android, a tappable surface shows a native ripple
// "state layer"; iOS and web have no ripple and dim opacity on press instead.
// These helpers keep that platform split in one place so any Pressable can adopt
// the Android ripple while keeping the iOS/web opacity dim, the same way the
// platform-skinned controls (Button, Checkbox, ...) already do it in their skins.
import { Platform } from "react-native";
import { alpha } from "./color.js";
import { type ColorTokens } from "./tokens.js";

// A neutral ink ripple bounded to a content surface (card, list row, tile). The
// ink is the foreground token at low alpha, so it reads on both themes: dark ink
// on light surfaces, light ink on dark.
export function surfaceRipple(tokens: ColorTokens) {
  return { color: alpha(tokens.foreground, 0.1), borderless: false };
}

// A borderless ripple for a circular or icon-sized control (avatar, icon button),
// where the ripple should radiate from the touch point rather than fill a rect.
export function controlRipple(tokens: ColorTokens) {
  return { color: alpha(tokens.foreground, 0.12), borderless: true };
}

// The press opacity dim for iOS and web. On Android the ripple carries the press
// feedback, so this returns null there to avoid double-signaling. Pass the
// component's own dim value; it stays the iOS/web look unchanged.
export function pressDim(pressed: boolean, opacity = 0.9) {
  return pressed && Platform.OS !== "android" ? { opacity } : null;
}
