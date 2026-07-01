import { createChart } from "./charts.shared.js";
import { androidSkin } from "./charts.styles.js";

// Material 3 Chart. Metro resolves this file on Android; the docs import it for
// preview. Material 3 ships no charts component, and data visualization is
// platform-neutral, so this "Shared" treatment matches the web look exactly.
export const Chart = createChart(androidSkin);
export type { ChartProps, ChartDatum } from "./charts.shared.js";
export { StackedBar, Gauge, Heatmap } from "./charts-viz.js";
export type { StackedBarProps, StackedSegment, GaugeProps, HeatmapProps } from "./charts-viz.js";
