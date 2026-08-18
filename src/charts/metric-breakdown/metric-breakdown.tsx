import { createMetricBreakdown } from "./metric-breakdown.shared.js";
import { webSkin } from "../shared/charts.styles.js";

// MetricBreakdown is a "Shared" platform treatment: the implementation is
// platform-neutral, so every platform entry builds from the same skin. The
// per-OS files exist only so the architecture is uniform across the kit.
export const MetricBreakdown = createMetricBreakdown(webSkin);
export type { MetricBreakdownProps, MetricBreakdownChip, BreakdownRow } from "./metric-breakdown.shared.js";
