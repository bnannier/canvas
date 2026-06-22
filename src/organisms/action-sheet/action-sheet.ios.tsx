import { createActionSheet } from "./action-sheet.shared.js";
import { iosSkin } from "./action-sheet.styles.js";

// iOS (HIG action sheet) ActionSheet. Metro resolves this file on iOS; the docs
// import it for preview.
export const ActionSheet = createActionSheet(iosSkin);
export type { ActionSheetProps, ActionSheetAction } from "./action-sheet.shared.js";
