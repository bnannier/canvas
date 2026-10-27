import { useMaterialTheme } from "../../style/glass-surface/use-material-theme.js";
import { StyleSheet } from "react-native";
import { View, Text, Pressable, useControllableState, devWarn, tabularNums, type LayoutStyle, GlassPane, paneStyle, isGlass } from "../../style/index.js";
import * as s from "../shared/charts.styles.js";
import { type ChartSkin } from "../shared/types.js";
import { type StackedSegment } from "../shared/types.js";
import { CHART_ROOT } from "../shared/chart-frame.js";
import { announceSelection, pressPoint, DIM_OPACITY } from "../shared/chart-inspect.js";
import { formatCompact } from "../shared/chart-math.js";
import { platformShape } from "../../style/platform-shape.js";
import { MONO_FONT } from "../../style/mono.js";

// Shared FunnelChart shell. Stage-by-stage conversion: a row per stage of its label,
// a centered ramp-colored bar whose width is the stage's share of the first, and its
// value (the hand-off's funnel). The conversion from the previous stage leads the
// accessible name. Pressing a stage selects it (the others dim).
//
// FunnelChart is a "Shared" platform treatment (data visualization is
// platform-neutral): the skin carries the same values on every OS.
//
// Boolean-prop axes:
// - Readout: `share` shows each stage as a share of the FIRST stage instead of
//   its count (the accessible name then names that share).
// - Density: `compact` shortens the funnel.

export interface FunnelChartProps {
  /** Ordered stages, widest first. */
  stages: StackedSegment[];
  /** Optional heading shown above the funnel. */
  title?: string;
  /** Show each stage as a share of the FIRST stage instead of the conversion
   *  from the previous stage. */
  share?: boolean;
  // Density (omit for the default funnel height).
  compact?: boolean;
  /** Formats stage values (data formatting, not styling). */
  formatValue?: (v: number) => string;
  /** Press-to-inspect: the selected stage index (controlled). Pass null for none. */
  selected?: number | null;
  /** Press-to-inspect: the initially selected stage (uncontrolled). */
  defaultSelected?: number;
  /** Fired when a press selects a stage (or clears it with null). */
  onSelect?: (index: number | null) => void;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. */
  style?: LayoutStyle;
}

// The v4 hand-off's funnel (`K.def('funnel-chart')`): one row per stage, 6 px apart, of
// a 110 px label in the muted ink, a centered bar whose width is the stage's share of the
// first (26 px tall, 18 compact, at the funnel-bar corner, in its series colour) and a
// 56 px mono value: the count, or the share of the first stage with `share`.
const BAR_HEIGHT = { default: 26, compact: 18 } as const;
const ROW_GAP = 6;
const COLUMN_GAP = 10;
const LABEL_WIDTH = 110;
const VALUE_WIDTH = 56;

export function createFunnelChart(skin: ChartSkin) {
  return function FunnelChart(props: FunnelChartProps) {
    const { stages, title, testID, style } = props;
    const theme = useMaterialTheme({ layer: "content" });
    const { tokens } = theme;
    const surfaceShape = s.surface(tokens, skin.surfaceRadius);
    const glass = isGlass(theme);
    const compact = !!props.compact;
    const formatValue = props.formatValue ?? formatCompact;

    devWarn(stages.length === 0, "[canvas] <FunnelChart />: `stages` is empty; the chart renders with no funnel.");
    devWarn(
      stages.some((st, i) => i > 0 && (Number.isFinite(st.value) ? st.value : 0) > (Number.isFinite(stages[i - 1].value) ? stages[i - 1].value : 0)),
      "[canvas] <FunnelChart />: a stage exceeds its predecessor; a funnel narrows, so reorder or aggregate the stages.",
    );

    const clean = stages.map((st) => (Number.isFinite(st.value) && st.value > 0 ? st.value : 0));
    const barH = compact ? BAR_HEIGHT.compact : BAR_HEIGHT.default;
    const peak = Math.max(...clean, 0);

    // Conversion readout per stage: of the previous stage (default), or of
    // the first stage (`share`). The first stage reads 100%.
    const pctOf = (i: number): number => {
      if (i === 0) return 100;
      const base = props.share ? clean[0] : clean[i - 1];
      return base > 0 ? Math.round((clean[i] / base) * 100) : 0;
    };
    const phrase = (i: number): string => {
      const st = stages[i];
      if (i === 0) return `${st.label} ${formatValue(clean[i])}`;
      return `${st.label} ${formatValue(clean[i])} (${pctOf(i)}% of ${props.share ? stages[0].label : stages[i - 1].label})`;
    };
    const name = `${title ?? "Funnel"}: ${stages.map((_, i) => phrase(i)).join(", ")}`;

    const [selected, setSelectedRaw] = useControllableState<number | null>(props.selected, props.defaultSelected ?? null, props.onSelect);
    const setSelected = (i: number | null) => {
      setSelectedRaw(i);
      if (i != null && stages[i]) announceSelection(phrase(i));
    };
    const toggle = (i: number) => setSelected(selected === i ? null : i);

    return (
      <View
        {...(title != null && title !== "" ? { role: "group" as const, accessibilityLabel: `${title} chart`, "aria-label": `${title} chart` } : {})}
        testID={testID}
        style={[
          paneStyle(theme, [surfaceShape, compact ? s.surfacePadCompact : s.surfacePadDefault]),
          CHART_ROOT,
          style,
        ]}
      >
        {/* The chart frame is a CONTENT-layer pane under glass (nothing in solid mode). */}
        {glass ? <GlassPane layer="content" shape={surfaceShape} /> : null}
        {title != null && title !== "" ? (
          <Text style={[s.title(tokens), compact ? s.titleCompact : s.titleDefault]}>{title}</Text>
        ) : null}
        <View accessible accessibilityRole="image" role="img" accessibilityLabel={name} aria-label={name} style={{ gap: ROW_GAP }}>
          {stages.map((st, i) => {
            const share = peak > 0 ? (clean[i] / peak) * 100 : 0;
            return (
              <View
                key={i}
                style={[{ flexDirection: "row", alignItems: "center", gap: COLUMN_GAP, height: barH, opacity: selected != null && selected !== i ? DIM_OPACITY : 1 }]}
              >
                <Text numberOfLines={1} style={{ width: LABEL_WIDTH, fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] }}>
                  {st.label}
                </Text>
                <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", alignItems: "center" }}>
                  <View style={{ height: barH, width: `${share}%`, borderRadius: platformShape.web.funnelBar, backgroundColor: s.seriesFill(tokens, i) }} />
                </View>
                <Text numberOfLines={1} style={{ width: VALUE_WIDTH, textAlign: "right", fontFamily: MONO_FONT, fontSize: 12, lineHeight: 16, fontWeight: "500", color: tokens["card-foreground"], ...tabularNums() }}>
                  {props.share ? `${Math.round(share)}%` : formatValue(clean[i])}
                </Text>
              </View>
            );
          })}
          {/* Empty hit layer: stage index by press y (uniform stage bands). */}
          <Pressable
            accessible={false}
            onPress={(e) => {
              const point = pressPoint(e);
              if (!point) return;
              const i = Math.floor(point.y / (barH + ROW_GAP));
              if (i >= 0 && i < stages.length) toggle(i);
            }}
            style={StyleSheet.absoluteFill}
          />
        </View>
      </View>
    );
  };
}
