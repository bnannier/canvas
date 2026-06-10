import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, shadow } from "../../style/index.js";

// Co-located DescriptionList styles. Layout-only fragments are static objects;
// anything that reads a color is a function of the active tokens (so the card
// surface follows light/dark and reads as glass when the ThemeProvider's surface
// is "glass", since tokens.card is swapped translucent at the theming level).

export type Layout = "inline" | "twoColumn" | "stacked";

// Card surface: rounded, bordered, card fill, soft shadow. When a header band is
// present the card carries no padding (the header and rows supply their own
// px-6) so the header rule spans the full width; otherwise the card pads itself.
export function cardSurface(tokens: ColorTokens): ViewStyle {
  return { borderRadius: 8, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.card, ...shadow("sm") };
}

// The self-padding applied to a card with no header band (p-6).
export const cardPad: ViewStyle = { padding: 24 };

// gap-3 between rows when there is no header band wrapping them.
export const stackGap: ViewStyle = { gap: 12 };

// With a header, rows sit in their own px-6 group beneath the bordered band.
export const rowsWrap: ViewStyle = { paddingHorizontal: 24, gap: 12 };

// --- term / value text ------------------------------------------------------

// Term: small, muted label.
export function termLabel(tokens: ColorTokens): TextStyle {
  return { fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] };
}

// Stacked term: uppercased and tracked so the label reads as secondary above a
// full-weight value.
export function termStacked(tokens: ColorTokens): TextStyle {
  return {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.4,
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
export const valueMono: TextStyle = { fontFamily: "monospace" };

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
