import { useId } from "react";
import Svg, { Path } from "react-native-svg";
import { Defs, GlowFilter } from "../shared/chart-glow.js";
import { View, Text, useTheme, statusColors, devWarn, alpha, type ColorTokens, type LayoutStyle } from "../../style/index.js";
import { CHART_LOOK } from "../shared/charts.styles.js";
import { DISPLAY_FONT, MONO_FONT } from "../../style/mono.js";

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
  /** Use the wider 250 px adoption dial. */
  large?: boolean;
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
const STROKE = 14;
const INSET = 20;
const BASE = 104;
const RADIUS = VIEW_W / 2 - INSET;
const SEMICIRCUMFERENCE = Math.PI * RADIUS;

// Pure semicircle geometry, exported for tests (not re-exported from the
// barrel), following the gaugeFill precedent. The track and value arcs share
// one path (a single 180 degree top sweep from the left end to the right end);
// the value arc reveals its share of the track's length through the dash
// pattern.
/** The value arc's glow length in px (the renderer's 8 px drop shadow in the tone). */
const ARC_GLOW = 6;

export function gaugeArc(v: number): { d: string; dasharray: string } {
  return {
    d: `M ${INSET} ${BASE} A ${RADIUS} ${RADIUS} 0 0 1 ${VIEW_W - INSET} ${BASE}`,
    dasharray: `${SEMICIRCUMFERENCE * (v / 100)} ${SEMICIRCUMFERENCE}`,
  };
}

/** A radial dial: a track, a tone-colored fill arc and the value inside. */
export function Gauge(props: GaugeProps) {
  const { value, label, testID, style } = props;
  const { tokens, dark } = useTheme();
  const size = props.large ? 250 : SIZE;
  const scale = size / VIEW_W;
  const valueSize = 36 * scale;
  const valueLine = Math.round(valueSize * 1.1);
  const valueTop = 96 * scale - valueSize * .92 + (props.large ? 2 : 0);
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
  const glowId = `${useId().replace(/[^a-zA-Z0-9_-]/g, "")}glow`;

  return (
    <View
      testID={testID}
      style={[{ width: size }, style]}
      accessibilityRole="image"
      accessibilityLabel={`${label ?? "Gauge"}: ${pct}%`}
      aria-label={`${label ?? "Gauge"}: ${pct}%`}
    >
      <Svg width={size} height={VIEW_H * scale} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}>
        <Defs>
          {/* The arc's glow, in the view's units: the renderer's `drop-shadow(0 0 8px <tone>)`. */}
          <GlowFilter id={glowId} length={(ARC_GLOW * VIEW_W) / size} />
        </Defs>
        <Path d={arc.d} fill="none" stroke={tokens["surface-raised"] ?? tokens.muted} strokeWidth={STROKE} strokeLinecap="round" />
        {v > 0 ? <Path d={arc.d} fill="none" stroke={props.large ? alpha(fill, dark ? .5 : .4) : fill} strokeWidth={STROKE} strokeLinecap="round" strokeDasharray={arc.dasharray} filter={`url(#${glowId})`} /> : null}
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
          top: valueTop,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: DISPLAY_FONT,
          fontSize: valueSize,
          lineHeight: valueLine,
          fontWeight: "500",
          letterSpacing: -1.4 * scale,
          color: tokens.foreground,
        }}
      >
        {pct}%
      </Text>
      {/* The scale row: the dial's ends with the caption between them. */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: props.large ? 8 : -6, paddingHorizontal: 6 }}>
        <Text style={scaleText(tokens)}>0</Text>
        {label ? <Text style={{ fontSize: 12, lineHeight: 15, fontWeight: "500", color: tokens["muted-foreground"] }}>{label}</Text> : null}
        <Text style={scaleText(tokens)}>100</Text>
      </View>
    </View>
  );
}

// The scale row's type: the hand-off's 12 px caption in the subtle ink.
function scaleText(tokens: ColorTokens) {
  return { fontFamily: MONO_FONT, fontSize: CHART_LOOK.axisSize, lineHeight: 15, color: tokens["subtle-foreground"] ?? tokens["muted-foreground"] };
}
