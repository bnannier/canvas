import { createLineChart } from "./line-chart.shared.js";
import { iosSkin } from "../shared/charts.styles.js";

// iOS LineChart. Metro resolves this file on iOS; the docs import it for preview.
// LineChart is a "Shared" treatment (data visualization is platform-neutral), so
// the iOS skin matches the web look exactly.
export const LineChart = createLineChart(iosSkin);
export type { LineChartProps } from "./line-chart.shared.js";
