import { useId } from "react";
import { Circle, Defs, LinearGradient, Line as SvgLine, Path, Stop } from "react-native-svg";
import { type ChartSkin } from "../shared/types.js";
import { type CartesianSeriesProps, chartShell, finite, seriesPoints, useSeriesChart } from "../shared/cartesian-series.js";
import { areaPath, linePath, monotonePath } from "../shared/chart-math.js";

// LineChart: categorical-x series lines through the shared cartesian core
// (react-native-svg marks, RN Text furniture, token colors). A "Shared"
// platform treatment - data visualization is platform-neutral - so one
// implementation serves iOS, Android, and the web.
//
// Boolean-prop axes (one boolean per choice, first-match precedence per axis):
// - Tone (single-series only; default primary): `success`, `destructive`.
//   Multi-series charts always paint the chart-1..8 series tokens.
// - Curve: `curved` draws a monotone cubic (never overshoots the data).
// - Markers: `dots` marks each datum.
// - Density: `compact` shrinks the plot and tick count.
// - Furniture: `hideLegend`, `hideGrid`, `hideAxes`.
// Plus the price-chart idiom: `baseline` + `fade`.

export interface LineChartProps extends CartesianSeriesProps {
  /** Mark each datum with a dot. */
  dots?: boolean;
  /**
   * Reference value (e.g. previous close) drawn as a dashed line. A single
   * series with no explicit tone auto-tones success/destructive by whether
   * its last value sits above or below the baseline - the trading-app
   * gain/loss idiom.
   */
  baseline?: number;
  /** Soft gradient fade under each line (the price-chart look). */
  fade?: boolean;
}

/** Build a LineChart from a platform skin. */
export function createLineChart(skin: ChartSkin) {
  return function LineChart(props: LineChartProps) {
    const baseline = Number.isFinite(props.baseline) ? (props.baseline as number) : undefined;
    // Gain/loss auto tone: single series vs the baseline, by its last value.
    const lastValue = props.series.length === 1 ? finite(props.series[0].values[props.labels.length - 1]) : undefined;
    const autoTone = baseline != null && lastValue != null ? (lastValue >= baseline ? "success" : "destructive") : undefined;
    const ctx = useSeriesChart("line", props, false, {
      extraExtent: baseline != null ? [baseline] : undefined,
      autoTone,
      // A baseline marks the price idiom: the domain hugs the data instead of
      // anchoring at zero, so intraday moves stay readable.
      zeroBased: baseline == null,
    });
    const curved = !!props.curved;
    const dots = !!props.dots;
    const gradientId = useId().replace(/[^a-zA-Z0-9_-]/g, "");

    return chartShell(skin, props, ctx, (layout) => (
      <>
        {/* Soft fade under each line (defs ids are unique per chart instance:
            SVG ids are document-global on the web). */}
        {props.fade ? (
          <Defs>
            {props.series.map((sr, i) => (
              <LinearGradient key={`g${sr.id ?? i}`} id={`${gradientId}f${i}`} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={ctx.colorOf(i)} stopOpacity={0.28} />
                <Stop offset="1" stopColor={ctx.colorOf(i)} stopOpacity={0.02} />
              </LinearGradient>
            ))}
          </Defs>
        ) : null}
        {props.fade
          ? props.series.map((sr, i) => (
              <Path
                key={`fade${sr.id ?? i}`}
                d={areaPath(seriesPoints(sr, props.labels, layout), layout.plotH, curved)}
                fill={`url(#${gradientId}f${i})`}
              />
            ))
          : null}
        {/* Dashed reference line (e.g. previous close). */}
        {baseline != null ? (
          <SvgLine
            x1={0}
            y1={layout.y(baseline)}
            x2={layout.plotW}
            y2={layout.y(baseline)}
            stroke={ctx.tokens["muted-foreground"]}
            strokeWidth={1}
            strokeDasharray="4,4"
          />
        ) : null}
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
        {/* Dots are width-aware: on a dense plot where bands are narrower than
            a dot, the markers would blob into the line, so they auto-suppress
            and the line alone carries the shape. */}
        {dots && layout.band && layout.band.step >= 14
          ? props.series.flatMap((sr, i) => {
              const pts = seriesPoints(sr, props.labels, layout);
              const color = ctx.colorOf(i);
              return pts.map((p, j) => (
                <Circle key={`${sr.id ?? `s${i}`}d${j}`} cx={p.x} cy={p.y} r={4} fill={color} stroke={ctx.tokens.card} strokeWidth={1.5} />
              ));
            })
          : null}
        {/* Emphasized intersection dots on the inspected category. */}
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
    ));
  };
}
