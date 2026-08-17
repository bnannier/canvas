import Svg, { Circle } from "react-native-svg";
import { View, Text, useTheme, palette, statusHues, devWarn, type ColorTokens, type StyleProp, type ViewStyle } from "../../style/index.js";

// Gauge is a "Shared" platform treatment (data visualization is
// platform-neutral): one implementation serves iOS, Android, and the web.

// Gauge: a ring (muted track + a tone-colored fill arc for the value) with the
// value and an optional label centered inside.

export type GaugeTone = "primary" | "success" | "warning" | "destructive";

export interface GaugeProps {
  /** The value to display, 0–100. */
  value: number;
  /** A short caption beneath the number (e.g. "Uptime"). */
  label?: string;
  // Tone of the fill arc (pick one; default primary). Precedence when several
  // are passed: success > warning > destructive (first match wins).
  primary?: boolean;
  success?: boolean;
  warning?: boolean;
  destructive?: boolean;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** For sizing/composition only. */
  style?: StyleProp<ViewStyle>;
}

// Tone precedence within the axis: success > warning > destructive (first match
// wins; no tone falls back to the brand primary). The warning hue resolves
// through the shared statusHues map so a warning gauge reads the same amber as a
// warning badge or alert. Exported for tests (not re-exported from the barrel).
export function gaugeFill(tokens: ColorTokens, p: GaugeProps): string {
  if (p.success) return palette["green-500"];
  if (p.warning) return palette[`${statusHues.warning}-500`];
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
