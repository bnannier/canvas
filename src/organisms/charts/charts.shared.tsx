import { View, Text, useTheme, type StyleProp, type ViewStyle } from "../../style/index.js";
import * as s from "./charts.styles.js";
import { type Tone } from "./charts.styles.js";

// Shared Chart shell. The structure (a token-themed bar chart built entirely from
// View views, no SVG and no CSS grid), the boolean-prop axes (tone + orientation +
// density), the value-to-pixel math, the data-shape types, and the token-backed fill
// logic all live here once; a platform file supplies only its skin (the surface and
// bar corner radii) and calls createChart.
//
// Chart: each datum is a vertical (or horizontal) bar whose length is a pixel height
// computed in JS from its value against the axis max. A label sits under (or beside)
// each bar.
//
// This is Canvas's faithful, SVG-free take on the docs "charts" organism: the other
// chart types in that entry (sparkline, gauge, heatmap, stacked) lean on SVG and grid,
// so they are approximated by the bar chart here.
//
// Chart is a "Shared" platform treatment: data visualization is platform-neutral. The
// iOS HIG Charts page (Swift Charts) and the shadcn web chart are the same plotted-bar
// idiom, and Material 3 ships no charts component at all, so there is no native shape to
// diverge on. The skin therefore carries the same values on iOS, Android, and web; the
// per-OS files exist only so the architecture is uniform across the kit.
//
// Boolean-prop API: one boolean per option, grouped by axis, first-match precedence
// within an axis (mirrors Button's intentOf). Axes:
//
// - Tone (pick one; default is the primary fill): `success` paints bars green,
//   `destructive` paints them red. Precedence: success > destructive > default.
// - Orientation: `horizontal` lays bars out as sideways rows; omit for the
//   default vertical column chart.
// - Density: `compact` shrinks the plot area and tightens the gaps; omit for
//   the default density.

export interface ChartDatum {
  /** Bucket label shown under (vertical) or beside (horizontal) the bar. */
  label: string;
  /** The bar's magnitude. Compared against `max` to size the bar. */
  value: number;
}

export interface ChartProps {
  /** The bars to render, in order. */
  data: ChartDatum[];
  /** Optional heading shown above the plot. */
  title?: string;
  /** Axis maximum. Defaults to the largest value in `data`. */
  max?: number;
  // Tone (pick one; default is the primary fill).
  success?: boolean;
  destructive?: boolean;
  // Orientation (default is a vertical column chart).
  horizontal?: boolean;
  // Density (default is the standard plot size).
  compact?: boolean;
  /** Escape hatch for layout/positioning composition (mainly width). */
  style?: StyleProp<ViewStyle>;
}

export interface ChartSkin {
  /** Corner radius of the bordered card surface. */
  surfaceRadius: number;
  /** Corner radius of a bar's leading-edge corners (top of a vertical bar, right of a horizontal bar). */
  barRadius: number;
}

// Tone precedence when more than one is passed: first match wins.
function toneOf(p: ChartProps): Tone {
  if (p.success) return "success";
  if (p.destructive) return "destructive";
  return "primary";
}

// Plot length in px (bar travel: chart height for vertical, bar width for
// horizontal), by density.
const PLOT_LENGTH = { default: 140, compact: 96 } as const;

export function createChart(skin: ChartSkin) {
  return function Chart(props: ChartProps) {
    const { data, title, style } = props;
    const tone = toneOf(props);
    const horizontal = !!props.horizontal;
    const compact = !!props.compact;
    const { tokens } = useTheme();

    const fill = s.barFill(tokens, tone);
    const plot = compact ? PLOT_LENGTH.compact : PLOT_LENGTH.default;
    // Axis max: the caller's, else the largest value, else 1 to avoid /0.
    const values = data.map((d) => d.value);
    const max = props.max != null && props.max > 0 ? props.max : Math.max(1, ...values);

    // Map a value to a clamped pixel length along the plot axis.
    const lengthPx = (value: number): number => {
      const ratio = Math.max(0, Math.min(1, value / max));
      return Math.max(2, Math.round(ratio * plot));
    };

    // Per-bar gap by density: gap-1.5 (6) compact, gap-2 (8) default.
    const gap = compact ? 6 : 8;

    return (
      <View
        style={[
          s.surface(tokens, skin.surfaceRadius),
          compact ? s.surfacePadCompact : s.surfacePadDefault,
          style,
        ]}
      >
        {title != null && title !== "" ? (
          <Text style={[s.title(tokens), compact ? s.titleCompact : s.titleDefault]}>{title}</Text>
        ) : null}

        {horizontal ? (
          // Horizontal: each row is a label, a track-aligned bar, and the value.
          <View style={[s.horizontalStack, { gap }]}>
            {data.map((d, i) => (
              <View key={i} style={s.horizontalRow}>
                <Text style={s.horizontalLabel(tokens)}>{d.label}</Text>
                <View style={s.horizontalTrack}>
                  <View style={s.horizontalBar(fill, lengthPx(d.value), skin.barRadius)} />
                </View>
                <Text style={s.horizontalValue(tokens)}>{d.value}</Text>
              </View>
            ))}
          </View>
        ) : (
          // Vertical: a baseline-aligned row of columns, each a bar over its label.
          <View>
            <View style={[s.verticalBars, { gap, height: plot }]}>
              {data.map((d, i) => (
                <View key={i} style={s.verticalColumn}>
                  <View style={s.verticalBar(fill, lengthPx(d.value), skin.barRadius)} />
                </View>
              ))}
            </View>
            {/* Baseline under the bars. */}
            <View style={s.baseline(tokens)} />
            <View style={[s.verticalLabelsRow, { gap }]}>
              {data.map((d, i) => (
                <Text key={i} style={s.verticalLabel(tokens)}>
                  {d.label}
                </Text>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };
}
