import { createComposedChart } from "./composed-chart.shared.js";
import { webSkin } from "../shared/charts.styles.js";

// ComposedChart is a "Shared" platform treatment: the implementation is
// platform-neutral, so every platform entry builds from the same skin. The
// per-OS files exist only so the architecture is uniform across the kit.
export const ComposedChart = createComposedChart(webSkin);
export type { ComposedChartProps, ComposedSeries } from "./composed-chart.shared.js";
