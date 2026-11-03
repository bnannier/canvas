import { platformShape } from "../../style/platform-shape.js";
import { useMaterialTheme } from "../../style/glass-surface/use-material-theme.js";
import { forwardRef, useEffect, useId, useRef, useState, type ComponentProps, type ComponentRef } from "react";
import { Animated, Easing } from "react-native";
import { useReducedMotion } from "../../style/motion.js";
import { Path, Rect } from "react-native-svg";
import { Defs, GlowFilter, SelectedBarGradient } from "../shared/chart-glow.js";
import {
  View,
  Text,
  useControllableState,
  devWarn,
  type LayoutStyle,
  GlassPane,
  paneStyle,
  isGlass,
} from "../../style/index.js";
import * as s from "../shared/charts.styles.js";
import { type Tone } from "../shared/charts.styles.js";
import { ChartLegend } from "../shared/chart-legend.js";
import {
  ChartValueFlag,
  announceSelection,
  DIM_OPACITY,
  pressPoint,
} from "../shared/chart-inspect.js";
import {
  CHART_ROOT,
  CartesianFrame,
  type CartesianLayout,
} from "../shared/chart-frame.js";
import {
  PresentationFlag,
  useChartPresentation,
} from "../shared/chart-presentation.js";
import { PLOT_HEIGHT } from "../shared/cartesian-series.js";
import { niceBound } from "../shared/chart-math.js";
import { type ChartSeries, type ChartSkin } from "../shared/types.js";
import { ChartAnatomyScope } from "../shared/chart-anatomy.js";
import { useAnatomyPart, withPartLayout } from "../../style/anatomy.js";

// Shared Chart shell. The boolean-prop axes (tone + orientation + arrangement +
// density), the bar geometry, the data-shape types, and the token-backed fill logic
// all live here once; a platform file supplies only its skin (the surface and bar
// corner radii) and calls createChart.
//
// Chart is the hand-off's `O('chart')` renderer (tools/v4/handoff/cv-kit-code4.js).
// Vertical columns stand on the shared cartesian frame the line charts use (the
// quarter grid, the y labels at 0, half and the top, the 360 by 170 proportion), each
// bar a rounded `Rect` at most 28 units wide (14 per series in a cluster, 2 apart).
// Horizontal rows are its sideways bars: an 86-unit label column, a bar scaled to
// the remaining 264 units less the value's room, the value after the bar.
//
// Chart is a "Shared" platform treatment: data visualization is platform-neutral. The
// iOS HIG Charts page (Swift Charts) and the shadcn web chart are the same plotted-bar
// idiom, and Material 3 ships no charts component at all, so there is no native shape to
// diverge on. The skin therefore carries the same values on iOS, Android, and web; the
// per-OS files exist only so the architecture is uniform across the kit.
//
// Boolean-prop API: one boolean per option, grouped by axis, first-match precedence
// within an axis (mirrors Button's intentOf). Axes:
//
// - Tone (pick one; default is the primary fill): `success` paints bars green,
//   `destructive` paints them red. Precedence: success > destructive > default.
// - Orientation: `horizontal` lays bars out as sideways rows; omit for the
//   default vertical column chart.
// - Arrangement (grouped mode): `stacked` accumulates the series within one
//   column per category (composition), measured against the per-category
//   totals; omit for side-by-side clusters (comparison).
// - Density: `compact` tightens the frame (12 padding, 8 gaps, as the hand-off's
//   compact frame does); the plot keeps the hand-off's proportion. Omit for the
//   default density.

export interface ChartDatum {
  /**
   * Stable identity for this datum, used as the React key when present. Supply
   * it when the data can reorder or when labels are not unique; otherwise the
   * array index is used.
   */
  id?: string | number;
  /** Bucket label shown under (vertical) or beside (horizontal) the bar. */
  label: string;
  /** The bar's magnitude. Compared against `max` to size the bar. */
  value: number;
}

export interface ChartProps {
  /** The bars to render, in order (single-series mode). */
  data?: ChartDatum[];
  /** Category labels along the x axis (grouped mode, with `series`). */
  labels?: string[];
  /** Multiple series rendered as grouped columns per category, colored by the chart-1..8 tokens (or a series' own `success`/`destructive` tone). */
  series?: ChartSeries[];
  /** Stack the grouped series within one column per category (composition) instead of clustering them side by side. */
  stacked?: boolean;
  /** Optional heading shown above the plot. */
  title?: string;
  /** Axis maximum. Defaults to the largest value in the data (the largest category TOTAL when `stacked`). */
  max?: number;
  // Tone (pick one; default is the primary fill). Single-series only.
  success?: boolean;
  destructive?: boolean;
  // Orientation (default is a vertical column chart). Single-series only.
  horizontal?: boolean;
  // Density (default is the standard plot size).
  compact?: boolean;
  /** Strip the card surface for nesting inside an existing card (mirrors Stats). */
  plain?: boolean;
  /** Hide the series legend (grouped mode shows one by default). */
  hideLegend?: boolean;
  /** Press-to-inspect: the selected category index (controlled). Pass null for none. Vertical charts only. */
  selected?: number | null;
  /** Press-to-inspect: the initially selected category (uncontrolled). */
  defaultSelected?: number;
  /** Fired when a press selects a category (or clears it with null). */
  onSelect?: (index: number | null) => void;
  /** Formats the value axis, the inspected value and the accessible values (data formatting, not styling). */
  formatValue?: (v: number) => string;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. */
  style?: LayoutStyle;
}

// Tone precedence when more than one is passed: first match wins.
export function toneOf(p: ChartProps): Tone {
  if (p.success) return "success";
  if (p.destructive) return "destructive";
  return "primary";
}

// The hand-off's bar geometry, in its viewBox units (scaled by the frame's `scale`).
const BAR = {
  /** A single or stacked column: at most 28 wide, else 60% of its band. */
  column: 28,
  columnShare: 0.6,
  /** A clustered bar: at most 14 wide, else its share of 70% of the band, 2 apart. */
  cluster: 14,
  clusterShare: 0.7,
  clusterGap: 2,
  /** The bands sit 6 in from each plot edge. */
  bandInset: 6,
} as const;

// The hand-off's horizontal rows, in its 360-unit viewBox: the label column, the bar's
// travel (W - 96), the row and its gap, the top inset, the value's offset after the bar.
const ROW = {
  label: 86,
  travel: 264,
  height: 18,
  gap: 8,
  top: 4,
  valueGap: 4,
} as const;

// The selected column's look (the section card's pinned bar): `chart-2` at its top fading
// to the bar's fill at its foot, over a 24 px glow in the accent's `glow`.
const SELECTED_GLOW = 24;
const VIEW_W = 360;

/** One column's bars in data units: each series' [from, to] on the value axis (stacked accumulates). */
export function columnSpans(
  series: ChartSeries[],
  i: number,
  stacked: boolean
): [number, number][] {
  let acc = 0;
  return series.map((sr) => {
    const raw = sr.values[i];
    const v = Number.isFinite(raw) && (raw as number) > 0 ? (raw as number) : 0;
    if (!stacked) return [0, v];
    const span: [number, number] = [acc, acc + v];
    acc += v;
    return span;
  });
}

export interface BarRect {
  category: number;
  series: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * The hand-off's column geometry on a measured frame: one rect per non-empty bar, a
 * single or stacked column centered in its band, a cluster's bars side by side. A bar
 * above the axis top (a caller's `max` under the data) is cut at the top.
 */
export function barRects(
  series: ChartSeries[],
  count: number,
  stacked: boolean,
  layout: CartesianLayout
): BarRect[] {
  const band = layout.band;
  if (!band) return [];
  const m = series.length;
  const single = stacked || m === 1;
  const bw = single
    ? Math.min(BAR.column * layout.scale, band.step * BAR.columnShare)
    : Math.min(BAR.cluster * layout.scale, (band.step * BAR.clusterShare) / m);
  const gap = BAR.clusterGap * layout.scale;
  const at = (v: number) => layout.y(Math.min(v, layout.yMax));
  const rects: BarRect[] = [];
  for (let i = 0; i < count; i++) {
    const cx = band.center(i);
    columnSpans(series, i, stacked).forEach(([from, to], j) => {
      const y = at(to);
      const height = Math.max(0, at(from) - y);
      if (height <= 0) return;
      const x = single
        ? cx - bw / 2
        : cx - (bw * m + gap * (m - 1)) / 2 + j * (bw + gap);
      rects.push({ category: i, series: j, x, y, width: bw, height });
    });
  }
  return rects;
}

export function createChart(skin: ChartSkin) {
  return function Chart(props: ChartProps) {
    // The anatomy parts a docs AnatomyProvider numbers (src/style/anatomy.tsx), in the
    // hand-off's order: Chart frame, Series, Axis labels, Legend, Gridlines, taken before the
    // tree's AnatomyScope and handed to the shared frame and legend (chart-anatomy.tsx).
    const framePart = useAnatomyPart("Chart frame");
    const seriesPart = useAnatomyPart("Series");
    const axisPart = useAnatomyPart("Axis labels");
    const legendPart = useAnatomyPart("Legend");
    const gridPart = useAnatomyPart("Gridlines");
    const { title, testID, style } = props;
    const tone = toneOf(props);
    const compact = !!props.compact;
    const specimen = useChartPresentation()?.kind === "chart";
    const [hoveredBar, setHoveredBar] = useState<number | null>(null);
    const theme = useMaterialTheme({ layer: "content" });
    const { tokens } = theme;
    const surfaceShape = s.surface(tokens, skin.surfaceRadius);
    const glass = isGlass(theme);

    // Grouped mode: `labels` + `series` render clustered columns per category.
    // Single-series mode: the original `data` shape, drawn as one series.
    const grouped = props.series != null && props.series.length > 0;
    const data = props.data ?? [];
    const series: ChartSeries[] = grouped
      ? props.series!
      : [{ label: title ?? "", values: data.map((d) => d.value) }];
    const labels = grouped ? props.labels ?? [] : data.map((d) => d.label);
    const horizontal = !!props.horizontal && !grouped;
    // Stacking is an arrangement of GROUPED series (a column is the category's
    // composition); single-series data has nothing to accumulate.
    const stacked = !!props.stacked && grouped;
    const multi = series.length > 1;

    devWarn(
      props.data != null && props.series != null,
      "[canvas] <Chart />: pass either `data` (single series) or `labels`+`series` (grouped), not both; `series` wins."
    );
    devWarn(
      props.data == null && props.series == null,
      "[canvas] <Chart />: pass `data` (single series) or `labels`+`series` (grouped); the chart renders with no bars."
    );
    // Empty data renders a bare surface with no bars: warn so the developer sees
    // the omission instead of a silently blank chart.
    devWarn(
      props.data != null && data.length === 0,
      "[canvas] <Chart />: `data` is empty; the chart renders with no bars."
    );
    devWarn(
      grouped && labels.length === 0,
      "[canvas] <Chart />: `series` needs `labels` for the category axis; the chart renders with no columns."
    );
    devWarn(
      grouped && series.some((sr) => sr.values.length !== labels.length),
      "[canvas] <Chart />: a series' `values` length differs from `labels`; missing values are treated as 0."
    );
    devWarn(
      grouped && !!props.horizontal,
      "[canvas] <Chart />: `horizontal` applies to single-series charts only; grouped series render vertical columns."
    );
    devWarn(
      !!props.stacked && !grouped,
      "[canvas] <Chart />: `stacked` applies to grouped charts (`labels`+`series`) only; a single `data` series has nothing to accumulate."
    );
    devWarn(
      grouped && !!(props.success || props.destructive),
      "[canvas] <Chart />: tone props apply to single-series charts only; set `success`/`destructive` on a SERIES to color it by meaning, else grouped series use the chart-1..8 tokens."
    );

    const colorOf = (j: number): string =>
      grouped ? s.seriesColor(tokens, series[j], j) : s.barFill(tokens, tone);
    const valueOf = (sr: ChartSeries, i: number): number =>
      Number.isFinite(sr.values[i]) ? (sr.values[i] as number) : 0;
    const fmt = props.formatValue ?? ((v: number) => String(v));
    // The value axis: a stacked chart is measured against the per-category totals (the
    // column IS the sum), a clustered one against the largest single value.
    const spans = labels.map((_, i) => columnSpans(series, i, stacked));
    const dataMax = Math.max(
      0,
      ...spans.flatMap((col) => col.map(([, to]) => to))
    );
    const userMax = props.max != null && props.max > 0 ? props.max : null;

    // Each category is announced with every series' value; a stacked column also names
    // its total, which no other channel carries.
    const categoryName = (i: number): string => {
      if (!grouped) return `${labels[i]}: ${fmt(valueOf(series[0], i))}`;
      const parts = series
        .map((sr) => `${sr.label} ${fmt(valueOf(sr, i))}`)
        .join(", ");
      const total = spans[i].reduce((sum, [from, to]) => sum + (to - from), 0);
      return stacked
        ? `${labels[i]}: ${parts}, total ${fmt(total)}`
        : `${labels[i]}: ${parts}`;
    };
    const [selected, setSelectedRaw] = useControllableState<number | null>(
      props.selected,
      props.defaultSelected ?? null,
      props.onSelect
    );
    const setSelected = (i: number | null) => {
      if (i === selected) return;
      setSelectedRaw(i);
      if (i != null) announceSelection(categoryName(i));
    };
    const dimmed = (i: number): number =>
      selected != null && selected !== i ? DIM_OPACITY : 1;

    // Summarize the chart for assistive tech: the title if there is one, else a
    // generic name. The container is grouped (role="group"); the plot is one image
    // whose name carries every category's values.
    const chartName =
      title != null && title !== "" ? `${title} chart` : "Bar chart";
    const plotName = labels.map((_, i) => categoryName(i)).join("; ");

    // The horizontal rows scale with the frame's width as the hand-off's SVG does.
    const [rowsWidth, setRowsWidth] = useState(0);
    const k = rowsWidth > 0 ? rowsWidth / VIEW_W : 1;

    // A single primary series marks its selected column with the section card's gradient
    // and glow; a toned or grouped chart keeps its fills and marks it by dimming the rest.
    const ids = useId().replace(/[^a-zA-Z0-9_-]/g, "");
    const lit = !grouped && tone === "primary";
    const columns = (layout: CartesianLayout) => {
      const rects =
        specimen && !grouped
          ? labels.map((_, i) => ({
              category: i,
              series: 0,
              x: layout.band!.center(i) - (layout.band!.step - 8) / 2,
              y: layout.y(valueOf(series[0], i)),
              width: layout.band!.step - 8,
              height: layout.plotH - 9 - layout.y(valueOf(series[0], i)),
            }))
          : barRects(series, labels.length, stacked, layout);
      const rx = (r: BarRect) =>
        Math.min(skin.barRadius, r.width / 2, r.height / 2);
      const pick =
        lit && selected != null
          ? rects.find((r) => r.category === selected)
          : undefined;
      return (
        <>
          {pick ? (
            <>
              <Defs>
                <GlowFilter id={`${ids}glow`} length={SELECTED_GLOW} />
                <SelectedBarGradient
                  id={`${ids}sel`}
                  top={tokens["chart-2"]}
                  bottom={colorOf(0)}
                />
              </Defs>
              <Rect
                x={pick.x}
                y={pick.y}
                width={pick.width}
                height={pick.height}
                rx={rx(pick)}
                fill={tokens.glow ?? tokens.ring}
                filter={`url(#${ids}glow)`}
              />
            </>
          ) : null}
          {rects.map((r) =>
            specimen ? (
              <SpecimenBar
                key={`b${r.category}-${series[r.series].id ?? r.series}`}
                d={`M${r.x + 6},${r.y} H${r.x + r.width - 6} Q${
                  r.x + r.width
                },${r.y} ${r.x + r.width},${r.y + 6} V${r.y + r.height - 3} Q${
                  r.x + r.width
                },${r.y + r.height} ${r.x + r.width - 3},${r.y + r.height} H${
                  r.x + 3
                } Q${r.x},${r.y + r.height} ${r.x},${r.y + r.height - 3} V${
                  r.y + 6
                } Q${r.x},${r.y} ${r.x + 6},${r.y} Z`}
                fill={r === pick ? `url(#${ids}sel)` : colorOf(r.series)}
                lit={selected == null || selected === r.category || hoveredBar === r.category}
              />
            ) : (
              <Rect
                key={`b${r.category}-${series[r.series].id ?? r.series}`}
                x={r.x}
                y={r.y}
                width={r.width}
                height={r.height}
                rx={specimen ? platformShape.web.chartSelectedBar : rx(r)}
                fill={r === pick ? `url(#${ids}sel)` : colorOf(r.series)}
                opacity={
                  specimen
                    ? selected != null && selected !== r.category
                      ? 0.55
                      : 1
                    : dimmed(r.category)
                }
              />
            )
          )}
        </>
      );
    };

    const travel = userMax ?? niceBound(dataMax);

    return (
      <ChartAnatomyScope parts={{ frame: framePart, marks: [seriesPart], axisLabels: axisPart, legend: legendPart, gridlines: gridPart }}>
        <View
          role="group"
          accessibilityLabel={chartName}
          aria-label={chartName}
          testID={testID}
          style={[
            props.plain
              ? null
              : paneStyle(theme, [
                  surfaceShape,
                  compact ? s.surfacePadCompact : s.surfacePadDefault,
                ]),
            CHART_ROOT,
            style,
          ]}
        >
          {/* The chart frame is a CONTENT-layer pane under glass (nothing in solid mode). */}
          {glass && !props.plain ? (
            <GlassPane layer="content" shape={surfaceShape} />
          ) : null}
          {title != null && title !== "" ? (
            <Text
              style={[s.title(tokens), compact ? s.titleCompact : s.titleDefault]}
            >
              {title}
            </Text>
          ) : null}

          {horizontal ? (
            // Horizontal: each row is a label, the bar, and the value after it. The rows are
            // the chart frame (no grid is drawn), the first row's label the axis labels and
            // its bar the series.
            <View
              ref={framePart?.ref}
              onLayout={withPartLayout(framePart, (e) => setRowsWidth(e.nativeEvent.layout.width))}
              style={{ width: "100%", paddingTop: ROW.top * k, gap: ROW.gap * k }}
            >
              {data.map((d, i) => {
                const v = valueOf(series[0], i);
                const w =
                  (Math.max(0, Math.min(v, travel)) / travel) * ROW.travel * k;
                return (
                  // Each row is one accessible item announcing "label: value".
                  <View
                    key={d.id ?? i}
                    accessible
                    accessibilityRole="image"
                    role="img"
                    accessibilityLabel={`${d.label}: ${fmt(d.value)}`}
                    aria-label={`${d.label}: ${fmt(d.value)}`}
                    style={[s.barRow, { height: ROW.height * k }]}
                  >
                    <Text
                      ref={i === 0 ? axisPart?.ref : undefined}
                      onLayout={i === 0 ? axisPart?.onLayout : undefined}
                      numberOfLines={1}
                      style={[s.rowLabel(tokens), { width: ROW.label * k }]}
                    >
                      {d.label}
                    </Text>
                    <View
                      ref={i === 0 ? seriesPart?.ref : undefined}
                      onLayout={i === 0 ? seriesPart?.onLayout : undefined}
                      style={s.horizontalBar(
                        colorOf(0),
                        w,
                        skin.barRadius,
                        ROW.height * k
                      )}
                    />
                    <Text
                      numberOfLines={1}
                      style={[
                        s.axisLabel(tokens),
                        { marginLeft: ROW.valueGap * k },
                      ]}
                    >
                      {fmt(d.value)}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <View
              accessible
              accessibilityRole="image"
              role="img"
              accessibilityLabel={plotName}
              aria-label={plotName}
            >
              <CartesianFrame
                yExtent={[0, userMax ?? (dataMax > 0 ? dataMax : 1)]}
                yExact={userMax != null}
                xLabels={labels}
                plotHeight={PLOT_HEIGHT.default}
                aspect
                bandInset={BAR.bandInset}
                compact={compact}
                formatValue={props.formatValue}
                noGuide
                selectedBand={selected}
                onBandScrub={setSelected}
                plotHoverProps={specimen ? (layout) => ({
                  onPointerMove: (event) => {
                    const point = pressPoint(event);
                    if (!point || !layout.band) { setHoveredBar(null); return; }
                    const index = Math.floor(point.x / layout.band.step);
                    const bw = layout.band.step - 8;
                    const left = index * layout.band.step;
                    const inBar = index >= 0 && index < labels.length && point.x >= left && point.x <= left + bw && point.y >= layout.y(valueOf(series[0], index)) && point.y <= layout.plotH - 9;
                    setHoveredBar(inBar ? index : null);
                  },
                  onPointerLeave: () => setHoveredBar(null),
                }) : undefined}
                overlay={(layout) =>
                  selected != null && layout.band && labels[selected] != null ? (
                    // The axis names the inspected category in the card ink, so the pill carries the values.
                    specimen ? (
                      <PresentationFlag
                        lines={[fmt(valueOf(series[0], selected))]}
                        x={layout.band.center(selected)}
                        y={layout.y(valueOf(series[0], selected)) - 38}
                        before
                        gap={
                          -(
                            fmt(valueOf(series[0], selected)).length * 12 * 0.6 +
                            16
                          ) / 2
                        }
                        radius={platformShape.web.chartFlagCompact}
                        padV={6}
                        fontSize={12}
                        lineHeight={16}
                      />
                    ) : (
                      <ChartValueFlag
                        rows={series.map((sr, j) => ({
                          label: multi ? sr.label : undefined,
                          color: multi ? colorOf(j) : undefined,
                          value: fmt(valueOf(sr, selected)),
                        }))}
                        x={layout.band.center(selected)}
                        plotW={layout.plotW}
                      />
                    )
                  ) : null
                }
              >
                {columns}
              </CartesianFrame>
            </View>
          )}

          {/* Series identity for several series, outside the plot image. */}
          {multi && !props.hideLegend ? (
            <ChartLegend
              horizontal
              items={series.map((sr, j) => ({
                label: sr.label,
                color: colorOf(j),
              }))}
            />
          ) : null}
        </View>
      </ChartAnatomyScope>
    );
  };
}


// Animated supplies the View-only `collapsable` optimization flag. An SVG
// geometry node has no such property, so keep it off the underlying Path host.
const AnimationPathHost = forwardRef<ComponentRef<typeof Path>, ComponentProps<typeof Path> & { collapsable?: boolean }>(
  function AnimationPathHost({ collapsable: _collapsable, ...props }, ref) {
    return <Path {...props} ref={ref} />;
  },
);
const AnimatedPath = Animated.createAnimatedComponent(AnimationPathHost);

/** The authored bar's hover fade runs locally; it never mutates chart inspection. */
function SpecimenBar({ d, fill, lit }: { d: string; fill: string; lit: boolean }) {
  const reducedMotion = useReducedMotion();
  const opacity = useRef(new Animated.Value(lit ? 1 : .55)).current;
  useEffect(() => {
    const animation = Animated.timing(opacity, {
      toValue: lit ? 1 : .55,
      duration: reducedMotion ? 0 : 200,
      easing: Easing.bezier(.25, .1, .25, 1),
      // react-native-svg's Path exposes its own props host, so it uses the JS driver.
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [lit, opacity, reducedMotion]);
  return <AnimatedPath d={d} fill={fill} opacity={opacity} />;
}
