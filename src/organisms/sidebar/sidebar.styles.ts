import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens } from "../../style/index.js";

// Co-located Sidebar styles. Layout-only fragments are static objects; anything
// that reads a color is a function of the active tokens (so the panel, rows, and
// labels follow light/dark and read as glass when the ThemeProvider's surface is
// "glass"). Grouped by the component's structure: frame (the outer column),
// section group + heading, and the nav row (container, label, icon) per density.

export type Density = "default" | "compact";
export type Frame = "flush" | "bordered";

// --- frame: the outer navigation column -------------------------------------

// Fixed-width column with the standard inset (gap-4 p-2) on the background fill.
// The flush frame docks against the page with a single right hairline; the
// bordered/floating frame lifts it into a fully ruled, rounded, clipped card.
export function column(tokens: ColorTokens, frame: Frame): ViewStyle {
  const base: ViewStyle = {
    width: 240,
    backgroundColor: tokens.background,
    gap: 16,
    padding: 8,
  };
  if (frame === "bordered") {
    return {
      ...base,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: tokens.border,
      overflow: "hidden",
    };
  }
  return { ...base, borderRightWidth: 1, borderColor: tokens.border };
}

// --- section group + heading ------------------------------------------------

// A titled group of nav rows.
export const group: ViewStyle = { gap: 4 };

// The uppercase, muted, wide-tracked section heading above a group.
export function sectionTitle(tokens: ColorTokens): TextStyle {
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
}

// --- nav row ----------------------------------------------------------------

// Row container layout (shared across densities): a centered icon/label/badge
// row with the medium pill radius. The press affordance (the old
// `active:bg-accent`) is applied by the component's Pressable; the active-row
// fill is applied by rowActiveFill.
export const rowBase: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
  borderRadius: 6,
};

// Row padding per density. The comfortable row matches the documented px-3 py-2;
// compact tightens the vertical inset for dense navigation.
export const rowDensity: Record<Density, ViewStyle> = {
  default: { paddingHorizontal: 12, paddingVertical: 8 },
  compact: { paddingHorizontal: 12, paddingVertical: 6 },
};

// The accent fill carried by the active row (and the pressed affordance).
export function rowAccentFill(tokens: ColorTokens): ViewStyle {
  return { backgroundColor: tokens.accent };
}

// Label fills the remaining row width (flex-1) and truncates to one line.
export const labelBase: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: "0%" };

// Label type per density.
export const labelDensity: Record<Density, TextStyle> = {
  default: { fontSize: 14, lineHeight: 20 },
  compact: { fontSize: 12, lineHeight: 16 },
};

// Label color: the active row is medium-weight foreground; the rest sit muted.
export function labelColor(tokens: ColorTokens, activeRow: boolean): TextStyle {
  return activeRow
    ? { fontWeight: "500", color: tokens.foreground }
    : { color: tokens["muted-foreground"] };
}

// The leading icon glyph: text-base, foreground when active else muted.
export function iconText(tokens: ColorTokens, activeRow: boolean): TextStyle {
  return {
    fontSize: 16,
    lineHeight: 24,
    color: activeRow ? tokens.foreground : tokens["muted-foreground"],
  };
}
