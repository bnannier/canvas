import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, statusColors, shadow, shape } from "../../style/index.js";
import { MONO_FONT } from "../../style/mono.js";
import { platformShape } from "../../style/platform-shape.js";
import { type ChartSeries, type ChartSkin } from "./types.js";

// Co-located Chart styles. Layout-only fragments are static objects; anything
// that reads a color is a function of the active tokens (so the surface follows
// light/dark). Intentional chart frames use stable content frost where supported,
// while all data ink stays crisp. Frame owners resolve capability before clearing
// their solid fill with paneStyle. Inspection flags own a separate dense material.
// The bar fill per tone is the palette-vs-token choice resolved by `barFill`.

export type Tone = "primary" | "success" | "destructive";

// --- surface ----------------------------------------------------------------

// The bordered, shadowed card surface (rounded-lg border border-border bg-card
// shadow-sm), mirroring the docs `cardCls`. In solid mode the fill is the opaque
// `card`. Keep this complete opaque recipe for capability and accessibility
// fallbacks; paneStyle clears it only when static material can actually render.
// The corner radius is supplied by the skin.
export function surface(tokens: ColorTokens, radius: number): ViewStyle {
  return {
    borderRadius: radius,
    borderWidth: 1,
    borderColor: tokens.border,
    backgroundColor: tokens.card,
    ...shadow("sm", tokens),
  };
}

// --- the hand-off's chart numbers ----------------------------------------------

/**
 * The v4 hand-off's chart frame and furniture (`fr`, `grid`, `axes`, `leg` and the
 * marks in tools/v4/handoff/cv-kit-charts.js), in one table so the skins and the tests
 * read the same numbers. The hand-off draws its plots in a 360-wide viewBox scaled to the
 * frame's content box (about 388 px), so its 9-unit axis text paints at about 9.7 px:
 * the kit sets it at the 10 px source floor.
 */
export const CHART_LOOK = {
  /** The frame's inset and the gap between its title, plot and legend: 16 / 12, compact 12 / 8. */
  pad: { default: 16, compact: 12 },
  gap: { default: 12, compact: 8 },
  /** The title: 500 14 px in the interface face. */
  titleSize: 14,
  titleLine: 20,
  /** Axis labels: the mono face at the 10 px floor, in the subtle ink. */
  axisSize: 10,
  axisLine: 14,
  /** Gridlines: a dotted `2 4` hairline, the baseline (the 0 line) solid. */
  gridDash: "2,4",
  /** The first series' line is 2.2 wide, every other 2. */
  leadStroke: 2.2,
  stroke: 2,
  /** A marker dot: r 3, a 2 px ring of the series over the card fill. */
  dotRadius: 3,
  dotStroke: 2,
  /** Area fills: the lead band at .28, the others at .3; the line fade from .35 to 0. */
  areaLead: 0.28,
  area: 0.3,
  fadeTop: 0.35,
  /** Legend: 8 px squares at the data-cell corner, a 6 px swatch gap, 6 / 14 px row / column gaps, 12 px label. */
  swatch: 8,
  swatchGap: 6,
  legendRowGap: 6,
  legendColumnGap: 14,
  legendSize: 12,
  legendLine: 16,
} as const;

// Surface padding by density (the hand-off's frame: 12 compact, 16 default).
export const surfacePadCompact: ViewStyle = { padding: CHART_LOOK.pad.compact };
export const surfacePadDefault: ViewStyle = { padding: CHART_LOOK.pad.default };

// --- title ------------------------------------------------------------------

// Heading: the hand-off's 500 14 px title in the card ink.
export function title(tokens: ColorTokens): TextStyle {
  return { fontWeight: "500", color: tokens["card-foreground"] };
}

// The title sits one frame gap above the plot (8 compact, 12 default).
export const titleCompact: TextStyle = { marginBottom: CHART_LOOK.gap.compact, fontSize: CHART_LOOK.titleSize, lineHeight: CHART_LOOK.titleLine };
export const titleDefault: TextStyle = { marginBottom: CHART_LOOK.gap.default, fontSize: CHART_LOOK.titleSize, lineHeight: CHART_LOOK.titleLine };

/** An axis or category label: the mono face at the 10 px floor, in the subtle ink (the hand-off's tx3). */
export function axisLabel(tokens: ColorTokens): TextStyle {
  return {
    fontFamily: MONO_FONT,
    fontSize: CHART_LOOK.axisSize,
    lineHeight: CHART_LOOK.axisLine,
    color: tokens["subtle-foreground"] ?? tokens["muted-foreground"],
  };
}

// --- bar fill ---------------------------------------------------------------

// The fill for each bar, by tone. Token primary by default; the success / destructive
// tones take their solid status colors (statusColors' dot), so a chart's bars read as the
// same state as a Badge or an Alert, in either scheme.
export function barFill(tokens: ColorTokens, tone: Tone): string {
  if (tone === "success") return statusColors(tokens, "success").dot;
  if (tone === "destructive") return statusColors(tokens, "error").dot;
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

/**
 * A series' own semantic tone, first match wins (the chart-level precedence:
 * success > destructive). Null when the series carries none, which is the
 * signal to fall through to the ramp.
 */
export function seriesTone(sr: ChartSeries): Tone | null {
  if (sr.success) return "success";
  if (sr.destructive) return "destructive";
  return null;
}

/**
 * The color for series `i`: the series' OWN semantic tone first (a series that
 * means success or failure is colored by that meaning), then the chart-level
 * tone when there is one (single-series charts), then the categorical ramp
 * position. Mirrors `rowFill`'s slot > tone > ramp resolution, and is the one
 * place the Chart family resolves a series color, so the plot, the value flag,
 * and the legend cannot drift apart.
 */
export function seriesColor(tokens: ColorTokens, sr: ChartSeries | undefined, i: number, tone?: Tone | null): string {
  const own = sr ? seriesTone(sr) : null;
  if (own) return barFill(tokens, own);
  if (tone) return barFill(tokens, tone);
  return seriesFill(tokens, i);
}

// --- horizontal layout ------------------------------------------------------

// The horizontal stack of rows (flex-col); the gap is applied by the component.
export const horizontalStack: ViewStyle = { flexDirection: "column" };

// One horizontal row: a label, a track-aligned bar, and the value
// (flex-row items-center gap-2).
export const horizontalRow: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 8 };

// The row's leading label: the hand-off's mono axis label (its horizontal bars put the
// month at x 0 in a 40-unit gutter).
export function horizontalLabel(tokens: ColorTokens): TextStyle {
  return { width: 40, ...axisLabel(tokens) };
}

// The track that holds a horizontal bar (flex-1 flex-row items-center).
export const horizontalTrack: ViewStyle = {
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: "0%",
  flexDirection: "row",
  alignItems: "center",
};

// A horizontal bar: the hand-off's 9-unit bar (about 10 px painted) at the bar corner,
// rounded all round as its `rect rx` draws it; its fill and width are set by the component.
export function horizontalBar(fill: string, width: number, radius: number): ViewStyle {
  return {
    height: 10,
    borderRadius: radius,
    backgroundColor: fill,
    width,
  };
}

// The trailing value: the hand-off's 500 12 px mono value in the card ink.
export function horizontalValue(tokens: ColorTokens): TextStyle {
  return { fontFamily: MONO_FONT, fontSize: 12, lineHeight: 16, fontWeight: "500", color: tokens["card-foreground"] };
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
export const VERTICAL_VALUE_GAP = 4;
// The room a value label takes above its bar: the plot reserves it on top of the bar
// travel, so the tallest bar's value stays inside the chart instead of over its edge.
export const VERTICAL_VALUE_ROOM = CHART_LOOK.axisLine + VERTICAL_VALUE_GAP;
export function verticalValue(tokens: ColorTokens): TextStyle {
  return {
    marginBottom: VERTICAL_VALUE_GAP,
    textAlign: "center",
    ...axisLabel(tokens),
  };
}

// A vertical bar: the hand-off's `rect rx` at the bar corner, rounded all round, plus its
// fill and height (set by the component); the foot sits on the baseline.
export function verticalBar(fill: string, height: number, radius: number): ViewStyle {
  return {
    borderRadius: Math.min(radius, height / 2),
    backgroundColor: fill,
    height,
  };
}

// The hairline baseline under the bars (the hand-off's solid 0 gridline).
export function baseline(tokens: ColorTokens): ViewStyle {
  return { height: 1, width: "100%", backgroundColor: tokens.border };
}

// The labels row under the baseline (mt-2 flex-row); the gap is applied by the
// component.
export const verticalLabelsRow: ViewStyle = { marginTop: 8, flexDirection: "row" };

// One column's label: the hand-off's mono axis label, centered under its column.
export function verticalLabel(tokens: ColorTokens): TextStyle {
  return {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    textAlign: "center",
    ...axisLabel(tokens),
  };
}

// --- per-OS skins -----------------------------------------------------------

// Chart is a "Shared" treatment: data visualization is platform-neutral. The iOS HIG
// Charts page (Swift Charts) and the shadcn web chart are the same plotted-bar idiom,
// and Material 3 ships no charts component at all, so there is no native shape to match
// and the look is identical on every platform. `webSkin` carries the chart look (the
// card corner on the surface, the bar corner on the bars, dashed gridlines drawn by the
// frame); the iOS and Android skins reference it directly so the three columns stay
// byte-identical.

/**
 * The zoom control bar, laid OVER a zoomable chart's plot at its bottom-right, the
 * corner every map puts its controls in.
 *
 * Absolutely positioned rather than stacked under the plot, for two reasons: it
 * takes no layout space, so the map keeps its full height, and it stays a SIBLING
 * of the plot rather than a child. A control inside the plot would end the
 * hit layer's run as the plot's last child and, worse, make a mouse press's
 * target-relative offsetX measure from the control instead of the plot (see the
 * note in chart-inspect.tsx). Yoga positions an absolute child inside the parent's
 * padding box, so zero insets land it on the plot's own corner.
 *
 * A kit-internal constant: the placement is the chart's decision, never a
 * call-site style.
 */
export const zoomBar: ViewStyle = { position: "absolute", right: 0, bottom: 0, flexDirection: "row" };

export const webSkin: ChartSkin = {
  surfaceRadius: shape.web.card,
  barRadius: platformShape.web.bar,
};

// Shared treatment: no per-OS divergence, so the native skins are the web skin.
export const iosSkin: ChartSkin = webSkin;
export const androidSkin: ChartSkin = webSkin;
