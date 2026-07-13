import { createChart } from "./charts.shared.js";
import { createAreaChart, createLineChart } from "./charts-lines.js";
import { createScatterPlot } from "./charts-scatter.js";
import { createCandlestickChart } from "./charts-candles.js";
import { webSkin } from "./charts.styles.js";

// Web Chart (the base; Metro falls back to it on native, web bundlers resolve it).
// Chart is a "Shared" treatment, so iOS and Android render this same look.
export const Chart = createChart(webSkin);
export const LineChart = createLineChart(webSkin);
export const AreaChart = createAreaChart(webSkin);
export const ScatterPlot = createScatterPlot(webSkin);
export const CandlestickChart = createCandlestickChart(webSkin);
export type { ChartProps, ChartDatum } from "./charts.shared.js";
export type { LineChartProps, AreaChartProps, ChartSeries } from "./charts-lines.js";
export type { ScatterPlotProps, ScatterSeries, ScatterPoint, ScatterSelection } from "./charts-scatter.js";
export type { CandlestickChartProps, Candle } from "./charts-candles.js";
export { StackedBar, Gauge, Heatmap, PieChart } from "./charts-viz.js";
export type { StackedBarProps, StackedSegment, GaugeProps, HeatmapProps, PieChartProps } from "./charts-viz.js";
