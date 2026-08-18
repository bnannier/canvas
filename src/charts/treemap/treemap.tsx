import { createTreemap } from "./treemap.shared.js";
import { webSkin } from "../shared/charts.styles.js";

// Treemap is a "Shared" platform treatment: the implementation is platform-
// neutral, so every platform entry builds from the same skin. The per-OS
// files exist only so the architecture is uniform across the kit.
export const Treemap = createTreemap(webSkin);
export type { TreemapProps, TreemapDatum } from "./treemap.shared.js";
