import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, shadow, MONO_FONT } from "../../style/index.js";
import { type DescriptionListSkin } from "./description-lists.shared.js";

// Co-located DescriptionList skins and shared style fragments. Layout-only
// fragments are static objects; anything that reads a color is a function of the
// active tokens (so the card surface follows light/dark). DescriptionList is a
// CONTENT-layer surface that paints tokens.card, which stays SOLID under glass
// (only the functional/popover layer frosts). The per-OS pieces (card radius / elevation, row density,
// type tracking) come in through the DescriptionListSkin the shell holds.
//
// DescriptionList is a "Light" treatment: identical structure and semantic colors
// (in description-lists.shared.tsx); only the card corner radius, row spacing,
// type tracking, and surface elevation shift per OS.
//   Web  — the established Canvas / Catalyst look, lifted verbatim: a card with
//          8 radius, a 1px `border`, the `card` fill, a soft shadow("sm"), 24
//          padding, gap 12 between rows; the stacked term is 12pt/500 uppercase
//          with 0.4 letter-spacing.
//   iOS  — SwiftUI LabeledContent value-style rows inside an inset-grouped card:
//          a rounder 12-radius card with a soft shadow, the same 24 padding and
//          12 gap, and SF-style tightened type tracking (-0.08 on the inline term
//          and value, +0.06 on the small uppercase stacked term, -0.2 on the
//          header title).
//   Android — Material 3 has no description-list control; key-value content is a
//          plain list/text layout, so the surface follows the M3 outlined card:
//          a 12-radius outlined surface kept FLAT (no shadow, elevation 0), a
//          slightly more breathable 14 row gap, and M3 type tracking (+0.1 on the
//          term, +0.5 on the uppercase stacked label per M3 label-small, 0 on the
//          header title).

export type Layout = "inline" | "twoColumn" | "stacked";

// Card surface: rounded, bordered, card fill, per-OS elevation. The radius and
// shadow come from the skin so the shape and elevation shift per platform; the
// border, fill, and the rest are shared.
export function cardSurface(tokens: ColorTokens, skin: DescriptionListSkin): ViewStyle {
  return {
    borderRadius: skin.cardRadius,
    borderWidth: 1,
    borderColor: tokens.border,
    backgroundColor: tokens.card,
    ...skin.cardShadow,
  };
}

// With a header, rows sit in their own px-6 group beneath the bordered band; the
// inter-row gap follows the per-OS density.
export function rowsWrap(skin: DescriptionListSkin): ViewStyle {
  return { paddingHorizontal: 24, gap: skin.rowGap };
}

// --- term / value text ------------------------------------------------------

// Term: small, muted label.
export function termLabel(tokens: ColorTokens): TextStyle {
  return { fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] };
}

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

// Value: full-weight data it describes.
export function valueLabel(tokens: ColorTokens): TextStyle {
  return { fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground };
}

// The inline value is right-aligned in its row.
export const valueAlignRight: TextStyle = { textAlign: "right" };

// Monospace value face, for tokens, scopes, identifiers.
export const valueMono: TextStyle = { fontFamily: MONO_FONT };

// --- rows -------------------------------------------------------------------

// Row layout per axis.
export const rowLayout: Record<Layout, ViewStyle> = {
  inline: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 16 },
  twoColumn: { flexDirection: "row", alignItems: "baseline", gap: 16 },
  stacked: { gap: 4 },
};

// A divided list pads each row vertically so the rule sits clear of the text.
export const rowDividedPad: ViewStyle = { paddingBottom: 12 };

// The hairline beneath every divided row except the last.
export function rowDivider(tokens: ColorTokens): ViewStyle {
  return { borderBottomWidth: 1, borderColor: tokens.border };
}

// The two-column value cell: grows to fill, with the value and trailing
// affordance pushed to opposite ends.
export const twoColumnValueCell: ViewStyle = {
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: "0%",
  flexDirection: "row",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: 16,
};

// --- header band ------------------------------------------------------------

export function headerBand(tokens: ColorTokens): ViewStyle {
  return { borderBottomWidth: 1, borderColor: tokens.border, paddingHorizontal: 24, paddingVertical: 16, gap: 2 };
}

export function headerTitle(tokens: ColorTokens): TextStyle {
  return { fontSize: 16, lineHeight: 24, fontWeight: "600", color: tokens.foreground };
}

export function headerSubtitle(tokens: ColorTokens): TextStyle {
  return { fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] };
}

// --- per-OS skins -----------------------------------------------------------

// Web: the current Canvas look, preserved verbatim.
export const webSkin: DescriptionListSkin = {
  cardRadius: 8,
  cardShadow: shadow("sm"),
  rowGap: 12,
  cardPadding: 24,
  termTracking: {},
  stackedTermTracking: { letterSpacing: 0.4 },
  valueTracking: {},
  headerTitleTracking: {},
};

// iOS (HIG / SwiftUI LabeledContent in an inset-grouped card): a rounder card
// with a soft shadow and SF-style tightened tracking.
export const iosSkin: DescriptionListSkin = {
  cardRadius: 12,
  cardShadow: shadow("sm"),
  rowGap: 12,
  cardPadding: 24,
  termTracking: { letterSpacing: -0.08 },
  stackedTermTracking: { letterSpacing: 0.06 },
  valueTracking: { letterSpacing: -0.08 },
  headerTitleTracking: { letterSpacing: -0.2 },
};

// Android (Material 3 outlined surface): a rounder, FLAT outlined card (no
// shadow), slightly more breathing room, and M3 type tracking.
export const androidSkin: DescriptionListSkin = {
  cardRadius: 12,
  cardShadow: shadow("none"),
  rowGap: 14,
  cardPadding: 24,
  termTracking: { letterSpacing: 0.1 },
  stackedTermTracking: { letterSpacing: 0.5 },
  valueTracking: { letterSpacing: 0.1 },
  headerTitleTracking: {},
};
