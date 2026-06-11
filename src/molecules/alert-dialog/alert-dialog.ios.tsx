import { createAlertDialog } from "./alert-dialog.shared.js";
import { iosSkin } from "./alert-dialog.styles.js";

// iOS (HIG UIAlertController) AlertDialog. Metro resolves this file on iOS; the docs import it for preview.
export const AlertDialog = createAlertDialog(iosSkin);
export type { AlertDialogProps } from "./alert-dialog.shared.js";
