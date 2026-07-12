import { createChart } from "./charts.shared.js";
import { createAreaChart, createLineChart } from "./charts-lines.js";
import { createScatterPlot } from "./charts-scatter.js";
import { androidSkin } from "./charts.styles.js";

// Material 3 Chart. Metro resolves this file on Android; the docs import it for
// preview. Material 3 ships no charts component, and data visualization is
// platform-neutral, so this "Shared" treatment matches the web look exactly.
export const Chart = createChart(androidSkin);
export const LineChart = createLineChart(androidSkin);
export const AreaChart = createAreaChart(androidSkin);
export const ScatterPlot = createScatterPlot(androidSkin);
export type { ChartProps, ChartDatum } from "./charts.shared.js";
export type { LineChartProps, AreaChartProps, ChartSeries } from "./charts-lines.js";
export type { ScatterPlotProps, ScatterSeries, ScatterPoint, ScatterSelection } from "./charts-scatter.js";
export { StackedBar, Gauge, Heatmap, PieChart } from "./charts-viz.js";
export type { StackedBarProps, StackedSegment, GaugeProps, HeatmapProps, PieChartProps } from "./charts-viz.js";
