import { useId } from "react";
import Svg, { Defs, LinearGradient, Stop, Rect } from "react-native-svg";
import { useMaterialTheme } from "../../style/glass-surface/use-material-theme.js";
import {
  View,
  Text,
  devWarn,
  tabularNums,
  statusColors,
  type ColorTokens,
  type LayoutStyle,
  GlassPane,
  paneStyle,
  isGlass,
  alpha,
} from "../../style/index.js";
import * as s from "../shared/charts.styles.js";
import { type Tone } from "../shared/charts.styles.js";
import { type ChartSkin } from "../shared/types.js";
import { CHART_ROOT } from "../shared/chart-frame.js";
import { formatCompact } from "../shared/chart-math.js";
import { platformShape } from "../../style/platform-shape.js";
import { AnatomyScope, useAnatomyPart } from "../../style/anatomy.js";

// Shared BulletChart shell. The goal-attainment rows: per datum a leading
// label, a track holding qualitative background bands (ascending `ranges`
// bounds in fading washes), the measure bar, and an absolute target tick,
// then the trailing formatted value. Following the classic bullet-graph
// anatomy, each row carries its OWN scale (goals rarely share units); pass
// `max` to force one shared scale when they do. Each row is one accessible
// item composing value and target.
//
// BulletChart is a "Shared" platform treatment (data visualization is
// platform-neutral): the skin carries the same values on every OS.
//
// Boolean-prop API, first-match precedence within an axis:
// - Measure tone (pick one; default primary): success > destructive.
// - Density: `compact` tightens the rows and thins the bars.

export interface BulletDatum {
  /** Stable identity, used as the React key when present. */
  id?: string | number;
  /** The row label (e.g. "Revenue"). */
  label: string;
  /** The measured value; sizes the bar. */
  value: number;
  /** Optional per-row formatter for charts whose goal rows use different units. */
  formatValue?: (value: number) => string;
  /** The goal, drawn as a vertical tick over the track. */
  target?: number;
  /** Ascending qualitative band bounds (e.g. [150, 250, 350]); each band
   *  paints a fading muted wash behind the measure. */
  ranges?: number[];
  /**
   * This row's own tone, colouring its measure and its value: a row whose result means
   * something (a target met). Pick one; first match wins: success > warning > destructive.
   * Omit for the chart's tone.
   */
  success?: boolean;
  /** This row's warning tone (a target at risk); see `success` for the precedence. */
  warning?: boolean;
  /** This row's destructive tone (a target missed); see `success` for the precedence. */
  destructive?: boolean;
}

/**
 * A row's measure fill and value ink: its own tone first (the solid status colour on the
 * bar, the status text ink on the value), else the chart's fill under the card ink.
 */
export function rowTone(
  tokens: ColorTokens,
  d: BulletDatum,
  chartFill: string
): { fill: string; ink: string } {
  if (d.success)
    return {
      fill: statusColors(tokens, "success").dot,
      ink: statusColors(tokens, "success").ink,
    };
  if (d.warning)
    return {
      fill: statusColors(tokens, "warning").dot,
      ink: statusColors(tokens, "warning").ink,
    };
  if (d.destructive)
    return {
      fill: statusColors(tokens, "error").dot,
      ink: statusColors(tokens, "error").ink,
    };
  return { fill: chartFill, ink: tokens["card-foreground"] };
}

export interface BulletChartProps {
  /** The rows to render, in order, each on its own scale. */
  data: BulletDatum[];
  /** Optional heading shown above the rows. */
  title?: string;
  /** Force one scale maximum shared by every row (only when the rows share a
   *  unit). Omit for the default per-row scale: each row's largest value,
   *  target, or range bound. */
  max?: number;
  // Measure tone (pick one; default primary). Precedence: success > destructive.
  success?: boolean;
  destructive?: boolean;
  // Density (omit for the default row spacing).
  compact?: boolean;
  /** Expanded goal rows with inset markers and a qualitative-band key. */
  detailed?: boolean;
  /** Strip the card surface for nesting inside an existing card (mirrors Stats). */
  plain?: boolean;
  /** Formats row values (data formatting, not styling). */
  formatValue?: (v: number) => string;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. */
  style?: LayoutStyle;
}

// Tone precedence within the axis, first match wins.
export function toneOf(p: BulletChartProps): Tone {
  if (p.success) return "success";
  if (p.destructive) return "destructive";
  return "primary";
}

// The v4 hand-off's bullet (`K.def('bullet-chart')`): a 96 px label in the muted ink, a
// 14 px track (10 compact) at the mark corner whose qualitative bands step from the
// raised surface through the muted fill to the popover fill, the measure the middle 40%
// of the track at the bar corner, the target a 2 px tick in the foreground standing 3 px
// past the track, and a 40 px mono value; rows 14 px apart (8 compact).
const BAND_FILLS = ["surface-raised", "muted", "popover"] as const;
const LABEL_WIDTH = 96;
const VALUE_WIDTH = 40;
const TARGET_OVERHANG = 3;
const bandFill = (tokens: ColorTokens, i: number): string => {
  const role = BAND_FILLS[Math.min(i, BAND_FILLS.length - 1)];
  return tokens[role] ?? tokens.muted;
};

export function createBulletChart(skin: ChartSkin) {
  return function BulletChart(props: BulletChartProps) {
    const { data, title, testID, style } = props;
    // The anatomy parts a docs AnatomyProvider numbers (src/style/anatomy.tsx), in the
    // hand-off's order: Frame, Measure, Target marker, Ranges (the first row's).
    const framePart = useAnatomyPart("Frame");
    const measurePart = useAnatomyPart("Measure");
    const targetPart = useAnatomyPart("Target marker");
    const rangesPart = useAnatomyPart("Ranges");
    const rangeKeyId = useId();
    const theme = useMaterialTheme({ layer: "content" });
    const { tokens, dark } = theme;
    const surfaceShape = s.surface(tokens, skin.surfaceRadius);
    const glass = isGlass(theme);
    const compact = !!props.compact;
    const tone = toneOf(props);
    const formatValue = props.formatValue ?? formatCompact;
    const fill = s.barFill(tokens, tone);

    devWarn(
      data.length === 0,
      "[canvas] <BulletChart />: `data` is empty; the chart renders with no rows."
    );
    devWarn(
      data.some(
        (d) =>
          d.ranges != null &&
          d.ranges.some((r, i) => i > 0 && r < (d.ranges as number[])[i - 1])
      ),
      "[canvas] <BulletChart />: `ranges` must ascend; out-of-order bounds draw overlapping bands."
    );

    // Per-row scales (the bullet-graph anatomy), unless the caller forces one
    // shared max because the rows genuinely share a unit.
    const rowPool = (d: BulletDatum): number[] => [
      Number.isFinite(d.value) ? d.value : 0,
      ...(d.target != null && Number.isFinite(d.target) ? [d.target] : []),
      ...(d.ranges ?? []).filter((r) => Number.isFinite(r)),
    ];
    const rowMax = (d: BulletDatum): number =>
      props.max != null && props.max > 0
        ? props.max
        : Math.max(1, ...rowPool(d));
    devWarn(
      props.max != null &&
        data.some((d) => rowPool(d).some((v) => v > (props.max as number))),
      "[canvas] <BulletChart />: a value, target, or range bound exceeds `max`; it is clamped to the scale."
    );
    const pctOf = (v: number, max: number): number =>
      Math.max(0, Math.min(100, ((Number.isFinite(v) ? v : 0) / max) * 100));

    const detailed = !!props.detailed;
    const trackH = detailed ? 22 : compact ? 10 : 14;
    const barH = detailed ? 8 : trackH * 0.4;

    return (
      <AnatomyScope>
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
          ref={framePart?.ref}
          onLayout={framePart?.onLayout}
          style={{ gap: compact ? 8 : 14, paddingVertical: detailed ? 4 : 0 }}
        >
          {data.map((d, i) => {
            const max = rowMax(d);
            const rowFormat = d.formatValue ?? formatValue;
            const name = `${d.label}: ${rowFormat(
              Number.isFinite(d.value) ? d.value : 0
            )}${
              d.target != null && Number.isFinite(d.target)
                ? ` of target ${rowFormat(d.target)}`
                : ""
            }`;
            return (
              <View
                key={d.id ?? i}
                accessible
                accessibilityRole="image"
                role="img"
                accessibilityLabel={name}
                aria-label={name}
                style={[s.horizontalRow, { gap: 10 }]}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    width: detailed ? 70 : LABEL_WIDTH,
                    fontSize: detailed ? 13 : 12,
                    lineHeight: 16,
                    fontWeight: detailed ? "500" : "400",
                    color: detailed
                      ? tokens.foreground
                      : tokens["muted-foreground"],
                  }}
                >
                  {d.label}
                </Text>
                {/* The track: bands under the measure bar under the target
                    tick. Bands paint widest (lightest) first so the narrower,
                    denser washes sit on top of them. */}
                <View
                  ref={i === 0 ? rangesPart?.ref : undefined}
                  onLayout={i === 0 ? rangesPart?.onLayout : undefined}
                  style={[
                    s.horizontalTrack,
                    {
                      height: trackH,
                      alignItems: "center",
                      borderRadius: detailed ? platformShape.web.chartTrack : platformShape.web.mark,
                      overflow: detailed ? "hidden" : "visible",
                      backgroundColor: detailed
                        ? tokens["surface-sunken"] ?? tokens.background
                        : d.ranges && d.ranges.length > 0
                        ? bandFill(tokens, d.ranges.length)
                        : tokens.muted,
                    },
                  ]}
                >
                  {(d.ranges ?? [])
                    .map((bound, bi) => ({
                      bound,
                      fill:
                        detailed && bi > 1
                          ? tokens["surface-sunken"] ?? tokens.background
                          : bandFill(tokens, bi),
                      first: bi === 0,
                    }))
                    .reverse()
                    .map((band, ri) => (
                      <View
                        key={ri}
                        style={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: `${pctOf(band.bound, max)}%`,
                          backgroundColor: band.fill,
                          borderTopStartRadius: platformShape.web.mark,
                          borderBottomStartRadius: platformShape.web.mark,
                        }}
                      />
                    ))}
                  <View
                    ref={i === 0 ? measurePart?.ref : undefined}
                    onLayout={i === 0 ? measurePart?.onLayout : undefined}
                    style={{
                      position: "absolute",
                      left: 0,
                      top: (trackH - barH) / 2,
                      height: barH,
                      width: `${pctOf(d.value, max)}%`,
                      backgroundColor: rowTone(tokens, d, fill).fill,
                      ...(detailed && !d.success && !d.warning && !d.destructive ? { boxShadow: `0 0 10px ${alpha(fill, dark ? 0.5 : 0.4)}` } : {}),
                      borderRadius: detailed ? platformShape.web.mark : skin.barRadius,
                      ...(detailed
                        ? { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }
                        : {}),
                    }}
                  />
                  {d.target != null && Number.isFinite(d.target) ? (
                    <View
                      ref={i === 0 ? targetPart?.ref : undefined}
                      onLayout={i === 0 ? targetPart?.onLayout : undefined}
                      style={{
                        position: "absolute",
                        left: `${pctOf(d.target, max)}%`,
                        top: detailed ? 3 : -TARGET_OVERHANG,
                        bottom: detailed ? 3 : -TARGET_OVERHANG,
                        width: 2,
                        borderRadius: detailed ? platformShape.web.stripBar : 0,
                        marginLeft: detailed ? 0 : -1,
                        backgroundColor: tokens["card-foreground"],
                      }}
                    />
                  ) : null}
                </View>
                <Text
                  style={[
                    s.horizontalValue(tokens),
                    {
                      minWidth: VALUE_WIDTH,
                      textAlign: "right",
                      color:
                        detailed && (d.success || d.warning || d.destructive)
                          ? rowTone(tokens, d, fill).fill
                          : rowTone(tokens, d, fill).ink,
                      ...tabularNums(),
                    },
                  ]}
                >
                  {rowFormat(Number.isFinite(d.value) ? d.value : 0)}
                </Text>
              </View>
            );
          })}
        </View>
        {detailed ? (
          <View style={{ flexDirection: "row", gap: 14, marginTop: 14 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <View
                style={{
                  width: 2,
                  height: 10,
                  backgroundColor: tokens.foreground,
                }}
              />
              <Text
                style={{
                  fontFamily: "JetBrains Mono",
                  fontSize: s.CHART_LOOK.legendCaptionSize,
                  color: tokens["subtle-foreground"],
                }}
              >
                target
              </Text>
            </View>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Svg width={16} height={8}><Defs><LinearGradient id={rangeKeyId} x1="0%" y1="0%" x2="100%" y2="0%"><Stop offset="0%" stopColor={tokens["surface-raised"] ?? tokens.muted} /><Stop offset="100%" stopColor={tokens["surface-sunken"] ?? tokens.background} /></LinearGradient></Defs><Rect width={16} height={8} rx={platformShape.web.cell} fill={`url(#${rangeKeyId})`} /></Svg>
              <Text
                style={{
                  fontFamily: "JetBrains Mono",
                  fontSize: s.CHART_LOOK.legendCaptionSize,
                  color: tokens["subtle-foreground"],
                }}
              >
                ranges
              </Text>
            </View>
          </View>
        ) : null}
      </View>
      </AnatomyScope>
    );
  };
}
