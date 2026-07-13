import { createAreaChart } from "./area-chart.shared.js";
import { iosSkin } from "../shared/charts.styles.js";

// iOS AreaChart. Metro resolves this file on iOS; the docs import it for preview.
// AreaChart is a "Shared" treatment (data visualization is platform-neutral), so
// the iOS skin matches the web look exactly.
export const AreaChart = createAreaChart(iosSkin);
export type { AreaChartProps } from "./area-chart.shared.js";
