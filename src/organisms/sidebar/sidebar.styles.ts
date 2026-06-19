import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, alpha } from "../../style/index.js";
import { type SidebarSkin } from "./sidebar.shared.js";

// Co-located Sidebar skins, one per platform. The shell resolves the density and
// frame axes, the section grouping, the flat-index active matching, the badges,
// and the select handler; the skin supplies only the native SHAPE of the nav row
// (its radius and height), the selected-row highlight (fill + label/icon color),
// the section heading, the frame (outer column), and the press feedback. The
// BRAND survives on every platform (the indigo `primary`/`accent` tokens, never a
// platform default), so each follows light/dark and the glass surface.
//
//   iOS 27 (Liquid Glass) sidebar: grouped rows; the SELECTED row is a CAPSULE
//     highlight (radius 9999) filled with the light-gray `accent`, label in
//     `accent-foreground`, while the leading icon stays TINTED in `primary`;
//     section headers ~13pt 600 muted; ~36pt rows; press = opacity dim (0.8).
//   Android (M3 navigation drawer): each nav item is a fully-rounded PILL (radius
//     9999); the ACTIVE item is a tonal `alpha(primary, 0.12)` pill with the icon
//     + label in brand `primary`; inactive transparent with `foreground`; ~56dp
//     item height; press = android_ripple.
//   Web: the established Canvas look (row radius 6, `accent` fill on the active OR
//     pressed row, foreground/muted label + icon), lifted verbatim from the
//     original file.

export type Density = "default" | "compact";
export type Frame = "flush" | "bordered";

// =============================================================================
// Web: the established Canvas look (lifted verbatim from the original file).
// =============================================================================

export const webSkin: SidebarSkin = {
  // Web carries no row ripple; the active-row affordance is the accent fill, also
  // applied while a row is pressed (the old `active:bg-accent`).
  pressedFill: true,
  pressedOpacity: null,
  ripple: null,

  // Fixed-width column with the standard inset (gap-4 p-2) on the background fill.
  // The flush frame docks against the page with a single right hairline; the
  // bordered/floating frame lifts it into a fully ruled, rounded, clipped card.
  column(tokens, frame) {
    const base: ViewStyle = {
      width: 240,
      backgroundColor: tokens.background,
      gap: 16,
      padding: 8,
    };
    if (frame === "bordered") {
      return { ...base, borderRadius: 8, borderWidth: 1, borderColor: tokens.border, overflow: "hidden" };
    }
    return { ...base, borderRightWidth: 1, borderColor: tokens.border };
  },

  // A titled group of nav rows.
  group: { gap: 4 },

  // The uppercase, muted, wide-tracked section heading above a group.
  sectionTitle(tokens) {
    return {
      paddingHorizontal: 12,
      paddingVertical: 4,
      fontSize: 12,
      lineHeight: 16,
      fontWeight: "500",
      textTransform: "uppercase",
      letterSpacing: 0.8,
      color: tokens["muted-foreground"],
    };
  },

  // Row container layout per density: a centered icon/label/badge row with the
  // medium pill radius. The comfortable row matches the documented px-3 py-2;
  // compact tightens the vertical inset for dense navigation.
  row(_tokens, density) {
    return {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderRadius: 6,
      paddingHorizontal: 12,
      paddingVertical: density === "compact" ? 6 : 8,
    };
  },

  // The accent fill carried by the active row (and the pressed affordance).
  rowFill(tokens, active) {
    return active ? { backgroundColor: tokens.accent } : null;
  },

  // Label fills the remaining row width (flex-1), truncates to one line, and is
  // medium-weight foreground when active else muted.
  label(tokens, active, density) {
    return {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: "0%",
      ...(density === "compact" ? { fontSize: 12, lineHeight: 16 } : { fontSize: 14, lineHeight: 20 }),
      ...(active ? { fontWeight: "500", color: tokens.foreground } : { color: tokens["muted-foreground"] }),
    };
  },

  // The leading icon glyph: text-base, foreground when active else muted.
  icon(tokens, active) {
    return { fontSize: 16, lineHeight: 24, color: active ? tokens.foreground : tokens["muted-foreground"] };
  },
};

// =============================================================================
// iOS 27 (Liquid Glass) sidebar: grouped rows; the selected row is a CAPSULE
// highlight (radius 9999) filled with the light-gray `accent`, label in
// `accent-foreground`, with the leading icon staying TINTED in `primary`. ~36pt
// rows, ~13pt 600 section headers, press = opacity dim.
// =============================================================================

export const iosSkin: SidebarSkin = {
  pressedFill: false, // iOS dims on press instead of painting the accent fill
  pressedOpacity: 0.8,
  ripple: null,

  // Suppress the react-native-web keyboard-focus blue ring on each row; a real
  // iOS device never paints a hardware focus ring on a sidebar nav row, so the
  // press dim is the only feedback. Web-only: `outlineStyle`/`outlineWidth` are
  // not in RN's ViewStyle (hence the cast), and are a no-op natively. Matches the
  // Input/Textarea/Pagination focus-outline reset.
  focusOutlineReset: { outlineStyle: "none", outlineWidth: 0 } as unknown as ViewStyle,

  column(tokens, frame) {
    const base: ViewStyle = {
      width: 240,
      backgroundColor: tokens.background,
      gap: 16,
      padding: 8,
    };
    if (frame === "bordered") {
      return { ...base, borderRadius: 10, borderWidth: 1, borderColor: tokens.border, overflow: "hidden" };
    }
    return { ...base, borderRightWidth: 1, borderColor: tokens.border };
  },

  group: { gap: 2 },

  // HIG grouped-list header: ~13pt, semibold, secondary/muted, not uppercase.
  sectionTitle(tokens) {
    return {
      paddingHorizontal: 12,
      paddingVertical: 4,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "600",
      color: tokens["muted-foreground"],
    };
  },

  // ~36pt row, fully-rounded CAPSULE (radius 9999) to match the iOS 27 highlight.
  row(_tokens, density) {
    return {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderRadius: 9999,
      paddingHorizontal: 12,
      paddingVertical: density === "compact" ? 6 : 8,
    };
  },

  // The selected row is a capsule highlight filled with the light-gray `accent`.
  rowFill(tokens, active) {
    return active ? { backgroundColor: tokens.accent } : null;
  },

  // Active label reads in `accent-foreground` (on the accent highlight); inactive
  // sits in the standard foreground (HIG list rows are not muted when inactive).
  label(tokens, active, density) {
    return {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: "0%",
      ...(density === "compact" ? { fontSize: 14, lineHeight: 18 } : { fontSize: 15, lineHeight: 20 }),
      fontWeight: active ? "600" : "400",
      color: active ? tokens["accent-foreground"] : tokens.foreground,
    };
  },

  // Icon glyph: always the brand `primary` tint, active or not. iOS 27 keeps the
  // leading glyph tinted even on the selected capsule (HIG glyphs carry the tint).
  icon(tokens, _active) {
    return { fontSize: 17, lineHeight: 22, color: tokens.primary };
  },
};

// =============================================================================
// Android (Material 3 navigation drawer): each nav item is a fully-rounded PILL
// (radius 9999); the active item is a tonal alpha(primary, 0.12) pill with the
// icon + label in brand `primary`; inactive transparent with `foreground`.
// ~56dp item height; press = android_ripple.
// =============================================================================

export const androidSkin: SidebarSkin = {
  pressedFill: false, // Android uses a ripple instead of a pressed fill
  pressedOpacity: null,
  ripple: (tokens) => ({ color: alpha(tokens.primary, 0.12), borderless: false }),

  column(tokens, frame) {
    const base: ViewStyle = {
      width: 240,
      backgroundColor: tokens.background,
      gap: 16,
      // M3 drawer items inset 12dp from the sheet edge so the pill clears it.
      paddingHorizontal: 12,
      paddingVertical: 8,
    };
    if (frame === "bordered") {
      return { ...base, borderRadius: 16, borderWidth: 1, borderColor: tokens.border, overflow: "hidden" };
    }
    return { ...base, borderRightWidth: 1, borderColor: tokens.border };
  },

  group: { gap: 2 },

  // M3 drawer section header: titleSmall ~14sp, medium, muted, padded to align
  // with the pill's inner edge.
  sectionTitle(tokens) {
    return {
      paddingHorizontal: 16,
      paddingVertical: 6,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "500",
      color: tokens["muted-foreground"],
    };
  },

  // ~56dp item: a fully-rounded pill (radius 9999) with 16dp horizontal padding.
  row(_tokens, density) {
    return {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderRadius: 9999,
      paddingHorizontal: 16,
      // ~56dp comfortable / ~48dp compact (paddingVertical + ~24 line box).
      paddingVertical: density === "compact" ? 12 : 16,
    };
  },

  // The active item is a tonal pill: secondaryContainer ~ alpha(primary, 0.12).
  rowFill(tokens, active) {
    return active ? { backgroundColor: alpha(tokens.primary, 0.12) } : null;
  },

  // M3 drawer label: labelLarge ~14sp medium; active carries the brand `primary`,
  // inactive the on-surface `foreground`.
  label(tokens, active, density) {
    return {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: "0%",
      ...(density === "compact" ? { fontSize: 13, lineHeight: 18 } : { fontSize: 14, lineHeight: 20 }),
      fontWeight: "500",
      color: active ? tokens.primary : tokens.foreground,
    };
  },

  // Icon glyph: brand `primary` when active, on-surface `foreground` when not.
  icon(tokens, active) {
    return { fontSize: 18, lineHeight: 24, color: active ? tokens.primary : tokens.foreground };
  },
};
