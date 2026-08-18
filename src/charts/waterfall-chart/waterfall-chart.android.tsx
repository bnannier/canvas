import { createWaterfallChart } from "./waterfall-chart.shared.js";
import { androidSkin } from "../shared/charts.styles.js";

// WaterfallChart is a "Shared" platform treatment: the implementation is platform-
// neutral, so every platform entry builds from the same skin. The per-OS
// files exist only so the architecture is uniform across the kit.
export const WaterfallChart = createWaterfallChart(androidSkin);
export type { WaterfallChartProps, WaterfallStep } from "./waterfall-chart.shared.js";
