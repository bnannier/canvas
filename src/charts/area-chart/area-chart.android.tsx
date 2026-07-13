import { createAreaChart } from "./area-chart.shared.js";
import { androidSkin } from "../shared/charts.styles.js";

// Material AreaChart. Metro resolves this file on Android; the docs import it for
// preview. Data visualization is platform-neutral, so this "Shared" treatment
// matches the web look exactly.
export const AreaChart = createAreaChart(androidSkin);
export type { AreaChartProps } from "./area-chart.shared.js";
