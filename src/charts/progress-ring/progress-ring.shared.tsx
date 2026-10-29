import { useId } from "react";
import Svg, { Path } from "react-native-svg";
import { Icon } from "../../atoms/icon/icon.js";
import { View, Text, useTheme, statusColors, devWarn, type ColorTokens, type LayoutStyle } from "../../style/index.js";
import { DISPLAY_FONT } from "../../style/mono.js";
import { Defs, GlowFilter } from "../shared/chart-glow.js";

// ProgressRing is a "Shared" platform treatment (data visualization is
// platform-neutral): one implementation serves iOS, Android, and the web.
//
// ProgressRing: the full-circle counterpart to the semicircular Gauge. A
// muted track ring, a tone-colored value arc revealed clockwise from 12
// o'clock with rounded caps, the percent readout centered inside the ring,
// and the optional label beside the graphic (under it with `stacked`). A complete
// ring (100 %) shows the tone's check in place of the number. The API mirrors Gauge
// exactly: same value contract, same tone axis, same rounding split.

export interface ProgressRingProps {
  /** The value to display, 0-100. */
  value: number;
  /** A short caption beneath the number (e.g. "Complete"). */
  label?: string;
  // Tone of the value arc (pick one; default primary). Precedence when
  // several are passed: success > warning > destructive (first match wins).
  primary?: boolean;
  success?: boolean;
  warning?: boolean;
  destructive?: boolean;
  // Density (omit for the default 168 ring; compact is 106).
  compact?: boolean;
  /** Set the label under the ring, centred, instead of beside it (a row of rings, each named underneath). */
  stacked?: boolean;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** For sizing/composition only. */
  style?: LayoutStyle;
}

// Tone precedence within the axis: success > warning > destructive (first
// match wins; no tone falls back to the brand primary). Identical to the
// Gauge recipe so the two dials always agree. Exported for tests (not
// re-exported from the barrel).
export function ringFill(tokens: ColorTokens, p: ProgressRingProps): string {
  if (p.success) return statusColors(tokens, "success").dot;
  if (p.warning) return statusColors(tokens, "warning").dot;
  if (p.destructive) return statusColors(tokens, "error").dot;
  return tokens.primary;
}

// The v4 hand-off's ring (`ring` in cv-kit-charts.js): r 70 in a 14-wide stroke
// (a 168 square), compact r 44 in a 9-wide stroke (106), on the raised surface,
// the value in the display face (600, 28 / 18) and the label 14 px beside the ring.
const SIZE = { default: 168, compact: 106 } as const;
const STROKE = { default: 14, compact: 9 } as const;
const VALUE = { default: 28, compact: 18 } as const;
const LABEL_GAP = 14;
// A stacked label sits 8 under the ring (the section card's ring over its label).
const STACKED_GAP = 8;
// The arc's glow: the renderer's `drop-shadow(0 0 6px <tone>)`.
const ARC_GLOW = 6;
// The complete ring's check in the tone: the section card's 22 px check in its 78 px ring,
// the same 0.28 of the ring at each density.
const CHECK = { default: 48, compact: 30 } as const;

// Pure ring geometry, exported for tests (not re-exported from the barrel),
// following the gaugeArc precedent. An SVG circle's dash origin sits at 3
// o'clock, so the ring is a stroked PATH instead: two half arcs starting at
// 12 o'clock and sweeping clockwise, making the dash reveal start at the top.
// The track and value arcs share the path; the value arc reveals its share of
// the circumference through the dash pattern.
export function ringDash(v: number, size: number = SIZE.default, stroke: number = STROKE.default): { d: string; dasharray: string } {
  const INSET = stroke;
  const r = size / 2 - INSET;
  const cx = size / 2;
  const circumference = 2 * Math.PI * r;
  return {
    // Top center, clockwise half to the bottom center, and back up.
    d: `M ${cx} ${INSET} A ${r} ${r} 0 0 1 ${cx} ${size - INSET} A ${r} ${r} 0 0 1 ${cx} ${INSET}`,
    dasharray: `${circumference * (v / 100)} ${circumference}`,
  };
}

/** A completion ring: a track, a tone-colored arc and the percent inside. */
export function ProgressRing(props: ProgressRingProps) {
  const { value, label, testID, style } = props;
  const { tokens } = useTheme();
  const density = props.compact ? "compact" : "default";
  const size = SIZE[density];
  const stroke = STROKE[density];
  // A 0-100 dial; an out-of-range value is clamped, but warn so the developer
  // notices the input was outside the supported range.
  devWarn(
    Number.isFinite(value) && (value < 0 || value > 100),
    "[canvas] <ProgressRing />: `value` is outside 0-100; it is clamped to that range.",
  );
  const v = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  // The readout shows a whole percent (the display rounds); the arc keeps the
  // fractional value so the fill stays exact. The accessible name announces
  // the same number the eye sees. Identical to the Gauge split.
  const pct = Math.round(v);
  const fill = ringFill(tokens, props);
  const arc = ringDash(v, size, stroke);
  const glowId = `${useId().replace(/[^a-zA-Z0-9_-]/g, "")}glow`;

  return (
    <View
      testID={testID}
      style={[props.stacked ? { alignItems: "center", gap: STACKED_GAP } : { flexDirection: "row", alignItems: "center", gap: LABEL_GAP }, style]}
      accessibilityRole="image"
      accessibilityLabel={`${label ?? "Progress"}: ${pct}%`}
      aria-label={`${label ?? "Progress"}: ${pct}%`}
    >
      <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", top: 0, left: 0 }}>
          <Defs>
            <GlowFilter id={glowId} length={ARC_GLOW} />
          </Defs>
          <Path d={arc.d} fill="none" stroke={tokens["surface-raised"] ?? tokens.muted} strokeWidth={stroke} strokeLinecap="round" />
          {v > 0 ? (
            <Path d={arc.d} fill="none" stroke={fill} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={arc.dasharray} filter={`url(#${glowId})`} />
          ) : null}
          <Path d={arc.d} fill="none" stroke={fill} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={arc.dasharray} />
        </Svg>
        {/* The readout sits in the ring's open center: the tone's check once complete. */}
        {pct >= 100 ? (
          <Icon check decorative size={CHECK[density]} color={fill} />
        ) : (
          <Text style={{ fontFamily: DISPLAY_FONT, fontSize: VALUE[density], lineHeight: Math.round(VALUE[density] * 1.2), fontWeight: "600", color: tokens.foreground }}>
            {pct}%
          </Text>
        )}
      </View>
      {label ? <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>{label}</Text> : null}
    </View>
  );
}
