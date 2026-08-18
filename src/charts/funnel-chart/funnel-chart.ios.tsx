import { createFunnelChart } from "./funnel-chart.shared.js";
import { iosSkin } from "../shared/charts.styles.js";

// FunnelChart is a "Shared" platform treatment: the implementation is platform-
// neutral, so every platform entry builds from the same skin. The per-OS
// files exist only so the architecture is uniform across the kit.
export const FunnelChart = createFunnelChart(iosSkin);
export type { FunnelChartProps } from "./funnel-chart.shared.js";
