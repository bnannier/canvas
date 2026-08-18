import { createHistogram } from "./histogram.shared.js";
import { androidSkin } from "../shared/charts.styles.js";

// Histogram is a "Shared" platform treatment: the implementation is platform-
// neutral, so every platform entry builds from the same skin. The per-OS
// files exist only so the architecture is uniform across the kit.
export const Histogram = createHistogram(androidSkin);
export type { HistogramProps } from "./histogram.shared.js";
