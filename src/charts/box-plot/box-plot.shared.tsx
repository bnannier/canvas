import { useMaterialTheme } from "../../style/glass-surface/use-material-theme.js";
import { Circle, G, Line, Rect, Text as SvgText } from "react-native-svg";
import {
  View,
  Text,
  useControllableState,
  alpha,
  devWarn,
  type LayoutStyle,
  GlassPane,
  paneStyle,
  isGlass,
} from "../../style/index.js";
import * as s from "../shared/charts.styles.js";
import { type Tone } from "../shared/charts.styles.js";
import { type ChartSkin } from "../shared/types.js";
import { ChartAnatomyScope } from "../shared/chart-anatomy.js";
import { useAnatomyPart } from "../../style/anatomy.js";
import { CartesianFrame, CHART_ROOT } from "../shared/chart-frame.js";
import {
  ChartValueFlag,
  announceSelection,
  DIM_OPACITY,
} from "../shared/chart-inspect.js";
import { useChartPresentation } from "../shared/chart-presentation.js";
import { MONO_FONT } from "../../style/mono.js";
import { PLOT_HEIGHT } from "../shared/cartesian-series.js";
import { boxStats, formatCompact } from "../shared/chart-math.js";
import { platformShape } from "../../style/platform-shape.js";

// BoxPlot: quartile boxes, whiskers, and outlier dots per category. Pass raw
// samples per category; the chart computes the Tukey five-number summary
// (quartiles by linear interpolation, whiskers at the most extreme data
// inside the 1.5 IQR fences, outliers beyond) and draws each category as a
// box on the cartesian frame. The y domain spans whisker ends and outliers,
// not zero. A "Shared" platform treatment - data visualization is
// platform-neutral - so one implementation serves iOS, Android, and the web.
//
// Boolean-prop axes (one boolean per choice, first-match precedence per axis):
// - Tone (pick one; default primary): `success` > `destructive`.
// - Density: `compact`. Furniture: `hideGrid`, `hideAxes`.

export interface BoxSample {
  /** Stable identity, used as the React key when present. */
  id?: string | number;
  /** The category label under the box. */
  label: string;
  /** Raw samples; the chart computes quartiles, whiskers, and outliers. */
  values: number[];
}

export interface BoxPlotProps {
  /** One box per category, in order. */
  data: BoxSample[];
  /** Optional heading shown above the plot. */
  title?: string;
  // Tone (pick one; default primary). Precedence: success > destructive.
  success?: boolean;
  destructive?: boolean;
  // Density (omit for the default plot size).
  compact?: boolean;
  /** Strip the card surface for nesting inside an existing card (mirrors Stats). */
  plain?: boolean;
  // Furniture visibility.
  hideGrid?: boolean;
  hideAxes?: boolean;
  /** Formats tick labels, the flag, and the accessible name. */
  formatValue?: (v: number) => string;
  /** Scrub-to-inspect: the selected category index (controlled). Pass null for none. */
  selected?: number | null;
  /** Scrub-to-inspect: the initially selected category (uncontrolled). */
  defaultSelected?: number;
  /** Fired when a press/scrub selects a category (or clears it with null). */
  onSelect?: (index: number | null) => void;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. */
  style?: LayoutStyle;
}

// Tone precedence within the axis, first match wins.
export function toneOf(p: BoxPlotProps): Tone {
  if (p.success) return "success";
  if (p.destructive) return "destructive";
  return "primary";
}

const MIN_SAMPLES = 5;

/** Build a BoxPlot from a platform skin. */
export function createBoxPlot(skin: ChartSkin) {
  return function BoxPlot(props: BoxPlotProps) {
    // The anatomy parts a docs AnatomyProvider numbers (src/style/anatomy.tsx), in the
    // hand-off's order: Chart frame, Box, Axis labels, Median, Gridlines, taken before the
    // tree's AnatomyScope and handed to the shared frame (chart-anatomy.tsx).
    const framePart = useAnatomyPart("Chart frame");
    const boxPart = useAnatomyPart("Box");
    const axisPart = useAnatomyPart("Axis labels");
    const medianPart = useAnatomyPart("Median");
    const gridPart = useAnatomyPart("Gridlines");
    const { data, title, testID, style } = props;
    const theme = useMaterialTheme({ layer: "content" });
    const { tokens } = theme;
    const surfaceShape = s.surface(tokens, skin.surfaceRadius);
    const glass = isGlass(theme);
    const compact = !!props.compact;
    const presentation = useChartPresentation();
    const specimen = presentation?.kind === "box";
    const formatValue = props.formatValue ?? formatCompact;
    const fill = s.barFill(tokens, toneOf(props));

    devWarn(
      data.length === 0,
      "[canvas] <BoxPlot />: `data` is empty; the chart renders with no boxes."
    );
    devWarn(
      data.some(
        (d) => d.values.filter((v) => Number.isFinite(v)).length < MIN_SAMPLES
      ),
      `[canvas] <BoxPlot />: a category has fewer than ${MIN_SAMPLES} samples; its quartiles are not meaningful.`
    );

    const stats =
      specimen && presentation.boxSummaries
        ? presentation.boxSummaries
        : data.map((d) => boxStats(d.values));
    const labels = data.map((d) => d.label);

    // The domain spans whisker ends and outliers, hugging the data.
    const pool = stats.flatMap((st) => [st.min, st.max, ...st.outliers]);
    const yExtent: [number, number] =
      pool.length > 0 ? [Math.min(...pool), Math.max(...pool)] : [0, 1];

    // The accessible name gives each category its five-number summary.
    const name = data
      .map((d, i) => {
        const st = stats[i];
        const outliers =
          st.outliers.length > 0
            ? `, ${st.outliers.length} ${
                st.outliers.length === 1 ? "outlier" : "outliers"
              }`
            : "";
        return `${d.label}: median ${formatValue(
          st.median
        )}, quartiles ${formatValue(st.q1)} to ${formatValue(
          st.q3
        )}, range ${formatValue(st.min)} to ${formatValue(st.max)}${outliers}`;
      })
      .join("; ");

    const [selected, setSelectedRaw] = useControllableState<number | null>(
      props.selected,
      props.defaultSelected ?? null,
      props.onSelect
    );
    const setSelected = (i: number | null) => {
      if (i === selected) return;
      setSelectedRaw(i);
      if (i != null && stats[i] != null) {
        const st = stats[i];
        announceSelection(
          `${labels[i]}: median ${formatValue(
            st.median
          )}, quartiles ${formatValue(st.q1)} to ${formatValue(st.q3)}`
        );
      }
    };

    return (
      <ChartAnatomyScope parts={{ frame: framePart, marks: stats.length > 0 ? [boxPart, medianPart] : undefined, axisLabels: axisPart, xLabels: true, gridlines: gridPart }}>
        <View
          {...(title != null && title !== ""
            ? {
                role: "group" as const,
                accessibilityLabel: `${title} chart`,
                "aria-label": `${title} chart`,
              }
            : {})}
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
          <View
            accessible
            accessibilityRole="image"
            role="img"
            accessibilityLabel={name}
            aria-label={name}
          >
            <CartesianFrame
              yExtent={yExtent}
              xLabels={labels}
              plotHeight={compact ? PLOT_HEIGHT.compact : PLOT_HEIGHT.default}
              compact={compact}
              hideGrid={props.hideGrid}
              hideAxes={props.hideAxes}
              formatValue={formatValue}
              selectedBand={selected}
              noGuide
              onBandScrub={setSelected}
              overlay={(layout) =>
                !specimen &&
                selected != null &&
                layout.band &&
                stats[selected] != null ? (
                  <ChartValueFlag
                    title={props.hideAxes ? labels[selected] : undefined}
                    rows={[
                      { label: "Max", value: formatValue(stats[selected].max) },
                      { label: "Q3", value: formatValue(stats[selected].q3) },
                      {
                        label: "Median",
                        value: formatValue(stats[selected].median),
                      },
                      { label: "Q1", value: formatValue(stats[selected].q1) },
                      { label: "Min", value: formatValue(stats[selected].min) },
                    ]}
                    x={layout.band.center(selected)}
                    plotW={layout.plotW}
                  />
                ) : null
              }
            >
              {(layout) => {
                const band = layout.band;
                if (!band) return null;
                if (specimen) {
                  // Authored summaries are explicit room data; raw-sample charts retain Tukey estimation.
                  const k = layout.scale;
                  return (
                    <>
                      {stats.map((st, i) => {
                        const [hi, q3, median, q1, lo] = [
                          150 - st.max,
                          150 - st.q3,
                          150 - st.median,
                          150 - st.q1,
                          150 - st.min,
                        ];
                        const x = (28 + i * 56) * k;
                        return (
                          <G key={i}>
                            <Line
                              x1={x}
                              x2={x}
                              y1={hi * k}
                              y2={q3 * k}
                              stroke={fill}
                              strokeWidth={1.5 * k}
                            />
                            <Line
                              x1={x}
                              x2={x}
                              y1={q1 * k}
                              y2={lo * k}
                              stroke={fill}
                              strokeWidth={1.5 * k}
                            />
                            {[hi, lo].map((v, j) => (
                              <Line
                                key={j}
                                x1={x - 7 * k}
                                x2={x + 7 * k}
                                y1={v * k}
                                y2={v * k}
                                stroke={fill}
                                strokeWidth={1.5 * k}
                              />
                            ))}
                            {st.outliers.map((outlier, oi) => (
                              <Circle
                                key={oi}
                                cx={x}
                                cy={(150 - outlier) * k}
                                r={2.5 * k}
                                fill="none"
                                stroke={fill}
                                strokeWidth={1.5 * k}
                              />
                            ))}
                            <Rect
                              x={x - 13 * k}
                              y={q3 * k}
                              width={26 * k}
                              height={(q1 - q3) * k}
                              rx={platformShape.web.mark * k}
                              fill={fill}
                              fillOpacity={selected === i ? 0.38 : 0.18}
                              stroke={fill}
                              strokeWidth={(selected === i ? 2 : 1.5) * k}
                            />
                            <Line
                              x1={x - 11 * k}
                              x2={x + 11 * k}
                              y1={median * k}
                              y2={median * k}
                              stroke={fill}
                              strokeWidth={2.5 * k}
                              strokeLinecap="round"
                            />
                            <SvgText
                              x={x}
                              y={142 * k}
                              fontFamily={MONO_FONT}
                              fontSize={s.CHART_LOOK.authoredAxisSize * k}
                              fill={
                                selected === i
                                  ? tokens.foreground
                                  : tokens["subtle-foreground"]
                              }
                              textAnchor="middle"
                            >
                              {labels[i]}
                            </SvgText>
                          </G>
                        );
                      })}
                    </>
                  );
                }
                // The hand-off's box: 28 units of a 75-unit band (0.37 of the step).
                const boxW = Math.max(6, Math.min(40, band.step * 0.37));
                return (
                  <>
                    {stats.map((st, i) => {
                      const cx = band.center(i);
                      const dim =
                        selected != null && selected !== i ? DIM_OPACITY : 1;
                      const picked = selected === i;
                      const cap = boxW / 2;
                      return (
                        <G key={data[i].id ?? i} opacity={dim}>
                          {/* The whisker spine, ended by a cap half the box wide at each end (the
                              section card's whiskers; the renderer draws the spine alone). */}
                          <Line
                            x1={cx}
                            y1={layout.y(st.max)}
                            x2={cx}
                            y2={layout.y(st.min)}
                            stroke={fill}
                            strokeWidth={1.5}
                          />
                          <Line
                            x1={cx - cap / 2}
                            y1={layout.y(st.max)}
                            x2={cx + cap / 2}
                            y2={layout.y(st.max)}
                            stroke={fill}
                            strokeWidth={1.5}
                          />
                          <Line
                            x1={cx - cap / 2}
                            y1={layout.y(st.min)}
                            x2={cx + cap / 2}
                            y2={layout.y(st.min)}
                            stroke={fill}
                            strokeWidth={1.5}
                          />
                          {/* The interquartile box over the spine. */}
                          <Rect
                            x={cx - boxW / 2}
                            y={layout.y(st.q3)}
                            width={boxW}
                            height={Math.max(
                              1,
                              layout.y(st.q1) - layout.y(st.q3)
                            )}
                            rx={Math.min(platformShape.web.mark, boxW / 4)}
                            // The inspected box reads denser under a heavier edge (the section card's .38 / 2).
                            fill={alpha(fill, picked ? 0.38 : 0.25)}
                            stroke={fill}
                            strokeWidth={picked ? 2 : 1}
                          />
                          {/* Median line. */}
                          <Line
                            x1={cx - boxW / 2}
                            y1={layout.y(st.median)}
                            x2={cx + boxW / 2}
                            y2={layout.y(st.median)}
                            stroke={fill}
                            strokeWidth={2}
                          />
                          {/* Outliers beyond the fences. */}
                          {st.outliers.map((v, oi) => (
                            <Circle
                              key={oi}
                              cx={cx}
                              cy={layout.y(v)}
                              r={2.5}
                              fill="none"
                              stroke={fill}
                              strokeWidth={1.5}
                            />
                          ))}
                        </G>
                      );
                    })}
                  </>
                );
              }}
            </CartesianFrame>
          </View>
        </View>
      </ChartAnatomyScope>
    );
  };
}
