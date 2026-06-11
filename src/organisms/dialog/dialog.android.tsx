import { createDialog } from "./dialog.shared.js";
import { androidSkin } from "./dialog.styles.js";

// Material 3 (basic dialog) Dialog. Metro resolves this file on Android; the docs import it for preview.
export const Dialog = createDialog(androidSkin);
export type { DialogProps } from "./dialog.shared.js";
