import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, alpha } from "../../style/index.js";

// Co-located DataTable skins, one per platform. The table is laid out as flex
// rows of equal-width flex-1 cells (there is no CSS table primitive). Layout-only
// fragments are static; anything that reads a color is a function of the active
// brand tokens (so the header tint, hairlines, stripes, and press tint follow
// light/dark — the table is a CONTENT-LAYER surface, so it stays SOLID and never
// goes glass).
//
// DataTable is a "Light" treatment: ONE structure (header band + flex-row grid)
// with small per-OS touches. The BRAND survives on every platform (the tokens
// carry the indigo brand; no platform default color leaks in); only the native
// row rhythm, header type/tracking, hairline, stripe fill, outer radius, and
// press feedback change per OS:
//   Web (the established Canvas / shadcn look, lifted VERBATIM): an 8-radius
//     bordered wrap; header band on `muted` with px-16/py-8 (py-6 compact),
//     12/16 uppercase muted-foreground labels at +0.4 tracking; data cells
//     px-16/py-12 (py-8 compact) with 14/20 foreground text; 1px `border`
//     hairline under each row; stripe = muted @ 30%; press = `accent` fill.
//   iOS (SwiftUI Table / grouped-list rhythm): a 10-radius continuous outer
//     corner; the header reads as a grouped-list section header (13/18, weight
//     600, uppercase, +0.6 tracking, secondary color); ~44pt-rhythm rows
//     (py-12, py-8 compact) with 17/22 body text; thin ~0.5pt separator color
//     hairlines; stripe = muted @ 24%; press = `secondary` system fill.
//   Android (Material 3 list rhythm; M3 has no data table, so the M3 LIST
//     conventions apply): a flat 8-radius wrap (M3 surfaces are flat, no
//     shadow); the header is an M3 label band (12/16, weight 500, +0.5
//     tracking, NOT uppercased — M3 labels are sentence/normal case); ~48dp
//     rows (py-14, py-10 compact) with 16/24 body-large text; 1px
//     outline-variant hairlines; stripe = surface-variant (muted) @ 20%; press
//     = an android_ripple (alpha(primary, 0.12) state layer).

export type Density = "compact" | "regular";

// The contract a platform skin fulfills. The shell owns the structure (header
// band + flex-row grid, the selection column, the striped/pressable rows); the
// skin maps tokens and density to RN style objects and declares its press mode
// (iOS/web tint the row fill, Android ripples).
export interface DataTableSkin {
  /** The outer wrap (clips the rounded corners). */
  wrap: ViewStyle;
  /** The `bordered` rounded outline around the whole table. */
  borderedOutline: (t: ColorTokens) => ViewStyle;
  /** The header band (a flex row on the muted surface). */
  headerRow: (t: ColorTokens) => ViewStyle;
  /** Header vertical/horizontal padding per density. */
  headerPad: Record<Density, ViewStyle>;
  /** A header column label (equal-width, the platform's label type). */
  headerCell: (t: ColorTokens) => TextStyle;
  /** The leading checkbox column (narrow, fixed width). */
  selectCol: ViewStyle;
  /** The selection cell in a data row (the narrow column plus row padding). */
  selectCell: ViewStyle;
  /** A data row (flex row, vertically centered, with a hairline beneath it). */
  dataRow: (t: ColorTokens) => ViewStyle;
  /** The striped tint on alternating (odd-index) rows. */
  stripeTint: (t: ColorTokens) => ViewStyle;
  /** The pressed tint for a pressable row (iOS/web tint via this; Android ripples). */
  pressTint: (t: ColorTokens) => ViewStyle;
  /** Cell vertical/horizontal padding per density. */
  cellPad: Record<Density, ViewStyle>;
  /** A content cell (equal-width column box; padding added per density). */
  dataCell: ViewStyle;
  /** A data cell's text (the platform's body type on the foreground color). */
  cellText: (t: ColorTokens) => TextStyle;
  /** Android ripple over a pressable row; null on iOS/web. */
  ripple: ((t: ColorTokens) => { color: string; borderless: boolean }) | null;
}

// --- shared layout fragments (identical structure across platforms) ---------

// The table clips its rounded corners so the header tint and bottom hairlines
// stay inside the bordered outline.
const WRAP: ViewStyle = { overflow: "hidden" };

// The leading checkbox column, kept narrow and fixed (flex-none) so it does not
// eat into the flex-1 content cells.
const SELECT_COL: ViewStyle = {
  width: 40,
  alignItems: "center",
  justifyContent: "center",
  flexGrow: 0,
  flexShrink: 0,
  flexBasis: "auto",
};

// A content cell: equal-width column box (padding added per density).
const DATA_CELL: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: "0%" };

// ---------- Web: the established Canvas look (lifted VERBATIM) ----------
export const webSkin: DataTableSkin = {
  wrap: WRAP,
  borderedOutline: (t) => ({ borderRadius: 8, borderWidth: 1, borderColor: t.border }),
  headerRow: (t) => ({ flexDirection: "row", backgroundColor: t.muted }),
  headerPad: {
    compact: { paddingHorizontal: 16, paddingVertical: 6 },
    regular: { paddingHorizontal: 16, paddingVertical: 8 },
  },
  headerCell: (t) => ({
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    color: t["muted-foreground"],
  }),
  selectCol: SELECT_COL,
  selectCell: { ...SELECT_COL },
  dataRow: (t) => ({
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: t.border,
  }),
  stripeTint: (t) => ({ backgroundColor: alpha(t.muted, 0.3) }),
  pressTint: (t) => ({ backgroundColor: t.accent }),
  cellPad: {
    compact: { paddingHorizontal: 16, paddingVertical: 8 },
    regular: { paddingHorizontal: 16, paddingVertical: 12 },
  },
  dataCell: DATA_CELL,
  cellText: (t) => ({ fontSize: 14, lineHeight: 20, color: t.foreground }),
  ripple: null,
};

// ---------- iOS (SwiftUI Table / grouped-list rhythm) ----------
// The header reads like a grouped-list section header (uppercase, tracked,
// secondary); rows sit on the iOS ~44pt rhythm with 17pt body text and thin
// (~0.5pt) separator hairlines; a 10pt continuous outer corner; pressed rows
// take the iOS `secondary` system fill (no ripple).
export const iosSkin: DataTableSkin = {
  wrap: WRAP,
  borderedOutline: (t) => ({ borderRadius: 10, borderWidth: 1, borderColor: t.border }),
  headerRow: (t) => ({ flexDirection: "row", backgroundColor: t.muted }),
  headerPad: {
    compact: { paddingHorizontal: 16, paddingVertical: 6 },
    regular: { paddingHorizontal: 16, paddingVertical: 8 },
  },
  headerCell: (t) => ({
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: t["muted-foreground"],
  }),
  selectCol: SELECT_COL,
  selectCell: { ...SELECT_COL },
  dataRow: (t) => ({
    flexDirection: "row",
    alignItems: "center",
    // A thin iOS-style hairline separator.
    borderBottomWidth: 0.5,
    borderColor: t.border,
  }),
  stripeTint: (t) => ({ backgroundColor: alpha(t.muted, 0.24) }),
  // The iOS system row highlight on press.
  pressTint: (t) => ({ backgroundColor: t.secondary }),
  cellPad: {
    compact: { paddingHorizontal: 16, paddingVertical: 8 },
    regular: { paddingHorizontal: 16, paddingVertical: 12 },
  },
  dataCell: DATA_CELL,
  cellText: (t) => ({ fontSize: 17, lineHeight: 22, color: t.foreground }),
  ripple: null,
};

// ---------- Android (Material 3 list rhythm) ----------
// M3 has no data table; the M3 LIST conventions apply. The header is an M3 label
// band (NOT uppercased — M3 labels are normal case), rows sit on the ~48dp M3
// rhythm with 16sp body-large text and 1px outline-variant hairlines, the wrap
// is flat (M3 surfaces carry no shadow), and press = an android_ripple
// (alpha(primary, 0.12) state layer).
export const androidSkin: DataTableSkin = {
  wrap: WRAP,
  borderedOutline: (t) => ({ borderRadius: 8, borderWidth: 1, borderColor: t.border }),
  headerRow: (t) => ({ flexDirection: "row", backgroundColor: t.muted }),
  headerPad: {
    compact: { paddingHorizontal: 16, paddingVertical: 8 },
    regular: { paddingHorizontal: 16, paddingVertical: 10 },
  },
  headerCell: (t) => ({
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    letterSpacing: 0.5,
    color: t["muted-foreground"],
  }),
  selectCol: SELECT_COL,
  selectCell: { ...SELECT_COL },
  dataRow: (t) => ({
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: t.border,
  }),
  stripeTint: (t) => ({ backgroundColor: alpha(t.muted, 0.2) }),
  // Android tints the row via the ripple, not a fill; this is unused there.
  pressTint: (t) => ({ backgroundColor: alpha(t.primary, 0.12) }),
  cellPad: {
    compact: { paddingHorizontal: 16, paddingVertical: 10 },
    regular: { paddingHorizontal: 16, paddingVertical: 14 },
  },
  dataCell: DATA_CELL,
  cellText: (t) => ({ fontSize: 16, lineHeight: 24, color: t.foreground }),
  ripple: (t) => ({ color: alpha(t.primary, 0.12), borderless: false }),
};
