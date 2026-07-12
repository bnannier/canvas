import { createChart } from "./charts.shared.js";
import { createAreaChart, createLineChart } from "./charts-lines.js";
import { iosSkin } from "./charts.styles.js";

// iOS (HIG Charts / Swift Charts) Chart. Metro resolves this file on iOS; the docs
// import it for preview. Chart is a "Shared" treatment (data visualization is
// platform-neutral), so the iOS skin matches the web look exactly.
export const Chart = createChart(iosSkin);
export const LineChart = createLineChart(iosSkin);
export const AreaChart = createAreaChart(iosSkin);
export type { ChartProps, ChartDatum } from "./charts.shared.js";
export type { LineChartProps, AreaChartProps, ChartSeries } from "./charts-lines.js";
export { StackedBar, Gauge, Heatmap } from "./charts-viz.js";
export type { StackedBarProps, StackedSegment, GaugeProps, HeatmapProps } from "./charts-viz.js";
