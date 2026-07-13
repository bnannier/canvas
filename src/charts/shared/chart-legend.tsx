import { View, Text, useTheme } from "../../style/index.js";

// The shared series legend for the Chart family: a colored dot identifying
// each series/segment plus its label (and an optional right-aligned detail,
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
}

export function ChartLegend({ items, horizontal }: ChartLegendProps) {
  const { tokens } = useTheme();

  if (horizontal) {
    return (
      <View style={{ marginTop: 12, flexDirection: "row", flexWrap: "wrap", columnGap: 16, rowGap: 8 }}>
        {items.map((item, i) => (
          <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View style={{ borderRadius: 9999, height: 8, width: 8, backgroundColor: item.color }} />
            <Text style={{ fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] }}>{item.label}</Text>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={{ marginTop: 12, flexDirection: "column", gap: 8 }}>
      {items.map((item, i) => (
        <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ borderRadius: 9999, height: 8, width: 8, backgroundColor: item.color }} />
          <Text style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", fontSize: 14, lineHeight: 20, color: tokens["card-foreground"] }}>
            {item.label}
          </Text>
          {item.detail != null ? (
            <Text style={{ fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] }}>{item.detail}</Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}
