import { createLineChart } from "./line-chart.shared.js";
import { webSkin } from "../shared/charts.styles.js";

// Web LineChart (the base; Metro falls back to it on native, web bundlers resolve it).
// LineChart is a "Shared" treatment, so iOS and Android render this same look.
export const LineChart = createLineChart(webSkin);
export type { LineChartProps } from "./line-chart.shared.js";
