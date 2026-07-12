import { createChart } from "./charts.shared.js";
import { createAreaChart, createLineChart } from "./charts-lines.js";
import { webSkin } from "./charts.styles.js";

// Web Chart (the base; Metro falls back to it on native, web bundlers resolve it).
// Chart is a "Shared" treatment, so iOS and Android render this same look.
export const Chart = createChart(webSkin);
export const LineChart = createLineChart(webSkin);
export const AreaChart = createAreaChart(webSkin);
export type { ChartProps, ChartDatum } from "./charts.shared.js";
export type { LineChartProps, AreaChartProps, ChartSeries } from "./charts-lines.js";
export { StackedBar, Gauge, Heatmap, PieChart } from "./charts-viz.js";
export type { StackedBarProps, StackedSegment, GaugeProps, HeatmapProps, PieChartProps } from "./charts-viz.js";
