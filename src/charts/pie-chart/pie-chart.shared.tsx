import { compositionInspectProps } from "../pie-chart/composition-inspect.js";
import { StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import { View, Text, Pressable, useTheme, useControllableState, devWarn, alpha, type LayoutStyle } from "../../style/index.js";
import { platformShape } from "../../style/platform-shape.js";
import { seriesFill } from "../shared/charts.styles.js";
import { DISPLAY_FONT, MONO_FONT } from "../../style/mono.js";
import { ChartLegend } from "../shared/chart-legend.js";
import { announceSelection, pressPoint, DIM_OPACITY } from "../shared/chart-inspect.js";
import { arcPath, formatCompact, pieLayout, polarPoint } from "../shared/chart-math.js";
import { AnatomyPart, AnatomyScope, useAnatomyPart } from "../../style/anatomy.js";
import { type StackedSegment } from "../shared/types.js";

// PieChart is a "Shared" platform treatment (data visualization is
// platform-neutral): one implementation serves iOS, Android, and the web.
// Slice colors come from the theme's chart-1..chart-8 tokens in fixed order.

// PieChart: proportional composition as arc slices (donut with the total and a
// label centered inside), colored by the chart-1..8 tokens in fixed order,
// with the StackedBar-style legend identifying each slice.

export interface PieChartProps {
  /** The slices, in order; each takes its share of the circle. */
  slices: StackedSegment[];
  /** What the pie measures (e.g. "Traffic sources"); leads the accessible name. */
  label?: string;
  /** Draw an annular ring with the total and label centered inside. */
  donut?: boolean;
  /** Hide the legend (the labelled dots beside percentages). */
  hideLegend?: boolean;
  /** Spread names and shares into a value column beside a compact composition disc. */
  detailed?: boolean;
  /** Smaller diameter. */
  compact?: boolean;
  /** Press-to-inspect: the selected slice index (controlled). Pass null for none. */
  selected?: number | null;
  /** Press-to-inspect: the initially selected slice (uncontrolled). */
  defaultSelected?: number;
  /** Fired when a press selects a slice (or clears it with null). */
  onSelect?: (index: number | null) => void;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** For sizing/composition only. */
  style?: LayoutStyle;
}

// The gap between the disc and its legend (the hand-off's 20).
const LEGEND_GAP = 20;
// The donut center's caption under the total: the hand-off's 10 px in the subtle ink.
const CENTER_LABEL_TYPE = { fontSize: 10, lineHeight: 14 } as const;

/** Proportional slices with a percent legend; as a donut it shows the total in its center. */
export function PieChart(props: PieChartProps) {
  const { slices, label, donut, hideLegend, compact, testID, style } = props;
  // The anatomy parts a docs AnatomyProvider numbers (src/style/anatomy.tsx), in the
  // hand-off's order: Chart frame, Slice, Center value, Legend.
  const framePart = useAnatomyPart("Chart frame");
  const slicePart = useAnatomyPart("Slice");
  const centerPart = useAnatomyPart("Center value");
  const legendPart = useAnatomyPart("Legend");
  const { tokens, dark } = useTheme();
  const clean = slices.map((sl) => (Number.isFinite(sl.value) && sl.value > 0 ? sl.value : 0));
  const rawTotal = clean.reduce((a, b) => a + b, 0);
  const total = Math.max(1, rawTotal);
  const pctOf = (v: number) => Math.round(((Number.isFinite(v) && v > 0 ? v : 0) / total) * 100);

  devWarn(slices.length === 0, "[canvas] <PieChart />: `slices` is empty; the chart renders empty.");
  devWarn(slices.length > 0 && rawTotal <= 0, "[canvas] <PieChart />: all slice values are zero; the chart renders empty.");
  devWarn(
    slices.length > 8,
    "[canvas] <PieChart />: more than 8 slices cycles the series palette; fold small slices into an “Other” slice.",
  );

  // The v4 hand-off's disc (`K.def('pie-chart')`, a 160 viewBox drawn at 150 px): a pie
  // to r 70, a donut ring 22 wide around r 58 (69 out, 47 in), the legend 20 px
  // beside it.
  const size = props.detailed ? 136 : compact ? 120 : 150;
  const r = size / 2;
  const rOuter = props.detailed ? r : r * (donut ? 69 / 80 : 70 / 80);
  const rInner = donut ? props.detailed ? r - 20 : r * (47 / 80) : 0;
  const layout = pieLayout(clean);

  // Press-to-inspect: pressing a slice dims the others; a donut swaps its
  // center readout to the selected slice. Announced for assistive tech.
  const [selected, setSelectedRaw] = useControllableState<number | null>(props.selected, props.defaultSelected ?? null, props.onSelect);
  const setSelected = (i: number | null) => {
    setSelectedRaw(i);
    if (i != null && slices[i]) announceSelection(`${slices[i].label}: ${pctOf(slices[i].value)}%`);
  };
  const toggle = (i: number) => setSelected(selected === i ? null : i);
  // Slice hit-testing from the press position (radius + clockwise angle from
  // 12 o'clock), on an RN Pressable - SVG touchables leak responder props to
  // the DOM on web. Pressing the donut hole (or outside the disc) clears.
  const onPlotPress = (locationX: number, locationY: number) => {
    const dx = locationX - r;
    const dy = locationY - r;
    const dist = Math.hypot(dx, dy);
    if (dist > r || (donut && dist < rInner)) {
      setSelected(null);
      return;
    }
    const angle = (Math.atan2(dx, -dy) + 2 * Math.PI) % (2 * Math.PI);
    const idx = layout.findIndex((sl) => sl.fraction > 0 && angle >= sl.startAngle && angle < sl.endAngle);
    if (idx >= 0) toggle(idx);
  };

  // Same naming formula as StackedBar: the composition lives in the accessible
  // name, and the img role sits on the plot while the legend renders (hoisting
  // to the root when the legend is hidden).
  const name = `${label ?? "Pie chart"}: ${slices.map((sl) => `${sl.label} ${pctOf(sl.value)}%`).join(", ")}`;
  const img = { accessibilityRole: "image", accessibilityLabel: name, "aria-label": name } as const;

  // The first slice's part box: a measurable view over the middle of its arc (SVG paths
  // have no layout on native), a square as wide as its ring at its mid-angle and mid-radius.
  const first = layout.findIndex((sl) => sl.fraction > 0);
  const firstMid = first >= 0 ? polarPoint(r, r, (rOuter + rInner) / 2, (layout[first].startAngle + layout[first].endAngle) / 2) : null;
  const firstSide = Math.max(4, Math.min(rOuter - rInner, 2 * ((rOuter + rInner) / 2) * Math.sin(Math.min(first >= 0 ? layout[first].endAngle - layout[first].startAngle : 0, Math.PI) / 2)));

  return (
    <AnatomyScope>
    <View testID={testID} style={[{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: props.detailed ? 18 : LEGEND_GAP }, style]} {...(hideLegend ? { ...img, ...compositionInspectProps(slices.length, selected, setSelected) } : {})}>
      <View ref={framePart?.ref} onLayout={framePart?.onLayout} {...(hideLegend ? {} : { ...img, ...compositionInspectProps(slices.length, selected, setSelected) })} style={{ width: size, height: size, ...(props.detailed ? { borderRadius: 9999, boxShadow: [{ offsetX: 0, offsetY: 12, blurRadius: 30, spreadDistance: -14, color: alpha(tokens.primary, dark ? .5 : .4) }] } : {}), alignItems: "center", justifyContent: "center" }}>
        <Svg width={size} height={size} style={{ position: "absolute" }}>
          {layout.map((slice, i) =>
            slice.fraction > 0 ? (
              <Path
                key={i}
                d={arcPath(r, r, rOuter, rInner, slice.startAngle, props.detailed ? Math.max(slice.startAngle, slice.endAngle - Math.PI * 2 * .006) : slice.endAngle)}
                fill={seriesFill(tokens, i)}
                fillOpacity={selected != null && selected !== i ? DIM_OPACITY : 1}
                // The donut's ring leaves a hairline gap between its arcs (the hand-off's
                // .02 rad); the pie's slices abut.
                {...(donut && !props.detailed ? { stroke: tokens.card, strokeWidth: 1.5 } : {})}
              />
            ) : null,
          )}
        </Svg>
        {slicePart && firstMid ? <View ref={slicePart.ref} onLayout={slicePart.onLayout} style={[{ position: "absolute", left: firstMid.x - firstSide / 2, top: firstMid.y - firstSide / 2, width: firstSide, height: firstSide }, { pointerEvents: "none" }]} /> : null}
        {donut ? (
          // The center reads the total, or the selected slice while inspecting.
          <View style={{ alignItems: "center", gap: props.detailed ? 4 : 0 }}>
            <Text ref={centerPart?.ref} onLayout={centerPart?.onLayout} style={{ fontFamily: DISPLAY_FONT, fontSize: props.detailed ? 22 : compact ? 20 : 24, lineHeight: props.detailed ? 22 : compact ? 26 : 30, fontWeight: props.detailed ? "500" : "600", letterSpacing: props.detailed ? -.44 : 0, color: tokens["card-foreground"] }}>
              {selected != null && slices[selected] ? `${pctOf(slices[selected].value)}%` : formatCompact(rawTotal)}
            </Text>
            {(selected != null && slices[selected] ? slices[selected].label : label) ? (
              <Text style={{ ...CENTER_LABEL_TYPE, ...(props.detailed ? { fontFamily: MONO_FONT, lineHeight: 13 } : {}), color: tokens["subtle-foreground"] ?? tokens["muted-foreground"] }}>
                {selected != null && slices[selected] ? slices[selected].label : label}
              </Text>
            ) : null}
          </View>
        ) : null}
        {/* Empty hit layer on top: the press target must be this Pressable
            itself so web offsetX coordinates are plot-relative. */}
        <Pressable
          accessible={false}
          onPress={(e) => {
            const point = pressPoint(e);
            if (point) onPlotPress(point.x, point.y);
          }}
          style={StyleSheet.absoluteFill}
        />
      </View>
      {hideLegend ? null : props.detailed ? (
        <View ref={legendPart?.ref} onLayout={legendPart?.onLayout} style={{ flex: 1, minWidth: 110, gap: 8 }}>
          {slices.map((sl, i) => <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ width: 8, height: 8, borderRadius: platformShape.web.cell, backgroundColor: seriesFill(tokens, i) }} />
            <Text style={{ flex: 1, fontSize: 13, lineHeight: 16, color: tokens["muted-foreground"] }}>{sl.label}</Text>
            <Text style={{ fontFamily: MONO_FONT, fontSize: 12, lineHeight: 16, fontWeight: "500", color: tokens.foreground }}>{pctOf(sl.value)}%</Text>
          </View>)}
        </View>
      ) : (
        <AnatomyPart part={legendPart}>
        <ChartLegend
          flush
          items={slices.map((sl, i) => ({
            label: `${sl.label} · ${pctOf(sl.value)}%`,
            color: seriesFill(tokens, i),
          }))}
        />
        </AnatomyPart>
      )}
    </View>
    </AnatomyScope>
  );
}
