import { createPopover } from "./popover.shared.js";
import { webSkin } from "./popover.styles.js";

// Web Popover (the base; Metro falls back to it on native, web bundlers resolve it).
export const Popover = createPopover(webSkin);
export type { PopoverProps } from "./popover.shared.js";
