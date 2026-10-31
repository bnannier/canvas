import { View, Text, useTheme, devWarn, alpha, type LayoutStyle } from "../../style/index.js";
import { seriesFill } from "../shared/charts.styles.js";
import { ChartLegend } from "../shared/chart-legend.js";
import { type StackedSegment } from "../shared/types.js";
import { platformShape } from "../../style/platform-shape.js";
import { CHART_LOOK } from "../shared/charts.styles.js";
import { MONO_FONT } from "../../style/mono.js";

// StackedBar is a "Shared" platform treatment (data visualization is
// platform-neutral): one implementation serves iOS, Android, and the web.
// Series colors come from the theme's chart-1..chart-8 tokens via seriesFill,
// so the categorical palette is brandable through ThemeProvider overrides.

// StackedBar: one proportional horizontal bar split into colored segments, with a
// legend (dot + label + %) so each band is identified.

// The v4 hand-off's strip (`K.def('stacked-bar')`): an 8 px pill whose segments sit 2 px
// apart, a `track` rail of 2 px around them on the muted fill, the `subtle` wash at .6,
// and the legend 10 px under the strip with each share inline. `tall` is the 24 px
// strip; a capacity composition uses the section's 14 px separated bands.
const SUBTLE_ALPHA = 0.6;
const STRIP_HEIGHT = { default: 8, tall: 24 } as const;
const SEGMENT_GAP = 2;
const TRACK_INSET = 2;
const LEGEND_GAP = 10;

export interface StackedBarProps {
  segments: StackedSegment[];
  /** What the bar measures (e.g. "Traffic sources"); leads the accessible name. */
  label?: string;
  /** Hide the legend (the labelled dots below the bar). */
  hideLegend?: boolean;
  /** A two-column legend with separate right-aligned share readouts. */
  detailed?: boolean;
  /** The series to identify in a shared comparison legend. Defaults to this strip. */
  legendSegments?: StackedSegment[];
  /** Paint the unfilled remainder as a muted rail, so a bar whose segments sum
   *  to zero still reads as a bar rather than as blank space. A composition of
   *  nothing (an empty queue, a metric at zero) is a real state to draw, and
   *  without the rail it draws as an absence. */
  track?: boolean;
  /** A 24 px strip instead of the default 8 px pill; capacity strips use 14 px bands. */
  tall?: boolean;
  /** Draw the segments as washes of their ramp colours rather than at full
   *  strength. For a bar that supports a headline rather than being one (the
   *  strip under a metric's value), where a solid bar outweighs everything
   *  around it. */
  subtle?: boolean;
  /**
   * The capacity the segments are shares of (100 GB of storage): each segment is its value
   * over `max`, and the room left is drawn as one remainder segment on the raised surface
   * fill, left out of the legend. Omit to split the strip by the segments' own total. A
   * `max` under the segments' total is ignored.
   */
  max?: number;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** For sizing/composition only. */
  style?: LayoutStyle;
}

/** One proportional bar split into colored segments, with a legend of shares. */
export function StackedBar({ segments, label, hideLegend, track, tall, subtle, max, detailed, legendSegments, testID, style }: StackedBarProps) {
  const { tokens, dark } = useTheme();
  const rawTotal = segments.reduce((sum, seg) => sum + Math.max(0, Number.isFinite(seg.value) ? seg.value : 0), 0);
  const capacity = max != null && Number.isFinite(max) && max > rawTotal ? max : null;
  // Floor the divisor at 1 so an all-zero (or empty) bar divides cleanly to 0%
  // widths rather than producing NaN.
  const total = Math.max(1, capacity ?? rawTotal);
  const remainder = capacity != null ? ((capacity - rawTotal) / total) * 100 : 0;
  const pct = (v: number) => (Math.max(0, Number.isFinite(v) ? v : 0) / total) * 100;

  // No segments, or every segment zero, both render an empty bar: warn so the
  // developer sees the degenerate input instead of a silently blank strip.
  devWarn(segments.length === 0, "[canvas] <StackedBar />: `segments` is empty; the bar renders empty.");
  devWarn(
    max != null && Number.isFinite(max) && max < rawTotal,
    "[canvas] <StackedBar />: `max` is under the segments' total; the strip splits by the total instead.",
  );
  // An all-zero bar is a mistake when nothing is drawn for it, and a deliberate
  // state once `track` is set: the rail is there to show a composition of
  // nothing. So the warning speaks only for the trackless case.
  devWarn(
    segments.length > 0 && rawTotal <= 0 && !track,
    "[canvas] <StackedBar />: all segment values are zero and no `track` is set; the bar renders empty."
  );

  // The accessible name carries the data itself, so a screen reader hears the
  // composition ("Traffic sources: Direct 42%, …"), not a bare "Stacked bar".
  const name = `${label ?? "Stacked bar"}: ${segments.map((seg) => `${seg.label} ${Math.round(pct(seg.value))}%`).join(", ")}`;
  // role="img" makes its whole subtree presentational to assistive tech, which
  // would silence the legend text; so while the legend renders, the image role
  // (and data-bearing name) sits on the plot row only, leaving the legend
  // reachable. With the legend hidden, the root itself is the image.
  const img = {
    accessibilityRole: "image",
    accessibilityLabel: name,
    "aria-label": name,
  } as const;

  return (
    <View testID={testID} style={[{ gap: detailed ? 14 : LEGEND_GAP }, style]} {...(hideLegend ? img : {})}>
      <View
        {...(hideLegend ? {} : img)}
        style={{
          flexDirection: "row",
          overflow: capacity != null ? "visible" : "hidden",
          borderRadius: capacity != null ? 0 : tall ? platformShape.web.mark : 9999,
          gap: capacity != null ? 3 : SEGMENT_GAP,
          height: tall ? capacity != null ? 14 : STRIP_HEIGHT.tall : STRIP_HEIGHT.default,
          opacity: capacity != null && subtle ? .7 : 1,
          ...(track ? { backgroundColor: tokens.muted, padding: TRACK_INSET } : {}),
        }}
      >
        {segments.map((seg, i) =>
          pct(seg.value) <= 0 ? null : (
            <View
              key={i}
              style={{
                // The share of the strip, less its part of the 2 px gaps, so the
                // segments and gaps fill the row exactly.
                flexBasis: `${pct(seg.value)}%`,
                flexShrink: capacity != null ? 0 : 1,
                ...(capacity != null && tall && i === 0 ? { boxShadow: [{ offsetX: 0, offsetY: 0, blurRadius: 12, color: alpha(tokens.primary, dark ? .5 : .4) }] } : {}),
                ...(capacity != null ? { borderTopLeftRadius: i === 0 ? tall ? platformShape.web.stackEnd : platformShape.web.stackEndCompact : tall ? platformShape.web.stackInner : platformShape.web.stackInnerCompact, borderBottomLeftRadius: i === 0 ? tall ? platformShape.web.stackEnd : platformShape.web.stackEndCompact : tall ? platformShape.web.stackInner : platformShape.web.stackInnerCompact, borderTopRightRadius: tall ? platformShape.web.stackInner : platformShape.web.stackInnerCompact, borderBottomRightRadius: tall ? platformShape.web.stackInner : platformShape.web.stackInnerCompact } : {}),
                backgroundColor: subtle && capacity == null ? alpha(seriesFill(tokens, i), SUBTLE_ALPHA) : seriesFill(tokens, i),
              }}
            />
          )
        )}
        {remainder > 0 ? (
          <View style={{ flex: 1, borderTopLeftRadius: tall ? platformShape.web.stackInner : platformShape.web.stackInnerCompact, borderBottomLeftRadius: tall ? platformShape.web.stackInner : platformShape.web.stackInnerCompact, borderTopRightRadius: tall ? platformShape.web.stackEnd : platformShape.web.stackEndCompact, borderBottomRightRadius: tall ? platformShape.web.stackEnd : platformShape.web.stackEndCompact, backgroundColor: tokens["surface-raised"] ?? tokens.muted }} />
        ) : null}
      </View>
      {hideLegend ? null : detailed ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", columnGap: 16, rowGap: 8 }}>
          {(legendSegments ?? segments).map((seg, i) => <View key={i} style={{ width: "47%", flexGrow: 1, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ width: 8, height: 8, borderRadius: platformShape.web.cell, backgroundColor: seriesFill(tokens, i) }} />
            <Text style={{ flex: 1, fontSize: 12, lineHeight: 15, color: tokens["muted-foreground"] }}>{seg.label}</Text>
            <Text style={{ fontFamily: MONO_FONT, fontSize: CHART_LOOK.legendCaptionSize, lineHeight: 15, fontWeight: "500", color: tokens.foreground }}>{Math.round(pct(seg.value))}%</Text>
          </View>)}
        </View>
      ) : (
        <ChartLegend
          horizontal
          flush
          items={segments.map((seg, i) => ({
            label: `${seg.label} ${Math.round(pct(seg.value))}%`,
            color: seriesFill(tokens, i),
          }))}
        />
      )}
    </View>
  );
}
