import { createSparkline } from "./sparkline.shared.js";
import { webSkin } from "./sparkline.styles.js";

// Web Sparkline (the base; Metro falls back to it on native, web bundlers resolve it).
/** A compact trend strip of thin bars, the latest in the full accent. */
export const Sparkline = createSparkline(webSkin);
export type { SparklineProps } from "./sparkline.shared.js";
