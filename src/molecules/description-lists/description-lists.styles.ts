import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, shadow, MONO_FONT, FOCUS_RESET, shape } from "../../style/index.js";
import { platformShape } from "../../style/platform-shape.js";
import { type DescriptionListSkin } from "./description-lists.shared.js";

// Co-located DescriptionList skins and shared style fragments. Layout-only
// fragments are static objects; anything that reads a color is a function of the
// active tokens (so the card surface follows light/dark). DescriptionList is a
// content surface: card variants use static frost in glass mode, with tokens.card
// as their complete opaque fallback. The per-OS pieces (card radius /
// corner curve / elevation, row density and metrics, the term/value/header type)
// come in through the DescriptionListSkin the shell holds.
//
// DescriptionList keeps one structure and one set of semantic colors on every
// platform, but the per-OS TYPE ROLES differ:
//   Web: the Canvas v4 hand-off's term-value list (cv-kit-code3.js
//          `O('description-lists')`, over `K.def('description-lists')` in
//          cv-kit-data.js): a card at the card corner, a 1px `border`, the `card` fill,
//          the small shadow, inset 16 down and 20 across; each row 12 above and below
//          its text, a divided list ruled by `border` hairlines; a 500 13/18 muted term
//          beside a 400 14/20 foreground value, centered on each other; a stacked term
//          is the same 500 13 label in the subtle ink over its value, 4 apart. The
//          header is a 500 16/24 title over a 400 13/18 subtle subtitle, 12 above a
//          hairline inside the card's inset.
//   iOS: the iOS 27 kit Lists value row: the term is the PRIMARY SF Pro 17/22
//          Regular label (Labels/1) LEFT and the value is the SECONDARY gray
//          17/22 detail (Labels/2), the OPPOSITE emphasis and 3pt larger than the
//          web idiom; ~52pt center-aligned rows, 16 inset, inside a FLAT
//          inset-grouped card at the inset grouped list corner, with the continuous
//          (superellipse) corner curve.
//   Android: Material 3 has no description-list control (PLATFORM-REFERENCES.md), so
//          it draws the web skin's list in Roboto.

export type Layout = "inline" | "twoColumn" | "stacked";

// Card surface: rounded, bordered, card fill, per-OS corner curve + elevation.
// The radius, curve, and shadow come from the skin so the shape and elevation
// shift per platform; the border, fill, and the rest are shared. borderCurve is
// an iOS-only RN style prop (the continuous superellipse corner), a no-op on the
// web and Android.
export function cardSurface(tokens: ColorTokens, skin: DescriptionListSkin): ViewStyle {
  return {
    borderRadius: skin.cardRadius,
    borderCurve: skin.cardCurve,
    borderWidth: 1,
    borderColor: tokens.border,
    backgroundColor: tokens.card,
    ...skin.cardShadow(tokens),
  };
}

// With a header, rows sit in their own group beneath the bordered band; the
// horizontal inset and the inter-row gap follow the per-OS skin.
export function rowsWrap(skin: DescriptionListSkin): ViewStyle {
  return { paddingHorizontal: skin.cardPadding, gap: skin.rowGap };
}

// --- term / value text ------------------------------------------------------

// Stacked term: uppercased and tracked so the label reads as secondary above a
// full-weight value. The per-OS tracking is layered on by the skin.
export function termStacked(tokens: ColorTokens): TextStyle {
  return {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    textTransform: "uppercase",
    color: tokens["muted-foreground"],
  };
}

// The two-column term's fixed label column (w-40). Lands on a Text.
export const termColumn: TextStyle = { width: 160 };

// The label column narrows at phone widths so the value column keeps room to
// breathe (restores the pre-refactor Field behavior: 160 -> 120 at/below sm).
export const termColumnNarrow: TextStyle = { width: 120 };

// The inline value is right-aligned in its row.
export const valueAlignRight: TextStyle = { textAlign: "right" };

// Monospace value face, for tokens, scopes, identifiers.
export const valueMono: TextStyle = { fontFamily: MONO_FONT };

// A copyable value row: the value beside its ghost Copy button. The row itself
// must yield inside a tight value cell (flexShrink defaults to 0, which would
// push the button past the card edge), and the value text inside it yields to
// the button, ellipsizing instead of overflowing.
export const copyRow: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 };
export const copyValueText: TextStyle = { flexShrink: 1 };

// A plain value beside a trailing affordance (the two-column cell's Update link) must
// yield the same way, and wrap rather than overflow: a Text row item keeps its longest
// unbreakable run as its minimum width on the web (an id, an email) and does not shrink at
// all on native, so a long value pushed the cell past the card at phone widths.
export const valueWrap: TextStyle = { flexShrink: 1, minWidth: 0 };

// --- rows -------------------------------------------------------------------

// Row layout per axis. The horizontal rows (inline / two-column) take the skin's
// cross-axis alignment (iOS centers its 52pt Lists row; web/Android sit on the
// baseline) and an optional minimum height (the iOS list-row height).
//
// The inline row wraps: a value that does not fit beside its term moves onto its
// own line under the term (the stacked layout's 4 gap), the way an iOS value cell
// stacks its detail when the two do not fit side by side. The decision is the
// content's own, so it is intrinsic (no measurement): a row that fits lays out
// exactly as before, and each row decides for itself. The wrapped value keeps the
// trailing edge (`inlineValueCell`), so a list whose short rows fit and whose long
// rows wrap still reads as one column of values, with every Copy button in line.
// Wrapped lines center in the iOS 52pt row; without a minimum height there is no
// free space to distribute.
export function rowLayout(layout: Layout, skin: DescriptionListSkin): ViewStyle {
  if (layout === "stacked") return { gap: 4 };
  const base: ViewStyle = {
    flexDirection: "row",
    alignItems: skin.rowAlign,
    ...(skin.rowMinHeight != null ? { minHeight: skin.rowMinHeight } : null),
  };
  if (layout === "inline") {
    return { ...base, flexWrap: "wrap", alignContent: "center", justifyContent: "space-between", columnGap: 16, rowGap: 4 };
  }
  return { ...base, gap: 16 }; // twoColumn
}

// The inline value cell (the value and any trailing Copy button or Update link)
// must be able to yield. A bare View never shrinks (flexShrink 0 on
// react-native-web and Yoga alike), so the cell held its content's full width
// and the value's own shrink (`copyValueText`, `valueWrap`) never engaged: a
// mono id beside its Copy button ran the button past the card in a narrow
// sidebar. Once the row has wrapped the value onto its own line, a value still
// wider than that line shrinks to it, ellipsizing a copyable value and wrapping a
// plain one. The auto start margin holds the cell at the trailing edge on either
// line: beside the term it takes the free space `space-between` would, and alone
// on a wrapped line it keeps the value where the fitting rows put theirs (a lone
// item on a `space-between` line would sit at the start).
export const inlineValueCell: ViewStyle = { flexShrink: 1, minWidth: 0, marginStart: "auto" };

// A divided list pads each row beneath the rule so it sits clear of the text.
// iOS lands the hairline flush at the bottom of the centered 52pt row (pad 0);
// web/Android carry the row height in the padding.
export function rowDividedPad(skin: DescriptionListSkin): ViewStyle {
  return { paddingBottom: skin.dividedPadBottom };
}

// The hairline beneath every divided row except the last.
export function rowDivider(tokens: ColorTokens): ViewStyle {
  return { borderBottomWidth: 1, borderColor: tokens.border };
}

// A ruled row: the v4 hand-off's accessibility card rows (Component.dc.html line 258,
// the keyboard card: `grid-template-columns:minmax(120px,auto) 1fr;gap:14px;align-items:center;
// padding:9px 0;border-top:1px solid var(--ln)`). Every row, the first included, draws a
// 1 px top rule in the `border` token (the hand-off's `var(--ln)`) and pads the skin's
// `ruled.rowPadY` above and below its text with nothing beside; the rule and the padding
// replace the inset card's own row padding and the divided bottom rule, so a ruled row
// never stacks a second rule or a second pad. The two-column row takes the hand-off's
// `gap:14px` between term and value; the inline and stacked rows keep their own gaps.
//
// The compact ruled row is the semantics card's (line 263: `grid-template-columns:110px
// 1fr;gap:12px;align-items:start;padding:8px 0;border-top:1px solid var(--ln)`): the same
// rule, the skin's `ruledCompact` padding and two-column gap, and the row's content at the
// skin's `ruledCompact.align` (the top on the web, where the hand-off's value is a wrapping
// row of pills) in place of the skin's `rowAlign`.
export function rowRuled(tokens: ColorTokens, skin: DescriptionListSkin, layout: Layout, compact = false): ViewStyle {
  const metrics = compact ? skin.ruledCompact : skin.ruled;
  return {
    borderTopWidth: 1,
    borderColor: tokens.border,
    paddingVertical: metrics.rowPadY,
    ...(layout === "twoColumn" ? { gap: metrics.gap } : null),
    ...(compact && layout !== "stacked" ? { alignItems: skin.ruledCompact.align } : null),
  };
}

// The ruled row's term column: `minmax(120px,auto)` (line 258), the term's own width with a
// floor at the skin's `ruled.termMinWidth`, where the two-column term is a fixed column.
export function termRuled(skin: DescriptionListSkin): TextStyle {
  return { minWidth: skin.ruled.termMinWidth };
}

// The compact ruled row's term column: the semantics card's fixed `110px` (line 263), the
// skin's `ruledCompact.termWidth`.
export function termRuledCompact(skin: DescriptionListSkin): TextStyle {
  return { width: skin.ruledCompact.termWidth };
}

// The two-column value cell: grows to fill, with the value and trailing
// affordance pushed to opposite ends. `minWidth: 0` lets it yield below its
// content's width (Yoga and react-native-web both default it to 0 on a View, but
// the cell states it so the FILL contract does not hang on a renderer default).
export const twoColumnValueCell: ViewStyle = {
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: "0%",
  minWidth: 0,
  flexDirection: "row",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: 16,
};

// A node value (the caller's own rendering, a wrapping Row of Badges for one) sits in
// this box so it can yield to the cell. React Native gives every box `flexShrink: 0`,
// so inside the row-direction two-column cell a wrapping Row kept its max-content
// width (every child on one line) and ran past the card instead of wrapping. Shrinking
// to the cell gives the Row a definite width to wrap at; a value that fits keeps its
// own width, and the trailing Copy button still sits beside it.
export const nodeValue: ViewStyle = { flexShrink: 1, minWidth: 0 };

// --- inline edit -------------------------------------------------------------

// The editing cluster: the draft input growing to fill the cell with the
// Save / Cancel links trailing. minWidth 0 lets the input shrink inside a
// tight cell instead of pushing the links out of the card.
export const editRow: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
  flexGrow: 1,
  flexShrink: 1,
  minWidth: 0,
};

// The inline layout's value cell has no width of its own; while editing it
// takes the row's free space so the draft input has room to type into.
export const editCellGrow: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: "0%" };

// The draft input: rendered in the row's own value type but lifted to the full
// foreground color (typing reads primary even where the resting value is the
// secondary gray, as on iOS), over a hairline ring-colored underline that marks
// the active field. No inner padding, so the row height holds still while a row
// flips between reading and editing.
export function editInput(tokens: ColorTokens): TextStyle {
  return {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 80,
    paddingVertical: 0,
    paddingHorizontal: 0,
    color: tokens.foreground,
    borderBottomWidth: 1,
    borderColor: tokens.ring,
    ...FOCUS_RESET,
  };
}

// --- header band ------------------------------------------------------------

export function headerBand(tokens: ColorTokens, skin: DescriptionListSkin): ViewStyle {
  return {
    borderBottomWidth: 1,
    borderColor: tokens.border,
    paddingHorizontal: skin.cardPadding,
    paddingVertical: 16,
    gap: 2,
  };
}

// The inset card's header: its rule runs inside the card's own inset, the title block
// `padBottom` above it.
export function insetHeaderBand(tokens: ColorTokens, padBottom: number): ViewStyle {
  return { borderBottomWidth: 1, borderColor: tokens.border, paddingBottom: padBottom, gap: 2 };
}

export function headerSubtitle(tokens: ColorTokens): TextStyle {
  return { fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] };
}

// --- per-OS skins -----------------------------------------------------------

const subtle = (t: ColorTokens): string => t["subtle-foreground"] ?? t["muted-foreground"];

// Web: the v4 hand-off's inset term-value card.
export const webSkin: DescriptionListSkin = {
  cardRadius: shape.web.card,
  cardCurve: "circular",
  cardShadow: (t) => shadow("sm", t),
  // Rows carry their own 12 above and below (`inset.rowPadY`), so they sit flush.
  rowGap: 0,
  cardPadding: 20,
  rowAlign: "center",
  dividedPadBottom: 12,
  termType: (t) => ({ fontSize: 13, lineHeight: 18, fontWeight: "500", color: t["muted-foreground"] }),
  valueType: (t) => ({ fontSize: 14, lineHeight: 20, fontWeight: "400", color: t.foreground }),
  stackedTermTracking: { letterSpacing: 0 },
  stackedTermType: (t) => ({ fontSize: 13, lineHeight: 18, fontWeight: "500", color: subtle(t) }),
  stackedValueType: (t) => ({ fontSize: 14, lineHeight: 20, fontWeight: "400", color: t.foreground }),
  headerTitleType: (t) => ({ fontSize: 16, lineHeight: 24, fontWeight: "500", color: t.foreground }),
  headerSubtitleType: (t) => ({ fontSize: 13, lineHeight: 18, fontWeight: "400", color: subtle(t) }),
  inset: { cardPadY: 16, rowPadY: 12, headerPadBottom: 12 },
  // The hand-off's ruled rows (Component.dc.html line 258): `padding:9px 0`, a term column of
  // `minmax(120px,auto)` and `gap:14px` to the value.
  ruled: { rowPadY: 9, termMinWidth: 120, gap: 14 },
  // The hand-off's compact ruled rows, the semantics card's (Component.dc.html line 263):
  // `grid-template-columns:110px 1fr;gap:12px;align-items:start;padding:8px 0`.
  ruledCompact: { rowPadY: 8, termWidth: 110, gap: 12, align: "flex-start" },
};

// iOS (iOS 27 kit Lists value rows in a flat inset-grouped card): the term is the
// PRIMARY 17/22 SF label and the value the SECONDARY gray 17/22 detail (emphasis
// inverted, 3pt larger), 52pt center-aligned rows, 16 inset, a flat 26-radius
// card with the continuous corner curve. SF Pro Text tracking at 17pt = -0.43;
// the 14pt stacked value = -0.15.
export const iosSkin: DescriptionListSkin = {
  cardRadius: platformShape.ios.groupedList,
  cardCurve: "continuous",
  cardShadow: () => shadow("none"),
  rowGap: 12,
  cardPadding: 16,
  rowAlign: "center",
  rowMinHeight: 52,
  dividedPadBottom: 0,
  termType: (t) => ({ fontSize: 17, lineHeight: 22, fontWeight: "400", letterSpacing: -0.43, color: t.foreground }),
  valueType: (t) => ({ fontSize: 17, lineHeight: 22, fontWeight: "400", letterSpacing: -0.43, color: t["muted-foreground"] }),
  stackedTermTracking: { letterSpacing: 0.06 },
  stackedValueType: (t) => ({ fontSize: 14, lineHeight: 20, fontWeight: "500", letterSpacing: -0.15, color: t.foreground }),
  headerTitleType: (t) => ({ fontSize: 16, lineHeight: 24, fontWeight: "600", letterSpacing: -0.2, color: t.foreground }),
  // A ruled row keeps the iOS Lists row: the 52pt minimum height centers its text, so the
  // rule needs no padding of its own (as `dividedPadBottom` is 0 here); the term floor and
  // the gap are the web look's, since iOS Lists have no ruled term column of their own.
  ruled: { rowPadY: 0, termMinWidth: 120, gap: 14 },
  // The compact step keeps the same centered 52pt Lists row; the fixed term column and
  // the gap are the web look's (line 263), as the ruled floor and gap are.
  ruledCompact: { rowPadY: 0, termWidth: 110, gap: 12, align: "center" },
};

// Android: Material 3 has no description list, so the web skin's list in Roboto.
export const androidSkin: DescriptionListSkin = { ...webSkin };
