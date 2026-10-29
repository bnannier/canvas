import { useId } from "react";
import { Circle, Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";
import { type ChartSeries, type ChartSkin } from "../shared/types.js";
import { type CartesianSeriesProps, chartShell, finite, seriesPoints, useSeriesChart } from "../shared/cartesian-series.js";
import { areaPath, linePath, monotonePath } from "../shared/chart-math.js";
import { CHART_LOOK } from "../shared/charts.styles.js";

// The hand-off's composed bars: a 12-unit bar per 29.5-unit month (about 0.41 of the
// band step), washed at .55 behind the lead line.
const BAR_SHARE = 0.41;
const BAR_OPACITY = 0.55;

// ComposedChart: bars, lines, and gradient-washed areas sharing one
// categorical axis (the "revenue bars with a margin line" chart), through the
// shared cartesian core. A "Shared" platform treatment - data visualization
// is platform-neutral - so one implementation serves iOS, Android, and the
// web. For bar-only grouped data, reach for the bar `Chart`'s grouped mode
// instead; composed earns its keep when the marks mix.
//
// Boolean-prop axes (one boolean per choice, first-match precedence per axis):
// - Per-series mark (on each series; pick one; default bars): `line` > `area`.
// - Tone (single-series only; default primary): `success`, `destructive`.
// - Curve: `curved` bends the line and area edges (monotone cubic).
// - Markers: `dots` marks line/area data points (auto-suppressed on dense plots).
// - Density: `compact`. Furniture: `hideLegend`, `hideGrid`, `hideAxes`.
// One shared zero-based y axis; a second (dual) axis is deferred scope.

export interface ComposedSeries extends ChartSeries {
  /** Render this series as a stroked line instead of bars. Precedence: line > area > bars. */
  line?: boolean;
  /** Render this series as a gradient-washed area instead of bars. */
  area?: boolean;
}

export interface ComposedChartProps extends Omit<CartesianSeriesProps, "series"> {
  /** The series to plot; each picks its mark (bars by default, `line`, or `area`). */
  series: ComposedSeries[];
  /** Mark each line/area datum with a dot (auto-suppressed when bands are under 14px). */
  dots?: boolean;
}

type MarkKind = "bars" | "line" | "area";

// Mark precedence per series, first match wins.
export function markOf(sr: ComposedSeries): MarkKind {
  if (sr.line) return "line";
  if (sr.area) return "area";
  return "bars";
}

/** Build a ComposedChart from a platform skin. */
export function createComposedChart(skin: ChartSkin) {
  return function ComposedChart(props: ComposedChartProps) {
    const ctx = useSeriesChart("ComposedChart", props, false, {});
    const curved = !!props.curved;
    const gradientId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
    const barSeries = props.series.map((sr, i) => ({ sr, i })).filter(({ sr }) => markOf(sr) === "bars");

    // Bars stand in bands (the renderer's `X(i) - 6` bar starts on the plot's edge, never
    // past it), so every mark takes the band centres.
    return chartShell(skin, props, ctx, (layout) => {
      const band = layout.band;
      // Grouped bar geometry: the bar-kind series split each band with a 2px
      // inner gap (the dataviz spacer rule the grouped Chart uses).
      const cluster = band ? Math.min(band.bandWidth, band.step * BAR_SHARE * Math.max(1, barSeries.length)) : 0;
      const barW = band && barSeries.length > 0 ? Math.max(1, (cluster - 2 * (barSeries.length - 1)) / barSeries.length) : 0;
      const clusterAt = (li: number): number => (band ? band.center(li) - cluster / 2 : 0);
      // The lead line (the first line or area series) is drawn 2.2 wide, the rest 2; a
      // dashed series is the `5 4` dash with no caps.
      const lead = props.series.findIndex((sr) => markOf(sr) !== "bars");
      const stroke = (sr: ComposedSeries, i: number) => {
        const pts = seriesPoints(sr, props.labels, layout);
        return (
          <Path
            key={`l${sr.id ?? i}`}
            d={curved ? monotonePath(pts) : linePath(pts)}
            stroke={ctx.colorOf(i)}
            strokeWidth={i === lead ? CHART_LOOK.leadStroke : CHART_LOOK.stroke}
            strokeDasharray={sr.dashed ? CHART_LOOK.seriesDash : undefined}
            fill="none"
            strokeLinejoin="round"
            strokeLinecap={sr.dashed ? "butt" : "round"}
          />
        );
      };
      return (
        <>
          {/* Area washes first (the backdrop), each with a per-instance
              gradient id: SVG ids are document-global on the web. */}
          <Defs>
            {props.series.map((sr, i) =>
              markOf(sr) === "area" ? (
                <LinearGradient key={`g${sr.id ?? i}`} id={`${gradientId}a${i}`} x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={ctx.colorOf(i)} stopOpacity={CHART_LOOK.fadeTop} />
                  <Stop offset="1" stopColor={ctx.colorOf(i)} stopOpacity={0} />
                </LinearGradient>
              ) : null,
            )}
          </Defs>
          {props.series.map((sr, i) =>
            markOf(sr) === "area" ? (
              <Path
                key={`a${sr.id ?? i}`}
                d={areaPath(seriesPoints(sr, props.labels, layout), layout.plotH, curved)}
                fill={`url(#${gradientId}a${i})`}
              />
            ) : null,
          )}
          {/* Area edges with their washes, under the bars (the section card's paint order). */}
          {props.series.map((sr, i) => (markOf(sr) === "area" ? stroke(sr, i) : null))}
          {/* Bars, splitting each band. */}
          {band
            ? barSeries.flatMap(({ sr, i }, bi) =>
                props.labels.map((_, li) => {
                  const v = finite(sr.values[li]);
                  const y = layout.y(v);
                  const h = Math.max(0, layout.plotH - y);
                  if (h <= 0) return null;
                  return (
                    <Rect
                      key={`b${sr.id ?? i}c${li}`}
                      x={clusterAt(li) + bi * (barW + 2)}
                      y={y}
                      width={barW}
                      height={h}
                      rx={Math.min(skin.barRadius, barW / 2, h / 2)}
                      fill={ctx.colorOf(i)}
                      fillOpacity={BAR_OPACITY}
                    />
                  );
                }),
              )
            : null}
          {/* Lines above the bars. */}
          {props.series.map((sr, i) => (markOf(sr) === "line" ? stroke(sr, i) : null))}
          {/* Dots on line/area data points, width-aware like LineChart's. */}
          {props.dots && band && band.step >= 14
            ? props.series.flatMap((sr, i) => {
                if (markOf(sr) === "bars") return [];
                const pts = seriesPoints(sr, props.labels, layout);
                return pts.map((p, j) => (
                  <Circle key={`d${sr.id ?? i}p${j}`} cx={p.x} cy={p.y} r={CHART_LOOK.dotRadius} fill={ctx.colorOf(i)} />
                ));
              })
            : null}
          {/* Emphasized dots on the inspected category's line/area series. */}
          {ctx.selected != null && band
            ? props.series.map((sr, i) =>
                markOf(sr) === "bars" ? null : (
                  <Circle
                    key={`sel${sr.id ?? i}`}
                    cx={band.center(ctx.selected!)}
                    cy={layout.y(finite(sr.values[ctx.selected!]))}
                    r={4.5}
                    fill={ctx.colorOf(i)}
                    stroke={ctx.tokens.card}
                    strokeWidth={1.5}
                  />
                ),
              )
            : null}
        </>
      );
    }, { bands: true });
  };
}
