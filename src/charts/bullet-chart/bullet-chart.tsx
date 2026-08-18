import { createBulletChart } from "./bullet-chart.shared.js";
import { webSkin } from "../shared/charts.styles.js";

// BulletChart is a "Shared" platform treatment: the implementation is
// platform-neutral, so every platform entry builds from the same skin. The
// per-OS files exist only so the architecture is uniform across the kit.
export const BulletChart = createBulletChart(webSkin);
export type { BulletChartProps, BulletDatum } from "./bullet-chart.shared.js";
