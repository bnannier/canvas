import { createScatterPlot } from "./scatter-plot.shared.js";
import { webSkin } from "../shared/charts.styles.js";

// Web ScatterPlot (the base; Metro falls back to it on native, web bundlers resolve it).
// ScatterPlot is a "Shared" treatment, so iOS and Android render this same look.
/** Points on numeric x and y axes, with nice ticks and gridlines. */
export const ScatterPlot = createScatterPlot(webSkin);
export type { ScatterPlotProps, ScatterSeries, ScatterPoint, ScatterSelection } from "./scatter-plot.shared.js";
