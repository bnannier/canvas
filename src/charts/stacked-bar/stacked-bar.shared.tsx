import { View, useTheme, devWarn, type StyleProp, type ViewStyle } from "../../style/index.js";
import { seriesFill } from "../shared/charts.styles.js";
import { ChartLegend } from "../shared/chart-legend.js";
import { type StackedSegment } from "../shared/types.js";

// StackedBar is a "Shared" platform treatment (data visualization is
// platform-neutral): one implementation serves iOS, Android, and the web.
// Series colors come from the theme's chart-1..chart-8 tokens via seriesFill,
// so the categorical palette is brandable through ThemeProvider overrides.

// StackedBar: one proportional horizontal bar split into colored segments, with a
// legend (dot + label + %) so each band is identified.

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
