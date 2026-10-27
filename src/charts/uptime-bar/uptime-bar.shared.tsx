import { View, Text, useTheme, devWarn, type LayoutStyle } from "../../style/index.js";
import { CHART_ROOT } from "../shared/chart-frame.js";
import { StatusStrip, periodStatus, statusColor, statusSummary, type UptimePeriod } from "../shared/status-strip.js";
import { MONO_FONT } from "../../style/mono.js";

// UptimeBar is a "Shared" platform treatment (data visualization is
// platform-neutral): one implementation serves iOS, Android, and the web.
//
// UptimeBar: the statuspage strip (the v4 hand-off's `K.def('uptime-bar')`). A header
// of the label (500 13 px, after an 8 px dot in the latest period's status) and the
// summary caption (12 px mono, subtle) at the right, a single row of per-period status
// pills 2 px apart (30 px, 20 compact; operational green, degraded amber, down red,
// unknown a faded green), oldest on the left, and edge captions below (11 px mono)
// ("90 days ago" / "Today"), 8 px apart. The strip is a plot: it keeps physical LTR
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
  // Density (omit for the default pill height).
  compact?: boolean;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. */
  style?: LayoutStyle;
}

const PILL_HEIGHT = { default: 30, compact: 20 } as const;
// The strip's edge captions, a time axis.
const EDGE_CAPTION_TYPE = { fontFamily: MONO_FONT, fontSize: 11, lineHeight: 14 };
const DOT = 8;

/**
 * A status strip: one pill per period (operational, degraded, down, unknown) with a
 * summary caption.
 */
export function UptimeBar(props: UptimeBarProps) {
  const { periods, label, caption, startLabel, endLabel, testID, style } = props;
  const { tokens } = useTheme();
  const compact = !!props.compact;

  devWarn(periods.length === 0, "[canvas] <UptimeBar />: `periods` is empty; the strip renders with no pills.");

  const name = statusSummary(periods, label);
  const hasEdges = (startLabel != null && startLabel !== "") || (endLabel != null && endLabel !== "");
  const hasLabel = label != null && label !== "";
  const hasCaption = caption != null && caption !== "";
  const latest = periods.length > 0 ? periodStatus(periods[periods.length - 1]) : "operational";
  const subtle = tokens["subtle-foreground"] ?? tokens["muted-foreground"];

  return (
    <View testID={testID} style={[CHART_ROOT, { gap: 8 }, style]}>
      {hasLabel || hasCaption ? (
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 }}>
            {hasLabel ? (
              <>
                <View style={{ width: DOT, height: DOT, borderRadius: 9999, backgroundColor: statusColor(tokens, latest === "unknown" ? "operational" : latest) }} />
                <Text numberOfLines={1} style={{ flexShrink: 1, fontSize: 13, lineHeight: 18, fontWeight: "500", color: tokens["card-foreground"] }}>
                  {label}
                </Text>
              </>
            ) : null}
          </View>
          {hasCaption ? <Text style={{ fontFamily: MONO_FONT, fontSize: 12, lineHeight: 16, color: subtle }}>{caption}</Text> : null}
        </View>
      ) : null}
      {/* The strip is the image; its name tallies every status. */}
      <View accessible accessibilityRole="image" role="img" accessibilityLabel={name} aria-label={name}>
        <StatusStrip periods={periods} height={compact ? PILL_HEIGHT.compact : PILL_HEIGHT.default} tokens={tokens} />
      </View>
      {/* Edge captions pin to the strip's physical edges (a time axis). */}
      {hasEdges ? (
        <View style={{ flexDirection: "row", justifyContent: "space-between", direction: "ltr" }}>
          <Text style={{ ...EDGE_CAPTION_TYPE, color: subtle }}>{startLabel ?? ""}</Text>
          <Text style={{ ...EDGE_CAPTION_TYPE, color: subtle }}>{endLabel ?? ""}</Text>
        </View>
      ) : null}
    </View>
  );
}
