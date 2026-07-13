import { createProgress } from "./progress.shared.js";
import { iosSkin } from "./progress.styles.js";
import { Spinner } from "../spinner/spinner.ios.js";

// iOS (HIG) Progress: the UIProgressView / SwiftUI ProgressView thin 4pt capsule bar with
// a neutral gray system-fill track. iOS has no linear indeterminate idiom (the iOS 27
// kit's unknown-duration control is the activity indicator), so the iOS entry threads the
// kit's iOS Spinner and `indeterminate` renders it instead of a sliding bar. Metro
// resolves this file on iOS; the docs import it for preview.
export const Progress = createProgress(iosSkin, { IndeterminateSpinner: Spinner });
export type { ProgressProps } from "./progress.shared.js";
