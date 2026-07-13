import { createProgress } from "./progress.shared.js";
import { androidSkin } from "./progress.styles.js";

// Material 3 Progress: the linear progress indicator, a 4dp fully-rounded bar with a
// container-toned track, a 4dp gap between the active indicator and the track, and the
// 4x4dp stop indicator dot at the trailing edge (determinate only). Metro resolves this
// file on Android; the docs import it for preview.
export const Progress = createProgress(androidSkin);
export type { ProgressProps } from "./progress.shared.js";
