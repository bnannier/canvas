import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, palette, shadow } from "../../style/index.js";

// Co-located Chart styles. Layout-only fragments are static objects; anything
// that reads a color is a function of the active tokens (so the surface follows
// light/dark, and reads as glass when the ThemeProvider's surface is "glass",
// since tokens.card is swapped translucent at the theming level). The bar fill
// per tone is the one palette-vs-token choice, resolved by `barFill`.

export type Tone = "primary" | "success" | "destructive";

// --- surface ----------------------------------------------------------------

// The bordered, shadowed card surface (rounded-lg border border-border bg-card
// shadow-sm), mirroring the docs `cardCls`.
export function surface(tokens: ColorTokens): ViewStyle {
  return {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tokens.border,
    backgroundColor: tokens.card,
    ...shadow("sm"),
  };
}

// Surface padding by density: p-4 (compact) vs p-5 (default).
export const surfacePadCompact: ViewStyle = { padding: 16 };
export const surfacePadDefault: ViewStyle = { padding: 20 };

// --- title ------------------------------------------------------------------

// Heading: font-semibold text-card-foreground; size/inset switch by density.
export function title(tokens: ColorTokens): TextStyle {
  return { fontWeight: "600", color: tokens["card-foreground"] };
}

// mb-3 text-sm (compact) vs mb-4 text-base (default).
export const titleCompact: TextStyle = { marginBottom: 12, fontSize: 14, lineHeight: 20 };
export const titleDefault: TextStyle = { marginBottom: 16, fontSize: 16, lineHeight: 24 };

// --- bar fill ---------------------------------------------------------------

// The fill for each bar, by tone. Token primary by default; saturated palette
// hues for the success / destructive tones so the chart reads in either scheme.
export function barFill(tokens: ColorTokens, tone: Tone): string {
  if (tone === "success") return palette["green-500"];
  if (tone === "destructive") return palette["red-500"];
  return tokens.primary;
}

// --- horizontal layout ------------------------------------------------------

// The horizontal stack of rows (flex-col); the gap is applied by the component.
export const horizontalStack: ViewStyle = { flexDirection: "column" };

// One horizontal row: a label, a track-aligned bar, and the value
// (flex-row items-center gap-2).
export const horizontalRow: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 8 };

// The row's leading label (w-16 text-xs text-muted-foreground).
export function horizontalLabel(tokens: ColorTokens): TextStyle {
  return { width: 64, fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] };
}

// The track that holds a horizontal bar (flex-1 flex-row items-center).
export const horizontalTrack: ViewStyle = {
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: "0%",
  flexDirection: "row",
  alignItems: "center",
};

// A horizontal bar: h-3 rounded-r plus its fill and width (set by the
// component). The right corners are rounded; the left edge sits on the track.
export function horizontalBar(fill: string, width: number): ViewStyle {
  return {
    height: 12,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: fill,
    width,
  };
}

// The trailing value (text-xs font-medium text-card-foreground).
export function horizontalValue(tokens: ColorTokens): TextStyle {
  return { fontSize: 12, lineHeight: 16, fontWeight: "500", color: tokens["card-foreground"] };
}

// --- vertical layout --------------------------------------------------------

// The baseline-aligned row of columns (flex-row items-end); the gap and the
// plot height are applied by the component.
export const verticalBars: ViewStyle = { flexDirection: "row", alignItems: "flex-end" };

// One column wrapping a vertical bar (flex-1 items-stretch).
export const verticalColumn: ViewStyle = {
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: "0%",
  alignItems: "stretch",
};

// A vertical bar: rounded-t plus its fill and height (set by the component).
export function verticalBar(fill: string, height: number): ViewStyle {
  return {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    backgroundColor: fill,
    height,
  };
}

// The hairline baseline under the bars (h-px w-full bg-border).
export function baseline(tokens: ColorTokens): ViewStyle {
  return { height: 1, width: "100%", backgroundColor: tokens.border };
}

// The labels row under the baseline (mt-2 flex-row); the gap is applied by the
// component.
export const verticalLabelsRow: ViewStyle = { marginTop: 8, flexDirection: "row" };

// One column's label (flex-1 text-center text-xs text-muted-foreground).
export function verticalLabel(tokens: ColorTokens): TextStyle {
  return {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    textAlign: "center",
    fontSize: 12,
    lineHeight: 16,
    color: tokens["muted-foreground"],
  };
}
