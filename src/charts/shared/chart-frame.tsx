import { useState, type ReactNode } from "react";
import { StyleSheet, type ViewProps } from "react-native";
import Svg, { Line } from "react-native-svg";
import {
  View,
  Text,
  useTheme,
  FILL,
  type ViewStyle,
} from "../../style/index.js";
import {
  CHART_PRESENTATIONS,
  useChartPresentation,
  type ChartPresentationKind,
} from "./chart-presentation.js";
import { MONO_FONT } from "../../style/mono.js";
import { CHART_LOOK, axisLabel } from "./charts.styles.js";
import { ScrubSurface } from "./chart-inspect.js";
import { useChartAnatomy } from "./chart-anatomy.js";
import { withPartLayout } from "../../style/anatomy.js";
import { useComposedRefs } from "../../style/use-composed-refs.js";
import {
  bandScale,
  estimateTextWidth,
  formatAxis,
  linearScale,
  niceTicks,
  pointScale,
  quarterTicks,
  type Band,
} from "./chart-math.js";

// The shared cartesian plot frame for the Chart family's SVG types (line,
// area, scatter): it measures its width, sizes a y-axis gutter from the tick
// labels, draws the recessive grid/axis furniture, and hands the mark layer a
// coordinate system. Marks are SVG children rendered inside the frame's Svg;
// every piece of TEXT is a React Native Text positioned from the same
// computed coordinates - never SVG text - so chart type stays on the kit's
// token typography and behaves identically on iOS, Android, and web.
//
// Internal to the kit (not exported from the package barrel).

export interface CartesianLayout {
  /** Plot-area size in px (excludes the y gutter and x-label band). */
  plotW: number;
  plotH: number;
  /** Value -> y px (0 is the plot top). */
  y: (v: number) => number;
  /** Numeric x -> x px (identity of the x domain passed in `xDomain`). */
  x: (v: number) => number;
  /** Categorical band info when `xLabels` drives the x axis. */
  band: Band | null;
  /** The niced y domain and its ticks. */
  yTicks: number[];
  yMin: number;
  yMax: number;
  /** The hand-off's drawing scale: its 360-unit viewBox width over the frame's (1 without `aspect`). */
  scale: number;
  /** Authored specimen viewport before an SVG meet inset. */
  viewportWidth?: number;
  plotOffsetX?: number;
}

export interface CartesianFrameProps {
  /** Raw data extent of the y axis (the frame nices it to the hand-off's quarter grid). */
  yExtent: [number, number];
  /** Keep `yExtent` as the domain (a caller's own min or max) and only quarter it. */
  yExact?: boolean;
  /** Categorical x axis: one label per band. Mutually exclusive with xDomain. */
  xLabels?: string[];
  /** Numeric x axis extent (scatter). Mutually exclusive with xLabels. */
  xDomain?: [number, number];
  /** Plot-area height in px (chart component picks it by density); with `aspect`, the most the plot grows to. */
  plotHeight: number;
  /**
   * Size the frame to the hand-off's 360 by 170 chart (cv-kit-charts.js `W`, `H`), drawn at
   * the measured width, up to `plotHeight`: its marks then scale by `layout.scale`.
   */
  aspect?: boolean;
  /** Inset the categorical bands this many hand-off units from each plot edge (the bar Chart's 6). */
  bandInset?: number;
  /** Place the categories as points from the y axis to the plot's right edge (the hand-off's line x) instead of band centres. */
  xPoints?: boolean;
  /**
   * Reserve this many px at the bottom of the plot for a docked companion
   * pane (e.g. candlestick volume): the y scale and its gridlines compress to
   * the region above it, while the plot, baseline, x labels, and scrub keep
   * the full height.
   */
  plotInsetBottom?: number;
  compact?: boolean;
  hideGrid?: boolean;
  hideAxes?: boolean;
  /** Tick/label formatter (defaults to the hand-off's axis notation: whole below 10,000, then "12.5k"). */
  formatValue?: (v: number) => string;
  /** The SVG mark layer, given the computed coordinate system. */
  children: (layout: CartesianLayout) => ReactNode;
  /** Optional RN layer absolutely positioned over the plot (tooltips, flags). */
  overlay?: (layout: CartesianLayout) => ReactNode;
  /**
   * Scrub-to-inspect: SET the selection to the band under the press/drag
   * (null clears, from a stationary tap on the selected band). The hit layer
   * is a responder-based ScrubSurface over the plot - never an SVG touchable,
   * whose web path leaks RN responder props onto DOM nodes.
   */
  onBandScrub?: (index: number | null) => void;
  /** Internal specimen hover feedback; independent of the scrub selection. */
  plotHoverProps?: (layout: CartesianLayout) => Pick<ViewProps, "onPointerMove" | "onPointerLeave">;
  /**
   * The inspected category: its guide is drawn through the plot (unless `noGuide`) and its
   * x label is set in the card ink, shown even where the axis thins its neighbours out.
   */
  selectedBand?: number | null;
  /** Mark the inspected category without the guide line (a bar's own fill marks it). */
  noGuide?: boolean;
}

// Space above the plot so the top tick's label (centered on the top gridline)
// is not clipped by the frame's edge.
const TOP_PAD = 8;
// Height of the x-label band under the plot.
const X_BAND = 20;
// Tick label typography: the hand-off's mono axis label at the 10 px floor.
const LABEL_SIZE = CHART_LOOK.axisSize;
const LABEL_LINE = CHART_LOOK.axisLine;
// The hand-off's chart viewBox (cv-kit-charts.js): 360 wide, 170 tall.
const VIEW_W = 360;
const VIEW_H = 170;
// The hand-off's y gutter (`PL`) and the margin right of its grid (`W - 8`), in its units.
const VIEW_GUTTER = 28;
const VIEW_RIGHT = 8;
// The hand-off labels every other category on an axis of more than 8 (its 12-month axes,
// a label per ~54 px of its plot); a thinned axis keeps at least this much room per label.
const MIN_X_SLOT = 44;

export function CartesianFrame(props: CartesianFrameProps) {
  const presentation = useChartPresentation();
  return presentation ? (
    <PresentedFrame {...props} onBandScrub={props.onBandScrub} kind={presentation.kind} />
  ) : (
    <DefaultCartesianFrame {...props} onBandScrub={props.onBandScrub} />
  );
}

function DefaultCartesianFrame(props: CartesianFrameProps) {
  const {
    yExtent,
    xLabels,
    xDomain,
    plotHeight,
    compact,
    hideGrid,
    hideAxes,
    children,
    overlay,
    onBandScrub,
    selectedBand,
    noGuide,
  } = props;
  const { tokens } = useTheme();
  const [width, setWidth] = useState(0);
  // The anatomy parts the chart handed down (chart-anatomy.tsx): the root is the chart
  // frame; the plot area carries the gridlines while drawn, the baseline while the axes
  // are, and the SVG marks; the axis labels go on the first label drawn.
  const anatomy = useChartAnatomy();
  const gridPart = hideGrid ? undefined : anatomy?.gridlines;
  const baselinePart = hideAxes ? undefined : anatomy?.baseline;
  const plotParts = [gridPart, baselinePart, anatomy?.marks?.[0], anatomy?.marks?.[1]];
  const plotRef = useComposedRefs(...plotParts.map((part) => part?.ref));
  const plotLayout = plotParts.some((part) => part != null)
    ? () => plotParts.forEach((part) => part?.onLayout())
    : undefined;
  const axisPart = hideAxes ? undefined : anatomy?.axisLabels;

  const formatValue = props.formatValue ?? formatAxis;
  const { ticks, niceMin, niceMax } = quarterTicks(
    yExtent[0],
    yExtent[1],
    props.yExact
  );
  // The hand-off's chart is an SVG drawn at the frame's width: every length scales with it,
  // until the plot reaches the density's height.
  const aspectPlot =
    props.aspect && width > 0
      ? Math.round((width * VIEW_H) / VIEW_W) -
        TOP_PAD -
        (hideAxes ? 0 : X_BAND)
      : null;

  // Y gutter: widest tick label (estimated - RN has no synchronous text
  // measurement) plus breathing room, clamped so an extreme label cannot eat
  // the plot. Hidden axes drop the gutter entirely.
  const labels = ticks.map(formatValue);
  // The hand-off labels every other gridline (0, the middle and the top of its five), so
  // an axis of five or more ticks names the even ones counted from the bottom.
  const labelled = (i: number): boolean => ticks.length < 5 || i % 2 === 0;
  const axisInk = axisLabel(tokens);
  const widest = labels.reduce(
    (m, l) => Math.max(m, estimateTextWidth(l, LABEL_SIZE)),
    0
  );
  const plotH =
    aspectPlot != null
      ? Math.max(48, Math.min(plotHeight, aspectPlot))
      : plotHeight;
  const scale = props.aspect
    ? (plotH + TOP_PAD + (hideAxes ? 0 : X_BAND)) / VIEW_H
    : 1;
  const gutter = hideAxes
    ? 0
    : Math.min(
        64,
        Math.max(props.aspect ? VIEW_GUTTER * scale : 24, Math.ceil(widest) + 8)
      );

  // The grid stops short of the frame's right edge, as the hand-off's does; the marks may
  // reach into that margin (a band centred near the edge).
  const rightPad = props.aspect ? VIEW_RIGHT * scale : 0;
  const plotW = Math.max(0, width - gutter - rightPad);
  const insetBottom = Math.max(
    0,
    Math.min(props.plotInsetBottom ?? 0, plotH - 24)
  );

  const y = linearScale(niceMin, niceMax, plotH - insetBottom, 0);

  // X axis: categorical equal bands (labels centered under each band) or a
  // niced numeric domain (scatter).
  const inset = (props.bandInset ?? 0) * scale;
  const band: Band | null = !xLabels
    ? null
    : props.xPoints
    ? pointScale(xLabels.length, 0, plotW)
    : bandScale(
        xLabels.length,
        inset,
        Math.max(inset, plotW + rightPad - inset),
        0,
        0
      );
  const xTicksInfo = xDomain
    ? niceTicks(xDomain[0], xDomain[1], compact ? 3 : 5)
    : null;
  const x = xTicksInfo
    ? linearScale(xTicksInfo.niceMin, xTicksInfo.niceMax, 0, plotW)
    : (v: number) => v;

  const layout: CartesianLayout = {
    plotW,
    plotH,
    y,
    x,
    band,
    yTicks: ticks,
    yMin: niceMin,
    yMax: niceMax,
    scale,
  };

  // Categorical labels collide on narrow plots: render every kth label so a
  // label never overflows its band step.
  let xLabelStep = 1;
  if (xLabels && band && xLabels.length > 0 && band.step > 0) {
    const widestX = xLabels.reduce(
      (m, l) => Math.max(m, estimateTextWidth(l, LABEL_SIZE)),
      0
    );
    xLabelStep = Math.max(
      1,
      Math.ceil(
        Math.max(widestX + 6, xLabels.length > 8 ? MIN_X_SLOT : 0) / band.step
      )
    );
  }
  // The inspected category's label is always shown, in the card ink (the section cards set
  // the selected month in `--tx`); a thinned label it would run into steps aside for it.
  const selectedLabel =
    xLabels && band && selectedBand != null && xLabels[selectedBand] != null
      ? selectedBand
      : null;
  const xLabelShown = (i: number): boolean => {
    if (i === selectedLabel) return true;
    if (i % xLabelStep !== 0) return false;
    if (
      selectedLabel == null ||
      selectedLabel % xLabelStep === 0 ||
      !xLabels ||
      !band
    )
      return true;
    const gap = Math.abs(band.center(i) - band.center(selectedLabel));
    return (
      gap >=
      (estimateTextWidth(xLabels[i], LABEL_SIZE) +
        estimateTextWidth(xLabels[selectedLabel], LABEL_SIZE)) /
        2 +
        6
    );
  };

  const ready = width > 0 && plotW > 0;
  // The first x label drawn, which takes the axis labels' number when the chart asks for it.
  const firstX =
    xLabels && band ? xLabels.findIndex((_, i) => xLabelShown(i)) : -1;
  const xAxisPart = anatomy?.xLabels && firstX >= 0 ? axisPart : undefined;
  const yAxisPart = xAxisPart ? undefined : axisPart;

  return (
    <View
      ref={anatomy?.frame?.ref}
      onLayout={withPartLayout(anatomy?.frame, (e) =>
        setWidth(e.nativeEvent.layout.width)
      )}
      style={{ width: "100%" }}
    >
      <View style={{ height: TOP_PAD + plotH + (hideAxes ? 0 : X_BAND) }}>
        {ready ? (
          <>
            {/* Y tick labels, right-aligned in the gutter, centered on their gridline. */}
            {!hideAxes
              ? ticks.map((t, i) =>
                  labelled(i) ? (
                    <Text
                      key={`yl${i}`}
                      ref={i === 0 ? yAxisPart?.ref : undefined}
                      onLayout={i === 0 ? yAxisPart?.onLayout : undefined}
                      style={{
                        position: "absolute",
                        left: 0,
                        width: gutter - 6,
                        top: TOP_PAD + y(t) - LABEL_LINE / 2,
                        textAlign: "right",
                        ...axisInk,
                      }}
                      numberOfLines={1}
                    >
                      {labels[i]}
                    </Text>
                  ) : null
                )
              : null}

            {/* The plot: gridlines, baseline, then the mark layer. */}
            <View
              ref={plotRef}
              onLayout={plotLayout}
              style={{
                position: "absolute",
                left: gutter,
                top: TOP_PAD,
                width: plotW + rightPad,
                height: plotH,
              }}
            >
              <Svg width={plotW + rightPad} height={plotH}>
                {/* The hand-off's grid: dotted 2 4 hairlines, the bottom line solid. */}
                {!hideGrid
                  ? ticks.map((t, i) => (
                      <Line
                        key={`g${i}`}
                        x1={0}
                        y1={y(t)}
                        x2={plotW}
                        y2={y(t)}
                        stroke={tokens.border}
                        strokeWidth={1}
                        strokeDasharray={
                          i === 0 ? undefined : CHART_LOOK.gridDash
                        }
                      />
                    ))
                  : null}
                {/* The hand-off draws horizontal gridlines only, on a numeric x axis too. */}
                {/* Baseline hairline, kept even when the grid is hidden. */}
                {!hideAxes ? (
                  <Line
                    x1={0}
                    y1={plotH - 0.5}
                    x2={plotW}
                    y2={plotH - 0.5}
                    stroke={tokens.border}
                    strokeWidth={1}
                  />
                ) : null}
                {/* Selection guide through the inspected category: the section cards' dashed
                    3 4 line in the third ink. */}
                {selectedBand != null && band && !noGuide ? (
                  <Line
                    x1={band.center(selectedBand)}
                    y1={0}
                    x2={band.center(selectedBand)}
                    y2={plotH}
                    stroke={
                      tokens["subtle-foreground"] ?? tokens["muted-foreground"]
                    }
                    strokeWidth={1}
                    strokeDasharray={CHART_LOOK.guideDash}
                  />
                ) : null}
                {children(layout)}
              </Svg>
              {/* Scrub-to-inspect hit layer, presentational (the plot's
                  accessible name already carries the data). */}
              {onBandScrub &&
              band &&
              xLabels &&
              xLabels.length > 0 &&
              band.step > 0 ? (
                <ScrubSurface
                  indexAt={(x) =>
                    Math.max(
                      0,
                      Math.min(
                        xLabels.length - 1,
                        props.xPoints
                          ? Math.round(x / band.step)
                          : Math.floor((x - inset) / band.step)
                      )
                    )
                  }
                  selected={selectedBand ?? null}
                  onScrub={onBandScrub}
                  style={StyleSheet.absoluteFill}
                />
              ) : null}
              {overlay ? overlay(layout) : null}
            </View>

            {/* X labels: band-centered (categorical) or tick-positioned (numeric).
                A thinned label spans its whole stride (band.step * xLabelStep)
                centered on its band, so on a dense axis it has room to read in
                full instead of truncating to one narrow band's width. */}
            {!hideAxes && xLabels && band
              ? xLabels.map((label, i) => {
                  if (!xLabelShown(i)) return null;
                  const slot =
                    i % xLabelStep === 0
                      ? band.step * xLabelStep
                      : Math.max(
                          band.step,
                          estimateTextWidth(label, LABEL_SIZE) + 6
                        );
                  return (
                    <Text
                      key={`xl${i}`}
                      ref={i === firstX ? xAxisPart?.ref : undefined}
                      onLayout={i === firstX ? xAxisPart?.onLayout : undefined}
                      style={{
                        position: "absolute",
                        left: gutter + band.center(i) - slot / 2,
                        width: slot,
                        top: TOP_PAD + plotH + 4,
                        textAlign: "center",
                        ...axisInk,
                        ...(i === selectedLabel
                          ? { color: tokens["card-foreground"] }
                          : null),
                      }}
                      numberOfLines={1}
                    >
                      {label}
                    </Text>
                  );
                })
              : null}
            {!hideAxes && xTicksInfo
              ? xTicksInfo.ticks.map((t, i) => (
                  <Text
                    key={`xt${i}`}
                    style={{
                      position: "absolute",
                      left: gutter + x(t) - 30,
                      width: 60,
                      top: TOP_PAD + plotH + 4,
                      textAlign: "center",
                      ...axisInk,
                    }}
                    numberOfLines={1}
                  >
                    {formatValue(t)}
                  </Text>
                ))
              : null}
          </>
        ) : null}
      </View>
    </View>
  );
}

/**
 * The chart-root nature shared by the SVG chart types: a chart is FILL. It spans
 * the parent it is given (a Container step, a Row span, a Card body) and the
 * geometry measures that width; it never carries a standard width of its own.
 */
export const CHART_ROOT: ViewStyle = FILL;

/** Authored room specimens use the same scales, SVG marks and scrub surface. */
function PresentedFrame(
  props: CartesianFrameProps & { kind: ChartPresentationKind }
) {
  const { tokens } = useTheme();
  const [width, setWidth] = useState(0);
  const profile = CHART_PRESENTATIONS[props.kind];
  const height = props.kind === "candlestick" ? 210 : profile.height;
  const axisBelow = [
    "chart",
    "range",
    "histogram",
    "depth",
    "candlestick",
  ].includes(props.kind);
  const belowHeight = axisBelow ? (props.kind === "chart" ? 29 : 27) : 0;
  const top = props.kind === "chart" ? 32 : 0;
  const outerW = props.kind === "candlestick" ? Math.max(0, width - 56) : width;
  const fit = profile.meet ? Math.min(outerW / profile.width, 1) : 1;
  const plotW = profile.meet ? profile.width * fit : outerW;
  // These source SVGs (or their containing wells) include a 1px bottom
  // border in their declared height. Their measured viewBox viewport is
  // therefore 179/180 or 139/140 tall; the border stays outside the marks.
  const borderedPlot = ["line", "area", "range", "composed", "histogram", "depth"].includes(props.kind);
  const viewportH = profile.meet ? profile.height * fit : height;
  const plotH = viewportH - (borderedPlot ? 1 : 0);
  const left = (outerW - plotW) / 2;
  const offsetY = profile.meet ? (height - viewportH) / 2 : 0;
  const sx = plotW / profile.width;
  const sy = plotH / profile.height;
  const extents: Partial<Record<ChartPresentationKind, [number, number]>> = {
    line: [0, 180],
    box: [0, 150],
    area: [0, 140],
    range: [0, 140],
    composed: [0, 140],
    histogram: [0, 87.5],
    scatter: [0, 450],
    depth: [0, 140],
    chart: [0, 1204],
  };
  const [yMin, yMax] = extents[props.kind] ?? props.yExtent;
  const baseline =
    props.kind === "waterfall"
      ? 130 * sy
      : props.kind === "chart"
      ? plotH - 9
      : plotH;
  const y =
    props.kind === "candlestick"
      ? (v: number) => ((42600 - v) / 10) * sy
      : props.kind === "waterfall"
      ? (v: number) => (130 - v * 0.7) * sy
      : linearScale(yMin, yMax, baseline, 0);
  const domains: Partial<Record<ChartPresentationKind, [number, number]>> = {
    histogram: [110, 250],
    scatter: [0, 7],
    depth: [41980, 42230],
  };
  const [xMin, xMax] = domains[props.kind] ?? props.xDomain ?? [0, plotW];
  const x = linearScale(xMin, xMax, 0, plotW);
  let band: Band | null = props.xLabels
    ? props.xPoints
      ? pointScale(props.xLabels.length, 0, plotW)
      : bandScale(props.xLabels.length, 0, plotW, 0, 0)
    : null;
  if (props.kind === "chart" && props.xLabels) {
    const bw = (plotW - (props.xLabels.length - 1) * 8) / props.xLabels.length;
    const basic = bandScale(props.xLabels.length, 0, plotW, 0, 0);
    band = {
      ...basic,
      step: bw + 8,
      center: (i: number) => bw / 2 + i * (bw + 8),
    };
  }
  if (props.kind === "waterfall" && props.xLabels) {
    const basic = bandScale(props.xLabels.length, 0, plotW, 0, 0);
    band = {
      ...basic,
      step: 46 * sx,
      center: (i: number) => (28 + 46 * i) * sx,
    };
  }
  const layout: CartesianLayout = {
    plotW,
    plotH,
    y,
    x,
    band,
    yTicks: [],
    yMin,
    yMax,
    scale: profile.meet ? fit : 1,
    viewportWidth: outerW,
    plotOffsetX: left,
  };
  const ink = tokens["subtle-foreground"] ?? tokens["muted-foreground"];
  const axis = {
    fontFamily: MONO_FONT,
    fontSize: CHART_LOOK.axisSize,
    lineHeight: 13,
    color: ink,
  } as const;
  const below =
    props.kind === "range"
      ? ["Jan", "Apr", "Aug", "Dec"]
      : props.kind === "histogram"
      ? ["110 ms", "180", "250 ms"]
      : props.kind === "depth"
      ? ["41,980", "42,105", "42,230"]
      : props.kind === "candlestick"
      ? ["09:30", "11:00", "12:30", "14:00", "15:30"]
      : [];
  return (
    <View
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={{ width: "100%", height: top + height + belowHeight }}
    >
      {width > 0 ? (
        <>
          <View
            style={{
              position: "absolute",
              left,
              top: top + offsetY,
              width: plotW,
              height: viewportH,
            }}
          >
            <Svg width={plotW} height={viewportH}>
              {!props.hideGrid
                ? profile.grid.map((gy, i) => (
                    <Line
                      key={i}
                      x1={0}
                      x2={plotW}
                      y1={gy * sy}
                      y2={gy * sy}
                      stroke={tokens.border}
                      strokeWidth={profile.meet ? fit : 1}
                      strokeDasharray={
                        props.kind === "box" && i === 0 ? "2,4" : undefined
                      }
                    />
                  ))
                : null}
              {props.kind === "scatter" && !props.hideGrid
                ? [70, 140, 210].map((gx) => (
                    <Line
                      key={gx}
                      x1={gx * sx}
                      x2={gx * sx}
                      y1={0}
                      y2={plotH}
                      stroke={tokens.border}
                      strokeWidth={fit}
                    />
                  ))
                : null}
              {[
                "chart",
                "line",
                "area",
                "range",
                "composed",
                "histogram",
                "depth",
              ].includes(props.kind) ? (
                <Line
                  x1={0}
                  x2={plotW}
                  y1={viewportH - 0.5}
                  y2={viewportH - 0.5}
                  stroke={tokens.border}
                />
              ) : null}
              {props.selectedBand != null &&
              band &&
              !props.noGuide &&
              ["range", "candlestick"].includes(props.kind) ? (
                <Line
                  x1={band.center(props.selectedBand)}
                  x2={band.center(props.selectedBand)}
                  y1={0}
                  y2={plotH}
                  stroke={ink}
                  strokeDasharray="3,4"
                />
              ) : null}
              {props.children(layout)}
            </Svg>
            {props.onBandScrub && band && props.xLabels?.length ? (
              <ScrubSurface
                indexAt={(px) =>
                  Math.max(
                    0,
                    Math.min(
                      props.xLabels!.length - 1,
                      props.xPoints
                        ? Math.round(px / band!.step)
                        : Math.floor(px / band!.step)
                    )
                  )
                }
                selected={props.selectedBand ?? null}
                onScrub={props.onBandScrub}
                hoverProps={props.plotHoverProps?.(layout)}
                style={StyleSheet.absoluteFill}
              />
            ) : null}
            {props.overlay?.(layout)}
          </View>
          {below.length ? (
            <View
              style={{
                position: "absolute",
                left: 0,
                right: props.kind === "candlestick" ? 56 : 0,
                top: top + height + 14,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              {below.map((label, i) => (
                <Text
                  key={i}
                  style={[
                    axis,
                    props.kind === "depth" && i === 1
                      ? { color: tokens.foreground }
                      : null,
                  ]}
                >
                  {label}
                </Text>
              ))}
            </View>
          ) : null}
          {props.kind === "chart" && band
            ? props.xLabels?.map((label, i) => (
                <Text
                  key={i}
                  style={[
                    axis,
                    {
                      position: "absolute",
                      top: top + height + 16,
                      left: band!.center(i) - band!.step / 2,
                      width: band!.step,
                      textAlign: "center",
                      color: i === props.selectedBand ? tokens.foreground : ink,
                    },
                  ]}
                >
                  {label}
                </Text>
              ))
            : null}
          {props.kind === "candlestick" ? (
            <View
              style={{
                position: "absolute",
                top: 20,
                right: 0,
                height: 136,
                justifyContent: "space-between",
              }}
            >
              {["42,600", "42,300", "42,000"].map((label) => (
                <Text key={label} style={[axis, { textAlign: "right" }]}>
                  {label}
                </Text>
              ))}
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  );
}
