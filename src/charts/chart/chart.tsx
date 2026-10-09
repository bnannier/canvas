import { createChart } from "./chart.shared.js";
import { webSkin } from "../shared/charts.styles.js";

// Web Chart (the base; Metro falls back to it on native, web bundlers resolve it).
// Chart is a "Shared" treatment, so iOS and Android render this same look.
/**
 * A bar chart, vertical or horizontal, single or grouped series, with press or scrub to
 * inspect a category.
 */
export const Chart = createChart(webSkin);
export type { ChartProps, ChartDatum } from "./chart.shared.js";
