import { type ReactNode } from "react";
import { Circle, Path } from "react-native-svg";
import { View, Text, useTheme, alpha, devWarn, type ColorTokens, type StyleProp, type ViewStyle } from "../../style/index.js";
import * as s from "./charts.styles.js";
import { type Tone } from "./charts.styles.js";
import { type ChartSeries, type ChartSkin } from "./charts.shared.js";
import { CartesianFrame, chartRootWidth, type CartesianLayout } from "./chart-frame.js";
import { ChartLegend } from "./chart-legend.js";
import { areaBandPath, areaPath, formatCompact, linePath, monotonePath, stackSeries, type Pt } from "./chart-math.js";

// LineChart and AreaChart: categorical-x series charts drawn through the shared
// CartesianFrame (react-native-svg marks, RN Text furniture, token colors).
// Like the rest of the Chart family they are a "Shared" platform treatment -
// data visualization is platform-neutral - so one implementation serves iOS,
// Android, and the web; the per-OS entries exist only so the architecture is
// uniform across the kit.
//
// Boolean-prop axes (one boolean per choice, first-match precedence per axis):
// - Tone (single-series only; default primary): `success`, `destructive`.
//   Multi-series charts always paint the chart-1..8 series tokens.
// - Curve: `curved` draws a monotone cubic (never overshoots the data); omit
//   for straight segments.
// - Markers (LineChart): `dots` marks each datum.
// - Stacking (AreaChart): `stacked` accumulates series instead of overlapping.
// - Density: `compact` shrinks the plot and tick count.
// - Furniture: `hideLegend`, `hideGrid`, `hideAxes`.

export { type ChartSeries } from "./charts.shared.js";

interface CartesianSeriesProps {
  /** Category labels along the x axis, one per data column. */
  labels: string[];
  /** The series to plot; colors follow the chart-1..8 tokens in fixed order. */
  series: ChartSeries[];
  /** Optional heading shown above the plot. */
  title?: string;
  /** Y-axis maximum override. Defaults to a nice bound above the data max. */
  max?: number;
  /** Y-axis minimum override. Defaults to 0 (or the data min when negative). */
  min?: number;
  // Tone (single-series only; pick one; default is the primary fill).
  success?: boolean;
  destructive?: boolean;
  // Curve (omit for straight segments).
  curved?: boolean;
  // Density (omit for the default plot size).
  compact?: boolean;
  // Furniture visibility.
  hideLegend?: boolean;
  hideGrid?: boolean;
  hideAxes?: boolean;
  /** Formats tick labels and accessible values (data formatting, not styling). */
  formatValue?: (v: number) => string;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Outer layout composition only (width/flex within a parent), never a restyle hook. */
  style?: StyleProp<ViewStyle>;
}

export interface LineChartProps extends CartesianSeriesProps {
  /** Mark each datum with a dot. */
  dots?: boolean;
}

export interface AreaChartProps extends CartesianSeriesProps {
  /** Stack the series (running sums) instead of overlapping translucent fills. */
  stacked?: boolean;
}

// Tone precedence matches Chart: success > destructive > primary.
function toneOf(p: CartesianSeriesProps): Tone {
  if (p.success) return "success";
  if (p.destructive) return "destructive";
  return "primary";
}

// Plot heights by density (taller than the bar Chart: these carry a y axis).
const PLOT_HEIGHT = { default: 180, compact: 120 } as const;
// The standard chart width when the caller leaves the chart unsized.
const STANDARD_WIDTH = 480;

const finite = (v: number | undefined): number => (Number.isFinite(v) ? (v as number) : 0);

// Shared per-chart setup: warnings, tone/color resolution, the y extent, the
// accessible name, and the frame + legend + surface shell around the marks.
function useSeriesChart(kind: "line" | "area", props: CartesianSeriesProps, stacked: boolean) {
  const { labels, series } = props;
  const { tokens } = useTheme();
  const tone = toneOf(props);
  const multi = series.length > 1;
  const formatValue = props.formatValue ?? formatCompact;

  devWarn(series.length === 0, `[canvas] <${kind === "line" ? "LineChart" : "AreaChart"} />: \`series\` is empty; the chart renders with no marks.`);
  devWarn(labels.length === 0, `[canvas] <${kind === "line" ? "LineChart" : "AreaChart"} />: \`labels\` is empty; the chart renders with no columns.`);
  devWarn(
    series.some((sr) => sr.values.length !== labels.length),
    `[canvas] <${kind === "line" ? "LineChart" : "AreaChart"} />: a series' \`values\` length differs from \`labels\`; missing values are treated as 0.`,
  );
  devWarn(
    multi && !!(props.success || props.destructive),
    `[canvas] <${kind === "line" ? "LineChart" : "AreaChart"} />: tone props apply to single-series charts only; multi-series charts use the chart-1..8 tokens.`,
  );
  devWarn(
    series.length * labels.length > 50,
    `[canvas] <${kind === "line" ? "LineChart" : "AreaChart"} />: the accessible name carries every value and this chart has ${series.length * labels.length} datapoints; consider pre-aggregating.`,
  );

  const colorOf = (i: number): string => (multi ? s.seriesFill(tokens, i) : s.barFill(tokens, tone));

  // Y extent: zero-based unless the data (or the caller) goes below.
  const values = series.flatMap((sr) => labels.map((_, i) => finite(sr.values[i])));
  let dataMax: number;
  if (stacked) {
    const totals = labels.map((_, i) => series.reduce((sum, sr) => sum + Math.max(0, finite(sr.values[i])), 0));
    dataMax = Math.max(0, ...totals);
  } else {
    dataMax = Math.max(0, ...values);
  }
  const dataMin = Math.min(0, ...values);
  const yExtent: [number, number] = [props.min ?? dataMin, props.max ?? (dataMax === 0 ? 1 : dataMax)];

  // The accessible name carries the data itself, series-prefixed, so a screen
  // reader hears "Revenue: Jan 12, Feb 19, ...; Costs: Jan 8, ..." (role="img"
  // subtrees are presentational, so the name is the data's only channel).
  const name = series
    .map((sr) => `${sr.label}: ${labels.map((l, i) => `${l} ${formatValue(finite(sr.values[i]))}`).join(", ")}`)
    .join("; ");

  return { tokens, tone, multi, formatValue, colorOf, yExtent, name };
}

// Points for series `sr` across the frame's categorical bands.
function seriesPoints(sr: ChartSeries, labels: string[], layout: CartesianLayout): Pt[] {
  const band = layout.band!;
  return labels.map((_, i) => ({ x: band.center(i), y: layout.y(finite(sr.values[i])) }));
}

function chartShell(
  skin: ChartSkin,
  props: CartesianSeriesProps,
  ctx: ReturnType<typeof useSeriesChart>,
  marks: (layout: CartesianLayout) => ReactNode,
) {
  const { labels, series, title, testID, style } = props;
  const compact = !!props.compact;
  const { tokens, multi, formatValue, colorOf, yExtent, name } = ctx;

  return (
    <View
      {...(title != null && title !== "" ? { role: "group" as const, accessibilityLabel: `${title} chart`, "aria-label": `${title} chart` } : {})}
      testID={testID}
      style={[
        s.surface(tokens, skin.surfaceRadius),
        compact ? s.surfacePadCompact : s.surfacePadDefault,
        chartRootWidth(style, STANDARD_WIDTH),
        style,
      ]}
    >
      {title != null && title !== "" ? (
        <Text style={[s.title(tokens), compact ? s.titleCompact : s.titleDefault]}>{title}</Text>
      ) : null}

      {/* The plot is the image; its accessible name carries every value. */}
      <View accessible accessibilityRole="image" role="img" accessibilityLabel={name} aria-label={name}>
        <CartesianFrame
          yExtent={yExtent}
          xLabels={labels}
          plotHeight={compact ? PLOT_HEIGHT.compact : PLOT_HEIGHT.default}
          compact={compact}
          hideGrid={props.hideGrid}
          hideAxes={props.hideAxes}
          formatValue={formatValue}
        >
          {marks}
        </CartesianFrame>
      </View>

      {/* Identity legend for multiple series (a single series is named by the
          title); rendered outside the img subtree so it stays reachable. */}
      {multi && !props.hideLegend ? (
        <ChartLegend horizontal items={series.map((sr, i) => ({ label: sr.label, color: colorOf(i) }))} />
      ) : null}
    </View>
  );
}

/** Build a LineChart from a platform skin. */
export function createLineChart(skin: ChartSkin) {
  return function LineChart(props: LineChartProps) {
    const ctx = useSeriesChart("line", props, false);
    const curved = !!props.curved;
    const dots = !!props.dots;

    return chartShell(skin, props, ctx, (layout) => (
      <>
        {props.series.map((sr, i) => {
          const pts = seriesPoints(sr, props.labels, layout);
          const color = ctx.colorOf(i);
          return (
            <Path
              key={sr.id ?? `s${i}`}
              d={curved ? monotonePath(pts) : linePath(pts)}
              stroke={color}
              strokeWidth={2}
              fill="none"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          );
        })}
        {dots
          ? props.series.flatMap((sr, i) => {
              const pts = seriesPoints(sr, props.labels, layout);
              const color = ctx.colorOf(i);
              return pts.map((p, j) => (
                <Circle key={`${sr.id ?? `s${i}`}d${j}`} cx={p.x} cy={p.y} r={4} fill={color} stroke={ctx.tokens.card} strokeWidth={1.5} />
              ));
            })
          : null}
      </>
    ));
  };
}

/** Build an AreaChart from a platform skin. */
export function createAreaChart(skin: ChartSkin) {
  return function AreaChart(props: AreaChartProps) {
    const stacked = !!props.stacked && props.series.length > 1;
    const ctx = useSeriesChart("area", props, stacked);
    const curved = !!props.curved;

    return chartShell(skin, props, ctx, (layout) => {
      if (stacked) {
        // Running-sum bands; each series fills between its bottom and top edge.
        const bands = stackSeries(props.series.map((sr) => props.labels.map((_, i) => finite(sr.values[i]))));
        const band = layout.band!;
        return (
          <>
            {props.series.map((sr, i) => {
              const color = ctx.colorOf(i);
              const top: Pt[] = bands[i].map(([, y1], j) => ({ x: band.center(j), y: layout.y(y1) }));
              const bottom: Pt[] = bands[i].map(([y0], j) => ({ x: band.center(j), y: layout.y(y0) }));
              return (
                <Path key={`f${sr.id ?? i}`} d={areaBandPath(top, bottom, curved)} fill={alpha(color, 0.35)} />
              );
            })}
            {props.series.map((sr, i) => {
              const color = ctx.colorOf(i);
              const top: Pt[] = bands[i].map(([, y1], j) => ({ x: band.center(j), y: layout.y(y1) }));
              return (
                <Path
                  key={`e${sr.id ?? i}`}
                  d={curved ? monotonePath(top) : linePath(top)}
                  stroke={color}
                  strokeWidth={2}
                  fill="none"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              );
            })}
          </>
        );
      }

      return (
        <>
          {props.series.map((sr, i) => {
            const pts = seriesPoints(sr, props.labels, layout);
            const color = ctx.colorOf(i);
            return <Path key={`f${sr.id ?? i}`} d={areaPath(pts, layout.plotH, curved)} fill={alpha(color, 0.25)} />;
          })}
          {props.series.map((sr, i) => {
            const pts = seriesPoints(sr, props.labels, layout);
            const color = ctx.colorOf(i);
            return (
              <Path
                key={`e${sr.id ?? i}`}
                d={curved ? monotonePath(pts) : linePath(pts)}
                stroke={color}
                strokeWidth={2}
                fill="none"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            );
          })}
        </>
      );
    });
  };
}
