import { createAlertDialog } from "./alert-dialog.shared.js";
import { androidSkin } from "./alert-dialog.styles.js";

// Material 3 AlertDialog. Metro resolves this file on Android; the docs import it for preview.
export const AlertDialog = createAlertDialog(androidSkin);
export type { AlertDialogProps } from "./alert-dialog.shared.js";
