import { createDepthChart } from "./depth-chart.shared.js";
import { iosSkin } from "../shared/charts.styles.js";

// iOS DepthChart. Metro resolves this file on iOS; the docs import it for preview.
// DepthChart is a "Shared" treatment (data visualization is platform-neutral), so
// the iOS skin matches the web look exactly.
export const DepthChart = createDepthChart(iosSkin);
export type { DepthChartProps, DepthLevel } from "./depth-chart.shared.js";
