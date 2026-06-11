import { createDialog } from "./dialog.shared.js";
import { iosSkin } from "./dialog.styles.js";

// iOS (HIG alert) Dialog. Metro resolves this file on iOS; the docs import it for preview.
export const Dialog = createDialog(iosSkin);
export type { DialogProps } from "./dialog.shared.js";
