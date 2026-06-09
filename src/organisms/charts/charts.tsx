import { cn } from "../../cn.js";
import { View, Text } from "../../engine/index.js";

// Chart: a token-themed bar chart built entirely from View views, no SVG and no
// CSS grid. Each datum is a vertical (or horizontal) bar whose length is a
// pixel height computed in JS from its value against the axis max, so the
// engine only ever sees concrete arbitrary-length utilities (h-[Npx] / w-[Npx])
// that the resolver supports. A label sits under (or beside) each bar.
//
// This is Canvas's faithful, SVG-free take on the docs "charts" organism: the
// other chart types in that entry (sparkline, gauge, heatmap, stacked) lean on
// SVG and grid, which the engine has no utilities for, so they are approximated
// by the bar chart here.
//
// Boolean-prop API: one boolean per option, grouped by axis, first-match
// precedence within an axis (mirrors Button's intentOf). Axes:
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
  className?: string;
}

type Tone = "primary" | "success" | "destructive";

// Tone precedence when more than one is passed: first match wins.
function toneOf(p: ChartProps): Tone {
  if (p.success) return "success";
  if (p.destructive) return "destructive";
  return "primary";
}

// The fill for each bar, by tone. Token primary by default; saturated palette
// hues for the success / destructive tones so the chart reads in either scheme.
const BAR_FILL: Record<Tone, string> = {
  primary: "bg-primary",
  success: "bg-green-500",
  destructive: "bg-red-500",
};

// The bordered, shadowed card surface, mirroring the docs `cardCls` plus its
// padding.
const SURFACE = "rounded-lg border border-border bg-card shadow-sm";

// Plot length in px (bar travel: chart height for vertical, bar width for
// horizontal), and the per-bar gap, by density.
const PLOT_LENGTH = { default: 140, compact: 96 } as const;

export function Chart(props: ChartProps) {
  const { data, title, className } = props;
  const tone = toneOf(props);
  const horizontal = !!props.horizontal;
  const compact = !!props.compact;

  const fill = BAR_FILL[tone];
  const plot = compact ? PLOT_LENGTH.compact : PLOT_LENGTH.default;
  // Axis max: the caller's, else the largest value, else 1 to avoid /0.
  const values = data.map((d) => d.value);
  const max = props.max != null && props.max > 0 ? props.max : Math.max(1, ...values);

  // Map a value to a clamped pixel length along the plot axis.
  const lengthPx = (value: number): number => {
    const ratio = Math.max(0, Math.min(1, value / max));
    return Math.max(2, Math.round(ratio * plot));
  };

  const surface = cn(SURFACE, compact ? "p-4" : "p-5", className);
  const gap = compact ? "gap-1.5" : "gap-2";

  return (
    <View className={surface}>
      {title != null && title !== "" ? (
        <Text className={cn("font-semibold text-card-foreground", compact ? "mb-3 text-sm" : "mb-4 text-base")}>
          {title}
        </Text>
      ) : null}

      {horizontal ? (
        // Horizontal: each row is a label, a track-aligned bar, and the value.
        <View className={cn("flex-col", gap)}>
          {data.map((d, i) => (
            <View key={i} className="flex-row items-center gap-2">
              <Text className="w-16 text-xs text-muted-foreground">{d.label}</Text>
              <View className="flex-1 flex-row items-center">
                <View className={cn("h-3 rounded-r", fill, `w-[${lengthPx(d.value)}px]`)} />
              </View>
              <Text className="text-xs font-medium text-card-foreground">{d.value}</Text>
            </View>
          ))}
        </View>
      ) : (
        // Vertical: a baseline-aligned row of columns, each a bar over its label.
        <View>
          <View
            className={cn("flex-row items-end", gap)}
            style={{ height: plot }}
          >
            {data.map((d, i) => (
              <View key={i} className="flex-1 items-stretch">
                <View className={cn("rounded-t", fill, `h-[${lengthPx(d.value)}px]`)} />
              </View>
            ))}
          </View>
          {/* Baseline under the bars. */}
          <View className="h-px w-full bg-border" />
          <View className={cn("mt-2 flex-row", gap)}>
            {data.map((d, i) => (
              <Text key={i} className="flex-1 text-center text-xs text-muted-foreground">
                {d.label}
              </Text>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
