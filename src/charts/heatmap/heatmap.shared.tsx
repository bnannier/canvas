import { View, Text, useTheme, alpha, devWarn, type StyleProp, type ViewStyle } from "../../style/index.js";

// Heatmap is a "Shared" platform treatment (data visualization is
// platform-neutral): one implementation serves iOS, Android, and the web.

// Heatmap: a wrapping grid of cells whose fill intensity (a wash of the primary
// hue) encodes each value (0–1), with an optional less-to-more legend.

export interface HeatmapProps {
  /** Cell intensities, 0–1; each becomes one square, alpha-scaled from the primary hue. */
  values: number[];
  /** What the grid measures (e.g. "Contribution activity"); leads the accessible name. */
  label?: string;
  /** Hide the less-to-more legend row. */
  hideLegend?: boolean;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** For sizing/composition only. */
  style?: StyleProp<ViewStyle>;
}

export function Heatmap({ values, label, hideLegend, testID, style }: HeatmapProps) {
  const { tokens } = useTheme();
  // No values means no cells: warn so an empty grid is not mistaken for one that
  // failed to style.
  devWarn(values.length === 0, "[canvas] <Heatmap />: `values` is empty; the grid renders with no cells.");
  const cell = (intensity: number, box: number, key: number) => {
    const t = Math.max(0.08, Math.min(1, Number.isFinite(intensity) ? intensity : 0));
    return <View key={key} style={{ borderRadius: 2, height: box, width: box, backgroundColor: alpha(tokens.primary, t) }} />;
  };
  // Name the grid with its size so assistive tech hears the scope of the data.
  const name = `${label ?? "Heatmap"}, ${values.length} cells`;
  // Same img-placement rule as StackedBar: while the less-to-more legend renders,
  // the image role sits on the cell grid only so the legend text stays reachable.
  const img = { accessibilityRole: "image", accessibilityLabel: name, "aria-label": name } as const;
  return (
    <View testID={testID} style={style} {...(hideLegend ? img : {})}>
      <View {...(hideLegend ? {} : img)} style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>{values.map((v, i) => cell(v, 18, i))}</View>
      {hideLegend ? null : (
        <View style={{ marginTop: 12, flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={{ fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] }}>Less</Text>
          {[0.2, 0.4, 0.6, 0.8, 1].map((v, i) => cell(v, 12, 100 + i))}
          <Text style={{ fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] }}>More</Text>
        </View>
      )}
    </View>
  );
}
