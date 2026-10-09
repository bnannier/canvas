import { createDialog } from "./dialog.shared.js";
import { webSkin } from "./dialog.styles.js";

// Web Dialog (the base; Metro falls back to it on native, web bundlers resolve it).
/** A modal dialog: a title, an optional description, a body and actions over a dimmed backdrop. */
export const Dialog = createDialog(webSkin);
export type { DialogProps } from "./dialog.shared.js";
