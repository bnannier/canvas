// Material press feedback. On Android, a tappable surface shows a native ripple
// "state layer"; iOS and web have no ripple and dim opacity on press instead.
// These helpers keep that platform split in one place so every kit control that
// presses (Card, the list rows, Chip, an icon Button) takes the Android ripple while
// keeping the iOS/web opacity dim, the same way the platform-skinned controls (Button,
// Checkbox, ...) already do it in their skins. They are kit internals: the names were
// public by accident and are deprecated aliases now (audit K12-2, src/style/public.ts).
import { Platform } from "react-native";
import { alpha } from "./color.js";
import { type ColorTokens } from "./tokens.js";

/**
 * The Android ripple of a content surface (a card, a list row, a tile): a neutral ink,
 * the foreground at low alpha so it reads in both schemes, bounded to the surface. iOS
 * and the web ignore it and dim instead (`pressDim`).
 */
export function surfaceRipple(tokens: ColorTokens) {
  return { color: alpha(tokens.foreground, 0.1), borderless: false };
}

/**
 * The Android ripple of a round or icon-sized control (an avatar, an icon button): the
 * same neutral ink, borderless, so it radiates from the touch point rather than filling
 * a rectangle.
 */
export function controlRipple(tokens: ColorTokens) {
  return { color: alpha(tokens.foreground, 0.12), borderless: true };
}

/**
 * The press dim of iOS and the web: the given opacity while pressed (0.9 by default), and
 * null on Android, where the ripple carries the press and a dim would signal it twice.
 */
export function pressDim(pressed: boolean, opacity = 0.9) {
  return pressed && Platform.OS !== "android" ? { opacity } : null;
}

/**
 * The opacity each platform's own disabled controls take (the hand-off's
 * `--p-disabled`): 0.4 on iOS, Material 3's 0.38 on Android and 0.5 on the web, for a skin
 * one component shares across every platform. Evaluated once in the platform's own bundle;
 * `os` is for tests.
 */
export function platformDisabledDim(os: string = Platform.OS): number {
  if (os === "ios") return 0.4;
  if (os === "android") return 0.38;
  return 0.5;
}
