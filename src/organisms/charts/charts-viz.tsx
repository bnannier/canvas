import Svg, { Circle } from "react-native-svg";
import { View, Text, useTheme, palette, alpha, type ColorTokens, type StyleProp, type ViewStyle } from "../../style/index.js";

// Additional chart types that share the Chart family's token-driven, View/SVG
// look, so no call site hand-composes a stacked bar, a gauge ring, or a heatmap
// grid out of raw `width`/`backgroundColor`/`borderRadius` Views. Like Chart,
// these are a "Shared" platform treatment (data visualization is platform-neutral),
// so one implementation serves iOS, Android, and the web.

// The categorical series palette for a stacked bar's segments, in order. Chosen to
// stay legible in light and dark; segments cycle through it by index.
const SERIES_HUES = ["indigo-500", "teal-500", "amber-500", "rose-500", "violet-500", "cyan-500", "emerald-500", "pink-500"];
const seriesColor = (i: number): string => palette[SERIES_HUES[i % SERIES_HUES.length]];

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
  /** Hide the legend (the labelled dots below the bar). */
  hideLegend?: boolean;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** For sizing/composition only. */
  style?: StyleProp<ViewStyle>;
}

export function StackedBar({ segments, hideLegend, testID, style }: StackedBarProps) {
  const { tokens } = useTheme();
  const total = Math.max(
    1,
    segments.reduce((sum, seg) => sum + Math.max(0, Number.isFinite(seg.value) ? seg.value : 0), 0),
  );
  const pct = (v: number) => (Math.max(0, Number.isFinite(v) ? v : 0) / total) * 100;

  return (
    <View testID={testID} style={style} accessibilityRole="image" accessibilityLabel="Stacked bar">
      <View style={{ flexDirection: "row", overflow: "hidden", borderRadius: 9999, height: 10 }}>
        {segments.map((seg, i) => (
          <View key={i} style={{ width: `${pct(seg.value)}%`, backgroundColor: seriesColor(i) }} />
        ))}
      </View>
      {hideLegend ? null : (
        <View style={{ marginTop: 12, flexDirection: "column", gap: 8 }}>
          {segments.map((seg, i) => (
            <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={{ borderRadius: 9999, height: 8, width: 8, backgroundColor: seriesColor(i) }} />
              <Text style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", fontSize: 14, lineHeight: 20, color: tokens["card-foreground"] }}>
                {seg.label}
              </Text>
              <Text style={{ fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] }}>{Math.round(pct(seg.value))}%</Text>
            </View>
          ))}
        </View>
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
  /** Hide the less-to-more legend row. */
  hideLegend?: boolean;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** For sizing/composition only. */
  style?: StyleProp<ViewStyle>;
}

export function Heatmap({ values, hideLegend, testID, style }: HeatmapProps) {
  const { tokens } = useTheme();
  const cell = (intensity: number, box: number, key: number) => {
    const t = Math.max(0.08, Math.min(1, Number.isFinite(intensity) ? intensity : 0));
    return <View key={key} style={{ borderRadius: 2, height: box, width: box, backgroundColor: alpha(tokens.primary, t) }} />;
  };
  return (
    <View testID={testID} style={style} accessibilityRole="image" accessibilityLabel="Heatmap">
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>{values.map((v, i) => cell(v, 18, i))}</View>
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
