import { createAlert } from "./alert.shared.js";
import { androidSkin } from "./alert.styles.js";

// Material 3 Alert. Metro resolves this file on Android; the docs import it for preview.
export const Alert = createAlert(androidSkin);
export type { AlertProps } from "./alert.shared.js";
