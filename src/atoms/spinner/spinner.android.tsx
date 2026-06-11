import { createSpinner } from "./spinner.shared.js";
import { androidSkin } from "./spinner.styles.js";

// Material 3 Spinner: the indeterminate CircularProgressIndicator, a single
// sweeping arc. Metro resolves this file on Android; the docs import it for preview.
export const Spinner = createSpinner(androidSkin);
export type { SpinnerProps } from "./spinner.shared.js";
