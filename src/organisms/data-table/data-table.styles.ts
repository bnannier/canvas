import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, alpha } from "../../style/index.js";

// Co-located DataTable styles. The table is laid out as flex rows of equal-width
// flex-1 cells (there is no CSS table primitive). Layout-only fragments are
// static objects; anything that reads a color is a function of the active brand
// tokens (so the header tint, hairlines, stripes, and press tint follow
// light/dark and the glass surface).

export type Density = "compact" | "regular";

// --- wrap (outer) -----------------------------------------------------------

// The table clips its rounded corners so the header tint and bottom hairlines
// stay inside the bordered outline.
export const wrap: ViewStyle = { overflow: "hidden" };

// The `bordered` outline: a rounded 1px border around the whole table (the
// engine had no ring, so the outline is a border). Reads the border token.
export function borderedOutline(tokens: ColorTokens): ViewStyle {
  return { borderRadius: 8, borderWidth: 1, borderColor: tokens.border };
}

// --- header row -------------------------------------------------------------

// The header band: a flex row on the muted surface.
export function headerRow(tokens: ColorTokens): ViewStyle {
  return { flexDirection: "row", backgroundColor: tokens.muted };
}

// Header vertical padding per density. Header sits a touch tighter than the body
// so the label band reads as a header.
export const headerPad: Record<Density, ViewStyle> = {
  compact: { paddingHorizontal: 16, paddingVertical: 6 },
  regular: { paddingHorizontal: 16, paddingVertical: 8 },
};

// A header column label: equal-width, small, muted, uppercase, wide-tracked.
export function headerCell(tokens: ColorTokens): TextStyle {
  return {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    color: tokens["muted-foreground"],
  };
}

// --- selection column -------------------------------------------------------

// The leading checkbox column, kept narrow and fixed (flex-none) so it does not
// eat into the flex-1 content cells.
export const selectCol: ViewStyle = {
  width: 40,
  alignItems: "center",
  justifyContent: "center",
  flexGrow: 0,
  flexShrink: 0,
  flexBasis: "auto",
};

// --- data rows --------------------------------------------------------------

// A data row: a flex row, vertically centered, with a hairline beneath it.
export function dataRow(tokens: ColorTokens): ViewStyle {
  return {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: tokens.border,
  };
}

// The striped tint on alternating (odd-index) rows: muted at 30% opacity.
export function stripeTint(tokens: ColorTokens): ViewStyle {
  return { backgroundColor: alpha(tokens.muted, 0.3) };
}

// The pressed tint for a pressable row (the old `active:bg-accent`).
export function pressTint(tokens: ColorTokens): ViewStyle {
  return { backgroundColor: tokens.accent };
}

// Cell vertical padding per density.
export const cellPad: Record<Density, ViewStyle> = {
  compact: { paddingHorizontal: 16, paddingVertical: 8 },
  regular: { paddingHorizontal: 16, paddingVertical: 12 },
};

// A content cell: equal-width column box (padding added per density).
export const dataCell: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: "0%" };

// The selection cell in a data row: the narrow fixed column plus row padding.
export const selectCell: ViewStyle = { ...selectCol };

// A data cell's text: small body type on the foreground color.
export function cellText(tokens: ColorTokens): TextStyle {
  return { fontSize: 14, lineHeight: 20, color: tokens.foreground };
}
