import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, alpha, surfaceRipple, shape } from "../../style/index.js";
import { platformShape } from "../../style/platform-shape.js";
import { MONO_FONT } from "../../style/mono.js";
import { typeScale } from "../../style/type-scale.js";

// Co-located DataTable skins, one per platform. The table is laid out as flex
// rows of equal-width flex-1 cells (there is no CSS table primitive). Layout-only
// fragments are static; anything that reads a color is a function of the active
// brand tokens (so the header tint, hairlines, stripes, and press tint follow
// light/dark). The surfaced table frame uses static content frost in glass mode;
// its solid skin remains the complete fallback, and data ink stays crisp.
//
// DataTable is a "Light" treatment: ONE structure (header band + flex-row grid)
// with small per-OS touches. The BRAND survives on every platform (the brand
// tokens carry every color; no platform default color leaks in); only the native
// row rhythm, header type/tracking, hairline, stripe fill, outer radius, and
// press feedback change per OS:
//   Web: the v4 hand-off's table (cv-kit-code3.js `O('data-table')`, the code-driven
//     form of `K.def('data-table')`): a standalone table is framed, a 1px `border`
//     hairline (`field-border` when `bordered`) at the table-frame corner over the
//     `card` fill, square inside a parent that frames it (`attached`). The header band
//     sits on `popover` (the hand-off's sf2) over a `border` rule, padded 10 (8 compact),
//     with 500 12/16 sentence-case labels in the muted ink and a 12px sort mark (the
//     active column's arrow in the accent). Rows are 12 tall above and below (8 compact,
//     16 comfortable) at 16 in, 400 13/18 foreground text, a solid `border` rule under
//     each; a stripe is the sunken fill (bg2), a selected or pressed row the accent's soft
//     wash. Header and data cells both carry per-cell horizontal padding so labels never
//     jam, and the wrap holds a 320 width floor.
//   iOS (SwiftUI Table / grouped-list rhythm): a CONTINUOUS outer corner at the
//     iOS card corner; the header reads as regular-case secondary labels (13/18,
//     weight 400, -0.08 tracking: HIG title-style column headings, NOT the
//     uppercase grouped-section-header idiom); ~52pt-rhythm rows (py-15, py-8 compact) with
//     17/22 body text at -0.43 SF tracking; thin ~0.5pt separator hairlines INSET
//     16pt to the content leading edge; stripe = muted @ 24%; press = `secondary`
//     system fill. Below the compact (sm) width the table collapses to its
//     PRIMARY (first) column, matching SwiftUI Table on iPhone.
//   Android: Material 3 has no data table (PLATFORM-REFERENCES.md), so it draws the web
//     table in Roboto, with Material's 48dp touch targets on a pressable row and its row
//     actions and the ripple as press feedback.

export type Density = "compact" | "regular" | "comfortable";

// The contract a platform skin fulfills. The shell owns the structure (header
// band + flex-row grid, the selection column, the striped/pressable rows); the
// skin maps tokens and density to RN style objects and declares its press mode
// (iOS/web tint the row fill, Android ripples).
export interface DataTableSkin {
  /** Web cell editors use clear Liquid Glass without changing field geometry. */
  liquidTextEntry?: boolean;
  /** The outer wrap (clips the rounded corners). */
  wrap: ViewStyle;
  /** The `bordered` rounded outline around the whole table. */
  borderedOutline: (t: ColorTokens) => ViewStyle;
  /**
   * The frame a standalone table draws without `bordered` (its corner, hairline and fill);
   * dropped when `attached` puts the table inside a frame its parent draws. Absent where a
   * standalone table draws no frame (iOS).
   */
  frame?: (t: ColorTokens) => ViewStyle;
  /**
   * Mark the sorted column with an arrow in the accent (the hand-off's sort mark) rather
   * than a muted chevron (SwiftUI Table's).
   */
  sortArrows?: boolean;
  /** The header band (a flex row on the muted surface). */
  headerRow: (t: ColorTokens) => ViewStyle;
  /**
   * Layered over `headerRow` when the table is framed (`attached`, or its own
   * `bordered` outline): the band squares its corners to the frame, whose
   * clipped corners are then the only rounded ones. Null where the band is
   * square already (iOS, Android).
   */
  headerRowAttached: ViewStyle | null;
  /** Header vertical padding per density (horizontal padding lives on the cell). */
  headerPad: Record<Density, ViewStyle>;
  /**
   * A header column label — TYPE ONLY (size/weight/case/tracking/color). The
   * shell owns the header cell BOX (the equal-width flex share, the horizontal
   * padding, the label+sort-icon row), so the label can sit beside a sort
   * indicator without each skin re-declaring the layout.
   */
  headerCell: (t: ColorTokens) => TextStyle;
  /** Size (px) of the sort-direction indicator icon beside a sortable header label. */
  sortIconSize: number;
  /**
   * Muted caption type: the footer's "N selected" count and the built-in
   * `emptyMessage` text.
   */
  captionText: (t: ColorTokens) => TextStyle;
  /** The leading checkbox column (narrow, fixed width). */
  selectCol: ViewStyle;
  /** The selection cell in a data row (the narrow column plus row padding). */
  selectCell: ViewStyle;
  /** A data row (flex row, vertically centered, with a hairline beneath it). */
  dataRow: (t: ColorTokens) => ViewStyle;
  /**
   * A group band (`groups`): the row spanning every column above a group's rows, on
   * the sunken fill, with its padding and the row layout. The shell turns the fill into
   * an ink tint under glass.
   */
  groupBand: (t: ColorTokens) => ViewStyle;
  /** A group band's label type. */
  groupLabel: (t: ColorTokens) => TextStyle;
  /** A group band's count type: the muted monospace meta line. */
  groupCount: (t: ColorTokens) => TextStyle;
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
  /**
   * A `stacks` table's column label above a stacked cell's value: the platform's
   * smallest label role in the muted color, so it stays below any cell text,
   * the kit's small Typography included (the docs' prop descriptions).
   */
  stackedLabel: (t: ColorTokens) => TextStyle;
  /**
   * An inset row separator hairline (iOS lists inset the separator to the content
   * leading edge). When set, the shell renders it as an absolutely-positioned
   * bottom hairline inside each row and the `dataRow` carries no borderBottom;
   * null keeps the full-bleed borderBottom on `dataRow` (web/Android).
   */
  separator: ((t: ColorTokens) => ViewStyle) | null;
  /**
   * Fixed width of the trailing row-actions column (`onRowEdit`/`onRowDelete`):
   * two icon buttons at the platform touch-target size, plus the cell padding.
   */
  actionsColWidth: number;
  /**
   * One icon action button (pencil / bin / save / cancel): a square box at the
   * platform touch-target size (web 28, iOS 44pt, Android 48dp), centered.
   */
  actionButton: ViewStyle;
  /** Size (px) of the glyphs inside the trailing action buttons. */
  actionIconSize: number;
  /**
   * The inline cell editor (`inlineEdit` / pencil-opened row editing): the
   * platform's cell type inside a primary-ringed field on the background fill.
   */
  editInput: (t: ColorTokens) => TextStyle;
  /** The wash over a row while it is in pencil-opened edit mode. */
  editTint: (t: ColorTokens) => ViewStyle;
  /**
   * Collapse a multicolumn table to its PRIMARY (first) column below the compact
   * (`sm`) width, matching SwiftUI Table's compact-width behavior on iPhone. iOS
   * only; web/Android render every column at every width.
   */
  collapsesToPrimaryColumn?: boolean;
  /**
   * Minimum height for a pressable row so the tap target clears the platform
   * minimum (iOS 44pt / M3 48dp), applied only when `onRowPress` is set. Web omits
   * it (no touch-target requirement on the pointer web).
   */
  pressableMinHeight?: number;
  /** Android ripple over a pressable row; null on iOS/web. */
  ripple: ((t: ColorTokens) => { color: string; borderless: boolean }) | null;
}

// --- shared layout fragments (identical structure across platforms) ---------

// The table clips its rounded corners so the header tint and bottom hairlines
// stay inside the bordered outline. A 320px width floor (the `xs` step of the
// width scale) keeps the table usable in content-sized contexts (a
// shrink-to-fit Card): without it the flex-1 columns collapse to the header
// labels' min-content and jam together. In a bounded parent the table still
// stretches to fill — minWidth only sets the floor, it does not cap growth.
const WRAP: ViewStyle = { overflow: "hidden", minWidth: 320 };

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

// The group band: the sunken fill (the hand-off's bg2) from the start edge, the label
// and its adornment and count in a row. Each skin adds its own padding and hairline.
const sunken = (t: ColorTokens): ViewStyle => ({ flexDirection: "row", alignItems: "center", backgroundColor: t["surface-sunken"] ?? t.muted });
// The count: the muted monospace meta line (the hand-off's 400 12 px mono in tx3).
const groupCount = (t: ColorTokens): TextStyle => ({ fontFamily: MONO_FONT, fontSize: 12, lineHeight: 16, fontWeight: "400", color: t["subtle-foreground"] ?? t["muted-foreground"] });

// A row action's icon button corner: the web's control corner, and iOS's too, since no
// iOS table control draws a row's icon button.
const ACTION_BUTTON_CORNER: ViewStyle = { borderRadius: shape.web.control };

// ---------- Web: the hand-off's framed table ----------
// A standalone table is framed at the table-frame corner over the card fill; the header
// band on `popover` squares to the frame, its labels 500 12 in the muted ink; rows are
// 13/18 foreground text over a solid hairline, 12 above and below.
const frameAt = (t: ColorTokens, edge: string): ViewStyle => ({
  borderRadius: platformShape.web.tableFrame,
  borderWidth: 1,
  borderColor: edge,
  backgroundColor: t.card,
});
const subtle = (t: ColorTokens): string => t["subtle-foreground"] ?? t["muted-foreground"];

export const webSkin: DataTableSkin = {
  liquidTextEntry: true,
  wrap: WRAP,
  borderedOutline: (t) => frameAt(t, t["field-border"] ?? t.border),
  frame: (t) => frameAt(t, t.border),
  sortArrows: true,
  // The band on popover (the hand-off's sf2) over a border rule; the frame clips its corners.
  headerRow: (t) => ({ flexDirection: "row", backgroundColor: t.popover, borderBottomWidth: 1, borderColor: t.border }),
  headerRowAttached: null,
  headerPad: {
    compact: { paddingVertical: 8 },
    regular: { paddingVertical: 10 },
    comfortable: { paddingVertical: 10 },
  },
  // Type only; the shell's header cell box carries the flex share and the px-16
  // horizontal padding so headings sit over their columns. Sentence case, 500 12.
  headerCell: (t) => ({
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    color: t["muted-foreground"],
  }),
  sortIconSize: 12,
  // The empty message and the selection count: 400 13 in the subtle ink.
  captionText: (t) => ({ fontSize: 13, lineHeight: 18, color: subtle(t) }),
  selectCol: SELECT_COL,
  selectCell: { ...SELECT_COL },
  dataRow: (t) => ({
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: t.border,
  }),
  // The hand-off's props-table band (Component.dc.html, Props): 12 / 16 / 8 padding on
  // the sunken fill, a solid hairline beneath it, the label 600 13 px.
  groupBand: (t) => ({ ...sunken(t), paddingTop: 12, paddingHorizontal: 16, paddingBottom: 8, borderBottomWidth: 1, borderColor: t.border }),
  groupLabel: (t) => ({ fontSize: 13, lineHeight: 18, fontWeight: "600", color: t.foreground }),
  groupCount,
  // A stripe is the sunken fill (the hand-off's bg2).
  stripeTint: (t) => ({ backgroundColor: t["surface-sunken"] ?? t.muted }),
  // A selected (or pressed) row takes the accent's soft wash.
  pressTint: (t) => ({ backgroundColor: t["primary-soft"] }),
  cellPad: {
    compact: { paddingHorizontal: 16, paddingVertical: 8 },
    regular: { paddingHorizontal: 16, paddingVertical: 12 },
    comfortable: { paddingHorizontal: 16, paddingVertical: 16 },
  },
  dataCell: DATA_CELL,
  cellText: (t) => ({ fontSize: 13, lineHeight: 18, fontWeight: "400", color: t.foreground }),
  // Dark Factory's caption role.
  stackedLabel: (t) => ({ ...typeScale.caption, color: t["muted-foreground"] }),
  separator: null,
  // Row actions: 36px icon buttons (the pointer web needs no touch minimum);
  // two of them plus the gap and px-12 cell padding set the 108px column.
  actionsColWidth: 108,
  actionButton: { width: 36, height: 36, ...ACTION_BUTTON_CORNER, alignItems: "center", justifyContent: "center" },
  actionIconSize: 16,
  // The inline editor: the 13/18 cell type inside a primary-ringed 32px field.
  editInput: (t) => ({
    alignSelf: "stretch",
    height: 32,
    borderRadius: shape.web.field,
    borderWidth: 1,
    borderColor: t.primary,
    backgroundColor: t.card,
    color: t.foreground,
    paddingHorizontal: 10,
    paddingVertical: 0,
    fontSize: 13,
    lineHeight: 18,
  }),
  editTint: (t) => ({ backgroundColor: alpha(t.primary, 0.06) }),
  ripple: null,
};

// ---------- iOS (SwiftUI Table / grouped-list rhythm) ----------
// The header reads like SwiftUI Table column headings (title-style / regular
// case, 13pt regular, secondary color — HIG "descriptive column headings ...
// title-style capitalization", NOT the uppercase grouped-section-header idiom);
// rows sit on the iOS one-line list rhythm (52pt) with 17pt body text and thin
// (~0.5pt) separator hairlines inset 16pt to the content leading edge; a continuous
// outer corner at the iOS card corner; pressed rows take the iOS `secondary` system fill (no
// ripple). Below the compact width the table collapses to its primary column.
export const iosSkin: DataTableSkin = {
  wrap: WRAP,
  borderedOutline: (t) => ({ borderRadius: shape.ios.card, borderCurve: "continuous", borderWidth: 1, borderColor: t.border }),
  headerRow: (t) => ({ flexDirection: "row", backgroundColor: t.muted }),
  headerRowAttached: null,
  headerPad: {
    compact: { paddingVertical: 6 },
    regular: { paddingVertical: 8 },
    comfortable: { paddingVertical: 10 },
  },
  headerCell: (t) => ({
    fontSize: 13,
    lineHeight: 18,
    // Title-style secondary label (SwiftUI Table column heading): regular weight,
    // sentence/title case (no textTransform), SF Pro Text 13pt tracking.
    fontWeight: "400",
    letterSpacing: -0.08,
    color: t["muted-foreground"],
  }),
  sortIconSize: 14,
  captionText: (t) => ({ fontSize: 13, lineHeight: 18, letterSpacing: -0.08, color: t["muted-foreground"] }),
  selectCol: SELECT_COL,
  selectCell: { ...SELECT_COL },
  dataRow: () => ({
    flexDirection: "row",
    alignItems: "center",
    // The hairline is a separate inset element (skin.separator), not a full-bleed
    // borderBottom, so it aligns with the content leading edge (iOS list idiom).
  }),
  // No iOS table control draws a group band, so it is the web's band in the platform
  // face, at the 13 pt footnote size with SF tracking; the inset separators stay the rows'.
  groupBand: (t) => ({ ...sunken(t), paddingTop: 12, paddingHorizontal: 16, paddingBottom: 8 }),
  groupLabel: (t) => ({ fontSize: 13, lineHeight: 18, fontWeight: "600", letterSpacing: -0.08, color: t.foreground }),
  groupCount,
  stripeTint: (t) => ({ backgroundColor: alpha(t.muted, 0.24) }),
  // The iOS system row highlight on press.
  pressTint: (t) => ({ backgroundColor: t.secondary }),
  cellPad: {
    compact: { paddingHorizontal: 16, paddingVertical: 8 },
    // 22pt line + 2x15 = 52pt, the iOS one-line list/table row rhythm.
    regular: { paddingHorizontal: 16, paddingVertical: 15 },
    // 22pt line + 2x19 = 60pt, the roomier two-line-ish rhythm.
    comfortable: { paddingHorizontal: 16, paddingVertical: 19 },
  },
  dataCell: DATA_CELL,
  cellText: (t) => ({ fontSize: 17, lineHeight: 22, letterSpacing: -0.43, color: t.foreground }),
  // HIG Caption 2: 11/13 regular at +0.06 tracking, the secondary label color.
  stackedLabel: (t) => ({ fontSize: 11, lineHeight: 13, fontWeight: "400", letterSpacing: 0.06, color: t["muted-foreground"] }),
  // Thin (~0.5pt) separator inset 16pt from the leading edge to align with the
  // content (iOS list/table separators do not run full-bleed).
  separator: (t) => ({ position: "absolute", left: 16, right: 0, bottom: 0, height: 0.5, backgroundColor: t.border }),
  // Row actions: 44pt HIG touch targets; two of them plus the gap and px-12
  // cell padding set the column width.
  actionsColWidth: 116,
  actionButton: { width: 44, height: 44, ...ACTION_BUTTON_CORNER, alignItems: "center", justifyContent: "center" },
  actionIconSize: 17,
  // The inline editor: the 17/22 SF cell type inside a primary-ringed 32pt field
  // with the continuous iOS corner.
  editInput: (t) => ({
    alignSelf: "stretch",
    height: 32,
    borderRadius: shape.ios.field,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: t.primary,
    backgroundColor: t.background,
    color: t.foreground,
    paddingHorizontal: 8,
    paddingVertical: 0,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.43,
  }),
  editTint: (t) => ({ backgroundColor: alpha(t.primary, 0.06) }),
  collapsesToPrimaryColumn: true,
  pressableMinHeight: 44,
  ripple: null,
};

// ---------- Android: the web table in Roboto ----------
// Material 3 has no data table, so the hand-off's web table is drawn here too, with
// Material's touch targets: a pressable row clears 48dp, the row actions are 48dp state
// layers (the shell ripples them with controlRipple), and a pressed row or header ripples
// with the on-surface state layer (surfaceRipple) instead of a tint.
export const androidSkin: DataTableSkin = {
  ...webSkin,
  liquidTextEntry: undefined,
  // Row actions: 48dp M3 touch targets on a circular state layer; two plus the gap and
  // px-12 padding.
  actionsColWidth: 124,
  actionButton: { width: 48, height: 48, borderRadius: shape.android.control, alignItems: "center", justifyContent: "center" },
  actionIconSize: 18,
  pressableMinHeight: 48,
  ripple: (t) => surfaceRipple(t),
};
