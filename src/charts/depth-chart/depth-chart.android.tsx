import { createDepthChart } from "./depth-chart.shared.js";
import { androidSkin } from "../shared/charts.styles.js";

// Material DepthChart. Metro resolves this file on Android; the docs import it for
// preview. Data visualization is platform-neutral, so this "Shared" treatment
// matches the web look exactly.
export const DepthChart = createDepthChart(androidSkin);
export type { DepthChartProps, DepthLevel } from "./depth-chart.shared.js";
