import { createCandlestickChart } from "./candlestick-chart.shared.js";
import { androidSkin } from "../shared/charts.styles.js";

// Material CandlestickChart. Metro resolves this file on Android; the docs import it for
// preview. Data visualization is platform-neutral, so this "Shared" treatment
// matches the web look exactly.
export const CandlestickChart = createCandlestickChart(androidSkin);
export type { CandlestickChartProps, Candle } from "./candlestick-chart.shared.js";
