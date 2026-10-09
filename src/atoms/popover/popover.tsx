import { createPopover } from "./popover.shared.js";
import { webSkin } from "./popover.styles.js";

// Web Popover (the base; Metro falls back to it on native, web bundlers resolve it).
/** A floating panel of rich content, opened by a trigger. */
export const Popover = createPopover(webSkin);
export type { PopoverProps } from "./popover.shared.js";
