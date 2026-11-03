import { compositionInspectProps } from "../pie-chart/composition-inspect.js";
import { StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import { View, Text, Pressable, useTheme, useControllableState, devWarn, type LayoutStyle } from "../../style/index.js";
import { platformShape } from "../../style/platform-shape.js";
import { CHART_LOOK } from "../shared/charts.styles.js";
import { seriesFill } from "../shared/charts.styles.js";
import { type StackedSegment } from "../shared/types.js";
import { ChartLegend } from "../shared/chart-legend.js";
import { announceSelection, pressPoint, DIM_OPACITY } from "../shared/chart-inspect.js";
import { MONO_FONT } from "../../style/mono.js";
import { formatCompact, polarPoint } from "../shared/chart-math.js";
import { AnatomyPart, AnatomyScope, useAnatomyPart } from "../../style/anatomy.js";

// RadialBarChart is a "Shared" platform treatment (data visualization is
// platform-neutral): one implementation serves iOS, Android, and the web.
//
// RadialBarChart: concentric arc rings, one per category, outermost first.
// Each ring pairs a muted full-circle track with a ramp-colored value arc
// revealed clockwise from 12 o'clock (the ProgressRing anatomy, stacked),
// with a column legend carrying the formatted values. Pressing a ring
// selects it (the others dim); pressing outside the rings clears.

export interface RadialBarChartProps {
  /** One ring per entry, outer to inner. */
  data: StackedSegment[];
  /** What the rings measure (e.g. "Platform activation"); leads the accessible name. */
  label?: string;
  /** The value of a full sweep. Defaults to the largest entry. */
  max?: number;
  // Density (omit for the default 160 disc; compact is 120).
  compact?: boolean;
  /** Hide the value legend (the accessible name still carries every value). */
  hideLegend?: boolean;
  /** A compact disc with a separate value column and shared maximum caption. */
  detailed?: boolean;
  /** Formats legend values (data formatting, not styling). */
  formatValue?: (v: number) => string;
  /** Press-to-inspect: the selected ring index (controlled). Pass null for none. */
  selected?: number | null;
  /** Press-to-inspect: the initially selected ring (uncontrolled). */
  defaultSelected?: number;
  /** Fired when a press selects a ring (or clears it with null). */
  onSelect?: (index: number | null) => void;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** For sizing/composition only. */
  style?: LayoutStyle;
}

const MAX_RINGS = 6;

// A full circle as a stroked path: two half arcs from 12 o'clock, so a dash
// reveal starts at the top (an SVG circle's dash origin sits at 3 o'clock).
function circlePath(cx: number, cy: number, r: number): string {
  return `M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} A ${r} ${r} 0 0 1 ${cx} ${cy - r}`;
}

/** Concentric arc rings, one per category, over a muted track. */
export function RadialBarChart(props: RadialBarChartProps) {
  const { data, testID, style } = props;
  // The anatomy parts a docs AnatomyProvider numbers (src/style/anatomy.tsx), in the
  // hand-off's order: Chart frame, Bar, Track, Legend.
  const framePart = useAnatomyPart("Chart frame");
  const barPart = useAnatomyPart("Bar");
  const trackPart = useAnatomyPart("Track");
  const legendPart = useAnatomyPart("Legend");
  const { tokens } = useTheme();
  const compact = !!props.compact;
  const formatValue = props.formatValue ?? formatCompact;

  devWarn(data.length === 0, "[canvas] <RadialBarChart />: `data` is empty; the chart renders with no rings.");
  devWarn(
    data.length > MAX_RINGS,
    `[canvas] <RadialBarChart />: more than ${MAX_RINGS} rings read poorly; aggregate the tail into fewer categories.`,
  );

  const clean = data.map((d) => (Number.isFinite(d.value) && d.value > 0 ? d.value : 0));
  const max = props.max != null && props.max > 0 ? props.max : Math.max(1, ...clean);
  const pctOf = (v: number): number => Math.round(Math.max(0, Math.min(1, v / max)) * 100);

  const size = props.detailed ? 132 : compact ? 120 : 160;
  const stroke = props.detailed ? 11 * 132 / 160 : compact ? 8 : 10;
  // The hand-off's rings sit 16 apart at a 10 stroke: a 6 px gap.
  const gap = props.detailed ? 3 * 132 / 160 : 6;
  const center = size / 2;
  // The first series is the outermost ring, hugging the disc, and each next ring steps
  // inward (the renderer's `r = 74 - i * 16`).
  const rOuter = props.detailed ? 64 * 132 / 160 : center - stroke / 2;
  const radiusOf = (i: number): number => rOuter - i * (stroke + gap);

  // Press-to-inspect: nearest ring by press radius, cleared elsewhere.
  const [selected, setSelectedRaw] = useControllableState<number | null>(props.selected, props.defaultSelected ?? null, props.onSelect);
  const setSelected = (i: number | null) => {
    setSelectedRaw(i);
    if (i != null && data[i]) announceSelection(`${data[i].label}: ${pctOf(clean[i])}%`);
  };
  const toggle = (i: number) => setSelected(selected === i ? null : i);
  const onPlotPress = (x: number, y: number) => {
    const dist = Math.hypot(x - center, y - center);
    for (let i = 0; i < data.length; i++) {
      if (Math.abs(dist - radiusOf(i)) <= stroke / 2 + 2) {
        toggle(i);
        return;
      }
    }
    setSelected(null);
  };

  // The composition lives in the accessible name (each ring's share of the
  // full sweep); the img role hoists to the root when the legend is hidden.
  const name = `${props.label ?? "Radial bar chart"}: ${data.map((d, i) => `${d.label} ${pctOf(clean[i])}%`).join(", ")}`;
  const img = { accessibilityRole: "image", accessibilityLabel: name, "aria-label": name } as const;

  // The first ring's Bar and Track part boxes: measurable views on the outermost ring
  // (SVG paths have no layout on native), the bar's at the end of its sweep and the
  // track's at the ring's left, both as wide as the stroke.
  const barRing = data.findIndex((_, i) => radiusOf(i) >= stroke && clean[i] > 0);
  const barEnd = barRing >= 0 ? polarPoint(center, center, radiusOf(barRing), 2 * Math.PI * Math.max(0, Math.min(1, clean[barRing] / max))) : null;
  const trackRing = data.findIndex((_, i) => radiusOf(i) >= stroke);
  const trackAt = trackRing >= 0 ? polarPoint(center, center, radiusOf(trackRing), (3 * Math.PI) / 2) : null;
  const probe = (at: { x: number; y: number }) => ({ position: "absolute" as const, left: at.x - stroke / 2, top: at.y - stroke / 2, width: stroke, height: stroke });

  return (
    <AnatomyScope>
    <View testID={testID} style={[{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: props.detailed ? 16 : 20 }, style]} {...(props.hideLegend ? { ...img, ...compositionInspectProps(data.length, selected, setSelected) } : {})}>
      <View ref={framePart?.ref} onLayout={framePart?.onLayout} {...(props.hideLegend ? {} : { ...img, ...compositionInspectProps(data.length, selected, setSelected) })} style={{ width: size, height: size }}>
        <Svg width={size} height={size} style={{ position: "absolute" }}>
          {data.map((d, i) => {
            const r = radiusOf(i);
            if (r < stroke) return null;
            const dim = selected != null && selected !== i ? DIM_OPACITY : 1;
            return <Path key={i} d={circlePath(center, center, r)} fill="none" stroke={props.detailed ? tokens["surface-raised"] ?? tokens.muted : tokens.muted} strokeWidth={stroke} opacity={dim} />;
          })}
          {data.map((d, i) => {
            const r = radiusOf(i);
            if (r < stroke) return null;
            const circumference = 2 * Math.PI * r;
            const dim = selected != null && selected !== i ? DIM_OPACITY : 1;
            const fraction = Math.max(0, Math.min(1, clean[i] / max));
            if (fraction <= 0) return null;
            return (
              <Path
                key={`v${i}`}
                d={circlePath(center, center, r)}
                fill="none"
                stroke={seriesFill(tokens, i)}
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={`${circumference * fraction} ${circumference}`}
                opacity={dim}
              />
            );
          })}
        </Svg>
        {barPart && barEnd ? <View ref={barPart.ref} onLayout={barPart.onLayout} style={[probe(barEnd), { pointerEvents: "none" }]} /> : null}
        {trackPart && trackAt ? <View ref={trackPart.ref} onLayout={trackPart.onLayout} style={[probe(trackAt), { pointerEvents: "none" }]} /> : null}
        {/* Empty hit layer on top: the press target must be this Pressable
            itself so web offsetX coordinates stay plot-relative. */}
        <Pressable
          accessible={false}
          onPress={(e) => {
            const point = pressPoint(e);
            if (point) onPlotPress(point.x, point.y);
          }}
          style={StyleSheet.absoluteFill}
        />
      </View>
      {props.hideLegend ? null : props.detailed ? (
        <View ref={legendPart?.ref} onLayout={legendPart?.onLayout} style={{ flex: 1, minWidth: 100, gap: 8 }}>
          {data.map((d, i) => <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ width: 8, height: 8, borderRadius: platformShape.web.cell, backgroundColor: seriesFill(tokens, i) }} />
            <Text style={{ flex: 1, fontSize: 13, lineHeight: 16, color: tokens["muted-foreground"] }}>{d.label}</Text>
            <Text style={{ fontFamily: MONO_FONT, fontSize: 12, lineHeight: 16, fontWeight: "500", color: tokens.foreground }}>{formatValue(clean[i])}</Text>
          </View>)}
          <Text style={{ borderTopWidth: 1, borderTopColor: tokens.border, paddingTop: 6, fontFamily: MONO_FONT, fontSize: CHART_LOOK.legendCaptionSize, lineHeight: 14, color: tokens["subtle-foreground"] }}>max {formatValue(max)}</Text>
        </View>
      ) : (
        <AnatomyPart part={legendPart}>
          <ChartLegend
            flush
            items={data.map((d, i) => ({
              label: `${d.label} ${formatValue(clean[i])}`,
              color: seriesFill(tokens, i),
            }))}
          />
        </AnatomyPart>
      )}
    </View>
    </AnatomyScope>
  );
}
