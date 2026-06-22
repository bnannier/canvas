import { createProgress } from "./progress.shared.js";
import { iosSkin } from "./progress.styles.js";

// iOS (HIG) Progress: the UIProgressView / SwiftUI ProgressView thin 4pt capsule bar with
// a faint primary-wash track. Metro resolves this file on iOS; the docs import it for preview.
export const Progress = createProgress(iosSkin);
export type { ProgressProps } from "./progress.shared.js";
