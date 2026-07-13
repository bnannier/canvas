import { createChart } from "./chart.shared.js";
import { iosSkin } from "../shared/charts.styles.js";

// iOS Chart. Metro resolves this file on iOS; the docs import it for preview.
// Chart is a "Shared" treatment (data visualization is platform-neutral), so
// the iOS skin matches the web look exactly.
export const Chart = createChart(iosSkin);
export type { ChartProps, ChartDatum } from "./chart.shared.js";
