import { createChart } from "./charts.shared.js";
import { createAreaChart, createLineChart } from "./charts-lines.js";
import { createScatterPlot } from "./charts-scatter.js";
import { createCandlestickChart } from "./charts-candles.js";
import { iosSkin } from "./charts.styles.js";

// iOS (HIG Charts / Swift Charts) Chart. Metro resolves this file on iOS; the docs
// import it for preview. Chart is a "Shared" treatment (data visualization is
// platform-neutral), so the iOS skin matches the web look exactly.
export const Chart = createChart(iosSkin);
export const LineChart = createLineChart(iosSkin);
export const AreaChart = createAreaChart(iosSkin);
export const ScatterPlot = createScatterPlot(iosSkin);
export const CandlestickChart = createCandlestickChart(iosSkin);
export type { ChartProps, ChartDatum } from "./charts.shared.js";
export type { LineChartProps, AreaChartProps, ChartSeries } from "./charts-lines.js";
export type { ScatterPlotProps, ScatterSeries, ScatterPoint, ScatterSelection } from "./charts-scatter.js";
export type { CandlestickChartProps, Candle } from "./charts-candles.js";
export { StackedBar, Gauge, Heatmap, PieChart } from "./charts-viz.js";
export type { StackedBarProps, StackedSegment, GaugeProps, HeatmapProps, PieChartProps } from "./charts-viz.js";
