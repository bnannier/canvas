import { Circle, Path } from "react-native-svg";
import { alpha } from "../../style/index.js";
import { type ChartSkin } from "../shared/types.js";
import { type CartesianSeriesProps, chartShell, finite, seriesPoints, useSeriesChart } from "../shared/cartesian-series.js";
import { areaBandPath, areaPath, linePath, monotonePath, stackSeries, type Pt } from "../shared/chart-math.js";

// AreaChart: categorical-x series fills through the shared cartesian core.
// Overlapping translucent fills by default; `stacked` accumulates the series
// as running-sum bands instead. A "Shared" platform treatment like the rest
// of the Chart family.

export interface AreaChartProps extends CartesianSeriesProps {
  /** Stack the series (running sums) instead of overlapping translucent fills. */
  stacked?: boolean;
}

/** Build an AreaChart from a platform skin. */
export function createAreaChart(skin: ChartSkin) {
  return function AreaChart(props: AreaChartProps) {
    const stacked = !!props.stacked && props.series.length > 1;
    const ctx = useSeriesChart("AreaChart", props, stacked);
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
            {ctx.selected != null
              ? props.series.map((sr, i) => (
                  <Circle
                    key={`sel${sr.id ?? i}`}
                    cx={band.center(ctx.selected!)}
                    cy={layout.y(bands[i][ctx.selected!]?.[1] ?? 0)}
                    r={4.5}
                    fill={ctx.colorOf(i)}
                    stroke={ctx.tokens.card}
                    strokeWidth={1.5}
                  />
                ))
              : null}
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
          {ctx.selected != null && layout.band
            ? props.series.map((sr, i) => (
                <Circle
                  key={`sel${sr.id ?? i}`}
                  cx={layout.band!.center(ctx.selected!)}
                  cy={layout.y(finite(sr.values[ctx.selected!]))}
                  r={4.5}
                  fill={ctx.colorOf(i)}
                  stroke={ctx.tokens.card}
                  strokeWidth={1.5}
                />
              ))
            : null}
        </>
      );
    });
  };
}
