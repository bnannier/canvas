import { createSpinner } from "./spinner.shared.js";
import { webSkin } from "./spinner.styles.js";

// Web Spinner (the base; Metro falls back to it on native, web bundlers resolve
// it). Keeps the original ActivityIndicator look verbatim.
export const Spinner = createSpinner(webSkin);
export type { SpinnerProps } from "./spinner.shared.js";
