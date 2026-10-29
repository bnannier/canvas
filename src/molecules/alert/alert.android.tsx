import { createAlert } from "./alert.shared.js";
import { androidSkin } from "./alert.styles.js";
import { Button } from "../../atoms/button/button.android.js";

// Material 3 Alert. Metro resolves this file on Android; the docs import it for preview.
export const Alert = createAlert(androidSkin, { Button });
export type { AlertProps } from "./alert.shared.js";
