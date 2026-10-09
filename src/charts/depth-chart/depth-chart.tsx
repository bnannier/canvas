import { createDepthChart } from "./depth-chart.shared.js";
import { webSkin } from "../shared/charts.styles.js";

// Web DepthChart (the base; Metro falls back to it on native, web bundlers resolve it).
// DepthChart is a "Shared" treatment, so iOS and Android render this same look.
/** An order book: cumulative bid and ask step areas around the spread. */
export const DepthChart = createDepthChart(webSkin);
export type { DepthChartProps, DepthLevel } from "./depth-chart.shared.js";
