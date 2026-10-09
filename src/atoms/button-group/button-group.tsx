import { createButtonGroup } from "./button-group.shared.js";
import { webSkin } from "./button-group.styles.js";

// Web ButtonGroup (the base; Metro falls back to it on native, web bundlers resolve it).
/** A row of related buttons: a segmented control, a split button, or an attached group. */
export const ButtonGroup = createButtonGroup(webSkin);
export type { ButtonGroupProps, ButtonGroupItem } from "./button-group.shared.js";
