import { createChart } from "./charts.shared.js";
import { webSkin } from "./charts.styles.js";

// Web Chart (the base; Metro falls back to it on native, web bundlers resolve it).
// Chart is a "Shared" treatment, so iOS and Android render this same look.
export const Chart = createChart(webSkin);
export type { ChartProps, ChartDatum } from "./charts.shared.js";
export { StackedBar, Gauge, Heatmap } from "./charts-viz.js";
export type { StackedBarProps, StackedSegment, GaugeProps, HeatmapProps } from "./charts-viz.js";
