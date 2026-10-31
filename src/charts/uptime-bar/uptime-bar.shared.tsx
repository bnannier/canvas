import { platformShape } from "../../style/platform-shape.js";
import { CHART_LOOK } from "../shared/charts.styles.js";
import { useRef } from "react";
import { Animated, Easing } from "react-native";
import {
  View,
  Text,
  useTheme,
  useReducedMotion,
  alpha,
  supportsNativeDriver,
  devWarn,
  type LayoutStyle,
} from "../../style/index.js";
import { CHART_ROOT } from "../shared/chart-frame.js";
import {
  StatusStrip,
  periodStatus,
  statusColor,
  statusSummary,
  type UptimePeriod,
} from "../shared/status-strip.js";
import { DISPLAY_FONT, MONO_FONT } from "../../style/mono.js";

// UptimeBar is a "Shared" platform treatment (data visualization is
// platform-neutral): one implementation serves iOS, Android, and the web.
//
// UptimeBar: the statuspage strip (the v4 hand-off's `K.def('uptime-bar')`). A header
// of the label (500 13 px, after an 8 px dot in the latest period's status) and the
// summary caption (12 px mono, subtle) at the right, a single row of per-period status
// pills 2 px apart (30 px, 20 compact; operational green, degraded amber, down red,
// unknown a faded green), oldest on the left, and edge captions below (11 px mono)
// ("90 days ago" / "Today", an optional middle caption between them), 8 px apart. The strip is a plot: it keeps physical LTR
// ordering, and the edge captions stay pinned to their physical edges, even
// under native RTL.

export type { UptimePeriod } from "../shared/status-strip.js";

export interface UptimeBarProps {
  /** The periods to render, oldest first; each becomes one pill. */
  periods: UptimePeriod[];
  /** What the strip measures (e.g. "API"); shown in the header and leading the accessible name. */
  label?: string;
  /** A summary at the header's right (e.g. "99.98% uptime"). */
  caption?: string;
  /** Caption under the strip's left (oldest) edge (e.g. "90 days ago"). */
  startLabel?: string;
  /** Caption under the strip's right (latest) edge (e.g. "Today"). */
  endLabel?: string;
  /** Caption centred under the strip, between the edge captions (e.g. "1 incident · 2 degraded days"). */
  midLabel?: string;
  // Density (omit for the default pill height).
  compact?: boolean;
  /** Display header and taller history marks for a status overview. */
  detailed?: boolean;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. */
  style?: LayoutStyle;
}

const PILL_HEIGHT = { default: 30, compact: 20 } as const;
/** The room between a middle caption and the edge captions beside it. */
const MID_GAP = 8;

// The strip's edge captions, a time axis.
const EDGE_CAPTION_TYPE = {
  fontFamily: MONO_FONT,
  fontSize: CHART_LOOK.legendCaptionSize,
  lineHeight: 14,
};
const DOT = 8;

/**
 * A status strip: one pill per period (operational, degraded, down, unknown) with a
 * summary caption.
 */
export function UptimeBar(props: UptimeBarProps) {
  const {
    periods,
    label,
    caption,
    startLabel,
    endLabel,
    midLabel,
    testID,
    style,
  } = props;
  const { tokens, dark } = useTheme();
  const compact = !!props.compact;
  const detailed = !!props.detailed;

  devWarn(
    periods.length === 0,
    "[canvas] <UptimeBar />: `periods` is empty; the strip renders with no pills."
  );

  const name = statusSummary(periods, label);
  const hasMid = midLabel != null && midLabel !== "";
  const hasEdges =
    (startLabel != null && startLabel !== "") ||
    (endLabel != null && endLabel !== "") ||
    hasMid;
  const hasLabel = label != null && label !== "";
  const hasCaption = caption != null && caption !== "";
  const latest =
    periods.length > 0
      ? periodStatus(periods[periods.length - 1])
      : "operational";
  const subtle = tokens["subtle-foreground"] ?? tokens["muted-foreground"];

  return (
    <View
      testID={testID}
      style={[CHART_ROOT, { gap: detailed ? 14 : 8 }, style]}
    >
      {hasLabel || hasCaption ? (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: detailed ? "wrap" : "nowrap",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: detailed ? 10 : 8,
              flexShrink: 1,
            }}
          >
            {hasLabel ? (
              <>
                <View
                  style={{
                    width: detailed ? 10 : DOT,
                    height: detailed ? 10 : DOT,
                    borderRadius: 9999,
                    backgroundColor: statusColor(
                      tokens,
                      latest === "unknown" ? "operational" : latest
                    ),
                    ...(detailed
                      ? {
                          boxShadow: `0 0 0 4px ${alpha(
                            statusColor(tokens, latest),
                            dark ? 0.14 : 0.1
                          )}`,
                        }
                      : {}),
                  }}
                />
                <Text
                  numberOfLines={1}
                  style={{
                    flexShrink: 1,
                    fontFamily: detailed ? DISPLAY_FONT : undefined,
                    fontSize: detailed ? 18 : 13,
                    lineHeight: detailed ? 21.6 : 18,
                    letterSpacing: detailed ? -0.18 : 0,
                    fontWeight: "500",
                    color: tokens["card-foreground"],
                  }}
                >
                  {label}
                </Text>
              </>
            ) : null}
          </View>
          {hasCaption ? (
            <Text
              style={{
                fontFamily: MONO_FONT,
                fontSize: detailed ? 13 : 12,
                fontWeight: detailed ? "500" : "400",
                lineHeight: 16,
                color: detailed ? statusColor(tokens, latest) : subtle,
              }}
            >
              {caption}
            </Text>
          ) : null}
        </View>
      ) : null}
      {/* The strip is the image; its name tallies every status. */}
      <View
        accessible
        accessibilityRole="image"
        role="img"
        accessibilityLabel={name}
        aria-label={name}
      >
        {detailed ? (
          <View
            style={{
              flexDirection: "row",
              gap: 2,
              height: compact ? 20 : 34,
              direction: "ltr",
            }}
          >
            {periods.map((period, i) => (
              <UptimeMark
                key={period.id ?? i}
                index={i}
                label={period.label}
                fill={
                  period.unknown
                    ? tokens["surface-raised"] ?? tokens.muted
                    : statusColor(tokens, periodStatus(period))
                }
              />
            ))}
          </View>
        ) : (
          <StatusStrip
            periods={periods}
            height={compact ? PILL_HEIGHT.compact : PILL_HEIGHT.default}
            tokens={tokens}
          />
        )}
      </View>
      {/* Edge captions pin to the strip's physical edges (a time axis). */}
      {hasEdges ? (
        // With a middle caption the edges keep their words and the middle one wraps,
        // centred, in the room between them (a phone's narrow strip).
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            direction: "ltr",
            gap: hasMid ? MID_GAP : 0,
          }}
        >
          <Text
            style={{
              ...EDGE_CAPTION_TYPE,
              fontSize: detailed ? CHART_LOOK.axisSize : CHART_LOOK.legendCaptionSize,
              lineHeight: detailed ? 13 : 14,
              color: subtle,
              flexShrink: hasMid ? 0 : undefined,
            }}
          >
            {startLabel ?? ""}
          </Text>
          {hasMid ? (
            <Text
              style={{
                ...EDGE_CAPTION_TYPE,
                fontSize: detailed ? CHART_LOOK.axisSize : CHART_LOOK.legendCaptionSize,
                lineHeight: detailed ? 13 : 14,
                flexShrink: 1,
                textAlign: "center",
                color: subtle,
              }}
            >
              {midLabel}
            </Text>
          ) : null}
          <Text
            style={{
              ...EDGE_CAPTION_TYPE,
              fontSize: detailed ? CHART_LOOK.axisSize : CHART_LOOK.legendCaptionSize,
              lineHeight: detailed ? 13 : 14,
              color: subtle,
              flexShrink: hasMid ? 0 : undefined,
            }}
          >
            {endLabel ?? ""}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

// Status periods expand with the hand-off's overshooting 300ms hover transition.
function UptimeMark({ index, label, fill }: { index: number; label?: string; fill: string }) {
  const progress = useRef(new Animated.Value(1)).current;
  const reduced = useReducedMotion();
  const animate = (value: number) => {
    progress.stopAnimation();
    if (reduced) {
      progress.setValue(1);
      return;
    }
    Animated.timing(progress, {
      toValue: value,
      duration: 300,
      easing: Easing.bezier(0.34, 1.56, 0.64, 1),
      useNativeDriver: supportsNativeDriver,
    }).start();
  };
  return (
    <View
      testID={`uptime-period-${index}`}
      accessible={false}
      onPointerEnter={(event) => { if (event.nativeEvent.pointerType !== "touch") animate(1.18); }}
      onPointerLeave={() => animate(1)}
      style={{ flex: 1 }}
      {...({ title: label } as object)}
    >
      <Animated.View
        style={{
          flex: 1,
          borderRadius: platformShape.web.activityCell,
          backgroundColor: fill,
          transform: [{ scaleY: progress }],
        }}
      />
    </View>
  );
}
