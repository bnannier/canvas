import { createActionSheet } from "./action-sheet.shared.js";
import { webSkin } from "./action-sheet.styles.js";

// Web ActionSheet (the base; Metro falls back to it on native, web bundlers
// resolve it). The web look is the iOS action sheet (two separated rounded cards).
/** A modal sheet of contextual actions, with a cancel action set apart. */
export const ActionSheet = createActionSheet(webSkin);
export type { ActionSheetProps, ActionSheetAction } from "./action-sheet.shared.js";
