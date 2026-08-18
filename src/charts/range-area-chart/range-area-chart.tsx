import { createRangeAreaChart } from "./range-area-chart.shared.js";
import { webSkin } from "../shared/charts.styles.js";

// RangeAreaChart is a "Shared" platform treatment: the implementation is
// platform-neutral, so every platform entry builds from the same skin. The
// per-OS files exist only so the architecture is uniform across the kit.
export const RangeAreaChart = createRangeAreaChart(webSkin);
export type { RangeAreaChartProps, RangePoint } from "./range-area-chart.shared.js";
