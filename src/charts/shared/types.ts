// Shared data shapes for the Chart family. They live here (not in any one
// component) because several chart types consume them: ChartSeries feeds the
// grouped Chart, LineChart, AreaChart, and CandlestickChart overlays;
// StackedSegment is both a StackedBar segment and a PieChart slice; ChartSkin
// is the per-OS skin contract every chart entry file instantiates.

export interface ChartSkin {
  /** Corner radius of the bordered card surface. */
  surfaceRadius: number;
  /** Corner radius of a bar's leading-edge corners (top of a vertical bar, right of a horizontal bar). */
  barRadius: number;
}

/**
 * One plotted series for the multi-series chart types (grouped Chart bars,
 * LineChart, AreaChart, CandlestickChart overlays): a label (legend +
 * accessible name) and one value per category label, aligned by index.
 */
export interface ChartSeries {
  /** Stable identity for React keys when series can reorder. */
  id?: string | number;
  /** Series name, shown in the legend and leading the accessible data. */
  label: string;
  /** One value per category label, aligned by index. */
  values: number[];
}

/** One StackedBar segment / PieChart slice: a label and its magnitude. */
export interface StackedSegment {
  /** The segment label shown in the legend. */
  label: string;
  /** The segment magnitude; each segment's share of the total. */
  value: number;
}
