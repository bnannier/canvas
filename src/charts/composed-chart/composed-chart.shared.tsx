import { useId } from "react";
import { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { type ChartSeries, type ChartSkin } from "../shared/types.js";
import { type CartesianSeriesProps, chartShell, finite, seriesPoints, useSeriesChart } from "../shared/cartesian-series.js";
import { areaPath, linePath, monotonePath, topRoundedRect } from "../shared/chart-math.js";

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
function markOf(sr: ComposedSeries): MarkKind {
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

    return chartShell(skin, props, ctx, (layout) => {
      const band = layout.band;
      // Grouped bar geometry: the bar-kind series split each band with a 2px
      // inner gap (the dataviz spacer rule the grouped Chart uses).
      const barW = band && barSeries.length > 0 ? Math.max(1, (band.bandWidth - 2 * (barSeries.length - 1)) / barSeries.length) : 0;
      return (
        <>
          {/* Area washes first (the backdrop), each with a per-instance
              gradient id: SVG ids are document-global on the web. */}
          <Defs>
            {props.series.map((sr, i) =>
              markOf(sr) === "area" ? (
                <LinearGradient key={`g${sr.id ?? i}`} id={`${gradientId}a${i}`} x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={ctx.colorOf(i)} stopOpacity={0.28} />
                  <Stop offset="1" stopColor={ctx.colorOf(i)} stopOpacity={0.02} />
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
          {/* Bars, splitting each band. */}
          {band
            ? barSeries.flatMap(({ sr, i }, bi) =>
                props.labels.map((_, li) => {
                  const v = finite(sr.values[li]);
                  const y = layout.y(v);
                  const h = Math.max(0, layout.plotH - y);
                  if (h <= 0) return null;
                  return (
                    <Path
                      key={`b${sr.id ?? i}c${li}`}
                      d={topRoundedRect(band.position(li) + bi * (barW + 2), y, barW, h, skin.barRadius)}
                      fill={ctx.colorOf(i)}
                    />
                  );
                }),
              )
            : null}
          {/* Area edges and lines above the bars. */}
          {props.series.map((sr, i) => {
            const kind = markOf(sr);
            if (kind === "bars") return null;
            const pts = seriesPoints(sr, props.labels, layout);
            return (
              <Path
                key={`l${sr.id ?? i}`}
                d={curved ? monotonePath(pts) : linePath(pts)}
                stroke={ctx.colorOf(i)}
                strokeWidth={2}
                fill="none"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            );
          })}
          {/* Dots on line/area data points, width-aware like LineChart's. */}
          {props.dots && band && band.step >= 14
            ? props.series.flatMap((sr, i) => {
                if (markOf(sr) === "bars") return [];
                const pts = seriesPoints(sr, props.labels, layout);
                return pts.map((p, j) => (
                  <Circle key={`d${sr.id ?? i}p${j}`} cx={p.x} cy={p.y} r={4} fill={ctx.colorOf(i)} stroke={ctx.tokens.card} strokeWidth={1.5} />
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
    });
  };
}
