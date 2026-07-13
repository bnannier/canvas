import { createScatterPlot } from "./scatter-plot.shared.js";
import { androidSkin } from "../shared/charts.styles.js";

// Material ScatterPlot. Metro resolves this file on Android; the docs import it for
// preview. Data visualization is platform-neutral, so this "Shared" treatment
// matches the web look exactly.
export const ScatterPlot = createScatterPlot(androidSkin);
export type { ScatterPlotProps, ScatterSeries, ScatterPoint, ScatterSelection } from "./scatter-plot.shared.js";
