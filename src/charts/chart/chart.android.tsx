import { createChart } from "./chart.shared.js";
import { androidSkin } from "../shared/charts.styles.js";

// Material Chart. Metro resolves this file on Android; the docs import it for
// preview. Data visualization is platform-neutral, so this "Shared" treatment
// matches the web look exactly.
export const Chart = createChart(androidSkin);
export type { ChartProps, ChartDatum } from "./chart.shared.js";
