import { createSparkline } from "./sparkline.shared.js";
import { androidSkin } from "./sparkline.styles.js";

// Material 3 Sparkline. Metro resolves this file on Android.
export const Sparkline = createSparkline(androidSkin);
export type { SparklineProps } from "./sparkline.shared.js";
