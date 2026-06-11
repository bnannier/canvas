import { createSpinner } from "./spinner.shared.js";
import { iosSkin } from "./spinner.styles.js";

// iOS (HIG) Spinner: the UIActivityIndicatorView ring of fading spokes. Metro
// resolves this file on iOS; the docs import it for preview.
export const Spinner = createSpinner(iosSkin);
export type { SpinnerProps } from "./spinner.shared.js";
