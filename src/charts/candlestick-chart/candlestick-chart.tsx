import { createCandlestickChart } from "./candlestick-chart.shared.js";
import { webSkin } from "../shared/charts.styles.js";

// Web CandlestickChart (the base; Metro falls back to it on native, web bundlers resolve it).
// CandlestickChart is a "Shared" treatment, so iOS and Android render this same look.
export const CandlestickChart = createCandlestickChart(webSkin);
export type { CandlestickChartProps, Candle } from "./candlestick-chart.shared.js";
