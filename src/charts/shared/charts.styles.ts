import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, palette, shadow } from "../../style/index.js";
import { type ChartSkin } from "./types.js";

// Co-located Chart styles. Layout-only fragments are static objects; anything
// that reads a color is a function of the active tokens (so the surface follows
// light/dark). Charts are a content surface: they paint tokens.card, and glass mode
// swaps NO semantic token (the material carries its own `glass-tint` fill), so
// charts do NOT read as glass. Only the surfaces that render through GlassSurface
// take the material (popovers, dialogs, sheets, drawers, the command palette, and
// the bar/sidebar shells); menus, selects, alert dialogs and the chart tooltip stay
// opaque cards on every theming surface. The bar fill per tone is the one
// palette-vs-token choice, resolved by `barFill`.

export type Tone = "primary" | "success" | "destructive";

// --- surface ----------------------------------------------------------------

// The bordered, shadowed card surface (rounded-lg border border-border bg-card
// shadow-sm), mirroring the docs `cardCls`. backgroundColor is tokens.card, which
// stays opaque in glass mode, so this surface stays solid (it is not frosted). The
// corner radius is supplied by the skin (8 everywhere; Chart is Shared).
export function surface(tokens: ColorTokens, radius: number): ViewStyle {
  return {
    borderRadius: radius,
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

// --- series fill ------------------------------------------------------------

// The categorical series tokens in their fixed assignment order. Series i is
// always chart-(i+1): identity follows the series, never its rank, so removing
// a series from a chart must not repaint the survivors. Past 8 the cycle wraps
// (callers should prefer aggregating into fewer series before that point).
const SERIES_TOKENS = [
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "chart-6",
  "chart-7",
  "chart-8",
] as const;

/** The fill for series `i` (0-based), from the theme's chart tokens. */
export function seriesFill(tokens: ColorTokens, i: number): string {
  return tokens[SERIES_TOKENS[i % SERIES_TOKENS.length]];
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
// component). The right corners are rounded (radius from the skin); the left edge
// sits on the track.
export function horizontalBar(fill: string, width: number, radius: number): ViewStyle {
  return {
    height: 12,
    borderTopEndRadius: radius,
    borderBottomEndRadius: radius,
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

// One column wrapping a vertical bar (flex-1 items-stretch). It also sizes the
// bar to its share of the plot via flex (justify-end so the bar foots on the
// baseline and the value sits above it).
export const verticalColumn: ViewStyle = {
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: "0%",
  alignItems: "stretch",
  justifyContent: "flex-end",
};

// The value shown above each vertical bar (mb-1 text-center text-xs font-medium
// text-card-foreground). Mirrors `horizontalValue` so the magnitude is visible
// (and reachable as text by assistive tech) in the vertical orientation too.
export function verticalValue(tokens: ColorTokens): TextStyle {
  return {
    marginBottom: 4,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    color: tokens["card-foreground"],
  };
}

// A vertical bar: rounded-t plus its fill and height (set by the component). The top
// corners are rounded (radius from the skin); the foot sits on the baseline.
export function verticalBar(fill: string, height: number, radius: number): ViewStyle {
  return {
    borderTopStartRadius: radius,
    borderTopEndRadius: radius,
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

// --- per-OS skins -----------------------------------------------------------

// Chart is a "Shared" treatment: data visualization is platform-neutral. The iOS HIG
// Charts page (Swift Charts) and the shadcn web chart are the same plotted-bar idiom,
// and Material 3 ships no charts component at all, so there is no native shape to match
// and the look is identical on every platform. `webSkin` carries the established Canvas
// look verbatim (a rounded-lg (8) card surface and rounded (4) bar corners); the iOS
// and Android skins reference it directly so the three columns stay byte-identical.

export const webSkin: ChartSkin = {
  surfaceRadius: 8,
  barRadius: 4,
};

// Shared treatment: no per-OS divergence, so the native skins are the web skin.
export const iosSkin: ChartSkin = webSkin;
export const androidSkin: ChartSkin = webSkin;
