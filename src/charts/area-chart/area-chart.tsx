import { createAreaChart } from "./area-chart.shared.js";
import { webSkin } from "../shared/charts.styles.js";

// Web AreaChart (the base; Metro falls back to it on native, web bundlers resolve it).
// AreaChart is a "Shared" treatment, so iOS and Android render this same look.
export const AreaChart = createAreaChart(webSkin);
export type { AreaChartProps } from "./area-chart.shared.js";
