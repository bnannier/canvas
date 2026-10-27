import Svg, { Path } from "react-native-svg";
import { View, Text, useTheme, statusColors, devWarn, type ColorTokens, type LayoutStyle } from "../../style/index.js";
import { DISPLAY_FONT } from "../../style/mono.js";

// Gauge is a "Shared" platform treatment (data visualization is
// platform-neutral): one implementation serves iOS, Android, and the web.

// Gauge: a 180 degree top semicircular arc (muted track + a tone-colored value
// arc), the percent readout sitting in the open center of the semicircle, and
// the optional label below the graphic.

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
  style?: LayoutStyle;
}

// Tone precedence within the axis: success > warning > destructive (first match
// wins; no tone falls back to the brand primary). Each tone is its solid status color
// (statusColors' dot), so a warning gauge reads the same as a warning badge or alert.
// Exported for tests (not re-exported from the barrel).
export function gaugeFill(tokens: ColorTokens, p: GaugeProps): string {
  if (p.success) return statusColors(tokens, "success").dot;
  if (p.warning) return statusColors(tokens, "warning").dot;
  if (p.destructive) return statusColors(tokens, "error").dot;
  return tokens.primary;
}

// The v4 hand-off's dial (`K.def('gauge')`): a 200 x 116 viewBox drawn 240 wide, the arc
// a radius-80 top semicircle from (20, 104) to (180, 104) in a 14-wide round-capped
// stroke on the raised surface, the value in the display face at 36 (500) with its
// baseline at 96, and a 0 / label / 100 scale row under it. The geometry below is in
// the viewBox's units; the Svg scales it to the 240 px width.
const VIEW_W = 200;
const VIEW_H = 116;
const SIZE = 240;
const SCALE = SIZE / VIEW_W;
const STROKE = 14;
const INSET = 20;
const BASE = 104;
const RADIUS = VIEW_W / 2 - INSET;
const SEMICIRCUMFERENCE = Math.PI * RADIUS;
const GRAPHIC_HEIGHT = VIEW_H * SCALE;
const VALUE_SIZE = 36 * SCALE;
const VALUE_LINE = Math.round(VALUE_SIZE * 1.1);
// The value's line box, placed so its baseline lands on the viewBox's y 96.
const VALUE_TOP = 96 * SCALE - VALUE_SIZE * 0.92;

// Pure semicircle geometry, exported for tests (not re-exported from the
// barrel), following the gaugeFill precedent. The track and value arcs share
// one path (a single 180 degree top sweep from the left end to the right end);
// the value arc reveals its share of the track's length through the dash
// pattern.
export function gaugeArc(v: number): { d: string; dasharray: string } {
  return {
    d: `M ${INSET} ${BASE} A ${RADIUS} ${RADIUS} 0 0 1 ${VIEW_W - INSET} ${BASE}`,
    dasharray: `${SEMICIRCUMFERENCE * (v / 100)} ${SEMICIRCUMFERENCE}`,
  };
}

/** A radial dial: a track, a tone-colored fill arc and the value inside. */
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
  // Per the hand-off, the readout shows a whole percent (the display rounds);
  // the arc keeps the fractional value so the fill stays exact. The accessible
  // name announces the same number the eye sees.
  const pct = Math.round(v);
  const fill = gaugeFill(tokens, props);
  const arc = gaugeArc(v);

  return (
    <View
      testID={testID}
      style={[{ width: SIZE }, style]}
      accessibilityRole="image"
      accessibilityLabel={`${label ?? "Gauge"}: ${pct}%`}
      aria-label={`${label ?? "Gauge"}: ${pct}%`}
    >
      <Svg width={SIZE} height={GRAPHIC_HEIGHT} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}>
        <Path d={arc.d} fill="none" stroke={tokens["surface-raised"] ?? tokens.muted} strokeWidth={STROKE} strokeLinecap="round" />
        <Path
          d={arc.d}
          fill="none"
          stroke={fill}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={arc.dasharray}
        />
      </Svg>
      {/* The readout sits in the open center of the semicircle, its baseline on the
          hand-off's y 96: the component's own anatomy, not a call-site shim. */}
      <Text
        style={{
          position: "absolute",
          top: VALUE_TOP,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: DISPLAY_FONT,
          fontSize: VALUE_SIZE,
          lineHeight: VALUE_LINE,
          fontWeight: "500",
          color: tokens.foreground,
        }}
      >
        {pct}%
      </Text>
      {/* The scale row: the dial's ends with the caption between them. */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={scaleText(tokens)}>0</Text>
        {label ? <Text style={scaleText(tokens)}>{label}</Text> : null}
        <Text style={scaleText(tokens)}>100</Text>
      </View>
    </View>
  );
}

// The scale row's type: the hand-off's 12 px caption in the subtle ink.
function scaleText(tokens: ColorTokens) {
  return { fontSize: 12, lineHeight: 16, color: tokens["subtle-foreground"] ?? tokens["muted-foreground"] };
}
