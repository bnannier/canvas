import { createSparkline } from "./sparkline.shared.js";
import { iosSkin } from "./sparkline.styles.js";

// iOS (HIG) Sparkline. Metro resolves this file on iOS.
export const Sparkline = createSparkline(iosSkin);
export type { SparklineProps } from "./sparkline.shared.js";
