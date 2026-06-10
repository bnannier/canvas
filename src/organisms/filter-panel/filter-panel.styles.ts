import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens } from "../../style/index.js";

// Co-located FilterPanel styles. Layout-only fragments (the fixed panel width,
// the header/group/row rows, the density gaps and paddings) are static objects;
// the surface fill + border reads the active tokens (so `bordered` follows
// light/dark and goes translucent under glass). Density (compact vs. base) is
// resolved by the component and selects the matching padding/gap fragment.

export type Density = "compact" | "base";

// --- panel surface ----------------------------------------------------------

// Fixed panel width (w-[280px]) and column layout, shared by both surfaces.
export const panelBase: ViewStyle = { width: 280, flexDirection: "column" };

// `bordered` wraps the panel as a rounded card: a border on the card fill. The
// card token goes translucent under glass, so don't hardcode its hex.
export function borderedSurface(tokens: ColorTokens): ViewStyle {
  return { borderRadius: 8, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.card };
}

// Panel inset per density (p-3 compact / p-4 base).
export const panelPad: Record<Density, ViewStyle> = {
  compact: { padding: 12 },
  base: { padding: 16 },
};

// Vertical rhythm between the header and groups, and between groups
// (gap-3 compact / gap-5 base).
export const panelStack: Record<Density, ViewStyle> = {
  compact: { gap: 12 },
  base: { gap: 20 },
};

// Row spacing inside a group, and between a group's title and its options
// (gap-1.5 compact / gap-2 base). Shared by the group column and its option list.
export const groupGap: Record<Density, ViewStyle> = {
  compact: { gap: 6 },
  base: { gap: 8 },
};

// --- header -----------------------------------------------------------------

// Header row: title cluster on the left, the Clear action on the right.
export const headerRow: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
};

// Title + active-count cluster (a row with a small gap).
export const titleCluster: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 8 };

// "Filters" heading: small, semibold, on the foreground token.
export function titleText(tokens: ColorTokens): TextStyle {
  return { fontSize: 14, lineHeight: 20, fontWeight: "600", color: tokens.foreground };
}

// --- groups -----------------------------------------------------------------

// A group column (the title above its option list).
export const groupColumn: ViewStyle = { flexDirection: "column" };

// Group heading: extra-small, medium, uppercase, wide tracking, muted.
export function groupTitle(tokens: ColorTokens): TextStyle {
  return {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    color: tokens["muted-foreground"],
  };
}

// One option row: checkbox on the left, optional count badge on the right.
export const optionRow: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
};
