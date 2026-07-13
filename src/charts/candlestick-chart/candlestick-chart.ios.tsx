import { createCandlestickChart } from "./candlestick-chart.shared.js";
import { iosSkin } from "../shared/charts.styles.js";

// iOS CandlestickChart. Metro resolves this file on iOS; the docs import it for preview.
// CandlestickChart is a "Shared" treatment (data visualization is platform-neutral), so
// the iOS skin matches the web look exactly.
export const CandlestickChart = createCandlestickChart(iosSkin);
export type { CandlestickChartProps, Candle } from "./candlestick-chart.shared.js";
