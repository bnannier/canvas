import { createScatterPlot } from "./scatter-plot.shared.js";
import { iosSkin } from "../shared/charts.styles.js";

// iOS ScatterPlot. Metro resolves this file on iOS; the docs import it for preview.
// ScatterPlot is a "Shared" treatment (data visualization is platform-neutral), so
// the iOS skin matches the web look exactly.
export const ScatterPlot = createScatterPlot(iosSkin);
export type { ScatterPlotProps, ScatterSeries, ScatterPoint, ScatterSelection } from "./scatter-plot.shared.js";
