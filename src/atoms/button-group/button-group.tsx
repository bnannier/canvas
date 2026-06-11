import { createButtonGroup } from "./button-group.shared.js";
import { webSkin } from "./button-group.styles.js";

// Web ButtonGroup (the base; Metro falls back to it on native, web bundlers resolve it).
export const ButtonGroup = createButtonGroup(webSkin);
export type { ButtonGroupProps } from "./button-group.shared.js";
