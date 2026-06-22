import { createAlert } from "./alert.shared.js";
import { iosSkin } from "./alert.styles.js";

// iOS (HIG/SF) Alert. Metro resolves this file on iOS; the docs import it for preview.
export const Alert = createAlert(iosSkin);
export type { AlertProps } from "./alert.shared.js";
