import { createSparkline } from "./sparkline.shared.js";
import { webSkin } from "./sparkline.styles.js";

// Web Sparkline (the base; Metro falls back to it on native, web bundlers resolve it).
export const Sparkline = createSparkline(webSkin);
export type { SparklineProps } from "./sparkline.shared.js";
