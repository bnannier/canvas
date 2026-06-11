import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, shadow, alpha } from "../../style/index.js";
import { type NavbarSkin } from "./navbars.shared.js";

// Co-located Navbar skins, one per platform. The shell resolves the surface axis
// (default / bordered / floating), the brand + link cluster, and the action +
// avatar cluster; the skin supplies only the native SHAPE, sizing, label weight,
// fill, separator, and press feedback. The BRAND survives on every platform (the
// indigo `primary` token and the semantic tokens, never a platform default), so
// each follows light/dark and the glass surface.
//
//   iOS (HIG navigation bar): a slim 44pt bar with a 1px hairline bottom
//     separator (no heavy shadow); the brand reads as a ~17pt weight-600 SF
//     title; nav links and the active link tint the brand `primary`; press =
//     opacity dim 0.8.
//   Android (M3 top app bar): a ~56dp bar with a ~22sp weight-500 LEADING title;
//     no hairline border, a flat `background` surface (soft elevation only when
//     `floating`); nav links use a tonal `primary` active fill; press =
//     android_ripple.
//   Web: the established Canvas look (h-14 bar, bottom hairline / rounded outline
//     / floating shadowed card), lifted verbatim from the original file.

export type Surface = "default" | "bordered" | "floating";

// =============================================================================
// Web: the established Canvas look (lifted verbatim from the original file).
// =============================================================================

export const webSkin: NavbarSkin = {
  // The original bar dims links on press (active:opacity-90); no ripple.
  pressedOpacity: 0.9,
  ripple: null,

  // flex-row items-center justify-between h-14 px-4
  bar() {
    return {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      height: 56,
      paddingHorizontal: 16,
    };
  },
  // bg-background fill (token-driven, follows the scheme/glass surface).
  surface(tokens) {
    return { backgroundColor: tokens.background };
  },
  // The surface axis. default rests flush with a bottom hairline; bordered boxes
  // it in a rounded outline; floating lifts it as a rounded, shadowed card.
  surfaceContainer(tokens, surface) {
    switch (surface) {
      case "default":
        return { borderBottomWidth: 1, borderColor: tokens.border };
      case "bordered":
        return { borderRadius: 8, borderWidth: 1, borderColor: tokens.border };
      case "floating":
        return { borderRadius: 8, borderWidth: 1, borderColor: tokens.border, ...shadow("md") };
    }
  },

  // flex-row items-center gap-4
  leftGroup() {
    return { flexDirection: "row", alignItems: "center", gap: 16 };
  },
  // text-base font-semibold text-foreground
  brand(tokens) {
    return { fontSize: 16, lineHeight: 24, fontWeight: "600", color: tokens.foreground };
  },
  // flex-row items-center gap-1
  linksRow() {
    return { flexDirection: "row", alignItems: "center", gap: 4 };
  },
  // rounded-md px-3 py-1.5; the active tile fills bg-accent.
  linkTile(tokens, active) {
    return {
      borderRadius: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: active ? tokens.accent : "transparent",
    };
  },
  // text-sm font-medium; active reads in the foreground, inactive in muted.
  linkLabel(tokens, active) {
    return {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "500",
      color: active ? tokens.foreground : tokens["muted-foreground"],
    };
  },

  // flex-row items-center gap-2
  rightGroup() {
    return { flexDirection: "row", alignItems: "center", gap: 8 };
  },
};

// =============================================================================
// iOS (HIG): a slim navigation bar. A 44pt bar with a 1px hairline bottom
// separator and no heavy shadow; the brand is a ~17pt weight-600 SF title; nav
// links and the active link tint the brand `primary`. Press = opacity dim 0.8.
// =============================================================================

export const iosSkin: NavbarSkin = {
  pressedOpacity: 0.8, // HIG: dim on press
  ripple: null,

  // Slim 44pt bar. HIG navigation bars are shorter than the Canvas web bar.
  bar() {
    return {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      height: 44,
      paddingHorizontal: 16,
    };
  },
  surface(tokens) {
    return { backgroundColor: tokens.background };
  },
  // default: a 1px hairline bottom separator only (no shadow). bordered keeps the
  // rounded outline; floating lifts a light card (HIG keeps elevation subtle).
  surfaceContainer(tokens, surface) {
    switch (surface) {
      case "default":
        return { borderBottomWidth: 1, borderColor: tokens.border };
      case "bordered":
        return { borderRadius: 10, borderWidth: 1, borderColor: tokens.border };
      case "floating":
        return { borderRadius: 10, borderWidth: 1, borderColor: tokens.border, ...shadow("sm") };
    }
  },

  leftGroup() {
    return { flexDirection: "row", alignItems: "center", gap: 16 };
  },
  // ~17pt SF title, weight 600 (HIG inline navigation title).
  brand(tokens) {
    return { fontSize: 17, lineHeight: 22, fontWeight: "600", color: tokens.foreground };
  },
  linksRow() {
    return { flexDirection: "row", alignItems: "center", gap: 2 };
  },
  // iOS bar button items are text-only and brand-tinted; the active item carries
  // a faint tonal primary wash so the current destination still reads.
  linkTile(tokens, active) {
    return {
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
      backgroundColor: active ? alpha(tokens.primary, 0.12) : "transparent",
    };
  },
  // HIG tints actionable items the brand color; the active item reads heavier.
  linkLabel(tokens, active) {
    return {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: active ? "600" : "400",
      color: active ? tokens.primary : alpha(tokens.primary, 0.85),
    };
  },

  rightGroup() {
    return { flexDirection: "row", alignItems: "center", gap: 8 };
  },
};

// =============================================================================
// Android (Material 3): a top app bar. A ~56dp bar with a ~22sp weight-500
// LEADING title and no hairline border; the surface is flat `background` (soft
// elevation only when floating). Nav links use a tonal `primary` active fill.
// Press = android_ripple.
// =============================================================================

export const androidSkin: NavbarSkin = {
  pressedOpacity: null, // Android uses a ripple instead
  ripple: (tokens) => ({ color: alpha(tokens.primary, 0.12), borderless: false }),

  // ~56dp small top app bar.
  bar() {
    return {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      height: 56,
      paddingHorizontal: 16,
    };
  },
  surface(tokens) {
    return { backgroundColor: tokens.background };
  },
  // M3 small top app bar is borderless and flat at rest; we rely on the
  // background fill. bordered/floating keep a container so those layouts still
  // box (floating gets the M3 elevated-surface shadow on scroll).
  surfaceContainer(tokens, surface) {
    switch (surface) {
      case "default":
        return {}; // flat, no hairline; the background fill carries the bar
      case "bordered":
        return { borderRadius: 12, borderWidth: 1, borderColor: tokens.border };
      case "floating":
        return { borderRadius: 12, ...shadow("md") };
    }
  },

  leftGroup() {
    return { flexDirection: "row", alignItems: "center", gap: 16 };
  },
  // M3 titleLarge ~22sp, weight 500, leading.
  brand(tokens) {
    return { fontSize: 22, lineHeight: 28, fontWeight: "500", color: tokens.foreground };
  },
  linksRow() {
    return { flexDirection: "row", alignItems: "center", gap: 4 };
  },
  // M3 active destination carries a tonal `primary` fill (secondaryContainer ~
  // alpha(primary, .12)); inactive sits flat with a muted label.
  linkTile(tokens, active) {
    return {
      borderRadius: 9999,
      paddingHorizontal: 16,
      paddingVertical: 6,
      backgroundColor: active ? alpha(tokens.primary, 0.12) : "transparent",
    };
  },
  linkLabel(tokens, active) {
    return {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "500",
      color: active ? tokens.primary : tokens["muted-foreground"],
    };
  },

  rightGroup() {
    return { flexDirection: "row", alignItems: "center", gap: 8 };
  },
};
