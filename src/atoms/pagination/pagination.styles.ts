import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, type TouchTargetSkin, MONO_FONT, alpha, platformMinTarget } from "../../style/index.js";
import { platformShape } from "../../style/platform-shape.js";
import { webHover } from "../../style/hover.js";

// The Pagination skin, the v4 hand-off's pager (its `pagination` renderer). Neither iOS nor
// Material 3 ships a numbered pagination (PLATFORM-REFERENCES.md), so every platform takes
// the web look:
//   - every cell is a rounded square at the size's step (28 / 34 / 40), its corner the
//     pager's own web role (`platformShape.web.pageCell`, the renderer's 8);
//   - a resting page is a 1px `border` hairline around its number, set in 500 13px mono
//     numerals in the `muted-foreground` ink;
//   - the current page is the accent fill under its own ink (`primary` under
//     `primary-foreground`) with the accent's glow beneath it (0 6px 16px -6px `glow`);
//   - Previous and Next are the same hairline cell around a 14px chevron and a 500 13px
//     "Prev" / "Next" label (the label dropped at the small size and in the compact row);
//   - the truncation gap is an ellipsis in the `subtle-foreground` ink, s / 1.5 wide;
//   - the rows-per-page trigger is the same cell on the 3:1 `input` edge around its value
//     in 400 13px and a 12px chevron-down, 6 apart;
//   - the counts ("Page 2 of 12", "Rows per page") are 400 13px `muted-foreground`.
// A resting cell washes `secondary` on hover at once on the web (never the current page;
// native pointer hover waits on the owner, so the shared skin declares it through
// webHover). Disabled is the hand-off's dim: the whole pager, or a single arrow at either
// end, at opacity .4.
//
// The press feedback mechanism stays each platform's own: the ripple is Android's (a
// no-op elsewhere) and the dim the rest's (pressDim skips it on Android), at 0.9.
// The skin declares each platform's minimum touch target (44pt HIG, 48dp Material) and
// the shell extends the touch area toward it with measured hitSlop; where the cells sit
// 6px apart (the pages, and the arrows beside them) it grows vertically only
// (src/style/touch-target.ts).

export type Size = "small" | "default" | "large";

export interface PaginationSkin extends TouchTargetSkin {
  /** A Previous/Next arrow: the box behind the chevron and its label. */
  controlBox: (t: ColorTokens) => ViewStyle;
  /** A numbered page. The current page carries the accent fill and its glow. */
  pageBox: (t: ColorTokens, selected: boolean) => ViewStyle;
  /** The rows-per-page trigger box (value + chevron). */
  selectorBox: (t: ColorTokens) => ViewStyle;
  /** An arrow's label, and its chevron's ink (its color). */
  controlLabel: (t: ColorTokens) => TextStyle;
  /** A page number: the accent's ink on the fill when current. */
  pageLabel: (t: ColorTokens, selected: boolean) => TextStyle;
  /** The rows-per-page trigger's value. */
  selectorLabel: (t: ColorTokens) => TextStyle;
  /** The counts, and the ink (its color) of the selector's chevron. */
  mutedLabel: (t: ColorTokens) => TextStyle;
  /** The ink (its color) of the truncation gap's ellipsis. */
  gapLabel: (t: ColorTokens) => TextStyle;
  /** The opacity of a disabled pager, or of a disabled arrow in an enabled one. */
  disabledOpacity: number;
  /** The instant hover look of a resting cell (never the current page, never while disabled); null where there is none. */
  hover: ((t: ColorTokens) => ViewStyle) | null;
  /** The press dim where there is no ripple (see pressDim). */
  pressedOpacity: number;
  /** The Android ripple over a pressed cell (a no-op elsewhere). */
  ripple: ((t: ColorTokens, selected: boolean) => { color: string; borderless: boolean }) | null;
}

// --- sizes (identical across platforms) --------------------------------------

/** The cell's step per size: the hand-off's 28 / 34 / 40. */
export const cellStep: Record<Size, number> = { small: 28, default: 34, large: 40 };

// A page cell per size: a square at the step for a short number. A number of three or
// more digits takes the hand-off's 10px inset and widens past the square.
export const itemSize: Record<Size, ViewStyle> = {
  small: { height: cellStep.small, minWidth: cellStep.small },
  default: { height: cellStep.default, minWidth: cellStep.default },
  large: { height: cellStep.large, minWidth: cellStep.large },
};
export const widePage: ViewStyle = { paddingHorizontal: 10 };

// A Previous/Next arrow: the step's height, at least as wide as it is tall, inset 10 around
// its chevron (and its label, beside the chevron, 4 away).
export const arrowSize: Record<Size, ViewStyle> = {
  small: { height: cellStep.small, minWidth: cellStep.small, paddingHorizontal: 10, gap: 4 },
  default: { height: cellStep.default, minWidth: cellStep.default, paddingHorizontal: 10, gap: 4 },
  large: { height: cellStep.large, minWidth: cellStep.large, paddingHorizontal: 10, gap: 4 },
};

// The rows-per-page trigger: the step's height, inset 10 around its value and chevron.
export const selectorSize: Record<Size, ViewStyle> = {
  small: { height: cellStep.small, paddingHorizontal: 10 },
  default: { height: cellStep.default, paddingHorizontal: 10 },
  large: { height: cellStep.large, paddingHorizontal: 10 },
};

// The hand-off sets every label at 13px whatever the cell's size.
const LABEL: TextStyle = { fontSize: 13, lineHeight: 18 };
export const labelSize: Record<Size, TextStyle> = { small: LABEL, default: LABEL, large: LABEL };

// Chevron px per size: the hand-off's 14 on the arrows.
export const iconSize: Record<Size, number> = { small: 14, default: 14, large: 14 };
// The selector's chevron-down.
export const selectorIconSize = 12;

/** Whether an arrow carries its "Prev" / "Next" label: never at the small size. */
export const arrowLabelled = (size: Size): boolean => size !== "small";

// --- layout fragments (color-free; identical across platforms) ----------------

// Row of [prev, numbers, next] for the numbered default.
export const numberedRow: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 6 };

// Compact row: Prev/Next bracketing the "Page X of N" label.
export const compactRow: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 10 };

// With-size outer row: the selector group, the indicator, and the controls.
export const withSizeRow: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 16 };

// The "Rows per page" label + selector cluster.
export const selectorCluster: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 10 };

// The Prev/Next pair inside the with-size row.
export const controlPair: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 6 };

// The truncation gap's glyph: the text ellipsis "…" at the page's 400 16 (the renderer's
// span sets no face of its own, so it takes the page's 16 px interface face).
export const gapGlyph: TextStyle = { fontSize: 16, lineHeight: 20, fontWeight: "400", textAlign: "center" };

// The truncation gap: the ellipsis centred in a box s / 1.5 wide.
export const gapBox: Record<Size, ViewStyle> = {
  small: { width: cellStep.small / 1.5, alignItems: "center" },
  default: { width: cellStep.default / 1.5, alignItems: "center" },
  large: { width: cellStep.large / 1.5, alignItems: "center" },
};

// The centered-row base every cell shares (the skin layers fill, border and corners on top).
const CELL_ROW: ViewStyle = { flexDirection: "row", alignItems: "center", justifyContent: "center" };

const CORNER = platformShape.web.pageCell;

// A resting cell: the hairline on no fill.
const restingCell = (t: ColorTokens): ViewStyle => ({ ...CELL_ROW, borderRadius: CORNER, borderWidth: 1, borderColor: t.border, backgroundColor: "transparent" });

// =============================================================================
// The hand-off's pager, on every platform.
// =============================================================================

export const webSkin: PaginationSkin = {
  controlBox: restingCell,
  // The current page keeps a 1px edge in its own fill, so it is the size of a resting one.
  pageBox: (t, selected) =>
    selected
      ? { ...CELL_ROW, borderRadius: CORNER, borderWidth: 1, borderColor: t.primary, backgroundColor: t.primary, boxShadow: `0px 6px 16px -6px ${t.glow ?? t.ring}` }
      : restingCell(t),
  selectorBox: (t) => ({ ...CELL_ROW, gap: 6, borderRadius: CORNER, borderWidth: 1, borderColor: t.input, backgroundColor: "transparent" }),
  controlLabel: (t) => ({ fontWeight: "500", color: t["muted-foreground"] }),
  pageLabel: (t, selected) => ({ fontFamily: MONO_FONT, fontWeight: "500", color: selected ? t["primary-foreground"] : t["muted-foreground"] }),
  selectorLabel: (t) => ({ fontWeight: "400", color: t.foreground }),
  mutedLabel: (t) => ({ fontWeight: "400", color: t["muted-foreground"] }),
  gapLabel: (t) => ({ color: t["subtle-foreground"] ?? t["muted-foreground"] }),
  disabledOpacity: 0.4,
  hover: webHover((t: ColorTokens): ViewStyle => ({ backgroundColor: t.secondary })),
  pressedOpacity: 0.9,
  // The state layer in the cell's own ink, as Material's is.
  ripple: (t, selected) => ({ color: alpha(selected ? t["primary-foreground"] : t.foreground, 0.1), borderless: false }),
  minTarget: platformMinTarget(),
};

// No platform pagination control: the native skins are the web skin.
export const iosSkin: PaginationSkin = webSkin;
export const androidSkin: PaginationSkin = webSkin;
