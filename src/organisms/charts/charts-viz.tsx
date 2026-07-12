import Svg, { Circle, Path } from "react-native-svg";
import { View, Text, useTheme, palette, alpha, devWarn, type ColorTokens, type StyleProp, type ViewStyle } from "../../style/index.js";
import { seriesFill } from "./charts.styles.js";
import { ChartLegend } from "./chart-legend.js";
import { arcPath, formatCompact, pieLayout } from "./chart-math.js";

// Additional chart types that share the Chart family's token-driven, View/SVG
// look, so no call site hand-composes a stacked bar, a gauge ring, or a heatmap
// grid out of raw `width`/`backgroundColor`/`borderRadius` Views. Like Chart,
// these are a "Shared" platform treatment (data visualization is platform-neutral),
// so one implementation serves iOS, Android, and the web.
//
// Series colors come from the theme's chart-1..chart-8 tokens via seriesFill
// (charts.styles.ts), so the categorical palette is brandable through
// ThemeProvider token overrides.

// ---------------------------------------------------------------------------
// StackedBar: one proportional horizontal bar split into colored segments, with a
// legend (dot + label + %) so each band is identified.

export interface StackedSegment {
  /** The segment label shown in the legend. */
  label: string;
  /** The segment magnitude; each segment's width is its share of the total. */
  value: number;
}

export interface StackedBarProps {
  segments: StackedSegment[];
  /** What the bar measures (e.g. "Traffic sources"); leads the accessible name. */
  label?: string;
  /** Hide the legend (the labelled dots below the bar). */
  hideLegend?: boolean;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** For sizing/composition only. */
  style?: StyleProp<ViewStyle>;
}

export function StackedBar({ segments, label, hideLegend, testID, style }: StackedBarProps) {
  const { tokens } = useTheme();
  const rawTotal = segments.reduce((sum, seg) => sum + Math.max(0, Number.isFinite(seg.value) ? seg.value : 0), 0);
  // Floor the divisor at 1 so an all-zero (or empty) bar divides cleanly to 0%
  // widths rather than producing NaN.
  const total = Math.max(1, rawTotal);
  const pct = (v: number) => (Math.max(0, Number.isFinite(v) ? v : 0) / total) * 100;

  // No segments, or every segment zero, both render an empty bar: warn so the
  // developer sees the degenerate input instead of a silently blank strip.
  devWarn(segments.length === 0, "[canvas] <StackedBar />: `segments` is empty; the bar renders empty.");
  devWarn(
    segments.length > 0 && rawTotal <= 0,
    "[canvas] <StackedBar />: all segment values are zero; the bar renders empty.",
  );

  // The accessible name carries the data itself, so a screen reader hears the
  // composition ("Traffic sources: Direct 42%, …"), not a bare "Stacked bar".
  const name = `${label ?? "Stacked bar"}: ${segments.map((seg) => `${seg.label} ${Math.round(pct(seg.value))}%`).join(", ")}`;
  // role="img" makes its whole subtree presentational to assistive tech, which
  // would silence the legend text; so while the legend renders, the image role
  // (and data-bearing name) sits on the plot row only, leaving the legend
  // reachable. With the legend hidden, the root itself is the image.
  const img = { accessibilityRole: "image", accessibilityLabel: name, "aria-label": name } as const;

  return (
    <View testID={testID} style={style} {...(hideLegend ? img : {})}>
      <View {...(hideLegend ? {} : img)} style={{ flexDirection: "row", overflow: "hidden", borderRadius: 9999, height: 10 }}>
        {segments.map((seg, i) => (
          <View key={i} style={{ width: `${pct(seg.value)}%`, backgroundColor: seriesFill(tokens, i) }} />
        ))}
      </View>
      {hideLegend ? null : (
        <ChartLegend
          items={segments.map((seg, i) => ({
            label: seg.label,
            color: seriesFill(tokens, i),
            detail: `${Math.round(pct(seg.value))}%`,
          }))}
        />
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Gauge: a ring (muted track + a tone-colored fill arc for the value) with the
// value and an optional label centered inside.

export type GaugeTone = "primary" | "success" | "destructive";

export interface GaugeProps {
  /** The value to display, 0–100. */
  value: number;
  /** A short caption beneath the number (e.g. "Uptime"). */
  label?: string;
  // Tone of the fill arc (pick one; default primary).
  primary?: boolean;
  success?: boolean;
  destructive?: boolean;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** For sizing/composition only. */
  style?: StyleProp<ViewStyle>;
}

function gaugeFill(tokens: ColorTokens, p: GaugeProps): string {
  if (p.success) return palette["green-500"];
  if (p.destructive) return palette["red-500"];
  return tokens.primary;
}

export function Gauge(props: GaugeProps) {
  const { value, label, testID, style } = props;
  const { tokens } = useTheme();
  // Gauge is a 0–100 dial; an out-of-range value is clamped, but warn so the
  // developer notices the input was outside the supported range.
  devWarn(
    Number.isFinite(value) && (value < 0 || value > 100),
    "[canvas] <Gauge />: `value` is outside 0–100; it is clamped to that range.",
  );
  const v = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  const size = 120;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const fill = gaugeFill(tokens, props);

  return (
    <View
      testID={testID}
      style={[{ width: size, height: size, alignItems: "center", justifyContent: "center" }, style]}
      accessibilityRole="image"
      accessibilityLabel={`${label ?? "Gauge"}: ${v}%`}
      aria-label={`${label ?? "Gauge"}: ${v}%`}
    >
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={tokens.muted} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={fill}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - v / 100)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={{ alignItems: "center" }}>
        <Text style={{ fontSize: 24, lineHeight: 32, fontWeight: "600", color: tokens["card-foreground"] }}>{v}%</Text>
        {label ? <Text style={{ fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] }}>{label}</Text> : null}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Heatmap: a wrapping grid of cells whose fill intensity (a wash of the primary
// hue) encodes each value (0–1), with an optional less-to-more legend.

export interface HeatmapProps {
  /** Cell intensities, 0–1; each becomes one square, alpha-scaled from the primary hue. */
  values: number[];
  /** What the grid measures (e.g. "Contribution activity"); leads the accessible name. */
  label?: string;
  /** Hide the less-to-more legend row. */
  hideLegend?: boolean;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** For sizing/composition only. */
  style?: StyleProp<ViewStyle>;
}

export function Heatmap({ values, label, hideLegend, testID, style }: HeatmapProps) {
  const { tokens } = useTheme();
  // No values means no cells: warn so an empty grid is not mistaken for one that
  // failed to style.
  devWarn(values.length === 0, "[canvas] <Heatmap />: `values` is empty; the grid renders with no cells.");
  const cell = (intensity: number, box: number, key: number) => {
    const t = Math.max(0.08, Math.min(1, Number.isFinite(intensity) ? intensity : 0));
    return <View key={key} style={{ borderRadius: 2, height: box, width: box, backgroundColor: alpha(tokens.primary, t) }} />;
  };
  // Name the grid with its size so assistive tech hears the scope of the data.
  const name = `${label ?? "Heatmap"}, ${values.length} cells`;
  // Same img-placement rule as StackedBar: while the less-to-more legend renders,
  // the image role sits on the cell grid only so the legend text stays reachable.
  const img = { accessibilityRole: "image", accessibilityLabel: name, "aria-label": name } as const;
  return (
    <View testID={testID} style={style} {...(hideLegend ? img : {})}>
      <View {...(hideLegend ? {} : img)} style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>{values.map((v, i) => cell(v, 18, i))}</View>
      {hideLegend ? null : (
        <View style={{ marginTop: 12, flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={{ fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] }}>Less</Text>
          {[0.2, 0.4, 0.6, 0.8, 1].map((v, i) => cell(v, 12, 100 + i))}
          <Text style={{ fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] }}>More</Text>
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// PieChart: proportional composition as arc slices (donut with the total and a
// label centered inside), colored by the chart-1..8 tokens in fixed order,
// with the StackedBar-style legend identifying each slice.

export interface PieChartProps {
  /** The slices, in order; each takes its share of the circle. */
  slices: StackedSegment[];
  /** What the pie measures (e.g. "Traffic sources"); leads the accessible name. */
  label?: string;
  /** Draw an annular ring with the total and label centered inside. */
  donut?: boolean;
  /** Hide the legend (the labelled dots beside percentages). */
  hideLegend?: boolean;
  /** Smaller diameter. */
  compact?: boolean;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** For sizing/composition only. */
  style?: StyleProp<ViewStyle>;
}

export function PieChart({ slices, label, donut, hideLegend, compact, testID, style }: PieChartProps) {
  const { tokens } = useTheme();
  const clean = slices.map((sl) => (Number.isFinite(sl.value) && sl.value > 0 ? sl.value : 0));
  const rawTotal = clean.reduce((a, b) => a + b, 0);
  const total = Math.max(1, rawTotal);
  const pctOf = (v: number) => Math.round(((Number.isFinite(v) && v > 0 ? v : 0) / total) * 100);

  devWarn(slices.length === 0, "[canvas] <PieChart />: `slices` is empty; the chart renders empty.");
  devWarn(slices.length > 0 && rawTotal <= 0, "[canvas] <PieChart />: all slice values are zero; the chart renders empty.");
  devWarn(
    slices.length > 8,
    "[canvas] <PieChart />: more than 8 slices cycles the series palette; fold small slices into an “Other” slice.",
  );

  const size = compact ? 120 : 160;
  const r = size / 2;
  const rInner = donut ? r * 0.62 : 0;
  const layout = pieLayout(clean);

  // Same naming formula as StackedBar: the composition lives in the accessible
  // name, and the img role sits on the plot while the legend renders (hoisting
  // to the root when the legend is hidden).
  const name = `${label ?? "Pie chart"}: ${slices.map((sl) => `${sl.label} ${pctOf(sl.value)}%`).join(", ")}`;
  const img = { accessibilityRole: "image", accessibilityLabel: name, "aria-label": name } as const;

  return (
    <View testID={testID} style={style} {...(hideLegend ? img : {})}>
      <View {...(hideLegend ? {} : img)} style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
        <Svg width={size} height={size} style={{ position: "absolute" }}>
          {layout.map((slice, i) =>
            slice.fraction > 0 ? (
              <Path
                key={i}
                d={arcPath(r, r, r - 1, rInner, slice.startAngle, slice.endAngle)}
                fill={seriesFill(tokens, i)}
                // A hairline of the card surface keeps adjacent fills separable.
                stroke={tokens.card}
                strokeWidth={2}
              />
            ) : null,
          )}
        </Svg>
        {donut ? (
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: compact ? 20 : 24, lineHeight: compact ? 28 : 32, fontWeight: "600", color: tokens["card-foreground"] }}>
              {formatCompact(rawTotal)}
            </Text>
            {label ? <Text style={{ fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] }}>{label}</Text> : null}
          </View>
        ) : null}
      </View>
      {hideLegend ? null : (
        <ChartLegend
          items={slices.map((sl, i) => ({
            label: sl.label,
            color: seriesFill(tokens, i),
            detail: `${pctOf(sl.value)}%`,
          }))}
        />
      )}
    </View>
  );
}
