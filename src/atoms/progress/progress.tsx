import { createProgress } from "./progress.shared.js";
import { webSkin } from "./progress.styles.js";

// Web Progress (the base; Metro falls back to it on native, web bundlers resolve it).
// Dark Factory's meter: a 6px capsule (4 small, 8 large) on its line-colored track.
/** A determinate or indeterminate progress bar. */
export const Progress = createProgress(webSkin);
export type { ProgressProps } from "./progress.shared.js";
