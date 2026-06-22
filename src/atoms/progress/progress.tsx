import { createProgress } from "./progress.shared.js";
import { webSkin } from "./progress.styles.js";

// Web Progress (the base; Metro falls back to it on native, web bundlers resolve it).
// Keeps the established shadcn/Radix look: an 8px fully-rounded bar, bg-primary/20 track.
export const Progress = createProgress(webSkin);
export type { ProgressProps } from "./progress.shared.js";
