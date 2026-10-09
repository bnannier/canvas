import { createAlertDialog } from "./alert-dialog.shared.js";
import { webSkin } from "./alert-dialog.styles.js";

// Web AlertDialog (the base; Metro falls back to it on native, web bundlers resolve it).
/**
 * A blocking confirmation dialog: a title, a description and action buttons over a dimmed
 * backdrop.
 */
export const AlertDialog = createAlertDialog(webSkin);
export type { AlertDialogProps } from "./alert-dialog.shared.js";
