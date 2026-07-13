import { createLineChart } from "./line-chart.shared.js";
import { androidSkin } from "../shared/charts.styles.js";

// Material LineChart. Metro resolves this file on Android; the docs import it for
// preview. Data visualization is platform-neutral, so this "Shared" treatment
// matches the web look exactly.
export const LineChart = createLineChart(androidSkin);
export type { LineChartProps } from "./line-chart.shared.js";
