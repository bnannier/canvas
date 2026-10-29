import Svg, { Line } from "react-native-svg";
import { View, Text, useTheme } from "../../style/index.js";
import { MONO_FONT } from "../../style/mono.js";
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
  /** A line mark's swatch: a 12 by 2 rule in place of the square (a candlestick overlay, a dashed target). */
  line?: boolean;
  /** The rule dashed, for a series drawn dashed (implies `line`). */
  dashed?: boolean;
}

export interface ChartLegendProps {
  items: LegendItem[];
  /** Lay items out as a wrapping row (multi-series cartesian charts) instead of a column. */
  horizontal?: boolean;
  /** Drop the frame gap above the legend: the caller places it (beside a disc, in its own gap). */
  flush?: boolean;
  /** A note at the end of a horizontal legend's row, pushed to its right edge in the 11 px mono third ink. */
  caption?: string;
}

export function ChartLegend({ items, horizontal, flush, caption }: ChartLegendProps) {
  const { tokens } = useTheme();
  const marginTop = flush ? 0 : CHART_LOOK.gap.default;

  if (horizontal) {
    return (
      <View style={{ marginTop, flexDirection: "row", flexWrap: "wrap", columnGap: CHART_LOOK.legendColumnGap, rowGap: CHART_LOOK.legendRowGap }}>
        {items.map((item, i) => (
          <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: CHART_LOOK.swatchGap }}>
            <Swatch item={item} />
            <Text style={{ fontSize: CHART_LOOK.legendSize, lineHeight: CHART_LOOK.legendLine, color: tokens["muted-foreground"] }}>{item.label}</Text>
          </View>
        ))}
        {caption ? (
          <Text style={{ marginLeft: "auto", fontFamily: MONO_FONT, fontSize: CHART_LOOK.legendCaptionSize, lineHeight: CHART_LOOK.legendLine, color: tokens["subtle-foreground"] ?? tokens["muted-foreground"] }}>
            {caption}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View style={{ marginTop, flexDirection: "column", gap: CHART_LOOK.legendRowGap }}>
      {items.map((item, i) => (
        <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: CHART_LOOK.swatchGap }}>
          <Swatch item={item} />
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

/**
 * The legend's swatch: an 8 px square at the data-cell corner (the hand-off's 2 px), or a
 * line mark's 12 by 2 rule (the section cards' `width:12px;height:2px` overlay swatch and
 * `border-top:2px dashed` target swatch).
 */
function Swatch({ item }: { item: LegendItem }) {
  if (item.dashed) {
    return (
      <Svg width={CHART_LOOK.ruleSwatch} height={2}>
        <Line x1={0} y1={1} x2={CHART_LOOK.ruleSwatch} y2={1} stroke={item.color} strokeWidth={2} strokeDasharray={CHART_LOOK.ruleDash} />
      </Svg>
    );
  }
  if (item.line) {
    return <View style={{ width: CHART_LOOK.ruleSwatch, height: 2, borderRadius: 9999, backgroundColor: item.color }} />;
  }
  return <View style={{ width: CHART_LOOK.swatch, height: CHART_LOOK.swatch, borderRadius: platformShape.web.cell, backgroundColor: item.color }} />;
}
