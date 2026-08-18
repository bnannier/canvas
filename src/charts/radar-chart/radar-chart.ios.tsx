import { createRadarChart } from "./radar-chart.shared.js";
import { iosSkin } from "../shared/charts.styles.js";

// RadarChart is a "Shared" platform treatment: the implementation is platform-
// neutral, so every platform entry builds from the same skin. The per-OS
// files exist only so the architecture is uniform across the kit.
export const RadarChart = createRadarChart(iosSkin);
export type { RadarChartProps } from "./radar-chart.shared.js";
