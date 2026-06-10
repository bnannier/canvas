import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens } from "../../style/index.js";

// Co-located Calendar styles. Layout-only fragments are static objects; anything
// that reads a color is a function of the active tokens (so the surface, today/
// selected highlight, and text follow light/dark and read as glass when the
// ThemeProvider's surface is "glass", since tokens.card is swapped translucent).
//
// Density (compact vs default) drives the cell metrics: the grid width is exactly
// seven cell widths so the flex-wrap row breaks after the seventh cell.

export type Density = "compact" | "default";

// --- cell metrics per density ----------------------------------------------

/** Per-density box sizes, in px. Mirrors the old `w-*`/`h-*` cell classes. */
export interface CellMetrics {
  /** A day cell (square): `w-8 h-8` (compact) / `w-9 h-9` (default). */
  cell: ViewStyle;
  /** The grid width = seven cell widths: `w-[224px]` / `w-[252px]`. */
  gridWidth: number;
  /** A weekday head cell: `w-8 h-7` (compact) / `w-9 h-8` (default). */
  head: ViewStyle;
  /** The day-label type scale: `text-xs` (compact) / `text-sm` (default). */
  label: TextStyle;
}

export const metrics: Record<Density, CellMetrics> = {
  compact: {
    cell: { width: 32, height: 32 },
    gridWidth: 224,
    head: { width: 32, height: 28 },
    label: { fontSize: 12, lineHeight: 16 },
  },
  default: {
    cell: { width: 36, height: 36 },
    gridWidth: 252,
    head: { width: 36, height: 32 },
    label: { fontSize: 14, lineHeight: 20 },
  },
};

// --- container --------------------------------------------------------------

// `self-start rounded-lg border p-3`.
export const containerBase: ViewStyle = {
  alignSelf: "flex-start",
  borderRadius: 8,
  borderWidth: 1,
  padding: 12,
};

// `border-border bg-card`: the surface fill + border. tokens.card goes
// translucent under glass.
export function containerSurface(tokens: ColorTokens): ViewStyle {
  return { borderColor: tokens.border, backgroundColor: tokens.card };
}

// --- header -----------------------------------------------------------------

// `mb-2 flex-row items-center justify-between`.
export const header: ViewStyle = {
  marginBottom: 8,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
};

// A ghost chevron button: `h-7 w-7 items-center justify-center rounded-md
// bg-transparent`. The `active:opacity-90` press feedback is applied by the
// component's Pressable.
export const chevron: ViewStyle = {
  height: 28,
  width: 28,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 6,
  backgroundColor: "transparent",
};

// The chevron glyph: `text-sm text-foreground`.
export function chevronText(tokens: ColorTokens): TextStyle {
  return { fontSize: 14, lineHeight: 20, color: tokens.foreground };
}

// The month/year label: `text-sm font-medium text-foreground`.
export function monthLabel(tokens: ColorTokens): TextStyle {
  return { fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground };
}

// --- grid -------------------------------------------------------------------

// The weekday row and the day grid: `flex-row flex-wrap` at a fixed width so the
// wrap lands exactly seven cells per row (the width is supplied per density).
export const grid: ViewStyle = { flexDirection: "row", flexWrap: "wrap" };

// A weekday head cell interior: `items-center justify-center` (size from metrics).
export const headCell: ViewStyle = { alignItems: "center", justifyContent: "center" };

// The weekday label: `text-xs font-medium text-muted-foreground`.
export function weekdayLabel(tokens: ColorTokens): TextStyle {
  return { fontSize: 12, lineHeight: 16, fontWeight: "500", color: tokens["muted-foreground"] };
}

// A leading-blank or day cell interior: `items-center justify-center`
// (size from metrics; day cells add `rounded-full`).
export const dayCellBase: ViewStyle = {
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 9999,
};

// The highlighted (today/selected) day fill: `bg-primary`.
export function dayCellHighlight(tokens: ColorTokens): ViewStyle {
  return { backgroundColor: tokens.primary };
}

// The day label color/weight: highlighted -> `font-medium text-primary-foreground`,
// otherwise `text-foreground` (the size comes from metrics.label).
export function dayLabel(tokens: ColorTokens, highlighted: boolean): TextStyle {
  return highlighted
    ? { fontWeight: "500", color: tokens["primary-foreground"] }
    : { color: tokens.foreground };
}
