import { createBoxPlot } from "./box-plot.shared.js";
import { iosSkin } from "../shared/charts.styles.js";

// BoxPlot is a "Shared" platform treatment: the implementation is platform-
// neutral, so every platform entry builds from the same skin. The per-OS
// files exist only so the architecture is uniform across the kit.
export const BoxPlot = createBoxPlot(iosSkin);
export type { BoxPlotProps, BoxSample } from "./box-plot.shared.js";
