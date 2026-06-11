import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, shadow, alpha } from "../../style/index.js";
import { type TabsSkin } from "./tabs.shared.js";

// Co-located Tabs skins, one per platform. The shell resolves the look axis
// (underline / pills / vertical), the selection/block/disabled state, and the
// badges; the skin supplies only the native SHAPE, sizing, label weight, fill,
// indicator, and press feedback. The BRAND survives on every platform (the
// indigo `primary` token and the semantic tokens, never a platform default), so
// each follows light/dark and the glass surface.
//
//   iOS (HIG segmented tab strip): the default underline look becomes a rounded
//     gray CONTAINER (radius 8, muted fill, 3px padding); the SELECTED tab is a
//     raised white/elevated pill (radius 6, small shadow); labels ~13pt; no
//     underline rule. The selected label carries the brand indigo. Press = dim.
//   Android (M3 underline tabs): no container; each tab is text with a 3px brand
//     `primary` indicator bar under the active tab; inactive labels read in
//     `muted-foreground`; title-case ~14sp; press = android_ripple.
//   Web: the established Canvas look (underline rule / muted pill track / accent
//     rail), lifted verbatim from the original file.

export type Variant = "underline" | "pills" | "vertical";

// --- shared layout fragments (color-free; identical across platforms) --------

// flex-1: an equal-flex trigger in block mode (shares the row width).
export const flex1: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: "0%" };

// opacity-50: the dimmed disabled look the component applies per trigger.
export const disabledDim: ViewStyle = { opacity: 0.5 };

// w-full vs self-start: in block mode the row fills the available width so
// equal-flex triggers stretch it; otherwise the row hugs its triggers.
export function blockWidth(block: boolean): ViewStyle {
  return block ? { width: "100%" } : { alignSelf: "flex-start" };
}

// =============================================================================
// Web: the established Canvas look (lifted verbatim from the original file).
// =============================================================================

export const webSkin: TabsSkin = {
  // The selected underline tab carries no track ripple; press dims the trigger.
  pressedOpacity: 0.9,
  ripple: null,

  // --- underline ---
  underlineRow(tokens) {
    return {
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1,
      borderColor: tokens.border,
    };
  },
  underlineTrigger() {
    return {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingHorizontal: 16,
      paddingVertical: 10,
    };
  },
  // A 2px primary rule drawn as an explicit sliver pinned to the trigger's
  // bottom edge (absolute bottom-0 left-0 right-0 h-0.5 rounded-full).
  underlineIndicator(tokens, selected) {
    return {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 2,
      borderRadius: 9999,
      backgroundColor: selected ? tokens.primary : "transparent",
    };
  },
  underlineLabel(tokens, selected) {
    return { fontSize: 14, lineHeight: 20, fontWeight: "500", color: selected ? tokens.foreground : tokens["muted-foreground"] };
  },

  // --- pills ---
  pillsRow(tokens) {
    return {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      alignSelf: "flex-start",
      borderRadius: 8,
      backgroundColor: tokens.muted,
      padding: 4,
    };
  },
  pillsTrigger() {
    return {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      borderRadius: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
    };
  },
  pillsFill(tokens, selected) {
    return selected
      ? { backgroundColor: tokens.background, ...shadow("sm") }
      : { backgroundColor: "transparent" };
  },
  pillsLabel(tokens, selected) {
    return { fontSize: 14, lineHeight: 20, fontWeight: "500", color: selected ? tokens.foreground : tokens["muted-foreground"] };
  },

  // --- vertical ---
  verticalTrigger() {
    return {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      borderRadius: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
    };
  },
  verticalFill(tokens, selected) {
    return { backgroundColor: selected ? tokens.accent : "transparent" };
  },
  verticalLabel(tokens, selected) {
    return { fontSize: 14, lineHeight: 20, fontWeight: "500", color: selected ? tokens["accent-foreground"] : tokens["muted-foreground"] };
  },

  // --- count badge ---
  countBadgeBox(tokens) {
    return {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      borderRadius: 6,
      borderWidth: 1,
      borderColor: "transparent",
      backgroundColor: tokens.secondary,
      paddingHorizontal: 6,
      paddingVertical: 2,
    };
  },
  countBadgeLabel(tokens, muted) {
    return { fontSize: 12, lineHeight: 16, fontWeight: "500", color: muted ? tokens["muted-foreground"] : tokens["secondary-foreground"] };
  },
};

// =============================================================================
// iOS (HIG): segmented tab strip. The underline look becomes a gray rounded
// track holding raised white pills; the pills look stays a segmented track too;
// vertical stays a left rail. Press = opacity dim.
// =============================================================================

const IOS_PILL_SHADOW: ViewStyle = {
  shadowColor: "#000000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.18,
  shadowRadius: 2,
  elevation: 2,
};

export const iosSkin: TabsSkin = {
  pressedOpacity: 0.8, // HIG: dim on press
  ripple: null,

  // --- underline -> segmented track (gray container + raised white pill) ---
  underlineRow(tokens) {
    // The gray rounded container (radius 8, muted fill, 3px inset).
    return {
      flexDirection: "row",
      alignItems: "center",
      gap: 0,
      padding: 3,
      borderRadius: 8,
      backgroundColor: tokens.muted,
    };
  },
  underlineTrigger(tokens, selected) {
    // Each tab is an independent rounded pill (radius 6) inside the track; the
    // selected one is raised white/elevated.
    return {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      borderRadius: 6,
      paddingHorizontal: 14,
      paddingVertical: 7,
      ...(selected ? { ...IOS_PILL_SHADOW, backgroundColor: tokens.background } : { backgroundColor: "transparent" }),
    };
  },
  // No underline rule on iOS: the raised pill is the selected affordance.
  underlineIndicator() {
    return { display: "none" };
  },
  underlineLabel(tokens, selected) {
    // ~13pt SF label; selected reads slightly heavier and carries brand indigo.
    return { fontSize: 13, lineHeight: 18, fontWeight: selected ? "600" : "500", color: selected ? tokens.primary : tokens.foreground };
  },

  // --- pills (segmented track, same gray-track + raised pill treatment) ---
  pillsRow(tokens) {
    return {
      flexDirection: "row",
      alignItems: "center",
      gap: 0,
      alignSelf: "flex-start",
      borderRadius: 8,
      backgroundColor: tokens.muted,
      padding: 3,
    };
  },
  pillsTrigger() {
    return {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      borderRadius: 6,
      paddingHorizontal: 14,
      paddingVertical: 7,
    };
  },
  pillsFill(tokens, selected) {
    return selected
      ? { ...IOS_PILL_SHADOW, backgroundColor: tokens.background }
      : { backgroundColor: "transparent" };
  },
  pillsLabel(tokens, selected) {
    return { fontSize: 13, lineHeight: 18, fontWeight: selected ? "600" : "500", color: selected ? tokens.primary : tokens.foreground };
  },

  // --- vertical (HIG grouped rail; active item is an accent-filled row) ---
  verticalTrigger() {
    return {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 9,
    };
  },
  verticalFill(tokens, selected) {
    return { backgroundColor: selected ? tokens.accent : "transparent" };
  },
  verticalLabel(tokens, selected) {
    return { fontSize: 15, lineHeight: 20, fontWeight: selected ? "600" : "400", color: selected ? tokens["accent-foreground"] : tokens.foreground };
  },

  // --- count badge ---
  countBadgeBox(tokens) {
    return {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      borderRadius: 9999,
      borderWidth: 0,
      borderColor: "transparent",
      backgroundColor: tokens.secondary,
      paddingHorizontal: 7,
      paddingVertical: 1,
    };
  },
  countBadgeLabel(tokens, muted) {
    return { fontSize: 12, lineHeight: 16, fontWeight: "600", color: muted ? tokens["muted-foreground"] : tokens["secondary-foreground"] };
  },
};

// =============================================================================
// Android (Material 3): underline tabs. No container; each tab is text with a
// 3px brand `primary` indicator bar under the active tab; inactive labels read
// muted; press = android_ripple.
// =============================================================================

export const androidSkin: TabsSkin = {
  pressedOpacity: null, // Android uses a ripple instead
  ripple: (tokens) => ({ color: alpha(tokens.primary, 0.12), borderless: false }),

  // --- underline (M3 primary tabs) ---
  underlineRow(tokens) {
    // M3 tabs sit on a hairline divider; no track fill.
    return {
      flexDirection: "row",
      alignItems: "stretch",
      borderBottomWidth: 1,
      borderColor: tokens.border,
    };
  },
  underlineTrigger() {
    // Taller M3 tab target; the indicator hugs the bottom edge.
    return {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingHorizontal: 16,
      paddingVertical: 12,
    };
  },
  // M3 indicator: a 3px brand `primary` bar with a slight top rounding under
  // the active tab.
  underlineIndicator(tokens, selected) {
    return {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 3,
      borderTopLeftRadius: 3,
      borderTopRightRadius: 3,
      backgroundColor: selected ? tokens.primary : "transparent",
    };
  },
  underlineLabel(tokens, selected) {
    // M3 titleSmall ~14sp; active label carries the brand indigo, inactive muted.
    return { fontSize: 14, lineHeight: 20, fontWeight: "500", color: selected ? tokens.primary : tokens["muted-foreground"] };
  },

  // --- pills (M3 keeps the muted-track + tonal selected fill) ---
  pillsRow(tokens) {
    return {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      alignSelf: "flex-start",
      borderRadius: 9999,
      backgroundColor: tokens.muted,
      padding: 4,
    };
  },
  pillsTrigger() {
    return {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      borderRadius: 9999,
      paddingHorizontal: 14,
      paddingVertical: 7,
    };
  },
  pillsFill(tokens, selected) {
    // Tonal selected fill (secondaryContainer ~ alpha(primary, .12)).
    return selected ? { backgroundColor: alpha(tokens.primary, 0.12) } : { backgroundColor: "transparent" };
  },
  pillsLabel(tokens, selected) {
    return { fontSize: 14, lineHeight: 20, fontWeight: "500", color: selected ? tokens.primary : tokens["muted-foreground"] };
  },

  // --- vertical (M3 navigation rail row; active item is a tonal pill) ---
  verticalTrigger() {
    return {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      borderRadius: 9999,
      paddingHorizontal: 14,
      paddingVertical: 9,
    };
  },
  verticalFill(tokens, selected) {
    return { backgroundColor: selected ? alpha(tokens.primary, 0.12) : "transparent" };
  },
  verticalLabel(tokens, selected) {
    return { fontSize: 14, lineHeight: 20, fontWeight: "500", color: selected ? tokens.primary : tokens["muted-foreground"] };
  },

  // --- count badge ---
  countBadgeBox(tokens) {
    return {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      borderRadius: 9999,
      borderWidth: 0,
      borderColor: "transparent",
      backgroundColor: tokens.secondary,
      paddingHorizontal: 7,
      paddingVertical: 1,
    };
  },
  countBadgeLabel(tokens, muted) {
    return { fontSize: 12, lineHeight: 16, fontWeight: "500", color: muted ? tokens["muted-foreground"] : tokens["secondary-foreground"] };
  },
};
