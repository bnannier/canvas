import { View, Text, useTheme } from "../../style/index.js";
import { platformShape } from "../../style/platform-shape.js";
import { CHART_LOOK } from "./charts.styles.js";

// The shared series legend for the Chart family (the v4 hand-off's `leg`): an 8 px
// square at the data-cell corner identifying each series/segment plus its 12 px label in
// the muted ink (and an optional right-aligned detail,
// e.g. a StackedBar percentage). Internal to the kit; chart components place
// it OUTSIDE any role="img" subtree so the labels stay reachable by assistive
// tech (the plot's accessible name carries the data, the legend carries the
// identity).

export interface LegendItem {
  label: string;
  /** The series color (from seriesFill / the chart-N tokens). */
  color: string;
  /** Optional right-aligned secondary text (e.g. "42%"). */
  detail?: string;
}

export interface ChartLegendProps {
  items: LegendItem[];
  /** Lay items out as a wrapping row (multi-series cartesian charts) instead of a column. */
  horizontal?: boolean;
  /** Drop the frame gap above the legend: the caller places it (beside a disc, in its own gap). */
  flush?: boolean;
}

export function ChartLegend({ items, horizontal, flush }: ChartLegendProps) {
  const { tokens } = useTheme();
  const marginTop = flush ? 0 : CHART_LOOK.gap.default;

  if (horizontal) {
    return (
      <View style={{ marginTop, flexDirection: "row", flexWrap: "wrap", columnGap: CHART_LOOK.legendColumnGap, rowGap: CHART_LOOK.legendRowGap }}>
        {items.map((item, i) => (
          <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: CHART_LOOK.swatchGap }}>
            <View style={swatch(item.color)} />
            <Text style={{ fontSize: CHART_LOOK.legendSize, lineHeight: CHART_LOOK.legendLine, color: tokens["muted-foreground"] }}>{item.label}</Text>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={{ marginTop, flexDirection: "column", gap: CHART_LOOK.legendRowGap }}>
      {items.map((item, i) => (
        <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: CHART_LOOK.swatchGap }}>
          <View style={swatch(item.color)} />
          <Text style={{ flexGrow: item.detail != null ? 1 : 0, flexShrink: 1, fontSize: CHART_LOOK.legendSize, lineHeight: CHART_LOOK.legendLine, color: tokens["muted-foreground"] }}>
            {item.label}
          </Text>
          {item.detail != null ? (
            <Text style={{ fontSize: CHART_LOOK.legendSize, lineHeight: CHART_LOOK.legendLine, color: tokens["muted-foreground"] }}>{item.detail}</Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

/** The legend's swatch: an 8 px square at the data-cell corner (the hand-off's 2 px). */
function swatch(color: string) {
  return { width: CHART_LOOK.swatch, height: CHART_LOOK.swatch, borderRadius: platformShape.web.cell, backgroundColor: color };
}
